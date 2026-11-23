import json,collections
G={}
for f in ('de_fr_1.tsv','de_fr_2.tsv','de_fr_3.tsv'):
    try:
        for l in open('/home/claude/work/ecole/build/'+f,encoding='utf-8'):
            l=l.rstrip('\n')
            if '\t' in l:
                a,b=l.split('\t',1);G.setdefault(a,b)
    except FileNotFoundError: pass
CLOSED=('ART','PRO','PRP','KON','ADV','ZAL','NEG','ZUS','INJ','ABK')
lem={};lems=[];tags={};tl=[];forms=collections.defaultdict(list)
for l in open('/tmp/de.tsv',encoding='utf-8'):
    w,s,t=l.rstrip('\n').split('\t')
    p=t.split(':')[0]
    if s not in G and p not in CLOSED: continue
    if p in('PA1','PA2') and s not in G: continue
    if p=='SUB' and ':ADJ' in t: continue
    if s not in lem: lem[s]=len(lems);lems.append([s,G.get(s,'')])
    if t not in tags: tags[t]=len(tl);tl.append(t)
    forms[w].append([lem[s],tags[t]])
json.dump({'lemmas':lems,'tags':tl,'forms':forms},open('/home/claude/work/ecole/app/data/de.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(lems),len(forms),len(tl),sum(1 for s in G if s not in lem),[s for s in G if s not in lem][:40])
