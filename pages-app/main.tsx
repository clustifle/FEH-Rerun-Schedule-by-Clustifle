import './beta-safety';
import {applyResourceBudget} from './resource-budget';
import './resource-budget.css';
import BetaSession from './BetaSession';
import {isBeta} from './beta';
import GitHubAuthReturn from './GitHubAuthReturn';
import InstallApp from './InstallApp';
import AccountSetup from './AccountSetup';
import PageOverlayScrollbar from './PageOverlayScrollbar';
import ScrollbarActivity from './ScrollbarActivity';
import {restorePagesRoute} from './routes';
import QualityControls from './QualityControls';
import PortraitRecovery from './PortraitRecovery';
import ToolBoundary from './ToolBoundary';
import './Quality.css';
import React from 'react';import {createRoot} from 'react-dom/client';import Tracker from './Tracker';import OwnerLogin from './OwnerLogin';import '../app/globals.css';
import '../app/mobile.css';
applyResourceBudget();
restorePagesRoute();
createRoot(document.getElementById('root')!).render(<React.StrictMode><QualityControls/><PortraitRecovery/><BetaSession/><ScrollbarActivity/><PageOverlayScrollbar/><ToolBoundary><Tracker/></ToolBoundary><GitHubAuthReturn/>{!isBeta&&<InstallApp/>}<OwnerLogin/><AccountSetup/></React.StrictMode>);

if(!isBeta&&import.meta.env.PROD&&'serviceWorker' in navigator){window.addEventListener('load',()=>{void navigator.serviceWorker.register(import.meta.env.BASE_URL+'sw.js',{scope:import.meta.env.BASE_URL,updateViaCache:'none'}).catch(()=>{});});}
