const MAX_BYTES=3145728;
// Legacy helper name retained for callers; delivery optimization never enlarges artwork.
export async function upscalePortrait(file:File,maxDimension=1024):Promise<{file:File;width:number;height:number;upscaled:boolean}>{
 const url=URL.createObjectURL(file);
 try{
  const image=new Image();image.decoding='async';
  await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('Could not read this portrait.'));image.src=url;});
  const width=image.naturalWidth,height=image.naturalHeight,longest=Math.max(width,height);
  if(!width||!height)throw new Error('Invalid portrait dimensions.');
  const scale=Math.min(1,maxDimension/longest),w=Math.max(1,Math.round(width*scale)),h=Math.max(1,Math.round(height*scale));
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const context=canvas.getContext('2d',{alpha:true});if(!context)return {file,width,height,upscaled:false};
  context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';context.drawImage(image,0,0,w,h);
  const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',.92));
  canvas.width=0;canvas.height=0;
  if(blob&&blob.type==='image/webp'&&blob.size<=MAX_BYTES){
   if(scale===1&&file.size<=blob.size)return {file,width,height,upscaled:false};
   return {file:new File([blob],file.name.replace(/\.[^.]+$/,'')+'-optimized.webp',{type:'image/webp'}),width:w,height:h,upscaled:false};
  }
  return {file,width,height,upscaled:false};
 }finally{URL.revokeObjectURL(url);}
}
