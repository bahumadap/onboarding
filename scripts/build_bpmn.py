"""Generate a documented, descriptive BPMN 2.0 model of the current demo.
Run: python3 scripts/build_bpmn.py. PDF/SVG exports: scripts/export_bpmn.py.
No application code or business rules are changed.
"""
from pathlib import Path
import json, subprocess, html
from xml.etree.ElementTree import Element, SubElement, ElementTree, register_namespace
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/bpmn'
OUT.mkdir(exist_ok=True)
REV = subprocess.check_output(['git','rev-parse','HEAD'], cwd=ROOT, text=True).strip()
NS = {'bpmn':'http://www.omg.org/spec/BPMN/20100524/MODEL','bpmndi':'http://www.omg.org/spec/BPMN/20100524/DI','dc':'http://www.omg.org/spec/DD/20100524/DC','di':'http://www.omg.org/spec/DD/20100524/DI','xsi':'http://www.w3.org/2001/XMLSchema-instance'}
for p,u in NS.items(): register_namespace(p,u)
def el(parent,tag,attrs=None,text=None):
 p,n=tag.split(':'); e=SubElement(parent,'{'+NS[p]+'}'+n,attrs or {})
 if text is not None:e.text=text
 return e
maps=[]
class Map:
 def __init__(self,id,title,subtitle,lanes,source,notes):
  self.id=id;self.title=title;self.subtitle=subtitle;self.lanes=lanes;self.source=source;self.notes=notes;self.nodes=[];self.edges=[];maps.append(self)
 def n(self,id,label,col,row,kind='userTask',doc='',call=None):
  self.nodes.append(dict(id=self.id+'_'+id,short=id,label=label,col=col,row=row,kind=kind,doc=doc or label,call=call));return self
 def f(self,a,b,label='',via=None):self.edges.append(dict(a=self.id+'_'+a,b=self.id+'_'+b,label=label,via=via));return self

m=Map('overview','01 · Vista general','Registro → verificaciones independientes → apertura → operación', ['Persona administradora','Aplicación YOL1 (demo)','Verificaciones simuladas'], 'src/state/DemoState.jsx',[
 'Identidad y KYB pueden completarse en cualquier orden. La compuerta paralela expresa independencia, no obliga a abrir dos pantallas simultáneamente.',
 'La unión recoge el resultado de cada intento. Solo dos estados approved habilitan la apertura; esperar, corregir o reintentar no equivalen a aprobar.',
 'Configuración está disponible al existir organización. Los productos adicionales tienen un ciclo independiente y no bloquean la cuenta vista.' ])
m.n('start','Inicio',0,0,'startEvent').n('signup','Completar registro [02–03]',1,0,'callActivity',call='signup').n('hub','Abrir expediente',2,2,'serviceTask').n('fork','',3,2,'parallelGateway')
m.n('identity','Verificar identidad [04]',4,0,'callActivity',call='identity').n('kyb','Verificar empresa [05]',4,4,'callActivity',call='kyb').n('join','',5,2,'parallelGateway').n('ready','¿Ambas aprobadas?',6,2,'exclusiveGateway')
m.n('wait','Consultar estado / corregir / reintentar',6,0,doc='Cada estado conserva sus acciones: identidad permite reintentar; KYB observado se corrige; KYB rechazado queda bloqueado y remite al ejecutivo. No se abre cuenta mientras falte una aprobación.')
m.n('activation','Abrir cuenta [06]',7,2,'callActivity',call='activation').n('result','¿Cuenta accesible?',8,2,'exclusiveGateway').n('desk','Entrar al Merchant Desk',9,0).n('end','Cuenta disponible',10,0,'endEvent').n('hold','Apertura pendiente o fallida',9,4,'endEvent',doc='Fin de este intento de apertura. La persona puede consultar o reintentar según el estado; no es una cuenta activa.')
m.f('start','signup').f('signup','hub').f('hub','fork').f('fork','identity').f('fork','kyb').f('identity','join').f('kyb','join').f('join','ready').f('ready','wait','No').f('wait','fork','Retomar',via=110).f('ready','activation','Sí').f('activation','result').f('result','desk','active / restricted').f('result','hold','Otros estados').f('desk','end')

