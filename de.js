/* LexEcôle — German analysis (data: LanguageTool german-pos-dict, CC BY-SA 4.0) and German→French draft translation */
'use strict';
const DE=(()=>{
let D=null,F=null;
let LEMS=null,LIDX=null,BASE='data/de/';const FC=new Set(),PC=new Set(),PAR=new Map();
function load(d){D=d;F=new Map();LEMS=new Set(d.lemmas.map(l=>l[0]));LIDX=new Map(d.lemmas.map((l,i)=>[l[0],i]))}
function ckey(w){w=w.toLowerCase().slice(0,2);const m={'ä':'a1','ö':'o1','ü':'u1','ß':'s1'};let k=[...w].map(c=>m[c]||(c>='a'&&c<='z'?c:'_')).join('');return k.length<2?(k+'_').slice(0,2):k}
async function getJ(u,o){try{const r=await fetch(u,o);return r.ok?await r.json():{}}catch(e){return {}}}
async function prefetch(words,o){const ks=new Set();for(const w of words){if(!w)continue;ks.add(ckey(w))}await Promise.all([...ks].filter(k=>!FC.has(k)).map(async k=>{const j=await getJ(BASE+'f/'+k+'.json',o);FC.add(k);for(const [w,a] of Object.entries(j))F.set(w,a)}))}
async function prefetchLemma(li,o){if(li==null||li<0)return;const k=ckey(D.lemmas[li][0]);if(PC.has(k))return;const j=await getJ(BASE+'p/'+k+'.json',o);PC.add(k);for(const [i,a] of Object.entries(j))PAR.set(+i,a.map(([w,t])=>[w,D.tags[t]]))}
const CAS={NOM:'nom',AKK:'acc',DAT:'dat',GEN:'gen'},NUM={SIN:'s',PLU:'p'},GEN={MAS:'m',FEM:'f',NEU:'n'};
function parse(tag){const p=tag.split(':'),f={tag,pos:p[0]};if(f.pos==='EIG'){f.pos='SUB';f.proper=true}
  for(const x of p){if(CAS[x])f.cas=CAS[x];else if(NUM[x])f.num=NUM[x];else if(GEN[x])f.gen=GEN[x];else if(/^[123]$/.test(x))f.pers=+x;
    else if(x==='PRÄ')f.tense='pres';else if(x==='PRT')f.tense='prt';else if(x==='KJ1')f.tense='kj1';else if(x==='KJ2')f.tense='kj2';else if(x==='INF')f.inf=true;else if(x==='PA2')f.pa2=true;else if(x==='IMP')f.imp=true;
    else if(x==='AUX')f.aux=true;else if(x==='MOD')f.mod=true;else if(x==='DEF')f.def=true;else if(x==='IND')f.indef=true;else if(x==='KOM')f.deg='comp';else if(x==='SUP')f.deg='sup';else if(x==='PRD')f.prd=true;else if(x==='NEB')f.sep=true}
  if(f.pos==='PRO')f.sub=p[1];if(f.pos==='PRP')f.gov=(p[2]||'').split('+').map(c=>CAS[c]).filter(Boolean);if(f.pos==='ART')f.def=p[1]==='DEF';
  return f}
function look(w,first){let r=F.get(w);if(first){const lw=w[0].toLowerCase()+w.slice(1);if(lw!==w)r=(r||[]).concat(F.get(lw)||[])}if(r&&!r.length)r=null;if(!r)r=F.get(w.toLowerCase());if(!r&&/^[a-zäöü]/.test(w))r=F.get(w[0].toUpperCase()+w.slice(1));
  return (r||[]).map(([li,ti])=>{const L=D.lemmas[li],f=parse(D.tags[ti]);return {lem:L[0],gloss:L[1],f,pos:f.pos,li}})}
function analyze(w,first){let a=look(w,first);if(!a.length&&/^[A-ZÄÖÜ]/.test(w))a=[{lem:w,gloss:'',f:{pos:'SUB',tag:'SUB',unk:true,proper:true},pos:'SUB',li:-1}];return {a,enc:''}}
/* personal pronouns by form */
const PP={ich:['je','me','me','',0,'s'],mich:['','me','',0],mir:['','','me',0],du:['tu','','',1],dich:['','te','',1],dir:['','','te',1],er:['il','','',2],ihn:['','le','',2],ihm:['','','lui',2],es:['il','le','',2],wir:['nous','','',3],uns:['','nous','nous',3],ihr:['vous','','',4],euch:['','vous','vous',4],ihnen:['','','leur',5],Ihnen:['','','vous',4],Sie:['vous','vous','',4],sie:['elle','la','',2]};
const POSS={mein:['mon','ma','mes'],dein:['ton','ta','tes'],sein:['son','sa','ses'],ihr:['son','sa','ses'],unser:['notre','notre','nos'],euer:['votre','votre','vos'],eur:['votre','votre','vos'],Ihr:['votre','votre','vos']};
const possKey=w=>{const m=w.match(/^(mein|dein|sein|unser|euer|eur|ihr|Ihr)/i);return m?(m[1]==='Ihr'?'Ihr':m[1].toLowerCase()):null};
/* choose */
function choose(toks){
  const n=toks.length;
  toks.forEach(t=>{t.a.forEach(x=>{let s=0;const f=x.f;if(f.pos==='SUB')s+=1;if(f.pos==='VER'&&(f.pers||f.inf||f.pa2))s+=1;if(f.tense==='kj1')s-=2;if(f.tense==='kj2'&&!f.aux&&!f.mod)s-=1;if(f.imp)s-=1.5;if(f.pos==='ZUS')s-=1;if(x.gloss)s+=.5;if(f.pos==='PRO'&&f.sub==='DEM'&&toks[t.i+1]&&toks[t.i+1].a.some(y=>y.pos==='SUB'))s-=2;if(t.i===0&&f.pos==='ADV')s+=1.5;if(toks.length===1&&f.inf)s+=2;if(t.i===0&&f.pos==='SUB'&&toks[1]&&toks[1].a.some(y=>y.pos==='VER'&&y.f.pers)&&!/^(ich|du|er|sie|es|wir|ihr|Sie|man)$/.test(toks[1].w)&&!t.a.some(y=>y.pos==='ADV'||y.pos==='PRO'||y.pos==='ART'))s+=2.5;if(t.i===0&&toks.length>1&&f.pos==='SUB'&&t.a.some(y=>y.pos==='VER'&&y.lem.toLowerCase()===x.lem.toLowerCase())&&(toks[1]&&/^(ich|du|er|sie|es|wir|ihr|Sie|man)$/.test(toks[1].w)||!toks.some((u,j)=>j>0&&u.a.some(y=>y.pos==='VER'&&y.f.pers))))s-=3;if(/^bitte$/i.test(t.w)&&f.pos==='ADV'&&t.i>0)s+=3;if(t.i===0&&/^sie$/i.test(t.w)&&f.cas==='nom')s+=3;const nx=toks[t.i+1];if(f.pos==='ZAL'&&nx&&nx.a.some(y=>y.pos==='SUB'))s+=3;if(f.pos==='ART'&&nx&&nx.a.some(y=>y.pos==='SUB'||y.pos==='ADJ'))s+=1.5;x.base=s})});
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
      if(f.pos==='PRO'&&f.sub==='PER'&&t.w==='Sie'&&t.i>0&&f.cas==='nom'&&!toks.some(u=>u!==t&&u.a.some(y=>y.pos==='SUB')&&u.c&&u.c.f.cas==='nom'))b+=3;
      if(f.pos==='ADJ'&&f.prd&&!(toks[i+1]&&toks[i+1].a.some(y=>y.pos==='SUB')))b+=2.5;
      if(f.pos==='PRP'&&toks[i+1])b+=2;if(f.pos==='PRP'&&toks[i+1]&&/^[A-ZÄÖÜ]/.test(toks[i+1].w))b+=1.5;
      if(f.cas==='nom'&&fin&&fin.c.f.pers===3&&f.num===fin.c.f.num&&(f.pos==='SUB'||f.pos==='ART'||f.pos==='PRO'))b+=1;
      if(f.cas==='nom'&&fin&&fin.c.f.num&&f.num&&f.num!==fin.c.f.num&&(f.pos==='SUB')&&!toks.some(u=>u!==t&&u.c&&u.c.f.cas==='nom'))b-=1;
      if(f.cas==='acc')b+=.4;if(f.cas==='gen')b-=.5;
      if(f.pos==='ZUS'&&i===n-1){const vl=toks.flatMap(u=>u.a.filter(y=>y.pos==='VER'&&y.f.pers).map(y=>y.lem));b+=vl.some(l=>LEMS.has(x.lem+l))?3:-3}if(f.pos==='ZUS'&&i<n-1)b-=3;
      if(f.pos==='VER'&&f.pers&&toks.some((u,k)=>k!==i&&u.c&&u.c.pos==='VER'&&u.c.f.pers&&k<i))b-=1;
      if(f.pos==='VER'&&(f.inf||f.pa2)&&fin&&fin!==t)b+=1.5;
      if(f.pos==='VER'&&f.pers&&(i===0||i===1||toks.slice(0,i).every(u=>!u.c||u.c.pos!=='VER')))b+=.8;
      if(fin&&f.pos==='VER'&&f.pers&&f.num&&fin===t){const sub=toks.find(u=>u.c&&u.c.f.cas==='nom'&&u!==t);if(sub&&sub.c.f.num===f.num)b+=1}
      if(f.pos==='VER'&&f.pers===1&&f.num==='p'&&!toks.some(u=>/^wir$/i.test(u.w)))b-=2.5;if(f.pos==='VER'&&f.pers===2&&f.num==='p'&&!toks.some(u=>/^ihr$/i.test(u.w)))b-=2.5;if(f.pos==='VER'&&f.pers&&f.num==='s'&&f.pers!==3&&!toks.some(u=>/^(ich|du|Ich|Du)$/.test(u.w)))b-=2;
      if(f.pos==='PRO'&&f.sub==='PER'&&f.cas==='nom'&&fin&&((f.pers||guessPers(t.w,f))===fin.c.f.pers))b+=1.5;
      x.bonus=b})})}
  toks.forEach(t=>t.c=pick(t));return toks}
