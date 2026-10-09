import {defineConfig} from 'vite';import react from '@vitejs/plugin-react';import {resolve} from 'node:path';import {cp,mkdir,readFile,writeFile} from 'node:fs/promises';
const beta=process.env.SITE_CHANNEL==='beta';
const target=beta?'beta-dist':'pages-dist';
const base=process.env.PAGES_BASE_PATH||(beta?'/':'/FEH-Rerun-Schedule-by-Clustifle/');
const sections=['','dashboard','heroes','schedules','waitlists','mods-edit','community','polls','content','staff','history'];
export default defineConfig({base,publicDir:false,define:{'import.meta.env.VITE_SITE_CHANNEL':JSON.stringify(beta?'beta':'stable'),'import.meta.env.VITE_DEPLOYMENT_ID':JSON.stringify(process.env.GITHUB_SHA||'admin-v2')},plugins:[react(),{name:'standalone-administrative',async closeBundle(){const out=resolve('admin-dist');await cp(out+'/assets',target+'/assets',{recursive:true});const html=await readFile(out+'/administrative/index.html','utf8');for(const section of sections){const path=target+'/FEHRS_AdmManager/'+section;await mkdir(path,{recursive:true});await writeFile(path+'/index.html',html);}}}],build:{outDir:'admin-dist',emptyOutDir:true,rollupOptions:{input:resolve('administrative/index.html')}}});
