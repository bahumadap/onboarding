"""Generate the target onboarding model. Chaindots owns KYC/KYB collection and review.
This is a proposed integration contract, not a description of the current demo.
"""
from pathlib import Path
import json, zipfile
import xml.etree.ElementTree as E
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];O=R/'docs/bpmn'
NS={'bpmn':'http://www.omg.org/spec/BPMN/20100524/MODEL','bpmndi':'http://www.omg.org/spec/BPMN/20100524/DI','dc':'http://www.omg.org/spec/DD/20100524/DC','di':'http://www.omg.org/spec/DD/20100524/DI'}
for k,v in NS.items():E.register_namespace(k,v)
def q(t):a,b=t.split(':');return '{'+NS[a]+'}'+b
def add(parent,t,**attrs):return E.SubElement(parent,q(t),{k:str(v) for k,v in attrs.items()})
root=E.Element(q('bpmn:definitions'),id='YOL1_Target',targetNamespace='https://yol1.example/bpmn/target')
proc=add(root,'bpmn:process',id='target',name='YOL1 Enterprise — Onboarding objetivo con Chaindots',isExecutable='false')
add(proc,'bpmn:documentation').text='Modelo objetivo. Chaindots solicita, recibe y revisa KYC/KYB. YOL1 integra el embebido, recibe los resultados y habilita la apertura. Contratos técnicos, requisitos y estados del proveedor por confirmar. No describe una integración ya implementada.'
plane=add(add(root,'bpmndi:BPMNDiagram',id='target_diagram'),'bpmndi:BPMNPlane',id='target_plane',bpmnElement='target')
boxes=[
 dict(id='signup',x=80,y=100,w=2440,h=1860,title='01  SIGN UP',description='Cliente y YOL1 · Crear el acceso y la organización.',color='#e3ebff'),
 dict(id='verification',x=2680,y=100,w=3440,h=1860,title='02  VERIFICACIÓN EMBEBIDA · CHAINDOTS',description='Chaindots · Solicitar y revisar KYC y KYB. YOL1 recibe y muestra el resultado.',color='#dff2e8'),
 dict(id='activation',x=6280,y=100,w=2200,h=1860,title='03  APERTURA DE CUENTA',description='YOL1 y proveedor de cuenta · Abrir y confirmar la habilitación.',color='#fff0cc'),
 dict(id='desk',x=8640,y=100,w=1520,h=1860,title='04  MERCHANT DESK',description='Cliente · Consultar y operar según las capacidades habilitadas.',color='#e5f2dc'),
 dict(id='products',x=10320,y=100,w=2400,h=1860,title='05  PRODUCTOS ADICIONALES',description='Cliente y proveedor correspondiente · Solicitud y habilitación independiente.',color='#ffe9dc'),
 dict(id='config',x=2680,y=2210,w=3440,h=560,title='EN PARALELO  ·  CONFIGURACIÓN',description='Cliente · Disponible desde el registro. No sustituye la verificación de Chaindots.',color='#e8edf5'),
]
nodes={};bounds={};edges=[];details={}
def node(id,name,x,y,kind='userTask',w=180,h=80,doc='',phase='signup'):
 n=add(proc,'bpmn:'+kind,id=id,name=name);add(n,'bpmn:documentation').text=doc or name;nodes[id]=n;details[id]=dict(name=name,doc=doc or name,phase=phase)
 if 'Gateway' in kind:w=h=58
 if 'Event' in kind:w=h=38
 shape=add(plane,'bpmndi:BPMNShape',id=id+'_di',bpmnElement=id)
 if kind=='exclusiveGateway':shape.set('isMarkerVisible','true')
 if kind=='subProcess':shape.set('isExpanded','false')
 add(shape,'dc:Bounds',x=x,y=y,width=w,height=h);bounds[id]=(x,y,w,h)
 if 'Event' in kind or 'Gateway' in kind:
  label=add(shape,'bpmndi:BPMNLabel');add(label,'dc:Bounds',x=x-60,y=y+h+8,width=w+120,height=44)
 return n
