export const scheduleViews=[['General','L/M/E Schedule'],['Remix','Remix Schedule'],['Monthly Revival','Monthly Legendary/Mythic Revival'],['Weekly Revivals','Weekly Revival'],['Forging Bonds Revival','New Heroes Revival'],['Hall of Forms Revival','Hall of Forms Revival'],['Refine Predictions','Refine Predictions'],['Schedule Under Consideration','Schedule Under Consideration']];
export const waitingViews=[['Waitlist','L/M/E Waitlist'],['DSH Waitlist','DSH Waitlist'],['NHR Waitlist','New Heroes Revival Waitlist'],['Remix Waitlist','Remix Waitlist']];
export function scheduleGuidance(view:string){
 if(view==='Schedule Under Consideration'||waitingViews.some(([key])=>key===view))return 'Dates not confirmed. Placement here does not guarantee the next banner or rerun month.';
 if(view==='Refine Predictions')return 'Predictions are staff estimates. Only Announced and Released entries are confirmed; a passed prediction month does not confirm a refine.';
 if(view==='Weekly Revivals')return 'Recurring dates follow the recorded rotation. Check in-game announcements for changes; displayed times use your local timezone.';
 if(view==='Monthly Revival')return 'Month-only appearances have no confirmed start date. Exact dates and announcement links are shown when recorded; displayed times use your local timezone.';
 return 'A listed month is a rerun window, not an exact start date. Check in-game announcements for confirmed dates and changes.';
}
export const uncertainExportNote='Waitlists and entries under consideration: dates not confirmed.';
