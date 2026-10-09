import {spawnSync} from 'node:child_process';
const env={...process.env,SITE_CHANNEL:'beta',PAGES_BASE_PATH:'/'};
for(const config of ['vite.pages.config.ts','vite.beta-login.config.ts','vite.administrative.config.ts']){
 const r=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--config',config],{env,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);
}
