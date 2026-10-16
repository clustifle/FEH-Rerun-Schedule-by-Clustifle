import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../pages-app/forum-draft-sync.ts',import.meta.url),'utf8');
const {ForumDraftSync}=await import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64'));
const defaults={title:'',body:'',category:'general',flair:''};
const copy=v=>JSON.parse(JSON.stringify(v));
function server(){let record={draft:null,revision:0,updatedAt:null},offline=false;const writes=[];return {get record(){return copy(record);},set offline(v){offline=v;},writes,async request(method,body){if(offline)throw Error('Offline');if(method==='GET')return copy(record);if(body.revision!==record.revision)throw Object.assign(Error('Conflict'),{status:409,data:copy(record)});record={draft:method==='DELETE'?null:Object.fromEntries(['title','body','category','flair'].map(k=>[k,body[k]])),revision:record.revision+1,updatedAt:new Date().toISOString()};writes.push(method);return copy(record);}};}
function storage(initial={}){const values=new Map(Object.entries(initial));return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};}
function engine(s,cache=storage(),enabled=true){return new ForumDraftSync(defaults,s.request.bind(s),cache,'member',enabled,10);}

test('a fresh device restores all four fields and legacy local drafts upload without blocking typing',async()=>{
 const s=server(),first=engine(s);await first.refresh();first.change({title:'My draft',body:'**Text**',category:'ideas',flair:'quick-question'});await first.flush();
 const second=engine(s);await second.refresh();assert.deepEqual(second.getSnapshot().value,first.getSnapshot().value);assert.equal(second.getSnapshot().status,'Saved across devices');
 const empty=server(),legacy=engine(empty,storage({'feh-community-draft:member':JSON.stringify({...defaults,title:'Old draft',body:'Legacy text'})}));await legacy.refresh();await legacy.flush();assert.equal(empty.record.draft.body,'Legacy text');
});

test('offline edits survive reopening and reconnect, and delayed fetch never replaces typed text',async()=>{
 const s=server(),cache=storage();s.offline=true;const a=engine(s,cache);a.change({title:'Offline title',body:'Offline text'});await a.refresh();assert.match(a.getSnapshot().status,/device/);
 s.offline=false;const b=engine(s,cache);await b.refresh();await b.flush();assert.equal(s.record.draft.body,'Offline text');
 let resolve;const c=new ForumDraftSync(defaults,()=>new Promise(r=>resolve=r),storage(),'other',true);const loading=c.refresh();c.change({body:'Typed while loading'});resolve(s.record);await loading;assert.equal(c.getSnapshot().value.body,'Typed while loading');assert.ok(c.getSnapshot().conflict);
});

test('concurrent devices cannot overwrite, and both explicit conflict choices work',async()=>{
 const s=server(),a=engine(s),b=engine(s);await Promise.all([a.refresh(),b.refresh()]);a.change({body:'Device A'});b.change({body:'Device B'});await a.flush();await b.flush();assert.equal(s.record.draft.body,'Device A');assert.ok(b.getSnapshot().conflict);b.keepDevice();await b.flush();assert.equal(s.record.draft.body,'Device B');
 a.change({body:'More A'});await a.flush();assert.ok(a.getSnapshot().conflict);a.useCloud();assert.equal(a.getSnapshot().value.body,'Device B');
});

test('typing during a save queues the latest text and a cleared revision blocks stale resurrection',async()=>{
 const s=server();let finish;const a=new ForumDraftSync(defaults,async(method,body)=>{if(method==='POST'&&!finish)await new Promise(r=>finish=r);return s.request(method,body);},storage(),'member',true);await a.refresh();a.change({body:'Before'});const saving=a.flush();a.change({body:'After'});finish();await saving;await a.flush();assert.equal(s.record.draft.body,'After');
 const b=engine(s);await b.refresh();await s.request('DELETE',{revision:s.record.revision});b.change({body:'Stale work'});await b.flush();assert.ok(b.getSnapshot().conflict);assert.equal(s.record.draft,null);b.useCloud();assert.equal(b.getSnapshot().value.body,'');
});

test('successful publishing does not revive a draft and pending cleanup preserves newer work',async()=>{
 const s=server(),cache=storage(),a=engine(s,cache);await a.refresh();a.change({title:'Post',body:'Body'});await a.flush();const revision=await a.preparePublish();await s.request('DELETE',{revision});a.published({draftCleared:true,draftRevision:revision+1});const b=engine(s,cache);await b.refresh();assert.equal(b.getSnapshot().value.body,'');assert.equal(s.record.draft,null);
 b.change({body:'Another post'});await b.flush();await b.preparePublish();b.published({draftCleared:false});await s.request('POST',{...defaults,body:'Newer device work',revision:s.record.revision});const c=engine(s,cache);await c.refresh();assert.equal(c.getSnapshot().value.body,'Newer device work');assert.equal(s.record.draft.body,'Newer device work');
});

test('edit-post mode never reads or writes the new-post draft and oversized text stays local',async()=>{
 const s=server(),a=engine(s,storage(),false);a.start();a.change({body:'Edit an existing post'});await a.flush();assert.equal(s.writes.length,0);assert.equal(s.record.revision,0);
 const b=engine(s);await b.refresh();b.change({body:'x'.repeat(20001)});await b.flush();assert.equal(s.writes.length,0);assert.match(b.getSnapshot().status,/shorten/);
});

test('unchanged editor events never create a new revision',async()=>{
 const s=server(),a=engine(s);await a.refresh();a.change({body:'Same text'});await a.flush();const revision=s.record.revision;a.change({body:'Same text'});await a.flush();assert.equal(s.record.revision,revision);
});

test('cleanup retries cannot delete a newer draft even when its text is identical',async()=>{
 const s=server(),cache=storage(),a=engine(s,cache);await a.refresh();a.change({body:'Reusable post text'});await a.flush();await a.preparePublish();a.published({draftCleared:false});
 await s.request('POST',{...defaults,body:'Reusable post text',revision:s.record.revision});
 const next=engine(s,cache);await next.refresh();assert.equal(s.record.draft.body,'Reusable post text');assert.equal(next.getSnapshot().value.body,'Reusable post text');
});