def flow(a,b,label='',via=None):
 id='f'+str(len(edges));edges.append((a,b,label));add(proc,'bpmn:sequenceFlow',id=id,sourceRef=a,targetRef=b,name=label)
 add(nodes[a],'bpmn:outgoing').text=id;add(nodes[b],'bpmn:incoming').text=id
 ax,ay,aw,ah=bounds[a];bx,by,bw,bh=bounds[b];sy=ay+ah/2;ty=by+bh/2
 if ax==bx:
  pts=[(ax+aw/2,ay+ah if by>ay else ay),(bx+bw/2,by if by>ay else by+bh)]
 elif via is not None:
  pts=[(ax+aw/2,ay+ah if via>sy else ay),(ax+aw/2,via),(bx+bw/2,via),(bx+bw/2,by+bh if via>ty else by)]
 else:
  sx=ax+aw if bx>ax else ax;tx=bx if bx>ax else bx+bw;mid=(sx+tx)/2;pts=[(sx,sy),(mid,sy),(mid,ty),(tx,ty)]
 edge=add(plane,'bpmndi:BPMNEdge',id=id+'_di',bpmnElement=id)
 for x,y in pts:add(edge,'di:waypoint',x=x,y=y)
 if label:
  p1,p2=max(zip(pts,pts[1:]),key=lambda pp:abs(pp[0][0]-pp[1][0])+abs(pp[0][1]-pp[1][1]));l=add(edge,'bpmndi:BPMNLabel');add(l,'dc:Bounds',x=(p1[0]+p2[0])/2-95,y=(p1[1]+p2[1])/2-36,width=190,height=32)