m=Map('signup','02 · Registro','Datos mínimos, credencial temporal y aceptación de condiciones', ['Persona administradora','Aplicación YOL1 (demo)'], 'src/features/signup/SignupFlow.jsx',[
 'Nombre obligatorio; apellido opcional. Empresa: nombre, industria, país de constitución y al menos un país de operación.',
 'Contraseña: mínimo 10 caracteres, mayúscula, minúscula y número; confirmación idéntica. No se persiste. Recargar antes de crear la organización obliga a validarla nuevamente.',
 'Atrás permite volver al paso anterior. Salir y volver conserva los datos ya guardados en localStorage; las entradas no enviadas pueden perderse. El enlace de invitación solo es texto, no un flujo implementado.' ])
m.n('start','Sin organización',0,0,'startEvent').n('email','Ingresar correo',1,0).n('mailok','¿Formato válido?',2,2,'exclusiveGateway').n('otp','Verificar correo [03]',3,2,'callActivity',call='otp').n('profile','Ingresar nombre y apellido',4,0).n('pok','¿Nombre presente?',4,2,'exclusiveGateway').n('company','Completar empresa y países',5,0).n('cok','¿Datos completos?',5,2,'exclusiveGateway').n('password','Crear y confirmar contraseña',6,0).n('pwok','¿Cumple reglas y coincide?',6,2,'exclusiveGateway').n('terms','Leer y aceptar términos',7,0).n('tok','¿Aceptados?',7,2,'exclusiveGateway').n('create','Crear organización y administrador',8,2,'serviceTask',doc='completeSignup crea id de organización, entidad principal con KYB draft, onboardingDraftId y equipo con un administrador. userStatus pasa a active. Se guardan versión y fecha de términos; no la contraseña.').n('end','Registro completo → onboarding',9,2,'endEvent')
m.f('start','email').f('email','mailok').f('mailok','email','No: corregir',via=340).f('mailok','otp','Sí').f('otp','profile').f('profile','pok').f('pok','profile','No',via=340).f('pok','company','Sí').f('company','cok').f('cok','company','No',via=365).f('cok','password','Sí').f('password','pwok').f('pwok','password','No',via=390).f('pwok','terms','Sí').f('terms','tok').f('tok','terms','No',via=415).f('tok','create','Sí').f('create','end')

m=Map('otp','03 · Código de verificación','Reenvío, vencimiento e intentos agotados', ['Persona administradora','Aplicación YOL1 (demo)'], 'src/features/signup/SignupFlow.jsx',[
 'Código fijo 123456; no se envían correos. Vigencia 180 s; reenvío después de 30 s desde la última emisión; máximo 3 códigos incorrectos.',
 'Un código incompleto no consume intentos. Reenviar limpia intentos, error y código; actualiza otpSentAt. Es posible reenviar aunque el código siga vigente, una vez transcurrido el cooldown.',
 'Recargar conserva otpSentAt e intentos, y recalcula los tiempos. El código ingresado no se conserva. El retorno a un paso anterior no equivale a verificar el correo.' ])
m.n('start','Correo válido',0,2,'startEvent').n('send','Emitir código simulado; reiniciar contador',1,2,'serviceTask').n('entry','Ingresar código o pedir otro',2,0).n('action','¿Qué acción?',3,0,'exclusiveGateway').n('cool','¿Pasaron 30 s?',4,0,'exclusiveGateway').n('timer','Esperar tiempo restante',5,0,'intermediateCatchEvent',doc='El reenvío está deshabilitado hasta que cooldown=0. Se espera solamente el tiempo restante desde otpSentAt.').n('eligible','¿Vigente e intentos < 3?',3,2,'exclusiveGateway').n('digits','¿Tiene 6 dígitos?',4,2,'exclusiveGateway').n('match','¿Código 123456?',5,2,'exclusiveGateway').n('count','Sumar intento fallido',6,3,'serviceTask').n('limit','¿Llegó a 3 intentos?',7,3,'exclusiveGateway').n('block','Mostrar vencimiento o bloqueo; solicitar nuevo',7,0).n('ok','Correo verificado; limpiar intentos',6,2,'serviceTask').n('end','Continuar con datos personales',8,2,'endEvent')
m.f('start','send').f('send','entry').f('entry','action').f('action','cool','Reenviar').f('cool','timer','No').f('timer','cool','Reevaluar',via=90).f('cool','send','Sí',via=70).f('action','eligible','Verificar').f('eligible','block','No',via=310).f('eligible','digits','Sí').f('digits','entry','No: completar',via=360).f('digits','match','Sí').f('match','ok','Sí').f('ok','end').f('match','count','No').f('count','limit').f('limit','entry','No: repetir',via=670).f('limit','block','Sí').f('block','cool','Reenviar cuando esté habilitado',via=125)

