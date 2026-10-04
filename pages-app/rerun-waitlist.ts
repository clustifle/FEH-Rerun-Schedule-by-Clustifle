export type RerunBanner={banner_type?:string;name:string;tracker_banner_heroes:{hero_id:string}[]};
const rerunTypes=new Set(['Duo','Harmonized','Rearmed','Attuned','Aided','Entwined','Vista','Special','General']);

export function listedRerunHeroes(banners:RerunBanner[]){
 const ids=new Set<string>();
 for(const banner of banners){
  const layout=banner.banner_type||(/new heroes (?:return|revival)|double special heroes/i.test(banner.name)?'revival':/new heroes|special heroes/i.test(banner.name)?'featured':'lme');
  // Keep completed reruns out of Waitlist too, until their lineup is edited.
  if(layout==='lme'||layout==='revival')for(const hero of banner.tracker_banner_heroes)ids.add(hero.hero_id);
 }
 return ids;
}

export function hiddenFromWaitlist(hero:{id:string;category:string},listed:Set<string>){
 return rerunTypes.has(hero.category)&&listed.has(hero.id);
}
