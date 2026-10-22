/* Source-only inventory. No browser, network, real profile or rendering. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const source=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n').replace(/\bboot\(\);\s*$/,'');
const fakeElement=()=>({style:{setProperty(){}},classList:{add(){},remove(){}},append(){},setAttribute(){},addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null});
const ctx=vm.createContext({console,Blob,URL,AbortController,setTimeout,clearTimeout,window:{CSS:{supports:()=>true},addEventListener(){}},CSS:{supports:()=>true},document:{createElement:fakeElement,createTextNode:t=>({textContent:t}),body:fakeElement(),addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null},LumiSpeech:require('../speech-engine.js')});
vm.runInContext(source,ctx,{timeout:3000});
const lines=vm.runInContext('maisonVoiceLines()',ctx,{timeout:3000});
for(const m of source.matchAll(/Voice\.say\((['"])((?:\\.|(?!\1).)*)\1/g))lines.push(m[2]);
lines.push('Bonjour ! Je suis Lumi.','Écoute le son','comme dans loup.','Je parle doucement, avec des pauses. À toi de jouer !');
const segments=require('../speech-engine.js').speechSegments;
const keys=[...new Set(lines.flatMap(t=>segments(t).map(s=>'n|'+s.t)))].sort();
const old=JSON.parse(fs.readFileSync(path.join(root,'voix/index.json'),'utf8'));
const norm=t=>t.replaceAll('’',"'").replace(/[.!?…:]+$/,'').trim();
const known=new Set(Object.keys(old.clips).map(norm));
const missing=keys.filter(k=>!known.has(norm(k)));
fs.mkdirSync(path.join(root,'.audio-build'),{recursive:true});
fs.writeFileSync(path.join(root,'.audio-build/additional-lines.json'),JSON.stringify(missing,null,2));
fs.mkdirSync(path.join(root,'audit-voix'),{recursive:true});
fs.writeFileSync(path.join(root,'audit-voix/phrases-ajoutees.json'),JSON.stringify(missing,null,2));
const cIPA={l:'l',r:'ʁ',m:'m',s:'s',f:'f',ch:'ʃ',v:'v',n:'n',j:'ʒ',p:'p',t:'t',d:'d',b:'b',k:'k',g:'ɡ'};
const vIPA={a:'a',i:'i',o:'o',u:'y','é':'e',e:'ə',ou:'u',on:'ɔ̃',an:'ɑ̃',oi:'wa',in:'ɛ̃','è':'ɛ',eu:'ø'};
const syllables=vm.runInContext('allSyl(LESSONS.length-1).map(s=>({...s,spoken:spokenSyl(s.w)}))',ctx);
const phonetics={};
for(const s of syllables){const ph=cIPA[s.c]+vIPA[s.v];if(phonetics[s.spoken]&&phonetics[s.spoken]!==ph)throw Error('Conflicting syllable: '+s.w);phonetics[s.spoken]=ph;}
fs.writeFileSync(path.join(root,'audit-voix/syllabes-phonetics.json'),JSON.stringify(phonetics,null,2));
console.log(JSON.stringify({inventoried:keys.length,additional:missing.length,sample:missing.slice(0,20)},null,2));
