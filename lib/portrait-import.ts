const MAX_BYTES = 3 * 1024 * 1024;
export class PortraitImportError extends Error {}
function validateUrl(value: string): URL {
 let url: URL;
 try { url = new URL(value); } catch { throw new PortraitImportError('Paste a complete HTTPS image link.'); }
 const host = url.hostname.toLowerCase();
 const allowed = host === 'wikia.nocookie.net' || host.endsWith('.wikia.nocookie.net') || host === 'cdn.wikimg.net' || host === 'upload.wikimedia.org';
 if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443') || !allowed) throw new PortraitImportError('Use an HTTPS image link from the FEH Wiki, Fandom/Wikia image CDN, or Wikimedia.');
 return url;
}
export async function importPortrait(value: string): Promise<{bytes:Uint8Array;contentType:string}> {
 if (!value || value.length > 4096) throw new PortraitImportError('Paste a complete image link.');
 let url = validateUrl(value.trim());
 const signal = AbortSignal.timeout(15000);
 for (let hop=0; hop<4; hop++) {
  const response = await fetch(url.href,{redirect:'manual',signal,headers:{Accept:'image/webp,image/png,image/jpeg'}});
  if ([301,302,303,307,308].includes(response.status)) {
   const location = response.headers.get('location'); await response.body?.cancel();
   if (!location) throw new PortraitImportError('This image link has an invalid redirect.');
   url = validateUrl(new URL(location,url).href); continue;
  }
  if (!response.ok) { await response.body?.cancel(); throw new PortraitImportError('The image host could not provide this portrait. Check the direct image link, or upload the file instead.'); }
  if (Number(response.headers.get('content-length')||0)>MAX_BYTES) { await response.body?.cancel(); throw new PortraitImportError('Choose a portrait under 3 MB.'); }
  const reader = response.body?.getReader(); if (!reader) throw new PortraitImportError('The image link returned no portrait.');
  const chunks:Uint8Array[]=[];let size=0;
  try { while(true){const {done,value:chunk}=await reader.read();if(done)break;size+=chunk.byteLength;if(size>MAX_BYTES){await reader.cancel();throw new PortraitImportError('Choose a portrait under 3 MB.');}chunks.push(chunk);} } finally {reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  const png=bytes.length>=8&&bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71&&bytes[4]===13&&bytes[5]===10&&bytes[6]===26&&bytes[7]===10;
  const jpg=bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  const webp=bytes.length>=12&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
  if (!png&&!jpg&&!webp) throw new PortraitImportError('This link does not contain a PNG, JPG, or WebP image. Use the image URL rather than the wiki page URL.');
  return {bytes,contentType:png?'image/png':jpg?'image/jpeg':'image/webp'};
 }
 throw new PortraitImportError('This image link redirects too many times. Try the final image URL.');
}
