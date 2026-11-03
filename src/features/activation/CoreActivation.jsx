import { ContentDetails } from '../../ui'
/* =============================================================
   Macroproceso C — Core Activation.

   Secuencia: KYB aprobado → aprovisionamiento → validación del
   resultado → cuenta habilitada → capacidades de cuentas virtuales
   → acceso al Merchant Desk.

   La puerta entre B y C es `canProvisionAccount(state)`: sin
   identidad y KYB aprobados no se arranca nada. Y si el
   aprovisionamiento falla, esta pantalla no dice en ninguna parte
   que la cuenta está activa.
   ============================================================= */
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle, Building2, CircleCheck, CreditCard, Layers, LayoutDashboard,
  RefreshCcw, ShieldCheck, UserRound,
} from 'lucide-react'

import FlowLayout from '../../shell/FlowLayout'
import {
  Badge, Button, Callout, Card, CardBody, DefinitionList, Divider, Metric,
  Progress, Skeleton, Stepper, useToast,
} from '../../ui'
import { useDemoState } from '../../state/DemoState'
import {
  ACCOUNT_STATUS, ACCOUNT_STATUS_META, IDENTITY_STATUS, IDENTITY_STATUS_META,
  KYB_STATUS, KYB_STATUS_META, canAccessDesk, canProvisionAccount,
} from '../../state/statuses'
import { countryLabel } from '../../mock/countries'
import './activation.css'

/* ------------------------ secuencia de activación ------------------------ */
const SEQUENCE = [
  {
    id: 'kyb',
    title: 'Validaciones aprobadas',
    description: 'Identidad y empresa aprobadas.',
  },
  {
    id: 'provisioning',
    title: 'Apertura de cuenta',
    description: 'Iniciamos la apertura de la cuenta vista.',
  },
  {
    id: 'validation',
    title: 'Validación del resultado',
    description: 'Comprobamos titular, moneda y número de cuenta.',
  },
  {
    id: 'enabled',
    title: 'Cuenta vista habilitada',
    description: 'Cuenta disponible para operar.',
  },
  {
    id: 'capabilities',
    title: 'Cuentas virtuales',
    description: 'Se habilitan las cuentas virtuales.',
  },
  {
    id: 'desk',
    title: 'Acceso al Merchant Desk',
    description: 'Accede a saldos y movimientos.',
  },
]

const CAPABILITIES = [
  {
    id: 'core_account',
    icon: <Building2 size={16} aria-hidden="true" />,
    name: 'Cuenta vista empresarial',
    items: 'Saldo disponible y reservado · Movimientos · Abonos y egresos',
  },
  {
    id: 'virtual_accounts',
    icon: <Layers size={16} aria-hidden="true" />,
    name: 'Cuentas virtuales',
    items: 'Creación y cierre de subcuentas · Asignación de saldos · Conciliación por cuenta',
  },
  {
    id: 'desk',
    icon: <LayoutDashboard size={16} aria-hidden="true" />,
    name: 'Merchant Desk',
    items: 'Saldos · Movimientos · Productos adicionales',
  },
]

/** Lo que mostramos cuando el aprovisionamiento no termina bien. */
const FAILURE_COPY = {
  [ACCOUNT_STATUS.FAILED]: {
    tone: 'danger',
    title: 'No se pudo abrir la cuenta',
    body: 'La apertura falló. La cuenta aún no está habilitada.',
    next: 'Reintenta. Si el error continúa, contacta a tu ejecutivo.',
    code: 'core.provisioning.rejected',
  },
  [ACCOUNT_STATUS.RESTRICTED]: {
    tone: 'warning',
    title: 'Cuenta restringida',
    body: 'Puedes recibir abonos y consultar movimientos. Los egresos están bloqueados.',
    next: 'Revisa los requisitos pendientes en Config Org.',
    code: 'core.account.restricted',
  },
}

