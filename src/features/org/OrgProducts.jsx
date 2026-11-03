/* =============================================================
   Config Org — productos y servicios (/org/products).

   Acá se administran los productos YA aprobados: quién puede usarlos,
   con qué límites y si siguen habilitados. Solicitar un producto nuevo
   y operarlo son cosas del Merchant Desk.
   ============================================================= */
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Settings2, Sparkles } from 'lucide-react'

import {
  Badge, Button, Callout, Card, CardBody, CardFooter, CardHeader, DefinitionList,
  Dialog, EmptyState, Field, Input, MultiSelect, Switch, Table, useToast,
} from '../../ui'
import { useDemoState } from '../../state/DemoState'
import { PRODUCT_STATUS, PRODUCT_STATUS_META } from '../../state/statuses'
import { ADDITIONAL_PRODUCTS, PRODUCT_CATALOG } from '../../mock/products'
import { ROLES, roleLabel } from '../../mock/roles'
import { formatMoney } from '../../mock/accounts'
import './org.css'

/** Habilitado = ya pasó la evaluación y la organización puede configurarlo. */
const ENABLED_STATUSES = [
  PRODUCT_STATUS.ACTIVE,
  PRODUCT_STATUS.PENDING_CONFIGURATION,
  PRODUCT_STATUS.DISABLED,
]

const DEFAULT_SETTINGS = {
  roles: ['org_admin', 'operator'],
  limitPerOperation: 0,
  notifyOnUse: true,
}

