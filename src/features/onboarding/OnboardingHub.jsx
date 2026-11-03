/* =============================================================
   Macroproceso B — punto de entrada del onboarding empresarial.

   Dos etapas con progreso independiente: validación de identidad
   (B1) y validación de empresa / KYB (B2). Ninguna bloquea a la
   otra; se pueden completar en cualquier orden y retomar más
   tarde, porque todo el progreso vive en el estado persistido.
   ============================================================= */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle, BadgeCheck, Building2, CircleCheck, ShieldCheck, UserRound,
} from 'lucide-react'

import FlowLayout from '../../shell/FlowLayout'
import {
  Badge, Button, Callout, Card, CardBody, DefinitionList, Progress,
} from '../../ui'
import { useDemoState, useOnboardingProgress } from '../../state/DemoState'
import {
  IDENTITY_STATUS, IDENTITY_STATUS_META, KYB_STATUS, KYB_STATUS_META,
  canAccessDesk, canProvisionAccount,
} from '../../state/statuses'
import { KYB_SECTIONS } from '../../mock/compliance'
import { countryLabel, industryLabel } from '../../mock/countries'
import './onboarding.css'

/* ---------------------- etapa 1 · identidad ---------------------- */
const IDENTITY_ACTION = {
  [IDENTITY_STATUS.NOT_STARTED]: 'Empezar validación',
  [IDENTITY_STATUS.IN_PROGRESS]: 'Retomar validación',
  [IDENTITY_STATUS.IN_REVIEW]: 'Ver estado',
  [IDENTITY_STATUS.OBSERVED]: 'Revisar observación',
  [IDENTITY_STATUS.APPROVED]: 'Ver resultado',
  [IDENTITY_STATUS.FAILED]: 'Reintentar validación',
}

const IDENTITY_NOTE = {
  [IDENTITY_STATUS.NOT_STARTED]: 'Toma unos minutos. Necesitas tu cédula o pasaporte a mano.',
  [IDENTITY_STATUS.IN_PROGRESS]: 'Dejaste la validación a medio camino. Puedes seguir donde quedaste.',
  [IDENTITY_STATUS.IN_REVIEW]: 'El proveedor derivó tu caso a revisión manual. Te avisamos por correo.',
  [IDENTITY_STATUS.OBSERVED]: 'El proveedor necesita que repitas un paso de la captura.',
  [IDENTITY_STATUS.APPROVED]: 'Tu identidad quedó verificada.',
  [IDENTITY_STATUS.FAILED]: 'La validación no pudo completarse. Puedes intentarlo otra vez.',
}

const IDENTITY_PERCENT = {
  [IDENTITY_STATUS.NOT_STARTED]: 0,
  [IDENTITY_STATUS.IN_PROGRESS]: 45,
  [IDENTITY_STATUS.IN_REVIEW]: 80,
  [IDENTITY_STATUS.OBSERVED]: 60,
  [IDENTITY_STATUS.APPROVED]: 100,
  [IDENTITY_STATUS.FAILED]: 30,
}

/* ------------------------ etapa 2 · KYB -------------------------- */
const KYB_ACTION = {
  [KYB_STATUS.DRAFT]: 'Completar información',
  [KYB_STATUS.PENDING]: 'Completar información',
  [KYB_STATUS.IN_REVIEW]: 'Ver lo enviado',
  [KYB_STATUS.OBSERVED]: 'Revisar observaciones',
  [KYB_STATUS.APPROVED]: 'Ver resultado',
  [KYB_STATUS.REJECTED]: 'Ver detalle',
}

function stageIconClass(tone) {
  if (tone === 'success') return 'ob-stage__icon ob-stage__icon--done'
  if (tone === 'warning') return 'ob-stage__icon ob-stage__icon--alert'
  if (tone === 'danger') return 'ob-stage__icon ob-stage__icon--error'
  return 'ob-stage__icon'
}