m=Map('identity','04 · Verificación de identidad','Sesión simulada de Chaindots y todos sus resultados', ['Persona administradora','Aplicación YOL1 (demo)','Verificador simulado'], 'src/features/onboarding/IdentityVerification.jsx',[
 'Estados: not_started → in_progress → approved / in_review / observed / failed. load_error se guarda como failed, sin estado independiente.',
 'Captura, selfie y contraste con registros son pasos temporizados: no se toman imágenes ni se consulta al proveedor. Reintentar inicia una sesión nueva cuyo resultado predeterminado es approved.',
 'Salir durante la sesión cancela sus temporizadores. Al volver, in_progress sin sesión ofrece Retomar desde documento. Reiniciar verificación vuelve a not_started. Revisión manual no recibe un resultado externo real.' ])
m.n('start','Abrir identidad',0,0,'startEvent').n('startsession','Iniciar / retomar / reintentar',1,0).n('session','Crear sesión; in_progress',2,2,'serviceTask').n('load','¿Carga el verificador?',3,2,'exclusiveGateway').n('loadfail','Error de carga → failed',3,0,'serviceTask').n('document','Simular documento',4,4,'serviceTask').n('selfie','Simular selfie y prueba de vida',5,4,'serviceTask').n('registry','Simular comparación con registros',6,4,'serviceTask').n('outcome','¿Resultado simulado?',7,4,'exclusiveGateway').n('approve','Guardar approved',8,2,'serviceTask').n('end','Volver al onboarding',9,2,'endEvent',doc='Retorno automático a los 2,4 s o manual con Volver ahora.').n('review','Guardar in_review',8,4,'serviceTask').n('observed','Guardar observed',8,5,'serviceTask').n('failed','Guardar failed',7,5,'serviceTask').n('retry','Consultar resultado; reintentar',6,0,doc='Todos los resultados no aprobados muestran Reintentar (incluida revisión manual). También se puede salir al hub, conservando el estado.')
m.f('start','startsession').f('startsession','session').f('session','load').f('load','loadfail','No').f('loadfail','retry',via=120).f('load','document','Sí').f('document','selfie').f('selfie','registry').f('registry','outcome').f('outcome','approve','approved').f('approve','end').f('outcome','review','in_review').f('outcome','observed','observed',via=1020).f('outcome','failed','failed').f('review','retry',via=390).f('observed','retry',via=1060).f('failed','retry',via=1090).f('retry','startsession','Nuevo intento',via=80)

m=Map('kyb','05 · Verificación de empresa','Cuatro secciones, borradores, observaciones, rechazo y entidades relacionadas', ['Persona administradora','Aplicación YOL1 (demo)','Revisión simulada'], 'src/features/onboarding/BusinessVerification.jsx',[
 'Secciones: identificación legal; representantes/accionistas/UBO/participaciones; cuatro documentos declarados; actividad, volumen, países, origen de fondos y contrapartes. Se pueden completar en cualquier orden.',
 'Guardar borrador no completa una sección. Guardar sección valida presencia de campos; editar una completa la devuelve a in_progress. Enviar exige 4 completas, cero observaciones y expediente desbloqueado.',
 'in_review, approved y rejected bloquean los formularios. Una observación se elimina con Marcar como corregida: no hay comprobación automática del contenido. El rechazo no tiene apelación implementada.',
 'Agregar entidad pide razón social y país, y crea una entidad related/draft. Cancelar no guarda. No hay expediente independiente implementado para cada entidad relacionada; no bloquea la aprobación global.' ])
