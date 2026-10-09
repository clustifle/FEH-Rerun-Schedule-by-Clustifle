export const waitlistViews=['Waitlist','DSH Waitlist','NHR Waitlist','Remix Waitlist'] as const;
export type WaitlistKind='lme'|'dsh'|'nhr'|'remix';
export const isWaitlist=(view:string)=>waitlistViews.includes(view as typeof waitlistViews[number]);
export const waitlistKind=(view:string):WaitlistKind=>view==='Remix Waitlist'?'remix':view==='DSH Waitlist'?'dsh':view==='NHR Waitlist'?'nhr':'lme';
export const waitlistLabel=(view:string)=>view==='Remix Waitlist'?'Remix Waitlist':view==='DSH Waitlist'?'DSH Waitlist':view==='NHR Waitlist'?'NHR Waitlist':'L/M/E Waitlist';
export const waitlistTitle=(view:string)=>view==='Remix Waitlist'?'Remix Waitlist':view==='DSH Waitlist'?'Double Special Heroes Waitlist':view==='NHR Waitlist'?'New Heroes Return Waitlist':'L/M/E Waitlist';
export const remixWaitlistEligible=(hero:{pool:string|null})=>hero.pool==='General Pool'||hero.pool==='Non-Seasonal Limited';
export const waitlistTable=(kind:WaitlistKind)=>kind==='lme'?'tracker_waitlist':'tracker_extended_waitlist';
