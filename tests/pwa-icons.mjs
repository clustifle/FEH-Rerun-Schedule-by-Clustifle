import assert from 'node:assert/strict';
import fs from 'node:fs';

const manifest=JSON.parse(fs.readFileSync('public/manifest.webmanifest','utf8'));
assert.deepEqual(manifest.icons.map(icon=>[icon.sizes,icon.purpose]),[
 ['192x192','any'],
 ['512x512','any'],
 ['512x512','maskable'],
]);

function dimensions(path){
 const image=fs.readFileSync(path);
 assert.equal(image.toString('ascii',1,4),'PNG',`${path} is a PNG`);
 return [image.readUInt32BE(16),image.readUInt32BE(20)];
}

for(const icon of manifest.icons){
 const size=Number(icon.sizes.split('x')[0]);
 assert.deepEqual(dimensions(`public/${icon.src}`),[size,size]);
}
assert.deepEqual(dimensions('public/feh-tab-symbol.png'),[192,192]);
assert.deepEqual(dimensions('public/icons/app-180.png'),[180,180]);

const html=fs.readFileSync('index.html','utf8');
assert.match(html,/<link rel="icon" type="image\/png" sizes="192x192" href="%BASE_URL%feh-tab-symbol\.png"\/>/);
assert.match(html,/<link rel="apple-touch-icon" href="%BASE_URL%icons\/app-180\.png"\/>/);

const serviceWorker=fs.readFileSync('public/sw.js','utf8');
assert.match(serviceWorker,/feh-rerun-static-v2/);
assert.match(serviceWorker,/icons\/app-512-maskable\.png/);

console.log('Passed: PWA icon purposes, image dimensions, favicon, Apple touch icon, and service-worker cache.');
