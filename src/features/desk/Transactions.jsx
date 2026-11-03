/* =============================================================
   D · Merchant Desk — Historial de movimientos.

   Solo muestra movimientos de cuentas que hoy se pueden operar:
   si una cuenta depende de un producto inactivo, su cartola no
   aparece acá.
   ============================================================= */
import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeftRight, Search, SearchX } from 'lucide-react'

import {
  Badge, Button, Callout, Card, CardBody, CardFooter, DefinitionList, Drawer,
  EmptyState, Field, Input, Select, Skeleton, Table,
} from '../../ui'
import { TX_STATUS_META } from '../../mock/transactions'
import { formatMoney } from '../../mock/accounts'
import { useDemoState } from '../../state/DemoState'
import {
  SignedAmount, formatDateTime, useDeskAccounts, useDeskLoad, useDeskTransactions,
} from './shared'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'completed', label: 'Completados' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'rejected', label: 'Rechazados' },
]

const KIND_OPTIONS = [
  { value: 'all', label: 'Abonos y egresos' },
  { value: 'inflow', label: 'Solo abonos' },
  { value: 'outflow', label: 'Solo egresos' },
]

export default function Transactions() {
  const { state } = useDemoState()
  const accounts = useDeskAccounts()
  const transactions = useDeskTransactions()
  const { loading, retry } = useDeskLoad()
  const [searchParams, setSearchParams] = useSearchParams()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [kind, setKind] = useState('all')
  const [detail, setDetail] = useState(null)

  const virtualAccount = searchParams.get('va') ?? 'all'
  const setVirtualAccount = value => {
    const next = new URLSearchParams(searchParams)
    if (value === 'all') next.delete('va')
    else next.set('va', value)
    setSearchParams(next, { replace: true })
  }

  const vaOptions = useMemo(() => ([
    { value: 'all', label: 'Todas las cuentas virtuales' },
    { value: 'none', label: 'Sin cuenta virtual' },
    ...state.virtualAccounts.map(va => ({ value: va.id, label: `${va.id} · ${va.alias}` })),
  ]), [state.virtualAccounts])

  const filtered = useMemo(() => {
    if (!transactions) return []
    const q = query.trim().toLowerCase()
    return transactions.filter(tx => {
      if (status !== 'all' && tx.status !== status) return false
      if (kind !== 'all' && tx.kind !== kind) return false
      if (virtualAccount === 'none' && tx.virtualAccount) return false
      if (virtualAccount !== 'all' && virtualAccount !== 'none' && tx.virtualAccount !== virtualAccount) return false
      if (!q) return true
      return [tx.id, tx.concept, tx.counterparty, tx.virtualAccount, tx.document]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(q))
    })
  }, [transactions, query, status, kind, virtualAccount])

  const operableAccounts = accounts.filter(a => a.operable)
  const hiddenAccounts = accounts.filter(a => !a.operable)
  const isFiltering = query.trim().length > 0 || status !== 'all' || kind !== 'all' || virtualAccount !== 'all'

  const clearFilters = () => {
    setQuery(''); setStatus('all'); setKind('all'); setVirtualAccount('all')
  }

  const accountLabel = id => accounts.find(a => a.id === id)?.label ?? id

  return (
    <>
      <div className="page__head">
        <h1 className="page__title">Movimientos</h1>
        <p className="page__lead">
          Consulta los abonos (+) y egresos (−) de tus cuentas.
        </p>
      </div>

      {operableAccounts.length === 0 ? (
        <Card level="low">
          <CardBody>
            <EmptyState
              icon={<ArrowLeftRight size={20} aria-hidden="true" />}
              title="No hay cuentas habilitadas"
              description="Activa una cuenta para consultar movimientos."
            />
          </CardBody>
        </Card>
      ) : transactions === null ? (
        <Callout
          tone="danger"
          title="No pudimos cargar el historial"
          action={<Button variant="secondary" size="sm" onClick={retry}>Reintentar</Button>}
        >
          <p className="ray-body-sm">No pudimos cargar los movimientos. Inténtalo de nuevo.</p>
        </Callout>
      ) : (
        <>
          {hiddenAccounts.length > 0 && (
            <div style={{ marginBottom: 'var(--ray-space-4)' }}>
              <Callout tone="info" title="Cuentas fuera de este historial">
                <p className="ray-body-sm">
                  {hiddenAccounts.map(a => a.label).join(' y ')} requieren un producto activo para mostrar sus movimientos.
                </p>
              </Callout>
            </div>
          )}

          <div className="desk-filters desk-filters--4" style={{ marginBottom: 'var(--ray-space-4)' }}>
            <Field label="Buscar" htmlFor="tx-search">
              <Input
                id="tx-search"
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Operación, concepto o contraparte"
                icon={<Search size={14} aria-hidden="true" />}
              />
            </Field>
            <Field label="Estado" htmlFor="tx-status">
              <Select id="tx-status" value={status} onChange={e => setStatus(e.target.value)} options={STATUS_OPTIONS} />
            </Field>
            <Field label="Tipo de movimiento" htmlFor="tx-kind">
              <Select id="tx-kind" value={kind} onChange={e => setKind(e.target.value)} options={KIND_OPTIONS} />
            </Field>
            <Field label="Cuenta virtual" htmlFor="tx-va">
              <Select id="tx-va" value={virtualAccount} onChange={e => setVirtualAccount(e.target.value)} options={vaOptions} />
            </Field>
          </div>

          <Card level="low">
            {loading ? (
              <CardBody>
                <div className="stack gap-3">
                  {[0, 1, 2, 3, 4, 5].map(i => <Skeleton key={i} width="100%" height={20} />)}
                </div>
              </CardBody>
            ) : (
              <Table
                caption="Historial de movimientos de las cuentas habilitadas"
                columns={[
                  {
                    key: 'date',
                    header: 'Fecha',
                    render: tx => <span className="ray-caption text-tertiary">{formatDateTime(tx.date)}</span>,
                  },
                  { key: 'id', header: 'Operación', render: tx => <span className="desk-id">{tx.id}</span> },
                  {
                    key: 'concept',
                    header: 'Concepto',
                    render: tx => (
                      <div>
                        <p className="ray-label truncate">{tx.concept}</p>
                        <p className="desk-id">{tx.counterparty}</p>
                      </div>
                    ),
                  },
                  {
                    key: 'virtualAccount',
                    header: 'Cuenta virtual',
                    render: tx => (tx.virtualAccount
                      ? <span className="desk-id">{tx.virtualAccount}</span>
                      : <span className="ray-caption text-tertiary">Cuenta madre</span>),
                  },
                  {
                    key: 'kind',
                    header: 'Tipo',
                    render: tx => (
                      <span className="ray-caption text-secondary">{tx.kind === 'inflow' ? 'Abono' : 'Egreso'}</span>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Estado',
                    render: tx => {
                      const meta = TX_STATUS_META[tx.status]
                      return <Badge tone={meta.tone}>{meta.label}</Badge>
                    },
                  },
                  {
                    key: 'amount',
                    header: 'Monto',
                    align: 'right',
                    render: tx => <SignedAmount amount={tx.amount} currency={tx.currency} />,
                  },
                  {
                    key: 'actions',
                    header: 'Detalle',
                    align: 'right',
                    render: tx => (
                      <Button variant="ghost" size="sm" onClick={() => setDetail(tx)}>Ver detalle</Button>
                    ),
                  },
                ]}
                rows={filtered}
                rowKey={tx => tx.id}
                empty={(
                  <CardBody>
                    <EmptyState
                      icon={<SearchX size={20} aria-hidden="true" />}
                      title={isFiltering ? 'Sin resultados para estos filtros' : 'Sin movimientos registrados'}
                      description={isFiltering
                        ? 'Prueba otros filtros.'
                        : 'Los abonos y egresos aparecerán aquí.'}
                      action={isFiltering
                        ? <Button variant="secondary" size="sm" onClick={clearFilters}>Limpiar filtros</Button>
                        : undefined}
                    />
                  </CardBody>
                )}
              />
            )}

            {!loading && filtered.length > 0 && (
              <CardFooter>
                <p className="ray-caption text-tertiary">
                  {filtered.length} de {transactions.length} movimientos
                </p>
                {isFiltering && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>Limpiar filtros</Button>
                )}
              </CardFooter>
            )}
          </Card>
        </>
      )}

      <Drawer
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail ? detail.concept : 'Movimiento'}
        description={detail ? `Operación ${detail.id}` : undefined}
      >
        {detail && (
          <div className="stack gap-5">
            <div>
              <p className="desk-balance__label">Monto</p>
              <p className="ray-subtitle-lg">
                <SignedAmount amount={detail.amount} currency={detail.currency} />
              </p>
            </div>

            <div className="row gap-2">
              <Badge tone={TX_STATUS_META[detail.status].tone}>{TX_STATUS_META[detail.status].label}</Badge>
              <Badge tone="neutral">{detail.kind === 'inflow' ? 'Abono' : 'Egreso'}</Badge>
            </div>

            <DefinitionList
              columns={2}
              items={[
                { label: 'Fecha y hora', value: formatDateTime(detail.date) },
                { label: 'Contraparte', value: detail.counterparty },
                { label: 'Cuenta', value: accountLabel(detail.account) },
                { label: 'Cuenta virtual', value: detail.virtualAccount ?? 'Cuenta madre' },
                { label: 'Moneda', value: detail.currency },
                { label: 'Monto absoluto', value: formatMoney(Math.abs(detail.amount), detail.currency) },
                { label: 'Respaldo', value: detail.document ?? 'Sin documento asociado' },
              ]}
            />

            {detail.status === 'pending' && (
              <Callout tone="warning" title="Operación en curso">
                <p className="ray-body-sm">
                  Pendiente de liquidación. El saldo disponible ya descuenta los fondos reservados.
                </p>
              </Callout>
            )}
            {detail.status === 'rejected' && (
              <Callout tone="danger" title="Operación rechazada">
                <p className="ray-body-sm">
                  No se ejecutó. Los fondos siguen en la cuenta de origen.
                </p>
              </Callout>
            )}
          </div>
        )}
      </Drawer>
    </>
  )
}
