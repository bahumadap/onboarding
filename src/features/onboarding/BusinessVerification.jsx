/* =============================================================
   Macroproceso B2 — validación de empresa (KYB).

   Expediente por secciones (KYB_SECTIONS). Cada sección se abre, se
   completa y se marca con `setKybSection`. Los datos legales de la
   entidad principal se guardan en la organización con
   `patchOrganization`; el resto del borrador queda bajo
   `organization.kybProfile`, para que recargar no pierda nada.

   Los requisitos reales dependen de la jurisdicción, del proveedor
   y de Compliance: los campos de acá son demostrativos.
   ============================================================= */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, CheckCircle2, ChevronDown, FileText, Plus, Send, Users,
} from 'lucide-react'

import FlowLayout from '../../shell/FlowLayout'
import {
  Badge, Button, Callout, Card, CardBody, Checkbox, Dialog, Divider, EmptyState,
  Field, Input, MultiSelect, Progress, Select, Textarea, useToast,
} from '../../ui'
import { useDemoState } from '../../state/DemoState'
import {
  KYB_STATUS, KYB_STATUS_META, SECTION_STATUS, SECTION_STATUS_META,
} from '../../state/statuses'
import { KYB_SECTIONS, SAMPLE_OBSERVATIONS } from '../../mock/compliance'
import { COUNTRIES, ENTITY_TYPES, countryLabel } from '../../mock/countries'
import './onboarding.css'

const VOLUME_OPTIONS = [
  { value: 'lt_50k', label: 'Menos de USD 50.000 al mes' },
  { value: '50k_250k', label: 'Entre USD 50.000 y 250.000 al mes' },
  { value: '250k_1m', label: 'Entre USD 250.000 y 1.000.000 al mes' },
  { value: 'gt_1m', label: 'Más de USD 1.000.000 al mes' },
]

const FUNDS_OPTIONS = [
  { value: 'operations', label: 'Ingresos operacionales del giro' },
  { value: 'capital', label: 'Aportes de capital de los socios' },
  { value: 'financing', label: 'Financiamiento de terceros' },
  { value: 'other', label: 'Otro origen (lo detalla Compliance)' },
]

const SECTION_ICON = {
  legal: <Building2 size={15} aria-hidden="true" />,
  structure: <Users size={15} aria-hidden="true" />,
  documents: <FileText size={15} aria-hidden="true" />,
  activity: <CheckCircle2 size={15} aria-hidden="true" />,
}

const DOCUMENT_FIELDS = KYB_SECTIONS.find(s => s.id === 'documents').fields

/** Borrador inicial: lo que ya está en la organización manda. */
function buildDraft(org) {
  const saved = org.kybProfile ?? {}
  return {
    legal: {
      legalName: org.legalName ?? '',
      taxId: org.taxId ?? '',
      entityType: org.entityType ?? '',
      country: org.countryOfIncorporation ?? '',
      legalAddress: org.legalAddress ?? '',
      ...saved.legal,
    },
    structure: {
      representatives: '', shareholders: '', ubos: '', ownership: '',
      ...saved.structure,
    },
    documents: {
      ...Object.fromEntries(DOCUMENT_FIELDS.map(f => [f, false])),
      ...saved.documents,
    },
    activity: {
      economicActivity: org.economicActivity ?? '',
      monthlyVolume: '',
      fundsOrigin: '',
      counterparties: '',
      operatingCountries: org.operatingCountries ?? [],
      ...saved.activity,
    },
  }
}

/** Qué falta en cada sección. Devuelve un mapa campo → mensaje. */
function validateSection(id, values) {
  const required = (obj, keys) => Object.fromEntries(
    keys.filter(k => !String(obj[k] ?? '').trim()).map(k => [k, 'Completa este dato para marcar la sección.']),
  )
  if (id === 'legal') return required(values, ['legalName', 'taxId', 'entityType', 'country', 'legalAddress'])
  if (id === 'structure') return required(values, ['representatives', 'shareholders', 'ubos', 'ownership'])
  if (id === 'activity') {
    const errors = required(values, ['economicActivity', 'monthlyVolume', 'fundsOrigin', 'counterparties'])
    if (!values.operatingCountries?.length) errors.operatingCountries = 'Selecciona al menos un país de operación.'
    return errors
  }
  if (id === 'documents') {
    const missing = DOCUMENT_FIELDS.filter(f => !values[f])
    return missing.length ? { documents: `Faltan ${missing.length} de ${DOCUMENT_FIELDS.length} documentos por declarar.` } : {}
  }
  return {}
}

