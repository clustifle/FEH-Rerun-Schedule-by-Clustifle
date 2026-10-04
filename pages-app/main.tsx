import React from 'react';import {createRoot} from 'react-dom/client';import Tracker from './Tracker';import OwnerLogin from './OwnerLogin';import Managers from './Managers';import '../app/globals.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><Tracker/><OwnerLogin/><Managers/></React.StrictMode>);

if(import.meta.env.PROD&&'serviceWorker' in navigator){window.addEventListener('load',()=>{void navigator.serviceWorker.register(import.meta.env.BASE_URL+'sw.js',{scope:import.meta.env.BASE_URL,updateViaCache:'none'}).catch(()=>{});});}
