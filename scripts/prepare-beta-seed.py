"""Read public hero records once; never overwrite an existing beta test record."""
import json, urllib.request
from pathlib import Path
root=Path(__file__).resolve().parents[1]
req=urllib.request.Request('https://aknsqeqykjgdyhdroqcx.supabase.co/rest/v1/heroes?select=*',headers={'apikey':'sb_publishable_PiJIst1aSJtrYBiIvwDIVA_KS3c-E3g'})
with urllib.request.urlopen(req,timeout=30) as response: rows=json.load(response)
quote=lambda s:"'"+s.replace("'","''")+"'"
sql=[f"INSERT OR IGNORE INTO beta_versions(version,sort_order) VALUES('{major}.0',{major*100});" for major in range(1,11)]
for row in rows:
 row.update(debut_version=None,release_date=None,release_event=None)
 sql.append('INSERT OR IGNORE INTO beta_heroes(id,record) VALUES('+quote(row['id'])+','+quote(json.dumps(row,ensure_ascii=False))+');')
(root/'beta-service'/'seed.sql').write_text('\n'.join(sql),encoding='utf-8')
print('Prepared isolated beta copies of',len(rows),'public hero records.')
