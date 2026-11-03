# UX Writing de YOL1 Enterprise

## Diagnóstico

Se revisaron Signup, Onboarding (identidad y empresa), Core Activation,
Merchant Desk y las ocho secciones administrativas de Config Org, junto con
el checklist, los estados compartidos, el kit UI, los mocks y Demo Control.
El prototipo SMB de `src/legacy` queda fuera de esta revisión y no se modificó.

Los problemas principales eran:

- Repetición de la misma explicación en el panel lateral, encabezado, tarjeta y pie.
- Detalles de implementación en la interfaz: «macroproceso», «core»,
  «aprovisionamiento», «backend», «hub» y nombres de objetos en inglés.
- Frases extensas antes de tareas simples y botones que describían el mecanismo
  interno en vez de la acción del usuario.
- Terminología desigual: validación/verificación, Desk/Merchant Desk,
  cartola/movimientos y roles en inglés dentro de una interfaz en español.
- Errores genéricos y ayudas visualmente próximas al campo, pero sin una
  asociación programática con él.
- Promesas que la demo no ejecuta: envío de correos, plazos de revisión,
  gestión de casos por equipos reales y emisión de credenciales.
- Explicaciones siempre visibles sobre simulaciones y escenarios alternativos.
- Progreso duplicado en el encabezado del onboarding; junto al botón de regreso
  al Desk producía desbordamiento en móvil.

## Criterios editoriales

1. **La tarea primero.** Título breve, contexto solo cuando cambia una decisión y
   una acción principal reconocible. No repetir el título en la descripción.
2. **Verbos concretos.** «Guardar sección», «Enviar a revisión», «Solicitar
   producto», «Consultar estado». Evitar «gestionar» cuando se pueda nombrar la acción.
3. **Una idea por mensaje.** Quitar introducciones de marketing y explicaciones
   sobre cómo está construido el producto.
4. **Errores que se puedan resolver.** Indicar el dato que falta o su formato y
   cómo corregirlo. No culpar al usuario ni usar un tono alarmista.
5. **Profesional y cercano.** Tratar de tú; español natural, sin «tu plata», «acá»
   ni tecnicismos ajenos a la tarea. Conservar términos técnicos útiles en API y
   los términos jurídicos que permiten entender requisitos.
6. **Resultados comprobables.** Confirmar lo que ocurrió. No prometer correos,
   tiempos ni revisiones reales en una simulación.
7. **Ayuda bajo demanda.** Reservar los desplegables para información secundaria.
   Nunca ocultar una restricción financiera, una consecuencia importante o una
   condición necesaria en el momento de confirmar una acción.
8. **Accesibilidad.** Etiquetas permanentes; placeholders como ejemplos, no como
   sustitutos de etiquetas. Ayudas y errores asociados mediante `aria-describedby`;
   errores anunciados y controles con `aria-required`/`aria-invalid` cuando aplica.
9. **Mantener el significado.** No abreviar requisitos legales, alcance de permisos,
   tratamiento de datos, límites monetarios o consecuencias de una suspensión hasta
   volverlos ambiguos. Los términos aceptados y su versión se conservaron.

## Vocabulario

| Concepto | Nombre en la interfaz | Criterio |
| --- | --- | --- |
| Entorno operativo | Merchant Desk | Nombre completo en la navegación y los CTA. |
| Administración | Config Org | No mezclar configuración con movimientos de fondos. |
| Recorrido de verificación | Onboarding | Se conserva como destino de navegación. |
| Identidad | Verificación de identidad | No asumir que el administrador es representante legal. |
| Empresa | Verificación de empresa / KYB | KYB se conserva cuando identifica el expediente técnico. |
| Provisioning | Apertura de cuenta | Valores internos de estado sin cambios. |
| Cuenta operativa | Cuenta vista activa | Aprobación de KYB y cuenta activa siguen siendo estados distintos. |
| Ledger / cartola | Movimientos | «Abonos» y «egresos» para distinguir el sentido del dinero. |
| Organización | Organización | Usuarios, roles, permisos y configuración. |
| Empresa | Empresa | Registro y datos comerciales de la empresa. |
| Legal entity | Entidad jurídica | Una sociedad concreta, distinta de los países de operación. |
| Roles | Administrador, Operador, Aprobador, Consulta | IDs y permisos originales sin cambios. |
| Solicitud de producto | Solicitar producto | Solicitar no equivale a activar. |
| Compliance | Cumplimiento | Conservar identificadores técnicos, URLs y requisitos legales. |

## Cambios por módulo

