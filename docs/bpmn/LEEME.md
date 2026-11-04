# YOL1 Enterprise — Modelo de onboarding

Modelo del código de `yol1-enterprise`, revisión `25ffe5d`, preparado el 4 de noviembre de 2026. Documentación descriptiva de una demo: no es un proceso de producción ni un modelo BPMN ejecutable.

## Qué abrir

- **00-mapa-por-procesos-figma.svg:** vista general horizontal, organizada por procesos y colores. Archivo recomendado para Figma. Los círculos delimitan visualmente cada bloque; para la semántica BPMN formal, usar el archivo `.bpmn`.
- **mapa-figma.html:** la misma vista general con controles de zoom, sin conexión.
- **onboarding.html:** visor interactivo de ocho procesos BPMN con zoom, detalles de actividades, fuentes y descarga de SVG/BPMN. No requiere instalación ni conexión a un servidor. Mantener visible la atribución de bpmn.io.
- **yol1-enterprise.bpmn:** modelo BPMN 2.0 editable con ocho procesos y ocho diagramas DI. Abrir en un modelador compatible con múltiples procesos/diagramas; no contiene conectores de ejecución.
- **yol1-enterprise.pdf:** ocho láminas de detalle, A3 horizontal. Para revisar textos pequeños conviene usar el visor con zoom.
- **00-mapa-por-procesos.pdf:** vista general en una sola lámina ancha.
- **overview.svg, signup.svg, otp.svg, identity.svg, kyb.svg, activation.svg, access.svg, products.svg:** diagramas vectoriales de cada proceso.

## Llevarlo a Figma

1. Descargar y descomprimir el paquete.
2. Arrastrar `00-mapa-por-procesos-figma.svg` al lienzo de un archivo **Figma Design**.
3. Desagrupar si se necesita editar elementos por separado. El SVG usa formas, líneas y texto nativos; no es una captura rasterizada. El comportamiento de fuentes y grupos depende del importador de Figma.
4. Importar los SVG detallados en frames separados para trabajar sobre excepciones y decisiones.

La importación conserva la geometría visual, pero no convierte las flechas en conectores inteligentes de FigJam ni conserva semántica BPMN. El archivo `.bpmn` es el documento de intercambio para esa semántica. No se validó la importación en una cuenta de Figma desde este entorno.

## Lectura y decisiones importantes

- Registro crea usuario, organización, entidad principal y expediente.
- Identidad y empresa se pueden completar en cualquier orden. Ambas deben estar aprobadas para abrir la cuenta automáticamente.
- Configuración está disponible al existir la organización. Merchant Desk requiere cuenta activa o restringida; no basta con completar KYB.
- Los estados de revisión, los documentos y la apertura son simulados. No se envían correos, no se toman fotografías y no se suben documentos.
- Productos adicionales son un anexo independiente: solicitarlos no bloquea ni completa el onboarding.
- Las entidades relacionadas se agregan en borrador, sin expediente KYB propio implementado.
- Un evento de término puede significar fin de un intento bloqueado/rechazado, no aprobación. Los diagramas son descriptivos y las condiciones se expresan en etiquetas, no en código ejecutable.

## Brechas observadas en el código

- La participación societaria menciona 100%, pero se valida presencia de texto, no una suma numérica.
- La corrección de observaciones se marca manualmente; no hay validación documental automática.
- El rechazo KYB no incluye apelación implementada ni integración de soporte.
- `userStatus=disabled` no es por sí solo un guard de acceso a las rutas actuales.
- La cuenta restringida informa bloqueo de egresos, pero no existe motor real de egresos en la demo.
- Guardar permisos y límites de productos no produce automáticamente `active`; la demo permite cambiar estados manualmente.
- La aprobación global sincroniza el estado KYB de la entidad principal; no verifica individualmente todas las entidades del grupo.

## Reproducir

```sh
python3 scripts/build_bpmn.py
python3 scripts/build_figma_map.py
python3 scripts/export_bpmn.py
```

El exportador necesita Python, Playwright y Chromium (`/usr/bin/chromium`). El visor bpmn-js 18.6.3 se incluye con su licencia en `vendor/`. El HTML generado incorpora el visor para funcionar sin conexión. Los scripts no modifican la aplicación.
