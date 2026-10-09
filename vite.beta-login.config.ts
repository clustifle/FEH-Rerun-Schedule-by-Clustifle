import {defineConfig} from 'vite';
export default defineConfig({build:{outDir:'beta-dist',emptyOutDir:false,lib:{entry:'beta-service/login.ts',name:'BetaAccess',formats:['iife'],fileName:()=> '_beta/login.js'},rollupOptions:{output:{inlineDynamicImports:true}}}});
