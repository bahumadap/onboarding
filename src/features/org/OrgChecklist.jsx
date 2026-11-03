/* =============================================================
   Configuración — puesta en marcha (/org/setup).

   La puesta en marcha NO es el onboarding regulatorio: el KYB ya se
   aprobó para habilitar la cuenta. Acá solo quedan los pasos de
   configuración, clasificados por tipo. Los opcionales no bloquean
   nada: una empresa puede usar el dashboard sin integrar su API.

   Las herramientas administrativas viven en la portada de configuración.
   ============================================================= */
import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'

import {
  Badge, Callout, Card, CardBody, Checkbox, Metric, Progress, useToast,
} from '../../ui'
import { useDemoState } from '../../state/DemoState'
import {
  ACCOUNT_STATUS, ACCOUNT_STATUS_META, PRODUCT_STATUS, TASK_KIND, TASK_KIND_META,
} from '../../state/statuses'
import './org.css'

/**
 * Construye los pasos con su estado real.
 * `derived` presente ⇒ el sistema resuelve el estado y no se marca a mano.
 */
function buildSteps(state) {
  const accountMeta = ACCOUNT_STATUS_META[state.accountStatus]
  const hasTeam = state.team.length > 1 || state.invitations.length > 0
  const hasVirtual = state.virtualAccounts.length > 0

  return [
    {
      id: 'profile',
      kind: TASK_KIND.REQUIRED,
      title: 'Revisar perfil',
      description: 'Revisa nombre comercial, actividad y países de operación.',
      to: '/org/profile',
      cta: 'Revisar perfil',
    },
    {
      id: 'account',
      kind: TASK_KIND.AUTOMATIC,
      title: 'Cuenta vista',
      description: 'Se habilita automáticamente tras la aprobación.',
      to: '/desk/accounts',
      cta: 'Ver cuentas',
      derived: state.accountStatus === ACCOUNT_STATUS.ACTIVE,
      derivedLabel: `Cuenta vista: ${accountMeta.label.toLowerCase()}`,
      derivedTone: accountMeta.tone,
    },
    {
      id: 'invite',
      kind: TASK_KIND.REQUIRED,
      title: 'Invitar al equipo',
      description: 'Invita a quienes operan, aprueban o consultan.',
      to: '/org/users',
      cta: 'Invitar miembros',
      derived: hasTeam,
      derivedLabel: hasTeam
        ? `${state.team.length} ${state.team.length === 1 ? 'persona' : 'personas'} con acceso`
        : 'Solo tú tienes acceso',
      derivedTone: hasTeam ? 'success' : 'warning',
    },
    {
      id: 'roles',
      kind: TASK_KIND.REQUIRED,
      title: 'Configurar roles y permisos',
      description: 'Asigna permisos y límites de aprobación.',
      to: '/org/approvals',
      cta: 'Configurar permisos',
    },
    {
      id: 'virtual_account',
      kind: TASK_KIND.RECOMMENDED,
      title: 'Crear la primera cuenta virtual',
      description: 'Separa saldos por cliente, proyecto o cobro.',
      to: '/desk/virtual-accounts',
      cta: 'Ir al Merchant Desk',
      derived: hasVirtual,
      derivedLabel: hasVirtual
        ? `${state.virtualAccounts.length} cuentas virtuales`
        : 'Todavía sin cuentas virtuales',
      derivedTone: hasVirtual ? 'success' : 'neutral',
      disabled: state.accountStatus !== ACCOUNT_STATUS.ACTIVE,
      disabledHint: 'Disponible cuando la cuenta vista esté activa.',
    },
    {
      id: 'api',
      kind: TASK_KIND.OPTIONAL,
      title: 'Configurar API',
      description: 'Opcional: conecta tus sistemas a YOL1.',
      to: '/org/api',
      cta: 'Ver credenciales',
    },
    {
      id: 'products',
      kind: TASK_KIND.OPTIONAL,
      title: 'Explorar otros productos',
      description: 'Revisa los requisitos de cada producto.',
      to: '/org/products',
      cta: 'Ver productos',
    },
  ]
}

