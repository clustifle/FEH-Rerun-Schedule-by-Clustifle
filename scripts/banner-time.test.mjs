import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bannerTiming} from '../pages-app/banner-time.ts';
test('counts remaining elapsed time instead of rounding each partial day up',()=>{
 const value=bannerTiming('2026-09-30','2026-10-12',Date.parse('2026-10-03T07:30:00Z'));
 assert.equal(value.countdown,'9 days 16h remaining');
 assert.equal(value.state,'Ongoing');
});
test('end date is included and expires exactly at the following UTC midnight',()=>{
 assert.equal(bannerTiming('2026-10-12','2026-10-12',Date.parse('2026-10-12T23:30:00Z')).countdown,'30m remaining');
 const ended=bannerTiming('2026-10-12','2026-10-12',Date.parse('2026-10-13T00:00:00Z'));
 assert.equal(ended.countdown,'Ended');assert.equal(ended.state,'Ended');assert.equal(ended.progress,100);
});
test('new years and leap days use real calendar durations',()=>{
 assert.equal(bannerTiming('2026-12-31','2027-01-01',Date.parse('2026-12-31T12:00:00Z')).countdown,'1 day 12h remaining');
 assert.equal(bannerTiming('2028-02-28','2028-03-01',Date.parse('2028-02-28T00:00:00Z')).countdown,'3 days 0h remaining');
});
