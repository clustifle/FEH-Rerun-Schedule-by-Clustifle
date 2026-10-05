import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bannerTiming} from '../pages-app/banner-time.ts';
test('uses FEH UTC defaults for the real remaining time',()=>{
 const value=bannerTiming('2026-09-30','2026-10-12',Date.parse('2026-10-03T07:30:00Z'));
 assert.equal(value.countdown,'8d23h remaining');assert.equal(value.state,'Ongoing');
});
test('starts exactly at 07:00 UTC and ends exactly at 06:59 UTC',()=>{
 assert.equal(bannerTiming('2026-10-03','2026-10-12',Date.parse('2026-10-03T06:59:00Z')).state,'Upcoming');
 assert.equal(bannerTiming('2026-10-03','2026-10-12',Date.parse('2026-10-03T07:00:00Z')).state,'Ongoing');
 assert.equal(bannerTiming('2026-10-03','2026-10-12',Date.parse('2026-10-12T06:58:00Z')).countdown,'00:01:00 remaining');
 const ended=bannerTiming('2026-10-03','2026-10-12',Date.parse('2026-10-12T06:59:00Z'));
 assert.equal(ended.state,'Ended');assert.equal(ended.countdown,'Ended');assert.equal(ended.progress,100);
});
test('custom times override defaults and cross years correctly',()=>{
 assert.equal(bannerTiming('2026-12-31','2027-01-01',Date.parse('2026-12-31T12:00:00Z'),'10:00','10:00').countdown,'22:00:00 remaining');
});
test('the same UTC instant converts to each visitors timezone across date boundaries',()=>{
 const instant=new Date('2026-10-12T06:59:00Z');
 const local=tz=>new Intl.DateTimeFormat('en-US',{timeZone:tz,hour:'2-digit',minute:'2-digit',hourCycle:'h23',month:'2-digit',day:'2-digit',year:'numeric'}).format(instant);
 assert.equal(local('Asia/Bangkok'),'10/12/2026, 13:59');
 assert.equal(local('America/Los_Angeles'),'10/11/2026, 23:59');
});

test('upcoming countdown targets the start rather than the end',()=>{
 assert.equal(bannerTiming('2026-10-03','2026-10-12',Date.parse('2026-10-01T04:00:00Z')).countdown,'Starting in 2d 3h');
});
test('switches to seconds below 24 hours and handles the final second',()=>{
 const end=Date.parse('2026-10-12T06:59:00Z');
 assert.equal(bannerTiming('2026-10-03','2026-10-12',end-86400000).countdown,'1d0h remaining');
 assert.equal(bannerTiming('2026-10-03','2026-10-12',end-86399000).countdown,'23:59:59 remaining');
 assert.equal(bannerTiming('2026-10-03','2026-10-12',end-1000).countdown,'00:00:01 remaining');
 assert.equal(bannerTiming('2026-10-03','2026-10-12',end).countdown,'Ended');
});
