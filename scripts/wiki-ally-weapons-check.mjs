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
 const page=await browser.newPage();const poolJs=ts.transpileModule(await readFile('pages-app/hero-pools.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;await page.evaluate(js=>{window.__poolExports={};new Function('exports',js)(window.__poolExports);},poolJs);
 const cases=[
  ['<h3><span id="Ally_Weapons">Ally Weapons</span></h3>'+table('Playable Weapon')+'<h3><span id="Enemy_Weapons">Enemy Weapons</span></h3>'+table('Story Enemy Weapon'),'Playable Weapon'],
  ['<h3 id="Enemy_Weapons">Enemy Weapons</h3>'+table('Story Enemy Weapon')+'<h3 id="Ally_weapons">Ally weapons</h3>'+table('Playable Weapon'),'Playable Weapon'],
  ['<h3 id="Weapons">Weapons</h3>'+table('Ordinary Weapon'),'Ordinary Weapon'],
  ['<h3 id="Weapons">Weapons</h3>'+table('Generic Weapon')+'<h3 id="Ally_Weapons">Ally Weapons</h3>'+table('Playable Weapon'),'Playable Weapon'],
  ['<h3 id="Weapons">Weapons</h3><h4 id="Enemy_Weapons">Enemy Weapons</h4>'+table('Story Enemy Weapon'),null],
  ['<h3 id="Ally_Weapons">Ally Weapons</h3><h3 id="Enemy_Weapons">Enemy Weapons</h3>'+table('Story Enemy Weapon'),null]
 ];
 for(const [html,expected] of cases){
  const result=await page.evaluate(({js,html})=>{const exports={};new Function('require','exports',js)(()=>({...window.__poolExports,skillSlots:['Weapon','Assist','Special','A','B','C','X']}),exports);return exports.parseWikiHero(html,'Example: Hero','https://feheroes.fandom.com/wiki/Example:_Hero').skills;},{js,html:metadata+html});
  assert.equal(result.find(s=>s.slot==='Weapon')?.name||null,expected);assert.ok(!result.some(s=>s.name==='Story Enemy Weapon'));
 }
 const letters=await page.evaluate(js=>{const exports={};new Function('require','exports',js)(()=>({...window.__poolExports,skillSlots:['Weapon','Assist','Special','A','B','C','X']}),exports);const cases=[['Heiðr: Innocent Goddess','Heidr: Innocent Goddess'],['Nerþuz: God of the Land','Nerthuz: God of the Land'],['Læraðr: Quieting Heart','Laeradr: Quieting Heart'],['Hræsvelgr: Quieting Blade','Hraesvelgr: Quieting Blade'],['Gunnthrá: Voice of Dreams','Gunnthra: Voice of Dreams'],['Tiki: Legendary Dragon','Tiki (Y): Legendary Dragon'],['Dawn’s Trueblade',"Dawn's Trueblade"]];return {matches:cases.map(([a,b])=>exports.wikiMatch(a,b)),wrong:exports.wikiMatch('Heiðr: Innocent Goddess','Heiðrún: Healing Nectar'),empty:exports.wikiMatch('!?','!'),urls:cases.slice(0,5).map(([title])=>exports.wikiPageUrl('https://feheroes.fandom.com/wiki/'+encodeURIComponent(encodeURIComponent(title.normalize('NFD').replace(/ /g,'_')))).page),name:exports.wikiHeroName('Tiki (Y)')};},js);assert.ok(letters.matches.every(Boolean));assert.equal(letters.wrong,false);assert.equal(letters.empty,false);assert.equal(letters.name,'Tiki');assert.equal(letters.urls[0],'Heiðr: Innocent Goddess');const legacy=await page.evaluate(js=>{const exports={};new Function('require','exports',js)(()=>({...window.__poolExports,skillSlots:[]}),exports);return exports.wikiPageUrl('https://feheroes.gamepedia.com/Heiðr:_Innocent_Goddess');},js);assert.equal(legacy.page,'Heiðr: Innocent Goddess');assert.ok(legacy.url.startsWith('https://feheroes.fandom.com/wiki/'));
 const passives=await page.evaluate(({js,metadata})=>{const exports={};new Function('require','exports',js)(()=>({...window.__poolExports,skillSlots:['Weapon','Assist','Special','A','B','C','X']}),exports);const rows=[['Swift Sparrow 1','A'],['Swift Sparrow 2','A'],['Swift Sparrow 3','A'],['Flared Sparrow','A'],['Wings of Mercy 4','B'],['Wings of Mercy 3','B'],['Drive Atk 2','C'],['Atk/Spd Oath 4','C'],['Drive Atk 2','C'],['Oath Echo','X']].map(([name,slot])=>'<tr><td>'+name+'</td><td>Passive '+slot+'</td></tr>').join('');const html=metadata+'<h2>Passives</h2><div><table><tr><th colspan="2">Learnable skills</th></tr><tr><th>name</th><th>type</th></tr>'+rows+'</table></div>';return exports.parseWikiHero(html,'Test: Hero','https://feheroes.fandom.com/wiki/Test:_Hero').skills;},{js,metadata});assert.deepEqual(passives.map(s=>[s.slot,s.name]),[['A','Flared Sparrow'],['B','Wings of Mercy 4'],['C','Atk/Spd Oath 4'],['X','Oath Echo']]);
 const refineCases=await page.evaluate(({js,metadata})=>{const exports={};new Function('require','exports',js)(()=>({...window.__poolExports,skillSlots:['Weapon','Assist','Special','A','B','C','X']}),exports);const base=metadata+'<h2>Weapons</h2><table><tr><th>Name</th></tr><tr><td>Hræsvelgr’s Bow</td></tr></table>';const icon='https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/a/ab/Hr%C3%A6svelgr%E2%80%99s_Bow_W.webp/revision/latest/scale-to-width-down/40';return [base+'<img data-image-key="Hræsvelgr’s_Bow_W.webp" data-src="'+icon+'">',base+'<img data-original="'+icon+'">',base+'<img alt="Different Weapon W" data-src="https://static.wikia.nocookie.net/x/Different_Weapon_W.png">'].map(html=>exports.parseWikiHero(html,'Hero: Test','https://feheroes.fandom.com/wiki/Hero:_Test').skills[0]);},{js,metadata});assert.ok(refineCases[0].refineIcon&&!refineCases[0].refineIcon.includes('scale-to-width-down'));assert.ok(refineCases[0].refineThumbnail.includes('scale-to-width-down'));assert.equal(refineCases[1].refineIcon,refineCases[0].refineIcon);assert.equal(refineCases[2].refineIcon,null);
 const heroTypes=await page.evaluate(({js,metadata})=>{const exports={};new Function('require','exports',js)(()=>({...window.__poolExports,skillSlots:[]}),exports);const cases=[
 ['<table><tr><th>Rarities</th><td>5 ★ Focus — Special</td></tr></table>','Special'],
 ['<table><tr><th>Hero Type</th><td><img alt="Special Heroes"></td></tr></table>','Special'],
 ['<table><tr><th>Hero Types</th><td>General</td><td><a title="Special Heroes">Special</a></td></tr></table>','Special'],
 ['<table><tr><th>Hero Type</th><td>Harmonized</td></tr><tr><th>Rarities</th><td>5 ★ Focus — Special</td></tr></table>','Harmonized'],
 ['<table><tr><th>Hero Type</th><td>General</td></tr><tr><th>Rarities</th><td>4 ★ Special Rate</td></tr></table>','General'],
 ['<h2>Specials</h2><p>Accelerates Special trigger.</p>','General'],
 ['<table><tr><th>Hero Type</th><td><a href="/wiki/Category:Special_Heroes"><img alt=""></a></td></tr></table>','Special'],
 ['<table><tr><th>Hero Type</th><td>Attuned</td></tr><tr><th>Rarities</th><td>5 ★</td></tr></table>','Attuned']
 ];return cases.map(([html,expected])=>({actual:exports.parseWikiHero(metadata+html,'Example: Hero','https://feheroes.fandom.com/wiki/Example:_Hero').identity.heroType,expected}));},{js,metadata});for(const result of heroTypes)assert.equal(result.actual,result.expected);console.log('Special Hero infobox text, rarity tags, icons, links, specialized types and false-positive protection: 8 cases passed.');
 const availability=await page.evaluate(({js,metadata})=>{const exports={};new Function('require','exports',js)(()=>({...window.__poolExports,skillSlots:[]}),exports);const cases=[
 ['3 <img alt="★"> — 4 <img alt="★">',true,false],
 ['4 ★ Focus — 5 ★ Focus — Special',true,false],
 ['4 ★ SR — Special',false,false],
 ['3 ★ — 4 ★ — Grand Hero Battle',false,true],
 ['4 ★ — 5 ★ — Tempest Trials',false,true],
 ['4 ★ SR — Special Tempest Trials',false,false],
 ['5 ★ Focus — Special Tempest Trials',false,false],
 ['5 ★',false,false]
 ];return cases.map(([rarity,demote,grail])=>({actual:exports.parseWikiHero(metadata+'<table><tr><th>Rarities</th><td>'+rarity+'</td></tr></table><h2>Stats</h2><p>Tempest Trials, 3 ★ — 4 ★</p>','Example: Hero','https://feheroes.fandom.com/wiki/Example:_Hero').identity,demote,grail}));},{js,metadata});for(const row of availability){assert.equal(row.actual.demote,row.demote);assert.equal(row.actual.heroicGrail,row.grail);}console.log('Demote/GHB/original TT reward detection, Special Rate and reused TT reward exclusions: 8 cases passed.');
 const refineNames=await page.evaluate(js=>{const exports={};new Function('require','exports',js)(()=>({...window.__poolExports,skillSlots:[]}),exports);const name='Hræsvelgr’s Bow';return [exports.wikiRefineMatch('Hr%C3%A6svelgr%E2%80%99s_Bow_W.webp',name),exports.wikiRefineMatch('Hr%25C3%25A6svelgr%25E2%2580%2599s_Bow_W.webp',name),exports.wikiRefineMatch('Hraesvelgr&amp;apos;s_Bow_W.webp',name),exports.wikiRefineMatch('Hræsvelgr’s_Bow_W.webp'.normalize('NFD'),name),exports.wikiRefineMatch('File:Hræsvelgr’s_Bow_W.webp',name),exports.wikiRefineMatch('Different Bow W.webp',name)];},js);assert.ok(refineNames.slice(0,3).every(Boolean));assert.ok(refineNames[3]);assert.ok(refineNames[4]);assert.equal(refineNames[5],false);
 console.log('Ally weapon preference, lowercase headings, normal weapons, and enemy-only/missing-table safety: 6 cases passed.');
}finally{await browser.close();}
