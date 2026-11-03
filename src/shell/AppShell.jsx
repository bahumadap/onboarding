/* =============================================================
   Consola de YOL1 Enterprise.

   Un solo shell con dos espacios de responsabilidad distinta:
   Merchant Desk (operar) y Config Org (administrar). La navegación
   refleja esa separación y deshabilita lo que el estado de la cuenta
   todavía no permite operar.
   ============================================================= */
import React, { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeftRight, Building2, ChevronsUpDown, CreditCard, FileCheck2, Gauge,
  KeyRound, LayoutGrid, Menu, Settings2, ShieldCheck, Sparkles, Users, Wallet,
  X, Layers,
} from 'lucide-react'
import { Avatar, Badge, IconButton } from '../ui'
import { BrandLockup } from './Brand'
import { useDemoState } from '../state/DemoState'
import { ACCOUNT_STATUS_META, canAccessDesk } from '../state/statuses'
import { countryLabel } from '../mock/countries'
import { roleLabel } from '../mock/roles'
import './shell.css'

const DESK_ITEMS = [
  { to: '/desk', label: 'Resumen', icon: Gauge, end: true },
  { to: '/desk/virtual-accounts', label: 'Cuentas virtuales', icon: Layers },
  { to: '/desk/transactions', label: 'Movimientos', icon: ArrowLeftRight },
  { to: '/desk/products', label: 'Productos', icon: Sparkles },
]

const ORG_ITEMS = [
  { to: '/org', label: 'Puesta en marcha', icon: LayoutGrid, end: true },
  { to: '/org/profile', label: 'Perfil de organización', icon: Building2 },
  { to: '/org/users', label: 'Usuarios y roles', icon: Users },
  { to: '/org/accounts', label: 'Cuentas', icon: Wallet },
  { to: '/org/approvals', label: 'Permisos y aprobaciones', icon: ShieldCheck },
  { to: '/org/api', label: 'API e integraciones', icon: KeyRound },
  { to: '/org/products', label: 'Productos y servicios', icon: CreditCard },
  { to: '/org/compliance', label: 'Documentación y compliance', icon: FileCheck2 },
  { to: '/org/preferences', label: 'Preferencias', icon: Settings2 },
]

function NavItem({ item, disabled, onNavigate }) {
  const Icon = item.icon
  if (disabled) {
    return (
      <span className="sidebar__item sidebar__item--disabled" aria-disabled="true" title="Disponible cuando la cuenta vista esté habilitada">
        <span className="sidebar__item-icon"><Icon size={17} aria-hidden="true" /></span>
        {item.label}
      </span>
    )
  }
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) => `sidebar__item${isActive ? ' sidebar__item--active' : ''}`}
    >
      <span className="sidebar__item-icon"><Icon size={17} aria-hidden="true" /></span>
      {item.label}
    </NavLink>
  )
}

export default function AppShell() {
  const { state } = useDemoState()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Cierra el menú móvil al cambiar de ruta.
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const deskEnabled = canAccessDesk(state)
  const accountMeta = ACCOUNT_STATUS_META[state.accountStatus]
  const admin = state.team[0]

  const context = useMemo(() => {
    const all = [...DESK_ITEMS, ...ORG_ITEMS]
    const match = all
      .filter(i => (i.end ? location.pathname === i.to : location.pathname.startsWith(i.to)))
      .sort((a, b) => b.to.length - a.to.length)[0]
    const area = location.pathname.startsWith('/org') ? 'Config Org' : 'Merchant Desk'
    return { area, title: match?.label ?? 'Resumen' }
  }, [location.pathname])

  return (
    <div className="console">
      {menuOpen && <div className="console__scrim" onClick={() => setMenuOpen(false)} />}

      <aside className={`console__sidebar${menuOpen ? ' console__sidebar--open' : ''}`}>
        <div className="sidebar__head">
          <BrandLockup />
          <span className="lg-hide">
            <IconButton label="Cerrar menú" onClick={() => setMenuOpen(false)}><X size={17} /></IconButton>
          </span>
        </div>

        <button type="button" className="org-switch" onClick={() => navigate('/org/profile')}>
          <Avatar name={state.organization.tradeName || 'Organización'} size="sm" />
          <span className="grow">
            <span className="org-switch__name truncate" style={{ display: 'block' }}>
              {state.organization.tradeName || 'Organización'}
            </span>
            <span className="org-switch__meta">
              {state.organization.countryOfIncorporation
                ? `${countryLabel(state.organization.countryOfIncorporation)} · ${state.organization.legalEntities.length} entidad${state.organization.legalEntities.length === 1 ? '' : 'es'}`
                : 'Sin datos legales'}
            </span>
          </span>
          <ChevronsUpDown size={14} aria-hidden="true" style={{ color: 'var(--ray-color-text-tertiary)' }} />
        </button>

        <nav className="sidebar__nav" aria-label="Navegación principal">
          <div className="sidebar__group">
            <span className="sidebar__group-label">Merchant Desk · operar</span>
            {DESK_ITEMS.map(item => (
              <NavItem key={item.to} item={item} disabled={!deskEnabled} />
            ))}
          </div>

          <div className="sidebar__group">
            <span className="sidebar__group-label">Config Org · administrar</span>
            {ORG_ITEMS.map(item => (
              <NavItem key={item.to} item={item} />
            ))}
          </div>
        </nav>

        <div className="sidebar__foot">
          <div className="demo-note">
            <div>
              <p className="demo-note__title">Demo conceptual</p>
              <p className="demo-note__body">Datos de ejemplo. No procesa operaciones reales.</p>
            </div>
          </div>
          <div className="sidebar__user">
            <Avatar name={admin?.name || 'Usuario'} size="sm" muted />
            <span className="grow" style={{ minWidth: 0 }}>
              <span className="sidebar__user-name truncate" style={{ display: 'block' }}>{admin?.name || 'Usuario'}</span>
              <span className="sidebar__user-role">{admin ? roleLabel(admin.role) : 'Sin rol'}</span>
            </span>
          </div>
        </div>
      </aside>

      <div className="console__main">
        <header className="topbar">
          <span className="lg-hide">
            <IconButton label="Abrir menú" bordered onClick={() => setMenuOpen(true)}><Menu size={17} /></IconButton>
          </span>
          <div className="topbar__context">
            <p className="topbar__eyebrow">{context.area}</p>
            <p className="topbar__title">{context.title}</p>
          </div>
          <div className="topbar__actions">
            <Badge tone={accountMeta.tone} dot>Cuenta vista: {accountMeta.label.toLowerCase()}</Badge>
          </div>
        </header>

        <main className="page">
          <div className="page__inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
