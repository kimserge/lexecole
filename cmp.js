/* LexEcôle — compare the pupil's translation with the program's draft */
'use strict';
const CMP=(()=>{
const W={fr:{form:'forme',num:'nombre',pl:'pluriel',sg:'singulier',agr:'accord',fw:'mot-outil',art:'article',sense:'sens',other:'autre mot',extra:'en trop',miss:'manque'},de:{form:'Form',num:'Zahl',pl:'Plural',sg:'Singular',agr:'Angleichung',fw:'Funktionswort',art:'Artikel',sense:'Bedeutung',other:'anderes Wort',extra:'zu viel',miss:'fehlt'},en:{form:'form',num:'number',pl:'plural',sg:'singular',agr:'agreement',fw:'function word',art:'article',sense:'meaning',other:'other word',extra:'extra',miss:'missing'},ru:{form:'форма',num:'число',pl:'мн. ч.',sg:'ед. ч.',agr:'согласование',fw:'служебное слово',art:'артикль',sense:'значение',other:'другое слово',extra:'лишнее',miss:'пропущено'}};let w=W.fr;
const deacc=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const FUNC0=new Set("le la les l' un une des du de d' à au aux et ou en dans sur avec par pour ne n' pas que qu' qui se s' il elle ils elles je j' tu nous vous on ce cet cette ces son sa ses mon ma mes ton ta tes".split(' '));
const FUNC={has:w=>FUNC0.has(String(w).toLowerCase())};
function tok(s){s=s.replace(/s'il (vous|te) pla[iî]t/gi,(m)=>m.replace(/ /g,'\u00a0')).replace(/est-ce (que|qui)/gi,(m)=>m.replace(/[ -]/g,'\u00a0'));s=s.replace(/-(?:t-)?(je|tu|il|elle|on|nous|vous|ils|elles|ce|moi|toi)\b/gi,' $1');return (s.replace(/[.!?;:«»"]/g,' ').replace(/,/g,' ').match(/[a-zà-ÿœæç\-\u00a0']+'?|'/gi)||[]).flatMap(w=>{if(/\u00a0/.test(w))return [w];const m=w.match(/^([a-zà-ÿ]{1,2}')(.+)$/i);return m?[m[1],m[2]]:[w]}).filter(w=>w!=="'")}
const SUF='issaient issions issiez issons issez issent aient erent ions iez ons ez ent ais ait ees ee es er ir re e s x ai a as ont it is i u ue us ues ant'.split(' ').sort((a,b)=>b.length-a.length);
function stem(w){const s=deacc(w).replace(/'$/,'');if(s.length<=3)return s;for(const x of SUF)if(s.endsWith(x)&&s.length-x.length>=3)return s.slice(0,-x.length);return s}
function sim(u,p,syn){if(u===p)return 3;if(/\s|'./.test(u)||/\s|'./.test(p)){const [au,nu]=split(u),[ap,np]=split(p);if(nu!==u||np!==p){const r=sim1(nu,np,syn);if(r>=2.8)return au.toLowerCase()===ap.toLowerCase()?3:2;return r}}return sim1(u,p,syn)}
function sim1(u,p,syn){if(u===p)return 3;const su=stem(u),sp=stem(p);if(deacc(u)===deacc(p))return 2.8;
  if(su&&su===sp)return 2;if(su.length>=4&&sp.length>=4&&(su.startsWith(sp)||sp.startsWith(su)))return 1.6;
  if(syn&&syn.has(su))return 2.4;if(FUNC.has(u)&&FUNC.has(p))return 0.6;return -1}
/* src: [{w, label:[l1,l2,gloss], exp:[senses], feat:string}] */
const ARTS=new Set("le la les l' un une des du au aux".split(' '));
function group(T){const out=[];for(let i=0;i<T.length;i++){if(ARTS.has(T[i].toLowerCase())&&T[i+1]&&!FUNC.has(T[i+1])){out.push(T[i]+(T[i].endsWith("'")?'':' ')+T[i+1]);i++}else if(T[i].toLowerCase()==='de'&&(/^(la|l')$/i.test(T[i+1]||''))&&T[i+2]){out.push('de '+T[i+1]+(T[i+1].endsWith("'")?'':' ')+T[i+2]);i+=2}else out.push(T[i])}return out}
const split=g=>{const m=g.match(/^((?:de )?(?:les|le|la|l'|une|un|des|du|aux|au))\s?(.+)$/i);return m?[m[1],m[2]]:['',g]};
function compare(user,prog,src,ui,grp){w=W[ui]||W.fr;
  let U=tok(user),P=tok(prog);if(grp){U=group(U);P=group(P)}
  // synonyms and source link for each program token
  const link=P.map(p0=>{const p=split(p0)[1];const sp=stem(p);let best=src.find(s=>s.exp.some(e=>deacc(e)===deacc(p)))||null;if(best)return best;for(const s of src){for(const e of s.exp){for(const ew of tok(e)){if(FUNC.has(ew))continue;const se=stem(ew);if(se&&(se===sp||se.length>=4&&sp.startsWith(se)||sp.length>=4&&se.startsWith(sp))){best=s;break}}if(best)break}if(best)break}return best});
  {const isV=s=>/^(verb|VER)$/i.test(s.kind||'');const freeV=src.filter(s=>isV(s)&&!link.includes(s));
   const skip=(p0,i)=>link[i]||FUNC.has(p0)||/^[A-ZÀ-Ý]/.test(split(p0)[1])&&i>0||src.some(s=>deacc(s.w)===deacc(split(p0)[1]));
   P.forEach((p0,i)=>{if(skip(p0,i))return;const p=deacc(split(p0)[1]);const b=freeV.find(s=>s.exp.some(e=>deacc(e).slice(0,2)===p.slice(0,2)));if(b){link[i]=b;freeV.splice(freeV.indexOf(b),1)}});
   P.forEach((p0,i)=>{if(skip(p0,i)||i===0&&/^[A-Z]/.test(p0)&&src.some(s=>deacc(s.w)===deacc(p0)))return;const p=deacc(split(p0)[1]);if(freeV.length===1&&!src.some(s=>!isV(s)&&s.exp.some(e=>deacc(e).slice(0,3)===p.slice(0,3)))){link[i]=freeV[0];freeV.length=0}})}
  const syns=P.map((p,i)=>{const s=link[i];if(!s)return null;const set=new Set();for(const e of s.exp)for(const ew of tok(e))if(!FUNC.has(ew))set.add(stem(ew));return set});
  // Needleman-Wunsch
  const n=U.length,m=P.length,G=-0.6,S=Array.from({length:n+1},()=>new Float64Array(m+1)),B=Array.from({length:n+1},()=>new Int8Array(m+1));
  for(let i=1;i<=n;i++){S[i][0]=i*G;B[i][0]=1}for(let j=1;j<=m;j++){S[0][j]=j*G;B[0][j]=2}
  for(let i=1;i<=n;i++)for(let j=1;j<=m;j++){const d=S[i-1][j-1]+sim(U[i-1],P[j-1],syns[j-1]),a=S[i-1][j]+G,b=S[i][j-1]+G;if(d>=a&&d>=b){S[i][j]=d;B[i][j]=0}else if(a>=b){S[i][j]=a;B[i][j]=1}else{S[i][j]=b;B[i][j]=2}}
  const cols=[];let i=n,j=m;
  while(i>0||j>0){if(i>0&&j>0&&B[i][j]===0){cols.push({u:U[i-1],p:P[j-1],k:j-1});i--;j--}else if(i>0&&(j===0||B[i][j]===1)){cols.push({u:U[i-1],p:null});i--}else{cols.push({u:null,p:P[j-1],k:j-1});j--}}
  cols.reverse();for(const c of cols){const s=c.k!=null&&link[c.k];if(s){c.si=s.i}}
  for(const s of src){if(cols.some(c=>c.si===s.i))continue;const st=new Set(s.exp.flatMap(e=>tok(e)).filter(w=>!FUNC.has(w)).map(stem));const c=cols.find(c=>c.si==null&&((c.p&&st.has(stem(split(c.p)[1])))||(c.u&&st.has(stem(split(c.u)[1])))));if(c)c.si=s.i}
  let errors=0;
  for(const c of cols){
    if(c.u&&c.p){const sc=sim(c.u,c.p,syns[c.k]);
      if(sc>=2.8){c.ok=true;continue}
      if(sc>=2.4&&sc<2.8&&stem(c.u)!==stem(c.p)){c.ok=true;c.syn=true;continue}
      const s=link[c.k];
      if(sc>=1.6){c.ok=false;c.fix=c.p;c.why=s?(s.label[0].replace(/\s+(\d.*|irr\..*|unr\..*|неправ\..*)$/,'').replace(/\s+(m|f|nt|dé|id|sé)$/,'')+' '+(s.label[1]||'')).trim():'';errors++;continue}
      if(FUNC.has(c.u)&&FUNC.has(c.p)){c.ok=false;c.fix=c.p;const ART=/^(le|la|les|l'|un|une|des|du)$/;c.why='';c.minor=true;errors++;continue}
      c.ok=false;c.fix=c.p;c.why=s?(s.label[0].replace(/\s+(\d.*|irr\..*|unr\..*|неправ\..*)$/,'').replace(/\s+(m|f|nt|dé|id|sé)$/,'')+' '+(s.label[1]||'')).trim():'';errors++}
    else if(c.u){if(FUNC.has(c.u)){c.ok=false;c.extra=true;c.minor=true;c.why='';errors++}else{c.ok=false;c.extra=true;c.why='';errors++}}
    else{c.ok=false;c.missing=true;c.fix=c.p;const s=link[c.k];c.why='';errors++}}
  return {cols,errors}}
function formWhy(u,p,s){if(!s)return w.form;const f=s.feat||'';
  if(/^(verb|VER)$/i.test(s.kind||'')){return w.form+' : '+(s.label[1]||'').replace(/indicatif |actif |Indikativ |Aktiv /g,'')}
  if(deacc(p).endsWith('s')!==deacc(u).endsWith('s'))return w.num+' : '+(/plur|Pl|мн/.test(s.label[1])?w.pl:w.sg);
  if(deacc(u).endsWith('e')!==deacc(p).endsWith('e'))return w.agr;
  return w.form}
return {compare,tok}})();
if(typeof module!=='undefined')module.exports=CMP;
