import {test} from 'node:test';
import assert from 'node:assert/strict';
import {directorySearchText,searchKey,rerunMonth,rerunLabel,compareRecorded} from '../pages-app/directory-data.ts';
test('directory search includes metadata and normalizes FEH names',()=>{
 const text=directorySearchText({name:'Heiðr',title:'Golden Seer',category:'Mythic',color:'Green',weapon_type:'Tome',move_type:'Infantry',blessing:'Light',debut_version:'10.2',release_date:'2026-02-01',searchText:'Alias',notes:'Staff note'},'Special Pool');
 for(const term of ['heidr','green tome','infantry','light','10.2','2026-02-01','alias','staff note','special pool'])assert.ok(text.includes(searchKey(term)),term);
});
test('waitlists and consideration never expose a month as a recorded rerun',()=>{
 for(const schedule of ['Waitlist','DSH Waitlist','NHR Waitlist','Remix Waitlist','Schedule Under Consideration']){assert.equal(rerunMonth({schedule,month:'2026-11'}),null);assert.equal(rerunLabel({schedule,month:'2026-11'}),'Date not confirmed');}
 assert.equal(rerunMonth({schedule:'General',month:'2026-11'}),'2026-11');
 for(const month of ['2026-13','2026-00','unknown',null])assert.equal(rerunMonth({schedule:'General',month}),null);
});
test('release and version sorting retain missing records last in both directions',()=>{
 const compare=new Intl.Collator('en',{numeric:true}).compare;
 for(const descending of [true,false]){assert.equal(compareRecorded(null,'10.1',descending,compare),1);assert.equal(compareRecorded('10.1',null,descending,compare),-1);}
 assert.ok(compareRecorded('10.2','9.10',true,compare)<0);
 assert.ok(compareRecorded('2026-10-01','2025-10-01',false,compare)>0);
});
