/**
 * Cuentas empresariales de ejemplo.
 *
 * La disponibilidad real de monedas depende del país y del proveedor:
 * acá son datos de ejemplo, marcados como tales en la interfaz.
 */
export const ACCOUNTS = [
  {
    id: 'acc_clp',
    label: 'Cuenta vista CLP',
    currency: 'CLP',
    country: 'CL',
    number: '**** 4821',
    kind: 'primary',
    balanceTotal: 845320000,
    balanceAvailable: 798120000,
    balanceReserved: 47200000,
    requiresProduct: null,
  },
  {
    id: 'acc_usd',
    label: 'Cuenta USD',
    currency: 'USD',
    country: 'US',
    number: '**** 9074',
    kind: 'fx',
    balanceTotal: 128450,
    balanceAvailable: 128450,
    balanceReserved: 0,
    requiresProduct: 'fx',
  },

]

export const CURRENCY_FORMAT = {
  CLP: { locale: 'es-CL', currency: 'CLP', fractionDigits: 0 },
  USD: { locale: 'en-US', currency: 'USD', fractionDigits: 2 },
  EUR: { locale: 'es-ES', currency: 'EUR', fractionDigits: 2 },
}

/** Formatea un monto según la moneda. Sin símbolo duplicado ni redondeos raros. */
export function formatMoney(amount, currency = 'CLP') {
  const cfg = CURRENCY_FORMAT[currency] ?? CURRENCY_FORMAT.CLP
  return new Intl.NumberFormat(cfg.locale, {
    style: 'currency',
    currency: cfg.currency,
    minimumFractionDigits: cfg.fractionDigits,
    maximumFractionDigits: cfg.fractionDigits,
  }).format(amount)
}

/** Versión compacta para KPIs: 845,3M. */
export function formatCompact(amount, currency = 'CLP') {
  const abs = Math.abs(amount)
  if (abs >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1).replace('.', ',')}MM`
  if (abs >= 1_000_000) return `${(amount / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (abs >= 1_000) return `${Math.round(amount / 1_000)}K`
  return formatMoney(amount, currency)
}

export const MONTHLY_FLOW = [
  { month: 'Jun', inflow: 590, outflow: 370 },
  { month: 'Jul', inflow: 650, outflow: 430 },
  { month: 'Ago', inflow: 720, outflow: 510 },
  { month: 'Sep', inflow: 680, outflow: 470 },
  { month: 'Oct', inflow: 810, outflow: 590 },
  { month: 'Nov', inflow: 890, outflow: 640 },
]