function TaskRow({ step, done, onToggle }) {
  const kindMeta = TASK_KIND_META[step.kind]
  const isDerived = step.derived !== undefined

  return (
    <li className="org-task">
      <span className={`org-task__marker${done ? ' org-task__marker--done' : ''}`} aria-hidden="true">
        {done ? <Check size={14} strokeWidth={3} /> : <span className="ray-caption">·</span>}
      </span>

      <div>
        <div className="row wrap gap-2">
          <p className="org-task__title grow">{step.title}</p>
          <Badge tone={kindMeta.tone}>{kindMeta.label}</Badge>
        </div>
        <p className="org-task__desc">{step.description}</p>

        <div className="org-task__foot">
          {isDerived
            ? <Badge tone={step.derivedTone} dot>{step.derivedLabel}</Badge>
            : (
              <Checkbox
                label={done ? 'Paso marcado como listo' : 'Marcar como listo'}
                checked={done}
                onChange={e => onToggle(step.id, e.target.checked)}
              />
            )}

          {step.disabled
            ? <span className="org-inline-note">{step.disabledHint}</span>
            : <Link className="btn btn--secondary btn--sm" to={step.to}>{step.cta}</Link>}
        </div>
      </div>
    </li>
  )
}

export default function OrgChecklist() {
  const { state, actions } = useDemoState()
  const toast = useToast()

  const steps = useMemo(() => buildSteps(state), [state])

  const isDone = step => (step.derived !== undefined ? step.derived : Boolean(state.checklistDone[step.id]))

  const stats = useMemo(() => {
    const done = steps.filter(isDone).length
    const blocking = steps.filter(s => s.kind !== TASK_KIND.OPTIONAL && !isDone(s))
    return {
      done,
      total: steps.length,
      percent: Math.round((done / steps.length) * 100),
      blocking: blocking.length,
    }
  }, [steps, state.checklistDone])

  const pendingProducts = Object.entries(state.products)
    .filter(([, status]) => status === PRODUCT_STATUS.REQUESTED || status === PRODUCT_STATUS.IN_REVIEW)
    .length

  return (
    <>
      <header className="page__head">
        <h1 className="page__title">Puesta en marcha</h1>
        <p className="page__lead">
          Configura tu equipo, permisos y cuentas.
        </p>
      </header>

      <Card>
        <CardBody>
          <div className="grid grid-3">
            <Metric
              label="Pasos completados"
              value={`${stats.done} de ${stats.total}`}
              meta={stats.blocking === 0
                ? 'Configuración base completa'
                : `${stats.blocking} ${stats.blocking === 1 ? 'paso pendiente' : 'pasos pendientes'} fuera de los opcionales`}
            />
            <Metric
              label="Cuenta vista"
              value={ACCOUNT_STATUS_META[state.accountStatus].label}
              meta={ACCOUNT_STATUS_META[state.accountStatus].description}
            />
            <Metric
              label="Solicitudes de producto"
              value={String(pendingProducts)}
              meta={pendingProducts === 0 ? 'Sin solicitudes en evaluación' : 'En evaluación por el equipo de riesgo'}
            />
          </div>
          <div className="stack gap-2" style={{ marginTop: 'var(--ray-space-5)' }}>
            <Progress value={stats.percent} tone="brand" label="Avance de la puesta en marcha" />
            <p className="org-inline-note">{stats.percent}% de la configuración sugerida.</p>
          </div>
        </CardBody>
      </Card>

      <section className="section">
        <div className="section__head">
          <div>
            <h2 className="section__title">Pasos de configuración</h2>
            <p className="section__desc">
              Las tareas opcionales no bloquean el uso de la cuenta.
            </p>
          </div>
        </div>

        {stats.blocking === 0 && (
          <Callout tone="success" title="Configuración base lista">
            <p className="ray-body-sm">
              La configuración base está lista. Puedes continuar con las tareas opcionales.
            </p>
          </Callout>
        )}

        <Card style={{ marginTop: 'var(--ray-space-4)' }}>
          <CardBody>
            <ul className="org-tasks">
              {steps.map(step => (
                <TaskRow
                  key={step.id}
                  step={step}
                  done={isDone(step)}
                  onToggle={(id, done) => {
                    actions.toggleChecklistItem(id, done)
                    toast.push({
                      tone: done ? 'success' : 'info',
                      title: done ? 'Paso marcado como listo' : 'Paso marcado como pendiente',
                      description: step.title,
                    })
                  }}
                />
              ))}
            </ul>
          </CardBody>
        </Card>
      </section>

      <p className="section"><Link to="/org">Volver a configuración</Link></p>
    </>
  )
}
