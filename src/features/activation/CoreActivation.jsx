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
    description: 'Identidad del representante y expediente KYB aprobados por Compliance.',
  },
  {
    id: 'provisioning',
    title: 'Aprovisionamiento en el core',
    description: 'Pedimos la apertura de la cuenta vista al proveedor bancario.',
  },
  {
    id: 'validation',
    title: 'Validación del resultado',
    description: 'Confirmamos identificadores, titular y moneda antes de habilitar la cuenta.',
  },
  {
    id: 'enabled',
    title: 'Cuenta vista habilitada',
    description: 'La cuenta queda operativa para abonos, egresos y cartola.',
  },
  {
    id: 'capabilities',
    title: 'Capacidades de cuentas virtuales',
    description: 'Habilitamos la creación de subcuentas por usuario, proyecto o flujo.',
  },
  {
    id: 'desk',
    title: 'Acceso al Merchant Desk',
    description: 'La consola operativa queda disponible para tu equipo.',
  },
]

const CAPABILITIES = [
  {
    id: 'core_account',
    icon: <Building2 size={16} aria-hidden="true" />,
    name: 'Cuenta vista empresarial',
    items: 'Saldo disponible y reservado · Cartola de movimientos · Abonos y egresos',
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
    items: 'Vista de saldos · Transacciones · Catálogo de productos adicionales',
  },
]

