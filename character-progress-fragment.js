/* Changing the pictures is not a new assessment of an old successful board.
   Preserve access by board size, archive former results without relabeling
   them, and keep this migration local to the profile currently being read. */
const CHARACTER_MEMORY_REVISION='bluey-identical-v1';
const CHARACTER_WORD_MEMORY_REVISION='french-word-image-v1';
const LEGACY_MEMORY_PAIRS={memo:[2,3,4,6,8],memoG:[2,3,4,6,2,3,4,6,8]};
function characterProgressCopy(value){return JSON.parse(JSON.stringify(value));}
function characterProgressIndex(value,last){return Number.isFinite(Number(value))?clamp(Math.floor(Number(value)),0,last):0;}
function characterSizeIndex(levels,pairs){let found=0;for(let i=0;i<levels.length;i++)if(levels[i].pairs<=pairs)found=i;return found;}
function characterNewProgress(version,old,lvl=0,unlocked=0){return {...(old||{}),lvl,unlocked:Math.max(lvl,unlocked),best:{},rounds:0,low:0,contentVersion:version};}
function ensureCharacterProgress(p){
 if(!p||typeof p!=='object')return false;
 p.games=p.games||{};let changed=false;
 const oldGrand=p.games.memoG&&p.games.memoG.contentVersion!==CHARACTER_MEMORY_REVISION?characterProgressCopy(p.games.memoG):null;
 for(const gid of ['memo','memoG']){
  const old=p.games[gid],levels=GAMES[gid]?.levels;
  if(!levels?.length)continue;
  if(old?.contentVersion===CHARACTER_MEMORY_REVISION)continue;
  if(!old){p.games[gid]=characterNewProgress(CHARACTER_MEMORY_REVISION,null);changed=true;continue;}
  const counts=LEGACY_MEMORY_PAIRS[gid],active=characterProgressIndex(old.lvl,counts.length-1),open=Math.max(active,characterProgressIndex(old.unlocked,counts.length-1));
  const lvl=characterSizeIndex(levels,counts[active]),unlocked=characterSizeIndex(levels,Math.max(...counts.slice(0,open+1)));
  const archive={at:Date.now(),from:'legacy-pictures',to:CHARACTER_MEMORY_REVISION,game:gid,progress:characterProgressCopy(old)};
  if(p.resume?.kind==='game'&&p.resume.gid===gid){archive.resume=characterProgressCopy(p.resume);delete p.resume;}
  (p.characterMemoryArchive||(p.characterMemoryArchive=[])).push(archive);
  p.games[gid]=characterNewProgress(CHARACTER_MEMORY_REVISION,old,lvl,unlocked);changed=true;
 }
 const words=GAMES.memoMots?.levels,existing=p.games.memoMots;
 if(words?.length&&!existing){
  let active=0,open=0;
  if(oldGrand){const counts=LEGACY_MEMORY_PAIRS.memoG,oldActive=characterProgressIndex(oldGrand.lvl,counts.length-1),oldOpen=Math.max(oldActive,characterProgressIndex(oldGrand.unlocked,counts.length-1)),wordCounts=counts.slice(4,oldOpen+1);if(oldActive>=4)active=characterSizeIndex(words,counts[oldActive]);if(wordCounts.length)open=characterSizeIndex(words,Math.max(...wordCounts));}
  p.games.memoMots=characterNewProgress(CHARACTER_WORD_MEMORY_REVISION,null,active,open);changed=true;
 }
 /* A modern word-game record is already in its own namespace: preserve it.
    Old cloud imports may replace a memo record without its contentVersion;
    the per-game checks above deliberately still migrate that record later. */
 if(p.characterMemoryRevision!==CHARACTER_MEMORY_REVISION){p.characterMemoryRevision=CHARACTER_MEMORY_REVISION;changed=true;}
 return changed;
}
const progressBeforeCharacterMemory=P;
P=function(){const p=progressBeforeCharacterMemory();ensureCharacterProgress(p);return p;};
