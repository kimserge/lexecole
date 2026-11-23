/* LexEcôle — Latin analysis (data: Collatinus, GPL) and Latin→French draft translation */
'use strict';
const LA=(()=>{
let D=null,DES=null,RAD=null,IRR=null,MOD=null;
const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/æ/g,'ae').replace(/œ/g,'oe').toLowerCase().replace(/j/g,'i').replace(/v/g,'u');
function load(d){D=d;DES=new Map(Object.entries(d.des));RAD=new Map(Object.entries(d.rad));IRR=new Map(Object.entries(d.irr));MOD=d.models}
const CASES={nominatif:'nom',vocatif:'voc',accusatif:'acc',génitif:'gen',datif:'dat',ablatif:'abl',locatif:'loc'};
function feats(ms){const f={};const w=ms.split(' ');
  for(const t of w){if(CASES[t])f.cas=CASES[t];else if(t==='singulier')f.num='s';else if(t==='pluriel')f.num='p';else if(t==='masculin')f.gen='m';else if(t==='féminin')f.gen='f';else if(t==='neutre')f.gen='n';
    else if(/^[123]/.test(t))f.pers=+t[0];else if(t==='indicatif')f.mood='ind';else if(t==='subjonctif')f.mood='subj';else if(t==='impératif')f.mood='imp';else if(t==='infinitif')f.mood='inf';else if(t==='participe')f.mood='part';else if(t==='gérondif')f.mood='ger';else if(t==='supin')f.mood='sup';else if(t==='verbal')f.mood='adjv';
    else if(t==='actif')f.voice='act';else if(t==='passif')f.voice='pass';else if(t==='comparatif')f.deg='comp';else if(t==='superlatif')f.deg='sup'}
  const tm=ms.match(/(présent|imparfait|futur antérieur|futur|plus-que-parfait|parfait|PQP)/);if(tm)f.tense={présent:'pres',imparfait:'impf',futur:'fut','futur antérieur':'fa','plus-que-parfait':'pqp',PQP:'pqp',parfait:'pf'}[tm[1]];
  if(ms==='inv.')f.inv=true;return f}
function lemGen(info){const m=info.match(/(?:^|[\s,])(m|f|n)\.(?:\s|$|,)/);return m?m[1]:''}
function chainOf(mi){return MOD[mi][2]}
function classOf(L,pos){const ch=chainOf(L[1]),name=ch[0];
  if(pos==='v'||MOD[L[1]][1]==='v'){
    if(/^(sum|absum|possum|prosum|fero|uolo|nolo|malo|eo|fio|edo|aio)$/.test(name))return {k:'conj',n:'irr'};
    if(ch.includes('imitor')){const n=ch.includes('potior')?4:ch.includes('patior')?'3m':ch.includes('sequor')?3:ch.includes('uereor')?2:1;return {k:'conj',n,dep:true}}
    for(const [m,n] of [['audio',4],['capio','3m'],['lego',3],['moneo',2],['amo',1]])if(ch.includes(m))return {k:'conj',n};return {k:'conj',n:'?'}}
  if(ch.includes('fortis'))return {k:'acl',n:2};if(ch.includes('doctus'))return {k:'acl',n:1};
  for(const [m,n] of [['uita',1],['lupus',2],['miles',3],['manus',4],['res',5]])if(ch.includes(m))return {k:'decl',n};
  return null}
function posOf(L){const p=L[4]||'';const info=L[2]||'';
  if(/prép/.test(info))return 'prep';if(/conj/.test(info))return 'conj';if(/interj/.test(info))return 'interj';if(/pron/.test(info)||p.includes('p'))return 'pron';
  if(/adv/.test(info)||p==='d')return 'adv';if(p.includes('a')||p.includes('m'))return 'adj';if(p.includes('v')||MOD[L[1]][1]==='v')return 'verb';if(p.includes('n'))return 'noun';return 'inv'}
function cleanGloss(g){if(!g)return '';g=g.replace(/\([^)]*\)/g,'').replace(/\[[^\]]*\]/g,'').replace(/(^|[;,]\s*)(conj|prép|adv|pron|interj|adj|subst|n|m|f)\.\s+/g,'$1');let s=g.split(/[;:]/)[0];s=s.split(',')[0];return s.replace(/\s+/g,' ').trim()}
const OVR={multus:'nombreux',gero:'faire',pareo:'obéir',puer:'garçon',fabula:'histoire',narro:'raconter',ambulo:'se promener',ludo:'jouer',oppugno:'attaquer',uideo:'voir',habeo:'avoir',dico:'dire',facio:'faire',do:'donner',uenio:'venir',capio:'prendre',duco:'conduire',mitto:'envoyer',pugno:'combattre',laboro:'travailler',specto:'regarder',exspecto:'attendre',timeo:'craindre',porto:'porter',neco:'tuer',interficio:'tuer',scribo:'écrire',lego:'lire',audio:'écouter',sum:'être',possum:'pouvoir',uolo:'vouloir',debeo:'devoir',urbs:'ville',ciuis:'citoyen',miles:'soldat',hostis:'ennemi',dux:'chef',rex:'roi',regina:'reine',deus:'dieu',dea:'déesse',templum:'temple',uia:'route',terra:'terre',aqua:'eau',insula:'île',silua:'forêt',hortus:'jardin',domus:'maison',uilla:'ferme',equus:'cheval',canis:'chien',lupus:'loup',bellum:'guerre',pax:'paix',arma:'armes',gladius:'épée',magister:'maître',discipulus:'élève',amicus:'ami',amica:'amie',pater:'père',mater:'mère',filius:'fils',filia:'fille',puella:'fille',uir:'homme',femina:'femme',homo:'homme',populus:'peuple',senatus:'sénat',bonus:'bon',malus:'mauvais',magnus:'grand',paruus:'petit',pulcher:'beau',longus:'long',altus:'haut',laetus:'joyeux',miser:'malheureux',fortis:'courageux',liber:'libre',nouus:'nouveau',uetus:'vieux',Romanus:'romain',meus:'mon',tuus:'ton',suus:'son',noster:'notre',uester:'votre',saepe:'souvent',semper:'toujours',nunc:'maintenant',iam:'déjà',hodie:'aujourd\'hui',cras:'demain',heri:'hier',ibi:'là',hic:'ce',ille:'celui-là',is:'il',non:'ne... pas',et:'et',sed:'mais',quod:'parce que',ubi:'où',cum:'avec',in:'dans',ad:'vers',ex:'hors de',e:'hors de',de:'de',ab:'de',a:'de',per:'à travers',sine:'sans',propter:'à cause de',post:'après',ante:'avant',apud:'chez',sub:'sous',contra:'contre',inter:'entre',pro:'pour',trans:'au-delà de',iter:'chemin',nauta:'marin',agricola:'agriculteur',poeta:'poète',incola:'habitant',patria:'patrie',fortuna:'fortune',gloria:'gloire',uita:'vie',cura:'soin',ira:'colère',epistula:'lettre',liber_:'livre',donum:'cadeau',auxilium:'aide',consilium:'conseil',periculum:'danger',oppidum:'ville fortifiée',castra:'camp',flumen:'fleuve',mare:'mer',mons:'montagne',nox:'nuit',dies:'jour',annus:'année',tempus:'temps',corpus:'corps',caput:'tête',manus:'main',pes:'pied',uox:'voix',nomen:'nom',animal:'animal',amor:'amour',labor:'travail',timor:'peur',dolor:'douleur',honor:'honneur',lux:'lumière',sol:'soleil',luna:'lune',stella:'étoile',caelum:'ciel',ignis:'feu',lex:'loi',mos:'coutume',res:'chose',spes:'espoir',fides:'confiance',exercitus:'armée',impetus:'attaque',senex:'vieillard',iuuenis:'jeune homme',frater:'frère',soror:'sœur',uxor:'épouse',maritus:'mari',seruus:'esclave',dominus:'maître',ancilla:'servante',cena:'dîner',panis:'pain',uinum:'vin',rosa:'rose',ager:'champ',arbor:'arbre',flos:'fleur',porta:'porte',murus:'mur',nauis:'navire',sagitta:'flèche',scutum:'bouclier',uictoria:'victoire',proelium:'bataille',pugna:'combat',amo:'aimer',laudo:'louer',uoco:'appeler',clamo:'crier',canto:'chanter',paro:'préparer',supero:'vaincre',uinco:'vaincre',rego:'diriger',credo:'croire',quaero:'chercher',inuenio:'trouver',relinquo:'abandonner',defendo:'défendre',teneo:'tenir',moneo:'avertir',doceo:'enseigner',disco:'apprendre',sedeo:'être assis',iaceo:'être couché',maneo:'rester',fugio:'fuir',curro:'courir',eo:'aller',redeo:'revenir',bibo:'boire',edo:'manger',dormio:'dormir',uiuo:'vivre',morior:'mourir',loquor:'parler',sequor:'suivre',hortor:'exhorter',nascor:'naître',proficiscor:'partir',conor:'essayer',miror:'admirer',uereor:'craindre',patior:'souffrir',orior:'se lever',gaudeo:'se réjouir',doleo:'souffrir',fleo:'pleurer',rideo:'rire',respondeo:'répondre',rogo:'demander',nuntio:'annoncer',monstro:'montrer',ostendo:'montrer',aedifico:'construire',habito:'habiter',erro:'errer',adiuuo:'aider',iuuo:'aider',cogito:'penser',puto:'penser',scio:'savoir',nescio:'ignorer',intellego:'comprendre',sentio:'sentir',pono:'poser',trado:'livrer',accipio:'recevoir',peto:'demander',cupio:'désirer',incipio:'commencer',pello:'chasser',cado:'tomber',occido:'tuer',iubeo:'ordonner',ueto:'interdire',impero:'commander',persuadeo:'persuader',noceo:'nuire',placeo:'plaire',faueo:'favoriser'};
const OVRN={liber:'livre',galli:'Gaulois',gallus:'Gaulois',romanus:'Romain',castra:'camp',liberi:'enfants',arma:'armes'};const PLT={castra:1};
function ovr(x){const k=norm(x.lem).replace(/[^a-z]/g,'');if(x.pos==='noun'&&OVRN[k]&&!(k==='gallus'&&!/^[A-Z]/.test(x.lem.normalize('NFD'))))return OVRN[k];return OVR[k]}
function bestGloss(x){const o=ovr(x);if(o)return o;const ss=senses(x.gloss);if(!ss.length)return x.lem;if(x.pos==='adj'){const one=ss.find(z=>!/\s/.test(z));if(one)return one}return ss[0]}
function senses(g){if(!g)return [];return g.replace(/\([^)]*\)/g,'').replace(/\[[^\]]*\]/g,'').replace(/(^|[;,]\s*)(conj|prép|adv|pron|interj|adj|subst|n|m|f)\.\s+/g,'$1').split(/[;,:]/).map(x=>x.replace(/\s+/g,' ').trim()).filter(x=>x&&x.length<40)}
function analyze(w){const f=norm(w),out=[],seen=new Set();
  const add=(li,mo)=>{const k=li+'|'+mo;if(seen.has(k))return;seen.add(k);const L=D.lemmas[li];const ms=D.morph[mo]||'';out.push({li,mo,lem:L[0],ms,f:feats(ms),pos:posOf(L),L,freq:L[3],gloss:L[5]||L[7]||''})};
  for(const x of IRR.get(f)||[])add(x[0],x[1]);
  for(let i=0;i<=f.length;i++){const r=f.slice(0,i),d=f.slice(i);const ld=DES.get(d);if(!ld)continue;let lr=(RAD.get(r)||[]).slice();
    if(d.startsWith('i')&&!d.startsWith('ii')&&!r.endsWith('i'))lr=lr.concat(RAD.get(r+'i')||[]);
    for(const [li,rn] of lr){const L=D.lemmas[li];for(const [mi,mo,r2] of ld)if(L[1]===mi&&r2===rn)add(li,mo)}}
  return out}
