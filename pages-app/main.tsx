import GitHubAuthReturn from './GitHubAuthReturn';
import InstallApp from './InstallApp';
import AccountSetup from './AccountSetup';
import PageOverlayScrollbar from './PageOverlayScrollbar';
import ScrollbarActivity from './ScrollbarActivity';
import {restorePagesRoute} from './routes';
import React from 'react';import {createRoot} from 'react-dom/client';import Tracker from './Tracker';import OwnerLogin from './OwnerLogin';import '../app/globals.css';
import '../app/mobile.css';
restorePagesRoute();
createRoot(document.getElementById('root')!).render(<React.StrictMode><ScrollbarActivity/><PageOverlayScrollbar/><Tracker/><GitHubAuthReturn/><InstallApp/><OwnerLogin/><AccountSetup/></React.StrictMode>);

if(import.meta.env.PROD&&'serviceWorker' in navigator){window.addEventListener('load',()=>{void navigator.serviceWorker.register(import.meta.env.BASE_URL+'sw.js',{scope:import.meta.env.BASE_URL,updateViaCache:'none'}).catch(()=>{});});}
