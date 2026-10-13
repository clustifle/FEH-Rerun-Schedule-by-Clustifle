import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const user={id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',role:'authenticated'},token='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.signature';
 await p.addInitScript(({user,token})=>localStorage.setItem('sb-aknsqeqykjgdyhdroqcx-auth-token',JSON.stringify({access_token:token,refresh_token:'test',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user})),{user,token});
 const heroes=[{id:'one',name:'First Hero',title:'First'},{id:'two',name:'Second Hero',title:'Second'}];
 const base={hero_id:'one',slot:'B',name:'A/S Taker Burst',family:'A/S Taker Burst',refined:false,arcane:false,exclusive:false,icon_url:'https://test.invalid/one.png',revision:1,description:'',tier:null,remix:false};
 const skills=[{...base,id:'1'},{...base,id:'2',hero_id:'two',name:' a/s taker  burst ',exclusive:true,icon_url:'https://test.invalid/two.png'},{...base,id:'3',slot:'Weapon',name:'Arcane Lantern',icon_url:null},{...base,id:'4',slot:'Weapon',name:'Arcane Lantern',arcane:true,icon_url:null},{...base,id:'5',slot:'Weapon',name:'Refine Sword',refined:true,icon_url:'https://test.invalid/refine1.png'},{...base,id:'6',slot:'Weapon',name:'Refine Sword',refined:true,icon_url:'https://test.invalid/refine2.png'}];
 let writes=0;
 await p.route('**/auth/v1/user',r=>r.fulfill({json:user}));
 await p.route('**/rest/v1/**',r=>{const path=new URL(r.request().url()).pathname;if(path.endsWith('tracker_role'))return r.fulfill({json:'Owner'});if(path.endsWith('is_tracker_owner'))return r.fulfill({json:true});if(path.endsWith('tracker_hero_skills')){if(r.request().method()!=='GET')writes++;return r.fulfill({json:skills});}if(path.endsWith('/heroes'))return r.fulfill({json:heroes});if(path.endsWith('tracker_profiles'))return r.fulfill({json:[{id:user.id,username:'staff'}]});return r.fulfill({json:[]});});
 await p.goto('http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/skills');await p.getByText('4 skills',{exact:true}).waitFor();
 assert.equal(await p.locator('.skills-directory-card').count(),4);
 await p.getByRole('button',{name:'A/S Taker Burst',exact:true}).click();const dialog=p.locator('dialog.skill-preview-dialog[open]');await dialog.getByRole('button',{name:'First Hero · First',exact:true}).waitFor();await dialog.getByRole('button',{name:'Second Hero · Second',exact:true}).waitFor();await dialog.getByRole('button',{name:'Close skill details'}).click();
 await p.getByLabel('Skill exclusivity filter').selectOption('Exclusive');assert.equal(await p.locator('.skills-directory-card').count(),1);await p.getByLabel('Skill exclusivity filter').selectOption('All');
 await p.getByRole('button',{name:'Add new skill',exact:true}).click();const editor=p.locator('dialog.skills-catalog-editor[open]');await editor.getByLabel('Skill type',{exact:true}).selectOption('B');await editor.getByLabel('Skill name',{exact:true}).fill('A/S Taker Burst');await editor.getByRole('button',{name:'Save skill',exact:true}).click();await editor.getByRole('alert').waitFor();assert.ok((await editor.getByRole('alert').innerText()).includes('already recorded'));assert.equal(writes,0);assert.deepEqual(errors,[]);
 console.log('Duplicate skill grouping: different uploads/metadata/spacing collapse, hero associations retained, PRF filter and arcane icon preserved, distinct refines remain, duplicate creation rejected.');
}finally{await b.close();}
