/* =============================================================
   Config Org — permisos y aprobaciones (/org/approvals).

   La política se edita de verdad: quién inicia, quién aprueba,
   desde qué monto se exige doble aprobación. El resumen en prosa
   existe para que la regla se entienda sin leer la tabla.
   ============================================================= */
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

import {
  Badge, Button, Callout, Card, CardBody, CardFooter, CardHeader, Field, Input,
  MultiSelect, Switch, Table, useToast,
} from '../../ui'
import { useDemoState } from '../../state/DemoState'
import { ROLES, roleLabel } from '../../mock/roles'
import { formatMoney } from '../../mock/accounts'
import './org.css'

const listRoles = values => {
  const labels = values.map(roleLabel)
  if (labels.length === 0) return 'nadie'
  if (labels.length === 1) return labels[0]
  return `${labels.slice(0, -1).join(', ')} y ${labels[labels.length - 1]}`
}

export default function OrgApprovals() {
  const { state, actions } = useDemoState()
  const toast = useToast()
  const policy = state.approvalPolicy

  const [draft, setDraft] = useState({
    dualApprovalEnabled: policy.dualApprovalEnabled,
    dualApprovalThreshold: policy.dualApprovalThreshold,
    initiatorRoles: policy.initiatorRoles,
    approverRoles: policy.approverRoles,
  })
  const [thresholdText, setThresholdText] = useState(String(policy.dualApprovalThreshold))
  const [error, setError] = useState('')

  const dirty = draft.dualApprovalEnabled !== policy.dualApprovalEnabled
    || draft.dualApprovalThreshold !== policy.dualApprovalThreshold
    || draft.initiatorRoles.join() !== policy.initiatorRoles.join()
    || draft.approverRoles.join() !== policy.approverRoles.join()

  const onThresholdChange = value => {
    const digits = value.replace(/\D/g, '')
    setThresholdText(digits)
    setDraft(d => ({ ...d, dualApprovalThreshold: Number(digits || 0) }))
    setError('')
  }

  const save = () => {
    if (draft.initiatorRoles.length === 0) {
      setError('Al menos un rol tiene que poder iniciar operaciones.')
      toast.push({ tone: 'danger', title: 'Nadie podría operar', description: 'Elige al menos un rol que inicie operaciones.' })
      return
    }
    if (draft.approverRoles.length === 0) {
      setError('Al menos un rol tiene que poder aprobar.')
      toast.push({ tone: 'danger', title: 'Nadie podría aprobar', description: 'Elige al menos un rol aprobador.' })
      return
    }
    if (draft.dualApprovalEnabled && draft.dualApprovalThreshold <= 0) {
      setError('Define el monto desde el cual se exige doble aprobación.')
      toast.push({ tone: 'danger', title: 'Falta el umbral', description: 'La doble aprobación necesita un monto de corte.' })
      return
    }
    setError('')
    actions.patchApprovalPolicy(draft)
    toast.push({
      tone: 'success',
      title: 'Política de aprobación actualizada',
      description: draft.dualApprovalEnabled
        ? `Doble aprobación desde ${formatMoney(draft.dualApprovalThreshold, 'CLP')}.`
        : 'La doble aprobación quedó desactivada.',
    })
  }

  const reset = () => {
    setDraft({
      dualApprovalEnabled: policy.dualApprovalEnabled,
      dualApprovalThreshold: policy.dualApprovalThreshold,
      initiatorRoles: policy.initiatorRoles,
      approverRoles: policy.approverRoles,
    })
    setThresholdText(String(policy.dualApprovalThreshold))
    setError('')
    toast.push({ tone: 'info', title: 'Cambios descartados', description: 'Volvimos a la política vigente.' })
  }

  /** Matriz de capacidades derivada de la política guardada. */
  const matrix = useMemo(() => ROLES.map(role => ({
    role: role.value,
    label: role.label,
    initiates: policy.initiatorRoles.includes(role.value),
    approves: policy.approverRoles.includes(role.value),
    people: state.team.filter(m => m.role === role.value && m.status === 'active').length,
  })), [policy, state.team])

  const soloRisk = policy.approverRoles.length === 1 && policy.initiatorRoles.includes(policy.approverRoles[0])

  return (
    <>
      <header className="page__head">
        <h1 className="page__title">Permisos y aprobaciones</h1>
        <p className="page__lead">
          Define quién puede iniciar operaciones, quién las autoriza y desde qué monto hacen falta
          dos personas. La política aplica a todas las cuentas de la organización.
        </p>
      </header>

      {/* ------------------------- resumen en prosa ------------------------- */}
      <Card level="medium">
        <CardHeader title="Política vigente" description="Esto es lo que hoy puede hacer cada quien." />
        <CardBody>
          <div className="org-prose">
            <p>
              Pueden <strong>iniciar</strong> operaciones {listRoles(policy.initiatorRoles)}. Pueden{' '}
              <strong>aprobarlas</strong> {listRoles(policy.approverRoles)}.
            </p>
            <p>
              {policy.dualApprovalEnabled ? (
                <>
                  Toda operación igual o superior a{' '}
                  <strong>{formatMoney(policy.dualApprovalThreshold, 'CLP')}</strong> necesita{' '}
                  <strong>dos personas distintas</strong>: quien la inicia no puede aprobarla. Bajo ese
                  monto, basta con que la inicie un rol autorizado.
                </>
              ) : (
                <>
                  La <strong>doble aprobación está desactivada</strong>: cualquier operación se cursa con
                  una sola autorización, sin importar el monto.
                </>
              )}
            </p>
            <p>
              Los roles sin permiso de iniciar ni de aprobar solo consultan saldos, movimientos y
              reportes en el Merchant Desk.
            </p>
          </div>
        </CardBody>
      </Card>

      {soloRisk && (
        <div style={{ marginTop: 'var(--ray-space-4)' }}>
          <Callout tone="warning" title="El mismo rol inicia y aprueba">
            <p className="ray-body-sm">
              {roleLabel(policy.approverRoles[0])} puede iniciar y aprobar. La doble aprobación igual
              exige personas distintas, pero conviene separar los roles para dejar la traza más clara.
            </p>
          </Callout>
        </div>
      )}

      {/* --------------------------- configuración -------------------------- */}
      <section className="section">
        <Card>
          <CardHeader
            title="Quién inicia y quién aprueba"
            description="Un rol puede estar en ambas listas, pero una misma persona nunca aprueba lo que inició."
          />
          <CardBody>
            <div className="grid grid-2">
              <Field
                label="Roles que pueden iniciar"
                htmlFor="pol-initiators"
                required
                hint="Crean la operación y la dejan pendiente de autorización."
              >
                <MultiSelect
                  id="pol-initiators"
                  options={ROLES}
                  value={draft.initiatorRoles}
                  onChange={initiatorRoles => { setDraft(d => ({ ...d, initiatorRoles })); setError('') }}
                  placeholder="Selecciona los roles"
                  searchPlaceholder="Buscar rol"
                />
              </Field>
              <Field
                label="Roles que pueden aprobar"
                htmlFor="pol-approvers"
                required
                hint="Autorizan operaciones iniciadas por otras personas."
              >
                <MultiSelect
                  id="pol-approvers"
                  options={ROLES}
                  value={draft.approverRoles}
                  onChange={approverRoles => { setDraft(d => ({ ...d, approverRoles })); setError('') }}
                  placeholder="Selecciona los roles"
                  searchPlaceholder="Buscar rol"
                />
              </Field>
            </div>

            <div style={{ marginTop: 'var(--ray-space-5)' }} className="stack gap-4">
              <Switch
                label="Exigir doble aprobación sobre un monto"
                checked={draft.dualApprovalEnabled}
                onChange={e => { setDraft(d => ({ ...d, dualApprovalEnabled: e.target.checked })); setError('') }}
              />
              <Field
                label="Monto desde el cual se exigen dos aprobaciones"
                htmlFor="pol-threshold"
                error={error && draft.dualApprovalEnabled && draft.dualApprovalThreshold <= 0 ? error : undefined}
                hint="Se expresa en pesos chilenos, la moneda de la cuenta vista principal."
              >
                <Input
                  id="pol-threshold"
                  inputMode="numeric"
                  disabled={!draft.dualApprovalEnabled}
                  value={thresholdText}
                  onChange={e => onThresholdChange(e.target.value)}
                  suffix="CLP"
                />
              </Field>
              <p className="org-threshold-preview">
                {draft.dualApprovalEnabled
                  ? `Equivale a ${formatMoney(draft.dualApprovalThreshold, 'CLP')} por operación.`
                  : 'Sin umbral: todas las operaciones se cursan con una sola aprobación.'}
              </p>
              {error && !(draft.dualApprovalEnabled && draft.dualApprovalThreshold <= 0) && (
                <p className="text-danger ray-body-sm">{error}</p>
              )}
            </div>
          </CardBody>
          <CardFooter>
            <div className="row between gap-3 wrap">
              <span className="org-inline-note">
                {dirty ? 'Tienes cambios sin guardar.' : 'La política mostrada es la vigente.'}
              </span>
              <div className="row gap-2">
                <Button variant="ghost" size="sm" disabled={!dirty} onClick={reset}>Descartar</Button>
                <Button variant="primary" size="sm" disabled={!dirty} onClick={save}>Guardar política</Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </section>

      {/* ------------------------------ matriz ------------------------------ */}
      <section className="section">
        <div className="section__head">
          <div>
            <h2 className="section__title">Matriz de autorización</h2>
            <p className="section__desc">Refleja la política guardada, no los cambios sin guardar.</p>
          </div>
          <Link className="btn btn--secondary btn--sm" to="/org/users">Administrar personas</Link>
        </div>

        <Card>
          <Table
            caption="Qué puede hacer cada rol"
            columns={[
              { key: 'label', header: 'Rol', render: r => <span className="org-cell-main">{r.label}</span> },
              {
                key: 'initiates',
                header: 'Inicia operaciones',
                render: r => <Badge tone={r.initiates ? 'success' : 'neutral'}>{r.initiates ? 'Sí' : 'No'}</Badge>,
              },
              {
                key: 'approves',
                header: 'Aprueba operaciones',
                render: r => <Badge tone={r.approves ? 'success' : 'neutral'}>{r.approves ? 'Sí' : 'No'}</Badge>,
              },
              {
                key: 'people',
                header: 'Personas activas',
                align: 'right',
                render: r => <span className="ray-num">{r.people}</span>,
              },
            ]}
            rows={matrix}
            rowKey={r => r.role}
          />
        </Card>
      </section>

      <section className="section">
        <Callout tone="info" title="Dónde se aplica esta política" icon={<ShieldCheck size={16} aria-hidden="true" />}>
          <p className="ray-body-sm">
            Las aprobaciones se piden al momento de operar, en el Merchant Desk. Config Org define la
            regla; el Desk la ejecuta sobre cada movimiento.
          </p>
        </Callout>
      </section>
    </>
  )
}
