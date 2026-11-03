import { ContentDetails } from '../../ui'
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
  [IDENTITY_STATUS.NOT_STARTED]: 'Iniciar verificación',
  [IDENTITY_STATUS.IN_PROGRESS]: 'Retomar verificación',
  [IDENTITY_STATUS.IN_REVIEW]: 'Ver estado',
  [IDENTITY_STATUS.OBSERVED]: 'Revisar observación',
  [IDENTITY_STATUS.APPROVED]: 'Ver resultado',
  [IDENTITY_STATUS.FAILED]: 'Reintentar verificación',
}

const IDENTITY_NOTE = {
  [IDENTITY_STATUS.NOT_STARTED]: 'Necesitas una cédula o pasaporte vigente.',
  [IDENTITY_STATUS.IN_PROGRESS]: 'Retoma la verificación desde la captura del documento.',
  [IDENTITY_STATUS.IN_REVIEW]: 'Tu identidad está en revisión.',
  [IDENTITY_STATUS.OBSERVED]: 'Repite la captura indicada.',
  [IDENTITY_STATUS.APPROVED]: 'Tu identidad quedó verificada.',
  [IDENTITY_STATUS.FAILED]: 'No pudimos verificar tu identidad. Inténtalo de nuevo.',
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
        title: 'Onboarding empresarial',
        body: 'Completa identidad y empresa en el orden que prefieras.',
        items: [
          { title: 'Identidad', description: 'Verificación de la persona que se registra.', marker: 'B1' },
          { title: 'Empresa', description: 'Datos y documentos de la empresa.', marker: 'B2' },
          { title: 'Activación de la cuenta', description: 'Apertura automática tras la aprobación.', marker: 'C' },
        ],
      }}
      topRight={canAccessDesk(state) && (
        <Button variant="secondary" size="sm" onClick={() => navigate('/desk')}>Volver al Merchant Desk</Button>
      )}
    >
      <div className="ob-stack">
        <div className="ob-head">
          <h2 className="flow__title">{readyForActivation ? 'Verificaciones aprobadas' : 'Verifica tu identidad y empresa'}</h2>
          <p className="flow__lead">
            {readyForActivation
              ? 'Consulta los resultados y el expediente de tu empresa.'
              : `Para habilitar la cuenta, verifica tu identidad y los datos de ${state.organization.tradeName || 'tu empresa'}. Puedes guardar el avance y continuar después.`}
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
            title={`Hay ${state.kybObservations.length} ${state.kybObservations.length === 1 ? 'observación' : 'observaciones'} en el expediente`}
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
              No se puede abrir la cuenta. Contacta a tu ejecutivo para revisar el motivo.
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
              Repite la captura con buena luz y el documento completo en el marco.
            </p>
          </Callout>
        )}

        {readyForActivation && (
          <Callout
            tone="success"
            title="Verificaciones aprobadas"
            action={<Button size="sm" variant="brand" onClick={() => navigate('/activation')}>Ver activación</Button>}
          >
            <p className="ray-body-sm">
              {canAccessDesk(state) ? 'Tu cuenta ya está habilitada. Puedes consultar el expediente o volver a Merchant Desk.' : 'La apertura de la cuenta vista comienza automáticamente.'}
            </p>
          </Callout>
        )}

        <div className="ob-stages">
          <StageCard
            icon={state.identityStatus === IDENTITY_STATUS.APPROVED ? <BadgeCheck size={18} /> : <UserRound size={18} />}
            name="Verificación de identidad"
            description="Documento y verificación de identidad."
            badge={identityMeta}
            percent={IDENTITY_PERCENT[state.identityStatus] ?? 0}
            meterLabel={state.identityStatus === IDENTITY_STATUS.APPROVED ? 'Etapa completa' : 'Documento, selfie y validación'}
            note={IDENTITY_NOTE[state.identityStatus]}
            actionLabel={IDENTITY_ACTION[state.identityStatus]}
            onAction={() => navigate('/onboarding/identity')}
          />

          <StageCard
            icon={state.kybStatus === KYB_STATUS.APPROVED ? <ShieldCheck size={18} /> : <Building2 size={18} />}
            name="Verificación de empresa"
            description="Datos legales, propietarios, documentos y actividad."
            badge={kybMeta}
            percent={kybPercent}
            meterLabel={`${progress.sectionsComplete} de ${progress.sectionsTotal} secciones completas`}
            note={kybMeta.description}
            actionLabel={KYB_ACTION[state.kybStatus]}
            onAction={() => navigate('/onboarding/business')}
          />
        </div>

        <ContentDetails summary="Datos de la empresa">
          <Card flat>
          <CardBody>
            <p className="ray-label" style={{ marginBottom: 'var(--ray-space-3)' }}>Datos de la empresa</p>
            <DefinitionList items={orgItems} columns={2} />
            <p className="flow__footnote">
              Requisitos de ejemplo. La verificación real depende del país y de cumplimiento.
            </p>
          </CardBody>
        </Card>
        </ContentDetails>

        {progress.percent === 100 && !readyForActivation && (
          <Callout tone="info" title="Estamos revisando lo que enviaste">
            <p className="ray-body-sm">
              Tu información está completa. Falta la aprobación de cumplimiento.
            </p>
          </Callout>
        )}


      </div>
    </FlowLayout>
  )
}
