export function buildScheduleIndex<T extends {month:string|null;color:string;category:string}>(heroes:T[]){
 const byColor=new Map<string,T[]>(),byMonthColor=new Map<string,T[]>(),byRevival=new Map<string,T[]>();
 const monthSpaces=new Map<string,number>(),revivalSpaces=new Map<string,number>(),unscheduled:T[]=[];
 function add(map:Map<string,T[]>,key:string,hero:T){let row=map.get(key);if(!row){row=[];map.set(key,row);}row.push(hero);return row.length;}
 for(const hero of heroes){
  add(byColor,hero.color,hero);
  if(!hero.month){unscheduled.push(hero);continue;}
  const count=add(byMonthColor,hero.month+'|'+hero.color,hero);
  monthSpaces.set(hero.month,Math.max(monthSpaces.get(hero.month)||1,count));
  const revivalCount=add(byRevival,hero.month+'|'+hero.color+'|'+hero.category,hero),key=hero.month+'|'+hero.category;
  revivalSpaces.set(key,Math.max(revivalSpaces.get(key)||1,revivalCount));
 }
 return {byColor,byMonthColor,byRevival,monthSpaces,revivalSpaces,unscheduled};
}
