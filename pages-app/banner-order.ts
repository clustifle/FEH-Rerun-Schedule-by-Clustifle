export function moveBanner<T extends {id:string}>(rows:T[],id:string,to:number):T[]{
 const from=rows.findIndex(row=>row.id===id);
 if(from<0||!Number.isInteger(to)||to<0||to>=rows.length||from===to)return rows;
 const next=[...rows];next.splice(to,0,next.splice(from,1)[0]);return next;
}
