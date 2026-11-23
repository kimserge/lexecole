/* LexEcôle — French generation: conjugation, articles, agreement (own code, MIT) */
'use strict';
const FR=(()=>{
const PRON=['je','tu','il','nous','vous','ils'],PRONF=['je','tu','elle','nous','vous','elles'],REFL=['me','te','se','nous','vous','se'];
const ETRE_AUX=new Set('aller venir arriver partir sortir entrer rentrer rester tomber mourir naître devenir revenir retourner monter descendre passer apparaître disparaître parvenir survenir'.split(' '));
// irregular verbs: [pres6, impfStem, futStem, pp, subjStems [je, nous]]
const IRR={
 'être':[['suis','es','est','sommes','êtes','sont'],'ét','ser','été',['soi','soy'],['sois','sois','soit','soyons','soyez','soient']],
 'avoir':[['ai','as','a','avons','avez','ont'],'av','aur','eu',null,['aie','aies','ait','ayons','ayez','aient']],
 'aller':[['vais','vas','va','allons','allez','vont'],'all','ir','allé',['aill','all']],
 'faire':[['fais','fais','fait','faisons','faites','font'],'fais','fer','fait',['fass','fass']],
 'dire':[['dis','dis','dit','disons','dites','disent'],'dis','dir','dit',['dis','dis']],
 'pouvoir':[['peux','peux','peut','pouvons','pouvez','peuvent'],'pouv','pourr','pu',['puiss','puiss']],
 'vouloir':[['veux','veux','veut','voulons','voulez','veulent'],'voul','voudr','voulu',['veuill','voul']],
 'devoir':[['dois','dois','doit','devons','devez','doivent'],'dev','devr','dû',['doiv','dev']],
 'savoir':[['sais','sais','sait','savons','savez','savent'],'sav','saur','su',['sach','sach']],
 'voir':[['vois','vois','voit','voyons','voyez','voient'],'voy','verr','vu',['voi','voy']],
 'venir':[['viens','viens','vient','venons','venez','viennent'],'ven','viendr','venu',['vienn','ven']],
 'tenir':[['tiens','tiens','tient','tenons','tenez','tiennent'],'ten','tiendr','tenu',['tienn','ten']],
 'prendre':[['prends','prends','prend','prenons','prenez','prennent'],'pren','prendr','pris',['prenn','pren']],
 'mettre':[['mets','mets','met','mettons','mettez','mettent'],'mett','mettr','mis',['mett','mett']],
 'écrire':[['écris','écris','écrit','écrivons','écrivez','écrivent'],'écriv','écrir','écrit',['écriv','écriv']],
 'lire':[['lis','lis','lit','lisons','lisez','lisent'],'lis','lir','lu',['lis','lis']],
 'croire':[['crois','crois','croit','croyons','croyez','croient'],'croy','croir','cru',['croi','croy']],
 'boire':[['bois','bois','boit','buvons','buvez','boivent'],'buv','boir','bu',['boiv','buv']],
 'vivre':[['vis','vis','vit','vivons','vivez','vivent'],'viv','vivr','vécu',['viv','viv']],
 'suivre':[['suis','suis','suit','suivons','suivez','suivent'],'suiv','suivr','suivi',['suiv','suiv']],
 'connaître':[['connais','connais','connaît','connaissons','connaissez','connaissent'],'connaiss','connaîtr','connu',['connaiss','connaiss']],
 'naître':[['nais','nais','naît','naissons','naissez','naissent'],'naiss','naîtr','né',['naiss','naiss']],
 'partir':[['pars','pars','part','partons','partez','partent'],'part','partir','parti',['part','part']],
 'sortir':[['sors','sors','sort','sortons','sortez','sortent'],'sort','sortir','sorti',['sort','sort']],
 'dormir':[['dors','dors','dort','dormons','dormez','dorment'],'dorm','dormir','dormi',['dorm','dorm']],
 'sentir':[['sens','sens','sent','sentons','sentez','sentent'],'sent','sentir','senti',['sent','sent']],
 'servir':[['sers','sers','sert','servons','servez','servent'],'serv','servir','servi',['serv','serv']],
 'courir':[['cours','cours','court','courons','courez','courent'],'cour','courr','couru',['cour','cour']],
 'mourir':[['meurs','meurs','meurt','mourons','mourez','meurent'],'mour','mourr','mort',['meur','mour']],
 'ouvrir':[['ouvre','ouvres','ouvre','ouvrons','ouvrez','ouvrent'],'ouvr','ouvrir','ouvert',['ouvr','ouvr']],
 'offrir':[['offre','offres','offre','offrons','offrez','offrent'],'offr','offrir','offert',['offr','offr']],
 'fuir':[['fuis','fuis','fuit','fuyons','fuyez','fuient'],'fuy','fuir','fui',['fui','fuy']],
 'recevoir':[['reçois','reçois','reçoit','recevons','recevez','reçoivent'],'recev','recevr','reçu',['reçoiv','recev']],
 'craindre':[['crains','crains','craint','craignons','craignez','craignent'],'craign','craindr','craint',['craign','craign']],
 'vaincre':[['vaincs','vaincs','vainc','vainquons','vainquez','vainquent'],'vainqu','vaincr','vaincu',['vainqu','vainqu']],
 'rire':[['ris','ris','rit','rions','riez','rient'],'ri','rir','ri',['ri','ri']],
 'conduire':[['conduis','conduis','conduit','conduisons','conduisez','conduisent'],'conduis','conduir','conduit',['conduis','conduis']],
 'battre':[['bats','bats','bat','battons','battez','battent'],'batt','battr','battu',['batt','batt']],
 'plaire':[['plais','plais','plaît','plaisons','plaisez','plaisent'],'plais','plair','plu',['plais','plais']],
 'falloir':[['faut','faut','faut','faut','faut','faut'],'fall','faudr','fallu',['faill','faill']],
 'pleuvoir':[['pleut','pleut','pleut','pleut','pleut','pleuvent'],'pleuv','pleuvr','plu',['pleuv','pleuv']],
 'valoir':[['vaux','vaux','vaut','valons','valez','valent'],'val','vaudr','valu',['vaill','val']],
 'asseoir':[['assieds','assieds','assied','asseyons','asseyez','asseyent'],'assey','assiér','assis',['assey','assey']],
 'rompre':[['romps','romps','rompt','rompons','rompez','rompent'],'romp','rompr','rompu',['romp','romp']],
 'cueillir':[['cueille','cueilles','cueille','cueillons','cueillez','cueillent'],'cueill','cueiller','cueilli',['cueill','cueill']],
 'résoudre':[['résous','résous','résout','résolvons','résolvez','résolvent'],'résolv','résoudr','résolu',['résolv','résolv']],
 'taire':[['tais','tais','tait','taisons','taisez','taisent'],'tais','tair','tu',['tais','tais']],
 'mentir':[['mens','mens','ment','mentons','mentez','mentent'],'ment','mentir','menti',['ment','ment']],
};
// families sharing a pattern: prefix + base
const FAM=[['venir',/(re|de|sur|par|con|pré|pro|sou|inter|ad)?venir$/],['tenir',/(ap|ob|re|con|main|sou|dé|abs|ad)?tenir$/],['prendre',/(ap|com|re|sur|en|dé)?prendre$/],['mettre',/(per|pro|ad|re|sou|com|ad|o|trans|é)?mettre$/],['écrire',/(d|in|ins|pres|pro|sous|ré)?écrire$|(d|ins|pres|pro|sous)crire$/],['conduire',/(con|pro|ré|in|intro|tra|sé|dé|cons|re|cui)duire$|truire$|nuire$|luire$/],['battre',/(com|dé|ab|re)?battre$/],['craindre',/[aeo]indre$/],['ouvrir',/(ou|cou|dé|re)vrir$/],['offrir',/(of|souf)frir$/],['recevoir',/cevoir$/],['partir',/(re)?partir$/],['sortir',/(re)?sortir$/],['sentir',/(con|res|pres)?sentir$/],['servir',/(des|re)?servir$/],['dormir',/(en|re)?dormir$/],['courir',/(ac|con|dis|en|par|re|se|sec)?courir$/],['suivre',/(pour)?suivre$/],['vivre',/(re|sur)?vivre$/],['faire',/(re|dé|satis|contre|par)?faire$/],['dire',/(re|contre|pré|inter|mé)dire$/],['voir',/(re|pré|entre)?voir$/],['vaincre',/(con)?vaincre$/],['plaire',/(dé|com)?plaire$/]];
const IR3=new Set(['partir','sortir','dormir','sentir','servir','courir','mourir','ouvrir','offrir','fuir','cueillir','mentir','venir','tenir']);
function fam(v){if(IRR[v])return [v,''];for(const [b,re] of FAM){if(re.test(v)){const k=b.replace(/^.*?(venir|tenir|prendre|mettre|écrire|conduire|battre|craindre|connaître|ouvrir|offrir|recevoir|partir|sortir|sentir|servir|dormir|courir|suivre|vivre|faire|dire|voir|vaincre|plaire)$/,'$1');
  if(b==='écrire'&&/crire$/.test(v)&&!/écrire$/.test(v))return ['écrire',v.slice(0,-5)+'é' ,true];
  if(b==='conduire'){const stem=v.slice(0,-2);return [null,stem,'uire']}
  if(b==='craindre'){return [null,v.slice(0,-4),'indre']}
  if(b==='connaître'){return ['connaître',v.slice(0,-9),'x']}
  if(b==='recevoir'){return ['recevoir',v.slice(0,-8)+'re',true]}
  return [b,v.slice(0,v.length-b.length)]}}return null}
const elide=(p,w)=>/^[aeiouyéèêâîôûœh]/i.test(w)&&/^(je|me|te|se|ne|le|la|de|que)$/.test(p)?p.slice(0,-1)+"'"+w:p+' '+w;
function regPres(v){
  if(v.endsWith('er')){let s=v.slice(0,-2);const e=['e','es','e','ons','ez','ent'];
    return e.map((x,i)=>{let st=s;
      if(i===3&&/c$/.test(st))st=st.slice(0,-1)+'ç';if(i===3&&/g$/.test(st))st+='e';
      if(i!==3&&i!==4){if(/(ay|oy|uy)$/.test(st)&&!/ay$/.test(st))st=st.slice(0,-1)+'i';
        if(/^(appel|rappel|jet|rejet)$/.test(st)||/(app|rapp)el$/.test(st))st+=st.slice(-1);
        else if(/[^aeiouyé]e[^aeiouy]$/.test(st)&&!/(ell|ett)$/.test(st))st=st.replace(/e([^aeiouy])$/,'è$1');
        else if(/é[^aeiouy]{1,2}$/.test(st))st=st.replace(/é([^aeiouy]{1,2})$/,'è$1')}
      return st+x})}
  if(v.endsWith('ir')){const s=v.slice(0,-2);return ['is','is','it','issons','issez','issent'].map(x=>s+x)}
  if(v.endsWith('re')){const s=v.slice(0,-2);return ['s','s','','ons','ez','ent'].map(x=>s+x)}
  return [v,v,v,v,v,v]}
function data(v){
  if(IRR[v])return IRR[v];
  const f=fam(v);
  if(f&&f[0]&&IRR[f[0]]){const b=IRR[f[0]];let pre=f[1];if(f[2]===true){/* stem replaces leading part */}
    const strip=f[0];const pfx=v.slice(0,v.length-strip.length);
    if(f[0]==='écrire'&&!v.endsWith('écrire')){const p=v.slice(0,-5);return [b[0].map(x=>p+x.slice(1)),p+b[1].slice(1),p+b[2].slice(1),p+b[3].slice(1),b[4].map(x=>p+x.slice(1))]}
    if(f[0]==='recevoir'){const p=v.slice(0,-6);return [b[0].map(x=>p+x.slice(2)),p+b[1].slice(2),p+b[2].slice(2),p+b[3].slice(2),b[4].map(x=>p+x.slice(2))]}
    return [b[0].map(x=>pfx+x),pfx+b[1],pfx+b[2],pfx+b[3],b[4]&&b[4].map(x=>pfx+x),b[5]&&b[5].map(x=>pfx+x)]}
  if(/aître$/.test(v)&&!/naître$/.test(v)||/connaître$/.test(v)){const st=v.slice(0,-5);return [['ais','ais','aît','aissons','aissez','aissent'].map(x=>st+x),st+'aiss',st+'aîtr',st.replace(/aiss$/,'')+'u',[st+'aiss',st+'aiss']]}
  if(f&&f[2]==='uire'){const s=f[1];return [['s','s','t','sons','sez','sent'].map(x=>s+x),s+'s',v.slice(0,-1),s+'t',[s+'s',s+'s']]}
  if(f&&f[2]==='indre'){const s=f[1];return [['ins','ins','int','ignons','ignez','ignent'].map(x=>s+x),s+'ign',v.slice(0,-1),s+'int',[s+'ign',s+'ign']]}
  const pr=regPres(v);let impf,fut,pp,subj;if(v==='envoyer'||v==='renvoyer')return [pr,v.slice(0,-3)+'oy',v.slice(0,-5)+'verr',v.slice(0,-2)+'é',[v.slice(0,-3)+'oi',v.slice(0,-3)+'oy']];
  if(v.endsWith('er')){const s=v.slice(0,-2);impf=pr[3].slice(0,-3);fut=(/[^aeiouyé]e[^aeiouy]$/.test(s)||/^(appel|rappel|jet|rejet)$/.test(s)||/[ou]y$/.test(s))?pr[0]+'r':v;pp=s+'é';subj=[pr[5].slice(0,-3),pr[3].slice(0,-3)]}
  else if(v.endsWith('ir')){const s=v.slice(0,-2);impf=s+'iss';fut=v;pp=s+'i';subj=[s+'iss',s+'iss']}
  else if(v.endsWith('re')){const s=v.slice(0,-2);impf=s;fut=v.slice(0,-1);pp=s+'u';subj=[s,s]}
  else {impf=v;fut=v;pp=v;subj=[v,v]}
  return [pr,impf,fut,pp,subj]}
const IMPF=['ais','ais','ait','ions','iez','aient'],FUT=['ai','as','a','ons','ez','ont'],COND=['ais','ais','ait','ions','iez','aient'],SUBJ=['e','es','e','ions','iez','ent'];
function fixImpf(st,e){if(/ç$|c$/.test(st))st=st.replace(/c$/,'ç');if(/g$/.test(st)&&/^a/.test(e))st+='e';if(/ç$/.test(st)&&/^i/.test(e))st=st.slice(0,-1)+'c';return st+e}
function simple(v,t,p){const d=data(v);
  if(t==='pres')return d[0][p];
  if(t==='impf')return fixImpf(d[1],IMPF[p]);
  if(t==='fut')return d[2]+FUT[p];
  if(t==='cond')return d[2]+COND[p];
  if(t==='subj'){if(d[5])return d[5][p];const s=d[4]||[d[1],d[1]];return (p===3||p===4?s[1]:s[0])+SUBJ[p]}
  if(t==='imp'){const f=d[0][p];return p===1&&/es$/.test(f)&&v.endsWith('er')?f.slice(0,-1):f}
  if(t==='pp')return d[3];
  return v}
function isRefl(v){return /^s'|^se /.test(v)}
function base(v){return v.replace(/^s'|^se /,'')}
function agreePP(pp,g,n){if(!g&&!n)return pp;let s=pp;if(g==='f'&&!/e$/.test(s))s+='e';if(n==='p'&&!/[sx]$/.test(s))s+='s';return s}
/* conj(verb gloss, tense, person 0-5, {neg, refl, passive, g, n, noPron}) → string */
function conj(v,t,p,o={}){v=v.trim();if(!o.n&&p>=3)o=Object.assign({},o,{n:'p'});const refl=isRefl(v);let b=base(v);
  const pron=o.noPron?'':(o.g==='f'&&(p===2||p===5)?PRONF:PRON)[p];
  let aux=null,main,ppAgree=false;
  const comp={pc:'pres',pqp:'impf',fa:'fut',condp:'cond',subjp:'subj'};
  if(o.passive){aux='être';ppAgree=true}
  if(t==='inf'){let s=o.passive?'être '+agreePP(simple(b,'pp'),o.g,o.n):b;if(refl)s=elide('se',s);return o.neg?'ne pas '+s:s}
  if(t==='infp'){return (o.passive?'avoir été ':(ETRE_AUX.has(b)||refl?'être ':'avoir '))+agreePP(simple(b,'pp'),o.g,o.n)}
  if(t==='ppr'){return refl?elide('se',b.replace(/er$|ir$|re$/,'')+'ant'):(data(b)[1].replace(/^(.*)$/,'$1')+'ant')}
  if(t==='ppass'){return agreePP(simple(b,'pp'),o.g,o.n)}
  let words;
  if(o.passive){const at=comp[t]?t:t;const auxForm=comp[t]?conj('avoir',comp[t],p,{noPron:true})+' été':simple('être',t,p);words=[auxForm,agreePP(simple(b,'pp'),o.g,o.n)]}
  else if(comp[t]){const ae=ETRE_AUX.has(b)||refl;words=[simple(ae?'être':'avoir',comp[t],p),agreePP(simple(b,'pp'),ae?o.g:null,ae?o.n:null)]}
  else words=[simple(b,t,p)];
  let head=words[0];if(refl)head=elide(REFL[p],head);
  if(o.neg)head=elide('ne',head)+' pas';
  let s=[head,...words.slice(1)].join(' ');
  if(t==='imp')return refl?s+'-'+(p===1?'toi':p===3?'nous':'vous'):s;
  return pron?elide(pron,s):s}
/* nouns, articles, adjectives */
let FEM=new Set();
function setFem(list){FEM=new Set(list)}
const MASC=new Set('mythe monde livre temple peuple signe nombre ordre siècle genre groupe rêve verre arbre homme frère père rôle globe crime risque problème système poème thème membre centre chiffre titre mètre astre désastre fleuve rivage voyage courage visage âge village message mariage nuage fromage royaume triomphe empire vice service sacrifice supplice édifice silence génie incendie remède mystère caractère ministère collège piège siège privilège modèle zèle style exemple spectacle obstacle miracle oracle cercle oncle muscle couple trouble sable câble meuble golfe texte prétexte tombeau navire messager juge guide prince roi dieu chef poète prophète pirate athlète consul sénat camp champ glaive bouclier casque fossé fleuve lièvre loup'.split(' '));
function genderOf(n,fallback){n=n.trim();const h=n.split(' ')[0];if(FEM.has(n)||FEM.has(h))return 'f';if(MASC.has(n)||MASC.has(h))return 'm';if(fallback==='f'&&!/(ment|age|eau|isme|eur)$/.test(n))return 'f';if(fallback)return fallback==='n'?'m':fallback;return /(tion|sion|té|ure|ette|ence|ance|ie|ée|ise)$/.test(n)?'f':'m'}
function plural(w){let stop=false;return w.split(' ').map(x=>{if(stop||/^(de|d'.*|du|à|en|au|aux)$/.test(x)){stop=true;return x}return pl1(x)}).join(' ')}
function pl1(m){{if(/[sxz]$/.test(m))return m;if(/(au|eu|eau)$/.test(m))return m+'x';if(/al$/.test(m)&&!/(bal|carnaval|festival|chacal)$/.test(m))return m.slice(0,-2)+'aux';if(/ail$/.test(m)&&/(trav|vitr|ém|cor|bail)ail$/.test(m))return m.slice(0,-3)+'aux';return m+'s'}}
function art(def,g,n,w){if(n==='p')return def?'les':'des';if(!def)return g==='f'?'une':'un';if(/^[aeiouyéèêâîôûœh]/i.test(w)&&!/^h(aut|ér|ach|ibou|ache|asard|aine|ameau|ibou|ollande)/i.test(w))return "l'";return g==='f'?'la':'le'}
function np(n,o={}){let w=n,g=o.g||'m',num=o.n||'s';if(num==='p')w=plural(w);const a=o.art===false?'':art(o.def!==false,g,num,w);return (a.endsWith("'")?a+w:(a?a+' ':'')+w)}
const INV_ADJ=/^(marron|orange|super|bien|bon marché)$/;
const BEFORE=new Set('grand petit bon mauvais beau joli jeune vieux nouveau long gros haut premier dernier autre même seul'.split(' '));
function adj(a,g,n){a=a.trim();if(INV_ADJ.test(a))return a;let s=a;
  if(g==='f'){const irr={beau:'belle',nouveau:'nouvelle',vieux:'vieille',bon:'bonne',gros:'grosse',long:'longue',blanc:'blanche',frais:'fraîche',doux:'douce',faux:'fausse',public:'publique',sec:'sèche',gentil:'gentille',fou:'folle',mou:'molle',favori:'favorite',grec:'grecque',roux:'rousse'};
    if(irr[s])s=irr[s];else if(/e$/.test(s));else if(/eux$/.test(s))s=s.slice(0,-1)+'se';else if(/eur$/.test(s)&&!/(meilleur|supérieur|inférieur|extérieur|intérieur|majeur|mineur)$/.test(s))s=s.slice(0,-1)+'se';else if(/if$/.test(s))s=s.slice(0,-1)+'ve';else if(/er$/.test(s))s=s.slice(0,-2)+'ère';else if(/(el|eil|en|on|et)$/.test(s)&&!/(complet|secret|inquiet|concret)$/.test(s))s=s+s.slice(-1)+'e';else if(/(complet|secret|inquiet|concret)$/.test(s))s=s.slice(0,-2)+'ète';else s+='e'}
  if(n==='p'){if(/[sx]$/.test(s));else if(/eau$/.test(s))s+='x';else if(/al$/.test(s)&&g!=='f')s=s.slice(0,-2)+'aux';else s+='s'}
  return s}
/* questions: variants with inversion, est-ce que, intonation */
const PRS=/^(je|j'|tu|il|elle|on|nous|vous|ils|elles)\s?/;
function invPron(v){const m=v.match(PRS);if(!m)return null;const p=m[1]==="j'"?'je':m[1];if(p==='je')return null;const r=v.slice(m[0].length).split(' ');if(/^(ne|n'|me|m'|te|t'|se|s'|le|la|l'|les|lui|leur|nous|vous)$/.test(r[0])||/'/.test(r[0]))return null;const f=r[0];const t=/[ae]$/.test(f)&&/^(il|elle|on)$/.test(p)?'-t-':'-';return [f+t+p,...r.slice(1)].join(' ')}
function invNP(v,g,n){const r=v.split(' ');if(/^(ne|n'|me|m'|te|t'|se|s'|le|la|l'|les|lui|leur|nous|vous)$/.test(r[0])||/'/.test(r[0]))return null;const p=n==='p'?(g==='f'?'elles':'ils'):(g==='f'?'elle':'il');const f=r[0];const t=/[ae]$/.test(f)&&/^(il|elle)$/.test(p)?'-t-':'-';return [f+t+p,...r.slice(1)].join(' ')}
function question(o){const wh=o.wh||'',tail=o.tail||'',core=[o.subj,o.vt,tail].filter(Boolean).join(' ');const out=[];
  const esk=(wh==='que'?"qu'est-ce ":wh?wh+' est-ce ':'est-ce ')+(/^[aeiouyéèêh]/i.test(core)?"qu'"+core:'que '+core);
  let inv=null;if(o.subj){const iv=invNP(o.vt,o.g,o.n);if(iv)inv=[wh==='que'?null:wh,o.subj,iv,tail].filter(Boolean).join(' ')}else{const iv=invPron(o.vt);if(iv)inv=[wh,iv,tail].filter(Boolean).join(' ')}
  if(inv&&!(wh==='que'&&o.subj))out.push(inv);out.push(esk);if(!wh)out.push(core);else out.push(core+' '+(wh==='que'?'quoi':wh));
  return out.map(x=>x.replace(/\s+/g,' ').trim())}
return {question,conj,np,adj,art,plural,genderOf,setFem,BEFORE,elide,PRON,simple,data}})();
if(typeof module!=='undefined')module.exports=FR;
