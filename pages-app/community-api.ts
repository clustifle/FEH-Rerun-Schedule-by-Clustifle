import {supabase} from './static-data';
import {pollApiUrl} from './poll-api';
export const discussionUrl='https://github.com/clustifle/FEH-Rerun-Schedule-by-Clustifle/discussions';
export type CommunityUser={github_id:string;website_id:string;login:string;username?:string|null;role:'owner'|'manager'|'moderator'|'voter';can_vote:boolean};
export type CommunitySession={user:CommunityUser|null;connected:boolean;publicReady:boolean};
export type Category={id:string;name:string;slug?:string;isAnswerable:boolean};
export type PageInfo={endCursor?:string;hasNextPage:boolean};
export type Comment={upvoteCount?:number;viewerHasUpvoted?:boolean;viewerCanUpvote?:boolean;forumHidden?:boolean;id:string;body:string;url:string;createdAt:string;isAnswer:boolean;viewerCanUpdate?:boolean;viewerCanDelete?:boolean;author:{login:string;avatarUrl:string;websiteProfileId?:string|null;websiteUsername?:string|null}|null;replies?:{nodes:Comment[];totalCount:number;pageInfo?:PageInfo}};
export type Post={forumHidden?:boolean;flair?:string|null;id:string;number:number;title:string;body:string;url:string;createdAt:string;updatedAt:string;closed:boolean;locked:boolean;upvoteCount:number;viewerHasUpvoted:boolean;viewerCanUpdate:boolean;viewerCanDelete?:boolean;author:{login:string;avatarUrl:string;websiteProfileId?:string|null;websiteUsername?:string|null}|null;category:Category;commentCount:{totalCount:number};comments?:{nodes:Comment[];totalCount:number;pageInfo:PageInfo}};
export class CommunityApiError extends Error{constructor(message:string,public status:number,public data:unknown){super(message);}}
const expiredConnections=new Set<string>();
const automaticConnections=new Map<string,{token:string;request:Promise<boolean>}>();
async function restoreCommunityConnection(accountId:string,token:string,accessToken:string){
 const existing=automaticConnections.get(accountId);if(existing?.token===token)return existing.request;
 const request=(async()=>{try{const r=await fetch(pollApiUrl+'/community/connect',{method:'POST',credentials:'omit',referrerPolicy:'no-referrer',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({token,publicReads:false}),signal:AbortSignal.timeout(25000)});if(!r.ok)return false;expiredConnections.delete(accountId);window.dispatchEvent(new CustomEvent('community-authorization-change',{detail:{accountId}}));return true;}catch{return false;}})();
 automaticConnections.set(accountId,{token,request});return request;
}
export function communityNeedsReconnect(accountId?:string){return !!accountId&&expiredConnections.has(accountId);}
export function isGitHubAuthorizationError(status:number,message:string){return status===401&&/GitHub authorization expired|Enable community posting/i.test(message);}
export async function communityApi<T>(path:string,body?:unknown,method=body?'POST':'GET',accountId?:string):Promise<T>{
 const {data:{session}}=await supabase.auth.getSession();
 if(accountId&&session?.user.id!==accountId)throw new Error('Sign in to the same account to sync this draft.');
 const r=await fetch(pollApiUrl+'/community'+path,{method,credentials:'omit',referrerPolicy:'no-referrer',headers:{...(session?{Authorization:'Bearer '+session.access_token}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(25000)});
 const data=await r.json();
 if(!r.ok){
  if(session&&isGitHubAuthorizationError(r.status,String(data.error||''))){
   if(path!=='/connect'&&session.provider_token&&await restoreCommunityConnection(session.user.id,session.provider_token,session.access_token)){
    if(method==='GET'){
     const retry=await fetch(pollApiUrl+'/community'+path,{credentials:'omit',referrerPolicy:'no-referrer',headers:{Authorization:'Bearer '+session.access_token},signal:AbortSignal.timeout(25000)});
     if(retry.ok)return await retry.json();
    }else throw new CommunityApiError('GitHub posting access was restored. Please try your action again.',409,data);
   }
   expiredConnections.add(session.user.id);
   window.dispatchEvent(new CustomEvent('community-authorization-change',{detail:{accountId:session.user.id}}));
   // Only retry public reads. Never replay a post, reply, vote, or draft write.
   if(method==='GET'&&/^\/(?:categories(?:\?|$)|posts(?:[/?]|$))/.test(path)){
    const publicResponse=await fetch(pollApiUrl+'/community'+path,{credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(25000)});
    if(publicResponse.ok)return await publicResponse.json();
   }
   throw new CommunityApiError('Reconnect GitHub to restore posting access.',r.status,data);
  }
  throw new CommunityApiError(data.error||'Could not load Community. Please try again.',r.status,data);
 }
 if(path==='/connect'&&session){expiredConnections.delete(session.user.id);window.dispatchEvent(new CustomEvent('community-authorization-change',{detail:{accountId:session.user.id}}));}
 return data;
}
export async function uploadCommunityImage(file:File,kind:'community'|'hero'='community'){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10485760)throw Error('Choose a PNG, JPEG, or WebP picture under 10 MB.');
 const bitmap=await createImageBitmap(file);try{
  const canvas=document.createElement('canvas'),scale=Math.min(1,(kind==='hero'?256:1600)/Math.max(bitmap.width,bitmap.height));canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height);
  let blob=await new Promise<Blob|null>(r=>canvas.toBlob(r,'image/webp',kind==='hero'?.92:.8));if(!blob)throw Error('This browser could not optimize the picture. Insert an image URL instead.');
  if(blob.size>524288)blob=await new Promise<Blob|null>(r=>canvas.toBlob(r,'image/webp',.5));if(!blob||blob.size>524288)throw Error('This picture is too large after optimization. Choose a smaller picture.');
  const {data:{session}}=await supabase.auth.getSession();if(!session)throw Error('Sign in before uploading a picture.');
  const r=await fetch(pollApiUrl+(kind==='hero'?'/community/hero-images':'/community/images'),{method:'POST',headers:{Authorization:'Bearer '+session.access_token,'Content-Type':blob.type},body:blob,signal:AbortSignal.timeout(25000)}),data=await r.json();if(!r.ok)throw Error(data.error||'Could not upload the picture.');return String(data.url);
 }finally{bitmap.close();}
}

export async function importHeroPortrait(url:string){const {data:{session}}=await supabase.auth.getSession();if(!session)throw Error('Sign in to import a portrait.');const r=await fetch(pollApiUrl+'/community/hero-image-import',{method:'POST',headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify({url}),signal:AbortSignal.timeout(25000)});if(!r.ok){const data=await r.json();throw Error(data.error||'Could not import the image.');}const blob=await r.blob();return new File([blob],'imported-portrait',{type:blob.type});}

export async function uploadCommunityVideo(file:File){if(!['video/mp4','video/webm'].includes(file.type)||file.size>10485760)throw Error('Choose an MP4 or WebM video under 10 MB.');const {data:{session}}=await supabase.auth.getSession();if(!session)throw Error('Sign in before uploading a video.');const response=await fetch(pollApiUrl+'/community/videos',{method:'POST',headers:{Authorization:'Bearer '+session.access_token,'Content-Type':file.type},body:file,signal:AbortSignal.timeout(60000)}),data=await response.json();if(!response.ok)throw Error(data.error||'Could not upload the video.');return String(data.url);}
