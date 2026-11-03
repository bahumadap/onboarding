import React from 'react'
import { Link } from 'react-router-dom'
import { Callout } from '../../ui'
import AccountCard from './AccountCard'
import { useDeskAccounts } from './shared'

export default function Accounts() {
  const accounts = useDeskAccounts()
  return <>
    <header className="page__head">
      <h1 className="page__title">Cuentas</h1>
      <p className="page__lead">Consulta saldos, datos bancarios y movimientos por cuenta.</p>
    </header>
    <div className="grid grid-3">{accounts.filter(a => a.operable).map(account => <AccountCard key={account.id} account={account} />)}</div>
    <section className="section">
      <Callout tone="info" title="Monedas disponibles"><p className="ray-body-sm">Monedas y cuentas de ejemplo. La disponibilidad real depende del país y del proveedor.</p></Callout>
      <p className="ray-body-sm" style={{ marginTop: 'var(--ray-space-4)' }}><Link to="/org/accounts">Configurar alias y accesos</Link></p>
    </section>
  </>
}