export default function BusinessVerification() {
  const { state, actions } = useDemoState()
  const navigate = useNavigate()
  const toast = useToast()

  const [draft, setDraft] = useState(() => buildDraft(state.organization))
  const [openSection, setOpenSection] = useState(() => (
    KYB_SECTIONS.find(s => state.kybSections[s.id] !== SECTION_STATUS.COMPLETE)?.id ?? null
  ))
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [entityDialog, setEntityDialog] = useState(false)
  const [newEntity, setNewEntity] = useState({ legalName: '', country: '' })
  const submitTimer = useRef(null)

  useEffect(() => () => { if (submitTimer.current) window.clearTimeout(submitTimer.current) }, [])

  const locked = state.kybStatus === KYB_STATUS.IN_REVIEW || state.kybStatus === KYB_STATUS.APPROVED
    || state.kybStatus === KYB_STATUS.REJECTED

  const completeCount = KYB_SECTIONS.filter(s => state.kybSections[s.id] === SECTION_STATUS.COMPLETE).length
  const pendingObservations = state.kybObservations
  const allComplete = completeCount === KYB_SECTIONS.length
  const canSubmit = allComplete && pendingObservations.length === 0 && !locked

  const observationsOf = useMemo(() => {
    const map = {}
    pendingObservations.forEach(o => { map[o.section] = [...(map[o.section] ?? []), o] })
    return map
  }, [pendingObservations])

  const setValue = (sectionId, key, value) => {
    setDraft(d => ({ ...d, [sectionId]: { ...d[sectionId], [key]: value } }))
    setErrors(e => (e[sectionId]?.[key] ? { ...e, [sectionId]: { ...e[sectionId], [key]: undefined } } : e))
  }

  /** Persiste el borrador de una sección en el estado global. */
  const persistSection = (sectionId) => {
    const values = draft[sectionId]
    const patch = { kybProfile: { ...(state.organization.kybProfile ?? {}), [sectionId]: values } }

    if (sectionId === 'legal') {
      patch.legalName = values.legalName
      patch.taxId = values.taxId
      patch.entityType = values.entityType
      patch.countryOfIncorporation = values.country
      patch.legalAddress = values.legalAddress
    }
    if (sectionId === 'activity') {
      patch.economicActivity = values.economicActivity
      patch.operatingCountries = values.operatingCountries
    }
    actions.patchOrganization(patch)
  }

  const saveSection = (sectionId) => {
    const sectionErrors = validateSection(sectionId, draft[sectionId])
    if (Object.keys(sectionErrors).length > 0) {
      setErrors(e => ({ ...e, [sectionId]: sectionErrors }))
      actions.setKybSection(sectionId, SECTION_STATUS.IN_PROGRESS)
      persistSection(sectionId)
      return
    }
    setErrors(e => ({ ...e, [sectionId]: {} }))
    persistSection(sectionId)
    actions.setKybSection(sectionId, SECTION_STATUS.COMPLETE)
    toast?.push({ tone: 'success', title: 'Sección guardada', description: KYB_SECTIONS.find(s => s.id === sectionId).title })
    const next = KYB_SECTIONS.find(s => s.id !== sectionId && state.kybSections[s.id] !== SECTION_STATUS.COMPLETE)
    setOpenSection(next ? next.id : null)
  }

  const saveDraftOnly = (sectionId) => {
    persistSection(sectionId)
    if (state.kybSections[sectionId] !== SECTION_STATUS.COMPLETE) {
      actions.setKybSection(sectionId, SECTION_STATUS.IN_PROGRESS)
    }
    toast?.push({ tone: 'info', title: 'Borrador guardado', description: 'Puedes retomar esta sección cuando quieras.' })
  }

  const submit = () => {
    if (!canSubmit) return
    setSubmitting(true)
    submitTimer.current = window.setTimeout(() => {
      setSubmitting(false)
      actions.submitKyb()
      toast?.push({
        tone: 'success',
        title: 'Expediente enviado a revisión',
        description: 'Compliance revisa la información y te avisamos del resultado.',
      })
    }, 900)
  }

  const statusMeta = KYB_STATUS_META[state.kybStatus]

  /* ----------------------- campos por sección ---------------------- */
  const renderFields = (sectionId) => {
    const v = draft[sectionId]
    const e = errors[sectionId] ?? {}

    if (sectionId === 'legal') {
      return (
        <div className="ob-grid ob-grid--2">
          <Field label="Razón social" required htmlFor="kyb-legalName" error={e.legalName}>
            <Input id="kyb-legalName" value={v.legalName} disabled={locked} invalid={Boolean(e.legalName)}
              placeholder="ArenaPlay Demo SpA" onChange={ev => setValue('legal', 'legalName', ev.target.value)} />
          </Field>
          <Field label="Número de identificación tributaria" required htmlFor="kyb-taxId" error={e.taxId}
            hint="RUT en Chile; el formato cambia según la jurisdicción.">
            <Input id="kyb-taxId" value={v.taxId} disabled={locked} invalid={Boolean(e.taxId)}
              placeholder="76.543.210-K" onChange={ev => setValue('legal', 'taxId', ev.target.value)} />
          </Field>
          <Field label="Tipo de sociedad" required htmlFor="kyb-entityType" error={e.entityType}>
            <Select id="kyb-entityType" options={ENTITY_TYPES} placeholder="Selecciona el tipo" value={v.entityType}
              disabled={locked} onChange={ev => setValue('legal', 'entityType', ev.target.value)} />
          </Field>
          <Field label="País de constitución" required htmlFor="kyb-country" error={e.country}>
            <Select id="kyb-country" options={COUNTRIES} placeholder="Selecciona el país" value={v.country}
              disabled={locked} onChange={ev => setValue('legal', 'country', ev.target.value)} />
          </Field>
          <Field className="ob-grid__full" label="Domicilio legal" required htmlFor="kyb-address" error={e.legalAddress}>
            <Input id="kyb-address" value={v.legalAddress} disabled={locked} invalid={Boolean(e.legalAddress)}
              placeholder="Av. Apoquindo 4500, of. 1201, Las Condes" onChange={ev => setValue('legal', 'legalAddress', ev.target.value)} />
          </Field>
        </div>
      )
    }

    if (sectionId === 'structure') {
      return (
        <div className="ob-grid">
          <Field label="Representantes legales" required htmlFor="kyb-reps" error={e.representatives}
            hint="Nombre y documento de cada persona con poder para operar la cuenta.">
            <Textarea id="kyb-reps" rows={3} value={v.representatives} disabled={locked} invalid={Boolean(e.representatives)}
              placeholder="Benja Ahumada · 15.234.567-8 · gerente general" onChange={ev => setValue('structure', 'representatives', ev.target.value)} />
          </Field>
          <Field label="Accionistas" required htmlFor="kyb-shareholders" error={e.shareholders}>
            <Textarea id="kyb-shareholders" rows={3} value={v.shareholders} disabled={locked} invalid={Boolean(e.shareholders)}
              placeholder="Inversiones Norte SpA · 72% / Benja Ahumada · 28%" onChange={ev => setValue('structure', 'shareholders', ev.target.value)} />
          </Field>
          <Field label="Beneficiarios finales" required htmlFor="kyb-ubos" error={e.ubos}
            hint="Personas naturales que controlan la sociedad, directa o indirectamente.">
            <Textarea id="kyb-ubos" rows={3} value={v.ubos} disabled={locked} invalid={Boolean(e.ubos)}
              placeholder="Benja Ahumada · 28% directo / Carolina Soto · 36% vía Inversiones Norte SpA"
              onChange={ev => setValue('structure', 'ubos', ev.target.value)} />
          </Field>
          <Field label="Porcentajes de participación" required htmlFor="kyb-ownership" error={e.ownership}
            hint="La suma debe llegar al 100% de la propiedad.">
            <Input id="kyb-ownership" value={v.ownership} disabled={locked} invalid={Boolean(e.ownership)}
              placeholder="72% / 28%" onChange={ev => setValue('structure', 'ownership', ev.target.value)} />
          </Field>
        </div>
      )
    }

    if (sectionId === 'documents') {
      return (
        <div className="ob-docs">
          <Callout tone="info" title="Documentos demostrativos">
            <p className="ray-body-sm">
              En esta demo no se carga ningún archivo: marca los documentos que ya tienes disponibles
              para dejar la sección completa. El expediente real lo define Compliance.
            </p>
          </Callout>
          {DOCUMENT_FIELDS.map(field => (
            <Checkbox
              key={field}
              label={field}
              description="Documento vigente, emitido dentro de los últimos 60 días."
              checked={Boolean(v[field])}
              disabled={locked}
              onChange={ev => setValue('documents', field, ev.target.checked)}
            />
          ))}
          {e.documents && <p className="ray-body-sm text-danger">{e.documents}</p>}
        </div>
      )
    }

    return (
      <div className="ob-grid ob-grid--2">
        <Field label="Actividad económica" required htmlFor="kyb-activity" error={e.economicActivity}>
          <Input id="kyb-activity" value={v.economicActivity} disabled={locked} invalid={Boolean(e.economicActivity)}
            placeholder="Plataformas de entretenimiento digital" onChange={ev => setValue('activity', 'economicActivity', ev.target.value)} />
        </Field>
        <Field label="Volumen mensual estimado" required htmlFor="kyb-volume" error={e.monthlyVolume}>
          <Select id="kyb-volume" options={VOLUME_OPTIONS} placeholder="Selecciona un rango" value={v.monthlyVolume}
            disabled={locked} onChange={ev => setValue('activity', 'monthlyVolume', ev.target.value)} />
        </Field>
        <Field className="ob-grid__full" label="Países de operación" required htmlFor="kyb-op-countries"
          error={e.operatingCountries} hint="Dónde cobras o pagas hoy, no solo dónde estás constituido.">
          {locked
            ? (
              <p className="ray-body-sm">
                {v.operatingCountries?.length
                  ? v.operatingCountries.map(countryLabel).join(', ')
                  : 'Sin países declarados.'}
              </p>
            )
            : (
              <MultiSelect id="kyb-op-countries" options={COUNTRIES} value={v.operatingCountries}
                placeholder="Selecciona los países" onChange={next => setValue('activity', 'operatingCountries', next)} />
            )}
        </Field>
        <Field label="Origen de fondos" required htmlFor="kyb-funds" error={e.fundsOrigin}>
          <Select id="kyb-funds" options={FUNDS_OPTIONS} placeholder="Selecciona el origen" value={v.fundsOrigin}
            disabled={locked} onChange={ev => setValue('activity', 'fundsOrigin', ev.target.value)} />
        </Field>
        <Field label="Contrapartes habituales" required htmlFor="kyb-counterparties" error={e.counterparties}>
          <Input id="kyb-counterparties" value={v.counterparties} disabled={locked} invalid={Boolean(e.counterparties)}
            placeholder="Usuarios finales, proveedores de contenido, pasarelas de pago"
            onChange={ev => setValue('activity', 'counterparties', ev.target.value)} />
        </Field>
      </div>
    )
  }

  return (
    <FlowLayout
      wide
      aside={{
        title: 'El expediente de tu empresa, en cuatro secciones',
        body: 'Puedes completarlas en el orden que quieras y volver después: cada sección se guarda por separado.',
        items: KYB_SECTIONS.map((s, i) => ({ title: s.title, description: s.description, marker: i + 1 })),
      }}
      topRight={<Badge tone={statusMeta.tone} dot>{statusMeta.label}</Badge>}
    >
      <div className="ob-stack">
        <div className="ob-head">
          <h2 className="flow__title">Valida la información de tu empresa</h2>
          <p className="flow__lead">
            Con estos datos Compliance arma el expediente de {state.organization.tradeName || 'la organización'}.
            Completa las cuatro secciones y envíalas a revisión cuando estén listas.
          </p>
        </div>

        <Card level="medium" flat>
          <CardBody>
            <div className="ob-stage__meter">
              <Progress value={Math.round((completeCount / KYB_SECTIONS.length) * 100)} tone="brand" label="Avance del expediente" />
              <div className="ob-stage__meter-row">
                <span>{completeCount} de {KYB_SECTIONS.length} secciones completas</span>
                <span>{statusMeta.description}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {state.kybStatus === KYB_STATUS.OBSERVED && pendingObservations.length > 0 && (
          <Callout tone="warning" title="Compliance dejó observaciones por corregir">
            <p className="ray-body-sm">
              Revisa cada sección marcada, corrige lo indicado y márcala como corregida. Cuando no
              queden observaciones podrás volver a enviar el expediente.
            </p>
          </Callout>
        )}

        {state.kybStatus === KYB_STATUS.REJECTED && (
          <Callout tone="danger" title="El expediente fue rechazado">
            <p className="ray-body-sm">
              No podemos seguir con la apertura por esta vía. Escribe a tu ejecutivo para revisar el
              motivo; los datos quedan guardados por si se retoma el caso.
            </p>
          </Callout>
        )}

        {submitting && (
          <Callout tone="info" title="Enviando el expediente">
            <p className="ray-body-sm" role="status" aria-live="polite">
              Estamos registrando la información en el expediente de Compliance.
            </p>
          </Callout>
        )}

        {/* ------------------------- secciones ------------------------- */}
        <div className="ob-sections">
          {KYB_SECTIONS.map((section, index) => {
            const sectionObs = observationsOf[section.id] ?? []
            const stored = state.kybSections[section.id]
            const derived = sectionObs.length > 0 ? SECTION_STATUS.OBSERVED : stored
            const meta = SECTION_STATUS_META[derived]
            const isOpen = openSection === section.id
            const done = derived === SECTION_STATUS.COMPLETE

            return (
              <section
                key={section.id}
                className={`ob-section${sectionObs.length > 0 ? ' ob-section--observed' : ''}`}
              >
                <h3>
                  <button
                    type="button"
                    className="ob-section__trigger"
                    aria-expanded={isOpen}
                    aria-controls={`kyb-panel-${section.id}`}
                    onClick={() => setOpenSection(isOpen ? null : section.id)}
                  >
                    <span className={`ob-section__index${done ? ' ob-section__index--done' : ''}`} aria-hidden="true">
                      {done ? <CheckCircle2 size={14} /> : index + 1}
                    </span>
                    <span className="grow">
                      <span className="ob-section__title">{section.title}</span>
                      <span className="ob-section__hint" style={{ display: 'block' }}>{section.description}</span>
                    </span>
                    <span className="ob-section__aside">
                      {sectionObs.length > 0 && (
                        <Badge tone="warning">{sectionObs.length === 1 ? '1 observación' : `${sectionObs.length} observaciones`}</Badge>
                      )}
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      <ChevronDown size={16} className={`ob-chevron${isOpen ? ' ob-chevron--open' : ''}`} aria-hidden="true" />
                    </span>
                  </button>
                </h3>

                <div id={`kyb-panel-${section.id}`} className="ob-section__body" hidden={!isOpen}>
                  {isOpen && (
                    <>
                      {sectionObs.length > 0 && (
                        <div className="ob-obs">
                          {sectionObs.map(obs => (
                            <Callout key={obs.id} tone="warning" title={obs.title}>
                              <p className="ob-obs__detail">{obs.detail}</p>
                              <div className="ob-obs__actions">
                                <Button size="sm" variant="secondary" onClick={() => {
                                  actions.resolveObservation(obs.id)
                                  toast?.push({ tone: 'success', title: 'Observación marcada como corregida', description: obs.title })
                                }}>
                                  Marcar como corregida
                                </Button>
                              </div>
                            </Callout>
                          ))}
                        </div>
                      )}

                      <p className="ray-caption text-tertiary">
                        {section.fields.length} datos en esta sección: {section.fields.join(', ')}.
                      </p>

                      {renderFields(section.id)}

                      {!locked && (
                        <div className="flow__actions">
                          <Button variant="primary" icon={SECTION_ICON[section.id]} onClick={() => saveSection(section.id)}>
                            {done ? 'Actualizar sección' : 'Marcar sección como completa'}
                          </Button>
                          <Button variant="ghost" onClick={() => saveDraftOnly(section.id)}>Guardar borrador</Button>
                        </div>
                      )}
                      {locked && (
                        <p className="ray-caption text-tertiary">
                          El expediente está {statusMeta.label.toLowerCase()}: los campos quedan en solo lectura.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </section>
            )
          })}
        </div>

        {/* -------------------- entidades jurídicas -------------------- */}
        <Card flat>
          <CardBody>
            <div className="ob-stage__top">
              <span className="grow">
                <p className="ray-label">Entidades jurídicas de la organización</p>
                <p className="ob-stage__desc">
                  El foco del expediente es la entidad principal. Si el grupo tiene más sociedades,
                  decláralas acá: cada una se valida por separado.
                </p>
              </span>
              <Button size="sm" variant="secondary" icon={<Plus size={14} aria-hidden="true" />} onClick={() => setEntityDialog(true)}>
                Agregar entidad
              </Button>
            </div>
            <Divider />
            <div className="ob-entities" style={{ marginTop: 'var(--ray-space-4)' }}>
              {state.organization.legalEntities.length === 0 && (
                <EmptyState
                  icon={<Building2 size={20} aria-hidden="true" />}
                  title="Todavía no hay entidades declaradas"
                  description="La entidad principal se crea al completar la identificación legal."
                />
              )}
              {state.organization.legalEntities.map(entity => (
                <div className="ob-entity" key={entity.id}>
                  <span>
                    <span className="ob-entity__name" style={{ display: 'block' }}>{entity.legalName}</span>
                    <span className="ob-entity__meta">
                      {entity.country ? countryLabel(entity.country) : 'País sin declarar'}
                      {' · '}
                      {entity.role === 'primary' ? 'Entidad principal' : 'Entidad relacionada'}
                    </span>
                  </span>
                  <Badge tone={KYB_STATUS_META[entity.kybStatus]?.tone ?? 'neutral'}>
                    {KYB_STATUS_META[entity.kybStatus]?.label ?? 'Borrador'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* -------------------------- envío --------------------------- */}
        {!locked && (
          <Card level="medium">
            <CardBody>
              <p className="ray-label">Enviar el expediente a revisión</p>
              <p className="ray-body-sm text-secondary" style={{ marginTop: 'var(--ray-space-2)' }}>
                {canSubmit
                  ? 'Las cuatro secciones están completas y no quedan observaciones abiertas.'
                  : pendingObservations.length > 0
                    ? `Quedan ${pendingObservations.length} observaciones por corregir antes de volver a enviar.`
                    : `Faltan ${KYB_SECTIONS.length - completeCount} secciones por completar.`}
              </p>
              <div className="flow__actions">
                <Button
                  variant="brand"
                  icon={<Send size={15} aria-hidden="true" />}
                  disabled={!canSubmit}
                  loading={submitting}
                  onClick={submit}
                >
                  Enviar a revisión
                </Button>
                <Button variant="ghost" onClick={() => navigate('/onboarding')}>Volver al onboarding</Button>
              </div>
            </CardBody>
          </Card>
        )}

        {state.kybStatus === KYB_STATUS.IN_REVIEW && (
          <Card level="medium">
            <CardBody>
              <p className="ray-label">Expediente en revisión</p>
              <p className="ray-body-sm text-secondary" style={{ marginTop: 'var(--ray-space-2)' }}>
                Enviado el {state.kybSubmittedAt ? new Date(state.kybSubmittedAt).toLocaleString('es-CL') : 'momento del envío'}.
                Compliance revisa la información y te avisamos del resultado por correo.
              </p>
              <Divider />
              <p className="ray-caption text-tertiary" style={{ marginTop: 'var(--ray-space-4)' }}>
                Simulación del resultado de la revisión, para recorrer la demo sin esperar.
              </p>
              <div className="ob-sim" style={{ marginTop: 'var(--ray-space-3)' }}>
                <Button size="sm" variant="secondary" onClick={() => {
                  actions.setKybStatus(KYB_STATUS.APPROVED, [])
                  toast?.push({ tone: 'success', title: 'Validación de empresa aprobada', description: 'Ya puedes avanzar a la activación de la cuenta.' })
                }}>
                  Simular aprobación
                </Button>
                <Button size="sm" variant="secondary" onClick={() => {
                  actions.setKybObservations(SAMPLE_OBSERVATIONS)
                  setOpenSection(SAMPLE_OBSERVATIONS[0].section)
                  toast?.push({ tone: 'info', title: 'Expediente observado', description: 'Revisa las observaciones en las secciones marcadas.' })
                }}>
                  Simular observaciones
                </Button>
                <Button size="sm" variant="ghost" onClick={() => actions.setKybStatus(KYB_STATUS.REJECTED, [])}>
                  Simular rechazo
                </Button>
              </div>
              <div className="flow__actions">
                <Button variant="primary" onClick={() => navigate('/onboarding')}>Volver al onboarding</Button>
              </div>
            </CardBody>
          </Card>
        )}

        {state.kybStatus === KYB_STATUS.APPROVED && (
          <Callout
            tone="success"
            title="La validación de empresa está aprobada"
            action={<Button size="sm" variant="brand" onClick={() => navigate('/onboarding')}>Volver al onboarding</Button>}
          >
            <p className="ray-body-sm">
              El expediente quedó cerrado. Si cambia la estructura societaria, avísanos para
              actualizarlo.
            </p>
          </Callout>
        )}

        <p className="flow__footnote">
          Los requisitos de KYB dependen de la jurisdicción, del proveedor y del equipo de
          Compliance. Los campos de esta demo son demostrativos y no constituyen una aprobación
          regulatoria.
        </p>
      </div>

      <Dialog
        open={entityDialog}
        onClose={() => setEntityDialog(false)}
        title="Agregar entidad jurídica"
        description="Declara otra sociedad del grupo. Se valida por separado y no afecta el avance de la entidad principal."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEntityDialog(false)}>Cancelar</Button>
            <Button
              variant="primary"
              disabled={!newEntity.legalName.trim() || !newEntity.country}
              onClick={() => {
                actions.addLegalEntity({
                  legalName: newEntity.legalName.trim(),
                  country: newEntity.country,
                  role: 'related',
                  kybStatus: KYB_STATUS.DRAFT,
                })
                setNewEntity({ legalName: '', country: '' })
                setEntityDialog(false)
                toast?.push({ tone: 'success', title: 'Entidad agregada', description: 'Queda en borrador hasta que completes su expediente.' })
              }}
            >
              Agregar entidad
            </Button>
          </>
        }
      >
        <div className="ob-grid">
          <Field label="Razón social" required htmlFor="entity-name">
            <Input id="entity-name" value={newEntity.legalName} placeholder="ArenaPlay Perú SAC"
              onChange={ev => setNewEntity(n => ({ ...n, legalName: ev.target.value }))} />
          </Field>
          <Field label="País de constitución" required htmlFor="entity-country">
            <Select id="entity-country" options={COUNTRIES} placeholder="Selecciona el país" value={newEntity.country}
              onChange={ev => setNewEntity(n => ({ ...n, country: ev.target.value }))} />
          </Field>
        </div>
      </Dialog>
    </FlowLayout>
  )
}
