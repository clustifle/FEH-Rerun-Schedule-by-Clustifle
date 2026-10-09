import config from './poll-config.json';
import {supabase} from './static-data';
import {goTo,settingsUrl} from './routes';
export type PollUser={github_id:string;login:string;role:'owner'|'manager'|'voter';can_vote?:boolean;website_account?:boolean};
export type Poll={id:string;question:string;description:string;status:'draft'|'open'|'closed'|'archived';featured:number;allow_change:number;results_mode:'public'|'after_vote'|'closed';closes_at:string|null;created_at:string;revision:number;total:number|null;choices?:{id:string;label:string;votes?:number}[];my_choice?:string|null;can_vote?:boolean};
export const pollApiUrl=config.url.replace(/\/$/,'');
const tokenKey='feh-poll-session';
export function acceptPollSession(){const params=new URLSearchParams(location.hash.slice(1)),token=params.get('poll_session');if(token){const nonce=params.get('poll_nonce');history.replaceState(null,'',location.pathname+location.search);if(/^[a-f0-9]{64}$/.test(token)&&nonce&&nonce===sessionStorage.getItem('feh-poll-login-nonce')){sessionStorage.removeItem('feh-poll-login-nonce');sessionStorage.setItem(tokenKey,token);window.dispatchEvent(new Event('poll-session-change'));}}}
acceptPollSession();
export async function pollApi<T>(path:string,body?:unknown,method=body?'POST':'GET'):Promise<T>{if(!pollApiUrl)throw new Error('Community polls are being set up. Please check back soon.');const {data:{session}}=await supabase.auth.getSession();const token=session?.access_token,response=await fetch(pollApiUrl+path,{method,credentials:'omit',referrerPolicy:'no-referrer',headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)});const data=await response.json();if(!response.ok){if(response.status===401)sessionStorage.removeItem(tokenKey);throw new Error(data.error||'Could not load polls. Please try again.');}return data as T;}
export function pollSignIn(_manage=false){void supabase.auth.getSession().then(({data:{session}})=>{if(session)goTo(settingsUrl('Account'));else window.dispatchEvent(new Event('open-owner-login'));});}
export async function pollSignOut(){await supabase.auth.signOut();window.dispatchEvent(new Event('owner-session-change'));}
