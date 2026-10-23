/* Familiar characters are context, never a cue to a phoneme or number answer. */
const FAVORITE_CHARACTERS={
 petit:{name:'Petit Poilu',image:'assets/personnages/petit-poilu.png',label:'Petit Poilu écoute ton histoire'},
 barba:{name:'Barbapapa',image:'assets/personnages/barbapapa.png',label:'Les formes avec Barbapapa'},
 bluey:{name:'Bluey',letter:'B',label:'Le jeu des paires de Bluey'},
 peter:{name:'Peter Pan',letter:'P',label:'Le chemin de Peter Pan'}
};
const FAVORITE_ACTIVITIES={recit:'petit',recitP:'petit',formes:'barba',ombres:'barba',memo:'bluey',memoG:'bluey',robot:'peter'};
function favoriteGuide(key){const friend=FAVORITE_CHARACTERS[key];if(!friend)return null;const picture=friend.image?h('img',{src:friend.image,alt:friend.name,width:86,height:86,loading:'lazy'}):h('span',{class:'favorite-initial','aria-hidden':'true'},friend.letter);if(friend.image)picture.addEventListener('error',()=>picture.hidden=true);return h('aside',{class:'favorite-guide','aria-label':friend.label},picture,h('span',null,friend.label));}
const playBeforeFavorites=Engine.play.bind(Engine);
Engine.play=function(item,run){const friend=FAVORITE_ACTIVITIES[run.gid];if(!friend||run.exam)return playBeforeFavorites(item,run);const render=item.render,copy={...item,render(st,api){render(st,api);const guide=favoriteGuide(friend);if(guide&&!st.querySelector('.favorite-guide'))st.prepend(guide);}};return playBeforeFavorites(copy,run);};
for(const id of ['memo','memoG']){const before=GAMES[id].make;GAMES[id].make=function(ctx){const item=before(ctx);return {...item,say:['Bluey joue au jeu des paires avec toi.',item.say]};};}
const formsBeforeFavorite=GAMES.formes.make;
GAMES.formes.make=function(ctx){const item=formsBeforeFavorite(ctx);return {...item,say:['Barbapapa cherche la même forme que toi.',item.say]};};
const pathBeforeFavorite=GAMES.robot.make;
GAMES.robot.make=function(ctx){const item=pathBeforeFavorite(ctx),render=item.render;return {...item,say:'Guide Peter Pan. Touche la case voisine pour aller à la maison.',render(st,api){render(st,{...api,answer(ok,options={}){return api.answer(ok,{...options,praise:'Bravo, Peter Pan est arrivé !'});}});const grid=st.querySelector('.post-grid');if(!grid)return;st.querySelectorAll('.u-note').forEach(n=>{if(n.textContent.includes('🤖'))n.textContent='Peter Pan → maison';});const show=()=>Array.from(grid.children).forEach(b=>{const current=b.classList.contains('current');b.classList.toggle('favorite-pawn',current);if(current){b.textContent='P';b.setAttribute('aria-label','Peter Pan');}});show();Array.from(grid.children).forEach(b=>b.addEventListener('click',show));}};};
Object.assign(SIMPLE_GAME_NAMES,{robot:'Suivre Peter Pan',memo:'Les paires de Bluey',memoG:'Les paires de Bluey'});for(const id of ['robot','memo','memoG'])GAMES[id].title=SIMPLE_GAME_NAMES[id];
GAMES.robot.icon='🧭';GAMES.robot.sub='Suivre un chemin de case en case';GAMES.robot.levels.forEach(L=>L.name='Rejoindre la maison');
function favoriteVoiceLines(){return ['Bluey joue au jeu des paires avec toi.','Barbapapa cherche la même forme que toi.','Guide Peter Pan. Touche la case voisine pour aller à la maison.','Bravo, Peter Pan est arrivé !'];}
if(typeof document!=='undefined'&&document.head){const style=document.createElement('style');style.textContent=`.favorite-guide{display:flex;align-items:center;justify-content:center;gap:12px;flex:none;max-width:560px;padding:4px 14px;color:#5c5570;font:700 17px/1.3 var(--font-read)}.favorite-guide img{width:78px;height:78px;object-fit:contain;flex:none}.favorite-initial{display:grid;place-items:center;width:45px;height:45px;border-radius:50%;background:#e0edf9;color:#24517b;font-size:26px}.favorite-pawn{font-family:var(--font-read);font-weight:700;color:#23654b!important}.stage .favorite-guide+*{max-width:100%}.favorite-guide[hidden]{display:none}@media(max-width:600px){.favorite-guide{font-size:14px;padding:0 6px;gap:8px}.favorite-guide img{width:56px;height:56px}}`;document.head.append(style);}