m.n('start','Expediente draft / pending / observed',0,0,'startEvent').n('edit','Elegir y editar sección',1,0).n('save','¿Cómo guardar?',2,0,'exclusiveGateway').n('draft','Persistir borrador',2,2,'serviceTask').n('valid','¿Campos requeridos presentes?',3,2,'exclusiveGateway').n('err','Mostrar errores; in_progress',3,0,'serviceTask').n('complete','Persistir sección complete',4,2,'serviceTask').n('obs','Corregir y marcar observaciones',4,0).n('ready','¿4 completas y 0 observaciones?',5,2,'exclusiveGateway').n('submit','Enviar a revisión',6,0).n('review','Guardar in_review; bloquear campos',6,2,'serviceTask').n('outcome','¿Resultado?',7,4,'exclusiveGateway').n('approved','approved: expediente aprobado',8,4,'endEvent').n('observed','observed: devolver observaciones',7,2,'serviceTask').n('rejected','rejected: contactar ejecutivo',8,5,'endEvent',doc='No se abre la cuenta; datos persistidos y formularios bloqueados. Contactar al ejecutivo es una instrucción, no una integración de soporte.')
m.f('start','edit').f('edit','save').f('save','draft','Borrador').f('draft','edit','Continuar después',via=640).f('save','valid','Guardar sección').f('valid','err','No').f('err','edit',via=100).f('valid','complete','Sí').f('complete','ready').f('ready','edit','No: faltan secciones',via=680).f('ready','obs','No: observaciones').f('obs','edit','Revisar / guardar',via=130).f('ready','submit','Sí').f('submit','review').f('review','outcome').f('outcome','approved','Aprobar').f('outcome','observed','Observar').f('observed','obs',via=350).f('outcome','rejected','Rechazar')

m.lanes.append('Entidades relacionadas (rama opcional)')
m.n('entity_start','Agregar entidad',0,6,'startEvent').n('entity_data','Ingresar razón social y país',1,6).n('entity_valid','¿Datos completos?',2,6,'exclusiveGateway').n('entity_save','Guardar related / draft',3,6,'serviceTask').n('entity_end','Entidad agregada; sin KYB propio implementado',4,6,'endEvent').n('entity_cancel','Cancelar sin guardar',2,7,'endEvent')
m.f('entity_start','entity_data').f('entity_data','entity_valid').f('entity_valid','entity_save','Sí: guardar').f('entity_valid','entity_data','No: completar',via=1150).f('entity_save','entity_end').f('entity_data','entity_cancel','Cancelar')

m=Map('activation','06 · Apertura de cuenta','Inicio automático, persistencia, error y restricciones', ['Persona administradora','Aplicación YOL1 (demo)','Resultado de apertura simulado'], 'src/features/activation/CoreActivation.jsx',[
 'El proveedor global inicia automáticamente cuando existe organización, identidad=approved, KYB=approved y cuenta=not_provisioned. No hace falta mantener abierta la pantalla de activación.',
 'Se guarda provisioningStartedAt y el resultado previsto. La resolución global tarda 5,2 s menos el tiempo transcurrido; una recarga no reinicia el plazo. La simulación de error en pantalla resuelve a los 2,8 s si permanece montada.',
 'active y restricted habilitan acceso al Desk y productos core_account/virtual_accounts. La pantalla informa que restricted permite abonos y consulta pero bloquea egresos; la demo no implementa un motor real de egresos.',
 'Simular activa/restringida/error y Reiniciar apertura son controles de demo. Reiniciar a not_provisioned con verificaciones aprobadas vuelve a disparar la apertura. No existe flujo real de levantamiento de restricciones.' ])
