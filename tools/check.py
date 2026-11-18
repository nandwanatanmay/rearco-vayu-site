import sys,json,cv2,numpy as np,math
s=json.load(open(sys.argv[1])); im=cv2.imread('../src/'+s['src']+'.jpg.jpeg')
o=im.copy()
for r in s['rooms']:
  p=np.array(r['poly'],np.int32); cv2.polylines(o,[p],True,(255,0,200),2)
  cv2.circle(o,tuple(r['label']),4,(255,0,200),-1)
for d in s['doors']:
  h,c,op=d['h'],d['c'],d['o']; R=math.dist(h,c)
  a0=math.degrees(math.atan2(c[1]-h[1],c[0]-h[0])); a1=math.degrees(math.atan2(op[1]-h[1],op[0]-h[0]))
  if a1-a0>180: a1-=360
  if a0-a1>180: a1+=360
  cv2.ellipse(o,tuple(h),(int(R),int(R)),0,min(a0,a1),max(a0,a1),(0,160,0),2); cv2.line(o,tuple(h),tuple(op),(0,160,0),2)
for w in s['windows']: cv2.rectangle(o,(w[0],w[1]),(w[2],w[3]),(255,120,0),2)
x0,y0,x1,y1=s['crop']; cv2.imwrite(sys.argv[2],o[y0:y1,x0:x1])
