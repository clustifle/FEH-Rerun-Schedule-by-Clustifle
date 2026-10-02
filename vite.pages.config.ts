import {defineConfig} from 'vite';import react from '@vitejs/plugin-react';import {fileURLToPath} from 'node:url';
export default defineConfig({plugins:[react()],base:process.env.PAGES_BASE_PATH||'/FEH-Rerun-Schedule-by-Clustifle/',resolve:{alias:{'@':fileURLToPath(new URL('.',import.meta.url))}},build:{outDir:'pages-dist',emptyOutDir:true}});
