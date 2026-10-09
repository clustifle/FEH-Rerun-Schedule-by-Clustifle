import {spawnSync} from 'node:child_process';
const env={...process.env,SITE_CHANNEL:'stable'};
for(const config of ['vite.pages.config.ts','vite.administrative.config.ts']){
 const run=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--config',config],{env,stdio:'inherit'});
 if(run.status!==0)process.exit(run.status||1);
}
