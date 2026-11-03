/**
 * Integraciones de ejemplo. Las credenciales son ficticias y están
 * truncadas a propósito: la demo nunca expone secretos reales.
 */
export const API_CREDENTIALS = [
  { id: 'key_test', label: 'Clave de prueba', environment: 'sandbox', prefix: 'yol1_test_', masked: '••••••••••••4f2a', createdAt: '2026-11-01', lastUsed: 'Hace 3 horas' },
  { id: 'key_live', label: 'Clave productiva', environment: 'production', prefix: 'yol1_live_', masked: '••••••••••••0000', createdAt: null, lastUsed: null, requiresActivation: true },
]

export const WEBHOOKS = [
  { id: 'wh_1', event: 'account.credited', url: 'https://api.empresa.cl/hooks/yol1', status: 'active', lastDelivery: 'Hace 12 min', successRate: '99,8%' },
  { id: 'wh_2', event: 'payout.status_changed', url: 'https://api.empresa.cl/hooks/yol1', status: 'inactive', lastDelivery: null, successRate: null },
  { id: 'wh_3', event: 'kyb.status_changed', url: 'https://api.empresa.cl/hooks/compliance', status: 'active', lastDelivery: 'Ayer', successRate: '100%' },
]

export const WEBHOOK_STATUS_META = {
  active: { label: 'Activo', tone: 'success' },
  inactive: { label: 'Inactivo', tone: 'neutral' },
  failing: { label: 'Con fallas', tone: 'danger' },
}

export const INTEGRATION_RESOURCES = [
  { id: 'docs', title: 'Documentación de API', description: 'Referencia de endpoints de cuentas, cuentas virtuales y movimientos.', state: 'Disponible' },
  { id: 'sandbox', title: 'Ambiente sandbox', description: 'Entorno de pruebas con datos ficticios y credenciales separadas.', state: 'Disponible' },
  { id: 'mcp', title: 'Servidor MCP', description: 'Acceso de agentes a saldos y movimientos mediante Model Context Protocol.', state: 'Experimental' },
  { id: 'erp', title: 'Conectores ERP', description: 'Sincronización de movimientos hacia sistemas contables.', state: 'En evaluación' },
]
