/* =============================================================
   Consola de YOL1 Enterprise.

   Un solo shell con dos espacios de responsabilidad distinta:
   Merchant Desk (operar) y Config Org (administrar). La navegación
   refleja esa separación y deshabilita lo que el estado de la cuenta
   todavía no permite operar.
   ============================================================= */
import React, { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { ArrowLeftRight, FileCheck2, Gauge, Menu, Sparkles, Wallet, X, Layers, Settings, ArrowLeft } from 'lucide-react'
import { Avatar, Badge, IconButton } from '../ui'
import { BrandLockup } from './Brand'
import { useDemoState } from '../state/DemoState'
import { ACCOUNT_STATUS_META, PRODUCT_STATUS, canAccessDesk } from '../state/statuses'
import { countryLabel } from '../mock/countries'
import { roleLabel } from '../mock/roles'
import { ADDITIONAL_PRODUCTS } from '../mock/products'
import { ORG_ITEMS } from './navigation'
import './shell.css'

const DESK_ITEMS = [
  { to: '/desk', label: 'Merchant Desk', icon: Gauge, end: true },
  { to: '/desk/accounts', label: 'Cuentas', icon: Wallet },
  { to: '/desk/transactions', label: 'Movimientos', icon: ArrowLeftRight },
]

function NavItem({ item, disabled, onNavigate }) {
  const Icon = item.icon
  if (disabled) {
    return (
      <span className="sidebar__item sidebar__item--disabled" aria-disabled="true" title="Disponible con una cuenta vista activa">
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

  // Cierra el menú móvil al cambiar de ruta.
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const deskEnabled = canAccessDesk(state)
  const inSettings = location.pathname.startsWith('/org')
  const productItems = [
    { to: '/desk/virtual-accounts', label: 'Cuentas virtuales', icon: Layers },
    ...ADDITIONAL_PRODUCTS.filter(p => state.products[p.id] === PRODUCT_STATUS.ACTIVE)
      .map(p => ({ to: `/desk/products/${p.id}`, label: p.name, icon: Sparkles })),
  ]
  const accountMeta = ACCOUNT_STATUS_META[state.accountStatus]
  const admin = state.team[0]

  const context = useMemo(() => {
    const all = [...DESK_ITEMS, ...productItems, ...ADDITIONAL_PRODUCTS.map(p => ({ to: `/desk/products/${p.id}`, label: p.name })), ...ORG_ITEMS, { to: '/org', label: 'Configuración', end: true }, { to: '/desk/products', label: 'Catálogo de productos', end: true }]
    const match = all
      .filter(i => (i.end ? location.pathname === i.to : location.pathname.startsWith(i.to)))
      .sort((a, b) => b.to.length - a.to.length)[0]
    const area = location.pathname.startsWith('/org') ? 'Configuración' : 'Merchant Desk'
    return { area, title: location.pathname === '/desk' ? 'Resumen' : match?.label ?? 'Resumen' }
  }, [location.pathname, state.products])

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

        <div className="org-switch">
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
        </div>

        <nav className="sidebar__nav" aria-label={inSettings ? 'Navegación de configuración' : 'Navegación principal'}>
          {inSettings ? <>
            <div className="sidebar__group">
              <NavItem item={{ to: deskEnabled ? '/desk' : '/onboarding', label: deskEnabled ? 'Volver al Merchant Desk' : 'Volver al onboarding', icon: ArrowLeft, end: true }} />
            </div>
            <div className="sidebar__group">
              <NavItem item={{ to: '/org', label: 'Configuración', icon: Settings, end: true }} />
              {ORG_ITEMS.map(item => <NavItem key={item.to} item={item} />)}
            </div>
          </> : <>
            <div className="sidebar__group">
              {DESK_ITEMS.map(item => <NavItem key={item.to} item={item} disabled={!deskEnabled} />)}
            </div>
            <div className="sidebar__group">
              <span className="sidebar__group-label">Tus productos</span>
              {productItems.map(item => <NavItem key={item.to} item={item} disabled={!deskEnabled} />)}
              <NavItem item={{ to: '/desk/products', label: 'Explorar productos', icon: Sparkles, end: true }} disabled={!deskEnabled} />
            </div>
          </>}
        </nav>

        <div className="sidebar__foot">
          {!inSettings && <NavItem item={{ to: '/org', label: 'Configuración', icon: Settings }} />}
          <NavItem item={{ to: '/onboarding', label: 'Onboarding', icon: FileCheck2 }} />
          <div className="demo-note">
            <div>
              <p className="demo-note__title">Demo conceptual</p>
              <p className="demo-note__body">Datos de ejemplo. Sin operaciones reales.</p>
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
