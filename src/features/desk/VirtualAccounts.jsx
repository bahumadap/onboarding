/* =============================================================
   D · Merchant Desk — Cuentas virtuales.

   Las cuentas virtuales son parte del producto base de una cuenta
   habilitada: se crean, se suspenden y se reactivan desde acá, y
   cada acción cambia el estado de la demo de verdad.
   ============================================================= */
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers, Plus, SearchX, Search } from 'lucide-react'

import {
  Badge, Button, Callout, Card, CardBody, CardFooter, DefinitionList, Dialog,
  Drawer, EmptyState, Field, Input, Select, Skeleton, Table, useToast,
} from '../../ui'
import { ACCOUNTS, formatMoney } from '../../mock/accounts'
import { VA_PURPOSES, VA_STATUS_META } from '../../mock/virtualAccounts'
import { PRODUCT_STATUS, isProductOperable } from '../../state/statuses'
import { useDemoState } from '../../state/DemoState'
import { formatDate, useDeskLoad } from './shared'

const STATUS_FILTERS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: 'Activas' },
  { value: 'suspended', label: 'Suspendidas' },
  { value: 'closed', label: 'Cerradas' },
]

const CURRENCY_OPTIONS = ACCOUNTS.map(a => ({ value: a.currency, label: a.currency }))