/* enclitics */
function analyzeTok(w){let a=analyze(w);if(a.length)return {a,enc:''};
  for(const e of ['que','ne','ue']){if(w.length>e.length+1&&norm(w).endsWith(e)){const b=analyze(w.slice(0,-e.length));if(b.length)return {a:b,enc:e}}}
  return {a:[],enc:''}}
const PREP_CASE=info=>/\+\s*abl/.test(info)&&/\+\s*acc/.test(info)?'acc|abl':/\+\s*abl/.test(info)?'abl':/\+\s*acc/.test(info)?'acc':/\+\s*gén/.test(info)?'gen':'';
/* choose analyses in context */
const GREET={aue:['Salut','Bonjour'],salue:['Bonjour','Salut'],uale:['Au revoir','Adieu'],auete:['Salut','Bonjour'],saluete:['Bonjour','Salut'],ualete:['Au revoir','Adieu']};
const GRT=toks=>toks[0]&&GREET[norm(toks[0].w)];
function choose(toks){
  for(const t of toks){for(const x of t.a){let s=Math.log(1+(x.freq||0));const F=x.f;
    if(F.cas==='voc')s-=3;if(F.cas==='loc')s-=3;if(F.mood==='sup')s-=3;if(F.mood==='imp'&&F.tense==='fut')s-=3;if(F.mood==='part'&&F.tense==='fut')s-=1.5;if(F.mood==='part')s-=2.5;if(F.mood==='adjv')s-=1.5;if(F.mood==='ger')s-=1;if(F.deg)s-=1;if(F.mood==='subj')s-=.8;
    const lp=/^[A-Z]/.test(x.lem.normalize('NFD').replace(/[\u0300-\u036f]/g,'')),wp=/^[A-Z]/.test(t.w);if(t.i===0){if(lp)s-=.3}else if(lp!==wp)s-=6;if(lp&&F.num==='p'&&x.pos==='noun')s-=1;if(!x.gloss)s-=4;
    if(/^(ave|aue|salve|salue|vale|uale|avete|auete|salvete|saluete|valete|ualete)$/.test(norm(t.w))&&(x.pos==='interj'||x.pos==='adv'))s+=8;
    if(GRT(toks)&&t.i>0&&F.cas==='voc')s+=6;
    x.base=s}}
  const pick=t=>t.a.length?t.a.reduce((b,x)=>((x.base+(x.bonus||0))>(b.base+(b.bonus||0))?x:b)):null;
  for(let it=0;it<3;it++){toks.forEach(t=>t.c=pick(t));
    const verbs=toks.filter(t=>t.c&&t.c.pos==='verb'&&(t.c.f.mood==='ind'||t.c.f.mood==='subj'));
    const vb=verbs[0]&&verbs[0].c;
    toks.forEach((t,i)=>{for(const x of t.a){let b=0;const F=x.f;
      const prev=toks[i-1]&&toks[i-1].c;
      if(prev&&prev.pos==='prep'){const pc=PREP_CASE(prev.L[2]);if(pc&&F.cas&&pc.split('|').includes(F.cas))b+=4;else if(F.cas)b-=1}
      if(x.pos==='prep'&&toks[i+1]){const pc=PREP_CASE(x.L[2]);if(pc&&toks[i+1].a.some(y=>pc.split('|').includes(y.f.cas)))b+=2}
      if(vb&&F.cas==='nom'&&vb.f.pers===3&&F.num===vb.f.num)b+=1.5;
      if(F.cas==='acc')b+=0.6;if(F.cas==='dat'&&vb&&/^(do|dico|narro|mitto|ostendo|credo|pareo|impero|persuadeo|faueo|noceo|placeo|respondeo|scribo|monstro|trado|praebeo|dono|nuntio|promitto|reddo)$/.test(norm(vb.lem)))b+=1.2;if(F.cas==='gen'||F.cas==='dat')b-=0.2;
      if((x.pos==='adj'||F.mood==='part')&&F.cas){if(toks.some((u,j)=>j!==i&&u.c&&u.c.pos==='noun'&&u.c.f.cas===F.cas&&u.c.f.num===F.num&&(!u.c.f.gen&&!F.gen||nounGen(u.c)===F.gen||!F.gen)))b+=2.5}
      if(x.pos==='noun'&&F.cas&&toks.some((u,j)=>j!==i&&u.c&&u.c.pos==='adj'&&u.c.f.cas===F.cas&&u.c.f.num===F.num))b+=1;
      if(x.pos==='verb'&&(F.mood==='ind')&&verbs.length===0)b+=3;
      if(F.mood==='inf'&&toks.some(u=>u.c&&/^(possum|uolo|nolo|malo|debeo|cupio|incipio|soleo|audeo|scio|nescio|conor)$/.test(norm(u.c.lem))))b+=3;
      if(F.cas==='nom'&&vb&&t.a.some(y=>y.f.cas==='acc'&&y.li===x.li)&&toks.some((u,j)=>j!==i&&u.c&&u.c.f.cas==='nom'&&!u.a.some(y=>y.f.cas==='acc')&&u.c.f.num===vb.f.num&&(u.c.pos==='noun'||u.c.pos==='adj')))b-=2.5;
      x.bonus=b}})}
  toks.forEach(t=>t.c=pick(t));return toks}
