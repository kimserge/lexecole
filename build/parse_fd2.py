import re,json
B='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
def b64(s):
    n=0
    for c in s:n=n*64+B.index(c)
    return n
D='/home/claude/work/ecole/src/fd2/fra-deu/'
d=open(D+'fra-deu.dict','rb').read()
seen=set();out={}
HEAD=re.compile(r'^(\S.*?)\s+(?:/[^/]*/\s*)*<([^>]*)>\s*$')
for l in open(D+'fra-deu.index',encoding='utf-8'):
    k,o,n=l.rstrip('\n').split('\t')
    if k.startswith('00'):continue
    o,n=b64(o),b64(n)
    if (o,n) in seen:continue
    seen.add((o,n))
    txt=d[o:o+n].decode('utf-8','replace')
    lines=txt.split('\n');cur=None;expect=False
    for ln in lines:
        m=HEAD.match(ln)
        if m and not re.match(r'^\d+\.',ln):
            hw=m.group(1).strip();pos=m.group(2);cur={'pos':pos,'s':[]};out.setdefault(hw,[]).append(cur);expect=True;continue
        if cur is None:continue
        m2=re.match(r'^(\d+)\.\s+(\S.*)$',ln)
        if m2:
            fr=re.sub(r'\s+\d+\.$','',m2.group(2)).strip()
            cur['s'].append(fr);expect=False;continue
        if expect and ln.strip():
            cur['s'].append(re.sub(r'\s+\d+\.$','',ln.strip()));expect=False
json.dump(out,open('/tmp/fd2.json','w'),ensure_ascii=False)
print(len(out))
for w in ['maison','aller','beau','vélo']:
    print(w,out.get(w))
