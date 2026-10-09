import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import ProfileHeroPicker from '../pages-app/ProfileHeroPicker';
import '../app/globals.css';
function Test(){const [open,setOpen]=useState(true),[result,setResult]=useState('');return open?<ProfileHeroPicker title="Choose a Hero" heroes={['Ike','Lyn','Marth'].map((name,i)=>({id:name,name,title:'Hero',color:i===1?'Green':'Red',portrait:null,schedule:'Waitlist',month:null}))} used={['Marth']} onPick={()=>{}} onPickMany={async ids=>{const r=await fetch('/test-add',{method:'POST',body:JSON.stringify(ids)});if(!r.ok)throw Error('Please retry');setResult(ids.join(', '));}} onClose={()=>setOpen(false)}/>:<p>{result||'Closed'}</p>;}
createRoot(document.getElementById('root')!).render(<Test/>);
