// Banner dates and times are explicitly UTC.
export function bannerTiming(startsOn:string,endsOn:string,now:number,startTime='07:00',endTime='06:59'){
 const start=Date.parse(startsOn+'T'+startTime+'Z'),end=Date.parse(endsOn+'T'+endTime+'Z');
 const state=now<start?'Upcoming':now>=end?'Ended':'Ongoing';
 const remaining=Math.max(0,(state==='Upcoming'?start:end)-now);
 const seconds=Math.ceil(remaining/1000),days=Math.floor(seconds/86400),hours=Math.floor(seconds%86400/3600);
 const pad=(value:number)=>String(value).padStart(2,'0');
 const countdown=state==='Ended'?'Ended':state==='Upcoming'?`Starting in ${days}d ${hours}h`:remaining<86400000?`${pad(Math.floor(seconds/3600))}:${pad(Math.floor(seconds%3600/60))}:${pad(seconds%60)} remaining`:`${days}d ${hours}h remaining`;
 return {countdown,progress:Math.max(0,Math.min(100,(now-start)/(end-start)*100)),state};
}

export function bannerStatusTag(timing:ReturnType<typeof bannerTiming>,comingSoon=false){return timing.state==='Ended'?null:comingSoon&&timing.state==='Upcoming'?`Coming soon in ${timing.countdown.replace(/^Starting in /,'')}`:timing.countdown;}
