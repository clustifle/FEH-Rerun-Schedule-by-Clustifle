// Hardware hints are optional; no user-agent matching or data leaves the device.
export function resourceBudget(){
 const memory=(navigator as Navigator&{deviceMemory?:number}).deviceMemory;
 const touch=matchMedia('(pointer:coarse)').matches;
 const limited=touch||(typeof memory==='number'&&memory<=4)||(navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=8);
 return {limited,batchSize:touch?48:limited?96:120};
}
export function applyResourceBudget(){
 document.documentElement.dataset.resourceBudget=resourceBudget().limited?'limited':'standard';
}