function guessPers(w,f){const k=w.toLowerCase();if(k==='ich'||k==='wir')return 1;if(k==='du'||k==='ihr')return 2;return 3}
/* abbreviated labels (legend in the footer) */
const AC={nom:'N',acc:'Ac',dat:'D',gen:'G'},AT={pres:'Prés',prt:'Prét',kj1:'K1',kj2:'K2'},AG={m:'m',f:'f',n:'nt'},APOS={SUB:'nom subst',VER:'verb',ADJ:'nom adj',ADV:'adv',PRP:'prep',KON:'conj',ART:'art',PRO:'pron',ZUS:'part',ZAL:'num',INJ:'intrj',PA1:'nom adj',PA2:'nom adj'},APR={PER:'pe',POS:'po',DEM:'dm',REF:'ré',IND:'id',RIN:'it',REL:'rl'};
function glossOf(x,w){const f=x.f;if(f.pos==='VER'&&x.lem==='sein')return 'être';if(f.pos==='PRO'&&f.sub==='PER'){const k=w in PP?w:w.toLowerCase();const p=PP[k];if(p){const r=f.cas==='nom'?p[0]:f.cas==='acc'?p[1]:p[2];return r||p[0]||p[1]||p[2]}}
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
let NEGK=false,GERN=false,BITTE=false,FORMAL=false,AMBSIE=false,VALT='';
const IDIOM={'was ist das':["Qu'est-ce que c'est ?","C'est quoi ?"],'wer ist das':['Qui est-ce ?',"C'est qui ?"],'was ist los':["Qu'est-ce qui se passe ?"],'wie geht es dir':['Comment vas-tu ?','Comment ça va ?','Ça va ?'],'wie geht es ihnen':['Comment allez-vous ?'],"wie geht's":['Comment ça va ?','Comment vas-tu ?'],'wie gehts':['Comment ça va ?'],'wie heißt du':["Comment t'appelles-tu ?","Tu t'appelles comment ?"],'wie heißen sie':['Comment vous appelez-vous ?'],'wie alt bist du':['Quel âge as-tu ?','Tu as quel âge ?'],'mir geht es gut':['Je vais bien.','Ça va bien.'],'es geht mir gut':['Je vais bien.'],'danke schön':['Merci beaucoup.'],'vielen dank':['Merci beaucoup.'],'guten morgen':['Bonjour.'],'guten tag':['Bonjour.'],'gute nacht':['Bonne nuit.'],'auf wiedersehen':['Au revoir.'],'wie spät ist es':['Quelle heure est-il ?'],'wie viel uhr ist es':['Quelle heure est-il ?']};
const COUNTRY=/^(Allemagne|France|Suisse|Autriche|Europe|Italie|Espagne|Angleterre|Belgique|Russie|Grèce|Gaule)$/;
const TIMEADV=/^(heute|morgen|gestern|jetzt|bald|oft|immer|manchmal|nie|selten|später|früh|spät|dann|danach|schon|noch)$/i;
const TIMEN={Montag:'lundi',Dienstag:'mardi',Mittwoch:'mercredi',Donnerstag:'jeudi',Freitag:'vendredi',Samstag:'samedi',Sonntag:'dimanche',Wochenende:'le week-end',Abend:'le soir',Morgen:'le matin',Nachmittag:"l'après-midi",Vormittag:'le matin',Mittag:'à midi'};
const SEASON={Sommer:'en été',Winter:'en hiver',Herbst:'en automne',Frühling:'au printemps'};
const PLACE=/^(Kino|Theater|Museum|Schule|Restaurant|Bahnhof|Markt|Park|Konzert|Arbeit|Strand|Supermarkt|Post|Bank|Arzt|Bäckerei|Bibliothek|Zoo)$/;
const GAME=/^(Fußball|Tennis|Schach|Karte|Ball|Klavier|Gitarre|Basketball|Volleyball|Handball)$/;
function translate(toks,end){end=end||'.';VARS=[];NEGK=false;GERN=false;BITTE=false;AMBSIE=false;
  {const k=toks.map(t=>t.w.toLowerCase()).join(' ');if(IDIOM[k]){VARS=IDIOM[k].map(x=>x.replace(/[.?!]$/,'')+(end==='?'?' ?':end).replace(/^ \?$/,' ?'));VARS=IDIOM[k].slice();return VARS[0]}}const Q=end==='?';let whI=-1,wh='';if(Q){whI=toks.findIndex((t,i)=>i<2&&WH[t.w.toLowerCase()]!==undefined);if(whI>=0)wh=WH[toks[whI].w.toLowerCase()]}const whSubj=whI>=0&&toks[whI].w.toLowerCase()==='wer';
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
  const last=toks[n-1];if(fin&&last&&last.c&&last.c.pos==='ZUS'&&n-1!==fi){const comp=last.c.lem+vlem;const g=LIDX.has(comp);if(g){vlem=comp;used.add(n-1)}}
  const vglossOf=l=>{if(l==='sein')return 'être';if(l==='haben')return 'avoir';if(l==='werden')return 'devenir';const L=D.lemmas[LIDX.get(l)];return firstSense(L?L[1]:l)||l};
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
    if(/^[A-ZÀ-Ý]/.test(g0)&&np.parts.length===1)return {txt:COUNTRY.test(g0)?(FR.art(true,'f','s',g0).endsWith("'")?"l'"+g0:'la '+g0):g0,g:gF,n:num};
    let num2=num;if(zal&&!/^(un|une|1)$/.test(zal))num2='p';let noun=num2==='p'&&h.gloss?(/s$/.test(g0)?g0:FR.plural(g0)):g0;const before=[],after=[];for(const a of adjs)(FR.BEFORE.has(a)?before:after).push(FR.adj(a,gF,num2));
    let core=[...before,noun,...after].join(' ');let d;
    if(poss){const P=POSS[poss]||POSS.sein;d=num==='p'?P[2]:(gF==='f'&&!/^[aeiouyéèh]/i.test(core)?P[1]:P[0])}
    else if(dem)d=num==='p'?'ces':gF==='f'?'cette':/^[aeiouyéèh]/i.test(core)?'cet':'ce';
    else if(zal)d=zal;
    else if(ind==='aucun'){NEGK=true;d=/^[aeiouyéèh]/i.test(core)?"d'":'de'}
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
      if(x.f.cas==='nom'||t.w==='Sie'&&t.i>0&&!toks.some(u=>u.c&&u.c.pos==='SUB'&&u.c.f.cas==='nom')){pronSubj=true;used.add(i);if(t.w==='Sie')x.f.cas='nom'}else if(x.f.cas==='acc'&&p[1]){clit.push(p[1]);used.add(i)}else if(x.f.cas==='dat'&&p[2]){clit.push(p[2]);used.add(i)}}});
  const npT=np=>{let t=npText(np);if(np.coord){let g=t.g;for(const m of np.coord){m.role=np.role;const z=npText(m);t={txt:t.txt+' '+np.cw+' '+z.txt,g:z.g==='m'||g==='m'?'m':'f',n:'p'}}}return t};
  for(const np of NP){const prev=toks[np.i-1]&&toks[np.i-1].c;np.role=(np.cas==='acc'||np.cas==='nom'&&(subj||pronSubj)&&!(fin&&fin.lem==='sein'))?'obj':'';const t=npT(np);
    if(prev&&prev.pos==='PRP'){used.add(np.i-1);const pw=toks[np.i-1].w.toLowerCase();let pg=firstSense(prev.gloss);
      const hw=toks[np.end].w;if((pw==='am'||pw==='an')&&TIMEN[hw]){if(np.i-1===0)front.push(TIMEN[hw]+',');else rest.push({i:np.i-1,txt:TIMEN[hw],t:1});continue}
      if(pw==='im'&&SEASON[hw]){if(np.i-1===0)front.push(SEASON[hw]+',');else rest.push({i:np.i-1,txt:SEASON[hw],t:1});continue}
      if(/^(im|ins|zum|zur|in)$/.test(pw)&&PLACE.test(hw)){const core=t.txt.replace(/^(le|la|les|l'|du|de la|de l'|des|un|une)\s?/,'');rest.push({i:np.i-1,txt:withPrep('à',FR.art(true,t.g,t.n,core)+(FR.art(true,t.g,t.n,core).endsWith("'")?'':' ')+core)});continue}
      if(/^(im|ins|am|ans|zum|zur|vom|beim|aufs|übers)$/.test(pw)){const core=t.txt.replace(/^(le|la|les|l')\s?/,'');const base={im:'dans',ins:'dans',am:'à',ans:'à',zum:'à',zur:'à',vom:'de',beim:'chez',aufs:'sur',übers:'sur'}[pw];rest.push({i:np.i-1,txt:withPrep(base,FR.art(true,t.g,t.n,core)+(FR.art(true,t.g,t.n,core).endsWith("'")?'':' ')+core)});continue}
      if(pw==='um'&&np.parts.some(k=>toks[k].c.pos==='ZAL'))pg='à';
      if(!np.head.gloss&&np.parts.length===1&&/^(nach|in)$/.test(pw)){rest.push({i:np.i-1,txt:'à '+toks[np.end].w});continue}
      {const g=firstSense(np.head.gloss);if(np.parts.length===1&&/^[A-ZÀ-Ý]/.test(g)&&/^(nach|in)$/.test(pw)){rest.push({i:np.i-1,txt:COUNTRY.test(g)?'en '+g:'à '+g});continue}}
      rest.push({i:np.i-1,txt:withPrep(pg,t.txt)});continue}
    if((np.cas==='nom'||np.head.f.proper&&!np.cas||np.head.f.proper&&np.cas!=='dat'&&np.cas!=='gen'&&(np.i<fi||whI>=0&&np.i>fi))&&!subj&&!pronSubj){if(np.head.f.proper){np.role='';}subj=npT(np);sG=subj.g;sN=subj.n}else if(np.cas==='nom'&&fin&&fin.lem==='sein'&&!pa2>=0)attr=t.txt;
    else if(np.cas==='dat')dats.push(withPrep('à',t.txt));else if(np.cas==='gen')rest.push({i:np.i,txt:withPrep('de',t.txt)});
    else if(/^(Spaß|Angst|Hunger|Durst|Lust|Zeit)$/.test(toks[np.end].w)&&np.parts.length===1&&/^(machen|haben)$/.test(vlem)){objs.push(firstSense(np.head.gloss))}
    else if(/spielen$/.test(vlem)&&GAME.test(toks[np.end].w)){const g=firstSense(np.head.gloss);const mus=/^(Klavier|Gitarre)$/.test(toks[np.end].w);objs.push(withPrep(mus?'de':'à',FR.art(true,FR.genderOf(g,null),'s',g)+(FR.art(true,FR.genderOf(g,null),'s',g).endsWith("'")?'':' ')+g))}
    else objs.push(t.txt)}
  toks.forEach((t,i)=>{if(used.has(i))return;const x=t.c;if(!x){rest.push({i,txt:t.w});return}
    if(x.lem==='nicht'||t.w.toLowerCase()==='nicht'){neg=true;return}
    if(x.pos==='PRP'){const nx=toks[i+1];if(nx&&!used.has(i+1)&&(!nx.c||!nx.c.gloss)){used.add(i+1);const pg=/^[A-Z]/.test(nx.w)&&/^(nach|in)$/.test(t.w.toLowerCase())?'à':firstSense(x.gloss);rest.push({i,txt:pg+' '+nx.w})}else if(nx&&nx.c&&nx.c.pos==='SUB'&&!used.has(i+1)&&/^[A-ZÀ-Ý]/.test(firstSense(nx.c.gloss))&&/^(nach|in)$/.test(t.w.toLowerCase())){used.add(i+1);const g=firstSense(nx.c.gloss);rest.push({i,txt:COUNTRY.test(g)?'en '+g:'à '+g})}return}
    if(x.pos==='ADJ'&&fin&&fin.lem==='sein'&&(x.f.prd||!x.f.cas)){attr=FR.adj(firstSense(x.gloss)||t.w,sG||'m',sN||(fin.f.num==='p'?'p':'s'));return}
    if(x.pos==='KON'&&i===0){front.push(firstSense(x.gloss));return}
    if(t.w.toLowerCase()==='gern'||t.w.toLowerCase()==='gerne'){GERN=true;return}
    if(t.w.toLowerCase()==='bitte'&&x.pos==='ADV'){BITTE=true;return}
    if(x.pos==='ADJ'&&!(fin&&fin.lem==='sein')){rest.push({i,txt:FR.adv(firstSense(x.gloss)||t.w,x.f.deg)});return}
    if(x.pos==='ADV'&&i===0){front.push(firstSense(x.gloss)||t.w);return}
    if(x.pos==='ADV'&&TIMEADV.test(t.w)){rest.push({i:999+i,txt:firstSense(x.gloss)||t.w});return}
    if(x.pos==='ZUS')return;
    rest.push({i,txt:firstSense(x.gloss)||glossOf(x,t.w)||t.w})});
  if(NEGK)neg=true;
  /* verb text */
  let vt='',vg0='';
  if(fin){const pers=(fin.f.pers||3)-1+(fin.f.num==='p'?3:0);const o={neg,passive:pass,g:sG==='f'?'f':null,n:sN||(fin.f.num==='p'?'p':null),noPron:!!subj};
    if(fin.lem==='sein'&&!modal&&pa2<0&&tense!=='fut')vlem='sein';
    if(fin.f.pers===2&&fin.f.num==='p'&&toks.some(t=>t.w==='Sie'))o.noPron=false;
    let vg=modal?vglossOf(modal):vglossOf(vlem);vg0=vg;if(vlem==='sein')vg='être';if(vlem==='haben')vg='avoir';if(vlem==='werden'&&!pass)vg='devenir';
    if(fi===0&&toks[1]&&toks[1].w==='Sie'&&end!=='?'){tense='imp';}
    let p2=pers;const formal=toks.some(t=>t.w==='Sie'&&t.c&&t.c.f.cas==='nom'&&t.i>0);AMBSIE=!subj&&toks[0]&&toks[0].w==='Sie'&&fin.f.num==='p';if(formal&&fin.f.num==='p'&&!subj){p2=4;o.noPron=false}FORMAL=formal;if(tense==='imp')o.noPron=true;
    if(!subj&&toks.some(t=>/^sie$/i.test(t.w)&&t.c&&t.c.f.cas==='nom')&&!formal&&fin.f.num!=='p')o.g='f';
    if(!subj&&toks[0]&&toks[0].w==='Sie'&&fin.f.num==='s')o.g='f';
    let infx='';if(GERN&&!modal){infx=FR.conj(vg,'inf',0,{});vg='aimer'}
    if(modal&&inf){infx=firstSense(inf.gloss)}
    vt=FR.conj(vg,tense,p2,o);
    if(clit.length&&infx){infx=FR.elide(clit.join(' '),infx)}
    else if(clit.length){const cl=clit.join(' ');const m=vt.match(/^(je|j'|tu|il|elle|nous|vous|ils|elles)\s?/);if(m&&!o.noPron){const r=vt.slice(m[0].length);vt=(m[1]==="j'"?'je':m[1])+' '+FR.elide(cl,r)}else vt=FR.elide(cl,vt)}
    if(AMBSIE)VALT=FR.conj(vg,tense,4,Object.assign({},o,{noPron:false,n:'p'}))+(infx?' '+infx:'')+(attr?' '+attr:'');
    if(infx)vt+=' '+infx;
    if(attr)vt+=' '+attr}
  rest.sort((a,b)=>a.i-b.i);
  let s=[...front,subj&&subj.txt,vt,...objs,...dats,...rest.map(r=>r.txt)].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  const pl=BITTE?(FORMAL||toks.some(t=>/^(ihr|euch)$/i.test(t.w))?", s'il vous plaît":", s'il te plaît"):'';
  const cap=x=>x?x[0].toUpperCase()+x.slice(1)+pl+(end==='?'?' ?':end):'';
  if(Q&&vt&&whSubj){const v3=FR.conj(vg0||'être',tense,2,{neg,passive:pass,noPron:true});const tl=[...objs,...dats,...rest.map(r=>r.txt)].filter(Boolean).join(' ');VARS=['qui '+v3+' '+tl,'qui est-ce qui '+v3+' '+tl].map(x=>cap(x.replace(/\s+/g,' ').trim()));return VARS[0]}
  if(Q&&vt){VARS=FR.question({wh,subj:[...front,subj&&subj.txt].filter(Boolean).join(' ')||null,g:sG,n:sN,vt,tail:[...objs,...dats,...rest.map(r=>r.txt)].filter(Boolean).join(' ')}).map(cap);return VARS[0]}
  if(AMBSIE&&VALT){const v2=[...front,VALT,...objs,...dats,...rest.map(r=>r.txt)].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();VARS=[cap(s),cap(v2)]}
  return cap(s)}
function expect(t){const x=t.c;if(!x)return [];const g=x.gloss||'';const a=g.split(/[,;]/).map(s=>s.replace(/\([^)]*\)/g,'').trim()).filter(Boolean);const gl=glossOf(x,t.w);return [...new Set([gl,...a].filter(Boolean))]}
function byLemma(){return PAR}
const lcOK=(w,lem)=>!(/^[a-zäöü]/.test(lem)&&/^[A-ZÄÖÜ]/.test(w));
const ART={m:{nom:'der',acc:'den',dat:'dem',gen:'des'},f:{nom:'die',acc:'die',dat:'der',gen:'der'},n:{nom:'das',acc:'das',dat:'dem',gen:'des'},p:{nom:'die',acc:'die',dat:'den',gen:'der'}};
const THD={fr:{n:'nom',v:'verbe',m:'masc.',f:'fém.',n_:'neutre',pres:'présent',prt:'prétérit'},de:{n:'Nomen',v:'Verb',m:'mask.',f:'fem.',n_:'neutr.',pres:'Präsens',prt:'Präteritum'},en:{n:'noun',v:'verb',m:'masc.',f:'fem.',n_:'neut.',pres:'present',prt:'preterite'},ru:{n:'сущ.',v:'глагол',m:'м. р.',f:'ж. р.',n_:'ср. р.',pres:'наст.',prt:'претерит'}};
function table(x,ui){if(!x||x.li<0)return null;const t=THD[ui]||THD.fr,L=byLemma().get(x.li)||[];const f=x.f;
  if(f.pos==='SUB'){const g=f.gen||'m';const get=(c,n)=>{let w=[...new Set(L.filter(([,tg])=>{const p=parse(tg);return p.pos==='SUB'&&p.cas===c&&p.num===n}).map(([w])=>w))];if(w.length>1&&c==='dat'&&n==='s')w=w.filter(x=>!/e$/.test(x)||w.every(y=>/e$/.test(y)));if(w.length>1&&c==='gen'&&n==='s'&&w.some(x=>/es$/.test(x)))w=w.filter(x=>/es$/.test(x));return w.length?(n==='p'?ART.p[c]:ART[g][c])+' '+w.join(', '):'—'};
    const CS=['nom','acc','dat','gen'];return {title:t.n+' '+(g==='n'?t.n_:t[g]),rows:[['N','nom'],['Ac','acc'],['D','dat'],['G','gen']].map(([l,c])=>[l,get(c,'s'),get(c,'p')]),cols:['sg','pl'],cur:[CS.indexOf(f.cas),f.num==='p'?2:1]}}
  if(f.pos==='ADJ'||f.pos==='PA1'||f.pos==='PA2'){const ff=pr=>[...new Set(L.filter(([,tg])=>pr(parse(tg))).map(([w])=>w))];const pos=ff(q=>q.pos==='ADJ'&&q.prd&&!q.deg)[0]||x.lem,k=ff(q=>q.pos==='ADJ'&&q.prd&&q.deg==='comp')[0],sp=ff(q=>q.pos==='ADJ'&&q.deg==='sup');const lab={fr:['positif','comparatif','superlatif'],de:['Positiv','Komparativ','Superlativ'],en:['positive','comparative','superlative'],ru:['полож.','сравн.','превосх.']}[ui]||['positif','comparatif','superlatif'];const ttl={fr:'adjectif',de:'Adjektiv',en:'adjective',ru:'прил.'}[ui]||'adjectif';
    return {title:ttl,rows:[[lab[0],pos,''],[lab[1],k||'—',''],[lab[2],sp.length?'am '+(sp.find(w=>/sten$/.test(w))||sp[0]):'—','']],cols:['',''],one:true,cur:[f.deg==='comp'?1:f.deg==='sup'?2:0,1]}}
  if(f.pos==='VER'&&f.inf){const tn='pres';const get=(p,n)=>{const w=[...new Set(L.filter(([ww,tg])=>{const q=parse(tg);return lcOK(ww,x.lem)&&q.pos==='VER'&&q.pers===p&&q.num===n&&q.tense===tn}).map(([w])=>w))];return w.length?w.slice(0,2).join(', '):'—'};
    return {title:t.v+' · '+t[tn],rows:[1,2,3].map(p=>[String(p),get(p,'s'),get(p,'p')]),cols:['sg','pl'],cur:null}}
  if(f.pos==='VER'&&f.pers){const tn=f.tense==='prt'?'prt':'pres';const get=(p,n)=>{const w=[...new Set(L.filter(([ww,tg])=>{const q=parse(tg);return lcOK(ww,x.lem)&&q.pos==='VER'&&q.pers===p&&q.num===n&&q.tense===tn}).map(([w])=>w))];return w.length?w.join(', '):'—'};
    return {title:t.v+' · '+t[tn],rows:[1,2,3].map(p=>[String(p),get(p,'s'),get(p,'p')]),cols:['sg','pl'],cur:[f.pers-1,f.num==='p'?2:1]}}
  return null}
function entry(x){if(!x||x.li<0)return null;const L=byLemma().get(x.li)||[];const f=x.f;const ff=pr=>[...new Set(L.filter(([w,tg])=>lcOK(w,x.lem)&&pr(parse(tg))).map(([w])=>w))];
  const senses=(x.gloss||'').split(/[,;]/).map(z=>z.trim()).filter(Boolean);let hw=x.lem,info='';
  if(f.pos==='SUB'){const g=f.gen||(parse((L.find(([,tg])=>/^SUB/.test(tg))||['','SUB'])[1]).gen);hw=({m:'der',f:'die',n:'das'}[g]||'')+' '+x.lem;const gs=ff(q=>q.pos==='SUB'&&q.cas==='gen'&&q.num==='s'),pl=ff(q=>q.pos==='SUB'&&q.cas==='nom'&&q.num==='p');info=[gs.length?(g==='f'?'der ':'des ')+gs.filter(w=>/es$/.test(w)||gs.length===1).slice(0,1).join(''):'',pl.length?'die '+pl[0]:''].filter(Boolean).join(' · ')}
  else if(f.pos==='VER'){const prt=ff(q=>q.pos==='VER'&&q.pers===3&&q.num==='s'&&q.tense==='prt'),pa2=ff(q=>q.pos==='VER'&&q.pa2),p3=ff(q=>q.pos==='VER'&&q.pers===3&&q.num==='s'&&q.tense==='pres');info=[p3[0],prt[0],pa2[0]].filter(Boolean).join(' · ')}
  else if(f.pos==='ADJ'){const k=ff(q=>q.pos==='ADJ'&&q.prd&&q.deg==='comp'),sp=ff(q=>q.pos==='ADJ'&&q.deg==='sup');info=[k[0],sp.length?'am '+(sp.find(w=>/sten$/.test(w))||sp[0]):''].filter(Boolean).join(' · ')}
  return {hw,info,senses}}
return {prefetch,prefetchLemma,entry,variants:()=>VARS,load,table,analyze,choose,label,translate,expect}})();
if(typeof module!=='undefined')module.exports=DE;
