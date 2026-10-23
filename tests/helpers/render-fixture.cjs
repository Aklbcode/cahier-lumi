const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
class Element{
 constructor(tag='div',text=''){this.tagName=tag.toUpperCase();this.nodeType=tag==='#text'?3:1;this.childNodes=[];this.attributes={};this.listeners={};this.style={setProperty(){}};this.dataset={};this.disabled=false;this._text=text;this._html='';this.className='';this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:(...cs)=>{this.className=[...new Set([...this.className.split(/\s+/).filter(Boolean),...cs])].join(' ')},remove:(...cs)=>{this.className=this.className.split(/\s+/).filter(c=>!cs.includes(c)).join(' ')},toggle:(c,force)=>{const add=force===undefined?!this.classList.contains(c):force;this.classList[add?'add':'remove'](c);return add;}};}
 append(...xs){for(const x of xs.flat(Infinity)){if(x==null)continue;const n=typeof x==='string'?new Element('#text',x):x;n.parentNode=this;this.childNodes.push(n);}}
 prepend(...xs){const old=this.childNodes;this.childNodes=[];this.append(...xs,...old);}
 insertBefore(child,before){const i=this.childNodes.indexOf(before);if(i<0)this.append(child);else{this.childNodes.splice(i,0,child);child.parentNode=this;}}
 get children(){return this.childNodes.filter(n=>n.nodeType===1);}
 get textContent(){return this._text+this.childNodes.map(n=>n.textContent).join('');}
 set textContent(t){this._text=String(t);this._html='';this.childNodes=[];}
 get innerHTML(){return this._html;}
 set innerHTML(s){this._html=String(s);this._text='';this.childNodes=[];}
 setAttribute(k,v){this.attributes[k]=String(v);if(k==='class')this.className=String(v);if(k==='disabled')this.disabled=true;}
 getAttribute(k){return this.attributes[k]??null;}
 addEventListener(k,fn){(this.listeners[k]||(this.listeners[k]=[])).push(fn);}
 click(){if(!this.disabled)for(const fn of this.listeners.click||[])fn({preventDefault(){},target:this});}
 matches(s){if(s.startsWith('.'))return s.slice(1).split('.').every(c=>this.classList.contains(c));if(s.startsWith('#'))return this.getAttribute('id')===s.slice(1);if(s.startsWith('[')){const m=s.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);return !!m&&this.getAttribute(m[1])!==null&&(m[2]===undefined||this.getAttribute(m[1])===m[2]);}return this.tagName.toLowerCase()===s.toLowerCase();}
 querySelectorAll(selector){const selectors=selector.split(',').map(s=>s.trim()),out=[];const walk=n=>{for(const c of n.children){if(selectors.some(s=>c.matches(s)))out.push(c);walk(c);}};walk(this);return out;}
 querySelector(s){return this.querySelectorAll(s)[0]||null;}
 remove(){if(this.parentNode)this.parentNode.childNodes=this.parentNode.childNodes.filter(n=>n!==this);}
}
function loadApp(globals={}){
 const root=path.join(__dirname,'../..'),element=t=>new Element(t),document={createElement:element,createTextNode:t=>new Element('#text',t),head:element('head'),body:element('body'),addEventListener(){},querySelectorAll(s){return this.body.querySelectorAll(s)},querySelector(s){return this.body.querySelector(s)}};
 const ctx=vm.createContext({console,setTimeout,clearTimeout,requestAnimationFrame:f=>f(),window:{CSS:{supports:()=>true},addEventListener(){}},CSS:{supports:()=>true},document,LumiSpeech:require('../../speech-engine.js'),...globals});
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),source=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n').replace(/\bboot\(\);\s*$/,'');vm.runInContext(source,ctx,{timeout:10000});return {ctx,document,source};
}
module.exports={Element,loadApp};
