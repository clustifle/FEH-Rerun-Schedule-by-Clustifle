import ts from '../node_modules/typescript/lib/typescript.js';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const source=await readFile('pages-app/wiki-hero-import.ts','utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const metadata='<table><tr><th>Version</th><td>10.0</td></tr><tr><th>Release Date</th><td>2026-01-01</td></tr></table>';
const table=name=>'<table><tr><th>Name</th></tr><tr><td>'+name+'</td></tr></table>';
try{
 const page=await browser.newPage();
 const cases=[
  ['<h3><span id="Ally_Weapons">Ally Weapons</span></h3>'+table('Playable Weapon')+'<h3><span id="Enemy_Weapons">Enemy Weapons</span></h3>'+table('Story Enemy Weapon'),'Playable Weapon'],
  ['<h3 id="Enemy_Weapons">Enemy Weapons</h3>'+table('Story Enemy Weapon')+'<h3 id="Ally_weapons">Ally weapons</h3>'+table('Playable Weapon'),'Playable Weapon'],
  ['<h3 id="Weapons">Weapons</h3>'+table('Ordinary Weapon'),'Ordinary Weapon'],
  ['<h3 id="Weapons">Weapons</h3>'+table('Generic Weapon')+'<h3 id="Ally_Weapons">Ally Weapons</h3>'+table('Playable Weapon'),'Playable Weapon'],
  ['<h3 id="Weapons">Weapons</h3><h4 id="Enemy_Weapons">Enemy Weapons</h4>'+table('Story Enemy Weapon'),null],
  ['<h3 id="Ally_Weapons">Ally Weapons</h3><h3 id="Enemy_Weapons">Enemy Weapons</h3>'+table('Story Enemy Weapon'),null]
 ];
 for(const [html,expected] of cases){
  const result=await page.evaluate(({js,html})=>{const exports={};new Function('require','exports',js)(()=>({skillSlots:['Weapon','Assist','Special','A','B','C','X']}),exports);return exports.parseWikiHero(html,'Example: Hero','https://feheroes.fandom.com/wiki/Example:_Hero').skills;},{js,html:metadata+html});
  assert.equal(result.find(s=>s.slot==='Weapon')?.name||null,expected);assert.ok(!result.some(s=>s.name==='Story Enemy Weapon'));
 }
 console.log('Ally weapon preference, lowercase headings, normal weapons, and enemy-only/missing-table safety: 6 cases passed.');
}finally{await browser.close();}
