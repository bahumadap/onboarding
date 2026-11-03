/* =============================================================
   Config Org — cuentas (/org/accounts).

   Acá se administra la ESTRUCTURA de cuentas: alias, propósito,
   entidad jurídica a la que pertenece, si está habilitada y qué
   roles pueden usarla. La operación (saldos, movimientos, abonos,
   cuentas virtuales) vive en el Merchant Desk y desde acá solo se
   enlaza: Config Org no duplica el Desk.
   ============================================================= */
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Settings2, Wallet } from 'lucide-react'

import {
  Badge, Button, Callout, Card, CardBody, CardHeader, DefinitionList, Drawer,
  EmptyState, Field, Input, MultiSelect, Select, Switch, useToast,
} from '../../ui'
import { useDemoState } from '../../state/DemoState'
import { ACCOUNT_STATUS, ACCOUNT_STATUS_META, PRODUCT_STATUS, PRODUCT_STATUS_META } from '../../state/statuses'
import { ACCOUNTS } from '../../mock/accounts'
import { countryLabel } from '../../mock/countries'
import { ROLES, roleLabel } from '../../mock/roles'
import './org.css'

const PURPOSES = [
  { value: 'operacion', label: 'Operación general' },
  { value: 'recaudacion', label: 'Recaudación' },
  { value: 'pagos', label: 'Pagos a terceros' },
  { value: 'fx', label: 'Operaciones en divisas' },
  { value: 'reserva', label: 'Fondos reservados' },
]

const purposeLabel = value => PURPOSES.find(p => p.value === value)?.label ?? 'Sin definir'

const DEFAULT_SETTINGS = {
  alias: '',
  purpose: 'operacion',
  entityId: '',
  enabled: true,
  roles: ['org_admin', 'operator'],
}

