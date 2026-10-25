/* Liste les phrases des compléments « école » absentes de la banque Charline.
   Source seulement : aucun navigateur, aucun profil, aucune donnée d’enfant.
   Sortie : audit-voix/phrases-ecole.json (déclenche la génération sur GitHub). */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {loadApp}=require('../tests/helpers/render-fixture.cjs');
const {speechSegments}=require('../speech-engine.js');
const root=path.join(__dirname,'..');
const {ctx}=loadApp({Blob,URL,AbortController,setTimeout:()=>0,clearTimeout(){}});
const lines=vm.runInContext('ecoleParcoursVoiceLines()',ctx);
const keyNorm=t=>String(t).normalize('NFC').replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim().replace(/[.!?…:]+$/,'').trim().toLocaleLowerCase('fr');
const bank=JSON.parse(fs.readFileSync(path.join(root,'voix/index-belge.json'),'utf8'));
const known=new Set(Object.keys(bank.clips).filter(k=>/^[nms]\|/.test(k)).map(k=>keyNorm(k.slice(2))));
const segments=[...new Set(lines.flatMap(t=>speechSegments(t).map(s=>s.t)))];
const missing=segments.filter(s=>!known.has(keyNorm(s))).sort((a,b)=>a.localeCompare(b,'fr'));
fs.writeFileSync(path.join(root,'audit-voix/phrases-ecole.json'),JSON.stringify(missing,null,1)+'\n');
console.log(JSON.stringify({lines:lines.length,segments:segments.length,missing:missing.length,sample:missing.slice(0,12)},null,1));