export default function VirtualAccounts() {
  const { state, actions } = useDemoState()
  const toast = useToast()
  const navigate = useNavigate()
  const { loading } = useDeskLoad()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [detail, setDetail] = useState(null)

  const operable = isProductOperable(state.products.virtual_accounts ?? PRODUCT_STATUS.NOT_AVAILABLE)

  /* Monedas que se pueden usar: solo las de cuentas habilitadas. */
  const availableCurrencies = useMemo(() => {
    const allowed = ACCOUNTS.filter(a => !a.requiresProduct
      || isProductOperable(state.products[a.requiresProduct] ?? PRODUCT_STATUS.NOT_AVAILABLE))
      .map(a => a.currency)
    return CURRENCY_OPTIONS.filter(o => allowed.includes(o.value))
  }, [state.products])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return state.virtualAccounts.filter(va => {
      if (status !== 'all' && va.status !== status) return false
      if (!q) return true
      return [va.id, va.alias, va.holder, va.purpose, va.currency]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(q))
    })
  }, [state.virtualAccounts, query, status])

  const hasAny = state.virtualAccounts.length > 0
  const isSearching = query.trim().length > 0 || status !== 'all'

  const onCreate = payload => {
    actions.createVirtualAccount(payload)
    setCreateOpen(false)
    toast?.push({
      tone: 'success',
      title: 'Cuenta virtual creada',
      description: `${payload.alias} quedó activa y ya puede recibir movimientos.`,
    })
  }

  const toggleStatus = va => {
    const next = va.status === 'active' ? 'suspended' : 'active'
    actions.setVirtualAccountStatus(va.id, next)
    setDetail(prev => (prev && prev.id === va.id ? { ...prev, status: next } : prev))
    toast?.push({
      tone: next === 'active' ? 'success' : 'info',
      title: next === 'active' ? 'Cuenta virtual reactivada' : 'Cuenta virtual suspendida',
      description: next === 'active'
        ? `${va.alias} vuelve a aceptar movimientos.`
        : `${va.alias} deja de aceptar movimientos hasta que la reactives.`,
    })
  }

  /* -------------------- producto no habilitado --------------------- */
  if (!operable) {
    return (
      <>
        <PageHead />
        <Card level="low">
          <CardBody>
            <EmptyState
              icon={<Layers size={20} aria-hidden="true" />}
              title="Cuentas virtuales no habilitadas"
              description="El producto de cuentas virtuales no está activo para tu organización, así que no se pueden crear ni operar subcuentas."
              action={<Button variant="secondary" onClick={() => navigate('/desk/products')}>Ver catálogo de productos</Button>}
            />
          </CardBody>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHead />

      <div className="row wrap between gap-3" style={{ marginBottom: 'var(--ray-space-4)' }}>
        <div className="desk-filters grow">
          <Field label="Buscar" htmlFor="va-search">
            <Input
              id="va-search"
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Identificador, alias o propósito"
              icon={<Search size={14} aria-hidden="true" />}
            />
          </Field>
          <Field label="Estado" htmlFor="va-status">
            <Select id="va-status" value={status} onChange={e => setStatus(e.target.value)} options={STATUS_FILTERS} />
          </Field>
        </div>
        <Button
          variant="brand"
          icon={<Plus size={15} aria-hidden="true" />}
          onClick={() => setCreateOpen(true)}
          disabled={availableCurrencies.length === 0}
          title={availableCurrencies.length === 0 ? 'No hay cuentas habilitadas sobre las cuales crear subcuentas' : undefined}
        >
          Crear cuenta virtual
        </Button>
      </div>

      {availableCurrencies.length === 0 && (
        <div style={{ marginBottom: 'var(--ray-space-4)' }}>
          <Callout tone="warning" title="Sin cuentas habilitadas">
            <p className="ray-body-sm">
              Para crear una cuenta virtual necesitas al menos una cuenta empresarial operativa.
            </p>
          </Callout>
        </div>
      )}

      <Card level="low">
        {loading ? (
          <CardBody>
            <div className="stack gap-3">
              {[0, 1, 2, 3, 4].map(i => <Skeleton key={i} width="100%" height={20} />)}
            </div>
          </CardBody>
        ) : !hasAny ? (
          <CardBody>
            <EmptyState
              icon={<Layers size={20} aria-hidden="true" />}
              title="Todavía no creaste ninguna cuenta virtual"
              description="Las cuentas virtuales separan saldos y movimientos por usuario final, proyecto o flujo de cobro."
              action={<Button variant="brand" onClick={() => setCreateOpen(true)}>Crear la primera</Button>}
            />
          </CardBody>
        ) : (
          <Table
            caption="Cuentas virtuales de la organización"
            columns={[
              {
                key: 'id',
                header: 'Identificador',
                render: va => <span className="desk-id">{va.id}</span>,
              },
              {
                key: 'alias',
                header: 'Alias',
                render: va => (
                  <div>
                    <p className="ray-label truncate">{va.alias}</p>
                    <p className="desk-id">{va.purpose}</p>
                  </div>
                ),
              },
              { key: 'currency', header: 'Moneda' },
              {
                key: 'status',
                header: 'Estado',
                render: va => {
                  const meta = VA_STATUS_META[va.status] ?? VA_STATUS_META.closed
                  return <Badge tone={meta.tone}>{meta.label}</Badge>
                },
              },
              {
                key: 'balance',
                header: 'Saldo',
                align: 'right',
                render: va => <span className="ray-num">{formatMoney(va.balance, va.currency)}</span>,
              },
              {
                key: 'movements',
                header: 'Movimientos',
                align: 'right',
                render: va => <span className="ray-num">{va.movements ?? 0}</span>,
              },
              {
                key: 'actions',
                header: 'Acciones',
                align: 'right',
                render: va => (
                  <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
                    <Button variant="ghost" size="sm" onClick={() => setDetail(va)}>Ver detalle</Button>
                    {va.status !== 'closed' && (
                      <Button variant="secondary" size="sm" onClick={() => toggleStatus(va)}>
                        {va.status === 'active' ? 'Suspender' : 'Reactivar'}
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
            rows={filtered}
            rowKey={va => va.id}
            empty={(
              <CardBody>
                <EmptyState
                  icon={<SearchX size={20} aria-hidden="true" />}
                  title="Sin resultados para tu búsqueda"
                  description={isSearching
                    ? 'Ninguna cuenta virtual coincide con el texto y el estado que elegiste.'
                    : 'No hay cuentas virtuales que mostrar.'}
                  action={(
                    <Button variant="secondary" size="sm" onClick={() => { setQuery(''); setStatus('all') }}>
                      Limpiar filtros
                    </Button>
                  )}
                />
              </CardBody>
            )}
          />
        )}

        {hasAny && !loading && filtered.length > 0 && (
          <CardFooter>
            <p className="ray-caption text-tertiary">
              {filtered.length} de {state.virtualAccounts.length} cuentas virtuales
            </p>
          </CardFooter>
        )}
      </Card>

      <CreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={onCreate}
        currencies={availableCurrencies}
      />

      <Drawer
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail?.alias ?? 'Cuenta virtual'}
        description={detail ? `${detail.id} · ${detail.purpose}` : undefined}
        footer={detail && detail.status !== 'closed' ? (
          <Button variant="secondary" onClick={() => toggleStatus(detail)}>
            {detail.status === 'active' ? 'Suspender cuenta' : 'Reactivar cuenta'}
          </Button>
        ) : undefined}
      >
        {detail && (
          <div className="stack gap-5">
            <div className="row gap-2">
              <Badge tone={(VA_STATUS_META[detail.status] ?? VA_STATUS_META.closed).tone}>
                {(VA_STATUS_META[detail.status] ?? VA_STATUS_META.closed).label}
              </Badge>
              <Badge tone="neutral">{detail.currency}</Badge>
            </div>
            <DefinitionList
              columns={2}
              items={[
                { label: 'Identificador', value: detail.id },
                { label: 'Titular', value: detail.holder || detail.alias },
                { label: 'Propósito', value: detail.purpose },
                { label: 'Saldo', value: formatMoney(detail.balance, detail.currency) },
                { label: 'Movimientos', value: String(detail.movements ?? 0) },
                { label: 'Creada el', value: detail.createdAt ? formatDate(detail.createdAt) : '—' },
              ]}
            />
            <Button variant="secondary" onClick={() => { setDetail(null); navigate(`/desk/transactions?va=${detail.id}`) }}>
              Ver movimientos de esta cuenta
            </Button>
          </div>
        )}
      </Drawer>
    </>
  )
}

/* --------------------------- subcomponentes -------------------------- */

function PageHead() {
  return (
    <div className="page__head">
      <h1 className="page__title">Cuentas virtuales</h1>
      <p className="page__lead">
        Subcuentas con saldo y trazabilidad propios sobre la cuenta vista. Vienen con la
        cuenta habilitada: no requieren una solicitud aparte.
      </p>
    </div>
  )
}

function CreateDialog({ open, onClose, onSubmit, currencies }) {
  const [alias, setAlias] = useState('')
  const [holder, setHolder] = useState('')
  const [currency, setCurrency] = useState(currencies[0]?.value ?? 'CLP')
  const [purpose, setPurpose] = useState(VA_PURPOSES[0].value)
  const [touched, setTouched] = useState(false)

  const aliasError = touched && alias.trim().length === 0
    ? 'El alias es obligatorio: identifica la cuenta en el listado y en la cartola.'
    : null

  const close = () => {
    setAlias(''); setHolder(''); setTouched(false)
    onClose()
  }

  const submit = () => {
    setTouched(true)
    if (alias.trim().length === 0) return
    onSubmit({
      alias: alias.trim(),
      holder: holder.trim() || alias.trim(),
      currency,
      purpose,
    })
    setAlias(''); setHolder(''); setTouched(false)
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Crear cuenta virtual"
      description="La cuenta queda activa de inmediato y empieza con saldo cero."
      footer={(
        <>
          <Button variant="ghost" onClick={close}>Cancelar</Button>
          <Button variant="brand" onClick={submit}>Crear cuenta</Button>
        </>
      )}
    >
      <div className="stack gap-4">
        <Field
          label="Alias"
          required
          htmlFor="va-alias"
          error={aliasError}
          hint="Por ejemplo, el nombre del usuario final o del proyecto."
        >
          <Input
            id="va-alias"
            value={alias}
            invalid={Boolean(aliasError)}
            onChange={e => setAlias(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Recaudación tienda Ñuñoa"
          />
        </Field>

        <Field label="Titular" htmlFor="va-holder" hint="Si lo dejas vacío usamos el alias.">
          <Input
            id="va-holder"
            value={holder}
            onChange={e => setHolder(e.target.value)}
            placeholder="Operación interna"
          />
        </Field>

        <div className="grid grid-2">
          <Field label="Moneda" htmlFor="va-currency" hint="Solo monedas con cuenta habilitada.">
            <Select id="va-currency" value={currency} onChange={e => setCurrency(e.target.value)} options={currencies} />
          </Field>
          <Field label="Propósito" htmlFor="va-purpose">
            <Select id="va-purpose" value={purpose} onChange={e => setPurpose(e.target.value)} options={VA_PURPOSES} />
          </Field>
        </div>
      </div>
    </Dialog>
  )
}
