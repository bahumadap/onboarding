import { PRODUCT_STATUS } from '../state/statuses'

/**
 * Catálogo de productos financieros.
 *
 * `core: true` son los que llegan con la cuenta vista habilitada —
 * consecuencia del onboarding aprobado, no una solicitud aparte.
 * El resto exige su propio proceso de solicitud y evaluación.
 */
export const PRODUCT_CATALOG = [
  {
    id: 'core_account',
    name: 'Cuenta vista empresarial',
    summary: 'Recibe y envía fondos en moneda local.',
    core: true,
    initialStatus: PRODUCT_STATUS.NOT_AVAILABLE,
    capabilities: ['Saldo disponible y reservado', 'Cartola de movimientos', 'Abonos y egresos'],
  },
  {
    id: 'virtual_accounts',
    name: 'Cuentas virtuales',
    summary: 'Separa saldos y movimientos por cliente, proyecto o cobro.',
    core: true,
    initialStatus: PRODUCT_STATUS.NOT_AVAILABLE,
    capabilities: ['Creación y cierre de cuentas', 'Asignación de saldos', 'Conciliación por cuenta'],
  },
  {
    id: 'fx',
    name: 'FX · Cambio de divisas',
    summary: 'Cambia monedas con tipo de cambio referencial y liquidación en tus cuentas.',
    initialStatus: PRODUCT_STATUS.AVAILABLE_TO_REQUEST,
    requirements: ['Evaluación de perfil cambiario', 'Declaración de monedas a operar', 'Firma de anexo FX'],
    capabilities: ['Cotización por par de monedas', 'Órdenes de cambio', 'Liquidación multimoneda'],
    reviewDays: '3 a 5 días hábiles',
  },
  {
    id: 'payouts',
    name: 'Payouts · Dispersión de fondos',
    summary: 'Envía pagos masivos por archivo o API.',
    initialStatus: PRODUCT_STATUS.AVAILABLE_TO_REQUEST,
    requirements: ['Perfil transaccional declarado', 'Reglas de aprobación configuradas', 'Validación de beneficiarios'],
    capabilities: ['Carga masiva', 'Doble aprobación', 'Estado por beneficiario'],
    reviewDays: '5 a 8 días hábiles',
  },
  {
    id: 'payment_initiation',
    name: 'Iniciación de pagos',
    summary: 'Recibe pagos desde la cuenta del pagador, sin tarjeta.',
    initialStatus: PRODUCT_STATUS.AVAILABLE_TO_REQUEST,
    requirements: ['Integración técnica', 'Revisión del flujo de cobro', 'Habilitación por jurisdicción'],
    capabilities: ['Links de cobro', 'Conciliación automática', 'Webhooks de pago'],
    reviewDays: '5 a 10 días hábiles',
  },
  {
    id: 'cards',
    name: 'Tarjetas empresariales',
    summary: 'Tarjetas por equipo o proyecto, con límites y rendición de gastos.',
    initialStatus: PRODUCT_STATUS.NOT_AVAILABLE,
    requirements: ['Sujeto a disponibilidad por jurisdicción', 'Evaluación comercial'],
    capabilities: ['Límites por tarjeta', 'Rendición de gastos', 'Bloqueo inmediato'],
    unavailableReason: 'Todavía no disponible para empresas constituidas en Chile.',
  },
]

export const productById = id => PRODUCT_CATALOG.find(p => p.id === id)
export const CORE_PRODUCTS = PRODUCT_CATALOG.filter(p => p.core)
export const ADDITIONAL_PRODUCTS = PRODUCT_CATALOG.filter(p => !p.core)