| Módulo | Cambio implementado | Información preservada |
| --- | --- | --- |
| Signup | Título «Crea tu cuenta», ayudas breves, errores específicos y confirmación «Registro completo». Etapas laterales desplegables. | Contraseña, OTP, términos, constitución vs. operación, administrador vs. representante y beneficiario final. |
| Identidad | «Verifica tu identidad», instrucciones breves y resultados simulados sin prometer correos. Otros resultados bajo demanda. | Documento, reintento desde la captura, observaciones, revisión y ausencia de capturas reales. |
| Empresa / KYB | «Guardar sección», errores por dato, sin volver a enumerar los campos del formulario. Entidades del grupo bajo demanda. | Representantes, propietarios, beneficiarios finales, documentos, país y origen de fondos. |
| Activación | «Apertura de cuenta», estado y restricciones visibles. Etapas y otros resultados bajo demanda. | Apertura automática, cuenta todavía no operable, egresos bloqueados, reintento y relación con cuentas virtuales. |
| Merchant Desk | Resúmenes breves, estados vacíos con siguiente paso y terminología uniforme de movimientos. El detalle de cuenta muestra su estado real, incluida una restricción. | Saldos disponibles/reservados, monedas, liquidación pendiente y fondos de operaciones fallidas. |
| Productos | Descripciones breves; características y requisitos secundarios desplegables en el catálogo. | Requisitos visibles al solicitar, evaluación independiente, plazo estimado y configuración previa a operar. |
| Config Org: inicio | Checklist de tareas, sin explicaciones repetidas sobre la separación de áreas. | Tareas automáticas, necesarias, recomendadas y opcionales; las opcionales no bloquean la cuenta. |
| Perfil y cuentas | Datos y acciones directos, menos texto sobre arquitectura multinacional. | Nueva revisión de datos legales, posible pausa de productos, titularidad, roles y consecuencias de suspender. |
| Usuarios y aprobaciones | Roles en español, errores específicos y referencia de roles bajo demanda. | Último administrador, acceso perdido, límite CLP, doble aprobación y personas distintas. |
| API, cumplimiento y preferencias | Mensajes de ejemplo explícitos y sin promesas de integraciones reales. | Claves ficticias, recomendaciones de seguridad, documentos no subidos y límites de las preferencias de demo. |
| Demo Control | Instrucciones breves para probar los cuatro estados independientes. | Escenario rápido, regreso al onboarding y reinicio de datos. |

### Ejemplos

| Antes | Después |
| --- | --- |
| «Una cuenta empresarial para operar tu plata en un solo lugar.» | «Tu cuenta empresarial, paso a paso.» |
| «Macroproceso C · Activación de la cuenta» | Se retira el rótulo interno; se conserva el título y el estado. |
| «Marcar sección como completa» | «Guardar sección» |
| «La contraseña todavía no cumple los requisitos.» | «Usa 10 caracteres o más, mayúsculas, minúsculas y un número.» |
| «Completa este dato para marcar la sección.» | «Ingresa la identificación tributaria.» |
| «En aprovisionamiento» | «En apertura» |
| «Mueve los estados del sistema sin backend. Las cuatro dimensiones son independientes.» | «Prueba estados simulados de usuario, verificaciones, cuenta y productos.» |
| «El proveedor ... suele tomar menos de 24 horas y te avisamos por correo.» | «Tu identidad requiere revisión manual. Consulta el estado aquí.» |

## Divulgación progresiva

El componente compartido `ContentDetails` usa `details`/`summary` nativos y los
tokens existentes. Funciona con clic y teclado, sin añadir una nueva librería.
Se aplicó a etapas del proceso, etapas de apertura, simulaciones alternativas,
entidades del grupo, datos de la empresa, características de productos y referencias
de permisos. Las acciones y sus condiciones se conservan.

En el catálogo se puede consultar el detalle antes de solicitar. Al abrir la
solicitud, los requisitos y la advertencia «Solicitar no activa el producto» se
muestran sin desplegar nada. Los errores, restricciones de cuenta y cambios de
datos legales con impacto en productos siguen visibles en su contexto.

## Validación y límites

- Build de Vite y recorrido completo existente en Chromium.
- Pruebas de divulgación con teclado, asociación de errores y ayudas, condiciones
  de solicitud de productos y restricciones de cuenta sin desplegar contenido.
- Revisión responsive a 390, 768 y 1440 px; capturas de escritorio y móvil.
- No cambian el reducer, las rutas, las condiciones de validación, los IDs de estados,
  las reglas de aprobación ni el aprovisionamiento. Se adapta el texto que ve el usuario.
- Los tokens del Design System, dependencias, despliegues y configuración Vercel
  se mantienen. No se despliega ni se modifica `main`.
- Estas pruebas no sustituyen una evaluación con usuarios ni una auditoría formal
  de accesibilidad o cumplimiento regulatorio. Los requisitos reales deben validarse
  con el equipo legal y de cumplimiento.

Comandos de comprobación:

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
# En otra terminal con Python Playwright y Chromium disponibles:
YOL1_TEST_URL=http://127.0.0.1:4173 python3 tests/enterprise_smoke.py
python3 tests/content_review.py
```

## Referencias editoriales

- [GOV.UK: Writing for GOV.UK](https://www.gov.uk/guidance/content-design/writing-for-gov-uk): necesidades del usuario, lectura por escaneo y lenguaje claro.
- [GOV.UK Design System: Details](https://design-system.service.gov.uk/components/details/): mostrar información secundaria bajo demanda, sin ocultar lo que necesita la mayoría. Se consultó la guía fuente actual durante la revisión.
- [WCAG 2.2: Error Identification, 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): identificar el error y describirlo mediante texto.
- [WCAG 2.2: Labels or Instructions, 3.3.2](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html): instrucciones y etiquetas suficientes para completar formularios.
- [WCAG 2.2: Consistent Identification, 3.2.4](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html): identificar de forma consistente los componentes con la misma función.