m.n('start','Evaluar apertura',0,2,'startEvent').n('ready','¿Org + identidad y KYB aprobados?',1,2,'exclusiveGateway').n('missing','Completar verificaciones',1,0).n('status','¿Estado de cuenta?',2,2,'exclusiveGateway').n('startp','Iniciar apertura; guardar fecha',3,2,'serviceTask').n('progress','En apertura: conservar avance',4,2,'serviceTask',doc='Consultar estado solo muestra un aviso; no consulta a un backend. Los pasos de validación de titular/moneda/número son representación visual, no comprobaciones bancarias reales.').n('outcome','¿Resultado previsto?',5,4,'exclusiveGateway').n('active','Guardar active',6,4,'serviceTask').n('restricted','Guardar restricted',6,5,'serviceTask').n('failed','Guardar failed',5,5,'serviceTask').n('retry','Reintentar apertura',4,0).n('core','Habilitar cuenta vista y cuentas virtuales',7,2,'serviceTask').n('desk','Acceder al Desk',8,0).n('end','Cuenta habilitada (con o sin restricciones)',9,0,'endEvent')
m.f('start','ready').f('ready','missing','No').f('missing','ready','Revisar estados',via=85).f('ready','status','Sí').f('status','startp','not_provisioned').f('status','progress','provisioning',via=360).f('status','retry','failed').f('retry','startp').f('startp','progress').f('progress','outcome','Completar temporizador').f('outcome','active','active').f('outcome','restricted','restricted',via=1010).f('outcome','failed','failed').f('failed','retry',via=1050).f('active','core').f('restricted','core',via=1080).f('core','desk').f('desk','end').f('status','desk','active / restricted: ya accesible',via=110)

m=Map('access','07 · Acceso, retorno y controles de demo','Las rutas dependen del estado; navegar no reinicia el onboarding', ['Persona administradora','Enrutamiento de la aplicación','Control de demo (fuera del proceso real)'], 'src/App.jsx',[
 'La raíz / usa resolveStage: sin org → signup; cuenta active/restricted → desk; provisioning/failed → activation; ambas verificaciones aprobadas → activation; resto → onboarding.',
 'Un acceso directo a /desk aplica otra condición: sin cuenta accesible, va a activación si ambas verificaciones están aprobadas O si la cuenta no es not_provisioned; de lo contrario, onboarding.',
 'Configuración y onboarding requieren organization.id. La función canAccessOrgConsole existe, pero no es el guard usado por las rutas. userStatus=disabled no revoca por sí solo el acceso en la demo.',
 'Demo Control permite cambiar estados independientemente, incluso crear combinaciones inconsistentes. Aplicar y abrir el Desk salta el recorrido; Reiniciar demo borra el estado local. No representan rutas del cliente de producción.' ])
m.n('start','Abrir ruta',0,0,'startEvent').n('org','¿Existe organización?',1,2,'exclusiveGateway').n('signup','Ir a signup',2,0,'endEvent').n('route','¿Ruta solicitada?',2,2,'exclusiveGateway').n('config','Abrir configuración / onboarding',3,0,'endEvent').n('operable','¿Cuenta active o restricted?',3,2,'exclusiveGateway').n('desk','Abrir Merchant Desk',4,0).n('where','¿Verificaciones aprobadas o cuenta ≠ sin abrir?',4,2,'exclusiveGateway').n('activation','Ir a activación',5,2,'endEvent').n('onboarding','Ir a onboarding',5,3,'endEvent').n('back','Volver al onboarding / regresar al Desk',5,0,'endEvent')
m.n('demo','Abrir Demo Control',0,4,'startEvent').n('action','¿Acción de prueba?',1,4,'exclusiveGateway').n('scenario','Crear escenario operativo',2,4,'serviceTask').n('patch','Modificar estados independientes',3,5,'serviceTask').n('reset','Borrar estado local',2,5,'serviceTask').n('reeval','Reevaluar efectos y navegación',4,4,'endEvent')
m.f('start','org').f('org','signup','No').f('org','route','Sí').f('route','config','/org/* o /onboarding/*').f('route','operable','/desk/*').f('operable','desk','Sí').f('operable','where','No').f('where','activation','Sí').f('where','onboarding','No').f('desk','back','Sin borrar datos').f('demo','action').f('action','scenario','Escenario rápido').f('action','patch','Cambiar estado',via=1040).f('action','reset','Reiniciar').f('scenario','reeval','Abrir Desk').f('patch','reeval').f('reset','reeval','Volver a signup',via=1070)

