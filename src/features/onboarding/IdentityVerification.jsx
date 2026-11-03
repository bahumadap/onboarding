/* =============================================================
   Macroproceso B1 — validación de identidad del usuario.

   La verificación la hace Chaindots con integración embebida. Acá
   solo orquestamos: abrimos la sesión, mostramos en qué paso va y
   traducimos el desenlace del proveedor a IDENTITY_STATUS. El
   componente del proveedor es un mock reemplazable
   (ChaindotsEmbed.jsx).
   ============================================================= */
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Camera, CircleCheck, Clock, IdCard, ShieldCheck, Wifi,
} from 'lucide-react'

import FlowLayout from '../../shell/FlowLayout'
import {
  Badge, Button, Callout, Card, CardBody, Divider, Stepper, useToast,
} from '../../ui'
import { useDemoState } from '../../state/DemoState'
import { IDENTITY_STATUS, IDENTITY_STATUS_META } from '../../state/statuses'
import ChaindotsEmbed, { CHAINDOTS_STEPS } from './ChaindotsEmbed'
import './onboarding.css'

/** Desenlace del proveedor → dimensión de estado de la demo. */
const OUTCOME_TO_STATUS = {
  approved: IDENTITY_STATUS.APPROVED,
  in_review: IDENTITY_STATUS.IN_REVIEW,
  observed: IDENTITY_STATUS.OBSERVED,
  failed: IDENTITY_STATUS.FAILED,
  load_error: IDENTITY_STATUS.FAILED,
}

const OUTCOME_TOAST = {
  approved: { tone: 'success', title: 'Identidad verificada', description: 'Te llevamos de vuelta al onboarding.' },
  in_review: { tone: 'info', title: 'Validación en revisión manual', description: 'Te avisamos por correo cuando tengamos el resultado.' },
  observed: { tone: 'info', title: 'Queda un paso por repetir', description: 'Revisa la indicación del proveedor y vuelve a intentarlo.' },
  failed: { tone: 'danger', title: 'La validación no se completó', description: 'Puedes intentarlo de nuevo desde esta misma pantalla.' },
  load_error: { tone: 'danger', title: 'No se pudo abrir el verificador', description: 'No se envió ningún dato. Revisa tu conexión.' },
}

/** Desenlaces alternativos: son parte de lo que la demo tiene que mostrar. */
const SIMULATIONS = [
  { outcome: 'in_review', label: 'Simular revisión manual', icon: <Clock size={14} aria-hidden="true" /> },
  { outcome: 'observed', label: 'Simular observación', icon: <Camera size={14} aria-hidden="true" /> },
  { outcome: 'failed', label: 'Simular validación fallida', icon: <ShieldCheck size={14} aria-hidden="true" /> },
  { outcome: 'load_error', label: 'Simular error de carga', icon: <Wifi size={14} aria-hidden="true" /> },
]

const REQUISITOS = [
  { id: 'doc', title: 'Un documento vigente', description: 'Cédula de identidad o pasaporte, con los datos legibles.' },
  { id: 'cam', title: 'Cámara disponible', description: 'La captura se hace en este mismo dispositivo, sin instalar nada.' },
  { id: 'time', title: 'Dos o tres minutos', description: 'Si la interrumpes, puedes retomarla más tarde desde el hub.' },
]