function nounGen(x){return x.f.gen||lemGen(x.L[2])}
/* abbreviated labels (legend in the footer) */
const AC={nom:'N',voc:'V',acc:'Ac',gen:'G',dat:'D',abl:'Ab',loc:'L'},AT={pres:'Prés',impf:'Impf',fut:'Fut',pf:'Pf',pqp:'Pqpf',fa:'FutAnt'},AM={subj:'Sj',imp:'Ip',inf:'If',part:'Pa',ger:'Gd',sup:'Su',adjv:'Gv'},AG={m:'m',f:'f',n:'nt'},APOS={noun:'nom subst',verb:'verb',adj:'nom adj',adv:'adv',prep:'prep',conj:'conj',pron:'pron',interj:'intrj',inv:'inv'};
const CW={fr:{d:'décl.',c:'conj.',a:'cl.',irr:'irr.',dep:'dép.'},de:{d:'Dekl.',c:'Konj.',a:'Kl.',irr:'unr.',dep:'Dep.'},en:{d:'decl.',c:'conj.',a:'cl.',irr:'irr.',dep:'dep.'},ru:{d:'скл.',c:'спр.',a:'кл.',irr:'неправ.',dep:'отлож.'}};
function label(x,ui){if(!x)return ['?','',''];const W=CW[ui]||CW.fr;const F=x.f,L=x.L,pos=x.pos;const cl=classOf(L,pos==='verb'||F.mood?'v':'');const j=a=>a.filter(Boolean).join(' '),j2=a=>a.filter(Boolean).join(' · ');const NB=n=>n==='s'?'sg':n==='p'?'pl':'';
  let l1=APOS[pos]||pos,l2='',codes=[];
  const cls=cl?(cl.k==='conj'?(cl.n==='irr'?W.irr:String(cl.n)+' '+W.c)+(cl.dep?' '+W.dep:''):String(cl.n)+' '+(cl.k==='acl'?W.a:W.d)):'';
  if(F.mood==='part'){l1=j(['verb',cls]);l2=j2([AM.part,AT[F.tense],F.voice==='pass'&&'ps',AC[F.cas],NB(F.num),AG[F.gen]])}
  else if(pos==='verb'||F.mood){l1=j(['verb',cls]);
    if(F.mood==='inf')l2=j2([AM.inf,AT[F.tense],F.voice==='pass'&&'ps']);
    else if(F.mood==='ger'||F.mood==='sup'||F.mood==='adjv')l2=j2([AM[F.mood],AC[F.cas],NB(F.num),AG[F.gen]]);
    else l2=j2([AT[F.tense],AM[F.mood],F.voice==='pass'&&!(cl&&cl.dep)&&'ps',F.pers&&(F.pers+NB(F.num))])}
  else if(pos==='noun'){l1=j(['nom subst',cl&&cl.k==='decl'?cls:'']);l2=j2([AC[F.cas],NB(F.num),AG[lemGen(L[2])]])}
  else if(pos==='adj'){l1=j(['nom adj',cl&&cl.k==='acl'?cls:'']);l2=j2([AC[F.cas],NB(F.num),AG[F.gen],F.deg==='comp'?'cp':F.deg==='sup'?'sp':''])}
  else if(pos==='pron'){l2=j2([AC[F.cas],NB(F.num),AG[F.gen]])}
  else if(pos==='prep'){const pc=PREP_CASE(L[2]);l2=pc?'+'+pc.split('|').map(c=>AC[c]).join('/'):''}
  return [l1,l2,bestGloss(x)]}
