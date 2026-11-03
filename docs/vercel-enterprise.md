# Publicar YOL1 Enterprise como demo independiente en Vercel

## Estado preparado

- Repositorio: `bahumadap/onboarding`.
- Rama exclusiva: `yol1-enterprise`. No hacer merge a `main`.
- Proyecto NUEVO sugerido: `yol1-enterprise-demo` (si está disponible).
- No reutilizar el proyecto, dominio, Project ID ni configuración de YOL1 SMB.
- React 18 + Vite; directorio raíz `./`; Node.js 24.x.
- Instalación `npm ci`; build `npm run build`; salida `dist`.
- No requiere variables de entorno, claves, backend ni cuentas bancarias.
- `vercel.json` incluye el rewrite `/(.*)` → `/index.html` para React Router.
- `git.deploymentEnabled: false` mantiene desactivados los despliegues automáticos
  por Git. Guardar o subir la rama no autoriza un despliegue. Conservar esta opción
  hasta que el propietario decida habilitar automatizaciones.

**Esta preparación no crea un proyecto Vercel ni publica la aplicación.**

## Crear el proyecto nuevo, después de aprobar el despliegue

### Desde el panel de Vercel

1. Entrar en el equipo personal/empresarial correcto y elegir **Add New → Project**.
2. Importar `bahumadap/onboarding` y seleccionar la referencia **`yol1-enterprise`**.
   Si el asistente solo ofrece `main`, NO pulsar Deploy: usar el método CLI siguiente
   para crear primero un proyecto vacío y configurar la rama sin desplegar SMB.
3. Usar un nombre nuevo, por ejemplo `yol1-enterprise-demo`. Revisar raíz `./`,
   preset **Vite**, instalación `npm ci`, build `npm run build` y salida `dist`.
4. No importar variables de otros proyectos ni asignar dominios de SMB.
5. Antes de confirmar el primer deploy, comprobar que la fuente elegida es
   `yol1-enterprise` y el commit preparado. Si no puede verificarse, detenerse.
6. En **Settings → Git**, confirmar repositorio y **Production Branch =
   yol1-enterprise**. Según la versión del panel, esta opción puede estar en
   **Settings → Environments → Production → Branch Tracking**.

### Alternativa con CLI: crear y conectar sin desplegar

Usar un checkout actualizado con el commit preparado:

```sh
git switch yol1-enterprise
git pull --ff-only origin yol1-enterprise
npm ci
npm run build
npx vercel login
npx vercel link
```

En `vercel link`: seleccionar el equipo correcto, responder **No** a enlazar con
un proyecto existente y crear **yol1-enterprise-demo** con raíz `./`. Este comando
crea/enlaza el proyecto; no ejecuta un deployment. Si detecta un enlace previo,
comprobar `.vercel/project.json` y no continuar con un Project ID de SMB. La carpeta
`.vercel` es local e ignorada; no debe copiarse desde la demo anterior.

Luego, en el proyecto NUEVO del panel:

1. **Settings → Git → Connect Git Repository**: conectar `bahumadap/onboarding`.
2. Definir **Production Branch/Branch Tracking = yol1-enterprise**.
3. Confirmar Vite, Node.js 24.x, raíz `./`, comandos y salida indicados arriba.
4. Verificar que no se asignaron dominios existentes y que no hay variables reales.

Solo después de la aprobación del propietario, desde ese mismo checkout enlazado:

```sh
# URL de prueba (deployment Preview):
npx vercel

# Opcional: URL estable .vercel.app DEL PROYECTO NUEVO:
# npx vercel --prod
```

`--prod` significa el entorno Production de ese proyecto independiente, no SMB.
No ejecutarlo sin aprobación. No ejecutar `vercel deploy` desde `main` ni desde una
carpeta enlazada al proyecto antiguo. Los deployments manuales permiten revisar
esta demo manteniendo desactivados los despliegues automáticos por Git.

La URL exacta la entrega Vercel después del despliegue; todavía no existe una URL
pública verificada para esta versión. Revisar **Deployment Protection** del proyecto
nuevo: si se comparte con revisores externos, conceder acceso o ajustar la protección
solo en ese proyecto, según la política del equipo.

## Recorrido para revisión

1. Abrir `/signup`, registrar datos ficticios y usar OTP **123456**.
2. Completar perfil, empresa, países, contraseña de ejemplo y términos.
3. En `/onboarding`, iniciar la validación de identidad simulada.
4. En KYB, completar las cuatro secciones, enviar a revisión y usar
   **Simular aprobación**. No subir documentos reales.
5. Al aprobar identidad y KYB se inicia automáticamente el aprovisionamiento.
   La cuenta se habilita en unos 5,2 segundos; se puede recargar durante el proceso.
6. Recorrer `/desk` y las secciones de **Merchant Desk** y **Config Org** (`/org`).
7. Solicitar FX, payouts o iniciación de pagos desde Productos: no se activan solos.

### Demo Control

El botón flotante **Control de demo** está disponible en todos los módulos:

- **Aplicar y abrir el Desk** crea el escenario operativo sin recorrer el signup.
- Permite cambiar usuario, identidad, KYB, cuenta y cada producto por separado.
- Para estados en revisión, observado, rechazado o fallido, navegar al módulo
  correspondiente y revisar su mensaje y las acciones disponibles.
- No iniciado + identidad/KYB aprobados dispara el aprovisionamiento automáticamente;
  es una transición esperada, no un estado permanente.
- **Reiniciar demo** borra el avance local y regresa a `/signup`.

Los estados se guardan en `localStorage` de cada navegador y origen. No son
compartidos entre revisores ni entre URLs Preview. Ventana privada = sesión nueva.
No usar información personal, contraseñas reutilizadas ni credenciales reales.

## URLs directas y límites de validación

El rewrite entrega la SPA al cargar o recargar `/signup`, `/onboarding`, `/desk`,
`/org` y sus subrutas. Los guards siguen aplicándose: sin organización, las rutas
protegidas vuelven a `/signup`; sin cuenta operable, el Desk vuelve al onboarding
(o activación). Esto no es un 404 del servidor.

Antes de desplegar se probó el build local con `vite preview`, cargas directas,
recargas y el recorrido completo en Chromium. El comportamiento del CDN de Vercel
se debe comprobar después del primer deployment: abrir las cuatro URLs en pestañas
nuevas y recargarlas. No se afirma validación remota mientras no exista deployment.

## Credenciales e integraciones

Se revisaron fuentes, configuración y artefactos del build en busca de patrones de
claves privadas/tokens, archivos de entorno y llamadas de red. No se encontraron
credenciales operativas ni llamadas a servicios bancarios, Chaindots o proveedores OTP.
Los webhooks y claves del módulo API son texto ficticio; no se invocan.
Google Fonts es la dependencia externa visual; no es una integración financiera.
Las contraseñas del formulario no se guardan en localStorage.

`.env*`, claves privadas y `.vercel/` están ignorados por Git. Nunca configurar
secretos en variables `VITE_*`: se incorporarían al bundle público. Esta revisión
no equivale a una auditoría forense de todos los commits históricos.
