import ts from '../node_modules/typescript/lib/typescript.js';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const js=ts.transpileModule(await readFile('pages-app/blessing-icons.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const exports={};new Function('require','exports',js)(()=>({assetUrl:path=>path}),exports);
for(const [version,bonus] of [['3.0',1],['4.11.0',1],['5.0.0',2],['8.11',2],['9.0',3],['10.1',3]])assert.equal(exports.mythicBonus({category:'Mythic',debut_version:version}),bonus);
for(const [date,bonus] of [['2020-12-07',1],['2020-12-08',2],['2024-12-05',2],['2024-12-06',3]])assert.equal(exports.mythicBonus({category:'Mythic',release_date:date}),bonus);
assert.equal(exports.mythicBonus({category:'Mythic'}),null);
assert.equal(exports.mythicBonus({category:'Legendary',debut_version:'9.0'}),null);
assert.equal(exports.blessingIcon('Chosen Hero','Wind'),'chosen/wind.png');
assert.equal(exports.blessingIcon('Legendary','Earth'),'blessings/earth.webp');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{const page=await browser.newPage();await page.goto('http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/');for(const bonus of [1,2,3])for(const blessing of ['Light','Dark','Astra','Anima']){const path=exports.blessingIcon('Mythic',blessing,{debut_version:bonus===1?'3.0':bonus===2?'5.0':'9.0'});assert.ok(path.includes('/'+bonus+'/'));assert.deepEqual(await page.evaluate(path=>new Promise(resolve=>{const image=new Image();image.onload=()=>resolve([image.naturalWidth,image.naturalHeight]);image.onerror=()=>resolve(null);image.src=path;}),path),[256,256]);}console.log('Mythic bonus version/date boundaries, unknown metadata, Legendary/Chosen preservation and all 12 deployed-preview icons passed.');}finally{await browser.close();}
