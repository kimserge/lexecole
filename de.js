/* LexEcôle — German analysis (data: LanguageTool german-pos-dict, CC BY-SA 4.0) and German→French draft translation */
'use strict';
const DE=(()=>{
let D=null,F=null;
function load(d){D=d;F=new Map(Object.entries(d.forms))}
const CAS={NOM:'nom',AKK:'acc',DAT:'dat',GEN:'gen'},NUM={SIN:'s',PLU:'p'},GEN={MAS:'m',FEM:'f',NEU:'n'};
function parse(tag){const p=tag.split(':'),f={tag,pos:p[0]};
  for(const x of p){if(CAS[x])f.cas=CAS[x];else if(NUM[x])f.num=NUM[x];else if(GEN[x])f.gen=GEN[x];else if(/^[123]$/.test(x))f.pers=+x;
    else if(x==='PRÄ')f.tense='pres';else if(x==='PRT')f.tense='prt';else if(x==='KJ1')f.tense='kj1';else if(x==='KJ2')f.tense='kj2';else if(x==='INF')f.inf=true;else if(x==='PA2')f.pa2=true;else if(x==='IMP')f.imp=true;
    else if(x==='AUX')f.aux=true;else if(x==='MOD')f.mod=true;else if(x==='DEF')f.def=true;else if(x==='IND')f.indef=true;else if(x==='KOM')f.deg='comp';else if(x==='SUP')f.deg='sup';else if(x==='PRD')f.prd=true;else if(x==='NEB')f.sep=true}
  if(f.pos==='PRO')f.sub=p[1];if(f.pos==='PRP')f.gov=(p[2]||'').split('+').map(c=>CAS[c]).filter(Boolean);if(f.pos==='ART')f.def=p[1]==='DEF';
  return f}
function look(w,first){let r=F.get(w);if(first){const lw=w[0].toLowerCase()+w.slice(1);if(lw!==w)r=(r||[]).concat(F.get(lw)||[])}if(r&&!r.length)r=null;if(!r)r=F.get(w.toLowerCase());if(!r&&/^[a-zäöü]/.test(w))r=F.get(w[0].toUpperCase()+w.slice(1));
  return (r||[]).map(([li,ti])=>{const L=D.lemmas[li],f=parse(D.tags[ti]);return {lem:L[0],gloss:L[1],f,pos:f.pos,li}})}
function analyze(w,first){let a=look(w,first);if(!a.length&&/^[A-ZÄÖÜ]/.test(w)&&!first)a=[{lem:w,gloss:'',f:{pos:'SUB',tag:'SUB',unk:true},pos:'SUB',li:-1}];return {a,enc:''}}
/* personal pronouns by form */
const PP={ich:['je','me','me','',0,'s'],mich:['','me','',0],mir:['','','me',0],du:['tu','','',1],dich:['','te','',1],dir:['','','te',1],er:['il','','',2],ihn:['','le','',2],ihm:['','','lui',2],es:['il','le','',2],wir:['nous','','',3],uns:['','nous','nous',3],ihr:['vous','','',4],euch:['','vous','vous',4],ihnen:['','','leur',5],Ihnen:['','','vous',4],Sie:['vous','vous','',4],sie:['elle','la','',2]};
const POSS={mein:['mon','ma','mes'],dein:['ton','ta','tes'],sein:['son','sa','ses'],ihr:['son','sa','ses'],unser:['notre','notre','nos'],euer:['votre','votre','vos'],eur:['votre','votre','vos'],Ihr:['votre','votre','vos']};
const possKey=w=>{const m=w.match(/^(mein|dein|sein|unser|euer|eur|ihr|Ihr)/i);return m?(m[1]==='Ihr'?'Ihr':m[1].toLowerCase()):null};
/* choose */
function choose(toks){
  const n=toks.length;
  toks.forEach(t=>{t.a.forEach(x=>{let s=0;const f=x.f;if(f.pos==='SUB')s+=1;if(f.pos==='VER'&&(f.pers||f.inf||f.pa2))s+=1;if(f.tense==='kj1')s-=2;if(f.tense==='kj2'&&!f.aux&&!f.mod)s-=1;if(f.imp)s-=1.5;if(f.pos==='ZUS')s-=1;if(x.gloss)s+=.5;if(f.pos==='PRO'&&f.sub==='DEM'&&toks[t.i+1]&&toks[t.i+1].a.some(y=>y.pos==='SUB'))s-=2;if(t.i===0&&f.pos==='ADV')s+=1.5;const nx=toks[t.i+1];if(f.pos==='ZAL'&&nx&&nx.a.some(y=>y.pos==='SUB'))s+=3;if(f.pos==='ART'&&nx&&nx.a.some(y=>y.pos==='SUB'||y.pos==='ADJ'))s+=1.5;x.base=s})});
  const pick=t=>t.a.length?t.a.reduce((b,x)=>(x.base+(x.bonus||0)>b.base+(b.bonus||0)?x:b)):null;
  for(let it=0;it<3;it++){toks.forEach(t=>t.c=pick(t));
    const fin=toks.find(t=>t.c&&t.c.pos==='VER'&&t.c.f.pers);
    toks.forEach((t,i)=>{t.a.forEach(x=>{let b=0;const f=x.f;
      // NP agreement: determiner/adjective with following noun
      if((f.pos==='ART'||f.pos==='ADJ'||f.pos==='PRO'&&(f.sub==='POS'||f.sub==='DEM'||f.sub==='IND'))&&f.cas){let j=i+1;while(toks[j]&&toks[j].a.some(y=>y.pos==='ADJ'||y.pos==='PA1'||y.pos==='PA2'))j++;
        const nt=toks[j];if(nt&&nt.a.some(y=>y.pos==='SUB')){if(nt.a.some(y=>y.pos==='SUB'&&y.f.unk)){const pr=toks[i-1];if(pr&&pr.c&&pr.c.pos==='PRP'&&pr.c.f.gov&&pr.c.f.gov.includes(f.cas))b+=2}else if(nt.a.some(y=>y.pos==='SUB'&&y.f.cas===f.cas&&y.f.num===f.num&&(!f.gen||!y.f.gen||y.f.gen===f.gen||f.num==='p')))b+=3;else b-=2}
        if(f.pos==='PRO'&&f.sub==='PER'&&nt&&nt.a.some(y=>y.pos==='SUB'))b-=3}
      if(f.pos==='SUB'){let j=i-1;const det=[];while(j>=0&&toks[j].c&&/^(ART|ADJ|PA1|PA2|PRO)$/.test(toks[j].c.pos)&&toks[j].c.f.cas){det.push(toks[j]);j--}
        for(const d of det){if(d.a.some(y=>y.f.cas===f.cas&&y.f.num===f.num&&(!y.f.gen||y.f.gen===f.gen||f.num==='p')))b+=1.5;else b-=1.5}
        const pr=toks[j];if(pr&&pr.c&&pr.c.pos==='PRP'){if(pr.c.f.gov&&pr.c.f.gov.includes(f.cas))b+=3;else b-=3}}
      if(f.pos==='PRP'&&toks[i+1])b+=2;
      if(f.cas==='nom'&&fin&&fin.c.f.pers===3&&f.num===fin.c.f.num&&(f.pos==='SUB'||f.pos==='ART'||f.pos==='PRO'))b+=1;
      if(f.cas==='nom'&&fin&&fin.c.f.num&&f.num&&f.num!==fin.c.f.num&&(f.pos==='SUB')&&!toks.some(u=>u!==t&&u.c&&u.c.f.cas==='nom'))b-=1;
      if(f.cas==='acc')b+=.4;if(f.cas==='gen')b-=.5;
      if(f.pos==='ZUS'&&i===n-1)b+=3;if(f.pos==='ZUS'&&i<n-1)b-=3;
      if(f.pos==='VER'&&f.pers&&toks.some((u,k)=>k!==i&&u.c&&u.c.pos==='VER'&&u.c.f.pers&&k<i))b-=1;
      if(f.pos==='VER'&&(f.inf||f.pa2)&&fin&&fin!==t)b+=1.5;
      if(f.pos==='VER'&&f.pers&&(i===0||i===1||toks.slice(0,i).every(u=>!u.c||u.c.pos!=='VER')))b+=.8;
      if(fin&&f.pos==='VER'&&f.pers&&f.num&&fin===t){const sub=toks.find(u=>u.c&&u.c.f.cas==='nom'&&u!==t);if(sub&&sub.c.f.num===f.num)b+=1}
      if(f.pos==='VER'&&f.pers&&f.num==='p'&&f.pers!==3&&!toks.some(u=>/^(wir|ihr|Wir|Ihr|Sie)$/.test(u.w)))b-=2;if(f.pos==='VER'&&f.pers&&f.num==='s'&&f.pers!==3&&!toks.some(u=>/^(ich|du|Ich|Du)$/.test(u.w)))b-=2;
      if(f.pos==='PRO'&&f.sub==='PER'&&f.cas==='nom'&&fin&&((f.pers||guessPers(t.w,f))===fin.c.f.pers))b+=1.5;
      x.bonus=b})})}
  toks.forEach(t=>t.c=pick(t));return toks}
function guessPers(w,f){const k=w.toLowerCase();if(k==='ich'||k==='wir')return 1;if(k==='du'||k==='ihr')return 2;return 3}
/* abbreviated labels (legend in the footer) */
const AC={nom:'N',acc:'Ac',dat:'D',gen:'G'},AT={pres:'Prés',prt:'Prét',kj1:'K1',kj2:'K2'},AG={m:'m',f:'f',n:'nt'},APOS={SUB:'nom subst',VER:'verb',ADJ:'nom adj',ADV:'adv',PRP:'prep',KON:'conj',ART:'art',PRO:'pron',ZUS:'part',ZAL:'num',INJ:'intrj',PA1:'nom adj',PA2:'nom adj'},APR={PER:'pe',POS:'po',DEM:'dm',REF:'ré',IND:'id',RIN:'it',REL:'rl'};
function glossOf(x,w){const f=x.f;if(f.pos==='PRO'&&f.sub==='PER'){const k=w in PP?w:w.toLowerCase();const p=PP[k];if(p){const r=f.cas==='nom'?p[0]:f.cas==='acc'?p[1]:p[2];return r||p[0]||p[1]||p[2]}}
  if(f.pos==='PRO'&&f.sub==='POS'){const k=possKey(w);if(k)return POSS[k][0]}
  if(f.pos==='ART')return f.def?(f.num==='p'?'les':'le / la'):(f.num==='p'?'des':'un / une');
  return (x.gloss||'').split(/[,;]/)[0].trim()}
function label(x,ui,w){if(!x)return ['?','',''];const f=x.f;const j=a=>a.filter(Boolean).join(' '),j2=a=>a.filter(Boolean).join(' · ');const NB=n=>n==='s'?'sg':n==='p'?'pl':'';let l1=APOS[f.pos]||f.pos.toLowerCase(),l2='';
  if(f.pos==='SUB'){l1+=f.gen?' '+AG[f.gen]:'';l2=j2([AC[f.cas],NB(f.num)])}
  else if(f.pos==='VER'){if(f.aux)l1='verb aux';else if(f.mod)l1='verb mod';if(f.sep)l1+=' sé';
    if(f.inf)l2='If';else if(f.pa2)l2='Pa';else if(f.imp)l2=j2(['Ip',NB(f.num)]);else l2=j2([AT[f.tense],f.pers&&(f.pers+NB(f.num))])}
  else if(f.pos==='ART'){l1+=' '+(f.def?'dé':'id');l2=j2([AC[f.cas],NB(f.num),f.num==='s'&&AG[f.gen]])}
  else if(f.pos==='PRO'){l1+=' '+(APR[f.sub]||'');l2=j2([AC[f.cas],NB(f.num),f.num==='s'&&AG[f.gen]])}
  else if(f.pos==='ADJ'||f.pos==='PA1'||f.pos==='PA2'){l2=f.prd?'':j([AC[f.cas],NB(f.num),f.num==='s'&&AG[f.gen],f.deg==='comp'?'cp':f.deg==='sup'?'sp':''])}
  else if(f.pos==='PRP'){l2=f.gov&&f.gov.length?'+'+f.gov.map(c=>AC[c]).join('/'):''}
  return [l1,l2,glossOf(x,w)]}
/* ---------- draft translation ---------- */
const TMAP={pres:'pres',prt:'impf',kj1:'subj',kj2:'cond'};
const firstSense=g=>(g||'').split(/[,;]/)[0].replace(/\([^)]*\)/g,'').trim();
function withPrep(p,np){return (p+' '+np).replace(/(^|\s)à le /g,'$1au ').replace(/(^|\s)à les /g,'$1aux ').replace(/(^|\s)de le /g,'$1du ').replace(/(^|\s)de les /g,'$1des ').replace(/(^|\s)de ([aeiouyéèêh])/gi,"$1d'$2").replace(/(^|\s)à l' /,"$1à l'")}
const WH={wer:'qui',was:'que',wo:'où',wohin:'où',woher:"d'où",wann:'quand',warum:'pourquoi',wieso:'pourquoi',weshalb:'pourquoi',wie:'comment',wieviel:'combien'};
let VARS=[];
function translate(toks,end){end=end||'.';VARS=[];const Q=end==='?';let whI=-1,wh='';if(Q){whI=toks.findIndex((t,i)=>i<2&&WH[t.w.toLowerCase()]!==undefined);if(whI>=0)wh=WH[toks[whI].w.toLowerCase()]}const whSubj=whI>=0&&toks[whI].w.toLowerCase()==='wer';
  const used=new Set();const n=toks.length;if(whI>=0)used.add(whI);
  const fi=toks.findIndex(t=>t.c&&t.c.pos==='VER'&&t.c.f.pers);const fin=fi>=0?toks[fi].c:null;if(fi>=0)used.add(fi);
  /* verb complex */
  let vlem=fin?fin.lem:'',tense=fin?TMAP[fin.f.tense]||'pres':'pres',pass=false,modal=null,inf=null;
  const pa2=toks.findIndex((t,i)=>i!==fi&&t.c&&t.c.pos==='VER'&&t.c.f.pa2),ifi=toks.findIndex((t,i)=>i!==fi&&t.c&&t.c.pos==='VER'&&t.c.f.inf);
  if(fin&&(fin.lem==='haben'||fin.lem==='sein')&&pa2>=0){vlem=toks[pa2].c.lem;tense=fin.f.tense==='prt'?'pqp':fin.f.tense==='kj2'?'condp':'pc';used.add(pa2)}
  else if(fin&&fin.lem==='werden'&&pa2>=0){vlem=toks[pa2].c.lem;pass=true;tense=TMAP[fin.f.tense]||'pres';used.add(pa2)}
  else if(fin&&fin.lem==='werden'&&ifi>=0){vlem=toks[ifi].c.lem;tense=fin.f.tense==='kj2'?'cond':'fut';used.add(ifi)}
  else if(fin&&(fin.f.mod||/^(können|müssen|sollen|wollen|dürfen|mögen)$/.test(fin.lem))&&ifi>=0){modal=fin.lem;inf=toks[ifi].c;used.add(ifi)}
  else if(fin&&fin.f.tense==='prt'&&!/^(sein|haben)$/.test(fin.lem)&&!fin.f.mod)tense='pc';
  /* separable particle at the end */
  const last=toks[n-1];if(fin&&last&&last.c&&last.c.pos==='ZUS'&&n-1!==fi){const comp=last.c.lem+vlem;const g=D.lemmas.find(L=>L[0]===comp);if(g){vlem=comp;used.add(n-1)}}
  const vglossOf=l=>{const L=D.lemmas.find(x=>x[0]===l);return firstSense(L?L[1]:l)||l};
  /* noun phrases */
  const NP=[];
  for(let i=0;i<n;i++){if(used.has(i))continue;const x=toks[i].c;if(!x)continue;
    if(/^(ART|ADJ|PA1|PA2|SUB|ZAL)$/.test(x.pos)||x.pos==='PRO'&&/^(POS|DEM|IND)$/.test(x.f.sub)&&toks[i+1]&&toks[i+1].c&&toks[i+1].c.pos==='SUB'){
      let j=i;const parts=[];while(j<n&&!used.has(j)&&toks[j].c&&(/^(ART|ADJ|PA1|PA2|ZAL)$/.test(toks[j].c.pos)||toks[j].c.pos==='PRO'&&/^(POS|DEM|IND)$/.test(toks[j].c.f.sub)))parts.push(j++);
      if(j<n&&toks[j].c&&toks[j].c.pos==='SUB'){parts.push(j);const head=toks[j].c;const d0=parts.length>1?toks[parts[0]].c.f:{};NP.push({i,end:j,parts,head,cas:head.f.cas||d0.cas,num:head.f.num||d0.num||'s'});parts.forEach(k=>used.add(k));i=j}
      else if(x.pos==='ADJ'&&x.f.prd){/* predicative adjective, keep */}
    }}
  const npText=np=>{const h=np.head;const g0=firstSense(h.gloss)||toks[np.end].w;const proper=!h.gloss&&/^[A-Z]/.test(toks[np.end].w)&&np.parts.length===1;
    const gF=FR.genderOf(g0,null),num=np.num||'s';let det=null,adjs=[],poss=null,dem=false,zal=null;
    let ind=null;for(const k of np.parts){if(k===np.end)continue;const x=toks[k].c;if(x.pos==='PRO'&&x.f.sub==='IND'){ind=firstSense(x.gloss);continue}if(x.pos==='ART')det=x.f.def?'def':'ind';else if(x.pos==='PRO'&&x.f.sub==='POS')poss=possKey(toks[k].w);else if(x.pos==='PRO'&&x.f.sub==='DEM')dem=true;else if(x.pos==='ZAL')zal=firstSense(x.gloss)||toks[k].w;else adjs.push(firstSense(x.gloss)||toks[k].w)}
    if(proper)return {txt:toks[np.end].w,g:gF,n:num};
    let num2=num;if(zal&&!/^(un|une|1)$/.test(zal))num2='p';let noun=num2==='p'?FR.plural(g0):g0;const before=[],after=[];for(const a of adjs)(FR.BEFORE.has(a)?before:after).push(FR.adj(a,gF,num2));
    let core=[...before,noun,...after].join(' ');let d;
    if(poss){const P=POSS[poss]||POSS.sein;d=num==='p'?P[2]:(gF==='f'&&!/^[aeiouyéèh]/i.test(core)?P[1]:P[0])}
    else if(dem)d=num==='p'?'ces':gF==='f'?'cette':/^[aeiouyéèh]/i.test(core)?'cet':'ce';
    else if(zal)d=zal;
    else if(ind)d=num==='p'?(ind==='chaque'?(gF==='f'?'toutes les':'tous les'):ind):ind;
    else if(!det&&num==='s'&&np.role==='obj')d=gF==='f'?'de la':/^[aeiouyéèh]/i.test(core)?"de l'":'du';
    else if(det==='ind')d=num==='p'?'des':gF==='f'?'une':'un';
    else if(det==='def'||num==='s')d=FR.art(true,gF,num,core);else d='des';
    return {txt:d.endsWith("'")?d+core:d+' '+core,g:gF,n:num}};
  for(let k=NP.length-1;k>0;k--){const a=NP[k-1],b=NP[k];if(b.i===a.end+2&&toks[a.end+1].c&&/^(und|oder)$/.test(toks[a.end+1].w)&&(a.cas===b.cas||!a.cas||!b.cas||toks[b.end].a.some(y=>y.f.cas===a.cas))){b.cas=a.cas;a.coord=[b].concat(b.coord||[]);a.cw=toks[a.end+1].w==='und'?'et':'ou';used.add(a.end+1);NP.splice(k,1)}}
  /* subject and objects */
  let subj=null,sG=null,sN=null,pronSubj=false;const objs=[],dats=[],rest=[],front=[],clit=[];let neg=false,attr=null;
  toks.forEach((t,i)=>{if(used.has(i))return;const x=t.c;if(!x)return;
    if(x.pos==='PRO'&&x.f.sub==='PER'){const k=t.w in PP?t.w:t.w.toLowerCase();const p=PP[k]||['','',''];
      if(x.f.cas==='nom'){pronSubj=true;used.add(i)}else if(x.f.cas==='acc'&&p[1]){clit.push(p[1]);used.add(i)}else if(x.f.cas==='dat'&&p[2]){clit.push(p[2]);used.add(i)}}});
  const npT=np=>{let t=npText(np);if(np.coord){let g=t.g;for(const m of np.coord){m.role=np.role;const z=npText(m);t={txt:t.txt+' '+np.cw+' '+z.txt,g:z.g==='m'||g==='m'?'m':'f',n:'p'}}}return t};
  for(const np of NP){const prev=toks[np.i-1]&&toks[np.i-1].c;np.role=(np.cas==='acc'||np.cas==='nom'&&(subj||pronSubj)&&!(fin&&fin.lem==='sein'))?'obj':'';const t=npT(np);
    if(prev&&prev.pos==='PRP'){used.add(np.i-1);const pw=toks[np.i-1].w.toLowerCase();let pg=firstSense(prev.gloss);
      if(/^(im|ins|am|ans|zum|zur|vom|beim|aufs|übers)$/.test(pw)){const core=t.txt.replace(/^(le|la|les|l')\s?/,'');const base={im:'dans',ins:'dans',am:'à',ans:'à',zum:'à',zur:'à',vom:'de',beim:'chez',aufs:'sur',übers:'sur'}[pw];rest.push({i:np.i-1,txt:withPrep(base,FR.art(true,t.g,t.n,core)+(FR.art(true,t.g,t.n,core).endsWith("'")?'':' ')+core)});continue}
      if(pw==='um'&&np.parts.some(k=>toks[k].c.pos==='ZAL'))pg='à';
      rest.push({i:np.i-1,txt:withPrep(pg,t.txt)});continue}
    if(np.cas==='nom'&&!subj&&!pronSubj){subj=t;sG=t.g;sN=t.n}else if(np.cas==='nom'&&fin&&fin.lem==='sein'&&!pa2>=0)attr=t.txt;
    else if(np.cas==='dat')dats.push(withPrep('à',t.txt));else if(np.cas==='gen')rest.push({i:np.i,txt:withPrep('de',t.txt)});else objs.push(t.txt)}
  toks.forEach((t,i)=>{if(used.has(i))return;const x=t.c;if(!x){rest.push({i,txt:t.w});return}
    if(x.lem==='nicht'||t.w.toLowerCase()==='nicht'){neg=true;return}
    if(x.pos==='PRP'){const nx=toks[i+1];if(nx&&!used.has(i+1)&&(!nx.c||!nx.c.gloss)){used.add(i+1);const pg=/^[A-Z]/.test(nx.w)&&/^(nach|in)$/.test(t.w.toLowerCase())?'à':firstSense(x.gloss);rest.push({i,txt:pg+' '+nx.w})}return}
    if(x.pos==='ADJ'&&fin&&fin.lem==='sein'&&(x.f.prd||!x.f.cas)){attr=FR.adj(firstSense(x.gloss)||t.w,sG||'m',sN||(fin.f.num==='p'?'p':'s'));return}
    if(x.pos==='KON'&&i===0){front.push(firstSense(x.gloss));return}
    if(x.pos==='ADV'&&i===0){front.push(firstSense(x.gloss)||t.w);return}
    if(x.pos==='ZUS')return;
    rest.push({i,txt:firstSense(x.gloss)||glossOf(x,t.w)||t.w})});
  /* verb text */
  let vt='',vg0='';
  if(fin){const pers=(fin.f.pers||3)-1+(fin.f.num==='p'?3:0);const o={neg,passive:pass,g:sG==='f'?'f':null,n:sN||(fin.f.num==='p'?'p':null),noPron:!!subj};
    if(fin.lem==='sein'&&!modal&&pa2<0&&tense!=='fut')vlem='sein';
    if(fin.f.pers===2&&fin.f.num==='p'&&toks.some(t=>t.w==='Sie'))o.noPron=false;
    let vg=modal?vglossOf(modal):vglossOf(vlem);vg0=vg;if(vlem==='sein')vg='être';if(vlem==='haben')vg='avoir';if(vlem==='werden'&&!pass)vg='devenir';
    let p2=pers;if(toks.some(t=>t.w==='Sie'&&t.c&&t.c.f.cas==='nom'&&t.i>0||t.w==='Sie'&&t.i===0&&fin.f.num==='p'&&fin.f.pers===3&&false))p2=4;
    vt=FR.conj(vg,tense,p2,o);
    if(clit.length){const cl=clit.join(' ');const m=vt.match(/^(je|j'|tu|il|elle|nous|vous|ils|elles)\s?/);if(m&&!o.noPron){const r=vt.slice(m[0].length);vt=(m[1]==="j'"?'je':m[1])+' '+FR.elide(cl,r)}else vt=FR.elide(cl,vt)}
    if(modal&&inf)vt+=' '+firstSense(inf.gloss);
    if(attr)vt+=' '+attr}
  rest.sort((a,b)=>a.i-b.i);
  let s=[...front,subj&&subj.txt,vt,...objs,...dats,...rest.map(r=>r.txt)].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  const cap=x=>x?x[0].toUpperCase()+x.slice(1)+(end==='?'?' ?':end):'';
  if(Q&&vt&&whSubj){const v3=FR.conj(vg0||'être',tense,2,{neg,passive:pass,noPron:true});const tl=[...objs,...dats,...rest.map(r=>r.txt)].filter(Boolean).join(' ');VARS=['qui '+v3+' '+tl,'qui est-ce qui '+v3+' '+tl].map(x=>cap(x.replace(/\s+/g,' ').trim()));return VARS[0]}
  if(Q&&vt){VARS=FR.question({wh,subj:[...front,subj&&subj.txt].filter(Boolean).join(' ')||null,g:sG,n:sN,vt,tail:[...objs,...dats,...rest.map(r=>r.txt)].filter(Boolean).join(' ')}).map(cap);return VARS[0]}
  return cap(s)}
function expect(t){const x=t.c;if(!x)return [];const g=x.gloss||'';const a=g.split(/[,;]/).map(s=>s.replace(/\([^)]*\)/g,'').trim()).filter(Boolean);const gl=glossOf(x,t.w);return [...new Set([gl,...a].filter(Boolean))]}
let BYL=null;function byLemma(){if(BYL)return BYL;BYL=new Map();for(const [w,a] of F)for(const [li,ti] of a){if(!BYL.has(li))BYL.set(li,[]);BYL.get(li).push([w,D.tags[ti]])}return BYL}
const ART={m:{nom:'der',acc:'den',dat:'dem',gen:'des'},f:{nom:'die',acc:'die',dat:'der',gen:'der'},n:{nom:'das',acc:'das',dat:'dem',gen:'des'},p:{nom:'die',acc:'die',dat:'den',gen:'der'}};
const THD={fr:{n:'nom',v:'verbe',m:'masc.',f:'fém.',n_:'neutre',pres:'présent',prt:'prétérit'},de:{n:'Nomen',v:'Verb',m:'mask.',f:'fem.',n_:'neutr.',pres:'Präsens',prt:'Präteritum'},en:{n:'noun',v:'verb',m:'masc.',f:'fem.',n_:'neut.',pres:'present',prt:'preterite'},ru:{n:'сущ.',v:'глагол',m:'м. р.',f:'ж. р.',n_:'ср. р.',pres:'наст.',prt:'претерит'}};
function table(x,ui){if(!x||x.li<0)return null;const t=THD[ui]||THD.fr,L=byLemma().get(x.li)||[];const f=x.f;
  if(f.pos==='SUB'){const g=f.gen||'m';const get=(c,n)=>{let w=[...new Set(L.filter(([,tg])=>{const p=parse(tg);return p.pos==='SUB'&&p.cas===c&&p.num===n}).map(([w])=>w))];if(w.length>1&&c==='dat'&&n==='s')w=w.filter(x=>!/e$/.test(x)||w.every(y=>/e$/.test(y)));if(w.length>1&&c==='gen'&&n==='s'&&w.some(x=>/es$/.test(x)))w=w.filter(x=>/es$/.test(x));return w.length?(n==='p'?ART.p[c]:ART[g][c])+' '+w.join(', '):'—'};
    const CS=['nom','acc','dat','gen'];return {title:t.n+' '+(g==='n'?t.n_:t[g]),rows:[['N','nom'],['Ac','acc'],['D','dat'],['G','gen']].map(([l,c])=>[l,get(c,'s'),get(c,'p')]),cols:['sg','pl'],cur:[CS.indexOf(f.cas),f.num==='p'?2:1]}}
  if(f.pos==='VER'&&f.pers){const tn=f.tense==='prt'?'prt':'pres';const get=(p,n)=>{const w=[...new Set(L.filter(([,tg])=>{const q=parse(tg);return q.pos==='VER'&&q.pers===p&&q.num===n&&q.tense===tn}).map(([w])=>w))];return w.length?w.join(', '):'—'};
    return {title:t.v+' · '+t[tn],rows:[1,2,3].map(p=>[String(p),get(p,'s'),get(p,'p')]),cols:['sg','pl'],cur:[f.pers-1,f.num==='p'?2:1]}}
  return null}
return {variants:()=>VARS,load,table,analyze,choose,label,translate,expect}})();
if(typeof module!=='undefined')module.exports=DE;
