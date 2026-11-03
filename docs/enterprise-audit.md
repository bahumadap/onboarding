# YOL1 Enterprise: auditoría y continuidad

Rama de trabajo: `yol1-enterprise`. Alcance: demo local; sin despliegue ni servicios financieros reales.

## Diagnóstico inicial

La implementación era más extensa que el traspaso indicaba: Signup, identidad simulada,
KYB por secciones, Core Activation, Merchant Desk y siete secciones de Config Org ya
existían. Se conservaron React 18, Vite, Router, Lucide, Recharts, el reducer y el kit UI.
La instalación con `npm ci` y el build inicial pasaron. No existía una suite de pruebas.

Problemas identificados:

- El OTP agotado no se recuperaba al reenviar; el temporizador de vencimiento no
  se renovaba y recargar reiniciaba artificialmente su vigencia.
- La ruta raíz interpretaba un email ingresado como registro terminado.
- Recargar en términos permitía seguir sin repetir la contraseña, que solo vive en memoria.
- La apertura de cuenta se iniciaba manualmente y sus temporizadores dependían de una pantalla.
- El KYB de la entidad principal no reflejaba el estado aprobado del expediente.
- El signup agregaba miembros ficticios sin invitación y completaba tareas del checklist.
- Editar una sección KYB completa no invalidaba su condición de lista para enviar.
- Documentación y compliance y Preferencias eran placeholders.
- El CSS legacy se importaba globalmente: reglas para header, body y clases
  genéricas contaminaban Enterprise y rompían encabezados en móvil.

## Cambios

OTP con fecha de emisión persistida, reenvío que restablece intentos y vencimiento,
retoma del signup por organización creada y nueva validación de contraseña tras
recargar. Nunca se persisten contraseñas. Se conserva confirmación de usuario,
organización y borrador antes de entrar al onboarding.

El provider inicia automáticamente el aprovisionamiento cuando identidad y KYB
están aprobados. La simulación termina después de 5,2 segundos y retoma el tiempo
transcurrido tras recargar. Las cuentas virtuales y productos core se habilitan con
la cuenta; los productos adicionales conservan su evaluación independiente.
El primer equipo tiene solo al administrador registrado. El expediente principal
sincroniza su estado KYB con la entidad principal; entidades relacionadas siguen separadas.

El prototipo legacy se carga por separado y sus hojas CSS están delimitadas con
`@scope (.legacy-root)`: sus reglas no afectan las pantallas Enterprise, incluso
después de visitar `/legacy`. La geometría y componentes del prototipo se conservan.

Config Org incluye consulta del expediente, secciones y términos aceptados, además
de preferencias guardadas automáticamente en localStorage. Reutilizan tokens y primitivas UI.
Las preferencias de notificaciones y zona horaria son datos de demostración; no
simulan envío de mensajes ni cambian la seguridad o las fechas del resto del producto.

## Validación reproducible

```sh
npm ci
npm run build
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
# En otra terminal; requiere Python con Playwright y /usr/bin/chromium:
python3 tests/enterprise_smoke.py
```

La prueba usa un contexto de navegador aislado y no borra datos de otros navegadores.
Comprueba signup con bloqueo/reenvío/vencimiento OTP, retoma, contraseña no persistida,
KYB, identidad, activación automática, guards, rutas, preferencias, cuenta virtual y
solicitud de producto. Las fuentes externas se bloquean para validar sin depender de
Google Fonts. Usa el reloj de Playwright para no esperar los plazos completos del OTP.

## Supuestos y límites

- Solo la entidad principal completa el recorrido de apertura. Las relacionadas se
  declaran como borradores: no hay operación financiera multinacional implementada.
- Las monedas y saldos son datos ficticios; no implican disponibilidad por jurisdicción.
- No hay backend, autenticación real, OTP por correo, carga de documentos ni evaluación
  regulatoria. Los resultados de identidad/KYB son controles explícitos de simulación.
- El catálogo permite solicitar productos y cambiar estados con Demo Control; operar
  FX o ejecutar payouts reales queda fuera de esta demo.
- El build advierte un bundle superior a 500 kB. Se mantiene como mejora posterior de
  rendimiento; no se cambió de stack ni se actualizaron dependencias para esta entrega.
- El runtime de pruebas de navegador está disponible en este entorno; no se agregó una
  dependencia Python al paquete frontend. No hay un lint o typecheck configurado.
- No se cambió la configuración publicada del entorno ni se desplegó en producción.

## Resultado verificado en esta entrega

- `npm ci`: 110 paquetes instalados con el lockfile existente.
- `npm run build`: correcto; advertencia de chunk principal de 833 kB.
- Navegador: recorrido completo, 14 rutas, 404, persistencia y móvil de 390 px correctos.
- Escenarios: KYB rechazado bloquea el Desk; cuenta fallida permite reintento;
  cuenta restringida conserva acceso de consulta sin activar productos adicionales.
- `git diff --check`: sin errores.
