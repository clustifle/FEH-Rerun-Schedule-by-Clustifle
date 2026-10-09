import './beta-safety';
import React from 'react';
import {createRoot} from 'react-dom/client';
import AdministrativeManager from './AdministrativeManager';
import BetaSession from './BetaSession';
import './AdministrativeManager.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><BetaSession/><AdministrativeManager/></React.StrictMode>);