m=Map('products','08 · Productos adicionales (anexo)','Ciclo separado del onboarding y de la apertura de cuenta', ['Persona administradora','Aplicación YOL1 (demo)','Evaluación: solo simulada con Demo Control'], 'src/features/desk/ProductCatalog.jsx',[
 'Este anexo explica qué sucede después del onboarding; FX, Payouts, Iniciación de pagos y Tarjetas no bloquean la cuenta vista.',
 'Solicitar registra requested, fecha y nota. in_review, pending_configuration, active y rejected pueden asignarse en Demo Control; no hay evaluación real ni avance automático entre ellos.',
 'Guardar configuración de un producto actualiza roles/límites; no lo activa automáticamente. OrgProducts permite suspender y reactivar productos aprobados. Solo active aparece en la barra operativa.',
 'La demo no implementa operaciones reales de FX, pagos ni tarjetas. Los requisitos por jurisdicción del catálogo son de ejemplo.' ])
m.n('start','Explorar catálogo',0,0,'startEvent').n('status','¿Estado del producto?',1,2,'exclusiveGateway').n('unavailable','No disponible: consultar motivo',2,3,'endEvent').n('request','Revisar requisitos y solicitar',2,0).n('confirm','¿Confirmar solicitud?',3,0,'exclusiveGateway').n('requested','Guardar requested y nota',4,2,'serviceTask').n('review','Asignar in_review [DEMO]',5,4,'userTask').n('decision','¿Resultado [DEMO]?',6,4,'exclusiveGateway').n('pending','Asignar pending_configuration',7,4,'userTask').n('config','Configurar roles y límites',7,0).n('active','Asignar active [DEMO]',8,4,'userTask').n('use','Mostrar en barra; abrir producto',8,0).n('suspend','Suspender / reactivar',9,0).n('reject','rejected: consultar ejecutivo',7,5,'endEvent').n('cancel','Volver al catálogo sin solicitar',3,3,'endEvent')
m.f('start','status').f('status','unavailable','not_available').f('status','request','available_to_request').f('request','confirm').f('confirm','cancel','No').f('confirm','requested','Sí').f('requested','review','Cambio manual de demo').f('review','decision').f('decision','pending','Aprobación simulada').f('decision','reject','Rechazo simulado').f('pending','config').f('config','active','Guardar NO activa; cambiar estado en demo').f('active','use').f('use','suspend').f('suspend','use','Reactivar',via=100).f('status','use','active',via=80)

