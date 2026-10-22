import fs from 'node:fs';
const key=s=>s.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const order=JSON.parse(fs.readFileSync('scripts/catalog-order.json'));
const origins=JSON.parse(fs.readFileSync('scripts/catalog-origins.json'));
const byName=new Map(origins.map(h=>[key(h.hero),h]));
const entries=order.map((hero,index)=>{const row=byName.get(key(hero));if(!row?.origins.length)throw Error('Missing origins: '+hero);return {hero,position:index,origins:row.origins};});
if(new Set(entries.map(h=>key(h.hero))).size!==1427)throw Error('Duplicate catalog identities');
fs.writeFileSync('pages-app/origin-catalog.json',JSON.stringify({source:'https://feheroes.fandom.com/wiki/Catalog_of_Heroes',originsSource:'https://feheroes.fandom.com/wiki/List_of_Heroes',checked:'2026-10-22',entries},null,2)+'\n');
const source=fs.readFileSync('pages-app/static-data.ts','utf8');
const apiKey=source.match(/supabasePublishableKey='([^']+)'/)[1];
const base=source.match(/supabaseUrl='([^']+)'/)[1];
const heroes=[];
for(let start=0;;start+=1000){const r=await fetch(base+'/rest/v1/heroes?select=id,name,title&order=id',{headers:{apikey:apiKey,Range:`${start}-${start+999}`}});if(!r.ok)throw Error('Read failed '+r.status);const rows=await r.json();heroes.push(...rows);if(rows.length<1000)break;}
const unmatched=heroes.filter(h=>!byName.has(key(h.name+': '+h.title)));
fs.writeFileSync('scripts/origin-match-audit.json',JSON.stringify({catalogCount:entries.length,siteCount:heroes.length,matched:heroes.length-unmatched.length,unmatched},null,2)+'\n');
fs.writeFileSync('scripts/origin-site-heroes.json',JSON.stringify(heroes));
console.log({catalog:entries.length,site:heroes.length,matched:heroes.length-unmatched.length,unmatched});
await import('./audit-origin-matches.mjs');
