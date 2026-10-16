// Wiki downloads and Windows files can have a different MIME label from their bytes.
export async function normalizePortraitFile(file:File):Promise<File>{
 if(!file.size||file.size>3145728)throw Error('Choose a PNG, JPG, or WebP portrait under 3 MB.');
 const b=new Uint8Array(await file.slice(0,12).arrayBuffer());
 const type=b.length>=8&&[137,80,78,71,13,10,26,10].every((n,i)=>b[i]===n)?'image/png':b.length>=3&&b[0]===255&&b[1]===216&&b[2]===255?'image/jpeg':b.length>=12&&String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP'?'image/webp':null;
 if(!type)throw Error('This file is not a PNG, JPG, or WebP image. Download the original image and try again.');
 if(file.type===type)return file;
 return new File([file],file.name.replace(/\.[^.]+$/,'')+'.'+(type==='image/png'?'png':type==='image/jpeg'?'jpg':'webp'),{type,lastModified:file.lastModified});
}
