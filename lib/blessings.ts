export const blessingsFor=(category:string):string[]=>category==='Mythic'?['Anima','Astra','Light','Dark']:['Legendary','Chosen Hero'].includes(category)?['Wind','Earth','Fire','Water']:[];
