# Arquitectura de navegación de YOL1 Enterprise

## Criterio

Separar destinos por tarea: consultar y operar fondos, usar productos, administrar la organización. El resumen muestra información y enlaces a los destinos especializados; no vuelve a implementar sus herramientas. Un mismo objeto puede tener una vista operativa y ajustes, con responsabilidades explícitas.

## Operación

- **Merchant Desk `/desk`:** cuentas habilitadas, actividad, últimos movimientos y tarjetas de productos. La evolución histórica se consulta bajo demanda. Las cuentas virtuales se gestionan en su propio destino.
- **Cuentas `/desk/accounts`:** saldos y entrada al detalle bancario de cada cuenta habilitada. Los productos todavía no activos se descubren desde el catálogo, sin presentar sus saldos como disponibles.
- **Movimientos `/desk/transactions`:** historial y filtros.
- **Tus productos:** cuentas virtuales, seguidas de los productos adicionales cuyo estado sea `active`. Orden estable del catálogo: FX, Payouts, Iniciación de pagos y Tarjetas. Solicitar o tener una evaluación pendiente no añade un acceso operativo. Suspender un producto retira su acceso, pero conserva su estado consultable en el catálogo.
- **Explorar productos `/desk/products`:** catálogo completo, requisitos y solicitudes.
- **Detalle `/desk/products/:productId`:** estado y acciones del producto, con las mismas reglas del catálogo. FX enlaza a las cuentas. Los productos sin operaciones implementadas explicitan ese alcance de la demo, sin simular funciones inexistentes.

## Configuración

La tuerca **Configuración** al pie de la barra abre `/org`. Su portada agrupa las tareas administrativas y su navegación reemplaza a la operativa mientras se está en este espacio. Siempre hay una salida al Desk (o al onboarding si la cuenta aún no está habilitada).

- Puesta en marcha `/org/setup`: checklist existente.
- Empresa y entidades: información jurídica y corporativa.
- Usuarios y roles: miembros, invitaciones y accesos.
- Ajustes de cuentas: alias, entidades y roles autorizados; no muestra una segunda operación de cuentas.
- Reglas de aprobación: políticas de autorización.
- API e integraciones: acceso técnico.
- Configuración de productos: permisos, límites y habilitación de productos aprobados.
- Documentación y cumplimiento: expediente y revisiones.
- Preferencias: ajustes de experiencia y notificaciones.

Los enlaces `/org/*` existentes siguen funcionando. `/org` pasa a ser la portada y el checklist se encuentra en `/org/setup`. Onboarding permanece accesible desde el pie de la barra y Demo Control.

## Verificación

`npm run build`, `tests/navigation_review.py` y `tests/enterprise_smoke.py`. La prueba de navegación revisa separación de espacios, estados pendientes/activos/suspendidos, orden de productos, enlaces directos, retorno al onboarding y móvil. No cambian el reducer, la persistencia ni las reglas de negocio. Se conservan los componentes y tokens del Design System.