/* ---------- draft translation ---------- */
const PERS_PRON={ego:0,tu:1,nos:3,uos:4};
const OBJ_CLITIC={ego:['me','me'],tu:['te','te'],nos:['nous','nous'],uos:['vous','vous'],se:['se','se']};
function nounFr(x,o={}){if(PLT[norm(x.lem).replace(/[^a-z]/g,'')])x=Object.assign({},x,{f:Object.assign({},x.f,{num:'s'})});let g=x.subst?bestGloss(x):(ovr(x)||cleanGloss(x.gloss)||x.lem);const proper=/^[A-ZÀ-Ý]/.test(g)&&!x.subst;if(x.subst&&x.f.gen==='f')g=FR.adj(g,'f','s');const lg=nounGen(x);const gen=FR.genderOf(g,lg);const n=x.f.num||'s';
  if(proper){if(n==='p')return {txt:'les '+g,g:gen,n};if(/ia$/.test(norm(x.lem))&&/e$/.test(g))return {txt:(/^[AEIOUÉ]/.test(g)?"l'":'la ')+g,g:'f',n};return {txt:g,g:gen,n}}return {txt:FR.np(g,{g:gen,n,def:o.def!==false}),g:gen,n}}
function adjFr(x,g,n){let a=bestGloss(x);if(/^[A-ZÀ-Ý]/.test(a))a=a[0].toLowerCase()+a.slice(1);return FR.adj(a,g,n)}
const TENSE_MAP={pres:'pres',impf:'impf',fut:'fut',pf:'pc',pqp:'pqp',fa:'fa'};
function prepNP(pv,txt,pass){const pl=norm(pv.lem);const core=txt.replace(/^(la |l')/,'');const proper=/^[A-ZÀ-Ý]/.test(core);
  if(proper&&/^(in|ad)$/.test(pl))return /^(la |l')/.test(txt)?'en '+core:'à '+txt;
  if(pass&&/^(a|ab|abs)$/.test(pl))return withPrep('par',txt);
  return withPrep(pl==='in'?'dans':bestGloss(pv),txt)}
function withPrep(p,np){return (p+' '+np).replace(/(^|\s)à le /g,'$1au ').replace(/(^|\s)à les /g,'$1aux ').replace(/(^|\s)de le /g,'$1du ').replace(/(^|\s)de les /g,'$1des ').replace(/(^|\s)de ([aeiouyéèêh])/gi,"$1d'$2")}
const WH={quis:'qui',quid:'que',ubi:'où',cur:'pourquoi',quando:'quand',quomodo:'comment',unde:"d'où",quo:'où',qualis:'quel',quantus:'combien',num:'',nonne:'',an:''};
let VARS=[];
const IDIOM={'quid est hoc':["Qu'est-ce que c'est ?","Qu'est-ce que cela ?"],'quis est':['Qui est-ce ?','Qui est-il ?'],'quid agis':['Que fais-tu ?','Comment vas-tu ?'],'salve':['Bonjour !','Salut !'],'salvete':['Bonjour !'],'vale':['Au revoir !','Porte-toi bien !'],'valete':['Au revoir !'],'quomodo vales':['Comment vas-tu ?'],'bene valeo':['Je vais bien.'],'gratias tibi ago':['Je te remercie.','Merci.'],'quot annos natus es':['Quel âge as-tu ?']};
function translate(toks,end){end=end||'.';VARS=[];{const G=GRT(toks);if(G){const names=toks.slice(1).map(t=>{const x=t.c;if(!x)return t.w;const g=ovr(x)||cleanGloss(x.gloss)||t.w;return x.pos==='noun'&&!/^[A-ZÀ-Ý]/.test(g)&&x.f.num==='p'?FR.plural(g):g}).join(' ');const e=end==='?'?' ?':' !';VARS=G.map(g=>names?g+', '+names+e:g+e);return VARS[0]}}{const k=toks.map(t=>norm(t.w)).join(' ');if(IDIOM[k]){VARS=IDIOM[k].slice();return VARS[0]}}const Q=end==='?';let whI=-1,wh='';if(Q){const wk=t=>WH[norm(t.w)]!==undefined?norm(t.w):t.c&&WH[norm(t.c.lem).replace(/\d+$/,'')]!==undefined?norm(t.c.lem).replace(/\d+$/,''):null;whI=toks.findIndex(t=>wk(t));if(whI>=0)wh=WH[wk(toks[whI])]}const whSubj=whI>=0&&wh==='qui'&&toks[whI].c&&(toks[whI].c.f.cas==='nom'||!toks[whI].c.f.cas)&&!toks.some(t=>t.c&&t.c.pos==='verb'&&t.c.f.pers&&t.c.f.pers!==3);
  const used=new Set(),parts=[];if(whI>=0)used.add(whI);let verb=null,neg=false,subj=null,attr=null,objs=[],dats=[],rest=[],front=[],clitics=[];
  const c=i=>toks[i]&&toks[i].c;
  /* noun phrases: head noun + adjectives agreeing + following genitive */
  const vx0=(toks.find(t=>t.c&&t.c.pos==='verb'&&/^(ind|subj|imp)$/.test(t.c.f.mood))||{}).c;
  let pppI=-1;{const vi=toks.findIndex(t=>t.c&&t.c.pos==='verb'&&/^(ind|subj)$/.test(t.c.f.mood)&&norm(t.c.lem)==='sum');if(vi>=0)pppI=toks.findIndex(t=>t.c&&t.c.f.mood==='part'&&t.c.f.tense==='pf'&&t.c.f.cas==='nom')}
  if(pppI>=0)used.add(pppI);
  let attrI=-1;if(vx0&&norm(vx0.lem)==='sum'&&pppI<0){const vi=toks.findIndex(t=>t.c===vx0);let bd=99;toks.forEach((t,i)=>{if(t.c&&t.c.pos==='adj'&&t.c.f.cas==='nom'){const d=Math.abs(i-vi);if(d<bd){bd=d;attrI=i}}})}
  const NP=[];toks.forEach((t,i)=>{const x=t.c;if(i===whI)return;if(x&&(x.pos==='noun'||(x.pos==='pron'&&x.f.cas))&&!(x.pos==='pron'&&PERS_PRON[norm(x.lem)]!==undefined&&x.f.cas==='nom'))NP.push({i,head:x,adjs:[],gens:[]})});
  toks.forEach((t,i)=>{const x=t.c;if(!x||i===pppI||i===attrI)return;if((x.pos==='adj'||(x.f.mood==='part'&&x.f.cas))){let best=null,bd=99;for(const n of NP){if(n.head.f.cas===x.f.cas&&n.head.f.num===x.f.num&&(!x.f.gen||nounGen(n.head)===x.f.gen||!nounGen(n.head))){const d=Math.abs(n.i-i);if(d<bd){bd=d;best=n}}}if(best){best.adjs.push({i,x});used.add(i)}}});
  toks.forEach((t,i)=>{const x=t.c;if(x&&x.pos==='adj'&&x.f.cas&&!used.has(i)&&i!==pppI&&!(vx0&&norm(vx0.lem)==='sum'&&x.f.cas==='nom')){NP.push({i,head:Object.assign({},x,{pos:'noun',subst:true}),adjs:[],gens:[]});used.add(i)}});NP.sort((a,b)=>a.i-b.i);
  for(let k=NP.length-1;k>0;k--){const a=NP[k-1],b=NP[k];const mid=toks.slice(a.i+1+a.adjs.filter(z=>z.i>a.i).length,b.i).filter(t=>!used.has(t.i));if(a.head.f.cas===b.head.f.cas&&(mid.length===1&&mid[0].c&&/^(et|atque|ac)$/.test(norm(mid[0].c.lem))||toks[b.i].enc==='que')){a.coord=(a.coord||[]).concat([b],b.coord||[]);used.add(mid[0]?mid[0].i:-1);NP.splice(k,1)}}
  for(const n of NP)if(n.head.f.cas==='gen'){let host=null,bd=99;for(const m of NP)if(m!==n&&m.head.f.cas!=='gen'){const d=Math.abs(m.i-n.i);if(d<bd){bd=d;host=m}}if(host){host.gens.push(n);n.attached=true}}
  const npText=(n,def=true)=>{if(n.head.pos==='pron'){const g=cleanGloss(n.head.gloss)||n.head.lem;return {txt:g,g:'m',n:n.head.f.num||'s'}}
    const r=nounFr(n.head,{def});const before=[],after=[];
    {const q=n.adjs.find(a=>/^(multus|omnis|nullus)$/.test(norm(a.x.lem)));if(q){const hg=ovr(n.head)||cleanGloss(n.head.gloss);const k=norm(q.x.lem);const pl=r.n==='p';const noun=pl?FR.plural(hg):hg;const rest=n.adjs.filter(a=>a!==q).map(a=>adjFr(a.x,r.g,r.n));let det=k==='multus'?(pl?(r.g==='f'?'de nombreuses':'de nombreux'):'beaucoup de'):k==='omnis'?(pl?(r.g==='f'?'toutes les':'tous les'):(r.g==='f'?'toute la':'tout le')):(r.g==='f'?'aucune':'aucun');let txt=(det+' '+noun+(rest.length?' '+rest.join(' '):'')).replace(/ de ([aeiouyéèh])/i," d'$1");return {txt,g:r.g,n:r.n}}}
    for(const a of n.adjs){const s=adjFr(a.x,r.g,r.n);(FR.BEFORE.has(bestGloss(a.x))?before:after).push(s)}
    let txt=r.txt;if(before.length){txt=FR.np(before.join(' ')+' '+(ovr(n.head)||cleanGloss(n.head.gloss)),{g:r.g,n:r.n});if(r.n==='p'){const w=FR.plural(ovr(n.head)||cleanGloss(n.head.gloss));txt=FR.np(before.join(' ')+' '+w,{g:r.g,n:'s'}).replace(/^(le|la|l')\s?/,'les ')}}
    if(after.length)txt+=' '+after.join(' ');
    for(const gn of n.gens)txt=withPrep(txt+' de',npText(gn).txt).replace(/ de de /,' de ');
    if(n.coord&&!n.inCoord){let g=r.g;for(const m of n.coord){m.inCoord=true;const z=npText(m);txt+=' et '+z.txt;if(z.g==='m')g='m';for(const a of m.adjs)used.add(a.i);used.add(m.i)}return {txt,g,n:'p'}}
    return {txt,g:r.g,n:r.n}};
  /* verbs */
  const vIdx=toks.findIndex(t=>t.c&&t.c.pos==='verb'&&/^(ind|subj|imp)$/.test(t.c.f.mood));
  let vx=vIdx>=0?c(vIdx):null;let pass=vx&&vx.f.voice==='pass'&&!(classOf(vx.L,'v')||{}).dep;
  let tense=vx?TENSE_MAP[vx.f.tense]||'pres':'pres',pers=vx?(vx.f.pers?vx.f.pers-1+(vx.f.num==='p'?3:0):2):2;
  if(vx&&vx.f.mood==='subj')tense=vx.f.tense==='impf'||vx.f.tense==='pqp'?'cond':'subj';
  if(vx&&vx.f.mood==='imp')tense='imp';
  let vgloss=vx?bestGloss(vx):'';
  /* sum + perfect passive participle */
  let ppp=null;if(vx&&norm(vx.lem)==='sum'){const pi=pppI;if(pi>=0){ppp=c(pi);used.add(pi);vgloss=bestGloss(ppp);pass=!(classOf(ppp.L,'v')||{}).dep;tense={pres:'pc',impf:'pqp',fut:'fa'}[vx.f.tense]||'pc'}}
  if(vIdx>=0)used.add(vIdx);
  let infTxt='';const ii=toks.findIndex((t,i)=>i!==vIdx&&t.c&&t.c.f.mood==='inf');if(ii>=0){infTxt=FR.conj(bestGloss(c(ii)),'inf',0,{passive:c(ii).f.voice==='pass'});used.add(ii)}
  /* roles */
  let sG=null,sN=null;
  for(const n of NP){if(n.attached)continue;const cs=n.head.f.cas;
    if(cs==='nom'){if(!subj&&vx&&(vx.f.pers===3||!vx.f.pers)&&(!vx.f.num||n.head.f.num===vx.f.num||n.coord)){const r=npText(n);subj=r;sG=r.g;sN=r.n}else if(vx&&norm(vx.lem)==='sum'&&subj)attr=npText(n,false).txt;else if(!subj){const r=npText(n);subj=r;sG=r.g;sN=r.n}else rest.push({i:n.i,txt:npText(n).txt})}
    else if(cs==='acc'){const pv=toks[n.i-1]&&toks[n.i-1].c;if(pv&&pv.pos==='prep')rest.push({i:n.i-1,txt:prepNP(pv,npText(n).txt,pass)});else{const k=norm(n.head.lem);if(n.head.pos==='pron'&&OBJ_CLITIC[k])clitics.push(OBJ_CLITIC[k][0]);else objs.push(npText(n).txt)}}
    else if(cs==='dat'){const k=norm(n.head.lem);if(n.head.pos==='pron'&&OBJ_CLITIC[k])clitics.push(OBJ_CLITIC[k][1]);else dats.push(withPrep('à',npText(n).txt))}
    else if(cs==='abl'||cs==='loc'){const pv=toks[n.i-1]&&toks[n.i-1].c;if(pv&&pv.pos==='prep')rest.push({i:n.i-1,txt:prepNP(pv,npText(n).txt,pass)});else rest.push({i:n.i,txt:withPrep(pass?'par':'avec',npText(n).txt)})}
    else if(cs==='voc'){front.push(npText(n,false).txt+',')}
    for(const a of n.adjs)used.add(a.i);used.add(n.i);if(toks[n.i-1]&&toks[n.i-1].c&&toks[n.i-1].c.pos==='prep')used.add(n.i-1);for(const g of n.gens)used.add(g.i)}
  /* predicate adjective with sum */
  if(vx&&norm(vx.lem)==='sum'&&!ppp){toks.forEach((t,i)=>{if(i===attrI&&t.c){attr=FR.adj(bestGloss(t.c),sG||(t.c.f.gen==='f'?'f':'m'),sN||t.c.f.num);used.add(i)}})}
  /* other words in source order */
  toks.forEach((t,i)=>{if(used.has(i))return;const x=t.c;if(!x){rest.push({i,txt:t.w});return}
    if(norm(x.lem)==='non'||norm(x.lem)==='ne'&&x.pos==='adv'){neg=true;return}
    if(x.pos==='conj'&&i===0){front.push(bestGloss(x));return}
    if(x.pos==='prep')return;
    if(x.pos==='pron'&&PERS_PRON[norm(x.lem)]!==undefined&&x.f.cas==='nom')return;
    rest.push({i,txt:bestGloss(x)||t.w})});
  if(toks.some((t,i)=>t.enc==='que'&&!NP.some(n=>n.coord&&n.coord.some(m=>m.i===i))))front.unshift('et');
  /* verb text */
  let vt='';
  if(vx){const o={neg,passive:pass,g:sG==='f'?'f':null,n:sN||(vx.f.num==='p'?'p':null),noPron:!!subj&&(vx.f.pers===3||!vx.f.pers)};
    const lemma=norm(vx.lem);
    if(lemma==='sum'&&!ppp)vgloss='être';
    vt=FR.conj(vgloss||'être',tense,pers,o);
    if(clitics.length){const cl=clitics.join(' ');if(o.noPron)vt=FR.elide(cl,vt);else{const m=vt.match(/^(je|j'|tu|il|elle|nous|vous|ils|elles)\s?/);if(m){const rest2=vt.slice(m[0].length);vt=(m[1]==="j'"?'je':m[1])+' '+FR.elide(cl,rest2)}else vt=FR.elide(cl,vt)}}
    if(infTxt)vt+=' '+infTxt;
    if(attr)vt+=' '+attr}
  else if(infTxt)vt=infTxt;
  rest.sort((a,b)=>a.i-b.i);
  let s=[...front,subj&&subj.txt,vt,...objs,...dats,...rest.map(r=>r.txt)].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  const cap=x=>x?x[0].toUpperCase()+x.slice(1)+(end==='?'?' ?':end):'';
  if(Q&&vt&&whSubj){const v3=FR.conj(vgloss||'être',tense,2,{neg,passive:pass,noPron:true});const tl=[...objs,...dats,...rest.map(r=>r.txt)].filter(Boolean).join(' ');VARS=['qui '+v3+' '+tl,'qui est-ce qui '+v3+' '+tl].map(x=>cap(x.replace(/\s+/g,' ').trim()));return VARS[0]}
  if(Q&&vt){VARS=FR.question({wh,subj:[...front,subj&&subj.txt].filter(Boolean).join(' ')||null,g:sG,n:sN,vt,tail:[...objs,...dats,...rest.map(r=>r.txt)].filter(Boolean).join(' ')}).map(cap);return VARS[0]}
  s=s.replace(/,\s*$/,'');return cap(s)}
/* expected French words per source token (for comparison) */
function expect(t){const x=t.c;if(!x)return [];const o=ovr(x);return [...new Set([o,...senses(x.gloss)].filter(Boolean))].slice(0,8)}
/* ending tables */
const TH={fr:{n:'nom',a:'adjectif',v:'verbe',decl:n=>n+(n===1?'re':'e')+' décl.',conj:n=>n==='irr'?'irrégulier':(n==='3m'?'3e mixte':n+(n===1?'re':'e'))+' conj.',en:'en',gen:'gén.',acl:n=>n+(n===1?'re':'e')+' classe'},
 de:{n:'Nomen',a:'Adjektiv',v:'Verb',decl:n=>n+'. Dekl.',conj:n=>n==='irr'?'unregelmäßig':(n==='3m'?'3. gem.':n+'.')+' Konj.',en:'auf',gen:'Gen.',acl:n=>n+'. Klasse'},
 en:{n:'noun',a:'adjective',v:'verb',decl:n=>(['','1st','2nd','3rd','4th','5th'][n])+' decl.',conj:n=>n==='irr'?'irregular':(n==='3m'?'3rd -io':['','1st','2nd','3rd','4th'][n])+' conj.',en:'in',gen:'gen.',acl:n=>(n===1?'1st/2nd':'3rd')+' decl.'},
 ru:{n:'сущ.',a:'прил.',v:'глагол',decl:n=>n+'-е скл.',conj:n=>n==='irr'?'неправ.':(n==='3m'?'3-е смеш.':n+'-е')+' спр.',en:'на',gen:'род.',acl:n=>n+'-й класс'}};
const CASE_ORDER=[['N',0],['V',1],['Ac',2],['G',3],['D',4],['Ab',5]];
function table(x,ui){if(!x)return null;const t=TH[ui]||TH.fr,P=D.par[x.L[1]],lemPlain=norm(x.lem).replace(/\d+$/,'');
  const end=(mo)=>{const d=P[mo];if(!d||!d.length)return '—';return [...new Set(d.map(([e])=>e===''?lemPlain:'-'+e))].join(', ')};
  const cl=classOf(x.L,x.pos==='verb'||x.f.mood?'v':'');
  if(x.pos==='noun'&&P['1']){const e1=P['1'][0][0],title=t.n+(cl&&cl.k==='decl'?' '+t.decl(cl.n):'')+(e1?' '+t.en+' -'+e1:' ('+t.gen+' '+end(4)+')');
    return {title,rows:CASE_ORDER.map(([c,k])=>[c,end(1+k),end(7+k)]),cols:['sg','pl'],cur:[(x.mo-1)%6,x.mo>6?2:1]}}
  if(x.pos==='adj'&&x.mo>=13&&x.mo<=48){const g=x.f.gen||'m',b={m:13,f:25,n:37}[g];const e1=(P[String(b)]||[[''] ])[0][0];
    return {title:t.a+(cl&&cl.k==='acl'?' '+t.acl(cl.n):'')+' · '+g,rows:CASE_ORDER.map(([c,k])=>[c,end(b+k),end(b+6+k)]),cols:['sg','pl'],cur:[(x.mo-b)%6,x.mo-b>=6?2:1]}}
  if((x.pos==='verb')&&x.f.pers&&/^(ind|subj)$/.test(x.f.mood)){const F=x.f,key=f=>[f.tense,f.mood,f.voice].join('|');let start=null;
    for(let m=x.mo-5;m<=x.mo;m++){let ok=true;for(let k=0;k<6;k++){const ff=feats(D.morph[m+k]||'');if(key(ff)!==key(F)||ff.pers!==(k%3)+1){ok=false;break}}if(ok){start=m;break}}
    if(start==null)return null;const lab=label(x,ui)[1].replace(/(\s·)?\s*\d(sg|pl)$/,'');
    return {title:t.v+(cl?' '+t.conj(cl.n):'')+' · '+lab,rows:[1,2,3].map(p=>[String(p),end(start+p-1),end(start+p+2)]),cols:['sg','pl'],cur:[(x.mo-start)%3,x.mo-start>=3?2:1]}}
  return null}
return {variants:()=>VARS,load,table,analyze:analyzeTok,choose,label,translate,expect,norm,cleanGloss,senses}})();
if(typeof module!=='undefined')module.exports=LA;
