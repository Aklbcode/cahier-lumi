/* Local parent demonstration profile. Access is distinct from learning evidence. */
const ADMIN_PROFILE_ID='admin';
KIDS_DEF.admin={...KIDS_DEF.luca,id:'admin',name:'Admin',world:'grands',top:'#6c5a82',topS:'#524363'};
function ensureAdminProfile(state){
 state.profiles=Array.isArray(state.profiles)?state.profiles:[];
 const existing=state.profiles.find(p=>p.id===ADMIN_PROFILE_ID);
 if(existing){existing.name='Admin';existing.world=existing.world==='petits'?'petits':'grands';existing.localOnly=true;}
 else state.profiles.push({id:ADMIN_PROFILE_ID,name:'Admin',world:'grands',localOnly:true});
 return state;
}
function isAdminProfile(){return S.current===ADMIN_PROFILE_ID;}
function adminReturnId(state=S){return ['luca','lola'].includes(state.adminReturnTo)?state.adminReturnTo:'luca';}
const defStateBeforeAdmin=defState;
defState=function(){return ensureAdminProfile(defStateBeforeAdmin());};
const migrateBeforeAdmin=migrate;
migrate=function(input){
 /* The legacy migration searches for unnamed old child profiles: never let it
    mistake demonstration records for Luca's historical progress. */
 const adminProgress=input.progress&&input.progress.admin;
 const adminWorld=(input.profiles||[]).find(p=>p.id==='admin')?.world;
 const incomingAdmin=input.current==='admin';
 input.profiles=(input.profiles||[]).filter(p=>p.id!=='admin');
 if(incomingAdmin)input.current=adminReturnId(input);
 const state=ensureAdminProfile(migrateBeforeAdmin(input));
 if(adminProgress)state.progress.admin=adminProgress;
 state.profiles.find(p=>p.id==='admin').world=adminWorld==='petits'?'petits':'grands';
 if(incomingAdmin){state.current=adminReturnId(state);state.world=state.profiles.find(p=>p.id===state.current).world;}
 return state;
};
function prepareAdminProgress(p){
 p.demo=true;p.games=p.games||{};p.skills=p.skills||{};
 p.lecture=p.lecture||{unlocked:0,done:{},gp:{},pass:{}};
 p.lecture.unlocked=LESSONS.length-1;
 p.lecture.done=p.lecture.done||{};p.lecture.gp=p.lecture.gp||{};p.lecture.pass=p.lecture.pass||{};
 p.calcul=p.calcul||{mods:{}};p.calcul.mods=p.calcul.mods||{};p.calcul.open=MODS.length-1;
 MODS.forEach(M=>{const mp=p.calcul.mods[M.id]||(p.calcul.mods[M.id]={done:{},pass:{}});mp.done=mp.done||{};mp.pass=mp.pass||{};mp.parentStart=M.levels.length-1;});
 Object.entries(GAMES).forEach(([id,g])=>{if(!g.levels?.length)return;const gp=p.games[id]||(p.games[id]={lvl:0,unlocked:0,best:{},rounds:0,low:0});gp.unlocked=g.levels.length-1;gp.lvl=clamp(gp.lvl||0,0,g.levels.length-1);});
 p.rewards=p.rewards||{v:2,stars:0,unlocked:[]};p.rewards.v=2;
 p.rewards.unlocked=TREASURE_ORDER.map(i=>'objet-'+i);
 return p;
}
const progressBeforeAdmin=P;
P=function(){const p=progressBeforeAdmin();return isAdminProfile()?prepareAdminProgress(p):p;};
function activateAdminProfile(){
 if(['luca','lola'].includes(S.current))S.adminReturnTo=S.current;
 ensureAdminProfile(S);Voice.stop();if(RUN)RUN.abort=true;RUN=null;
 if(Shell.isOpen())Shell.close();
 $$('.parent,.who-screen,.modal').forEach(el=>el.remove());
 S.current='admin';S.world=prof().world;P();HOME_THEME=null;
 const app=$('#app');if(app)app.inert=false;
 save();renderHome(null);
}
function openAdminProfile(){parentGate(activateAdminProfile,'Profil Admin · parents');}
function leaveAdminProfile(id=adminReturnId()){
 if(!['luca','lola'].includes(id))id=adminReturnId();
 Voice.stop();if(RUN)RUN.abort=true;RUN=null;
 if(Shell.isOpen())Shell.close();
 $$('.parent,.who-screen,.modal').forEach(el=>el.remove());
 S.current=id;S.world=prof().world;S.adminReturnTo=id;HOME_THEME=null;
 const app=$('#app');if(app)app.inert=false;
 save();renderHome(null);
}
function adminParentCard(){
 return h('div',{class:'pcard admin-parent-card','aria-label':'Profil Admin local'},h('h3',null,'Profil Admin'),
  h('p',null,'Pour les adultes : essayez toutes les activités et tous les objets. Les essais utilisent une progression séparée sur cet appareil, sans modifier celle de Luca ou de Lola.'),
  h('p',null,'Ce profil de démonstration est protégé par l’accès parents. Il ne constitue pas un compte administrateur en ligne.'),
  onTap(h('button',{class:'pbtn pri'},'Ouvrir Admin · tout débloqué'),activateAdminProfile));
}
const parentAreaBeforeAdmin=parentArea;
parentArea=function(){parentAreaBeforeAdmin();const wrap=$('.parent .wrap');if(wrap&&!$('.admin-parent-card',wrap))wrap.insertBefore(adminParentCard(),wrap.children[1]||null);};
const homeBeforeAdmin=renderHome;
renderHome=function(theme=HOME_THEME){
 homeBeforeAdmin(theme);if(!isAdminProfile())return;
 const app=$('#app');if(!app)return;
 const previous=$('.admin-demo-banner',app);if(previous)previous.remove();
 const controls=h('div',{class:'prow'},
  onTap(h('button',{class:'pbtn'+(S.world==='grands'?' pri':'')},'Activités 5/6 ans'),()=>{prof().world='grands';S.world='grands';HOME_THEME=null;save();renderHome(null);}),
  onTap(h('button',{class:'pbtn'+(S.world==='petits'?' pri':'')},'Activités 3 ans'),()=>{prof().world='petits';S.world='petits';HOME_THEME=null;save();renderHome(null);}),
  onTap(h('button',{class:'pbtn'},'Retour à Luca'),()=>leaveAdminProfile('luca')),
  onTap(h('button',{class:'pbtn'},'Retour à Lola'),()=>leaveAdminProfile('lola')));
 const banner=h('section',{class:'pcard admin-demo-banner','aria-label':'Démonstration Admin'},h('b',null,'Admin · démonstration locale · tout débloqué'),h('p',null,'Les essais sont séparés des progrès des enfants.'),controls);
 app.insertBefore(banner,app.firstChild);
};
const whoScreenBeforeAdmin=whoScreen;
whoScreen=function(first,only){
 /* Admin never appears on the children's chooser or opens automatically. */
 if(isAdminProfile()){S.current=adminReturnId();S.world=prof().world;HOME_THEME=null;renderHome(null);}
 return whoScreenBeforeAdmin(first,['luca','lola'].includes(only)?only:null);
};
