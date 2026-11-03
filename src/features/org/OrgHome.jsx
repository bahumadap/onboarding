import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ORG_ITEMS } from '../../shell/navigation'

export default function OrgHome() {
  return <>
    <header className="page__head">
      <h1 className="page__title">Configuración</h1>
      <p className="page__lead">Administra tu empresa y los accesos de tu equipo.</p>
    </header>
    <div className="settings-grid">
      {ORG_ITEMS.map(({ to, label, description, icon: Icon }) => <Link key={to} to={to} className="settings-card">
        <Icon size={22} aria-hidden="true" />
        <div><h2 className="ray-subtitle">{label}</h2><p className="ray-body-sm text-secondary">{description}</p></div>
        <ChevronRight size={18} aria-hidden="true" />
      </Link>)}
    </div>
  </>
}