export default function OrgAccounts() {
  const { state, actions } = useDemoState()
  const toast = useToast()
  const org = state.organization

  const settingsMap = org.accountSettings ?? {}
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState(DEFAULT_SETTINGS)

  const entities = org.legalEntities ?? []
  const primaryEntity = entities.find(e => e.role === 'primary') ?? entities[0]

  /** Resuelve la configuración administrativa de una cuenta. */
  const settingsOf = account => ({
    ...DEFAULT_SETTINGS,
    alias: account.label,
    entityId: entities.find(e => e.country === account.country)?.id ?? primaryEntity?.id ?? '',
    purpose: account.kind === 'fx' ? 'fx' : 'operacion',
    ...(settingsMap[account.id] ?? {}),
  })

  /** Estado de aprovisionamiento según el sistema, no según la configuración. */
  const systemStatus = account => {
    if (!account.requiresProduct) {
      const meta = ACCOUNT_STATUS_META[state.accountStatus]
      return { label: meta.label, tone: meta.tone, enabled: state.accountStatus === ACCOUNT_STATUS.ACTIVE }
    }
    const productStatus = state.products[account.requiresProduct] ?? PRODUCT_STATUS.NOT_AVAILABLE
    const meta = PRODUCT_STATUS_META[productStatus]
    return { label: meta.label, tone: meta.tone, enabled: productStatus === PRODUCT_STATUS.ACTIVE }
  }

  const groups = useMemo(() => {
    const base = entities.map(entity => ({ entity, accounts: [] }))
    const orphans = { entity: null, accounts: [] }
    ACCOUNTS.forEach(account => {
      const entityId = settingsOf(account).entityId
      const group = base.find(g => g.entity.id === entityId)
      ;(group ?? orphans).accounts.push(account)
    })
    return [...base, orphans].filter(g => g.accounts.length > 0)
  }, [entities, settingsMap, state.products, state.accountStatus])

  const operatingWithoutEntity = (org.operatingCountries ?? [])
    .filter(code => !entities.some(e => e.country === code))

  const openEditor = account => {
    setEditing(account)
    setDraft(settingsOf(account))
  }

  const saveSettings = () => {
    if (!draft.alias.trim()) {
      toast.push({ tone: 'danger', title: 'Falta el alias', description: 'El alias es el nombre con el que el equipo reconoce la cuenta.' })
      return
    }
    if (draft.roles.length === 0) {
      toast.push({ tone: 'danger', title: 'Nadie podría usar la cuenta', description: 'Asigna al menos un rol con acceso.' })
      return
    }
    actions.patchOrganization({
      accountSettings: {
        ...settingsMap,
        [editing.id]: { ...draft, alias: draft.alias.trim() },
      },
    })
    toast.push({
      tone: 'success',
      title: 'Configuración de la cuenta guardada',
      description: `${draft.alias.trim()} · ${purposeLabel(draft.purpose)}.`,
    })
    setEditing(null)
  }

  const virtualByPurpose = useMemo(() => {
    const map = new Map()
    state.virtualAccounts.forEach(va => {
      map.set(va.purpose, (map.get(va.purpose) ?? 0) + 1)
    })
    return [...map.entries()]
  }, [state.virtualAccounts])

  return (
    <>
      <header className="page__head">
        <h1 className="page__title">Cuentas</h1>
        <p className="page__lead">
          Administra la estructura de cuentas del grupo: a qué entidad jurídica pertenece cada una,
          para qué se usa y quién puede usarla. Para ver saldos y movimientos, entra al Merchant Desk.
        </p>
      </header>

      <Callout
        tone="info"
        title="Configurar no es operar"
        action={<Link className="btn btn--secondary btn--sm" to="/desk">Ir al Merchant Desk</Link>}
      >
        <p className="ray-body-sm">
          Esta pantalla no muestra saldos ni permite mover fondos. Los abonos, egresos y la gestión
          diaria de cuentas virtuales se hacen en el Desk.
        </p>
      </Callout>

      {state.accountStatus !== ACCOUNT_STATUS.ACTIVE && (
        <div style={{ marginTop: 'var(--ray-space-4)' }}>
          <Callout tone="warning" title={`Cuenta vista: ${ACCOUNT_STATUS_META[state.accountStatus].label.toLowerCase()}`}>
            <p className="ray-body-sm">{ACCOUNT_STATUS_META[state.accountStatus].description}</p>
          </Callout>
        </div>
      )}

      {groups.length === 0 ? (
        <section className="section">
          <EmptyState
            icon={<Wallet size={20} aria-hidden="true" />}
            title="Todavía no hay cuentas en la organización"
            description="Las cuentas aparecen cuando el aprovisionamiento termina. Mientras tanto no hay estructura que administrar."
          />
        </section>
      ) : groups.map(group => {
        const entity = group.entity
        const hasPrimary = group.accounts.some(a => a.kind === 'primary')
        return (
          <section className="section" key={entity?.id ?? 'sin-entidad'}>
            <div className="section__head">
              <div>
                <h2 className="section__title">{entity ? entity.legalName : 'Cuentas sin entidad asignada'}</h2>
                <p className="section__desc">
                  {entity
                    ? `Constituida en ${countryLabel(entity.country)} · ${group.accounts.length} ${group.accounts.length === 1 ? 'cuenta' : 'cuentas'}`
                    : 'Asigna estas cuentas a una entidad jurídica para dejar clara su titularidad.'}
                </p>
              </div>
            </div>

            <div className="grid grid-2">
              {group.accounts.map(account => {
                const cfg = settingsOf(account)
                const status = systemStatus(account)
                return (
                  <Card key={account.id}>
                    <CardHeader
                      title={cfg.alias}
                      description={`${account.currency} · ${account.number} · ${countryLabel(account.country)}`}
                      actions={<Badge tone={status.tone} dot>{status.label}</Badge>}
                    />
                    <CardBody>
                      <DefinitionList
                        columns={2}
                        items={[
                          { label: 'Propósito', value: purposeLabel(cfg.purpose) },
                          { label: 'Habilitada para operar', value: cfg.enabled ? 'Sí' : 'No, suspendida por administración' },
                          { label: 'Roles con acceso', value: cfg.roles.map(roleLabel).join(', ') || 'Ninguno' },
                          { label: 'Tipo', value: account.kind === 'primary' ? 'Cuenta vista principal' : 'Cuenta en divisa' },
                        ]}
                      />
                      {!status.enabled && account.requiresProduct && (
                        <p className="org-inline-note" style={{ marginTop: 'var(--ray-space-3)', display: 'block' }}>
                          Depende de un producto que todavía no está activo.{' '}
                          <Link to="/org/products">Ver productos y servicios</Link>
                        </p>
                      )}
                      <div className="row gap-2 wrap" style={{ marginTop: 'var(--ray-space-4)' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Settings2 size={14} aria-hidden="true" />}
                          onClick={() => openEditor(account)}
                        >
                          Configurar cuenta
                        </Button>
                        {status.enabled && (
                          <Link className="btn btn--ghost btn--sm" to={`/desk/accounts/${account.id}`}>
                            Ver en el Desk
                            <ExternalLink size={14} aria-hidden="true" />
                          </Link>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                )
              })}
            </div>

            {hasPrimary && (
              <Card level="medium" style={{ marginTop: 'var(--ray-space-4)' }}>
                <CardHeader
                  title="Cuentas virtuales de esta entidad"
                  description="Subcuentas colgadas de la cuenta vista. Se crean, suspenden y concilian en el Merchant Desk."
                  actions={<Link className="btn btn--secondary btn--sm" to="/desk/virtual-accounts">Administrar en el Desk</Link>}
                />
                <CardBody>
                  {state.virtualAccounts.length === 0 ? (
                    <p className="ray-body-sm text-tertiary">
                      Todavía no hay cuentas virtuales. Se crean desde el Desk, una por usuario final,
                      proyecto o flujo de cobro.
                    </p>
                  ) : (
                    <DefinitionList
                      columns={3}
                      items={[
                        { label: 'Total', value: `${state.virtualAccounts.length} cuentas` },
                        ...virtualByPurpose.map(([purpose, count]) => ({ label: purpose, value: `${count}` })),
                      ]}
                    />
                  )}
                </CardBody>
              </Card>
            )}
          </section>
        )
      })}

      {operatingWithoutEntity.length > 0 && (
        <section className="section">
          <Callout tone="info" title="Operas en países donde no tienes entidad jurídica">
            <p className="ray-body-sm">
              {operatingWithoutEntity.map(countryLabel).join(', ')}. Es válido: puedes recibir y enviar
              fondos desde las cuentas de tus entidades existentes. Si necesitas una cuenta local,
              primero hay que constituir o registrar una entidad en ese país.
            </p>
            <p className="ray-body-sm" style={{ marginTop: 'var(--ray-space-2)' }}>
              <Link to="/org/profile">Administrar entidades jurídicas</Link>
            </p>
          </Callout>
        </section>
      )}

      <Drawer
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing ? `Configurar ${settingsOf(editing).alias}` : 'Configurar cuenta'}
        description="Son datos administrativos. No cambian el estado de aprovisionamiento ni mueven fondos."
        footer={(
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={saveSettings}>Guardar configuración</Button>
          </>
        )}
      >
        <div className="stack gap-4">
          <Field label="Alias" htmlFor="acc-alias" required hint="Cómo reconoce el equipo esta cuenta.">
            <Input
              id="acc-alias"
              value={draft.alias}
              onChange={e => setDraft(d => ({ ...d, alias: e.target.value }))}
            />
          </Field>
          <Field label="Propósito" htmlFor="acc-purpose">
            <Select
              id="acc-purpose"
              options={PURPOSES}
              value={draft.purpose}
              onChange={e => setDraft(d => ({ ...d, purpose: e.target.value }))}
            />
          </Field>
          <Field
            label="Entidad jurídica titular"
            htmlFor="acc-entity"
            hint="Define de qué sociedad del grupo es la cuenta."
          >
            <Select
              id="acc-entity"
              placeholder="Sin asignar"
              options={entities.map(e => ({ value: e.id, label: `${e.legalName} · ${countryLabel(e.country)}` }))}
              value={draft.entityId}
              onChange={e => setDraft(d => ({ ...d, entityId: e.target.value }))}
            />
          </Field>
          <Field
            label="Roles que pueden usarla"
            htmlFor="acc-roles"
            hint="Los límites de monto y la doble aprobación se definen en permisos y aprobaciones."
          >
            <MultiSelect
              id="acc-roles"
              options={ROLES}
              value={draft.roles}
              onChange={roles => setDraft(d => ({ ...d, roles }))}
              placeholder="Selecciona los roles"
              searchPlaceholder="Buscar rol"
            />
          </Field>
          <Switch
            label="Habilitada para operar"
            checked={draft.enabled}
            onChange={e => setDraft(d => ({ ...d, enabled: e.target.checked }))}
          />
          <p className="org-inline-note">
            Suspender una cuenta por administración impide iniciar operaciones nuevas. No afecta los
            saldos ni las operaciones ya cursadas.
          </p>
        </div>
      </Drawer>
    </>
  )
}
