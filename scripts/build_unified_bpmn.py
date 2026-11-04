"""Flatten the eight documented views into one connected BPMN diagram."""
from pathlib import Path
from copy import deepcopy
import json
import xml.etree.ElementTree as E
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];O=R/'docs/bpmn';src=E.parse(O/'yol1-enterprise.bpmn').getroot();meta=json.loads((O/'model.json').read_text())
ns={'bpmn':'http://www.omg.org/spec/BPMN/20100524/MODEL','bpmndi':'http://www.omg.org/spec/BPMN/20100524/DI','dc':'http://www.omg.org/spec/DD/20100524/DC','di':'http://www.omg.org/spec/DD/20100524/DI'}
for k,v in ns.items():E.register_namespace(k,v)
def q(t):p,n=t.split(':');return '{'+ns[p]+'}'+n
def add(parent,t,**kw):return E.SubElement(parent,q(t),{k:str(v) for k,v in kw.items()})
root=E.Element(q('bpmn:definitions'),id='YOL1_unified',targetNamespace='https://yol1.example/bpmn')
proc=add(root,'bpmn:process',id='complete',name='YOL1 Enterprise — Proceso completo',isExecutable='false')
diagram=add(root,'bpmndi:BPMNDiagram',id='complete_diagram');plane=add(diagram,'bpmndi:BPMNPlane',id='complete_plane',bpmnElement='complete')
placements={'signup':(100,250),'otp':(100,1250),'identity':(2500,0),'kyb':(2500,1250),'activation':(4800,0),'products':(7800,0),'access':(100,3200)}
colors={'signup':'#e8efff','otp':'#f2e8ff','identity':'#eaddff','kyb':'#dff4ed','activation':'#fff0cc','products':'#ffe9dc','access':'#e7edf5','desk':'#e3f3dc','config':'#e8edf5'}
boxes=[];nodes={};bounds={};details={}
for key,(dx,dy) in placements.items():
 model=next(m for m in meta['maps'] if m['id']==key)
 source=src.find(f"bpmn:process[@id='{key}']",ns)
 for child in source:
  if child.tag in [q('bpmn:laneSet'),q('bpmn:documentation')]:continue
  c=deepcopy(child)
  if c.get('id')=='signup_otp':continue
  if c.tag==q('bpmn:sequenceFlow') and ('signup_otp' in [c.get('sourceRef'),c.get('targetRef')]):continue
  if c.tag==q('bpmn:callActivity'):c.tag=q('bpmn:task');c.attrib.pop('calledElement',None)
  for ref in list(c):
   if ref.tag in [q('bpmn:incoming'),q('bpmn:outgoing')]:c.remove(ref)
  proc.append(c)
  if c.tag!=q('bpmn:sequenceFlow'):nodes[c.get('id')]=c
 sourceplane=src.find(f"bpmndi:BPMNDiagram[@id='{key}_diagram']/bpmndi:BPMNPlane",ns)
 for child in sourceplane:
  ref=child.get('bpmnElement')
  if '_lane' in ref or ref=='signup_otp':continue
  if child.tag==q('bpmndi:BPMNEdge') and not proc.find(f"bpmn:sequenceFlow[@id='{ref}']",ns) is not None:continue
  c=deepcopy(child)
  for v in c.iter():
   if v.tag==q('dc:Bounds'):
    v.set('x',str(float(v.get('x'))+dx));v.set('y',str(float(v.get('y'))+dy))
   elif v.tag==q('di:waypoint'):
    v.set('x',str(float(v.get('x'))+dx));v.set('y',str(float(v.get('y'))+dy))
  plane.append(c)
  if c.tag==q('bpmndi:BPMNShape'):
   b=c.find('dc:Bounds',ns);bounds[ref]=tuple(float(b.get(k)) for k in ['x','y','width','height'])
 for n in model['nodes']:details[n['id']]=n['doc']
 bs=[v for k,v in bounds.items() if k.startswith(key+'_')];x=min(b[0] for b in bs)-40;y=min(b[1] for b in bs)-100;right=max(b[0]+b[2] for b in bs)+80;bottom=max(b[1]+b[3] for b in bs)+150
 boxes.append(dict(id=key,x=x,y=y,w=right-x,h=bottom-y,title=model['title'],color=colors[key]))
def node(id,name,x,y,w=180,h=80,kind='task'):
 n=add(proc,'bpmn:'+kind,id=id,name=name);nodes[id]=n;shape=add(plane,'bpmndi:BPMNShape',id=id+'_di',bpmnElement=id);add(shape,'dc:Bounds',x=x,y=y,width=w,height=h);bounds[id]=(x,y,w,h)
