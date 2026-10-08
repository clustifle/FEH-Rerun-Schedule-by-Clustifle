"""Mirror public hero portraits for delivery; never change Supabase originals."""
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import re
from urllib.parse import quote
from urllib.request import Request, urlopen
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parent.parent
CONFIG=(ROOT/"pages-app/static-data.ts").read_text(encoding="utf-8")
URL=re.search(r"export const supabaseUrl='([^']+)'",CONFIG).group(1)
KEY=re.search(r"export const supabasePublishableKey='([^']+)'",CONFIG).group(1)
MANIFEST=ROOT/"pages-app/portrait-manifest.json"
OUTPUT=ROOT/"public/hero-portraits"
OUTPUT.mkdir(parents=True,exist_ok=True)
existing=json.loads(MANIFEST.read_text(encoding="utf-8"))

def read(url,headers=None):
    with urlopen(Request(url,headers=headers or {}),timeout=30) as response:
        data=response.read(8*1024*1024+1)
        if len(data)>8*1024*1024:
            raise ValueError("Portrait response too large")
        return data

def render(path):
    cached=existing.get(path)
    if cached and all((ROOT/"public"/value).is_file() for value in cached.values()):
        return path,cached,0
    try:
        original=read(URL+"/storage/v1/object/public/portraits/"+quote(path,safe="/"))
        with Image.open(BytesIO(original)) as source:
            if source.width*source.height>16_000_000:
                raise ValueError("Portrait dimensions too large")
            image=ImageOps.exif_transpose(source).convert("RGBA")
            stem=sha256(path.encode()).hexdigest()[:24]
            result={}
            for label,size in (("thumb",256),("detail",768)):
                resized=image.copy()
                resized.thumbnail((size,size),Image.Resampling.LANCZOS)
                encoded=BytesIO()
                resized.save(encoded,format="WEBP",quality=92,method=6,exact=True)
                data=encoded.getvalue()
                if source.format=="WEBP" and resized.size==image.size and len(original)<len(data):
                    data=original
                filename=stem+"-"+str(size)+".webp"
                (OUTPUT/filename).write_bytes(data)
                result[label]="hero-portraits/"+filename
            return path,result,len(original)
    except Exception as error:
        print("Portrait copy unavailable; live Storage fallback retained:",path,str(error))
        return path,None,0

def main():
    paths=set()
    offset=0
    try:
        while True:
            rows=json.loads(read(URL+"/rest/v1/heroes?select=portrait&order=id&limit=1000&offset="+str(offset),headers={"apikey":KEY}))
            for row in rows:
                path=row.get("portrait")
                if path and not path.startswith("data/") and re.fullmatch(r"[a-zA-Z0-9_/-]+\.(?:png|jpg|jpeg|webp)",path) and ".." not in path:
                    paths.add(path)
            if len(rows)<1000:
                break
            offset+=1000
    except Exception as error:
        print("Could not refresh portrait catalog; bundled copies retained:",str(error))
        return
    manifest=dict(existing)
    downloaded=0
    with ThreadPoolExecutor(max_workers=4) as workers:
        for path,result,size in workers.map(render,sorted(paths)):
            if result:
                manifest[path]=result
            else:
                manifest.pop(path,None)
            downloaded+=size
    MANIFEST.write_text(json.dumps(manifest,sort_keys=True,indent=2)+"\n",encoding="utf-8")
    delivered=sum((ROOT/"public"/p).stat().st_size for row in manifest.values() for p in row.values())
    print(f"Portraits mirrored: {len(manifest)}; downloaded this run: {downloaded:,} bytes; both delivery sizes: {delivered:,} bytes")

if __name__=="__main__":
    main()
