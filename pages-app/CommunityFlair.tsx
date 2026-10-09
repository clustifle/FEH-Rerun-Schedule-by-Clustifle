import flairs from '../lib/community-flairs.json';
export {flairs};
export default function CommunityFlair({id}:{id?:string|null}){const flair=flairs.find(f=>f.id===id);if(!flair)return null;return <span className={'community-flair flair-'+flair.id} style={{backgroundColor:flair.color,color:'#17212b',borderColor:flair.color}}>{flair.name}</span>;}