# Sign up: all error paths remain within registration.
node('start','Inicio',130,570,'startEvent')
node('signup_email','Ingresar correo y solicitar código',235,550)
node('signup_otp','Ingresar código de correo',495,550)
node('signup_mail_ok','¿Correo verificado?',755,561,'exclusiveGateway')
node('signup_data','Completar datos de persona y empresa',915,550,doc='Nombre, empresa, país de constitución y operación: Chile. No se solicita documentación KYB en este formulario.')
node('signup_credential','Crear credencial y aceptar términos',1175,550,doc='Validación de contraseña y confirmación; aceptación explícita de condiciones. La política de autenticación y de expiración OTP se define con el backend.')
node('signup_valid','¿Datos y aceptación válidos?',1435,561,'exclusiveGateway')
node('signup_create','Crear usuario, organización y expediente',1625,550,'serviceTask')
node('signup_parallel','',1895,561,'parallelGateway')
node('signup_ready','Registro completado',2145,570,'intermediateThrowEvent')
node('signup_otp_issue','Código incorrecto, vencido o límite alcanzado',495,1000,'serviceTask',doc='Mostrar la causa; permitir reintento o reenvío según la política de seguridad. No fijar tiempos o límites del prototipo como política final.')
node('signup_resend','Reintentar o solicitar un código nuevo',235,1000)
node('signup_fix','Corregir datos o completar aceptación',1175,1000)
flow('start','signup_email');flow('signup_email','signup_otp');flow('signup_otp','signup_mail_ok');flow('signup_mail_ok','signup_data','Sí');flow('signup_mail_ok','signup_otp_issue','No');flow('signup_otp_issue','signup_resend');flow('signup_resend','signup_otp','Según política',via=1240);flow('signup_data','signup_credential');flow('signup_credential','signup_valid');flow('signup_valid','signup_fix','No');flow('signup_fix','signup_data','Corregir',via=1380);flow('signup_valid','signup_create','Sí');flow('signup_create','signup_parallel');flow('signup_parallel','signup_ready')
# A single opaque provider subprocess. Never model the questionnaire or review as YOL1 tasks.
node('verification_session','Preparar acceso al embebido de Chaindots',2790,550,'serviceTask',phase='verification',doc='YOL1 solicita una sesión segura vinculada a la organización. Credenciales y endpoints se resuelven en backend. Método exacto y capacidades del proveedor por confirmar.')
node('verification_load','¿Embebido disponible?',3050,561,'exclusiveGateway',phase='verification')
sub=node('verification_embed','Completar KYC y KYB en Chaindots',3230,520,'subProcess',w=400,h=140,phase='verification',doc='Cliente: completar el flujo embebido y entregar información/documentos directamente a Chaindots. Chaindots determina el cuestionario, requisitos y evaluación según la configuración contratada. No se presupone orden, paralelismo ni pantallas internas del proveedor.')
substart=add(sub,'bpmn:startEvent',id='provider_start');subtask=add(sub,'bpmn:task',id='provider_scope',name='Proceso gestionado por Chaindots');subend=add(sub,'bpmn:endEvent',id='provider_end');add(sub,'bpmn:sequenceFlow',id='provider_f1',sourceRef='provider_start',targetRef='provider_scope');add(sub,'bpmn:sequenceFlow',id='provider_f2',sourceRef='provider_scope',targetRef='provider_end')
node('verification_result','Esperar y recibir estado de Chaindots',3800,550,'receiveTask',phase='verification',doc='Contrato de integración propuesto: recibir notificaciones verificadas si Chaindots las ofrece, y/o consultar estado desde backend. Validar autenticidad, correlación e idempotencia. No inventa nombres de eventos ni endpoints.')
node('verification_decision','¿Resultado de verificación?',4090,561,'exclusiveGateway',phase='verification')
node('verification_approved','Confirmar KYC y KYB aprobados',4330,550,'serviceTask',phase='verification',doc='Mapear los resultados requeridos para la persona y la entidad. No basta con terminar el formulario ni con aprobar solo una verificación. Reglas de aceptación y equivalencias de estados deben acordarse con Chaindots.')
node('verification_both','¿Todas las verificaciones requeridas aprobadas?',4630,561,'exclusiveGateway',phase='verification')
node('verification_done','Verificación completada',5820,570,'intermediateThrowEvent',phase='verification')
node('verification_pending','Mostrar pendiente o en revisión',4360,1020,'serviceTask',phase='verification',doc='La revisión documental y sus tiempos pertenecen a Chaindots. YOL1 informa el estado; no realiza una revisión documental paralela.')
node('verification_wait','Esperar actualización del proveedor',4700,1020,'receiveTask',phase='verification')
node('verification_action','Mostrar solicitud de información adicional',4050,1430,'serviceTask',phase='verification')
node('verification_correct','Volver al embebido y completar lo solicitado',3230,1430,phase='verification',doc='El cliente corrige o entrega lo solicitado dentro de Chaindots. No usa un formulario de corrección documental propio de YOL1.')
node('verification_rejected','Informar rechazo y vía de consulta',5160,1430,'serviceTask',phase='verification',doc='Mostrar motivo comunicable y vía de soporte según acuerdo con Chaindots. No se presupone apelación o reapertura automática.')
node('verification_stop','Sin apertura de cuenta',5820,1450,'endEvent',phase='verification')
node('verification_error','Informar error técnico sin cambiar resultado',2790,1020,'serviceTask',phase='verification')
node('verification_retry','Reintentar carga o recuperar sesión',3050,1020,phase='verification',doc='Una caída de red no es rechazo KYC/KYB. Conservar correlación y estado; retomar sesión cuando el proveedor lo permita, o generar una nueva según contrato.')
flow('signup_ready','verification_session','Continuar verificación')
flow('verification_session','verification_load');flow('verification_load','verification_embed','Sí');flow('verification_load','verification_error','No');flow('verification_error','verification_retry');flow('verification_retry','verification_session','Recuperar acceso',via=1220)
flow('verification_embed','verification_result');flow('verification_result','verification_decision');flow('verification_decision','verification_approved','Aprobado');flow('verification_approved','verification_both');flow('verification_both','verification_done','Sí');flow('verification_both','verification_pending','No: falta un resultado',via=940)
flow('verification_decision','verification_pending','Pendiente / en revisión');flow('verification_pending','verification_wait');flow('verification_wait','verification_result','Actualización',via=1240)
flow('verification_decision','verification_action','Información adicional');flow('verification_action','verification_correct');flow('verification_correct','verification_embed','Retomar embebido',via=1660)
flow('verification_decision','verification_rejected','Rechazado',via=1780);flow('verification_rejected','verification_stop')
# Account opening is downstream of provider approvals.
node('activation_start','Solicitar apertura de cuenta',6400,550,'serviceTask',phase='activation')
node('activation_result','Recibir y validar respuesta del proveedor de cuenta',6670,550,'receiveTask',phase='activation')
node('activation_decision','¿Resultado de apertura?',6960,561,'exclusiveGateway',phase='activation')
node('activation_enable','Habilitar cuenta y capacidades disponibles',7230,550,'serviceTask',phase='activation')
node('activation_done','Cuenta accesible',8210,570,'intermediateThrowEvent',phase='activation')
node('activation_failed','Informar error y permitir reintento seguro',6710,1090,'serviceTask',phase='activation',doc='Reconciliar el estado antes de repetir la apertura para evitar cuentas duplicadas. No habilitar el Desk sin confirmación del proveedor.')
node('activation_retry','Reintentar apertura o solicitar soporte',6400,1090,phase='activation')
node('activation_pending','Mostrar apertura pendiente',7160,1430,'serviceTask',phase='activation')
node('activation_wait','Esperar actualización de apertura',7460,1430,'receiveTask',phase='activation')
node('activation_restricted','Aplicar restricciones a permisos y operaciones',7510,1090,'serviceTask',phase='activation',doc='Si el proveedor devuelve una cuenta restringida, habilitar solo las capacidades permitidas y hacer cumplir el bloqueo en backend. No basta con mostrar un aviso.')
flow('verification_done','activation_start','Verificaciones aprobadas');flow('activation_start','activation_result');flow('activation_result','activation_decision');flow('activation_decision','activation_enable','Activa');flow('activation_enable','activation_done');flow('activation_decision','activation_failed','Error');flow('activation_failed','activation_retry');flow('activation_retry','activation_start','Reintento seguro',via=1320);flow('activation_decision','activation_pending','Pendiente',via=1580);flow('activation_pending','activation_wait');flow('activation_wait','activation_result','Actualización',via=1750);flow('activation_decision','activation_restricted','Restringida',via=950);flow('activation_restricted','activation_enable','Capacidades limitadas',via=1250)
# Desk and additional products.
node('desk_enter','Entrar al Merchant Desk',8760,550,phase='desk');node('desk_operate','Saldos, movimientos y cuentas virtuales',9030,550,phase='desk');node('desk_optional','¿Solicitar un producto adicional?',9350,561,'exclusiveGateway',phase='desk');node('desk_end','Onboarding completado',9750,1090,'endEvent',phase='desk')
flow('activation_done','desk_enter');flow('desk_enter','desk_operate');flow('desk_operate','desk_optional');flow('desk_optional','desk_end','No / continuar operando')
node('products_request','Revisar requisitos y solicitar producto',10430,550,phase='products');node('products_review','Evaluar solicitud por el proveedor correspondiente',10700,550,'receiveTask',phase='products',doc='Ciclo independiente de la cuenta vista. El proveedor y requisitos dependen del producto; no se presupone que todos sean evaluados por Chaindots.')
node('products_decision','¿Resultado?',11020,561,'exclusiveGateway',phase='products');node('products_config','Completar condiciones y configuración',11260,550,phase='products');node('products_activate','Confirmar habilitación del producto',11540,550,'serviceTask',phase='products');node('products_end','Producto disponible en la barra',12480,570,'endEvent',phase='products')
node('products_pending','Mostrar evaluación pendiente',10700,1090,'serviceTask',phase='products');node('products_additional','Completar requisitos pendientes',11260,1430,phase='products');node('products_reject','Informar rechazo; cuenta vista sigue disponible',11740,1430,'serviceTask',phase='products');node('products_stop','Producto sin activar',12480,1450,'endEvent',phase='products')
flow('desk_optional','products_request','Sí: ciclo opcional');flow('products_request','products_review');flow('products_review','products_decision');flow('products_decision','products_config','Aprobado');flow('products_config','products_activate');flow('products_activate','products_end');flow('products_decision','products_pending','En revisión');flow('products_pending','products_review','Esperar actualización',via=1300);flow('products_decision','products_additional','Requiere información',via=1640);flow('products_additional','products_review','Reenviar',via=1790);flow('products_decision','products_reject','Rechazado',via=1840);flow('products_reject','products_stop')
# Optional configuration runs alongside verification. It cannot approve KYC/KYB.
node('config_org','Empresa y equipo: datos y accesos',2820,2460,phase='config');node('config_policy','Permisos, aprobaciones e integraciones',3310,2460,phase='config');node('config_settings','Configurar productos ya habilitados',3840,2460,phase='config');node('config_done','Ajustes guardados',5720,2480,'endEvent',phase='config')
flow('signup_parallel','config_org','Configuración disponible desde el registro',via=2100);flow('config_org','config_policy');flow('config_policy','config_settings');flow('config_settings','config_done')
E.ElementTree(root).write(O/'onboarding-completo.bpmn',encoding='utf-8',xml_declaration=True)
xml=(O/'onboarding-completo.bpmn').read_text();lib=(O/'vendor/bpmn-viewer.js').read_text()
# Reuse the offline viewer shell; the process and all annotations above are target-only.
source=(R/'scripts/build_unified_bpmn.py').read_text();template=source.split("html='''",1)[1].split("'''\nhtml=",1)[0]
template=template.replace('YOL1 · BPMN completo','YOL1 · Flujo objetivo con Chaindots').replace('YOL1 Enterprise · BPMN completo','YOL1 Enterprise · Flujo objetivo')
template=template.replace('Un único diagrama · Lectura de izquierda a derecha · Descriptivo de la demo actual','Un único diagrama · De izquierda a derecha · Modelo objetivo de integración')
template=template.replace('Zoom para leer cada bloque. Registro + OTP → identidad y KYB en paralelo → apertura → Merchant Desk → productos opcionales. Configuración y acceso incluidos.','Registro → KYC y KYB embebidos en Chaindots → apertura → Merchant Desk → productos opcionales. Configuración disponible desde el registro.')
template=template.replace('Selecciona una actividad para ver su detalle. Las revisiones y operaciones son simuladas.','Selecciona una actividad para consultar su alcance. Contratos técnicos de Chaindots y proveedor de cuenta por confirmar; este modelo no acredita una integración implementada.')
template=template.replace("details[element.id]||element.businessObject.name||'Conector'","details[element.id]?.doc||element.businessObject.name||'Conector'")
template=template.replace("const b=[...subboxes,...boxes].find(b=>e.id.startsWith(b.id+'_'));","const b=boxes.find(b=>b.id===details[e.id]?.phase);")
template=template.replace("{x:40,y:60,width:11380,height:5320}","{x:0,y:0,width:12900,height:2900}").replace("'40 60 11380 5320'","'0 0 12900 2900'").replace("'11380'","'12900'").replace("'5320'","'2900'")
template=template.replace('/Task|Activity/', '/Task|Activity|SubProcess/')
page=template.replace('__LIB__',lib).replace('__XML__',json.dumps(xml).replace('</','<\\/')).replace('__BOXES__',json.dumps(boxes)).replace('__SUBBOXES__','[]').replace('__DETAILS__',json.dumps(details))
(O/'onboarding-completo.html').write_text(page)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);pg=browser.new_page(viewport={'width':2000,'height':1000});errors=[];pg.on('pageerror',lambda e:errors.append(str(e)));pg.set_content(page);pg.wait_for_function('window.ready');assert not pg.evaluate('window.error');assert not pg.evaluate('window.warnings'),pg.evaluate('window.warnings')
 svg=pg.evaluate('async()=>await exportSVG()');(O/'onboarding-completo-figma.svg').write_text(svg)
 pg.screenshot(path='/tmp/yol1-ideal.png',full_page=True)
 pg.get_by_role('button',name='02  VERIFICACIÓN EMBEBIDA · CHAINDOTS',exact=True).click();pg.screenshot(path='/tmp/yol1-chaindots.png',full_page=True)
 pg.locator('[data-element-id="verification_embed"]').first.click();assert 'directamente' in pg.locator('#detail').inner_text();assert not errors,errors
 pg.set_content('<style>@page{size:1400mm 350mm;margin:10mm}body{margin:0}svg{width:1380mm;height:320mm}</style>'+svg);pg.pdf(path=str(O/'onboarding-completo.pdf'),prefer_css_page_size=True,print_background=True);browser.close()
# Structural checks plus guard against leaking prototype controls into the target model.
assert 'Demo Control' not in xml and 'Simular' not in xml
assert len(root.findall('bpmn:process',NS))==1
for a,b,_ in edges:assert a in nodes and b in nodes
print(f'PASS: flujo objetivo; {len(nodes)} elementos, {len(edges)} conexiones; Chaindots embebido sin revisión documental YOL1')
# Package only the agreed target flow; exclude historical prototype diagrams.
with zipfile.ZipFile(O/'onboarding-completo.zip','w',zipfile.ZIP_DEFLATED) as z:
 for name in ['onboarding-completo.html','onboarding-completo-figma.svg','onboarding-completo.bpmn','onboarding-completo.pdf','COMPLETO.md','vendor/LICENSE.bpmn-js']:
  z.write(O/name,Path('onboarding-objetivo')/name)
