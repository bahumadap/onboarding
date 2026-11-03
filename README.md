# YOL1 Enterprise — demo navegable

Prototipo interactivo de la plataforma financiera B2B de YOL1: registro,
onboarding empresarial, activación de la cuenta vista, Merchant Desk y
Config Org. Construido sobre el nuevo Design System de YOL1.

Toda la información es de ejemplo. La demo no se conecta a servicios
bancarios, ni a Chaindots, ni a motores AML/KYB, ni a proveedores de OTP,
FX o pagos. Ninguna pantalla representa una aprobación regulatoria real.

## Ejecutar

```bash
npm install
npm run dev
```

Build de producción:

```bash
npm run build && npm run preview
```

Se despliega en Vercel como sitio estático (Vite). `vercel.json` ya trae el
rewrite de SPA hacia `index.html`.

## Los cinco macroprocesos

| Macroproceso | Rutas | Qué resuelve |
| --- | --- | --- |
| A · Signup | `/signup` | Crea usuario y organización con registro progresivo (7 pasos) |
| B · Onboarding | `/onboarding`, `/onboarding/identity`, `/onboarding/business` | Validación de identidad (KYC) y de empresa (KYB) |
| C · Core Activation | `/activation` | Aprovisionamiento y habilitación de la cuenta vista |
| D · Merchant Desk | `/desk`, `/desk/accounts/:id`, `/desk/virtual-accounts`, `/desk/transactions`, `/desk/products` | Operar los productos habilitados |
| E · Config Org | `/org` y sus nueve secciones | Administrar la organización |

`/legacy/*` conserva el prototipo anterior completo como referencia. Las
rutas desconocidas muestran un 404 propio.

## Arquitectura de estados

El corazón de la demo es `src/state/statuses.js`: **cuatro dimensiones
independientes**, nunca un booleano de "onboarding completo".

| Dimensión | Estados |
| --- | --- |
| `userStatus` | created · email_verified · active · disabled |
| `kybStatus` | draft · pending · in_review · observed · approved · rejected |
| `accountStatus` | not_provisioned · provisioning · active · restricted · failed |
| `productStatus` (por producto) | not_available · available_to_request · requested · in_review · pending_configuration · active · rejected · disabled |

Son independientes a propósito: una organización puede tener KYB aprobado y
cuenta vista activa mientras FX sigue en evaluación.

Las reglas de negocio viven en selectores, no repartidas por las pantallas:

- `canProvisionAccount` — la cuenta vista se aprovisiona solo con identidad
  **y** KYB aprobados. Es la única puerta entre el macroproceso B y el C.
- `canAccessDesk` — el Merchant Desk se abre solo con la cuenta operable
  (`active` o `restricted`). Mientras está en aprovisionamiento, la interfaz
  no finge que hay una cuenta activa.
- `isProductOperable` — una acción de FX, payouts o iniciación de pagos solo
  está operativa si ese producto está activo.
- `resolveStage` — decide a qué etapa entra alguien desde `/`.

Los guards de ruta en `src/App.jsx` derivan de esos selectores.

### Regla principal de productos

La cuenta vista **es consecuencia del onboarding aprobado**, no una solicitud
aparte: al aprobarse el KYB arranca el aprovisionamiento automáticamente.
Con la cuenta habilitada vienen cuenta vista + cuentas virtuales.

Los demás productos (FX, payouts, iniciación de pagos, tarjetas) **no** se
activan solos: cada uno tiene su solicitud, evaluación y activación.

## Estructura

```
src/
  styles/       tokens.css (el Design System) + base.css
  ui/           kit de primitivas accesibles (Button, Dialog, Table, OtpInput…)
  state/        statuses.js (máquina de estados) + DemoState.jsx (reducer)
  mock/         datos de ejemplo, separados de la presentación
  shell/        AppShell (consola), FlowLayout (flujos), marca, 404, control de demo
  features/     un módulo por macroproceso
  legacy/       prototipo anterior, intacto
```

- **Ningún color literal** fuera de `styles/tokens.css`: los componentes solo
  usan `var(--ray-*)`. Cambiar el Design System es regenerar ese archivo.
- **Los mocks no conocen la UI y la UI no conoce los mocks**: las pantallas
  leen del estado y despachan acciones. Para conectar servicios reales se
  reemplaza `DemoState.jsx` sin tocar las features.

## Control de demo

El botón flotante abre un panel que mueve las cuatro dimensiones de estado
sin backend: provisioning, observaciones de KYB, rechazos, productos en
evaluación. Incluye un escenario rápido que deja la organización operando.
El estado se guarda en `localStorage` con versión de esquema; recargar no
pierde el avance y "Reiniciar demo" vuelve a cero.

## Qué se reutilizó del prototipo anterior

- La geometría del isotipo (`src/shell/Brand.jsx`), ahora pintada con tokens
  en vez de los hex del brandbook antiguo, y el texto compuesto con la
  tipografía del Design System en vez de `<text>` dentro del SVG.
- El stack técnico: Vite, React 18, react-router-dom, lucide-react, recharts.
  No se agregaron dependencias.
- Los datos de ejemplo (nombres, montos, identificadores de cuentas
  virtuales), reescritos como módulos en `src/mock/`.
- El `vercel.json` y la configuración de build.

Lo que **no** se reutilizó: los colores, tipografías, espaciados, bordes,
botones, formularios y patrones de interfaz del prototipo. El Design System
nuevo manda en todo conflicto con el brandbook anterior.

## Supuestos del prototipo

Estos puntos se resolvieron para poder construir la demo y **no** son
definiciones de producto:

- **Chaindots**: no hay documentación de su API, así que la validación de
  identidad es un componente mock con los estados de la integración
  (inicio, en curso, completada, pendiente, observada, fallida) y un
  comentario que marca dónde entra la integración real.
- **Requisitos de KYB**: los campos de cada sección son demostrativos. Los
  requisitos reales dependen de la jurisdicción, del proveedor y de
  Compliance.
- **Monedas por país**: las cuentas USD y PEN son datos de ejemplo. La
  disponibilidad real por jurisdicción no está definida.
- **Roles**: Organization Admin, Operator, Approver y Viewer son
  ilustrativos y configurables.
- **Plazos de evaluación** de los productos adicionales son referenciales.
- **Contraseñas**: el paso de credenciales valida requisitos pero no guarda
  ni persiste nada.
- **OTP**: código fijo `123456` para recorrer el camino feliz; cualquier otro
  número ejercita los errores (código incorrecto, expirado, intentos
  agotados).

## Decisiones técnicas

- **JSX, no TypeScript**: el repositorio original es JavaScript y agregar la
  cadena de tipos habría significado tocar toda la configuración de build sin
  beneficio para un prototipo. Los estados críticos están centralizados en
  enums y selectores, que es donde los tipos habrían aportado.
- **CSS propio con tokens, sin framework**: el Design System llega como
  variables CSS; un framework de utilidades habría agregado una capa de
  traducción innecesaria.
- **Un kit de UI propio** en vez de una librería de componentes: los tokens de
  YOL1 definen botones pill, radios y estados muy específicos, y el kit los
  implementa directo. El `Dialog` trae `role`, `aria-modal`, foco atrapado,
  cierre con Escape y bloqueo de scroll.