export default function OrgProducts() {
  const { state, actions } = useDemoState()
  const toast = useToast()

  const productSettings = state.organization.productSettings ?? {}
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState(DEFAULT_SETTINGS)
  const [limitText, setLimitText] = useState('0')

  const settingsOf = productId => ({ ...DEFAULT_SETTINGS, ...(productSettings[productId] ?? {}) })

  const { enabled, notEnabled } = useMemo(() => {
    const withStatus = PRODUCT_CATALOG.map(p => ({
      ...p,
      status: state.products[p.id] ?? PRODUCT_STATUS.NOT_AVAILABLE,
    }))
    return {
      enabled: withStatus.filter(p => ENABLED_STATUSES.includes(p.status)),
      notEnabled: withStatus.filter(p => !ENABLED_STATUSES.includes(p.status)),
    }
  }, [state.products])

  const openEditor = product => {
    const cfg = settingsOf(product.id)
    setEditing(product)
    setDraft(cfg)
    setLimitText(String(cfg.limitPerOperation ?? 0))
  }

  const saveSettings = () => {
    if (draft.roles.length === 0) {
      toast.push({
        tone: 'danger',
        title: 'Nadie podría usar el producto',
        description: 'Asigna un rol con acceso o suspende el producto.',
      })
      return
    }
    actions.patchOrganization({
      productSettings: { ...productSettings, [editing.id]: draft },
    })
    toast.push({
      tone: 'success',
      title: 'Configuración guardada',
      description: `${editing.name}: ${draft.roles.map(roleLabel).join(', ')}.`,
    })
    setEditing(null)
  }

  const toggleProduct = product => {
    const next = product.status === PRODUCT_STATUS.DISABLED ? PRODUCT_STATUS.ACTIVE : PRODUCT_STATUS.DISABLED
    actions.setProductStatus(product.id, next)
    toast.push({
      tone: next === PRODUCT_STATUS.ACTIVE ? 'success' : 'info',
      title: next === PRODUCT_STATUS.ACTIVE ? 'Producto reactivado' : 'Producto suspendido',
      description: next === PRODUCT_STATUS.ACTIVE
        ? `${product.name} vuelve a estar disponible en el Merchant Desk.`
        : `${product.name} deja de poder usarse. Los saldos y las operaciones cursadas no se tocan.`,
    })
  }

  return (
    <>
      <header className="page__head">
        <h1 className="page__title">Productos y servicios</h1>
        <p className="page__lead">
          Configura los permisos y límites de tus productos aprobados.
        </p>
      </header>

      <Callout
        tone="info"
        title="Nuevos productos"
        action={<Link className="btn btn--secondary btn--sm" to="/desk/products">Ver catálogo</Link>}
      >
        <p className="ray-body-sm">
          Solicita nuevos productos en el catálogo de Merchant Desk.
        </p>
      </Callout>

      {/* ------------------------ productos habilitados ------------------- */}
      <section className="section">
        <div className="section__head">
          <div>
            <h2 className="section__title">Habilitados para la organización</h2>
            <p className="section__desc">Configuración y permisos de cada producto aprobado.</p>
          </div>
        </div>

        {enabled.length === 0 ? (
          <EmptyState
            icon={<Sparkles size={20} aria-hidden="true" />}
            title="Todavía no hay productos habilitados"
            description="La cuenta vista y las cuentas virtuales se habilitan al completar la apertura."
            action={<Link className="btn btn--primary btn--sm" to="/desk/products">Ver catálogo de productos</Link>}
          />
        ) : (
          <div className="grid grid-2">
            {enabled.map(product => {
              const meta = PRODUCT_STATUS_META[product.status]
              const cfg = settingsOf(product.id)
              return (
                <Card key={product.id}>
                  <CardHeader
                    title={product.name}
                    description={product.summary}
                    actions={<Badge tone={meta.tone} dot>{meta.label}</Badge>}
                  />
                  <CardBody>
                    <DefinitionList
                      columns={2}
                      items={[
                        { label: 'Roles con acceso', value: cfg.roles.map(roleLabel).join(', ') || 'Ninguno' },
                        {
                          label: 'Límite por operación',
                          value: cfg.limitPerOperation > 0
                            ? formatMoney(cfg.limitPerOperation, 'CLP')
                            : 'Sin límite propio',
                        },
                        { label: 'Aviso al usarse', value: cfg.notifyOnUse ? 'Sí, al contacto operativo' : 'No' },
                        { label: 'Capacidades', value: product.capabilities?.join(' · ') ?? '—' },
                      ]}
                    />
                  </CardBody>
                  <CardFooter>
                    <div className="row gap-2 wrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Settings2 size={14} aria-hidden="true" />}
                        onClick={() => openEditor(product)}
                      >
                        Configurar
                      </Button>
                      <Button
                        variant={product.status === PRODUCT_STATUS.DISABLED ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => toggleProduct(product)}
                      >
                        {product.status === PRODUCT_STATUS.DISABLED ? 'Reactivar producto' : 'Suspender producto'}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* ----------------------- productos no habilitados ----------------- */}
      <section className="section">
        <div className="section__head">
          <div>
            <h2 className="section__title">Todavía no habilitados</h2>
            <p className="section__desc">
              Cada solicitud requiere evaluación.
            </p>
          </div>
        </div>

        <Card>
          <Table
            caption="Productos no habilitados"
            columns={[
              {
                key: 'name',
                header: 'Producto',
                render: p => (
                  <div>
                    <span className="org-cell-main" style={{ display: 'block' }}>{p.name}</span>
                    <span className="org-cell-sub">{p.summary}</span>
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'Estado',
                render: p => {
                  const meta = PRODUCT_STATUS_META[p.status]
                  return <Badge tone={meta.tone} dot>{meta.label}</Badge>
                },
              },
              {
                key: 'detail',
                header: 'Qué falta',
                render: p => (
                  <span className="org-cell-sub">
                    {p.status === PRODUCT_STATUS.NOT_AVAILABLE
                      ? (p.unavailableReason ?? 'No disponible para esta organización.')
                      : p.reviewDays
                        ? `Evaluación de ${p.reviewDays}`
                        : 'En evaluación.'}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: 'Acciones',
                align: 'right',
                render: p => (
                  <div className="org-cell-actions">
                    {PRODUCT_STATUS_META[p.status].action
                      ? <Link className="btn btn--ghost btn--sm" to="/desk/products">Ver en el catálogo</Link>
                      : <span className="org-inline-note">Sin acciones</span>}
                  </div>
                ),
              },
            ]}
            rows={notEnabled}
            rowKey={p => p.id}
            empty={(
              <CardBody>
                <EmptyState
                  icon={<Sparkles size={20} aria-hidden="true" />}
                  title="Tienes todos los productos del catálogo"
                  description={`Los ${ADDITIONAL_PRODUCTS.length} productos adicionales están habilitados para la organización.`}
                />
              </CardBody>
            )}
          />
        </Card>
      </section>

      <Dialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing ? `Configurar ${editing.name}` : 'Configurar producto'}
        description="Asigna permisos y límites internos."
        footer={(
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={saveSettings}>Guardar configuración</Button>
          </>
        )}
      >
        <div className="stack gap-4">
          <Field label="Roles que pueden usarlo" htmlFor="prod-roles" required>
            <MultiSelect
              id="prod-roles"
              options={ROLES}
              value={draft.roles}
              onChange={roles => setDraft(d => ({ ...d, roles }))}
              placeholder="Selecciona los roles"
              searchPlaceholder="Buscar rol"
            />
          </Field>
          <Field
            label="Límite interno por operación"
            htmlFor="prod-limit"
            hint="Ingresa 0 para aplicar solo el límite general."
          >
            <Input
              id="prod-limit"
              inputMode="numeric"
              value={limitText}
              suffix="CLP"
              onChange={e => {
                const digits = e.target.value.replace(/\D/g, '')
                setLimitText(digits)
                setDraft(d => ({ ...d, limitPerOperation: Number(digits || 0) }))
              }}
            />
          </Field>
          <Switch
            label="Avisar al contacto operativo cada vez que se use"
            checked={draft.notifyOnUse}
            onChange={e => setDraft(d => ({ ...d, notifyOnUse: e.target.checked }))}
          />
          <p className="org-inline-note">
            Se aplica el límite más restrictivo entre el producto y la política general. <Link to="/org/approvals">Revisar permisos y aprobaciones</Link>
          </p>
        </div>
      </Dialog>
    </>
  )
}
