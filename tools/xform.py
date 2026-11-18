import json,sys,copy
s=json.load(open(sys.argv[1])); dx,dy,sc=float(sys.argv[3]),float(sys.argv[4]),float(sys.argv[5])
f=lambda p:[round(p[0]*sc+dx),round(p[1]*sc+dy)]
t=copy.deepcopy(s)
for r in t['rooms']:
  r['poly']=[f(p) for p in r['poly']]; r['label']=f(r['label'])
  if 'dimRect' in r: a=f(r['dimRect'][:2]);b=f(r['dimRect'][2:]); r['dimRect']=a+b
for d in t['doors']:
  for k in 'hco': d[k]=f(d[k])
t['windows']=[f(w[:2])+f(w[2:]) for w in t['windows']]
e=f([t['entry']['x'],t['entry']['y']]); t['entry']['x'],t['entry']['y']=e
json.dump(t,open(sys.argv[2],'w'),indent=1)
