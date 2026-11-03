/** Roles ilustrativos de la demo. Son configurables desde Config Org. */
export const ROLES = [
  {
    value: 'org_admin',
    label: 'Administrador',
    description: 'Administra usuarios, cuentas, productos y aprobaciones.',
  },
  {
    value: 'operator',
    label: 'Operador',
    description: 'Inicia operaciones y crea cuentas virtuales. No aprueba sus propias operaciones.',
  },
  {
    value: 'approver',
    label: 'Aprobador',
    description: 'Aprueba operaciones de otras personas dentro de los límites asignados.',
  },
  {
    value: 'viewer',
    label: 'Consulta',
    description: 'Consulta saldos, movimientos y reportes. No puede operar.',
  },
]

export const roleLabel = value => ROLES.find(r => r.value === value)?.label ?? value
export const roleById = value => ROLES.find(r => r.value === value)

export const MEMBER_STATUS_META = {
  active: { label: 'Activo', tone: 'success' },
  invited: { label: 'Invitado', tone: 'info' },
  disabled: { label: 'Deshabilitado', tone: 'neutral' },
}
