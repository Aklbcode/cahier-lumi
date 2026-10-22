/* Lumi speech v3. Natural Belgian French; explicit, recording-only teaching sounds. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LumiSpeech = api;
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';
  const clamp = (n, a, b) => Math.min(b, Math.max(a, Number(n) || a));
  const norm = t => String(t == null ? '' : t).normalize('NFC').replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
  const keyNorm = t => norm(t).replace(/[.!?…:]+$/,'').trim();
  const speechBucket = r => r == null || r >= .9 ? 'n' : r >= .78 ? 'm' : 's';
  function speechSegments(text) {
    const out = []; let cur = ''; const t = String(text).replace(/\s+/g, ' ').trim();
    const push = () => { const raw = cur.trim(); cur = ''; if (!raw) return; const end = raw[raw.length-1]; const v = raw.replace(/\.+$/, '').trim(); if (v && !/^[\s.!?…,;:]+$/.test(v)) out.push({t:v, end}); };
    for (let i=0;i<t.length;i++) { cur += t[i]; if ('.!?…:'.includes(t[i]) && t[i+1] === ' ') { push(); i++; } }
    push(); return out;
  }
  function speechJoin(parts) {
    const out = []; let cur = null;
    const flush = () => { if (cur) { cur.t = cur.t.replace(/\s+/g,' ').replace(/\s+([,.…])/g,'$1').replace(/([!?:])(?=[^\s])/g,'$1 ').trim(); if (cur.t) out.push(cur); } cur = null; };
    for (const p of (Array.isArray(parts) ? parts.flat(3) : [parts])) {
      if (p == null || p === '') continue;
      if (typeof p === 'number') { flush(); out.push(clamp(p,0,10000)); continue; }
      const o = typeof p === 'object' ? p : {t:p}; const t = String(o.t == null ? '' : o.t), r = o.rate || 1;
      // Sound identities survive joining: /a/ is a sound, never a sentence's
      // letter name, and "me" as a syllable is separate from ordinary prose.
      if (o.phoneme || o.syllable) { flush(); out.push({...o,t,rate:r}); continue; }
      if (cur && cur.rate === r) cur.t += ' '+t; else { flush(); cur = {t,rate:r}; }
    }
    flush(); return out;
  }
  function create(adapters = {}) {
    const env = adapters.env || rootEnvironment();
    const settings = adapters.settings || (() => ({}));
    const state = (status, text = '') => { Voice.status=status; Voice.text=text; if (adapters.onState) adapters.onState({status,text,mode:Voice.mode}); };
    const VoicePack = {
      base:'voix/', revision:'20261022-concret-1', idx:null, packs:[], order:{}, scopes:{}, loading:{}, packAge:new Map(), urls:new Map(), hits:0, misses:new Set(), label:'', ready:null,
      init() {
        if (this.ready) return this.ready;
        this.ready = (async () => {
          try {
            const r = await env.fetch(this.base+'index-belge.json?v='+this.revision); if (!r.ok) return;
            const j = await r.json(); if (![2,3].includes(j.v) || !j.clips || !Array.isArray(j.packs)) return;
            this.idx=j.clips; this.packs=j.packs; this.order=j.order||{}; this.scopes=j.scopes||{}; this.label=j.voice;
            this.normal = new Map(Object.keys(this.idx).map(k => [keyNorm(k), k]));
            this.byText = new Map(Object.keys(this.idx).filter(k=>/^[nms]\|/.test(k)).map(k=>[keyNorm(k.slice(2)).toLocaleLowerCase('fr'),k]));
            // Only prime the first UI pack. Requested speech always gets priority.
            const first=(this.scopes.ui||[])[0]; if (first != null) this.loadPack(first);
          } catch (_) { this.idx=null; }
          finally { if (!this.idx) this.ready=null; }
        })(); return this.ready;
      },
      usable() { return !!this.idx; },
      key(t, rate, unit={}) {
        if (unit.phoneme || unit.syllable) {
          const id=(unit.phoneme?'ph|':'sy|')+(unit.phoneme||unit.syllable);
          return this.idx && this.idx[id] ? id : null;
        }
        const bucket=speechBucket(rate), raw=bucket+'|'+t;
        if (this.idx && this.idx[raw]) return raw;
        return this.normal && this.normal.get(keyNorm(raw)) || this.byText && this.byText.get(keyNorm(t).toLocaleLowerCase('fr'));
      },
      loadPack(i) {
        if (this.packAge.has(i)) { this.packAge.delete(i); this.packAge.set(i,true); }
        if (!this.loading[i]) this.loading[i] = (async () => {
          const ctrl = typeof env.AbortController === 'function' ? new env.AbortController() : null;
          const timer = env.setTimeout(() => { if (ctrl) ctrl.abort(); },15000);
          try { const r = await env.fetch(this.base+this.packs[i]+'?v='+this.revision,ctrl ? {signal:ctrl.signal} : {}); if (!r.ok) throw Error('audio'); const ab=await r.arrayBuffer(); this.packAge.set(i,true); while(this.packAge.size>8){const old=this.packAge.keys().next().value;this.packAge.delete(old);delete this.loading[old];} return ab; }
          catch (_) { delete this.loading[i]; return null; }
          finally { env.clearTimeout(timer); }
        })();
        return this.loading[i];
      },
      // No dozens of background downloads competing with the first instruction.
      prefetch() {},
      prefetchScope(sc) { const i=(this.scopes[sc]||[])[0]; if (i != null) this.loadPack(i); },
      async get(k) {
        if (!k) return null;
        if (this.urls.has(k)) return this.urls.get(k);
        const e=this.idx && this.idx[k]; if (!e) return null;
        const ab=await this.loadPack(e[0]); if (!ab || e[1]+e[2]>ab.byteLength) return null;
        const url=env.URL.createObjectURL(new env.Blob([ab.slice(e[1],e[1]+e[2])],{type:'audio/mpeg'}));
        this.urls.set(k,url); return url;
      },
      prune() { while (this.urls.size>160) { const [key,url]=this.urls.entries().next().value; env.URL.revokeObjectURL(url); this.urls.delete(key); } },
      miss(k) { this.misses.add(k); }
    };
    const Voice = {
      ok:!!env.synth && typeof env.Utterance === 'function', voices:[], voice:null, tok:0, status:'idle', mode:'', speaking:false, cancelWaiters:new Set(), last:null, nextSlow:false,
      init() {
        if (!this.ok) return;
        const load=() => { try { this.voices=env.synth.getVoices().filter(v => /^fr([_-]|$)/i.test(v.lang)); this.choose(); } catch (_) {} };
        load(); if (env.synth.addEventListener) env.synth.addEventListener('voiceschanged',load); else env.synth.onvoiceschanged=load;
        env.setTimeout(load,600); env.setTimeout(load,2000);
      },
      score(v) {
        const n=(v.name||'').toLowerCase(); let s=/^fr[-_]fr/i.test(v.lang)?8:/^fr[-_]be/i.test(v.lang)?7:/^fr[-_]ch/i.test(v.lang)?5:1;
        if (/natural|neural|online|premium|enhanced|amélioré/.test(n)) s+=20;
        if (/google/.test(n)) s+=8;
        if ((adapters.female||[]).some(w=>n.includes(w))) s+=12;
        if ((adapters.male||[]).some(w=>new RegExp('\\b'+w+'\\b').test(n))) s-=50;
        if ((adapters.novelty||[]).some(w=>new RegExp('\\b'+w+'\\b').test(n))) s-=70;
        return s;
      },
      ranked() { return [...this.voices].sort((a,b)=>this.score(b)-this.score(a)); },
      choose() { this.voice=this.voices.find(v=>v.voiceURI===settings().voiceURI)||this.ranked()[0]||null; },
      stop() {
        this.tok++; this.speaking=false;
        for (const cancel of [...this.cancelWaiters]) cancel();
        this.cancelWaiters.clear();
        if (this.audio && !this.unlocking) { try { this.audio.pause(); this.audio.removeAttribute('src'); this.audio.load(); } catch (_) {} }
        if (this.ok) { try { env.synth.cancel(); } catch (_) {} }
        this.currentUtterance=null; VoicePack.prune(); state('idle');
      },
      unlock() {
        if (adapters.ensureAudio) adapters.ensureAudio();
        if (!this.audio && env.Audio) { this.audio=new env.Audio(); this.audio.preload='auto'; this.audio.setAttribute('playsinline',''); this.audio.setAttribute('data-lumi-voice',''); this.audio.hidden=true; if (env.document && env.document.body) env.document.body.append(this.audio); }
        if (env.document && this.audio && !this.unlocked) {
          const silent='data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA=='; const a=this.audio; this.unlocked=true; this.unlocking=true; a.src=silent;
          try { const p=a.play(); if (p && p.then) p.then(()=>{this.unlocking=false;if(a.src===silent)a.pause();}).catch(()=>{this.unlocked=false;this.unlocking=false;}); else this.unlocking=false; } catch (_) {this.unlocked=false;this.unlocking=false;}
        }
      },
      wait(ms,my) {
        if (my!==this.tok) return Promise.resolve();
        return new Promise(resolve=> { let timer; const done=()=>{env.clearTimeout(timer); this.cancelWaiters.delete(done); resolve();}; this.cancelWaiters.add(done); timer=env.setTimeout(done,ms); });
      },
      slower(fn) { this.nextSlow=true; try { return fn(); } finally { this.nextSlow=false; } },
      async say(parts, options={}) {
        const slow=options.slow || this.nextSlow; this.stop(); const my=this.tok;
        this.last=parts; this.lastFallback=false; this.unlock(); const joined=speechJoin(parts), units=[];
        const prepare = (continuous=false) => {
          units.length=0;
          for (const p of joined) {
            if (typeof p === 'number') { units.push(p); continue; }
            if (!p.t.trim() || /^[\s.!?…,;:]+$/.test(p.t)) { if (/[.…]/.test(p.t)) units.push(250); continue; }
            if (p.phoneme || p.syllable || continuous || VoicePack.key(p.t,p.rate)) units.push({...p,end:p.phoneme||p.syllable?'':p.t.slice(-1)});
            else for (const s of speechSegments(p.t)) units.push({...s,rate:p.rate});
          }
        };
        prepare();
        if (!units.some(x=>typeof x==='object')) return;
        this.speaking=true; state('loading');
        try {
          const teaching=units.some(u=>u && (u.phoneme || u.syllable));
          if (teaching || !options.device) await Promise.race([VoicePack.init(),this.wait(5000,my)]);
          if (my!==this.tok) return;
          // Prefer a whole recorded phrase. A voice naturally links its words;
          // only split when a complete phrase is absent from the static bank.
          prepare();
          let urls=[];
          const speechUnits=units.filter(x=>typeof x==='object');
          if (teaching || !options.device && VoicePack.usable()) {
            const keys=speechUnits.map(u=>VoicePack.key(u.t,u.rate,u));
            if (keys.every(Boolean)) urls=await Promise.all(keys.map(k=>VoicePack.get(k)));
            else {
              // A generic device TTS cannot be trusted to pronounce a phoneme.
              // Do not silently teach another sound when the recording is absent.
              for (let i=0;i<keys.length;i++) if(!keys[i]) VoicePack.miss((speechUnits[i].phoneme?'ph|':speechUnits[i].syllable?'sy|':'n|')+(speechUnits[i].phoneme||speechUnits[i].syllable||speechUnits[i].t));
            }
          }
          if (my!==this.tok) return;
          // Keep a single timbre across the entire instruction, even when one clip is missing.
          let recorded=urls.length>0 && urls.every(Boolean) && !!this.audio;
          // Specific dynamic feedback may be absent from a static bank. Use a
          // complete Charline encouragement, never another speaker or accent.
          if (!recorded && !options.device && options.feedback) {
            const fallback=options.feedback==='correct' ? 'Bravo ! Tu as trouvé !' : options.feedback==='neutral' ? 'Merci, tu peux continuer.' : 'Regarde bien et essaie encore.';
            const k=VoicePack.key(fallback,1), url=k && await VoicePack.get(k);
            if(my!==this.tok)return;
            if(url && this.audio){units.splice(0,units.length,{t:fallback,rate:1,end:'.'});urls=[url];recorded=true;this.lastFallback=true;}
          }
          if (teaching && !recorded) { state('error','Le son ne se charge pas. Touche le haut-parleur pour réessayer.'); return; }
          if (!recorded && !options.device) { state('error','La voix ne se charge pas. Touche le haut-parleur pour réessayer.'); return; }
          if (!recorded) prepare(true);
          this.mode=recorded?'recorded':'device';
          let at=0;
          const speed=clamp(settings().rate == null ? 1:settings().rate,.75,1.1)*(slow ? .90 : 1);
          for (const u of units) {
            if (my!==this.tok) return;
            if (typeof u==='number') { await this.wait(u+(slow?Math.min(u*.2,150):0),my); continue; }
            state('speaking',u.t);
            if (recorded) { await this.play(urls[at++],u.phoneme ? 1 : speed,my); VoicePack.hits++; }
            else { if (VoicePack.usable()) VoicePack.miss(speechBucket(u.rate)+'|'+u.t); await this.utter(u.t,speed*clamp(u.rate,.72,1.15),my); }
            if (my!==this.tok) return;
            await this.wait(/[.!?…]/.test(u.end)?(slow?420:270):u.end===':'?200:65,my);
          }
        } catch (_) { if (my===this.tok) state('error','Touche le haut-parleur pour réessayer.'); }
        finally { if (my===this.tok) { this.speaking=false; if (this.status!=='error') state('idle'); VoicePack.prune(); } }
      },
      play(url,rate,my) {
        return new Promise((resolve,reject)=> {
          const a=this.audio; let timer,started=false,finished=false;
          const finish=(err)=> { if (finished) return; finished=true; env.clearTimeout(timer); this.cancelWaiters.delete(cancel); a.onended=a.onerror=a.onloadedmetadata=a.onplaying=null; err?reject(err):resolve(); };
          const cancel=()=>finish(); this.cancelWaiters.add(cancel);
          a.onended=()=>finish(); a.onerror=()=>finish(Error('lecture'));
          a.onloadedmetadata=()=> { env.clearTimeout(timer); timer=env.setTimeout(()=>finish(Error('audio timeout')),Math.max(12000,((a.duration||20)/rate+6)*1000)); };
          a.onplaying=()=>{started=true;};
          a.src=url; a.playbackRate=clamp(rate,.6,1.15); a.preservesPitch=true; a.webkitPreservesPitch=true; a.mozPreservesPitch=true; a.volume=1;
          timer=env.setTimeout(()=>finish(Error('audio unavailable')),16000);
          if (my!==this.tok) return cancel();
          try { const p=a.play(); if (p&&p.catch) p.catch(()=>{if(!started) finish(Error('audio blocked'));}); } catch (e) { finish(e); }
        });
      },
      utter(text,rate,my) {
        if (my!==this.tok || !text) return Promise.resolve();
        if (!this.ok || !this.voice) { state('error','Aucune voix française disponible.'); return Promise.resolve(); }
        return new Promise(resolve=> {
          let timer,doneAlready=false;
          const done=()=>{if(doneAlready)return;doneAlready=true;env.clearTimeout(timer);this.cancelWaiters.delete(done);this.currentUtterance=null;resolve();};
          this.cancelWaiters.add(done);
          const u=new env.Utterance(text); this.currentUtterance=u;
          u.lang=this.voice.lang||'fr-FR';u.voice=this.voice;u.rate=clamp(rate,.6,1.15);u.pitch=clamp(settings().pitch||1,.95,1.1);u.volume=1;
          u.onend=done;u.onerror=()=>{if(my===this.tok)state('error','Touche le haut-parleur pour réessayer.');done();};
          timer=env.setTimeout(()=>{if(my===this.tok){try{env.synth.cancel();}catch(_){}state('error','La voix ne répond pas. Touche le haut-parleur.');}done();},Math.max(15000,5000+text.length*160/u.rate));
          try { env.synth.speak(u); } catch (_) { done(); }
        });
      }
    };
    return {Voice,VoicePack,speechSegments,speechJoin,speechBucket};
  }
  function rootEnvironment() {
    return {fetch:(...a)=>fetch(...a),document:typeof document!=='undefined'?document:null,Audio:typeof Audio==='function'?Audio:null,Blob,URL,AbortController:typeof AbortController==='function'?AbortController:null,
      synth:typeof speechSynthesis!=='undefined'?speechSynthesis:null,Utterance:typeof SpeechSynthesisUtterance==='function'?SpeechSynthesisUtterance:null,setTimeout:(fn,ms)=>setTimeout(fn,ms),clearTimeout:id=>clearTimeout(id)};
  }
  return {create,speechSegments,speechJoin,speechBucket,norm};
});
