import {supabase} from './static-data';
import {pollApiUrl} from './poll-api';
export const discussionUrl='https://github.com/clustifle/FEH-Rerun-Schedule-by-Clustifle/discussions';
export type CommunityUser={github_id:string;website_id:string;login:string;role:'owner'|'manager'|'voter';can_vote:boolean};
export type CommunitySession={user:CommunityUser|null;connected:boolean;publicReady:boolean};
export type Category={id:string;name:string;slug?:string;isAnswerable:boolean};
export type PageInfo={endCursor?:string;hasNextPage:boolean};
export type Comment={id:string;body:string;url:string;createdAt:string;isAnswer:boolean;viewerCanUpdate?:boolean;viewerCanDelete?:boolean;author:{login:string;avatarUrl:string}|null;replies?:{nodes:Comment[];totalCount:number;pageInfo?:PageInfo}};
export type Post={flair?:string|null;id:string;number:number;title:string;body:string;url:string;createdAt:string;updatedAt:string;closed:boolean;locked:boolean;upvoteCount:number;viewerHasUpvoted:boolean;viewerCanUpdate:boolean;viewerCanDelete?:boolean;author:{login:string;avatarUrl:string}|null;category:Category;commentCount:{totalCount:number};comments?:{nodes:Comment[];totalCount:number;pageInfo:PageInfo}};
export async function communityApi<T>(path:string,body?:unknown,method=body?'POST':'GET'):Promise<T>{
 const {data:{session}}=await supabase.auth.getSession();
 const r=await fetch(pollApiUrl+'/community'+path,{method,credentials:'omit',referrerPolicy:'no-referrer',headers:{...(session?{Authorization:'Bearer '+session.access_token}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(25000)});
 const data=await r.json();if(!r.ok)throw new Error(data.error||'Could not load Community. Please try again.');return data;
}
export async function uploadCommunityImage(file:File){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10485760)throw Error('Choose a PNG, JPEG, or WebP picture under 10 MB.');
 const bitmap=await createImageBitmap(file);try{
  const canvas=document.createElement('canvas'),scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height);
  let blob=await new Promise<Blob|null>(r=>canvas.toBlob(r,'image/webp',.8));if(!blob)throw Error('This browser could not optimize the picture. Insert an image URL instead.');
  if(blob.size>524288)blob=await new Promise<Blob|null>(r=>canvas.toBlob(r,'image/webp',.5));if(!blob||blob.size>524288)throw Error('This picture is too large after optimization. Choose a smaller picture.');
  const {data:{session}}=await supabase.auth.getSession();if(!session)throw Error('Sign in before uploading a picture.');
  const r=await fetch(pollApiUrl+'/community/images',{method:'POST',headers:{Authorization:'Bearer '+session.access_token,'Content-Type':blob.type},body:blob,signal:AbortSignal.timeout(25000)}),data=await r.json();if(!r.ok)throw Error(data.error||'Could not upload the picture.');return String(data.url);
 }finally{bitmap.close();}
}
