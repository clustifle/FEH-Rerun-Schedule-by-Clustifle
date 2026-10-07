export const waitlistViews=['Waitlist','DSH Waitlist','NHR Waitlist'] as const;
export type WaitlistKind='lme'|'dsh'|'nhr';
export const isWaitlist=(view:string)=>waitlistViews.includes(view as typeof waitlistViews[number]);
export const waitlistKind=(view:string):WaitlistKind=>view==='DSH Waitlist'?'dsh':view==='NHR Waitlist'?'nhr':'lme';
export const waitlistLabel=(view:string)=>view==='DSH Waitlist'?'DSH Waitlist':view==='NHR Waitlist'?'NHR Waitlist':'L/M/E Waitlist';
export const waitlistTitle=(view:string)=>view==='DSH Waitlist'?'Double Special Heroes Waitlist':view==='NHR Waitlist'?'New Heroes Return Waitlist':'L/M/E Waitlist';
export const waitlistTable=(kind:WaitlistKind)=>kind==='lme'?'tracker_waitlist':'tracker_extended_waitlist';
