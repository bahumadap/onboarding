from pathlib import Path
from html import escape
R=Path(__file__).resolve().parents[1];O=R/'docs/bpmn'
parts=['''<svg xmlns="http://www.w3.org/2000/svg" width="4240" height="1340" viewBox="0 0 4240 1340"><title>YOL1 Enterprise — Onboarding por procesos</title><desc>Lectura de izquierda a derecha. Identidad y KYB independientes. Merchant Desk después de la apertura. Configuración disponible desde el registro.</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#536977"/></marker></defs><rect width="4240" height="1340" fill="#f6f8fb"/>''']
def text(x,y,lines,size=17,color='#173c43',bold=False,anchor='middle'):
 if isinstance(lines,str):lines=lines.split('\n')
 parts.append(f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="Arial, sans-serif" font-size="{size}" fill="{color}" font-weight="{700 if bold else 400}">')
 for i,line in enumerate(lines):parts.append(f'<tspan x="{x}" dy="{0 if i==0 else size*1.35}">{escape(line)}</tspan>')
 parts.append('</text>')
def rect(x,y,w,h,fill,stroke='#cbd6de',radius=13):parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>')
def block(id,x,y,w,h,title,sub,color):
 parts.append(f'<g id="{id}">');rect(x,y,w,h,'white',color,20);rect(x,y,w,80,color,color,20);text(x+24,y+34,title,24,'#173c43',True,'start');text(x+24,y+62,sub,16,'#264a56',False,'start');parts.append('</g>')
def task(id,x,y,w,label,color='#edf2f8'):
 parts.append(f'<g id="{id}">');rect(x,y-38,w,76,color);text(x+w/2,y-8,label,17,bold=True);parts.append('</g>')
def decision(id,x,y,label):
 parts.append(f'<g id="{id}"><path d="M{x} {y-48}L{x+52} {y}L{x} {y+48}L{x-52} {y}Z" fill="#fff0b3" stroke="#a47913" stroke-width="2"/>');text(x,y-7,label,16,bold=True);parts.append('</g>')
def event(x,y,label,end=False):
 parts.append(f'<circle cx="{x}" cy="{y}" r="16" fill="{ "#d7e8ee" if end else "#d4f1dc"}" stroke="#27504e" stroke-width="{4 if end else 2}"/>');text(x,y+40,label,14)
def gateway(x,y):
 parts.append(f'<path d="M{x} {y-24}L{x+24} {y}L{x} {y+24}L{x-24} {y}Z" fill="#edf4ff" stroke="#385775" stroke-width="2"/>');text(x,y+8,'+',27,bold=True)
def flow(points,label=None,lx=None,ly=None,dashed=False):
 parts.append('<polyline points="'+' '.join(f'{x},{y}' for x,y in points)+'" fill="none" stroke="#536977" stroke-width="2.5" '+('stroke-dasharray="8 6" ' if dashed else '')+'marker-end="url(#arrow)"/>')
 if label:text(lx,ly,label,15,'#40586a')
text(60,54,'YOL1 ENTERPRISE  /  MAPA DEL ONBOARDING',32,bold=True,anchor='start')
text(60,91,'Modelo actual · De izquierda a derecha · Bloques por proceso · Detalle completo en los ocho diagramas BPMN adjuntos',21,anchor='start')
# Blocks and primary activities
block('signup',60,190,740,620,'01  SIGN UP','Crear usuario, organización y expediente','#dce8ff')
event(100,400,'Inicio');task('correo',140,400,155,'Correo + OTP\nVer detalle 03','#eaf0ff');decision('otp-ok',370,400,'¿Correo\nverificado?');task('datos',450,400,165,'Datos + clave\ny términos','#eaf0ff');event(730,400,'Registro completo',True)
flow([(116,400),(140,400)]);flow([(295,400),(318,400)]);flow([(422,400),(450,400)],'Sí',438,379);flow([(615,400),(714,400)],'Crear organización',665,369)
flow([(370,448),(370,540),(215,540),(215,438)],'No: corregir / reenviar',267,522)
text(90,620,['OTP: 180 s · 3 intentos · reenvío desde 30 s.','Datos requeridos y contraseña válida antes de crear la cuenta.','No aceptar términos mantiene el registro incompleto.','Recargar exige revalidar la contraseña; no se persiste.'],17,anchor='start')
# parallel verification
block('identity',890,190,850,290,'02A  IDENTIDAD','Sesión simulada · documento, selfie y contraste','#e6dcfa')
event(925,350,'Inicio');task('captura',960,350,185,'Captura y\nvalidación','#f1eafb');decision('identity-result',1240,350,'¿Resultado?');task('identity-approved',1340,350,190,'Identidad\naprobada','#dcf1e4');event(1680,350,'Aprobada',True)
flow([(941,350),(960,350)]);flow([(1145,350),(1188,350)]);flow([(1292,350),(1340,350)],'approved',1317,328);flow([(1530,350),(1664,350)])
flow([(1240,398),(1240,444),(1050,444),(1050,388)],'Revisión / observación / fallo: reintentar',1240,429)
block('kyb',890,540,850,370,'02B  KYB · EMPRESA','Expediente legal, estructura, documentos y actividad','#dcf0ef')
event(925,700,'Inicio');task('sections',960,700,185,'Completar\n4 secciones','#e7f5f4');decision('kyb-ready',1225,700,'¿Listo para\nenviar?');task('review',1310,700,140,'Revisión\nsimulada','#e7f5f4');decision('kyb-result',1540,700,'¿Resultado?');event(1680,700,'Aprobada',True)
flow([(941,700),(960,700)]);flow([(1145,700),(1173,700)]);flow([(1277,700),(1310,700)],'Sí',1293,681);flow([(1450,700),(1488,700)]);flow([(1592,700),(1664,700)],'Aprobado',1629,679)
flow([(1225,748),(1225,825),(1050,825),(1050,738)],'No: completar / guardar',1120,807)
flow([(1540,748),(1540,860),(1080,860),(1080,738)],'Observado: corregir, marcar y reenviar',1390,886)
flow([(1540,652),(1540,642),(1660,642)],'Rechazado',1600,625);event(1676,642,'Bloqueado',True)
# exterior parallel split and convergence
flow([(746,400),(832,400)]);gateway(856,400);flow([(856,376),(856,350),(909,350)]);flow([(856,424),(856,700),(909,700)])
text(852,760,['Sin orden','obligatorio'],14)
# opening
block('activation',1820,190,880,720,'03  APERTURA DE CUENTA','Automática cuando ambas verificaciones están aprobadas','#fff0cc')
gateway(1780,525);flow([(1696,350),(1780,350),(1780,501)]);flow([(1696,700),(1780,700),(1780,549)])
event(1870,525,'Inicio');flow([(1804,525),(1854,525)]);decision('both-approved',1970,525,'¿Ambas\naprobadas?');flow([(1886,525),(1918,525)])
task('provision',2070,525,180,'Abrir cuenta\n≈ 5,2 s','#fff5df');decision('account-result',2350,525,'¿Resultado?');task('enabled',2440,525,170,'Habilitar cuenta\ny cuentas virtuales','#e0f1df');event(2650,525,'Habilitada',True)
flow([(2022,525),(2070,525)],'Sí',2045,502);flow([(2250,525),(2298,525)]);flow([(2402,525),(2440,525)],'Activa',2421,500);flow([(2610,525),(2634,525)])
flow([(1970,573),(1970,700),(1860,700)],'No: continuar verificaciones',1980,727);event(1844,700,'En espera',True)
flow([(2350,573),(2350,790),(2160,790),(2160,563)],'Fallida: reintentar',2255,771)
flow([(2350,477),(2350,365),(2525,365),(2525,487)],'Restringida: acceso con restricciones',2430,342)
text(1850,840,['El avance sobrevive a recargas. No hay apertura bancaria real.','Las restricciones informadas no constituyen un motor de pagos implementado.'],16,anchor='start')
block('desk',2770,190,590,720,'04  MERCHANT DESK','Operación habilitada tras la apertura','#dff0da')
event(2810,525,'Inicio');task('desk-overview',2850,525,170,'Saldos y\nmovimientos','#eaf6e6');task('desk-products',3070,525,170,'Cuentas virtuales\ny productos','#eaf6e6');event(3310,525,'Fin del onboarding',True)
flow([(2666,525),(2794,525)]);flow([(2826,525),(2850,525)]);flow([(3020,525),(3070,525)]);flow([(3240,525),(3294,525)])
text(2800,680,['Cuenta activa o restringida permite entrar.','Onboarding continúa disponible para consulta.','El Desk no se abre al completar solo KYB.'],17,anchor='start')
block('products',3430,190,750,720,'05  PRODUCTOS ADICIONALES','Ciclo opcional e independiente del onboarding','#f9e2d3')
event(3470,525,'Inicio');task('request',3510,525,155,'Solicitar\nproducto','#fff0e6');decision('product-result',3750,525,'¿Evaluación\naprobada?');task('product-config',3840,525,180,'Configurar\ny activar*','#fff0e6');event(4110,525,'Producto activo',True)
flow([(3326,525),(3454,525)],'Opcional',3390,500);flow([(3486,525),(3510,525)]);flow([(3665,525),(3698,525)]);flow([(3802,525),(3840,525)],'Sí*',3820,500);flow([(4020,525),(4094,525)])
flow([(3750,573),(3750,700),(3590,700)],'No: pendiente / rechazado',3700,731);event(3574,700,'Sin activar',True)
text(3460,805,['* Evaluación y activación se cambian con Demo Control.','Guardar configuración no activa el producto automáticamente.','Solo los productos activos aparecen en la barra lateral.'],17,anchor='start')
# independent admin process
a=970
block('configuration',890,a,1810,210,'EN PARALELO  ·  CONFIGURACIÓN','Disponible desde la creación de la organización; no depende de la aprobación KYB','#e6eaf0')
flow([(730,416),(730,1095),(925,1095)],'Organización creada',750,1015,dashed=True);event(941,1095,'Inicio');task('org-settings',985,1095,430,'Empresa · Usuarios · Cuentas · Aprobaciones','#f0f3f7');task('tech-settings',1460,1095,425,'API · Productos · Documentación · Preferencias','#f0f3f7');event(1980,1095,'Ajustes guardados',True)
flow([(957,1095),(985,1095)]);flow([(1415,1095),(1460,1095)]);flow([(1885,1095),(1964,1095)]);text(2170,1085,['No desbloquea por sí sola','la apertura de cuenta.'],19,anchor='start')
text(60,1250,'LEYENDA',18,bold=True,anchor='start');event(205,1244,'Inicio');event(320,1244,'Término',True);decision('legend',480,1244,'Decisión');gateway(640,1244);text(640,1295,'Paralelo',14);text(760,1250,['Las flechas muestran secuencia; el trazo discontinuo indica acceso independiente.','Modelo de la demo actual · Los términos “aprobado” y “activo” no representan aprobaciones regulatorias reales.'],18,anchor='start')
parts.append('</svg>');(O/'00-mapa-por-procesos-figma.svg').write_text(''.join(parts))
print('SVG para Figma generado')
