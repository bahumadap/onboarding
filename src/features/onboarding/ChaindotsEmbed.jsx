/* =============================================================
   Mock del flujo embebido de Chaindots (proveedor de verificación
   de identidad).

   >>> AQUÍ ENTRA LA INTEGRACIÓN REAL <<<
   Este componente existe para ser reemplazado completo. Hoy simula
   con temporizadores el ciclo de vida de una sesión de verificación;
   mañana debe montar el SDK o el iframe del proveedor dentro de
   `.ob-embed__stage` y traducir sus eventos a las mismas llamadas:

     onProgress(stepId)   — avanzó de paso dentro de la sesión
     onResult(outcome)    — desenlace: 'approved' | 'in_review'
                            | 'observed' | 'failed' | 'load_error'

   No se asume nada sobre la API de Chaindots: ni nombres de
   métodos, ni formato de tokens, ni endpoints. La pantalla que lo
   usa solo depende del contrato de arriba.
   ============================================================= */
import React, { useEffect, useRef, useState } from 'react'
import { AlertTriangle, CircleAlert, CircleCheck, Clock, ScanFace } from 'lucide-react'

import { Badge, Button, Skeleton, StepsBar } from '../../ui'

/** Pasos simulados de la sesión. El proveedor real define los suyos. */
export const CHAINDOTS_STEPS = [
  {
    id: 'document',
    title: 'Captura del documento',
    copy: 'Coloca el documento completo dentro del marco, sin reflejos.',
  },
  {
    id: 'selfie',
    title: 'Selfie con prueba de vida',
    copy: 'Mira a la cámara y sigue las indicaciones.',
  },
  {
    id: 'match',
    title: 'Validación contra registros',
    copy: 'Comparamos el documento y la selfie.',
  },
]

const RESULT_VIEW = {
  approved: {
    orb: 'done',
    icon: <CircleCheck size={28} aria-hidden="true" />,
    title: 'Identidad verificada',
    copy: 'Verificación simulada completada.',
  },
  in_review: {
    orb: 'warn',
    icon: <Clock size={28} aria-hidden="true" />,
    title: 'Derivada a revisión manual',
    copy: 'Tu identidad requiere revisión manual. Consulta el estado aquí.',
  },
  observed: {
    orb: 'warn',
    icon: <CircleAlert size={28} aria-hidden="true" />,
    title: 'Hay un paso por repetir',
    copy: 'El documento no se lee completo. Repite la captura con buena luz.',
  },
  failed: {
    orb: 'error',
    icon: <AlertTriangle size={28} aria-hidden="true" />,
    title: 'La validación no se completó',
    copy: 'No pudimos verificar tu identidad. Reintenta o contacta a tu ejecutivo.',
  },
  load_error: {
    orb: 'error',
    icon: <AlertTriangle size={28} aria-hidden="true" />,
    title: 'No pudimos cargar el verificador',
    copy: 'No se inició la verificación ni se enviaron datos. Vuelve a intentarlo.',
  },
}

/**
 * @param {object} props
 * @param {string} props.scriptedOutcome  desenlace que debe simular esta sesión
 * @param {(stepId: string) => void} props.onProgress
 * @param {(outcome: string) => void} props.onResult
 * @param {() => void} [props.onRetry]
 */
export default function ChaindotsEmbed({ scriptedOutcome = 'approved', onProgress, onResult, onRetry }) {
  const [phase, setPhase] = useState('loading')  // loading | running | result
  const [step, setStep] = useState(0)
  const timers = useRef([])

  const schedule = (fn, ms) => { timers.current.push(window.setTimeout(fn, ms)) }

  // Limpieza de todos los temporizadores al desmontar.
  useEffect(() => () => {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
  }, [])

  // Arranque de la sesión: carga del verificador y recorrido de los pasos.
  useEffect(() => {
    schedule(() => {
      if (scriptedOutcome === 'load_error') {
        setPhase('result')
        onResult?.('load_error')
        return
      }
      setPhase('running')
      setStep(0)
      onProgress?.(CHAINDOTS_STEPS[0].id)

      CHAINDOTS_STEPS.slice(1).forEach((s, i) => {
        schedule(() => { setStep(i + 1); onProgress?.(s.id) }, 1500 * (i + 1))
      })
      schedule(() => {
        setPhase('result')
        onResult?.(scriptedOutcome)
      }, 1500 * CHAINDOTS_STEPS.length)
    }, 800)
    // Una sesión por montaje: la pantalla remonta el componente con `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const result = phase === 'result' ? RESULT_VIEW[scriptedOutcome] ?? RESULT_VIEW.failed : null

  return (
    <div className="ob-embed">
      <div className="ob-embed__bar">
        <span>Chaindots · Simulación</span>
        {phase === 'loading' && <Badge tone="neutral" dot>Cargando</Badge>}
        {phase === 'running' && <Badge tone="info" dot>Sesión en curso</Badge>}
        {phase === 'result' && (
          <Badge tone={scriptedOutcome === 'approved' ? 'success' : scriptedOutcome === 'in_review' || scriptedOutcome === 'observed' ? 'warning' : 'danger'}>
            Sesión cerrada
          </Badge>
        )}
      </div>

      {phase === 'loading' && (
        <div className="ob-embed__stage" role="status" aria-live="polite">
          <div className="ob-embed__skeleton">
            <Skeleton height={64} radius="var(--ray-radius-pill)" width={64} />
            <Skeleton height={18} width="60%" />
            <Skeleton height={14} width="85%" />
            <Skeleton height={14} width="45%" />
          </div>
          <span className="sr-only">Cargando el verificador de identidad</span>
        </div>
      )}

      {phase === 'running' && (
        <>
          <div className="ob-embed__stage" role="status" aria-live="polite">
            <span className="ob-embed__orb ob-embed__orb--live" aria-hidden="true">
              <ScanFace size={28} />
            </span>
            <p className="ob-embed__headline">{CHAINDOTS_STEPS[step].title}</p>
            <p className="ob-embed__copy">{CHAINDOTS_STEPS[step].copy}</p>
          </div>
          <StepsBar
            total={CHAINDOTS_STEPS.length}
            current={step}
            label={`Paso ${step + 1} de ${CHAINDOTS_STEPS.length} de la verificación`}
          />
          <p className="ray-caption text-tertiary">
            Paso {step + 1} de {CHAINDOTS_STEPS.length}. No cierres esta pantalla mientras avanza.
          </p>
        </>
      )}

      {phase === 'result' && result && (
        <div className="ob-embed__stage" role="status" aria-live="polite">
          <span className={`ob-embed__orb ob-embed__orb--${result.orb}`} aria-hidden="true">{result.icon}</span>
          <p className="ob-embed__headline">{result.title}</p>
          <p className="ob-embed__copy">{result.copy}</p>
          {onRetry && scriptedOutcome !== 'approved' && (
            <Button variant="secondary" size="sm" onClick={onRetry}>Reintentar</Button>
          )}
        </div>
      )}
    </div>
  )
}
