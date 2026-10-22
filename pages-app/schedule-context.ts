export const scheduleViews=[['General','L/M/E Schedule'],['Remix','Remix Schedule'],['Monthly Revival','Monthly Legendary/Mythic Revival'],['Weekly Revivals','Weekly Revival'],['Forging Bonds Revival','New Heroes Revival'],['Hall of Forms Revival','Hall of Forms Revival'],['Refine Predictions','Refine Predictions'],['Schedule Under Consideration','Schedule Under Consideration']];
export const waitingViews=[['Waitlist','L/M/E Waitlist'],['DSH Waitlist','DSH Waitlist'],['NHR Waitlist','New Heroes Revival Waitlist'],['Remix Waitlist','Remix Waitlist']];
export function scheduleGuidance(view:string){
 if(view==='Schedule Under Consideration'||waitingViews.some(([key])=>key===view))return 'No confirmed dates. List order does not guarantee banner order.';
 if(view==='Refine Predictions')return 'Predictions are estimates. Announced and Released entries are confirmed.';
 if(view==='Weekly Revivals')return 'Dates follow the recorded rotation. Times are local; check in-game notices for changes.';
 if(view==='Monthly Revival')return 'Listed months may not have exact dates yet. Times are shown in your local timezone.';
 return 'Months show rerun windows. Check in-game notices for exact dates.';
}
export const uncertainExportNote='Rerun dates unconfirmed.';
