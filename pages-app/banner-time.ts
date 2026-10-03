const DAY=86400000;
// Date-only banner end dates include the whole UTC day.
export function bannerTiming(startsOn:string,endsOn:string,now:number){
 const start=Date.parse(startsOn+'T00:00:00Z');
 const end=Date.parse(endsOn+'T00:00:00Z')+DAY;
 const remaining=Math.max(0,end-now);
 const minutes=Math.ceil(remaining/60000);
 const days=Math.floor(minutes/1440),hours=Math.floor(minutes%1440/60),mins=minutes%60;
 const countdown=remaining===0?'Ended':days>0?`${days} ${days===1?'day':'days'} ${hours}h remaining`:hours>0?`${hours}h ${mins}m remaining`:`${mins}m remaining`;
 return {countdown,progress:Math.max(0,Math.min(100,(now-start)/(end-start)*100)),state:now<start?'Upcoming':now>=end?'Ended':'Ongoing'};
}
