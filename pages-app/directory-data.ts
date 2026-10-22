export type DirectoryHero = {
 name:string;title:string;category:string;notes?:string;searchText?:string;
 color:string;weapon_type?:string|null;move_type?:string|null;blessing?:string|null;
 debut_version?:string|null;release_date?:string|null;schedule?:string;month?:string|null;
};
export const searchKey=(value:string)=>value.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[ðþæøœłß]/g,c=>({'ð':'d','þ':'th','æ':'ae','ø':'o','œ':'oe','ł':'l','ß':'ss'}[c]!)).replace(/[’‘]/g,"'");
export function directorySearchText(hero:DirectoryHero,pool:string){
 return searchKey([hero.name,hero.title,hero.category,hero.notes,hero.searchText,hero.color,hero.weapon_type,hero.move_type,hero.blessing,hero.debut_version,hero.release_date,pool].filter(Boolean).join(' '));
}
export function rerunMonth(hero:Pick<DirectoryHero,'schedule'|'month'>){
 if(!hero.schedule||hero.schedule==='None'||/Waitlist|Under Consideration/i.test(hero.schedule))return null;
 return hero.month&&/^\d{4}-(0[1-9]|1[0-2])$/.test(hero.month)?hero.month:null;
}
export function rerunLabel(hero:Pick<DirectoryHero,'schedule'|'month'>){
 if(/Waitlist|Under Consideration/i.test(hero.schedule||''))return 'Date not confirmed';
 return rerunMonth(hero)?null:'Not recorded';
}
export function compareRecorded(a:string|null|undefined,b:string|null|undefined,descending:boolean,compare:(a:string,b:string)=>number){
 if(!a||!b)return a?-1:b?1:0;
 return (descending?-1:1)*compare(a,b);
}
