import re, json, unicodedata, collections
D='/home/claude/work/ecole/src/collatinus/bin/data/'
def lines(f):
    for l in open(D+f,encoding='utf-8'):
        l=l.rstrip('\n')
        if not l.strip() or l.startswith('!'): continue
        yield l
def deram(s):
    s=unicodedata.normalize('NFD',s)
    s=''.join(c for c in s if unicodedata.category(c)!='Mn')
    s=s.replace('æ','ae').replace('œ','oe').replace('Æ','Ae').replace('Œ','Oe')
    s=s.lower().replace('j','i').replace('v','u')
    return s
# variables
V={};mods={};order=[]
cur=None
for l in lines('modeles.la'):
    if l.startswith('$'):
        k,v=l.split('=',1);V[k]=v;continue
    if l.startswith('modele:'):
        cur=l.split(':',1)[1].strip();mods[cur]=[];order.append(cur);continue
    mods[cur].append(l)
def subvars(l):
    rx=re.compile(r'[:;](\w*)\+?(\$\w+)')
    while True:
        m=rx.search(l)
        if not m: return l
        v=m.group(2);var=V[v];pre=m.group(1)
        if pre: var=var.replace(';',';'+pre)
        l=l.replace(v,var,1)
def listeI(s):
    r=[]
    for p in s.split(','):
        if '-' in p:
            a,b=p.split('-');r+=list(range(int(a),int(b)+1))
        else: r.append(int(p))
    return r
M={}
class Mod: pass
for name in order:
    m=Mod();m.name=name;m.pere=None;m.pos='';m.des=collections.defaultdict(list);m.R={};m.abs=[];m.suf=''
    msuff=collections.defaultdict(list)
    for l in mods[name]:
        l=subvars(l);e=l.strip().split(':');k=e[0]
        if k=='pere': m.pere=M[e[1]]
        elif k in('des','des+'):
            li=listeI(e[1]);r=int(e[2]);ld=e[3].split(';')
            for i,mo in enumerate(li):
                g=ld[i] if i<len(ld) else ld[-1]
                for x in g.split(','): m.des[mo].append((x,r))
            if k=='des+' and m.pere:
                for mo in li:
                    for (x,r2) in m.pere.des.get(mo,[]): m.des[mo].append((x+m.suf,r2))
        elif k=='R': m.R[int(e[1])]=e[2]
        elif k=='abs': m.abs=listeI(e[1])
        elif k=='abs+': m.abs+=listeI(e[1])
        elif k=='suf':
            for mo in listeI(e[1]): msuff[e[2]].append(mo)
        elif k=='sufd':
            if m.pere:
                m.suf=e[1]
                for mo,ld in m.pere.des.items():
                    if mo in m.abs: continue
                    for (x,r2) in ld: m.des[mo].append(((x if x!='-' else '')+m.suf,r2))
        elif k=='pos': m.pos=e[1][0]
    if m.pere:
        if not m.pos: m.pos=m.pere.pos
        for mo,ld in m.pere.des.items():
            if mo in m.des: continue
            if mo in m.abs: continue
            for (x,r2) in ld: m.des[mo].append((x+m.suf,r2))
        for mo,ld in m.des.items():
            for (x,r2) in ld:
                if r2 not in m.R and r2 in m.pere.R: m.R[r2]=m.pere.R[r2]
        m.abs=m.pere.abs
    add=[]
    for suff,mos in msuff.items():
        for mo,ld in list(m.des.items()):
            if mo in mos:
                for (x,r2) in ld: add.append((mo,(('' if x=='-' else x)+suff,r2)))
    for mo,d in add: m.des[mo].append(d)
    M[name]=m
# root ancestor for declension/conjugation
def root(m):
    while m.pere: m=m.pere
    return m.name
# morphos
morph={}
for l in lines('morphos.fr'):
    if ':' in l:
        n,t=l.split(':',1)
        if n.isdigit(): morph[int(n)]=t
# translations
def trads(f):
    t={}
    try:
        for l in lines(f):
            if ':' in l:
                k,v=l.split(':',1);t[k]=v
    except FileNotFoundError: pass
    return t
