import {existsSync} from 'node:fs';
let runtime;
try{runtime=await import(process.env.PLAYWRIGHT_MODULE||'playwright');}
catch(error){const bundled='C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';if(process.platform!=='win32'||!existsSync(bundled))throw new Error('Browser checks require Playwright. Install it in the test environment or set PLAYWRIGHT_MODULE to its module URL.',{cause:error});runtime=await import('file:///'+bundled);}
export const chromium=runtime.chromium;
const chrome=process.env.CHROME_PATH||(process.platform==='win32'&&existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe')?'C:/Program Files/Google/Chrome/Application/chrome.exe':'');
export const browserLaunchOptions={headless:true,...(chrome?{executablePath:chrome}:{})};
