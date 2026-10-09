import '../pages-app/beta-safety';
import React from 'react';import {createRoot} from 'react-dom/client';
import V2Workspace from '../pages-app/V2Workspace';import '../app/globals.css';
const heroes=[{id:'11111111-1111-4111-8111-111111111111',name:'Ike',title:'Vanguard Legend',category:'Legendary',color:'Red',portrait:null,pool:'L/M/E Pool',schedule:'General',month:'2026-12',notes:'Keep',revision:1,weapon_type:'Sword',move_type:'Infantry',debut_version:'10.0'},{id:'22222222-2222-4222-8222-222222222222',name:'Lyn',title:'Lady of the Wind',category:'Legendary',color:'Green',portrait:null,pool:'L/M/E Pool',schedule:'General',month:'2026-12',notes:'Keep',revision:1,weapon_type:'Bow',move_type:'Cavalry',debut_version:'9.0'}];
createRoot(document.getElementById('root')!).render(<V2Workspace section={new URLSearchParams(location.search).get('section')||'bulk'} heroes={heroes} onView={()=>{}} onRefresh={async()=>{}}/>);