TR={L:trads('lemmes.'+L) for L in ('fr','de','en')}
# lemmas
lemmas=[];rad=collections.defaultdict(list)
for l in lines('lemmes.la'):
    e=l.split('|')
    if len(e)<6: e+=['']*(6-len(e))
    lg=e[0].split('=');grd=lg[0];grq=lg[1] if len(lg)>1 else grd
    key=re.sub(r'\d+$','',deram(grd)) ; keyn=deram(grd)  # keyn keeps homonym number
    mname=e[1]
    if mname not in M: continue
    m=M[mname];idx=len(lemmas)
    info=e[4];freq=int(re.match(r'\d*',e[5]).group() or 0)
    pos=''
    for tag,p in (('adj.','a'),('conj','c'),('interj','i'),('num.','m'),('pron.','p'),('prép','r'),('adv','d'),(' nom ','n'),('npr.','n')):
        if tag in info: pos+=p
    if not pos: pos=m.pos
    gk=unicodedata.normalize('NFC',re.sub(r'\d+$','',grd))
    tk=re.sub(r'[̀-ͯ]','',unicodedata.normalize('NFD',grd))
    tr={L:TR[L].get(tk) or TR[L].get(keyn) or '' for L in TR}
    lemmas.append([re.sub(r'\d+$','',grq.split(',')[0]),order.index(mname),info,freq,pos,tr['fr'],tr['de'],tr['en']])
    given={}
    for i in (2,3):
        if e[i]:
            for r in e[i].split(','): given.setdefault(i-1,[]).append(r)
    for i,rs in given.items():
        for r in rs: rad[deram(r)].append([idx,i])
    for i,gen in m.R.items():
        if i in given: continue
        for g in grq.split(','):
            if gen=='-': continue
            if gen=='K': r=g
            else:
                o,a=(gen.split(',')+['0'])[:2];o=int(o)
                gg=unicodedata.normalize('NFC',g)
                if gg.endswith('̆'): gg=gg[:-1]
                # chop by characters of NFC string
                r=gg[:len(gg)-o] if o else gg
                if a!='0': r+=a
            rad[deram(r)].append([idx,i])
# 'cf. X' references: borrow translations
byk={}
for i,L in enumerate(lemmas): byk.setdefault(deram(re.sub(r'[\u0300-\u036f]','',unicodedata.normalize('NFD',L[0]))),[]).append(i)
for L in lemmas:
    m=re.search(r'cf\.\s*(\w+)',L[2])
    if m and not L[5]:
        cs=byk.get(deram(m.group(1)),[])
        cs=[k for k in cs if lemmas[k][5]]
        same=[k for k in cs if M[order[lemmas[k][1]]].pos==M[order[L[1]]].pos or order[lemmas[k][1]] in ('lupus','uita','miles') and order[L[1]] in ('delos','lupus')]
        j=(same or cs or [None])[0]
        if j is not None: L[5],L[6],L[7]=lemmas[j][5],lemmas[j][6],lemmas[j][7]
# desinences index
des=collections.defaultdict(list)
for mi,name in enumerate(order):
    for mo,ld in M[name].des.items():
        for (x,r) in ld:
            d='' if x=='-' else deram(x)
            des[d].append([mi,mo,r])
# irregs
irr=collections.defaultdict(list)
lk={}
for i,L in enumerate(lemmas): lk.setdefault(deram(L[0]),i)
for l in lines('irregs.la'):
    e=l.split(':')
    if len(e)<3: continue
    f=deram(e[0].rstrip('*'));lem=re.sub(r'\d+$','',deram(e[1]))
    if lem in lk:
        for mo in listeI(e[2]): irr[f].append([lk[lem],mo])
def chain(m):
    r=[]
    while m: r.append(m.name);m=m.pere
    return r
par=[]
for name in order:
    pm={}
    for mo,ld in M[name].des.items():
        pm[mo]=sorted(set((('' if x=='-' else deram(x)),r) for (x,r) in ld))
    par.append({str(k):[[a,b] for a,b in v] for k,v in pm.items()})
out={'par':par,'models':[[n,M[n].pos,chain(M[n])] for n in order],'morph':morph,'lemmas':lemmas,'rad':rad,'des':des,'irr':irr}
json.dump(out,open('/home/claude/work/ecole/app/data/la.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(lemmas),len(rad),len(des),len(irr))
