import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readBoundedBody} from './request-body.mjs';
test('stream limit rejects chunked bodies and cancels before buffering the rest',async()=>{
 let cancelled=false;
 const body=new ReadableStream({start(c){c.enqueue(new Uint8Array(6));c.enqueue(new Uint8Array(6));},cancel(){cancelled=true;}});
 await assert.rejects(readBoundedBody({body},10,()=>{throw Error('too large');}),/too large/);
 assert.equal(cancelled,true);
});
test('declared small content length cannot bypass the actual byte limit',async()=>{
 const r=new Request('https://test.invalid',{method:'POST',headers:{'Content-Length':'1'},body:'x'.repeat(30)});
 await assert.rejects(readBoundedBody(r,10,()=>{throw Error('too large');}),/too large/);
});
test('normal Unicode and binary bodies retain exact bytes',async()=>{
 const bytes=new TextEncoder().encode('FEH · スキル');
 const r=new Request('https://test.invalid',{method:'POST',body:bytes});
 assert.deepEqual(await readBoundedBody(r,bytes.length,()=>assert.fail()),bytes);
 assert.deepEqual(await readBoundedBody({body:null},1,()=>assert.fail()),new Uint8Array());
});
