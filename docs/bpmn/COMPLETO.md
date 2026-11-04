# YOL1 Enterprise — Flujo objetivo con Chaindots

Este documento define la experiencia objetivo acordada: no es el mapa de controles del prototipo ni acredita una integración implementada.

## Responsabilidades

| Participante | Responsabilidad en el modelo |
| --- | --- |
| Cliente | Registrarse y completar la verificación de persona y empresa dentro del embebido de Chaindots. |
| Chaindots | Solicitar y recibir información/documentos, gestionar su proceso de KYC/KYB y comunicar sus resultados. |
| YOL1 | Preparar la sesión del embebido, vincularla con la organización, recibir y mostrar estados y habilitar el paso siguiente. No hace una revisión documental propia en este flujo. |
| Proveedor de cuenta | Procesar la apertura y comunicar estado y capacidades de la cuenta. |

El modelo agrupa KYC y KYB en un **subproceso colapsado gestionado por Chaindots**. No presupone pantallas, orden interno, paralelismo, documentos específicos ni endpoints del proveedor. Esta separación de tareas de interfaz no define por sí sola las responsabilidades legales o contractuales de las partes.

## Recorrido completo

1. **Sign up:** correo, verificación, datos de persona y empresa (Chile), credencial y términos; creación del usuario, organización y expediente. Errores de código, datos y aceptación tienen retorno.
2. **Chaindots embebido:** preparar sesión segura, completar KYC/KYB y recibir estado. Incluye pendientes, revisión, información adicional, rechazo y error técnico. La información adicional se completa en el propio embebido.
3. **Apertura:** solo después de aprobar todas las verificaciones requeridas. Incluye espera, error y reintento seguro, cuenta activa y cuenta restringida con capacidades aplicadas en backend.
4. **Merchant Desk:** acceso según las capacidades confirmadas, saldos, movimientos y cuentas virtuales.
5. **Productos adicionales:** ciclo opcional e independiente. Solicitud, evaluación, información adicional, condiciones/configuración y confirmación de habilitación. El evaluador depende del producto; no se atribuye automáticamente a Chaindots.
6. **Configuración:** disponible desde el registro, en una rama paralela. Ajustar empresa, equipo, permisos e integraciones no sustituye la verificación ni habilita por sí solo la cuenta.

Se retiraron el panel de demo, la selección manual de estados y las tareas de revisión documental interna del mapa completo. No se incluyó un segundo circuito propio de due diligence.

## Pendiente de definir con los proveedores

- Modalidad y alcance contratado del embebido, requisitos y cobertura de persona/entidad.
- Creación, duración, recuperación y seguridad de sesiones.
- Notificaciones y/o consulta de estado disponibles; autenticidad, correlación, idempotencia y recuperación de eventos.
- Equivalencias entre estados del proveedor y los estados de YOL1, incluida la condición de aprobación completa.
- Motivos comunicables al cliente, soporte, reapertura y tratamiento de rechazos.
- Requisitos y condiciones del proveedor de cuenta y de cada producto adicional.

Estas son decisiones de integración por confirmar; el modelo no inventa métodos, eventos ni endpoints de Chaindots. Las tareas técnicas son un contrato conceptual propuesto.

## Archivos

- `onboarding-completo.html`: diagrama único, zoom por bloque, detalles por actividad, descarga de SVG/BPMN. Funciona sin conexión.
- `onboarding-completo-figma.svg`: formas y texto vectoriales para importar en Figma Design. Fondos grises y bloques de izquierda a derecha; no convierte conectores en conectores inteligentes de FigJam.
- `onboarding-completo.bpmn`: BPMN 2.0 descriptivo, no ejecutable; un proceso con un subproceso colapsado de Chaindots.
- `onboarding-completo.pdf`: una lámina vectorial amplia, legible con zoom.
- `onboarding-completo.zip`: paquete de esta versión objetivo, sin los diagramas históricos de demo.

Los archivos separados anteriores documentan el prototipo y se conservan como referencia histórica; este flujo objetivo los sustituye como guía de la experiencia final. El código de la aplicación no fue cambiado por esta documentación.

Generar esta versión con `python3 scripts/build_ideal_bpmn.py` (Python, Playwright y Chromium). El script reutiliza el visor de `build_unified_bpmn.py`; ese generador anterior produce el mapa histórico de la demo y no debe usarse para regenerar el objetivo. Licencia del visor en `vendor/LICENSE.bpmn-js`.