/** Lo que mostramos cuando el aprovisionamiento no termina bien. */
const FAILURE_COPY = {
  [ACCOUNT_STATUS.FAILED]: {
    tone: 'danger',
    title: 'El aprovisionamiento no se completó',
    body: 'El proveedor rechazó la apertura por un dato que no cuadra con el expediente. La cuenta no existe y no hay nada operativo todavía.',
    next: 'Operaciones ya tiene el caso. Puedes reintentar desde acá: si vuelve a fallar, tu ejecutivo lo escala al proveedor.',
    code: 'core.provisioning.rejected',
  },
  [ACCOUNT_STATUS.RESTRICTED]: {
    tone: 'warning',
    title: 'La cuenta quedó activa con restricciones',
    body: 'Puedes recibir abonos y revisar la cartola, pero los egresos están bloqueados hasta cerrar un requerimiento de Compliance.',
    next: 'Revisa los requerimientos pendientes en Config Org. Al cerrarlos, la cuenta pasa a operar sin restricciones.',
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
          title: 'El aprovisionamiento falló',
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
        label: 'Validación de identidad',
        meta: IDENTITY_STATUS_META[state.identityStatus],
        ok: state.identityStatus === IDENTITY_STATUS.APPROVED,
      },
      {
        id: 'kyb',
        icon: <ShieldCheck size={16} aria-hidden="true" />,
        label: 'Validación de empresa (KYB)',
        meta: KYB_STATUS_META[state.kybStatus],
        ok: state.kybStatus === KYB_STATUS.APPROVED,
      },
    ]

    return (
      <FlowLayout
        aside={{
          title: 'La cuenta se activa cuando el onboarding está aprobado',
          body: 'El aprovisionamiento arranca solo con identidad y KYB aprobados. Mientras tanto, no hay cuenta ni saldos.',
          items: SEQUENCE.slice(0, 4).map((s, i) => ({ title: s.title, description: s.description, marker: i + 1 })),
        }}
        topRight={<Badge tone={accountMeta.tone} dot>{accountMeta.label}</Badge>}
      >
        <div className="ac-stack">
          <div className="ac-head">
            <h2 className="flow__title">Todavía no podemos activar la cuenta</h2>
            <p className="flow__lead">
              Para abrir la cuenta vista necesitamos las dos validaciones del onboarding aprobadas.
              Esto es lo que falta.
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
            Las dos validaciones avanzan por separado. Puedes completar la que tengas lista sin
            esperar a la otra.
          </p>
        </div>
      </FlowLayout>
    )
  }

  /* ========================= activación en curso ========================= */
  const identifiers = [
    { label: 'Organización', value: state.organization.legalName || state.organization.tradeName || '—' },
    { label: 'País de la cuenta', value: state.organization.countryOfIncorporation ? countryLabel(state.organization.countryOfIncorporation) : '—' },
    { label: 'Número de cuenta', value: deskReady ? '000-12-345678' : 'Se asigna al habilitar la cuenta' },
    { label: 'Moneda', value: deskReady ? 'CLP' : 'Se define con el proveedor' },
  ]

  return (
    <FlowLayout
      wide
      aside={{
        title: deskReady ? 'Tu cuenta vista está habilitada' : 'Estamos abriendo tu cuenta vista',
        body: 'El aprovisionamiento lo ejecuta el proveedor core. Acá ves cada paso y el resultado real, sin adelantar nada.',
        items: SEQUENCE.map((s, i) => ({ title: s.title, description: s.description, marker: i + 1 })),
      }}
      topRight={<Badge tone={accountMeta.tone} dot>{accountMeta.label}</Badge>}
    >
      <div className="ac-stack">
        <div className="ac-head">
          <p className="flow__step-meta">Macroproceso C · Activación de la cuenta</p>
          <h2 className="flow__title">
            {status === ACCOUNT_STATUS.ACTIVE ? 'Tu cuenta vista quedó habilitada'
              : status === ACCOUNT_STATUS.RESTRICTED ? 'Tu cuenta opera con restricciones'
                : status === ACCOUNT_STATUS.FAILED ? 'El aprovisionamiento falló'
                  : status === ACCOUNT_STATUS.PROVISIONING ? 'Estamos abriendo tu cuenta vista'
                    : 'Activa tu cuenta vista empresarial'}
          </h2>
          <p className="flow__lead">
            {status === ACCOUNT_STATUS.NOT_PROVISIONED
              ? 'Las dos validaciones están aprobadas. La apertura de la cuenta comienza automáticamente.'
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
              : <Button size="sm" variant="secondary" onClick={() => navigate('/desk')}>Entrar al Desk</Button>}
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
            action={<Button size="sm" variant="brand" onClick={() => navigate('/desk')}>Abrir el Merchant Desk</Button>}
          >
            <p className="ray-body-sm">
              Habilitada el {state.accountActivatedAt ? new Date(state.accountActivatedAt).toLocaleString('es-CL') : 'momento de la activación'}.
              Las cuentas virtuales quedaron disponibles junto con la cuenta.
            </p>
          </Callout>
        )}

        {/* ------------------------- secuencia -------------------------- */}
        <Card>
          <CardBody>
            <div className="ac-row">
              <span className="grow">
                <p className="ac-title">Secuencia de activación</p>
                <p className="ac-desc">Seis pasos, en orden. El estado que ves es el del proveedor, no una estimación.</p>
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
                    El aprovisionamiento quedó corriendo en el proveedor. Al volver a esta pantalla
                    no reiniciamos el proceso: consultamos el estado.
                  </p>
                  {checking
                    ? (
                      <div role="status" aria-live="polite">
                        <Skeleton height={14} width="70%" />
                        <span className="sr-only">Consultando el estado del aprovisionamiento</span>
                      </div>
                    )
                    : (
                      <div>
                        <Button variant="primary" loading={checking} onClick={checkStatus}>
                          Consultar estado del aprovisionamiento
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
                  <p className="ray-body-sm" role="status">El aprovisionamiento comienza automáticamente al aprobar las validaciones.</p>
                  <Button variant="ghost" onClick={() => navigate('/onboarding')}>Volver al onboarding</Button>
                </div>
              </>
            )}
          </CardBody>
        </Card>

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
                    ? 'Identificadores asignados por el proveedor core.'
                    : 'Los identificadores se asignan recién cuando el proveedor confirma la apertura.'}
                </p>
              </span>
            </div>
            <div style={{ marginTop: 'var(--ray-space-4)' }}>
              <DefinitionList items={identifiers} columns={2} />
            </div>
            {status === ACCOUNT_STATUS.PROVISIONING && (
              <p className="flow__footnote">
                Mientras el aprovisionamiento está en curso no hay saldos ni movimientos: la cuenta
                todavía no existe en el core.
              </p>
            )}
          </CardBody>
        </Card>

        {/* --------------------- capacidades + desk --------------------- */}
        <Card>
          <CardBody>
            <div className="ac-row">
              <span className="grow">
                <p className="ac-title">Qué se habilita con la cuenta</p>
                <p className="ac-desc">
                  {deskReady
                    ? 'Disponible ahora para tu organización.'
                    : 'Se habilita en conjunto cuando la cuenta queda operativa.'}
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
                    Entrar al Merchant Desk
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
        <Card flat level="medium">
          <CardBody>
            <p className="ray-label">Desenlaces del aprovisionamiento</p>
            <p className="ac-desc">
              Abrir una cuenta en el core no siempre sale bien. Estos controles corren la secuencia
              hasta el desenlace que elijas.
            </p>
            <div className="ac-sim" style={{ marginTop: 'var(--ray-space-4)' }}>
              <Button size="sm" variant="secondary" icon={<CircleCheck size={14} aria-hidden="true" />} onClick={() => run(ACCOUNT_STATUS.ACTIVE)}>
                Simular cuenta activa
              </Button>
              <Button size="sm" variant="secondary" icon={<ShieldCheck size={14} aria-hidden="true" />} onClick={() => run(ACCOUNT_STATUS.RESTRICTED)}>
                Simular cuenta restringida
              </Button>
              <Button size="sm" variant="secondary" icon={<AlertTriangle size={14} aria-hidden="true" />} onClick={() => run(ACCOUNT_STATUS.FAILED)}>
                Simular aprovisionamiento fallido
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { clearTimers(); setLiveStep(null); actions.setAccountStatus(ACCOUNT_STATUS.NOT_PROVISIONED) }}>
                Volver a sin aprovisionar
              </Button>
            </div>
          </CardBody>
        </Card>

        <p className="flow__footnote">
          Demo conceptual de YOL1 Enterprise. Los identificadores, saldos y cuentas virtuales son de
          ejemplo y no corresponden a una cuenta real.
        </p>
      </div>
    </FlowLayout>
  )
}
