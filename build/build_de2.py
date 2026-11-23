import json,collections,re,os,shutil
fd=json.load(open('/tmp/fd.json')); fd2=json.load(open('/tmp/fd2.json'))
G={}
for f in ('de_fr_1.tsv','de_fr_2.tsv','de_fr_3.tsv'):
    for l in open(f,encoding='utf-8'):
        l=l.rstrip('\n')
        if '\t' in l:
            a,b=l.split('\t',1);G.setdefault(a,b)
def clean(x):return re.sub(r'#\S*','',re.sub(r'\([^)]*\)','',x.replace('’',"'"))).strip(' ,;')
def fdgloss(w):
    e=fd.get(w)
    if not e:return ''
    ss=[]
    for ent in e:
        for s in ent['s']:
            s=', '.join([clean(t) for t in s.split(',')][:3]).strip(', ')
            if s and s not in ss:ss.append(s)
    return '; '.join(ss[:4])
INV=collections.defaultdict(list)
for fr,ents in fd2.items():
    for ent in ents:
        for s in ent['s'][:2]:
            for de in s.split(','):
                de=clean(de)
                if de and len(INV[de])<4 and fr not in INV[de]:INV[de].append(fr)
CLOSED=('ART','PRO','PRP','KON','ADV','ZAL','NEG','ZUS','INJ','ABK')
def gloss(s):
    g=G.get(s)
    f=fdgloss(s)
    if g and f:
        extra=[x for x in re.split(r'[,;]\s*',f) if x and x not in re.split(r'[,;]\s*',g)]
        return g+('; '+', '.join(extra[:5]) if extra else '')
    if g:return g
    if f:return f
    if s in INV:return ', '.join(INV[s])
    return None
lem={};lems=[];tags={};tl=[]
forms=collections.defaultdict(list);par=collections.defaultdict(list)
for l in open('/tmp/de.tsv',encoding='utf-8'):
    w,s,t=l.rstrip('\n').split('\t');p=t.split(':')[0]
    if p=='SUB' and ':ADJ' in t:continue
    if s not in lem:
        g=gloss(s)
        if g is None and p not in CLOSED:continue
        lem[s]=len(lems);lems.append([s,g or ''])
    li=lem[s]
    if t not in tags:tags[t]=len(tl);tl.append(t)
    forms[w].append([li,tags[t]]);par[li].append([w,tags[t]])
def key(w):
    w=w.lower()[:2]
    m={'ä':'a1','ö':'o1','ü':'u1','ß':'s1'}
    k=''.join(m.get(c,c if 'a'<=c<='z' else '_') for c in w)
    return (k+'_')[:2] if len(k)<2 else k
OUT='/home/claude/work/ecole/app/data/de'
shutil.rmtree(OUT,ignore_errors=True);os.makedirs(OUT+'/f');os.makedirs(OUT+'/p')
fc=collections.defaultdict(dict)
for w,a in forms.items():fc[key(w)][w]=a
for k,v in fc.items():json.dump(v,open(f'{OUT}/f/{k}.json','w'),ensure_ascii=False,separators=(',',':'))
pc=collections.defaultdict(dict)
for li,a in par.items():pc[key(lems[li][0])][li]=a
for k,v in pc.items():json.dump(v,open(f'{OUT}/p/{k}.json','w'),ensure_ascii=False,separators=(',',':'))
json.dump({'lemmas':lems,'tags':tl},open(f'{OUT}/lem.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(lems),len(forms),len(fc),len(pc))
