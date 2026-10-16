export type ForumDraft={title:string;body:string;category:string;flair:string};
export type DraftRecord={draft:ForumDraft|null;revision:number;updatedAt:string|null};
type Snapshot={value:ForumDraft;status:string;conflict:DraftRecord|null;ready:boolean};
type StorageLike=Pick<Storage,'getItem'|'setItem'>;
type RequestDraft=(method:'GET'|'POST'|'DELETE',body?:unknown)=>Promise<DraftRecord>;
const same=(a:ForumDraft|null,b:ForumDraft|null)=>JSON.stringify(a)===JSON.stringify(b);
const content=(d:ForumDraft)=>!!(d.title||d.body||d.flair);
function fields(d:Partial<ForumDraft>,fallback:ForumDraft):ForumDraft{return {title:typeof d.title==='string'?d.title:fallback.title,body:typeof d.body==='string'?d.body:fallback.body,category:typeof d.category==='string'?d.category:fallback.category,flair:typeof d.flair==='string'?d.flair:fallback.flair};}

/** A single, revision-protected draft. Local writes never wait for the network. */
export class ForumDraftSync{
 private state:Snapshot;
 private listeners=new Set<()=>void>();
 private revision:number|null=null;
 private dirty=false;
 private timer:ReturnType<typeof setTimeout>|null=null;
 private operation:Promise<void>|null=null;
 private active=false;
 private paused=false;
 private pendingClear:ForumDraft|null=null;
 private pendingClearRevision:number|null=null;
 private lastStored:string|null=null;
 readonly key:string;
 constructor(private defaults:ForumDraft,private request:RequestDraft,private storage:StorageLike|null,accountId:string,private enabled=true,private delay=1000){
  this.key='feh-community-draft:'+accountId;
  let value={...defaults};
  if(enabled)try{
   this.lastStored=storage?.getItem(this.key)||null;
   const saved=JSON.parse(this.lastStored||'null');
   if(saved&&typeof saved==='object'){
    value=fields(saved.draft||saved,defaults);
    this.revision=Number.isSafeInteger(saved.baseRevision)&&saved.baseRevision>=0?saved.baseRevision:null;
    this.dirty=typeof saved.dirty==='boolean'?saved.dirty:content(value);
    this.pendingClear=saved.pendingClear?fields(saved.pendingClear,defaults):null;
    this.pendingClearRevision=Number.isSafeInteger(saved.pendingClearRevision)?saved.pendingClearRevision:null;
   }
  }catch{}
  this.state={value,status:enabled?'Checking saved draft…':'',conflict:null,ready:!enabled};
 }
 getSnapshot=()=>this.state;
 subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>this.listeners.delete(listener);};
 private update(patch:Partial<Snapshot>){this.state={...this.state,...patch};for(const listener of this.listeners)listener();}
 private persist(force=false){if(!this.enabled)return;try{if(!force&&this.storage?.getItem(this.key)!==this.lastStored)return;const value=JSON.stringify({draft:this.state.value,baseRevision:this.revision,dirty:this.dirty,pendingClear:this.pendingClear,pendingClearRevision:this.pendingClearRevision});this.storage?.setItem(this.key,value);this.lastStored=value;}catch{this.update({status:'Device storage is unavailable. Keep this editor open until syncing finishes.'});}}
 private cancel(){if(this.timer)clearTimeout(this.timer);this.timer=null;}
 private schedule(){this.cancel();if(this.active&&!this.paused&&this.dirty&&this.state.ready&&!this.state.conflict)this.timer=setTimeout(()=>void this.flush(),this.delay);}
 start(){if(!this.enabled)return;this.active=true;void this.refresh();}
 stop(){this.active=false;this.cancel();if(!this.paused&&this.dirty&&!this.state.conflict)void this.flush();}
 change(patch:Partial<ForumDraft>){
  const value={...this.state.value,...patch};if(same(value,this.state.value))return;
  this.update({value});
  if(!this.enabled)return;
  this.dirty=true;this.update({status:this.state.conflict?'Choose which draft to keep.':'Saved on this device · syncing…'});this.persist(true);this.schedule();
 }
 private reconcile(record:DraftRecord){
  if(this.pendingClear)return;
  if(this.dirty){
   if(same(record.draft,this.state.value)){this.revision=record.revision;this.dirty=false;this.update({ready:true,conflict:null,status:'Saved across devices'});}
   else if(record.revision===this.revision||(this.revision===null&&record.revision===0&&!record.draft)){this.revision=record.revision;this.update({ready:true,conflict:null});}
   else{this.update({ready:true,conflict:record,status:record.draft?'This draft changed on another device.':'This draft was published or cleared on another device.'});}
  }else{
   this.revision=record.revision;this.update({value:record.draft||{...this.defaults},ready:true,conflict:null,status:record.draft?'Saved across devices':'Drafts sync automatically to your account.'});
  }
  this.persist();
 }
 async refresh(){
  if(!this.enabled||this.paused)return;
  if(this.operation)return this.operation;
  const task=(async()=>{
   try{
    let record=await this.request('GET');
    if(this.pendingClear){
     // Retry cleanup only for the exact content that was published; preserve any later draft.
     if(record.revision===this.pendingClearRevision&&same(record.draft,this.pendingClear)){record=await this.request('DELETE',{revision:record.revision});this.revision=record.revision;}
     this.pendingClear=null;this.pendingClearRevision=null;this.persist();
    }
    this.reconcile(record);
   }catch{this.update({status:'Saved on this device · sync unavailable. Reconnect to sync.'});}
  })();
  this.operation=task;try{await task;}finally{if(this.operation===task)this.operation=null;this.schedule();}
 }
 async flush():Promise<void>{
  this.cancel();if(!this.enabled||this.paused||this.state.conflict)return;
  if(this.operation){await this.operation;return this.flush();}
  if(!this.state.ready){await this.refresh();if(!this.state.ready)return;}
  if(!this.dirty||this.state.conflict)return;
  const captured={...this.state.value};
  if(captured.title.length>200||captured.body.length>20000){this.update({status:'Saved on this device · shorten the post to sync (20,000 characters maximum).'});return;}
  // Do not create an empty cloud draft just because the composer was opened.
  if(!content(captured)&&!this.revision){this.dirty=false;this.persist();this.update({status:'Drafts sync automatically to your account.'});return;}
  let saved=false;
  const task=(async()=>{
   this.update({status:'Syncing draft…'});
   try{
    const record=await this.request('POST',{...captured,revision:this.revision||0});
    this.revision=record.revision;this.dirty=!same(captured,this.state.value);saved=true;
    this.update({status:this.dirty?'Saved on this device · syncing…':'Saved across devices'});this.persist();
   }catch(error){
    const conflict=error as {status?:number;data?:DraftRecord};
    if(conflict.status===409&&conflict.data&&Number.isSafeInteger(conflict.data.revision))this.update({conflict:conflict.data,status:'This draft changed on another device. Choose which version to keep.'});
    else this.update({status:'Saved on this device · sync unavailable. Reconnect to sync.'});
   }
  })();
  this.operation=task;try{await task;}finally{if(this.operation===task)this.operation=null;if(saved)this.schedule();}
 }
 useCloud(){const record=this.state.conflict;if(!record)return;this.revision=record.revision;this.dirty=false;this.update({value:record.draft||{...this.defaults},conflict:null,ready:true,status:record.draft?'Saved across devices':'Draft cleared on this device.'});this.persist();}
 keepDevice(){const record=this.state.conflict;if(!record)return;this.revision=record.revision;this.dirty=true;this.update({conflict:null,ready:true,status:'Saving this device’s version…'});this.persist();void this.flush();}
 async preparePublish(){
  await this.flush();if(this.state.conflict)throw new Error('Choose which draft to keep before publishing.');
  this.paused=true;this.cancel();return this.state.ready&&!this.dirty?this.revision:null;
 }
 resume(){this.paused=false;this.schedule();}
 published(result:{draftCleared?:boolean;draftRevision?:number|null}){
  this.paused=true;this.cancel();
  const published={...this.state.value};
  this.pendingClear=result.draftCleared?null:published;
  this.pendingClearRevision=result.draftCleared?null:this.revision;
  if(result.draftCleared&&typeof result.draftRevision==='number')this.revision=result.draftRevision;
  this.dirty=false;this.update({value:{...this.defaults},conflict:null,status:'Post published.'});this.persist();
 }
}