export default function CoreActivation() {
  const { state, actions } = useDemoState()
  const navigate = useNavigate()
  const toast = useToast()

  /** Paso en vivo de la corrida simulada. `null` = no hay corrida en curso. */
  const [liveStep, setLiveStep] = useState(null)
  const [checking, setChecking] = useState(false)
  const timers = useRef([])

  const clearTimers = () => { timers.current.forEach(window.clearTimeout); timers.current = [] }
  useEffect(() => clearTimers, [])

  const status = state.accountStatus
  const accountMeta = ACCOUNT_STATUS_META[status]
  const provisionable = canProvisionAccount(state)
  const deskReady = canAccessDesk(state)

  /** Arranca la corrida simulada con el desenlace indicado. */
  const run = (outcome = ACCOUNT_STATUS.ACTIVE) => {
    clearTimers()
    actions.startProvisioning(outcome)
    setLiveStep(1)
    const schedule = (fn, ms) => { timers.current.push(window.setTimeout(fn, ms)) }

    schedule(() => setLiveStep(2), 1400)
    if (outcome === ACCOUNT_STATUS.FAILED) {
      schedule(() => {
        actions.setAccountStatus(ACCOUNT_STATUS.FAILED)
        setLiveStep(null)
        toast?.push({
          tone: 'danger',
          title: 'No se pudo abrir la cuenta',
          description: 'La cuenta no quedó creada. Revisa el detalle en pantalla.',
        })
      }, 2800)
      return
    }
    schedule(() => setLiveStep(3), 2800)
    schedule(() => setLiveStep(4), 4000)
    schedule(() => {
      actions.setAccountStatus(outcome)
      setLiveStep(null)
      toast?.push({
        tone: outcome === ACCOUNT_STATUS.ACTIVE ? 'success' : 'info',
        title: outcome === ACCOUNT_STATUS.ACTIVE ? 'Cuenta vista habilitada' : 'Cuenta habilitada con restricciones',
        description: outcome === ACCOUNT_STATUS.ACTIVE
          ? 'Ya puedes entrar al Merchant Desk.'
          : 'Los egresos quedan bloqueados hasta cerrar los requerimientos.',
      })
    }, 5200)
  }

  /** Consulta el estado cuando se recargó la página en medio del proceso. */
  const checkStatus = () => {
    setChecking(true)
    timers.current.push(window.setTimeout(() => {
      setChecking(false)
      toast?.push({ tone: 'info', title: 'Consulta simulada', description: 'El proceso actualiza automáticamente su resultado al terminar.' })
    }, 1300))
  }

  /* --------- estado de cada paso de la secuencia --------- */
  const stepState = (index) => {
    if (status === ACCOUNT_STATUS.ACTIVE || status === ACCOUNT_STATUS.RESTRICTED) return 'done'
    if (status === ACCOUNT_STATUS.FAILED) return index <= 1 ? 'done' : 'upcoming'
    if (status === ACCOUNT_STATUS.PROVISIONING) {
      const current = liveStep ?? 1
      if (index < current) return 'done'
      if (index === current) return 'active'
      return 'upcoming'
    }
    return index === 0 ? 'done' : 'upcoming'
  }

  const steps = SEQUENCE.map((s, i) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    state: stepState(i),
    children: stepState(i) === 'active'
      ? <p className="ray-caption text-tertiary" role="status" aria-live="polite">En curso…</p>
      : null,
  }))

  const failure = FAILURE_COPY[status]

  /* ===================== puerta: faltan validaciones ===================== */
  if (!provisionable && status === ACCOUNT_STATUS.NOT_PROVISIONED) {
    const checks = [
      {
        id: 'identity',
        icon: <UserRound size={16} aria-hidden="true" />,
        label: 'Verificación de identidad',
        meta: IDENTITY_STATUS_META[state.identityStatus],
        ok: state.identityStatus === IDENTITY_STATUS.APPROVED,
      },
      {
        id: 'kyb',
        icon: <ShieldCheck size={16} aria-hidden="true" />,
        label: 'Verificación de empresa (KYB)',
        meta: KYB_STATUS_META[state.kybStatus],
        ok: state.kybStatus === KYB_STATUS.APPROVED,
      },
    ]

    return (
      <FlowLayout
        aside={{
          title: 'Completa las verificaciones',
          body: 'La apertura requiere identidad y empresa aprobadas.',
          items: SEQUENCE.slice(0, 4).map((s, i) => ({ title: s.title, description: s.description, marker: i + 1 })),
        }}
        topRight={<Badge tone={accountMeta.tone} dot>{accountMeta.label}</Badge>}
      >
        <div className="ac-stack">
          <div className="ac-head">
            <h2 className="flow__title">Faltan verificaciones</h2>
            <p className="flow__lead">
              Completa las verificaciones pendientes para abrir la cuenta.
            </p>
          </div>

          <div className="ac-checks">
            {checks.map(c => (
              <div className="ac-check" key={c.id}>
                <span className="ac-row">
                  <span className={`ac-row__icon${c.ok ? ' ac-row__icon--ok' : ''}`} aria-hidden="true">{c.icon}</span>
                  <span>
                    <span className="ac-title" style={{ display: 'block' }}>{c.label}</span>
                    <span className="ac-desc">{c.ok ? 'Aprobada' : 'Pendiente de aprobación'}</span>
                  </span>
                </span>
                <Badge tone={c.meta.tone} dot>{c.meta.label}</Badge>
              </div>
            ))}
          </div>

          <div className="flow__actions">
            <Button variant="primary" onClick={() => navigate('/onboarding')}>Volver al onboarding</Button>
          </div>

          <p className="flow__footnote">
            Puedes completar las verificaciones en cualquier orden.
          </p>
        </div>
      </FlowLayout>
    )
  }

  /* ========================= activación en curso ========================= */
  const identifiers = [
    { label: 'Organización', value: state.organization.legalName || state.organization.tradeName || '—' },
    { label: 'País de la cuenta', value: state.organization.countryOfIncorporation ? countryLabel(state.organization.countryOfIncorporation) : '—' },
    { label: 'Número de cuenta', value: deskReady ? '000-12-345678' : 'Pendiente de apertura' },
    { label: 'Moneda', value: deskReady ? 'CLP' : 'Pendiente de confirmación' },
  ]

  return (
    <FlowLayout
      wide
      aside={{
        title: 'Tu cuenta vista empresarial',
        body: 'Consulta el estado de apertura de tu cuenta.',
        items: SEQUENCE.map((s, i) => ({ title: s.title, description: s.description, marker: i + 1 })),
      }}
      topRight={<Badge tone={accountMeta.tone} dot>{accountMeta.label}</Badge>}
    >
      <div className="ac-stack">
        <div className="ac-head">
          <h2 className="flow__title">
            {status === ACCOUNT_STATUS.ACTIVE ? 'Cuenta vista activa'
              : status === ACCOUNT_STATUS.RESTRICTED ? 'Cuenta restringida'
                : status === ACCOUNT_STATUS.FAILED ? 'No se pudo abrir la cuenta'
                  : status === ACCOUNT_STATUS.PROVISIONING ? 'Estamos abriendo tu cuenta'
                    : 'Activación de cuenta vista'}
          </h2>
          <p className="flow__lead">
            {status === ACCOUNT_STATUS.NOT_PROVISIONED
              ? 'Verificaciones aprobadas. La apertura comienza automáticamente.'
              : accountMeta.description}
          </p>
        </div>

        {/* ------------------------- desenlaces ------------------------- */}
        {failure && (
          <Callout
            tone={failure.tone}
            title={failure.title}
            action={status === ACCOUNT_STATUS.FAILED
              ? <Button size="sm" variant="primary" icon={<RefreshCcw size={14} aria-hidden="true" />} onClick={() => run(ACCOUNT_STATUS.ACTIVE)}>Reintentar</Button>
              : <Button size="sm" variant="secondary" onClick={() => navigate('/desk')}>Ir a Merchant Desk</Button>}
          >
            <p className="ray-body-sm">{failure.body}</p>
            <p className="ray-body-sm" style={{ marginTop: 'var(--ray-space-2)' }}>{failure.next}</p>
            <p className="ac-code" style={{ marginTop: 'var(--ray-space-2)' }}>Referencia: {failure.code}</p>
          </Callout>
        )}

        {status === ACCOUNT_STATUS.ACTIVE && (
          <Callout
            tone="success"
            title="Cuenta vista activa"
            action={<Button size="sm" variant="brand" onClick={() => navigate('/desk')}>Ir a Merchant Desk</Button>}
          >
            <p className="ray-body-sm">
              Habilitada el {state.accountActivatedAt ? new Date(state.accountActivatedAt).toLocaleString('es-CL') : 'momento de la activación'}.
              También tienes disponibles las cuentas virtuales.
            </p>
          </Callout>
        )}

        {/* ------------------------- secuencia -------------------------- */}
        <ContentDetails summary="Etapas de apertura">
          <Card>
          <CardBody>
            <div className="ac-row">
              <span className="grow">
                <p className="ac-title">Secuencia de activación</p>
                <p className="ac-desc">Etapas de la apertura simulada.</p>
              </span>
              <Badge tone={accountMeta.tone}>{accountMeta.label}</Badge>
            </div>

            <div style={{ margin: 'var(--ray-space-4) 0' }}>
              <Progress
                value={status === ACCOUNT_STATUS.ACTIVE || status === ACCOUNT_STATUS.RESTRICTED
                  ? 100
                  : status === ACCOUNT_STATUS.PROVISIONING
                    ? Math.round(((liveStep ?? 1) / SEQUENCE.length) * 100)
                    : status === ACCOUNT_STATUS.FAILED ? 30 : 16}
                tone="brand"
                label="Avance de la activación"
              />
            </div>

            <Stepper steps={steps} />

            {status === ACCOUNT_STATUS.PROVISIONING && liveStep === null && (
              <>
                <Divider />
                <div className="ac-stack" style={{ marginTop: 'var(--ray-space-4)' }}>
                  <p className="ray-body-sm text-secondary">
                    La apertura sigue en curso aunque salgas de esta pantalla.
                  </p>
                  {checking
                    ? (
                      <div role="status" aria-live="polite">
                        <Skeleton height={14} width="70%" />
                        <span className="sr-only">Consultando el estado de apertura</span>
                      </div>
                    )
                    : (
                      <div>
                        <Button variant="primary" loading={checking} onClick={checkStatus}>
                          Consultar estado
                        </Button>
                      </div>
                    )}
                </div>
              </>
            )}

            {status === ACCOUNT_STATUS.NOT_PROVISIONED && (
              <>
                <Divider />
                <div className="flow__actions">
                  <p className="ray-body-sm" role="status">La apertura comienza automáticamente.</p>
                  <Button variant="ghost" onClick={() => navigate('/onboarding')}>Volver al onboarding</Button>
                </div>
              </>
            )}
          </CardBody>
        </Card>
        </ContentDetails>

        {/* ------------------------ la cuenta -------------------------- */}
        <Card level={deskReady ? 'medium' : 'low'}>
          <CardBody>
            <div className="ac-row">
              <span className={`ac-row__icon${deskReady ? ' ac-row__icon--ok' : status === ACCOUNT_STATUS.FAILED ? ' ac-row__icon--error' : ''}`} aria-hidden="true">
                <CreditCard size={16} />
              </span>
              <span className="grow">
                <p className="ac-title">Cuenta vista empresarial</p>
                <p className="ac-desc">
                  {deskReady
                    ? 'Datos de ejemplo de la cuenta.'
                    : 'Los datos estarán disponibles cuando la cuenta esté activa.'}
                </p>
              </span>
            </div>
            <div style={{ marginTop: 'var(--ray-space-4)' }}>
              <DefinitionList items={identifiers} columns={2} />
            </div>
            {status === ACCOUNT_STATUS.PROVISIONING && (
              <p className="flow__footnote">
                La cuenta aún no está activa: no tiene saldos ni movimientos disponibles.
              </p>
            )}
          </CardBody>
        </Card>

        {/* --------------------- capacidades + desk --------------------- */}
        <Card>
          <CardBody>
            <div className="ac-row">
              <span className="grow">
                <p className="ac-title">Qué incluye la cuenta</p>
                <p className="ac-desc">
                  {deskReady
                    ? 'Servicios incluidos.'
                    : 'Disponibles al activar la cuenta.'}
                </p>
              </span>
            </div>

            <div className="ac-caps" style={{ marginTop: 'var(--ray-space-4)' }}>
              {CAPABILITIES.map(cap => (
                <div className="ac-cap" key={cap.id}>
                  <span className={`ac-row__icon${deskReady ? ' ac-row__icon--ok' : ''}`} aria-hidden="true">{cap.icon}</span>
                  <span className="grow">
                    <span className="ac-cap__name" style={{ display: 'block' }}>{cap.name}</span>
                    <span className="ac-cap__list">{cap.items}</span>
                  </span>
                  <Badge tone={deskReady ? 'success' : 'neutral'}>
                    {deskReady
                      ? (status === ACCOUNT_STATUS.RESTRICTED && cap.id === 'core_account' ? 'Con restricciones' : 'Disponible')
                      : 'Pendiente'}
                  </Badge>
                </div>
              ))}
            </div>

            {deskReady && (
              <>
                <Divider />
                <div className="ac-grid ac-grid--2" style={{ marginTop: 'var(--ray-space-4)' }}>
                  <Metric label="Cuentas virtuales de ejemplo" value={state.virtualAccounts.length} meta="Creadas junto con la cuenta vista" />
                  <Metric
                    label="Egresos"
                    value={status === ACCOUNT_STATUS.RESTRICTED ? 'Bloqueados' : 'Habilitados'}
                    meta={status === ACCOUNT_STATUS.RESTRICTED ? 'Se liberan al cerrar los requerimientos' : 'Con doble aprobación según la política'}
                  />
                </div>
                <div className="flow__actions">
                  <Button variant="brand" icon={<LayoutDashboard size={15} aria-hidden="true" />} onClick={() => navigate('/desk')}>
                    Ir a Merchant Desk
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/onboarding')}>Ver el onboarding</Button>
                </div>
              </>
            )}

            {!deskReady && (
              <p className="flow__footnote">
                <AlertTriangle size={12} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 'var(--ray-space-1)' }} />
                El acceso al Merchant Desk se abre solo con la cuenta operativa.
              </p>
            )}
          </CardBody>
        </Card>

        {/* ------------------------ simulación -------------------------- */}
        <ContentDetails summary="Probar otros resultados">
          <Card flat level="medium">
          <CardBody>
            <p className="ray-label">Otros resultados de la demo</p>
            <p className="ac-desc">
              Elige un resultado para probar la apertura.
            </p>
            <div className="ac-sim" style={{ marginTop: 'var(--ray-space-4)' }}>
              <Button size="sm" variant="secondary" icon={<CircleCheck size={14} aria-hidden="true" />} onClick={() => run(ACCOUNT_STATUS.ACTIVE)}>
                Simular cuenta activa
              </Button>
              <Button size="sm" variant="secondary" icon={<ShieldCheck size={14} aria-hidden="true" />} onClick={() => run(ACCOUNT_STATUS.RESTRICTED)}>
                Simular cuenta restringida
              </Button>
              <Button size="sm" variant="secondary" icon={<AlertTriangle size={14} aria-hidden="true" />} onClick={() => run(ACCOUNT_STATUS.FAILED)}>
                Simular error de apertura
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { clearTimers(); setLiveStep(null); actions.setAccountStatus(ACCOUNT_STATUS.NOT_PROVISIONED) }}>
                Reiniciar apertura
              </Button>
            </div>
          </CardBody>
        </Card>
        </ContentDetails>

        <p className="flow__footnote">
          Demo conceptual de YOL1 Enterprise. Los identificadores, saldos y cuentas virtuales son de
          ejemplo y no corresponden a una cuenta real.
        </p>
      </div>
    </FlowLayout>
  )
}
