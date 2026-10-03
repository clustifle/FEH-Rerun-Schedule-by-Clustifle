// Banner dates and times are explicitly UTC.
export function bannerTiming(startsOn:string,endsOn:string,now:number,startTime='07:00',endTime='06:59'){
 const start=Date.parse(startsOn+'T'+startTime+'Z');
 const end=Date.parse(endsOn+'T'+endTime+'Z');
 const remaining=Math.max(0,end-now);
 const minutes=Math.ceil(remaining/60000);
 const days=Math.floor(minutes/1440),hours=Math.floor(minutes%1440/60),mins=minutes%60;
 const countdown=remaining===0?'Ended':days>0?`${days} ${days===1?'day':'days'} ${hours}h remaining`:hours>0?`${hours}h ${mins}m remaining`:`${mins}m remaining`;
 return {countdown,progress:Math.max(0,Math.min(100,(now-start)/(end-start)*100)),state:now<start?'Upcoming':now>=end?'Ended':'Ongoing'};
}