def flow(a,b,label='',via=None):
 # Connected cross-process flows, with intermediate events at expanded boundaries.
 for id in [a,b]:
  n=nodes[id]
  if n.tag in [q('bpmn:startEvent'),q('bpmn:endEvent')]:n.tag=q('bpmn:intermediateThrowEvent')
 id='link_'+str(len(list(proc)))
 add(proc,'bpmn:sequenceFlow',id=id,sourceRef=a,targetRef=b,name=label)
 ax,ay,aw,ah=bounds[a];bx,by,bw,bh=bounds[b];sx=ax+aw;sy=ay+ah/2;tx=bx;ty=by+bh/2
 if via is None:mid=(sx+tx)/2;points=[(sx,sy),(mid,sy),(mid,ty),(tx,ty)]
 else:points=[(sx,sy),(sx+25,sy),(sx+25,via),(tx-25,via),(tx-25,ty),(tx,ty)]
 edge=add(plane,'bpmndi:BPMNEdge',id=id+'_di',bpmnElement=id)
 for x,y in points:add(edge,'di:waypoint',x=x,y=y)
 if label:
  l=add(edge,'bpmndi:BPMNLabel');add(l,'dc:Bounds',x=(sx+tx)/2-80,y=(via if via else (sy+ty)/2)-35,width=160,height=30)
node('verify_split','Identité et KYB indépendants',2440,1160,54,54,'parallelGateway')
nodes['verify_split'].set('name','Identidad y KYB independientes')
node('verify_join','Ambas verificaciones aprobadas',4630,1160,54,54,'parallelGateway')
node('desk_home','Merchant Desk: saldos y movimientos',7280,600)
node('desk_va','Gestionar cuentas virtuales',7500,600)
node('desk_end','Onboarding completado',7740,620,38,38,'endEvent')
node('config_enter','Configuración disponible desde el registro',4900,2700)
node('config_org','Empresa / entidades / usuarios',5140,2700)
node('config_rules','Cuentas / aprobaciones / productos',5380,2700)
node('config_api','API / documentación / preferencias',5620,2700)
node('config_end','Configuración guardada',5860,2720,38,38,'endEvent')
boxes.extend([dict(id='desk',x=7230,y=450,w=620,h=430,title='Merchant Desk · Fin del onboarding',color=colors['desk']),dict(id='config',x=4850,y=2520,w=1150,h=500,title='Configuración · Disponible en paralelo',color=colors['config'])])
flow('signup_mailok','otp_start','Correo válido: emitir OTP',via=1100)
flow('otp_end','signup_profile','Correo verificado',via=1190)
flow('signup_end','verify_split','Organización creada')
flow('verify_split','identity_start','Identidad')
flow('verify_split','kyb_start','Empresa / KYB',via=1360)
flow('identity_end','verify_join','approved',via=1100)
flow('kyb_approved','verify_join','approved',via=2380)
flow('verify_join','activation_start','Ambas approved')
flow('activation_end','desk_home','active / restricted',via=1070)
flow('desk_home','desk_va');flow('desk_va','desk_end')
flow('desk_end','products_start','Opcional: productos adicionales',via=1130)
flow('signup_end','config_enter','Acceso independiente al crear organización',via=3100)
flow('config_enter','config_org');flow('config_org','config_rules');flow('config_rules','config_api');flow('config_api','config_end')
flow('config_org','kyb_entity_start','Agregar entidad (opcional)',via=2990)
flow('access_signup','signup_start','Sin organización: registrar',via=4250)
flow('access_config','config_enter','Configuración',via=4340)
flow('access_activation','activation_start','Retomar apertura',via=4430)
flow('access_onboarding','verify_split','Retomar verificaciones',via=4520)
flow('access_desk','desk_home','Cuenta accesible',via=4610)
flow('access_back','verify_split','Consultar onboarding',via=4700)
flow('access_reeval','access_start','Reevaluar navegación tras cambiar estado',via=4800)
# Maintain the formal node references after flattening.
for f in proc.findall('bpmn:sequenceFlow',ns):
 for key,tag in [('sourceRef','outgoing'),('targetRef','incoming')]:
  n=nodes[f.get(key)];add(n,'bpmn:'+tag).text=f.get('id')
