const uuid=/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const weapons={Red:['Sword','Beast','Bow','Breath','Dagger','Tome'],Blue:['Lance','Beast','Bow','Breath','Dagger','Tome'],Green:['Axe','Beast','Bow','Breath','Dagger','Tome'],Colorless:['Staff','Beast','Bow','Breath','Dagger','Tome']};
const schedules=['None','General','Remix','Monthly Revival','Forging Bonds Revival','Hall of Forms Revival','Waitlist','DSH Waitlist','NHR Waitlist','Remix Waitlist'];
export function validateHero(hero,versions){
 if(!uuid.test(hero.id)||!hero.name?.trim()||hero.name.length>100)throw Error('A valid hero name and ID are required.');
 for(const [key,max] of [['title',150],['category',80],['pool',80],['notes',2000],['release_event',200]])if(hero[key]!=null&&(typeof hero[key]!=='string'||hero[key].length>max))throw Error('Invalid '+key+'.');
 if(typeof hero.category!=='string'||!hero.category.trim())throw Error('Choose a hero type.');
 if(typeof hero.color!=='string'||!weapons[hero.color])throw Error('Choose a valid weapon color.');
 if(hero.weapon_type&&!weapons[hero.color].includes(hero.weapon_type))throw Error('Weapon type does not match the selected color.');
 if(hero.move_type&&!['Fliers','Armored','Cavalry','Infantry'].includes(hero.move_type))throw Error('Choose a valid movement type.');
 if(!schedules.includes(hero.schedule))throw Error('Choose a valid schedule.');
 if(hero.schedule==='None'||hero.schedule.includes('Waitlist')||hero.schedule==='Waitlist')hero.month=null;
 if(hero.month&&(typeof hero.month!=='string'||!/^\d{4}-(0[1-9]|1[0-2])(?:-01)?$/.test(hero.month)))throw Error('Choose a valid rerun month.');
 if(hero.debut_version&&!versions.includes(hero.debut_version))throw Error('The debut version must exist in Versions.');
 if(hero.release_date&&(!/^\d{4}-\d{2}-\d{2}$/.test(hero.release_date)||new Date(hero.release_date).toISOString().slice(0,10)!==hero.release_date))throw Error('Choose a valid release date.');
 if(hero.schedule==='Remix Waitlist'&&!['General Pool','Non-Seasonal Limited'].includes(hero.pool))throw Error('Remix Waitlist requires General Pool or Non-Seasonal Limited.');
 for(const k of ['demote','heroic_grail'])if(typeof hero[k]!=='boolean')throw Error('Invalid '+k+'.');
 if(hero.blessing&&!['Legendary','Mythic','Chosen Hero'].includes(hero.category))hero.blessing=null;
 const blessings=hero.category==='Mythic'?['Anima','Astra','Light','Dark']:['Legendary','Chosen Hero'].includes(hero.category)?['Wind','Earth','Fire','Water']:[];
 if(blessings.length&&!hero.blessing)throw Error('A blessing is required for Legendary, Mythic and Chosen heroes.');
 if(hero.blessing&&!blessings.includes(hero.blessing))throw Error('Blessing does not match this hero type.');
 if(hero.schedule==='Monthly Revival'&&!['Legendary','Mythic'].includes(hero.category))throw Error('Monthly Revival requires a Legendary or Mythic hero.');
 return hero;
}
