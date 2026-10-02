import React from 'react';import {createRoot} from 'react-dom/client';import Tracker from './Tracker';import OwnerLogin from './OwnerLogin';import '../app/globals.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><Tracker/><OwnerLogin/></React.StrictMode>);
