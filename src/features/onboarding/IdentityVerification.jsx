import { ContentDetails } from '../../ui'
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
  approved: { tone: 'success', title: 'Identidad verificada', description: 'Volverás al onboarding.' },
  in_review: { tone: 'info', title: 'Validación en revisión manual', description: 'Consulta el resultado en esta pantalla.' },
  observed: { tone: 'info', title: 'Queda un paso por repetir', description: 'Revisa la observación y repite la captura.' },
  failed: { tone: 'danger', title: 'La validación no se completó', description: 'Vuelve a iniciar la verificación.' },
  load_error: { tone: 'danger', title: 'No se pudo abrir el verificador', description: 'No se envió ningún dato. Revisa tu conexión.' },
}

/** Otros resultados de la demo: son parte de lo que la demo tiene que mostrar. */
const SIMULATIONS = [
  { outcome: 'in_review', label: 'Simular revisión manual', icon: <Clock size={14} aria-hidden="true" /> },
  { outcome: 'observed', label: 'Simular observación', icon: <Camera size={14} aria-hidden="true" /> },
  { outcome: 'failed', label: 'Simular validación fallida', icon: <ShieldCheck size={14} aria-hidden="true" /> },
  { outcome: 'load_error', label: 'Simular error de carga', icon: <Wifi size={14} aria-hidden="true" /> },
]

const REQUISITOS = [
  { id: 'doc', title: 'Documento vigente', description: 'Cédula o pasaporte legible.' },
  { id: 'cam', title: 'Cámara disponible', description: 'No requiere instalar una aplicación.' },
  { id: 'time', title: 'Avance guardado', description: 'Puedes salir y retomar después.' },
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
        title: 'Verifica tu identidad',
        body: 'Verificación simulada con Chaindots. No se toman imágenes.',
        items: CHAINDOTS_STEPS.map((s, i) => ({ title: s.title, description: s.copy, marker: i + 1 })),
      }}
      wide
      topRight={<Badge tone={meta.tone} dot>{meta.label}</Badge>}
    >
      <div className="ob-stack">
        <div className="ob-head">
          <h2 className="flow__title">Verifica tu identidad</h2>
          <p className="flow__lead">
            Verifica tu identidad para continuar con la apertura de la cuenta.
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
              <p className="ray-label" style={{ marginBottom: 'var(--ray-space-3)' }}>Qué necesitas</p>
              <Stepper
                steps={REQUISITOS.map(r => ({ id: r.id, title: r.title, description: r.description, state: 'upcoming' }))}
              />
              <div className="flow__actions">
                <Button variant="brand" onClick={() => startSession('approved')}>Iniciar verificación</Button>
                <Button variant="ghost" onClick={() => navigate('/onboarding')}>Volver al onboarding</Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* --------- retomada tras recargar la página --------- */}
        {resumedWithoutSession && (
          <Callout
            tone="info"
            title="Verificación sin terminar"
            action={<Button size="sm" variant="primary" onClick={() => startSession('approved')}>Retomar verificación</Button>}
          >
            <p className="ray-body-sm">
              Al retomar, comenzarás desde la captura del documento.
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
                  <p className="ob-stage__desc">Resultado simulado · {new Date().toLocaleDateString('es-CL')}.</p>
                </span>
                <Badge tone={meta.tone} dot>{meta.label}</Badge>
              </div>
              <p className="ray-body-sm text-secondary" style={{ marginTop: 'var(--ray-space-3)' }}>
                {status === IDENTITY_STATUS.APPROVED && 'Tu identidad está verificada. Esta etapa del onboarding quedó completa.'}
                {status === IDENTITY_STATUS.IN_REVIEW && 'Tu identidad requiere revisión manual. Consulta el estado aquí.'}
                {status === IDENTITY_STATUS.OBSERVED && 'El proveedor pide repetir un paso de la captura. Inicia una nueva validación cuando puedas.'}
                {status === IDENTITY_STATUS.FAILED && 'La última sesión no pudo confirmar tu identidad. Puedes intentarlo otra vez; si vuelve a fallar, tu ejecutivo puede validarte por otra vía.'}
              </p>
              <div className="flow__actions">
                {status === IDENTITY_STATUS.APPROVED
                  ? <Button variant="primary" icon={<ArrowLeft size={15} aria-hidden="true" />} onClick={() => navigate('/onboarding')}>Volver al onboarding</Button>
                  : <Button variant="primary" onClick={() => startSession('approved')}>Reintentar verificación</Button>}
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
            title="Identidad verificada"
            action={<Button size="sm" variant="primary" onClick={() => navigate('/onboarding')}>Volver ahora</Button>}
          >
            <p className="ray-body-sm">Volverás al onboarding en unos segundos.</p>
          </Callout>
        )}

        {/* --------- controles de simulación --------- */}
        <ContentDetails summary="Probar otros resultados">
          <Card flat level="medium">
          <CardBody>
            <div className="ob-stage__top">
              <span className="grow">
                <p className="ray-label">Otros resultados de la demo</p>
                <p className="ob-stage__desc">
                  Elige un resultado para probar la verificación.
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
                Reiniciar verificación
              </Button>
            </div>
            {currentStep && (
              <p className="flow__footnote">
                <CircleCheck size={12} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 'var(--ray-space-1)' }} />
                Último paso: {CHAINDOTS_STEPS.find(s => s.id === currentStep)?.title ?? currentStep}.
              </p>
            )}
          </CardBody>
        </Card>
        </ContentDetails>

        <p className="flow__footnote">
          Simulación: no se toman imágenes ni se envían datos a Chaindots.
        </p>
      </div>
    </FlowLayout>
  )
}