function StageCard({
  icon, name, description, badge, percent, meterLabel, note, actionLabel, onAction,
  secondary,
}) {
  return (
    <Card className="ob-stage">
      <CardBody>
        <div className="ob-stage__top">
          <span className={stageIconClass(badge.tone)} aria-hidden="true">{icon}</span>
          <div className="grow">
            <p className="ob-stage__name">{name}</p>
            <p className="ob-stage__desc">{description}</p>
          </div>
          <Badge tone={badge.tone} dot>{badge.label}</Badge>
        </div>

        <div className="ob-stage__meter">
          <Progress value={percent} tone="brand" label={`Avance de ${name.toLowerCase()}`} />
          <div className="ob-stage__meter-row">
            <span>{meterLabel}</span>
            <span className="ray-num">{percent}%</span>
          </div>
        </div>

        <p className="ray-body-sm text-secondary">{note}</p>

        <div className="ob-stage__foot">
          <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
          {secondary}
        </div>
      </CardBody>
    </Card>
  )
}

export default function OnboardingHub() {
  const { state } = useDemoState()
  const navigate = useNavigate()
  const progress = useOnboardingProgress()

  const identityMeta = IDENTITY_STATUS_META[state.identityStatus]
  const kybMeta = KYB_STATUS_META[state.kybStatus]
  const readyForActivation = canProvisionAccount(state)

  const sectionsPercent = Math.round((progress.sectionsComplete / progress.sectionsTotal) * 100)
  const kybPercent = state.kybStatus === KYB_STATUS.APPROVED
    ? 100
    : state.kybStatus === KYB_STATUS.IN_REVIEW
      ? Math.max(sectionsPercent, 90)
      : sectionsPercent

  const observationsBySection = state.kybObservations.reduce((acc, obs) => {
    const title = KYB_SECTIONS.find(s => s.id === obs.section)?.title ?? obs.section
    acc[title] = (acc[title] ?? 0) + 1
    return acc
  }, {})

  const orgItems = [
    { label: 'Nombre de fantasía', value: state.organization.tradeName },
    { label: 'Razón social', value: state.organization.legalName },
    { label: 'País de constitución', value: state.organization.countryOfIncorporation ? countryLabel(state.organization.countryOfIncorporation) : null },
    { label: 'Industria', value: state.organization.industry ? industryLabel(state.organization.industry) : null },
  ]

  return (
    <FlowLayout
      wide
      aside={{
        title: 'Validemos tu empresa para habilitar la cuenta',
        body: 'Son dos validaciones independientes. Puedes hacerlas en el orden que prefieras y retomar cuando quieras: el avance queda guardado.',
        items: [
          { title: 'Identidad del usuario', description: 'Verificación del representante que abre la cuenta.', marker: 'B1' },
          { title: 'Información de la empresa', description: 'Expediente KYB en cuatro secciones.', marker: 'B2' },
          { title: 'Activación de la cuenta', description: 'Se habilita cuando ambas validaciones están aprobadas.', marker: 'C' },
        ],
      }}
      topRight={
        <div className="row gap-2">
          {canAccessDesk(state) && <Button variant="secondary" size="sm" onClick={() => navigate('/desk')}>Volver al Merchant Desk</Button>}
          <Badge tone={readyForActivation ? 'success' : 'neutral'}>{`Avance general ${progress.percent}%`}</Badge>
        </div>
      }
    >
      <div className="ob-stack">
        <div className="ob-head">
          <p className="flow__step-meta">Macroproceso B · Onboarding empresarial</p>
          <h2 className="flow__title">Te damos la bienvenida a YOL1 Enterprise</h2>
          <p className="flow__lead">
            Antes de habilitar la cuenta necesitamos validar tu identidad como representante y la
            información legal de {state.organization.tradeName || 'tu empresa'}. Son dos procesos
            separados: avanza en cualquiera de los dos cuando tengas la información a mano.
          </p>
        </div>

        <Card level="medium" flat>
          <CardBody>
            <div className="ob-stage__meter">
              <Progress value={progress.percent} tone="accent" label="Avance general del onboarding" />
              <div className="ob-stage__meter-row">
                <span>
                  {progress.identityDone ? 'Identidad verificada' : 'Identidad pendiente'}
                  {' · '}
                  {progress.sectionsComplete} de {progress.sectionsTotal} secciones de empresa completas
                </span>
                <span className="ray-num">{progress.percent}%</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {state.kybStatus === KYB_STATUS.OBSERVED && (
          <Callout
            tone="warning"
            title={`Compliance dejó ${state.kybObservations.length} ${state.kybObservations.length === 1 ? 'observación' : 'observaciones'} en el expediente`}
            action={<Button size="sm" variant="primary" onClick={() => navigate('/onboarding/business')}>Revisar observaciones</Button>}
          >
            <p className="ray-body-sm">
              {Object.keys(observationsBySection).length > 0
                ? `Afectan a: ${Object.entries(observationsBySection).map(([title, n]) => `${title} (${n})`).join(', ')}.`
                : 'Revisa el detalle en la validación de empresa.'}
              {' '}Corrígelas y vuelve a enviar el expediente.
            </p>
          </Callout>
        )}

        {state.kybStatus === KYB_STATUS.REJECTED && (
          <Callout tone="danger" title="La validación de empresa fue rechazada">
            <p className="ray-body-sm">
              No podemos continuar con la apertura de la cuenta por esta vía. Escribe a tu ejecutivo
              o a compliance@yol1.com para entender el motivo y evaluar alternativas.
            </p>
          </Callout>
        )}

        {state.identityStatus === IDENTITY_STATUS.FAILED && (
          <Callout
            tone="danger"
            title="La validación de identidad falló"
            action={<Button size="sm" variant="secondary" onClick={() => navigate('/onboarding/identity')}>Reintentar</Button>}
          >
            <p className="ray-body-sm">
              El proveedor no pudo confirmar tu identidad con la captura anterior. Puedes repetir el
              proceso con mejor luz y el documento completo dentro del marco.
            </p>
          </Callout>
        )}

        {readyForActivation && (
          <Callout
            tone="success"
            title="Las dos validaciones están aprobadas"
            action={<Button size="sm" variant="brand" onClick={() => navigate('/activation')}>Activar la cuenta</Button>}
          >
            <p className="ray-body-sm">
              Ya podemos aprovisionar tu cuenta vista empresarial y habilitar las cuentas virtuales.
            </p>
          </Callout>
        )}

        <div className="ob-stages">
          <StageCard
            icon={state.identityStatus === IDENTITY_STATUS.APPROVED ? <BadgeCheck size={18} /> : <UserRound size={18} />}
            name="Validación de identidad"
            description="Verificamos quién abre la cuenta con Chaindots, nuestro proveedor de identidad."
            badge={identityMeta}
            percent={IDENTITY_PERCENT[state.identityStatus] ?? 0}
            meterLabel={state.identityStatus === IDENTITY_STATUS.APPROVED ? 'Etapa completa' : 'Documento, selfie y validación'}
            note={IDENTITY_NOTE[state.identityStatus]}
            actionLabel={IDENTITY_ACTION[state.identityStatus]}
            onAction={() => navigate('/onboarding/identity')}
          />

          <StageCard
            icon={state.kybStatus === KYB_STATUS.APPROVED ? <ShieldCheck size={18} /> : <Building2 size={18} />}
            name="Validación de empresa"
            description="Expediente KYB: identificación legal, estructura societaria, documentos y actividad."
            badge={kybMeta}
            percent={kybPercent}
            meterLabel={`${progress.sectionsComplete} de ${progress.sectionsTotal} secciones completas`}
            note={kybMeta.description}
            actionLabel={KYB_ACTION[state.kybStatus]}
            onAction={() => navigate('/onboarding/business')}
          />
        </div>

        <Card flat>
          <CardBody>
            <p className="ray-label" style={{ marginBottom: 'var(--ray-space-3)' }}>Datos de la organización en la demo</p>
            <DefinitionList items={orgItems} columns={2} />
            <p className="flow__footnote">
              Los requisitos de KYB dependen de la jurisdicción, del proveedor y del equipo de
              Compliance. Los campos de esta demo son demostrativos y no constituyen una aprobación
              regulatoria.
            </p>
          </CardBody>
        </Card>

        {progress.percent === 100 && !readyForActivation && (
          <Callout tone="info" title="Estamos revisando lo que enviaste">
            <p className="ray-body-sm">
              Completaste todo lo que depende de ti. La aprobación final la confirma Compliance;
              mientras tanto no hay nada más que hacer en esta pantalla.
            </p>
          </Callout>
        )}

        <div className="flow__actions">
          <Button
            variant="ghost"
            icon={<CircleCheck size={15} aria-hidden="true" />}
            onClick={() => navigate('/activation')}
            disabled={!readyForActivation}
          >
            Ir a la activación de la cuenta
          </Button>
          {!readyForActivation && (
            <span className="ray-caption text-tertiary">
              <AlertTriangle size={12} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 'var(--ray-space-1)' }} />
              Se habilita con identidad y empresa aprobadas
            </span>
          )}
        </div>
      </div>
    </FlowLayout>
  )
}
