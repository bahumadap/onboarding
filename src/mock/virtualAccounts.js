/** Cuentas virtuales de ejemplo, disponibles cuando la cuenta vista queda activa. */
export const VIRTUAL_ACCOUNTS = [
  { id: 'CV-10021', alias: 'Juan Pérez', holder: 'Juan Pérez', currency: 'CLP', purpose: 'Usuario final', balance: 185400, status: 'active', movements: 42, createdAt: '2026-08-14T12:00:00Z' },
  { id: 'CV-10022', alias: 'Camila Rojas', holder: 'Camila Rojas', currency: 'CLP', purpose: 'Usuario final', balance: 92100, status: 'active', movements: 28, createdAt: '2026-08-21T12:00:00Z' },
  { id: 'CV-10023', alias: 'Proyecto Norte', holder: 'Operación interna', currency: 'CLP', purpose: 'Proyecto', balance: 1240500, status: 'active', movements: 96, createdAt: '2026-09-02T12:00:00Z' },
  { id: 'CV-10024', alias: 'Sofía Castillo', holder: 'Sofía Castillo', currency: 'CLP', purpose: 'Usuario final', balance: 56700, status: 'active', movements: 17, createdAt: '2026-09-18T12:00:00Z' },
  { id: 'CV-10025', alias: 'Recaudación web', holder: 'Operación interna', currency: 'CLP', purpose: 'Flujo de cobro', balance: 3480200, status: 'active', movements: 318, createdAt: '2026-10-01T12:00:00Z' },
  { id: 'CV-10026', alias: 'Diego Morales', holder: 'Diego Morales', currency: 'CLP', purpose: 'Usuario final', balance: 0, status: 'suspended', movements: 4, createdAt: '2026-10-22T12:00:00Z' },
]

export const VA_STATUS_META = {
  active: { label: 'Activa', tone: 'success' },
  suspended: { label: 'Suspendida', tone: 'warning' },
  closed: { label: 'Cerrada', tone: 'neutral' },
}

export const VA_PURPOSES = [
  { value: 'Usuario final', label: 'Usuario final' },
  { value: 'Proyecto', label: 'Proyecto' },
  { value: 'Flujo de cobro', label: 'Flujo de cobro' },
  { value: 'Proveedor', label: 'Proveedor' },
]