export default function IdentityVerification() {
  const { state, actions } = useDemoState()
  const navigate = useNavigate()
  const toast = useToast()

  /** Sesión del verificador. `null` = no hay sesión abierta en esta pantalla. */
  const [session, setSession] = useState(null)
  const [currentStep, setCurrentStep] = useState(null)
  const returnTimer = useRef(null)

  useEffect(() => () => { if (returnTimer.current) window.clearTimeout(returnTimer.current) }, [])

  const status = state.identityStatus
  const meta = IDENTITY_STATUS_META[status]

  const startSession = (outcome) => {
    if (returnTimer.current) window.clearTimeout(returnTimer.current)
    setCurrentStep(null)
    setSession({ id: `cds_${Date.now()}`, outcome })
    actions.setIdentityStatus(IDENTITY_STATUS.IN_PROGRESS)
  }

  const handleResult = (outcome) => {
    actions.setIdentityStatus(OUTCOME_TO_STATUS[outcome] ?? IDENTITY_STATUS.FAILED)
    const t = OUTCOME_TOAST[outcome]
    if (t) toast?.push(t)
    if (outcome === 'approved') {
      returnTimer.current = window.setTimeout(() => navigate('/onboarding'), 2400)
    }
  }

  const resumedWithoutSession = status === IDENTITY_STATUS.IN_PROGRESS && !session
  const isTerminal = [
    IDENTITY_STATUS.APPROVED, IDENTITY_STATUS.IN_REVIEW,
    IDENTITY_STATUS.OBSERVED, IDENTITY_STATUS.FAILED,
  ].includes(status)

  return (
    <FlowLayout
      aside={{
        title: 'Verificamos quién abre la cuenta',
        body: 'La validación de identidad la realiza Chaindots dentro de esta misma pantalla. YOL1 no almacena las imágenes de la captura.',
        items: CHAINDOTS_STEPS.map((s, i) => ({ title: s.title, description: s.copy, marker: i + 1 })),
      }}
      wide
      topRight={<Badge tone={meta.tone} dot>{meta.label}</Badge>}
    >
      <div className="ob-stack">
        <div className="ob-head">
          <h2 className="flow__title">Valida tu identidad</h2>
          <p className="flow__lead">
            Necesitamos confirmar que eres quien dice ser antes de habilitar la cuenta de la
            empresa. El proceso corre dentro de YOL1 y toma pocos minutos.
          </p>
        </div>

        {/* --------- sesión abierta: el verificador manda --------- */}
        {session && (
          <ChaindotsEmbed
            key={session.id}
            scriptedOutcome={session.outcome}
            onProgress={setCurrentStep}
            onResult={handleResult}
            onRetry={() => startSession('approved')}
          />
        )}

        {/* --------- sin sesión y sin empezar: requisitos --------- */}
        {!session && status === IDENTITY_STATUS.NOT_STARTED && (
          <Card>
            <CardBody>
              <p className="ray-label" style={{ marginBottom: 'var(--ray-space-3)' }}>Antes de empezar, ten a mano</p>
              <Stepper
                steps={REQUISITOS.map(r => ({ id: r.id, title: r.title, description: r.description, state: 'upcoming' }))}
              />
              <div className="flow__actions">
                <Button variant="brand" onClick={() => startSession('approved')}>Iniciar validación</Button>
                <Button variant="ghost" onClick={() => navigate('/onboarding')}>Volver al onboarding</Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* --------- retomada tras recargar la página --------- */}
        {resumedWithoutSession && (
          <Callout
            tone="info"
            title="Dejaste la validación a medio camino"
            action={<Button size="sm" variant="primary" onClick={() => startSession('approved')}>Retomar validación</Button>}
          >
            <p className="ray-body-sm">
              La sesión anterior con el proveedor se cerró al salir de la pantalla. Al retomar se
              abre una nueva y empiezas desde la captura del documento.
            </p>
          </Callout>
        )}

        {/* --------- resultado persistido (sin sesión abierta) --------- */}
        {!session && isTerminal && (
          <Card level={status === IDENTITY_STATUS.APPROVED ? 'medium' : 'low'}>
            <CardBody>
              <div className="ob-stage__top">
                <span className="grow">
                  <p className="ob-stage__name">Resultado de la validación</p>
                  <p className="ob-stage__desc">Registrado el {new Date().toLocaleDateString('es-CL')} por Chaindots.</p>
                </span>
                <Badge tone={meta.tone} dot>{meta.label}</Badge>
              </div>
              <p className="ray-body-sm text-secondary" style={{ marginTop: 'var(--ray-space-3)' }}>
                {status === IDENTITY_STATUS.APPROVED && 'Tu identidad está verificada. Esta etapa del onboarding quedó completa.'}
                {status === IDENTITY_STATUS.IN_REVIEW && 'Tu caso está en revisión manual del proveedor. No hay nada más que hacer por ahora: te avisamos por correo.'}
                {status === IDENTITY_STATUS.OBSERVED && 'El proveedor pide repetir un paso de la captura. Inicia una nueva validación cuando puedas.'}
                {status === IDENTITY_STATUS.FAILED && 'La última sesión no pudo confirmar tu identidad. Puedes intentarlo otra vez; si vuelve a fallar, tu ejecutivo puede validarte por otra vía.'}
              </p>
              <div className="flow__actions">
                {status === IDENTITY_STATUS.APPROVED
                  ? <Button variant="primary" icon={<ArrowLeft size={15} aria-hidden="true" />} onClick={() => navigate('/onboarding')}>Volver al onboarding</Button>
                  : <Button variant="primary" onClick={() => startSession('approved')}>Iniciar una nueva validación</Button>}
                {status !== IDENTITY_STATUS.APPROVED && (
                  <Button variant="ghost" onClick={() => navigate('/onboarding')}>Volver al onboarding</Button>
                )}
              </div>
            </CardBody>
          </Card>
        )}

        {/* --------- vuelta al hub tras aprobación --------- */}
        {session && status === IDENTITY_STATUS.APPROVED && (
          <Callout
            tone="success"
            title="Listo, tu identidad quedó verificada"
            action={<Button size="sm" variant="primary" onClick={() => navigate('/onboarding')}>Volver ahora</Button>}
          >
            <p className="ray-body-sm">Te llevamos de vuelta al onboarding en unos segundos.</p>
          </Callout>
        )}

        {/* --------- controles de simulación --------- */}
        <Card flat level="medium">
          <CardBody>
            <div className="ob-stage__top">
              <span className="grow">
                <p className="ray-label">Desenlaces alternativos</p>
                <p className="ob-stage__desc">
                  La verificación de identidad no siempre termina aprobada. Estos controles abren una
                  sesión que termina en el desenlace que elijas.
                </p>
              </span>
            </div>
            <Divider />
            <div className="ob-sim" style={{ marginTop: 'var(--ray-space-4)' }}>
              {SIMULATIONS.map(s => (
                <Button key={s.outcome} size="sm" variant="secondary" icon={s.icon} onClick={() => startSession(s.outcome)}>
                  {s.label}
                </Button>
              ))}
              <Button
                size="sm"
                variant="ghost"
                icon={<IdCard size={14} aria-hidden="true" />}
                onClick={() => {
                  if (returnTimer.current) window.clearTimeout(returnTimer.current)
                  setSession(null)
                  setCurrentStep(null)
                  actions.setIdentityStatus(IDENTITY_STATUS.NOT_STARTED)
                }}
              >
                Reiniciar a no iniciada
              </Button>
            </div>
            {currentStep && (
              <p className="flow__footnote">
                <CircleCheck size={12} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 'var(--ray-space-1)' }} />
                Último evento recibido del proveedor: {CHAINDOTS_STEPS.find(s => s.id === currentStep)?.title ?? currentStep}.
              </p>
            )}
          </CardBody>
        </Card>

        <p className="flow__footnote">
          Demo conceptual: las capturas son simuladas y no se envía información a ningún proveedor.
        </p>
      </div>
    </FlowLayout>
  )
}
