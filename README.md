# Onboarding Yol1

Sitio estático de una sola página (`index.html`), sin build ni dependencias.
Los estilos replican los componentes de shadcn/ui usando los design tokens de
`yol1-tokens.json` como variables CSS (`--ray-*`), con modo claro y oscuro.

## Deploy en Vercel

Opción 1 — arrastrar la carpeta a [vercel.com/new](https://vercel.com/new).

Opción 2 — desde la terminal, en esta carpeta:

```bash
npx vercel --prod
```

No hay framework que detectar: Vercel lo sirve como sitio estático y `index.html`
queda en la raíz del dominio.

## Qué personalizar antes de publicar

- **Contactos** (sección *A quién preguntarle*): correos reales del equipo.
- **Herramientas**: reemplazar por el stack real y enlazar cada tarjeta.
- **FAQ**: horarios, política de vacaciones y fechas de pago concretas.
- **Checklist**: los 9 ítems son la base; agregar o quitar según el rol.
  Cada ítem necesita un `data-key` único (`ck-10`, `ck-11`, …) para guardar su estado.
- **Logo**: hoy es un cuadrado con "y1" en el header y en el favicon (SVG inline).

## Detalles técnicos

- Tipografía: Geist desde Google Fonts, con `Söhne Breit` como primera opción
  para títulos (si la empresa la tiene licenciada y la sirve, se usa esa).
- El progreso del checklist y la preferencia de tema se guardan en
  `localStorage`, por navegador y por persona. Toda lectura/escritura va dentro
  de `try/catch`, así que funciona igual en modo incógnito.
- Accesibilidad: tabs navegables con flechas, `aria-selected`/`aria-controls`,
  barra de progreso con `role="progressbar"`, foco visible y respeto a
  `prefers-reduced-motion`.
