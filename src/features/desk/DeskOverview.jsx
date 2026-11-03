/* =============================================================
   D · Merchant Desk — Resumen operativo.

   Es la pantalla de operación: muestra saldos, el pulso del día y
   los últimos movimientos. La administración (usuarios, permisos,
   configuración de productos) vive en Config Org y no se duplica acá.
   ============================================================= */
import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  ArrowLeftRight, Layers, Sparkles, Wallet,
} from 'lucide-react'

import {
  Badge, Button, Callout, Card, CardBody, CardFooter, CardHeader, Divider,
  EmptyState, Metric, Skeleton, Table,
} from '../../ui'
import { MONTHLY_FLOW, formatCompact, formatMoney } from '../../mock/accounts'
import { VA_STATUS_META } from '../../mock/virtualAccounts'
import { TX_STATUS_META } from '../../mock/transactions'
import { PRODUCT_STATUS, isProductOperable } from '../../state/statuses'
import { ADDITIONAL_PRODUCTS } from '../../mock/products'
import { useDemoState } from '../../state/DemoState'
import {
  CHART_COLORS, SignedAmount, formatDateTime, inoperableReason,
  useDeskAccounts, useDeskLoad, useDeskTransactions,
} from './shared'

const CHART_TOOLTIP_STYLE = {
  background: 'var(--ray-color-bg-default)',
  border: '1px solid var(--ray-color-border-base)',
  borderRadius: 'var(--ray-radius-lg)',
  fontSize: 'var(--ray-text-body-sm)',
  color: 'var(--ray-color-text-primary)',
}

