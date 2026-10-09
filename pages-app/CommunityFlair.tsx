import {CircleHelp,MessagesSquare,Newspaper,ChartNoAxesCombined,MessageCircle,UserRound,Smile,BookOpen,Swords,Castle,Sparkles} from 'lucide-react';
import flairs from '../lib/community-flairs.json';
export {flairs};
const icons={question:CircleHelp,discussion:MessagesSquare,news:Newspaper,analysis:ChartNoAxesCombined,chat:MessageCircle,unit:UserRound,humor:Smile,resource:BookOpen,gameplay:Swords,aether:Castle,idea:Sparkles};
export default function CommunityFlair({id}:{id?:string|null}){const flair=flairs.find(f=>f.id===id);if(!flair)return null;const Icon=icons[flair.icon as keyof typeof icons];return <span className={'community-flair flair-'+flair.id}><Icon size={14} aria-hidden="true"/>{flair.name}</span>;}
