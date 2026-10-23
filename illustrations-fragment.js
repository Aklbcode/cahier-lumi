/* Twemoji graphics: Twitter, Inc. and other contributors, CC BY 4.0.
   Vendored drawings and attribution: assets/illustrations/CREDITS.md.
   Load assets/illustrations/twemoji-bundle.js before this fragment.
   This helper is deliberately opt-in: no document walk or MutationObserver. */
function lumiIllustrationCode(codeOrEmoji){
 const value=String(codeOrEmoji||'').trim();
 if(/^[0-9a-f]{2,6}(?:-[0-9a-f]{2,6})*$/i.test(value)){const parts=value.toLowerCase().split('-');return (parts.includes('200d')?parts:parts.filter(x=>x!=='fe0f')).join('-');}
 const text=value.includes('\u200d')?value:value.replace(/\ufe0f/g,'');
 return Array.from(text,c=>c.codePointAt(0).toString(16)).join('-');
}
function lumiIllustrationSVG(codeOrEmoji){
 const code=lumiIllustrationCode(codeOrEmoji),bank=globalThis.LUMI_ILLUSTRATION_SVGS||{};
 return Object.prototype.hasOwnProperty.call(bank,code)?bank[code]:null;
}
let lumiIllustrationSerial=0;
function lumiIllustrationUniqueSVG(svg){
 const prefix='lumi-art-'+(++lumiIllustrationSerial)+'-';
 return svg.replace(/\bid=(["'])([^"']+)\1/g,(_,quote,id)=>'id='+quote+prefix+id+quote)
  .replace(/url\((["']?)#([^)'"\s]+)\1\)/g,(_,quote,id)=>'url('+quote+'#'+prefix+id+quote+')')
  .replace(/((?:xlink:)?href)=(["'])#([^"']+)\2/g,(_,attr,quote,id)=>attr+'='+quote+'#'+prefix+id+quote);
}
function lumiIllustration(codeOrEmoji,label){
 const value=String(codeOrEmoji||''),code=lumiIllustrationCode(value);let emoji=value;
 if(/^[0-9a-f]{2,6}(?:-[0-9a-f]{2,6})*$/i.test(value))try{emoji=String.fromCodePoint(...value.split('-').map(x=>parseInt(x,16)));}catch(_){emoji=value;}
 let svgs=[lumiIllustrationSVG(value)];
 if(!svgs[0]&&typeof Intl.Segmenter==='function'){
  const parts=[...new Intl.Segmenter('fr',{granularity:'grapheme'}).segment(value)].map(x=>x.segment);
  if(parts.length>1&&parts.every(p=>lumiIllustrationSVG(p)))svgs=parts.map(lumiIllustrationSVG);
 }
 /* Unrecognized values (including letters, numerals and mixed word labels)
    stay the exact original string; h() can insert them as before. */
 if(svgs.some(s=>!s))return value;
 const wrap=document.createElement('span');wrap.className='lumi-illustration';
 wrap.setAttribute('data-illustration',code);wrap.setAttribute('role','img');wrap.setAttribute('aria-label',String(label||emoji));
 if(svgs.length>1)wrap.style.width=svgs.length+'em';
 /* Keep the original emoji as a text node: code comparing button.textContent
    continues to see the exact same value after a visual replacement. */
 const source=document.createElement('span');source.className='lumi-illustration-source';source.setAttribute('aria-hidden','true');source.textContent=emoji;
 const picture=document.createElement('span');picture.className='lumi-illustration-drawing';picture.setAttribute('aria-hidden','true');picture.innerHTML=svgs.map(lumiIllustrationUniqueSVG).join('');
 wrap.append(source,picture);return wrap;
}
function lumiIllustrationStyle(){
 const style=document.createElement('style');style.textContent=`
 .lumi-illustration{display:inline-flex;position:relative;width:1em;height:1em;line-height:1;vertical-align:-.12em;flex-shrink:0;align-items:center;justify-content:center}
 .lumi-illustration-drawing{display:inline-flex;width:100%;height:100%;pointer-events:none}.lumi-illustration-drawing>svg{display:block;width:1em;height:1em;overflow:visible;flex-shrink:0}
 .lumi-illustration-source{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
 .lumi-illustration.native{width:auto}
 `;document.head.append(style);
}
const bootBeforeLumiIllustrations=boot;boot=function(){lumiIllustrationStyle();bootBeforeLumiIllustrations();};
