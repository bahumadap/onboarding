/* =============================================================
   Layout de los flujos previos a la consola: signup, onboarding y
   activación. Panel izquierdo fijo con el contexto del proceso y
   panel derecho con un solo foco por pantalla.
   ============================================================= */
import React from 'react'
import { Link } from 'react-router-dom'
import { BrandLockup } from './Brand'
import './shell.css'

export default function FlowLayout({
  aside,
  topRight,
  children,
  wide,
}) {
  return (
    <div className="flow">
      <aside className="flow__aside">
        <BrandLockup size="lg" />
        <div>
          <h1 className="flow__aside-title">{aside?.title}</h1>
          {aside?.body && <p className="flow__aside-body">{aside.body}</p>}
          {aside?.items && (
            <div className="flow__aside-list">
              {aside.items.map((item, i) => (
                <div className="flow__aside-item" key={item.title}>
                  <span className="flow__aside-marker" aria-hidden="true">{item.marker ?? i + 1}</span>
                  <span>
                    <b>{item.title}</b>
                    <span>{item.description}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="flow__aside-foot">
          Demo conceptual de YOL1 Enterprise. Los datos son de ejemplo y no se procesan operaciones reales.
        </p>
      </aside>

      <div className="flow__panel">
        <div className="flow__topbar">
          <Link to="/" style={{ textDecoration: 'none' }} aria-label="Inicio">
            <span className="flow-brand-mobile"><BrandLockup /></span>
          </Link>
          {topRight}
        </div>
        <div className="flow__content">
          <div className={wide ? 'flow__form flow__form--wide' : 'flow__form'}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
