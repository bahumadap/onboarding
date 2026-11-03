/** Movimientos de ejemplo de la cuenta vista y sus cuentas virtuales. */
export const TRANSACTIONS = [
  { id: 'OP-948201', date: '2026-11-03T13:42:00Z', account: 'acc_clp', virtualAccount: 'CV-10021', counterparty: 'Juan Pérez', kind: 'inflow', concept: 'Abono recibido', amount: 185400, currency: 'CLP', status: 'completed', document: 'Factura vinculada' },
  { id: 'OP-948199', date: '2026-11-03T13:38:00Z', account: 'acc_clp', virtualAccount: 'CV-10021', counterparty: 'Juan Pérez', kind: 'outflow', concept: 'Retiro solicitado', amount: -185400, currency: 'CLP', status: 'pending', document: null },
  { id: 'OP-948183', date: '2026-11-03T13:21:00Z', account: 'acc_clp', virtualAccount: 'CV-10024', counterparty: 'Sofía Castillo', kind: 'outflow', concept: 'Retiro ejecutado', amount: -56700, currency: 'CLP', status: 'completed', document: 'Factura vinculada' },
  { id: 'OP-948174', date: '2026-11-03T12:58:00Z', account: 'acc_clp', virtualAccount: 'CV-10022', counterparty: 'Camila Rojas', kind: 'inflow', concept: 'Transferencia interna', amount: 92100, currency: 'CLP', status: 'completed', document: null },
  { id: 'OP-948160', date: '2026-11-03T12:30:00Z', account: 'acc_clp', virtualAccount: 'CV-10025', counterparty: 'Recaudación web', kind: 'inflow', concept: 'Recaudación del día', amount: 3480200, currency: 'CLP', status: 'completed', document: 'Reporte de cierre' },
  { id: 'OP-948142', date: '2026-11-03T11:44:00Z', account: 'acc_clp', virtualAccount: 'CV-10023', counterparty: 'Proveedor Logístico SpA', kind: 'outflow', concept: 'Pago a proveedor', amount: -642000, currency: 'CLP', status: 'completed', document: 'Factura 4821' },
  { id: 'OP-948118', date: '2026-11-03T10:12:00Z', account: 'acc_clp', virtualAccount: null, counterparty: 'Tesorería', kind: 'inflow', concept: 'Fondeo de cuenta madre', amount: 25000000, currency: 'CLP', status: 'completed', document: null },
  { id: 'OP-948090', date: '2026-11-02T18:05:00Z', account: 'acc_clp', virtualAccount: 'CV-10026', counterparty: 'Diego Morales', kind: 'outflow', concept: 'Retiro rechazado', amount: -120000, currency: 'CLP', status: 'rejected', document: null },
  { id: 'OP-948061', date: '2026-11-02T16:28:00Z', account: 'acc_clp', virtualAccount: 'CV-10022', counterparty: 'Camila Rojas', kind: 'outflow', concept: 'Retiro ejecutado', amount: -45000, currency: 'CLP', status: 'completed', document: 'Factura vinculada' },
  { id: 'OP-948033', date: '2026-11-02T09:15:00Z', account: 'acc_clp', virtualAccount: 'CV-10025', counterparty: 'Recaudación web', kind: 'inflow', concept: 'Recaudación del día', amount: 2910400, currency: 'CLP', status: 'completed', document: 'Reporte de cierre' },
]

export const TX_STATUS_META = {
  completed: { label: 'Completado', tone: 'success' },
  pending: { label: 'Pendiente', tone: 'warning' },
  rejected: { label: 'Rechazado', tone: 'danger' },
}
