import { Building2, CreditCard, FileCheck2, KeyRound, LayoutGrid, Settings2, ShieldCheck, Users, Wallet } from 'lucide-react'

// One destination per administrative task; used by the hub and its local navigation.
export const ORG_ITEMS = [
  { to: '/org/setup', label: 'Puesta en marcha', icon: LayoutGrid, description: 'Revisa las tareas pendientes de configuración.' },
  { to: '/org/profile', label: 'Empresa y entidades', icon: Building2, description: 'Datos legales, países y entidades del grupo.' },
  { to: '/org/users', label: 'Usuarios y roles', icon: Users, description: 'Invita al equipo y administra sus accesos.' },
  { to: '/org/accounts', label: 'Ajustes de cuentas', icon: Wallet, description: 'Alias, entidades y roles con acceso a cada cuenta.' },
  { to: '/org/approvals', label: 'Reglas de aprobación', icon: ShieldCheck, description: 'Montos y aprobaciones requeridas para operar.' },
  { to: '/org/api', label: 'API e integraciones', icon: KeyRound, description: 'Claves de acceso e integraciones de tu empresa.' },
  { to: '/org/products', label: 'Configuración de productos', icon: CreditCard, description: 'Completa los requisitos y administra la habilitación.' },
  { to: '/org/compliance', label: 'Documentación y cumplimiento', icon: FileCheck2, description: 'Documentos, vigencias y revisiones de la empresa.' },
  { to: '/org/preferences', label: 'Preferencias', icon: Settings2, description: 'Notificaciones, idioma y preferencias regionales.' },
]
