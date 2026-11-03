/**
 * Equipo de ejemplo. El primer registro se sobrescribe con el usuario
 * real creado en el signup (es el administrador inicial).
 */
export const TEAM_MEMBERS = [
  { id: 'usr_1', name: 'Administrador inicial', email: 'admin@empresa.cl', role: 'org_admin', status: 'active', lastActive: 'Hace unos minutos' },
  { id: 'usr_2', name: 'Camila Rojas', email: 'camila.rojas@empresa.cl', role: 'operator', status: 'active', lastActive: 'Hace 2 horas' },
  { id: 'usr_3', name: 'Diego Morales', email: 'diego.morales@empresa.cl', role: 'approver', status: 'active', lastActive: 'Ayer' },
  { id: 'usr_4', name: 'Sofía Castillo', email: 'sofia.castillo@empresa.cl', role: 'viewer', status: 'invited', lastActive: 'Sin ingresos' },
]
