# Onboarding completo en un solo diagrama

Abrir **onboarding-completo.html** para recorrer todos los procesos en un único lienzo. Los botones de bloques acercan la vista, sin cambiar de diagrama. Funciona sin conexión.

Importar **onboarding-completo-figma.svg** en Figma Design para editar sus formas y textos. Es un vector, no una captura. El archivo completo es ancho: acercar la vista a cada bloque para leer.

**onboarding-completo.bpmn** contiene un proceso descriptivo no ejecutable y un diagrama BPMN 2.0. Integra registro, OTP, identidad, KYB, entidades relacionadas, apertura, acceso, Demo Control, Merchant Desk, configuración y productos. Las conexiones reflejan el recorrido; los controles de demo siguen identificados como simulaciones. Configuración está disponible desde el registro, mientras Merchant Desk requiere una cuenta activa o restringida.

**onboarding-completo.pdf** contiene el mapa completo en una lámina vectorial amplia.

La fuente y las limitaciones de la demo están documentadas en LEEME.md. Las exportaciones por proceso anteriores siguen disponibles. Generador: `python3 scripts/build_unified_bpmn.py` (requiere Chromium y Playwright). Visor bpmn-js con su atribución visible y licencia en vendor/LICENSE.bpmn-js.
