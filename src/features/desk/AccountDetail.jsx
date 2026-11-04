/* =============================================================
   D · Merchant Desk — Detalle de una cuenta empresarial.

   Si la cuenta no existe, o depende de un producto que no está
   activo, la pantalla lo dice en vez de inventar un saldo operable.
   ============================================================= */
import React, { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowLeftRight, Layers, SearchX, Wallet } from 'lucide-react'

import {
  Badge, Button, Callout, Card, CardBody, CardFooter, DefinitionList,
  EmptyState, Skeleton, Table,
} from '../../ui'
import { formatMoney } from '../../mock/accounts'
import { TX_STATUS_META } from '../../mock/transactions'
import { VA_STATUS_META } from '../../mock/virtualAccounts'
import { ACCOUNT_STATUS_META, PRODUCT_STATUS, PRODUCT_STATUS_META, isProductOperable } from '../../state/statuses'
import { useDemoState } from '../../state/DemoState'
import {
  BalanceBreakdown, SignedAmount, formatDateTime, inoperableReason,
  useDeskAccounts, useDeskLoad, useDeskTransactions,
} from './shared'

const COUNTRY_LABEL = { CL: 'Chile', US: 'Estados Unidos' }

export default function AccountDetail() {
  const { accountId } = useParams()
  const navigate = useNavigate()
  const { state } = useDemoState()
  const accounts = useDeskAccounts()
  const transactions = useDeskTransactions()
  const { loading, retry } = useDeskLoad()

  const account = accounts.find(a => a.id === accountId)

  const movements = useMemo(
    () => (transactions ?? []).filter(tx => tx.account === accountId),
    [transactions, accountId],
  )

  const linkedVirtual = useMemo(() => {
    if (!account) return []
    return state.virtualAccounts.filter(va => va.currency === account.currency)
  }, [state.virtualAccounts, account])

  const vaOperable = isProductOperable(state.products.virtual_accounts ?? PRODUCT_STATUS.NOT_AVAILABLE)

  /* ------------------------- cuenta inexistente ------------------------ */
  if (!account) {
    return (
      <>
        <BackLink />
        <Card level="low">
          <CardBody>
            <EmptyState
              icon={<SearchX size={20} aria-hidden="true" />}
              title="No encontramos esa cuenta"
              description={`El identificador “${accountId}” no corresponde a ninguna cuenta de tu organización.`}
              action={<Button variant="secondary" onClick={() => navigate('/desk')}>Volver al resumen</Button>}
            />
          </CardBody>
        </Card>
      </>
    )
  }

  /* ---------------------- cuenta con producto inactivo ----------------- */
  if (!account.operable) {
    const productMeta = account.requiredProductStatus
      ? PRODUCT_STATUS_META[account.requiredProductStatus]
      : null
    return (
      <>
        <BackLink />
        <div className="page__head">
          <h1 className="page__title">{account.label}</h1>
          <p className="page__lead">Esta cuenta aún no está activa.</p>
        </div>
        <Card level="low">
          <CardBody>
            <EmptyState
              icon={<Wallet size={20} aria-hidden="true" />}
              title="Cuenta no habilitada"
              description={inoperableReason(account)}
              action={(
                <div className="row wrap gap-2 center">
                  {productMeta && <Badge tone={productMeta.tone}>{account.requiredProduct?.name}: {productMeta.label.toLowerCase()}</Badge>}
                  <Button variant="brand" size="sm" onClick={() => navigate('/desk/products')}>
                    Ver productos
                  </Button>
                </div>
              )}
            />
          </CardBody>
        </Card>
      </>
    )
  }

  /* ------------------------------ operable ----------------------------- */
  return (
    <>
      <BackLink />

      <div className="page__head">
        <div className="row wrap gap-3 between">
          <div>
            <h1 className="page__title">{account.label}</h1>
            <p className="page__lead">
              Cuenta {account.currency} terminada en {account.number.replace(/\D/g, '')}.
              Saldos y movimientos de ejemplo.
            </p>
          </div>
          <Badge tone={ACCOUNT_STATUS_META[state.accountStatus].tone} dot>{ACCOUNT_STATUS_META[state.accountStatus].label}</Badge>
        </div>
      </div>

      {/* ----------------------------- Saldos ---------------------------- */}
      <Card level="high">
        <CardBody>
          {loading
            ? <Skeleton width="100%" height={56} />
            : <BalanceBreakdown account={account} />}
        </CardBody>
        <CardFooter>
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowLeftRight size={15} aria-hidden="true" />}
            onClick={() => navigate('/desk/transactions')}
          >
            Consultar movimientos
          </Button>
          {vaOperable && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Layers size={15} aria-hidden="true" />}
              onClick={() => navigate('/desk/virtual-accounts')}
            >
              Gestionar cuentas virtuales
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* --------------------------- Datos ------------------------------- */}
      <section className="section" aria-labelledby="sec-datos">
        <div className="section__head">
          <div>
            <h2 className="section__title" id="sec-datos">Datos de la cuenta</h2>

          </div>
        </div>
        <Card level="low">
          <CardBody>
            <DefinitionList
              columns={3}
              items={[
                { label: 'Identificador', value: account.id },
                { label: 'Número', value: account.number },
                { label: 'Moneda', value: account.currency },
                { label: 'País de la cuenta', value: COUNTRY_LABEL[account.country] ?? account.country },
                { label: 'Tipo', value: account.kind === 'primary' ? 'Cuenta vista principal' : 'Cuenta en moneda extranjera' },
                {
                  label: 'Producto asociado',
                  value: account.requiredProduct ? account.requiredProduct.name : 'Cuenta vista empresarial',
                },
              ]}
            />
          </CardBody>
        </Card>
      </section>

      {/* ------------------------- Movimientos --------------------------- */}
      <section className="section" aria-labelledby="sec-mov">
        <div className="section__head">
          <div>
            <h2 className="section__title" id="sec-mov">Movimientos de la cuenta</h2>
            <p className="section__desc">Operaciones registradas sobre {account.label.toLowerCase()}.</p>
          </div>
          <Link to="/desk/transactions">Ir al historial completo</Link>
        </div>

        <Card level="low">
          {transactions === null ? (
            <CardBody>
              <Callout
                tone="danger"
                title="No pudimos cargar los movimientos"
                action={<Button variant="secondary" size="sm" onClick={retry}>Reintentar</Button>}
              >
                <p className="ray-body-sm">No pudimos actualizar los movimientos.</p>
              </Callout>
            </CardBody>
          ) : loading ? (
            <CardBody>
              <div className="stack gap-3">
                {[0, 1, 2, 3].map(i => <Skeleton key={i} width="100%" height={20} />)}
              </div>
            </CardBody>
          ) : (
            <Table
              caption={`Movimientos de ${account.label}`}
              columns={[
                { key: 'date', header: 'Fecha', render: tx => <span className="ray-caption text-tertiary">{formatDateTime(tx.date)}</span> },
                { key: 'id', header: 'Operación', render: tx => <span className="desk-id">{tx.id}</span> },
                {
                  key: 'concept',
                  header: 'Concepto',
                  render: tx => (
                    <div>
                      <p className="ray-label truncate">{tx.concept}</p>
                      <p className="desk-id">{tx.virtualAccount ? `${tx.counterparty} · ${tx.virtualAccount}` : tx.counterparty}</p>
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
                { key: 'amount', header: 'Monto', align: 'right', render: tx => <SignedAmount amount={tx.amount} currency={tx.currency} /> },
              ]}
              rows={movements}
              rowKey={tx => tx.id}
              empty={(
                <CardBody>
                  <EmptyState
                    icon={<ArrowLeftRight size={20} aria-hidden="true" />}
                    title="Esta cuenta no tiene movimientos"
                    description="Los abonos y egresos aparecerán aquí."
                  />
                </CardBody>
              )}
            />
          )}
        </Card>
      </section>

      {/* ---------------------- Cuentas virtuales ------------------------ */}
      <section className="section" aria-labelledby="sec-cv">
        <div className="section__head">
          <div>
            <h2 className="section__title" id="sec-cv">Cuentas virtuales asociadas</h2>
            <p className="section__desc">Subcuentas que operan en {account.currency} sobre esta cuenta.</p>
          </div>
          {vaOperable && (
            <Button variant="secondary" size="sm" onClick={() => navigate('/desk/virtual-accounts')}>
              Gestionar
            </Button>
          )}
        </div>

        <Card level="low">
          <CardBody>
            {!vaOperable ? (
              <EmptyState
                icon={<Layers size={20} aria-hidden="true" />}
                title="Cuentas virtuales no habilitadas"
                description="El producto de cuentas virtuales no está activo."
              />
            ) : loading ? (
              <div className="stack gap-3">
                {[0, 1, 2].map(i => <Skeleton key={i} width="100%" height={20} />)}
              </div>
            ) : linkedVirtual.length === 0 ? (
              <EmptyState
                icon={<Layers size={20} aria-hidden="true" />}
                title="Sin cuentas virtuales"
                description="Crea una cuenta virtual para separar saldos."
                action={<Button variant="brand" size="sm" onClick={() => navigate('/desk/virtual-accounts')}>Crear cuenta virtual</Button>}
              />
            ) : (
              <ul className="desk-stack-rows">
                {linkedVirtual.map(va => {
                  const meta = VA_STATUS_META[va.status] ?? VA_STATUS_META.closed
                  return (
                    <li key={va.id}>
                      <div className="grow">
                        <p className="ray-label truncate">{va.alias}</p>
                        <p className="desk-id">{va.id} · {va.purpose}</p>
                      </div>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      <span className="ray-num">{formatMoney(va.balance, va.currency)}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </section>
    </>
  )
}

const BackLink = () => (
  <p style={{ marginBottom: 'var(--ray-space-4)' }}>
    <Link to="/desk" className="row gap-1" style={{ display: 'inline-flex' }}>
      <ArrowLeft size={14} aria-hidden="true" />
      Volver al resumen
    </Link>
  </p>
)
