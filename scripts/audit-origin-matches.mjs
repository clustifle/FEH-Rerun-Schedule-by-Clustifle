import fs from 'node:fs';
const key=s=>s.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/\([^)]*\)/g,'').replace(/[^a-z0-9]/g,'');
const catalog=JSON.parse(fs.readFileSync('pages-app/origin-catalog.json'));
const heroes=JSON.parse(fs.readFileSync('scripts/origin-site-heroes.json'));
const byKey=new Map(catalog.entries.map(e=>[key(e.hero),e]));
const aliases={};
const matched=[],unmatched=[];
for(const h of heroes){const label=h.name+': '+h.title;const entry=byKey.get(key(aliases[label]||label));if(entry)matched.push({id:h.id,site:label,catalog:entry.hero,position:entry.position,origins:entry.origins});else unmatched.push(h);}
const positions=new Map();for(const e of matched){const list=positions.get(e.position)||[];list.push(e.site);positions.set(e.position,list);}
const duplicates=[...positions.values()].filter(a=>a.length>1);
const absentFromSite=catalog.entries.filter(e=>!positions.has(e.position)).map(e=>e.hero);
fs.writeFileSync('scripts/origin-match-audit.json',JSON.stringify({catalogCount:catalog.entries.length,siteCount:heroes.length,matched:matched.length,unmatched,duplicates,absentFromSite},null,2)+'\n');
console.log({matched:matched.length,unmatched,duplicates,absentFromSite});