E.ElementTree(root).write(O/'onboarding-completo.bpmn',encoding='utf-8',xml_declaration=True)
xml=(O/'onboarding-completo.bpmn').read_text();lib=(O/'vendor/bpmn-viewer.js').read_text()
html='''<!doctype html><html lang="es"><meta charset="utf-8"><title>YOL1 · BPMN completo</title><style>body{margin:0;font:15px Arial;color:#173e35;background:#f5f7fb}header{padding:18px;background:#103e34;color:white}h1{margin:0 0 8px;font-size:25px}button{padding:9px 14px;margin:10px 5px;cursor:pointer}#canvas{height:78vh;background:white}#detail{padding:15px;min-height:35px}p{margin:6px 0}.djs-label{font-family:Arial!important}</style><header><h1>YOL1 Enterprise · BPMN completo</h1><p>Un único diagrama · Lectura de izquierda a derecha · Descriptivo de la demo actual</p><p>Zoom para leer cada bloque. Registro + OTP → identidad y KYB en paralelo → apertura → Merchant Desk → productos opcionales. Configuración y acceso incluidos.</p></header><button onclick="v.get('canvas').zoom('fit-viewport','auto')">Ver todo</button><button onclick="v.get('canvas').zoom(v.get('canvas').zoom()*1.5)">Acercar +</button><button onclick="v.get('canvas').zoom(v.get('canvas').zoom()/1.5)">Alejar −</button><button onclick="downloadSVG()">Descargar SVG</button><button onclick="save(xml,'onboarding-completo.bpmn','application/xml')">Descargar BPMN</button><span id="focus"></span><div id="canvas"></div><div id="detail">Selecciona una actividad para ver su detalle. Las revisiones y operaciones son simuladas.</div><script>__LIB__</script><script>const xml=__XML__,boxes=__BOXES__,details=__DETAILS__;const v=new BpmnJS({container:'#canvas'});window.v=v;boxes.forEach(b=>{const bt=document.createElement('button');bt.textContent=b.title;bt.onclick=()=>v.get('canvas').viewbox({x:b.x-30,y:b.y-30,width:b.w+60,height:b.h+60});document.querySelector('#focus').append(bt)});function save(data,name,type){let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;a.click()}async function downloadSVG(){save((await v.saveSVG()).svg,'onboarding-completo-figma.svg','image/svg+xml')};v.on('element.click',({element})=>document.querySelector('#detail').textContent=details[element.id]||element.businessObject.name||'Conector');(async()=>{try{const r=await v.importXML(xml);window.warnings=r.warnings.map(w=>w.message);const layer=v.get('canvas').getDefaultLayer();const registry=v.get('elementRegistry');boxes.forEach(b=>{const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.innerHTML='<rect x="'+b.x+'" y="'+b.y+'" width="'+b.w+'" height="'+b.h+'" rx="20" fill="'+b.color+'" fill-opacity="0.35" stroke="#b5c6cf"/><text x="'+(b.x+20)+'" y="'+(b.y+35)+'" font-family="Arial" font-size="24" fill="#143f3d">'+b.title+'</text>';layer.prepend(g)});registry.getAll().forEach(e=>{const shape=registry.getGraphics(e)?.querySelector('.djs-visual > :first-child');if(!shape)return;const b=boxes.find(b=>e.id.startsWith(b.id+'_'));if(b&&/Task|Activity/.test(e.type))shape.style.fill=b.color;if(/Gateway/.test(e.type))shape.style.fill='#fff0b3';if(/StartEvent/.test(e.type))shape.style.fill='#cef0d5';if(/EndEvent/.test(e.type))shape.style.fill='#cde1e9'});v.get('canvas').zoom('fit-viewport','auto');window.ready=true}catch(e){window.error=e.message;window.ready=true}})();</script></html>'''
html=html.replace('__LIB__',lib).replace('__XML__',json.dumps(xml).replace('</','<\\/')).replace('__BOXES__',json.dumps(boxes)).replace('__DETAILS__',json.dumps(details))
(O/'onboarding-completo.html').write_text(html)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);pg=b.new_page(viewport={'width':1900,'height':1100});pg.set_content(html);pg.wait_for_function('window.ready');assert not pg.evaluate('window.error');assert not pg.evaluate('window.warnings'),pg.evaluate('window.warnings');svg=pg.evaluate('async()=>(await v.saveSVG()).svg');(O/'onboarding-completo-figma.svg').write_text(svg);pg.screenshot(path='/tmp/yol1-unified.png',full_page=True)
 pg.set_content('<style>@page{size:1200mm 600mm;margin:10mm}body{margin:0}svg{width:1180mm;height:570mm}</style>'+svg);pg.pdf(path=str(O/'onboarding-completo.pdf'),prefer_css_page_size=True,print_background=True);b.close()
print('PASS: un proceso, un diagrama; SVG, HTML, PDF y BPMN completo generados')