export default function DeskOverview() {
  const navigate = useNavigate()
  const { state } = useDemoState()
  const accounts = useDeskAccounts()
  const transactions = useDeskTransactions()
  const { loading, retry } = useDeskLoad()

  const vaStatus = state.products.virtual_accounts ?? PRODUCT_STATUS.NOT_AVAILABLE
  const vaOperable = isProductOperable(vaStatus)

  const requestable = ADDITIONAL_PRODUCTS.filter(
    p => (state.products[p.id] ?? PRODUCT_STATUS.NOT_AVAILABLE) === PRODUCT_STATUS.AVAILABLE_TO_REQUEST,
  )

  /* KPIs del último día con movimientos registrados. */
  const today = useMemo(() => {
    if (!transactions || transactions.length === 0) return null
    const day = transactions[0].date.slice(0, 10)
    const rows = transactions.filter(tx => tx.date.slice(0, 10) === day)
    return {
      day,
      inflow: rows.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0),
      outflow: rows.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
      count: rows.length,
      pending: rows.filter(tx => tx.status === 'pending').length,
    }
  }, [transactions])

  const recentVirtual = useMemo(
    () => state.virtualAccounts
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4),
    [state.virtualAccounts],
  )

  const dayLabel = today
    ? new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'long' }).format(new Date(today.day))
    : null

  /* El dataset de movimientos no está disponible: es un error, y se dice. */
  if (transactions === null) {
    return (
      <>
        <PageHead />
        <Callout
          tone="danger"
          title="No pudimos cargar los movimientos"
          action={<Button variant="secondary" size="sm" onClick={retry}>Reintentar</Button>}
        >
          <p className="ray-body-sm">El servicio de movimientos no respondió. Los saldos que ves pueden estar desactualizados.</p>
        </Callout>
      </>
    )
  }

  return (
    <>
      <PageHead />

      {/* ------------------------- Cuentas ------------------------- */}
      <section className="section" aria-labelledby="sec-cuentas">
        <div className="section__head">
          <div>
            <h2 className="section__title" id="sec-cuentas">Cuentas empresariales</h2>
            <p className="section__desc">Saldo por moneda y estado de habilitación.</p>
          </div>
        </div>

        <div className="grid grid-3">
          {loading
            ? [0, 1, 2].map(i => (
              <Card key={i} level="low">
                <CardBody>
                  <Skeleton width="60%" height={16} />
                  <div style={{ height: 'var(--ray-space-4)' }} />
                  <Skeleton width="80%" height={28} />
                  <div style={{ height: 'var(--ray-space-3)' }} />
                  <Skeleton width="45%" />
                </CardBody>
              </Card>
            ))
            : accounts.map(account => (
              <AccountCard key={account.id} account={account} />
            ))}
        </div>

        <div style={{ marginTop: 'var(--ray-space-4)' }}>
          <Callout tone="info" title="Disponibilidad de monedas">
            <p className="ray-body-sm">
              Las monedas que puede operar una empresa dependen de su país y del proveedor.
              Las cuentas de esta demo son datos de ejemplo.
            </p>
          </Callout>
        </div>
      </section>

      {/* --------------------------- KPIs -------------------------- */}
      <section className="section" aria-labelledby="sec-dia">
        <div className="section__head">
          <div>
            <h2 className="section__title" id="sec-dia">Actividad del día</h2>
            <p className="section__desc">
              {dayLabel ? `Movimientos registrados el ${dayLabel}.` : 'Sin movimientos registrados.'}
            </p>
          </div>
          <Button variant="secondary" size="sm" icon={<ArrowLeftRight size={15} aria-hidden="true" />} onClick={() => navigate('/desk/transactions')}>
            Ver movimientos
          </Button>
        </div>

        <Card level="medium">
          <CardBody>
            {loading ? (
              <div className="grid grid-4">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="stack gap-2">
                    <Skeleton width="55%" />
                    <Skeleton width="75%" height={24} />
                  </div>
                ))}
              </div>
            ) : !today ? (
              <EmptyState
                title="Todavía no hay movimientos"
                description="Cuando la cuenta registre abonos o egresos vas a ver acá el resumen del día."
              />
            ) : (
              <div className="grid grid-4">
                <Metric label="Abonos del día" value={formatMoney(today.inflow, 'CLP')} meta="Entradas confirmadas y en curso" />
                <Metric label="Egresos del día" value={formatMoney(today.outflow, 'CLP')} meta="Salidas confirmadas y en curso" />
                <Metric label="Movimientos" value={String(today.count)} meta="Operaciones registradas" />
                <Metric
                  label="Pendientes"
                  value={String(today.pending)}
                  meta={today.pending === 0 ? 'Sin operaciones por resolver' : 'Operaciones por resolver'}
                />
              </div>
            )}
          </CardBody>
        </Card>
      </section>

      {/* -------------------------- Gráfico ------------------------ */}
      <section className="section" aria-labelledby="sec-flujo">
        <div className="section__head">
          <div>
            <h2 className="section__title" id="sec-flujo">Entradas y salidas</h2>
            <p className="section__desc">Últimos seis meses, en millones de pesos.</p>
          </div>
        </div>

        <Card level="low">
          <CardBody>
            {loading ? (
              <Skeleton width="100%" height={260} radius="var(--ray-radius-lg)" />
            ) : (
              <>
                <div className="desk-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MONTHLY_FLOW} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="deskInflow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={CHART_COLORS.inflow} stopOpacity={0.28} />
                          <stop offset="100%" stopColor={CHART_COLORS.inflow} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="deskOutflow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={CHART_COLORS.outflow} stopOpacity={0.24} />
                          <stop offset="100%" stopColor={CHART_COLORS.outflow} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" stroke={CHART_COLORS.axis} tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis
                        stroke={CHART_COLORS.axis}
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                        width={44}
                        tickFormatter={v => `${v}M`}
                      />
                      <Tooltip
                        contentStyle={CHART_TOOLTIP_STYLE}
                        labelStyle={{ color: 'var(--ray-color-text-tertiary)' }}
                        formatter={(value, name) => [`${value}M`, name]}
                      />
                      <Legend
                        verticalAlign="top"
                        align="left"
                        height={32}
                        iconType="circle"
                        wrapperStyle={{ fontSize: 'var(--ray-text-body-sm)', color: 'var(--ray-color-text-secondary)' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="inflow"
                        name="Entradas"
                        stroke={CHART_COLORS.inflow}
                        strokeWidth={2}
                        fill="url(#deskInflow)"
                      />
                      <Area
                        type="monotone"
                        dataKey="outflow"
                        name="Salidas"
                        stroke={CHART_COLORS.outflow}
                        strokeWidth={2}
                        fill="url(#deskOutflow)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="desk-chart__foot">Serie de ejemplo, agregada sobre la cuenta vista en pesos chilenos.</p>
              </>
            )}
          </CardBody>
        </Card>
      </section>

      {/* -------------------- Cuentas virtuales -------------------- */}
      <section className="section" aria-labelledby="sec-cv">
        <div className="section__head">
          <div>
            <h2 className="section__title" id="sec-cv">Cuentas virtuales recientes</h2>
            <p className="section__desc">Subcuentas creadas últimamente sobre la cuenta vista.</p>
          </div>
          {vaOperable ? (
            <Button variant="secondary" size="sm" icon={<Layers size={15} aria-hidden="true" />} onClick={() => navigate('/desk/virtual-accounts')}>
              Gestionar cuentas virtuales
            </Button>
          ) : (
            <Button variant="secondary" size="sm" disabled title="Las cuentas virtuales se habilitan con la cuenta vista activa">
              Gestión no disponible
            </Button>
          )}
        </div>

        <Card level="low">
          <CardBody>
            {loading ? (
              <div className="stack gap-3">
                {[0, 1, 2].map(i => <Skeleton key={i} width="100%" height={20} />)}
              </div>
            ) : !vaOperable ? (
              <EmptyState
                icon={<Layers size={20} aria-hidden="true" />}
                title="Cuentas virtuales no habilitadas"
                description="El producto de cuentas virtuales no está activo, así que no se pueden crear ni operar subcuentas."
              />
            ) : recentVirtual.length === 0 ? (
              <EmptyState
                icon={<Layers size={20} aria-hidden="true" />}
                title="Todavía no creaste cuentas virtuales"
                description="Las cuentas virtuales te permiten separar saldos por usuario final, proyecto o flujo de cobro."
                action={<Button variant="brand" size="sm" onClick={() => navigate('/desk/virtual-accounts')}>Crear la primera</Button>}
              />
            ) : (
              <ul className="desk-stack-rows">
                {recentVirtual.map(va => {
                  const meta = VA_STATUS_META[va.status] ?? VA_STATUS_META.closed
                  return (
                    <li key={va.id}>
                      <div className="grow">
                        <p className="ray-label truncate">{va.alias}</p>
                        <p className="desk-id">{va.id} · {va.purpose}</p>
                      </div>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      <span className="ray-num" style={{ minWidth: 'var(--ray-space-16)', textAlign: 'right' }}>
                        {formatMoney(va.balance, va.currency)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </section>

      {/* --------------------- Últimos movimientos ------------------ */}
      <section className="section" aria-labelledby="sec-movimientos">
        <div className="section__head">
          <div>
            <h2 className="section__title" id="sec-movimientos">Últimos movimientos</h2>
            <p className="section__desc">Las cinco operaciones más recientes de las cuentas habilitadas.</p>
          </div>
        </div>

        <Card level="low">
          {loading ? (
            <CardBody>
              <div className="stack gap-3">
                {[0, 1, 2, 3, 4].map(i => <Skeleton key={i} width="100%" height={20} />)}
              </div>
            </CardBody>
          ) : (
            <>
              <Table
                caption="Últimos movimientos de las cuentas habilitadas"
                columns={[
                  { key: 'date', header: 'Fecha', render: tx => <span className="ray-caption text-tertiary">{formatDateTime(tx.date)}</span> },
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
                ]}
                rows={transactions.slice(0, 5)}
                rowKey={tx => tx.id}
                empty={(
                  <CardBody>
                    <EmptyState
                      icon={<ArrowLeftRight size={20} aria-hidden="true" />}
                      title="Sin movimientos registrados"
                      description="Cuando la cuenta reciba abonos o egresos los vas a ver acá."
                    />
                  </CardBody>
                )}
              />
              {transactions.length > 0 && (
                <CardFooter>
                  <Link to="/desk/transactions">Ver el historial completo</Link>
                </CardFooter>
              )}
            </>
          )}
        </Card>
      </section>

      {/* ------------------------ Descubrimiento -------------------- */}
      {requestable.length > 0 && (
        <section className="section" aria-labelledby="sec-productos">
          <Card level="medium">
            <CardHeader
              title="Productos que puedes solicitar"
              description="Cada producto adicional tiene su propia solicitud, evaluación y activación."
            />
            <Divider />
            <CardBody>
              <div className="row wrap gap-2">
                {requestable.map(p => (
                  <Badge key={p.id} tone="brand">{p.name}</Badge>
                ))}
              </div>
              <p className="ray-body-sm text-secondary" style={{ marginTop: 'var(--ray-space-3)' }}>
                Revisa requisitos, capacidades y plazos de evaluación antes de solicitar la activación.
              </p>
            </CardBody>
            <CardFooter>
              <Button variant="brand" icon={<Sparkles size={15} aria-hidden="true" />} onClick={() => navigate('/desk/products')}>
                Ver catálogo de productos
              </Button>
            </CardFooter>
          </Card>
        </section>
      )}
    </>
  )
}

/* --------------------------- subcomponentes -------------------------- */

function PageHead() {
  return (
    <div className="page__head">
      <h1 className="page__title">Resumen operativo</h1>
      <p className="page__lead">
        Saldos, actividad y movimientos de la organización. La administración de usuarios,
        permisos y configuración de productos vive en Config Org.
      </p>
    </div>
  )
}

function AccountCard({ account }) {
  const navigate = useNavigate()
  const reason = inoperableReason(account)

  if (!account.operable) {
    return (
      <Card level="low">
        <CardBody>
          <div className="row between gap-3">
            <div className="grow">
              <p className="ray-subtitle truncate">{account.label}</p>
              <p className="desk-id">{account.currency} · {account.number}</p>
            </div>
            <Badge tone="neutral">No habilitada</Badge>
          </div>
          <p className="ray-body-sm text-secondary" style={{ marginTop: 'var(--ray-space-3)' }}>{reason}</p>
        </CardBody>
        <CardFooter>
          <Button variant="secondary" size="sm" onClick={() => navigate('/desk/products')}>
            Ver el producto requerido
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const primary = account.kind === 'primary'

  return (
    <Card level={primary ? 'high' : 'low'}>
      <CardBody>
        <div className="row between gap-3">
          <div className="grow">
            <p className="ray-subtitle truncate">{account.label}</p>
            <p className="desk-id">{account.currency} · {account.number}</p>
          </div>
          <Badge tone="success" dot>Operativa</Badge>
        </div>

        <p className="ray-display" style={{ fontSize: 'var(--ray-text-h3)', marginTop: 'var(--ray-space-4)' }}>
          {formatCompact(account.balanceTotal, account.currency)}
        </p>
        <p className="ray-caption text-tertiary">
          Disponible {formatMoney(account.balanceAvailable, account.currency)}
          {account.balanceReserved > 0 && ` · reservado ${formatMoney(account.balanceReserved, account.currency)}`}
        </p>
      </CardBody>
      <CardFooter>
        <Button
          variant={primary ? 'primary' : 'secondary'}
          size="sm"
          icon={<Wallet size={15} aria-hidden="true" />}
          onClick={() => navigate(`/desk/accounts/${account.id}`)}
        >
          Ver cuenta
        </Button>
      </CardFooter>
    </Card>
  )
}
