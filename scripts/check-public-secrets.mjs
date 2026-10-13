import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
// Print filenames and categories only; never echo a detected credential.
export function credentialKinds(text){
 const kinds=[];
 if(/\bsb_secret_[A-Za-z0-9_-]{20,}\b/.test(text))kinds.push('Supabase secret');
 if(/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/.test(text))kinds.push('GitHub access token');
 if(/-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/.test(text))kinds.push('private key');
 for(const token of text.match(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g)||[]){
  try{if(JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString()).role==='service_role')kinds.push('Supabase service-role token');}catch{}
 }
 return [...new Set(kinds)];
}
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const findings=[];
for(const file of files){
 if(/(?:^|\/)\.dev\.vars(?:\.|$)/.test(file)||/(?:^|\/)\.env(?:\.|$)/.test(file)&&!/\.(?:example|sample)$/.test(file))findings.push(file+': local environment file');
 const bytes=readFileSync(file);if(bytes.includes(0))continue;
 const kinds=credentialKinds(bytes.toString('utf8'));if(kinds.length)findings.push(file+': '+kinds.join(', '));
}
if(findings.length){console.error('Possible committed credentials:\n'+findings.join('\n'));process.exitCode=1;}
else console.log('Tracked files contain no recognized private keys, Supabase secret/service-role keys, or GitHub access tokens.');
