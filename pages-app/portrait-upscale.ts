const MAX_BYTES=3145728;
export async function upscalePortrait(file:File):Promise<{file:File;width:number;height:number;upscaled:boolean}>{
 const url=URL.createObjectURL(file);
 try{
  const image=new Image();image.decoding='async';
  await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('Could not read this portrait.'));image.src=url;});
  const width=image.naturalWidth,height=image.naturalHeight,longest=Math.max(width,height);
  if(!width||!height)throw new Error('Invalid portrait dimensions.');
  if(longest>=1024)return {file,width,height,upscaled:false};
  // Conventional interpolation only: preserve composition, color and alpha; no generative detail.
  for(const target of [1024,768,512]){
   if(target<=longest)continue;
   const scale=target/longest,w=Math.max(1,Math.round(width*scale)),h=Math.max(1,Math.round(height*scale));
   const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
   const context=canvas.getContext('2d',{alpha:true});if(!context)break;
   context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';context.drawImage(image,0,0,w,h);
   const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/png'));
   canvas.width=0;canvas.height=0;
   if(blob&&blob.size<=MAX_BYTES)return {file:new File([blob],file.name.replace(/\.[^.]+$/,'')+'-hd.png',{type:'image/png'}),width:w,height:h,upscaled:true};
  }
  return {file,width,height,upscaled:false};
 }finally{URL.revokeObjectURL(url);}
}