# BPMN model and diagrams. Each process is non-executable and documents the actual demo.
root=Element('{'+NS['bpmn']+'}definitions',{'id':'YOL1_Enterprise','targetNamespace':'https://yol1.example/bpmn','exporter':'YOL1 code-based documentation','exporterVersion':'1.0'})
for m in maps:
 proc=el(root,'bpmn:process',{'id':m.id,'name':m.title,'isExecutable':'false'})
 el(proc,'bpmn:documentation',text=m.subtitle+'\n\n'+'\n'.join(m.notes)+'\nFuente: '+m.source+' @ '+REV)
 lanes=el(proc,'bpmn:laneSet',{'id':m.id+'_lanes'})
 for i,name in enumerate(m.lanes):
  lane=el(lanes,'bpmn:lane',{'id':m.id+'_lane'+str(i),'name':name})
  for n in m.nodes:
   if int(n['row'])//2==i:el(lane,'bpmn:flowNodeRef',text=n['id'])
 for n in m.nodes:
  attrs={'id':n['id'],'name':n['label']}
  if n['call']:attrs['calledElement']=n['call']
  elem=el(proc,'bpmn:'+n['kind'],attrs);el(elem,'bpmn:documentation',text=n['doc']+'\nFuente: '+m.source)
  for e in m.edges:
   eid=m.id+'_f'+str(m.edges.index(e))
   if e['b']==n['id']:el(elem,'bpmn:incoming',text=eid)
   if e['a']==n['id']:el(elem,'bpmn:outgoing',text=eid)
  if n['kind']=='intermediateCatchEvent':
   timer=el(elem,'bpmn:timerEventDefinition',{'id':n['id']+'_timer'})
   el(timer,'bpmn:timeDuration',{'{'+NS['xsi']+'}type':'bpmn:tFormalExpression'},'PT30S')
 for i,e in enumerate(m.edges):
  f=el(proc,'bpmn:sequenceFlow',{'id':m.id+'_f'+str(i),'sourceRef':e['a'],'targetRef':e['b'],'name':e['label']})
  el(f,'bpmn:documentation',text=e['label'] or 'Continuar recorrido')
 diagram=el(root,'bpmndi:BPMNDiagram',{'id':m.id+'_diagram','name':m.title})
 plane=el(diagram,'bpmndi:BPMNPlane',{'id':m.id+'_plane','bpmnElement':m.id})
 width=210*(max(n['col'] for n in m.nodes)+1)+130
 for i,name in enumerate(m.lanes):
  shape=el(plane,'bpmndi:BPMNShape',{'id':m.id+'_lane'+str(i)+'_di','bpmnElement':m.id+'_lane'+str(i),'isHorizontal':'true'})
  el(shape,'dc:Bounds',dict(x='30',y=str(50+i*350),width=str(width),height='350'))
 lookup={}
 for n in m.nodes:
  cx=150+210*n['col'];cy=185+350*(n['row']//2)+135*(n['row']%2)
  w,h=(54,54) if 'Gateway' in n['kind'] else (38,38) if 'Event' in n['kind'] else (156,80)
  n.update(x=cx-w/2,y=cy-h/2,w=w,h=h,cx=cx,cy=cy);lookup[n['id']]=n
  shape=el(plane,'bpmndi:BPMNShape',{'id':n['id']+'_di','bpmnElement':n['id']})
  if n['kind']=='exclusiveGateway':shape.set('isMarkerVisible','true')
  el(shape,'dc:Bounds',dict(x=str(n['x']),y=str(n['y']),width=str(w),height=str(h)))
  if 'Gateway' in n['kind'] or 'Event' in n['kind']:
   label=el(shape,'bpmndi:BPMNLabel');el(label,'dc:Bounds',dict(x=str(cx-76),y=str(cy+h/2+5),width='152',height='43'))
 for i,e in enumerate(m.edges):
  a,b=lookup[e['a']],lookup[e['b']]
  if e['via'] is not None:
   y=e['via'];pts=[(a['cx'],a['y'] if y<a['cy'] else a['y']+a['h']),(a['cx'],y),(b['cx'],y),(b['cx'],b['y'] if y<b['cy'] else b['y']+b['h'])]
  elif a['cy']==b['cy']:
   pts=[(a['x']+a['w'],a['cy']),(b['x'],b['cy'])] if b['cx']>a['cx'] else [(a['x'],a['cy']),(b['x']+b['w'],b['cy'])]
  elif a['cx']==b['cx']:
   pts=[(a['cx'],a['y']+a['h'] if b['cy']>a['cy'] else a['y']),(b['cx'],b['y'] if b['cy']>a['cy'] else b['y']+b['h'])]
  else:
   right=b['cx']>a['cx'];sx=a['x']+a['w'] if right else a['x'];tx=b['x'] if right else b['x']+b['w'];mid=(sx+tx)/2
   pts=[(sx,a['cy']),(mid,a['cy']),(mid,b['cy']),(tx,b['cy'])]
  edge=el(plane,'bpmndi:BPMNEdge',{'id':m.id+'_f'+str(i)+'_di','bpmnElement':m.id+'_f'+str(i)})
  for x,y in pts:el(edge,'di:waypoint',dict(x=str(x),y=str(y)))
  if e['label']:
   longest=max(zip(pts,pts[1:]),key=lambda pair:abs(pair[0][0]-pair[1][0])+abs(pair[0][1]-pair[1][1]));p,q=longest
   label=el(edge,'bpmndi:BPMNLabel');el(label,'dc:Bounds',dict(x=str((p[0]+q[0])/2-65),y=str((p[1]+q[1])/2-34),width='130',height='30'))
ElementTree(root).write(OUT/'yol1-enterprise.bpmn',encoding='utf-8',xml_declaration=True)
metadata=[dict(id=m.id,title=m.title,subtitle=m.subtitle,source=m.source,notes=m.notes,nodes=m.nodes) for m in maps]
(OUT/'model.json').write_text(json.dumps({'revision':REV,'maps':metadata},ensure_ascii=False,indent=2))
print(f'Generated {len(maps)} processes, {sum(len(m.nodes) for m in maps)} nodes, {sum(len(m.edges) for m in maps)} flows; source {REV[:7]}')
