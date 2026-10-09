import React from 'react';import {createRoot} from 'react-dom/client';
import HeroProfilePage from '../pages-app/HeroProfilePage';import '../app/globals.css';import '../app/mobile.css';
import {BetaNavigation} from '../pages-app/V2Workspace';
document.documentElement.dataset.theme='fire-emblem-heroes';
const hero={id:'11111111-1111-4111-8111-111111111111',name:'Marth',title:'Timeless Warmth',category:'Harmonized',color:'Red',portrait:null,pool:'Seasonal Limited',blessing:null,demote:false,schedule:'Waitlist',month:null,notes:'Detailed hero notes.\n'.repeat(100),updated:'2026-10-09'};
createRoot(document.getElementById('root')!).render(<div className="tracker"><header className="masthead">FEH Rerun Schedule</header><BetaNavigation/><HeroProfilePage hero={hero} heroes={[hero]} loading={false} error="" tags={<><span className="hero-kind">Harmonized</span><span className="badge">Seasonal Limited</span></>} onBack={()=>{}} busy={false}/></div>);
