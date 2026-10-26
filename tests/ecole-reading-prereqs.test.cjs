/* Meaningful prerequisite boundaries: a high menu unlock is not a sound learnt,
   and a new spelling never licenses unrelated untaught spellings in its words. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {loadApp}=require('./helpers/render-fixture.cjs');
const {ctx}=loadApp({Blob,URL,AbortController,setTimeout:()=>0,clearTimeout(){}});
const run=code=>vm.runInContext(code,ctx);
run(`save=()=>{};Voice.stop=()=>{};Voice.say=()=>Promise.resolve();Sfx.play=()=>{};S=defState();S.current='luca';
 function profile(keys=[]){return {lecture:{unlocked:27,pass:Object.fromEntries(keys.map(k=>[LIDX[k],{at:1,score:6}]))},games:{},evidence:{}};}
 var fresh=profile(),all=profile(LESSONS.map(L=>L.k));
`);
assert.equal(run(`ecoleReadingAccess('phraseOrdre',fresh,0).ready`),false,'unlocked=27 without independent records does not open autonomous phrases');
assert.equal(run(`ecoleReadingAccess('lettresMiroir',fresh,0).ready`),true,'visual same/different stays freely available');
assert.equal(run(`ecoleReadingAccess('lettresMiroir',fresh,1).ready`),false,'word-context b/d requires b and d');
assert.equal(run(`ecoleReadingAccess('lettresMiroir',profile(['b','d']),1).ready`),true);
assert.equal(run(`ecoleReadingAccess('lettresMiroir',profile(['p','k']),3).ready`),true);
assert.equal(run(`ecoleReadingAccess('phraseOrdre',profile(LESSONS.slice(0,13).map(L=>L.k)),0).ready`),true,'a simple sentence opens before the whole alphabet');
assert.equal(run(`ecoleWordReady('lait',all)`),true,'ai is already explicitly present in the base è lesson');
assert.equal(run(`ecoleWordReady('bateau',all)`),false,'all base sounds do not silently teach eau');
assert.equal(run(`ecoleWordReady('bateau',all,{family:'au'})`),true,'the spelling currently being taught can be practised');
assert.equal(run(`ecoleWordReady('oiseau',all,{family:'au'})`),false,'the same exercise cannot smuggle the untaught s=/z/ spelling');
assert.equal(run(`ecoleWordReady('neige',all,{family:'ai'})`),false,'ei practice cannot smuggle soft g');
assert.equal(run(`ecoleWordReady('panier',all,{family:'er'})`),false,'unmodelled i glide is not called fully decodable');
assert(run(`ecoleReadingAccess('graphies',profile(['é','n']),2).missing.length>0`),'a two-choice exercise explains what the second word still requires');
assert.equal(run(`ecoleWordReady('abeille',all,{family:'ill'})`),false,'eill is not treated as the already explained fille pattern');
assert.equal(run(`ecoleWordReady('un',all)`),false,'Belgian un is not silently equated with in');
assert.equal(run(`ecoleReadingKnown({...all,evidence:{'ecole:graphie:au:lecture':{alone:0,aided:8,seen:['a','b']}}}).families.has('au')`),false);
assert.equal(run(`ecoleReadingKnown({...all,evidence:{'ecole:graphie:au:lecture':{alone:2,seen:['bateau','chapeau']}}}).families.has('au')`),true);
assert.equal(run(`ecoleReadingKnown({...all,evidence:{'ecole:graphie:au:lecture':{alone:2,seen:['bateau']}}}).families.has('au')`),false,'one repeated example is not enough');
assert.equal(run(`ecoleReadingAccess('graphies',{...fresh,familyAccess:{graphies:1}},0).training`),true,'parent opening is an assisted training route');
assert.equal(run(`ecoleReadingAccess('phraseOrdre',{...fresh,demo:true},3).ready`),true,'Admin retains all content');
run(`var legacyReaderBeforeTest=typeof curriculumLegacyGameLevel==='function'?curriculumLegacyGameLevel:null;
 curriculumLegacyGameLevel=(gid,p)=>Number.isInteger(p.legacySnapshot?.[gid])?p.legacySnapshot[gid]:-1;
 var historical={...fresh,legacySnapshot:{graphies:1}};
`);
assert.equal(run(`ecoleReadingAccess('graphies',historical,0).ready`),true,'historically open levels retain access');
assert.equal(run(`ecoleReadingAccess('graphies',historical,1).training`),true,'historical access without sounds stays assisted');
assert.equal(run(`ecoleReadingAccess('graphies',historical,1).parent`),false,'historical access does not invent a parent decision');
assert.equal(run(`ecoleReadingAccess('graphies',historical,2).ready`),false,'a historical maximum never opens a later level');
assert.equal(run(`ecoleReadingAccess('phraseOrdre',historical,0).ready`),false,'historical access is specific to its activity');
assert.equal(run(`ecoleReadingAccess('graphies',{...fresh,games:{graphies:{rounds:100,unlocked:9,best:{0:3}}}},2).ready`),false,'playing an earlier game does not dynamically expand the snapshot');
run(`curriculumLegacyGameLevel=legacyReaderBeforeTest;`);
run(`
 for(let i=0;i<4;i++)for(const s of ecolePhrasePool(i,all))if(!s.words.every(w=>ecoleWordReady(w,all)))throw Error('Premature phrase '+s.s);
 for(const f of ECOLE_GRAPH_FAMILIES){const pool=ecoleGraphPool(f,all);if(pool.length<2)throw Error('No playable normal pool '+f.id);for(const w of pool)if(!ecoleWordReady(w.w,all,{family:f.id}))throw Error('Premature graphie '+w.w);}
 var before=JSON.stringify(all);ecoleReadingAccess('graphies',all,0);ecolePhrasePool(0,all);if(JSON.stringify(all)!==before)throw Error('Pure access mutated profile');
 P().demo=true;var bag={},used=[],shown=[];
 for(let i=0;i<5;i++){var item=GAMES.graphies.make({g:GAMES.graphies,L:GAMES.graphies.levels[0],li:0,i,n:6,bag,used});if(item.exemplar.startsWith('graphie-lecture:'))shown.push(item.exemplar.slice(16));if(i===0&&!item.helped)throw Error('Spoken rule not marked guided');}
 var last=GAMES.graphies.make({g:GAMES.graphies,L:GAMES.graphies.levels[0],li:0,i:5,n:6,bag,used});
 if(!last.exemplar.startsWith('graphie-complete:')||!shown.includes(last.exemplar.slice(17)))throw Error('Completion word was never shown');
 var grammar=GAMES.petitsMots.make({g:GAMES.petitsMots,L:GAMES.petitsMots.levels[0],li:0,i:0,n:6,bag:{},used:[]});
 if(!grammar.evidenceKey.startsWith('oral:'))throw Error('Oral grammar presented as decoding');
`);
const norm=t=>String(t).normalize('NFC').replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim().replace(/[.!?…:]+$/,'').trim().toLocaleLowerCase('fr');
const bank=JSON.parse(fs.readFileSync(path.join(__dirname,'../voix/index-belge.json'),'utf8'));
const keys=new Set(Object.keys(bank.clips).map(k=>norm(k.slice(k.indexOf('|')+1))));
for(const text of ['un','une','le','la','Il chante.','Elle chante.','Lola a la pomme.','Milo a la pomme.','Lola a la tulipe.','Milo a la tulipe.'])assert(keys.has(norm(text)),'Reused audio must already exist: '+text);
console.log('Lecture école : prérequis par niveau, corpus bornés, exceptions non devinées, guidage distinct, mots déjà vus, accès adulte et réemploi audio vérifiés.');
