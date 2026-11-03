/** Roles ilustrativos de la demo. Son configurables desde Config Org. */
export const ROLES = [
  {
    value: 'org_admin',
    label: 'Organization Admin',
    description: 'Administra la organización completa: usuarios, cuentas, productos y políticas de aprobación.',
  },
  {
    value: 'operator',
    label: 'Operator',
    description: 'Inicia operaciones y crea cuentas virtuales. No puede aprobar sus propios movimientos.',
  },
  {
    value: 'approver',
    label: 'Approver',
    description: 'Aprueba operaciones iniciadas por otras personas, dentro de los límites definidos.',
  },
  {
    value: 'viewer',
    label: 'Viewer',
    description: 'Solo consulta: saldos, movimientos y reportes, sin capacidad de operar.',
  },
]

export const roleLabel = value => ROLES.find(r => r.value === value)?.label ?? value
export const roleById = value => ROLES.find(r => r.value === value)

export const MEMBER_STATUS_META = {
  active: { label: 'Activo', tone: 'success' },
  invited: { label: 'Invitado', tone: 'info' },
  disabled: { label: 'Deshabilitado', tone: 'neutral' },
}
