export type SpecialRateRange={from:string;to:string;fromDate:string;toDate:string};
export type SpecialRateRanges={sr:SpecialRateRange;shsr:SpecialRateRange};
export const defaultSpecialRateRanges:SpecialRateRanges={sr:{from:'1.0',to:'8.7',fromDate:'2017-02-02',toDate:'2024-07-31'},shsr:{from:'1.0',to:'7.1',fromDate:'2017-02-02',toDate:'2023-01-31'}};
export function versionParts(value:string){const match=value.trim().match(/^v?(\d{1,2})\.(\d{1,2})(?:\.\d+)?$/i);return match&&Number(match[1])>=1?[Number(match[1]),Number(match[2])]:null;}
export function compareVersions(a:string,b:string){const x=versionParts(a),y=versionParts(b);if(!x||!y)throw Error('Use a version such as 8.7.');return x[0]-y[0]||x[1]-y[1];}
export function validateSpecialRateRanges(input:unknown):SpecialRateRanges{
 const result={} as SpecialRateRanges;
 for(const key of ['sr','shsr'] as const){
  const range=(input as SpecialRateRanges)?.[key];
  if(!range||typeof range.from!=='string'||typeof range.to!=='string'||!/^\d{1,2}\.(0|[1-9]\d?)$/.test(range.from)||!/^\d{1,2}\.(0|[1-9]\d?)$/.test(range.to)||compareVersions(range.from,range.to)>0)throw Error('Enter a valid version range with the first version no later than the last.');
  for(const date of [range.fromDate,range.toDate])if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)throw Error('Enter valid fallback release dates.');
  if(range.fromDate>range.toDate)throw Error('The fallback start date must be no later than the end date.');
  result[key]={from:range.from,to:range.to,fromDate:range.fromDate,toDate:range.toDate};
 }
 return result;
}
export function inSpecialRateRange(hero:{debut_version?:string|null;release_date?:string|null},range:SpecialRateRange){
 const version=hero.debut_version&&versionParts(hero.debut_version);
 if(version)return compareVersions(hero.debut_version!,range.from)>=0&&compareVersions(hero.debut_version!,range.to)<=0;
 return !!hero.release_date&&/^\d{4}-\d{2}-\d{2}$/.test(hero.release_date)&&hero.release_date>=range.fromDate&&hero.release_date<=range.toDate;
}
