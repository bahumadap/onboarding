/* =============================================================
   Config Org — perfil de organización (/org/profile).

   Arquitectura multiempresa: organización (grupo empresarial),
   entidad jurídica, país de operación y cuenta son cosas distintas.
   Una empresa chilena puede operar en Perú sin tener una entidad
   jurídica peruana; otro grupo puede tener una SpA y una SAC.

   Los datos que el área de Compliance validó (razón social,
   identificación tributaria, tipo de sociedad, domicilio legal y
   estructura societaria) no se editan en línea: se solicitan, y la
   solicitud dispara una nueva revisión de KYB.
   ============================================================= */
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Lock, Plus } from 'lucide-react'

import {
  Badge, Button, Callout, Card, CardBody, CardFooter, CardHeader, DefinitionList,
  Dialog, EmptyState, Field, Input, MultiSelect, Select, Textarea, useToast,
} from '../../ui'
import { useDemoState } from '../../state/DemoState'
import { KYB_STATUS_META } from '../../state/statuses'
import { COUNTRIES, ENTITY_TYPES, INDUSTRIES, countryLabel, industryLabel } from '../../mock/countries'
import './org.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const entityTypeLabel = value => ENTITY_TYPES.find(t => t.value === value)?.label ?? 'Sin declarar'

/* Campos sensibles: cambiarlos reabre la revisión de KYB. */
const LOCKED_FIELDS = [
  { value: 'legalName', label: 'Razón social' },
  { value: 'taxId', label: 'Identificación tributaria' },
  { value: 'entityType', label: 'Tipo de sociedad' },
  { value: 'legalAddress', label: 'Domicilio legal' },
  { value: 'structure', label: 'Estructura societaria' },
]

const ENTITY_ROLES = [
  { value: 'primary', label: 'Entidad principal' },
  { value: 'subsidiary', label: 'Filial' },
  { value: 'branch', label: 'Sucursal' },
]

const entityRoleLabel = value => ENTITY_ROLES.find(r => r.value === value)?.label ?? value

export default function OrgProfile() {
  const { state, actions } = useDemoState()
  const toast = useToast()
  const org = state.organization

  const [general, setGeneral] = useState({
    tradeName: org.tradeName ?? '',
    industry: org.industry ?? '',
    economicActivity: org.economicActivity ?? '',
  })
  const [operating, setOperating] = useState(org.operatingCountries ?? [])
  const [contacts, setContacts] = useState({
    contactEmail: org.contactEmail ?? state.user.email ?? '',
    contactPhone: org.contactPhone ?? '',
    billingEmail: org.billingEmail ?? '',
  })
  const [contactErrors, setContactErrors] = useState({})

  const [requestOpen, setRequestOpen] = useState(false)
  const [requestField, setRequestField] = useState('')
  const [requestReason, setRequestReason] = useState('')
  const [requestError, setRequestError] = useState('')

  const [entityOpen, setEntityOpen] = useState(false)
  const [entityDraft, setEntityDraft] = useState({ legalName: '', country: '', entityType: '', role: 'subsidiary' })
  const [entityErrors, setEntityErrors] = useState({})

  const kybMeta = KYB_STATUS_META[state.kybStatus]
  const updateRequests = org.updateRequests ?? []

  const generalDirty = general.tradeName !== (org.tradeName ?? '')
    || general.industry !== (org.industry ?? '')
    || general.economicActivity !== (org.economicActivity ?? '')

  const operatingDirty = useMemo(() => {
    const current = org.operatingCountries ?? []
    return current.length !== operating.length || current.some(c => !operating.includes(c))
  }, [org.operatingCountries, operating])

  const contactsDirty = contacts.contactEmail !== (org.contactEmail ?? state.user.email ?? '')
    || contacts.contactPhone !== (org.contactPhone ?? '')
    || contacts.billingEmail !== (org.billingEmail ?? '')

  /* ------------------------------ acciones ----------------------------- */
  const saveGeneral = () => {
    if (!general.tradeName.trim()) {
      toast.push({ tone: 'danger', title: 'Falta el nombre comercial', description: 'Ingresa el nombre comercial de tu empresa.' })
      return
    }
    actions.patchOrganization({
      tradeName: general.tradeName.trim(),
      industry: general.industry,
      economicActivity: general.economicActivity.trim(),
    })
    toast.push({ tone: 'success', title: 'Información general actualizada', description: 'Cambios guardados.' })
  }

  const saveOperating = () => {
    if (operating.length === 0) {
      toast.push({ tone: 'danger', title: 'Declara al menos un país', description: 'Selecciona al menos un país de operación.' })
      return
    }
    actions.patchOrganization({ operatingCountries: operating })
    toast.push({
      tone: 'success',
      title: 'Países de operación actualizados',
      description: `${operating.length} ${operating.length === 1 ? 'país declarado' : 'países declarados'}.`,
    })
  }

  const saveContacts = () => {
    const errors = {}
    if (!EMAIL_RE.test(contacts.contactEmail)) errors.contactEmail = 'Escribe un correo válido.'
    if (contacts.billingEmail && !EMAIL_RE.test(contacts.billingEmail)) errors.billingEmail = 'Escribe un correo válido o deja el campo vacío.'
    setContactErrors(errors)
    if (Object.keys(errors).length > 0) {
      toast.push({ tone: 'danger', title: 'Revisa los contactos', description: 'Revisa los correos marcados.' })
      return
    }
    actions.patchOrganization(contacts)
    toast.push({ tone: 'success', title: 'Contactos actualizados', description: 'Contactos guardados.' })
  }

  const submitRequest = () => {
    if (!requestField) { setRequestError('Elige el dato que necesitas actualizar.'); return }
    if (requestReason.trim().length < 12) { setRequestError('Ingresa el motivo del cambio.'); return }
    const field = LOCKED_FIELDS.find(f => f.value === requestField)
    actions.patchOrganization({
      updateRequests: [
        {
          id: `upd_${Math.random().toString(36).slice(2, 8)}`,
          field: requestField,
          fieldLabel: field?.label ?? requestField,
          reason: requestReason.trim(),
          requestedAt: new Date().toISOString(),
          status: 'in_review',
        },
        ...updateRequests,
      ],
    })
    setRequestOpen(false)
    setRequestField('')
    setRequestReason('')
    setRequestError('')
    toast.push({
      tone: 'info',
      title: 'Solicitud de actualización enviada',
      description: `Cumplimiento revisará el cambio en ${field?.label.toLowerCase() ?? 'el dato legal'}. El expediente vuelve a revisión.`,
    })
  }

  const submitEntity = () => {
    const errors = {}
    if (!entityDraft.legalName.trim()) errors.legalName = 'Indica la razón social de la entidad.'
    if (!entityDraft.country) errors.country = 'Elige el país de constitución.'
    if (!entityDraft.entityType) errors.entityType = 'Elige el tipo de sociedad.'
    setEntityErrors(errors)
    if (Object.keys(errors).length > 0) return

    actions.addLegalEntity({
      legalName: entityDraft.legalName.trim(),
      country: entityDraft.country,
      entityType: entityDraft.entityType,
      role: entityDraft.role,
      kybStatus: 'draft',
    })
    setEntityOpen(false)
    setEntityDraft({ legalName: '', country: '', entityType: '', role: 'subsidiary' })
    toast.push({
      tone: 'success',
      title: 'Entidad jurídica agregada',
      description: 'La entidad se guardó como borrador.',
    })
  }

  /* -------------------------------- vista ------------------------------- */
  return (
    <>
      <header className="page__head">
        <h1 className="page__title">Perfil de organización</h1>
        <p className="page__lead">
          Administra los datos y entidades jurídicas de tu empresa.
        </p>
      </header>

      <Callout tone={kybMeta.tone} title={`Verificación de empresa: ${kybMeta.label.toLowerCase()}`}>
        <p className="ray-body-sm">{kybMeta.description}</p>
        <p className="ray-body-sm" style={{ marginTop: 'var(--ray-space-2)' }}>
          <Link to="/org/compliance">Revisar el expediente completo</Link>
        </p>
      </Callout>

      {/* --------------------------- general --------------------------- */}
      <section className="section">
        <Card>
          <CardHeader
            title="Información general"
            description="Actualiza los datos comerciales."
          />
          <CardBody>
            <div className="grid grid-2">
              <Field label="Nombre comercial" htmlFor="org-trade-name" required
                hint="Nombre visible para tu equipo.">
                <Input
                  id="org-trade-name"
                  value={general.tradeName}
                  onChange={e => setGeneral(g => ({ ...g, tradeName: e.target.value }))}
                />
              </Field>
              <Field label="Industria" htmlFor="org-industry">
                <Select
                  id="org-industry"
                  placeholder="Selecciona una industria"
                  options={INDUSTRIES}
                  value={general.industry}
                  onChange={e => setGeneral(g => ({ ...g, industry: e.target.value }))}
                />
              </Field>
            </div>
            <div style={{ marginTop: 'var(--ray-space-4)' }}>
              <Field
                label="Descripción de la actividad"
                htmlFor="org-activity"
                hint="Describe los productos o servicios de tu empresa."
              >
                <Textarea
                  id="org-activity"
                  rows={3}
                  value={general.economicActivity}
                  onChange={e => setGeneral(g => ({ ...g, economicActivity: e.target.value }))}
                />
              </Field>
            </div>
          </CardBody>
          <CardFooter>
            <div className="row between gap-3 wrap">
              <span className="org-inline-note">
                {generalDirty ? 'Tienes cambios sin guardar.' : 'Sin cambios pendientes.'}
              </span>
              <Button variant="primary" size="sm" disabled={!generalDirty} onClick={saveGeneral}>
                Guardar cambios
              </Button>
            </div>
          </CardFooter>
        </Card>
      </section>

      {/* ----------------------- países de operación -------------------- */}
      <section className="section">
        <Card>
          <CardHeader
            title="Presencia geográfica"
            description="El país de constitución es distinto de los países donde operas."
          />
          <CardBody>
            <div className="grid grid-2">
              <Field label="País de constitución" hint="Solicita una actualización para cambiarlo.">
                <span className="org-secret">
                  {org.countryOfIncorporation ? countryLabel(org.countryOfIncorporation) : 'Sin declarar'}
                </span>
              </Field>
              <Field
                label="Países de operación"
                htmlFor="org-operating"
                hint="Los países de operación pueden ser distintos del país de constitución."
              >
                <MultiSelect
                  id="org-operating"
                  options={COUNTRIES}
                  value={operating}
                  onChange={setOperating}
                  placeholder="Selecciona los países"
                  searchPlaceholder="Buscar país"
                />
              </Field>
            </div>
          </CardBody>
          <CardFooter>
            <div className="row between gap-3 wrap">
              <span className="org-inline-note">
                {operatingDirty ? 'Tienes cambios sin guardar.' : 'Sin cambios pendientes.'}
              </span>
              <Button variant="primary" size="sm" disabled={!operatingDirty} onClick={saveOperating}>
                Guardar países
              </Button>
            </div>
          </CardFooter>
        </Card>
      </section>

      {/* ---------------------------- legales --------------------------- */}
      <section className="section">
        <Card>
          <CardHeader
            title="Datos legales validados"
            description="Datos protegidos. Los cambios requieren una nueva revisión de cumplimiento."
            actions={<Badge tone="neutral" dot>Solo lectura</Badge>}
          />
          <CardBody>
            <DefinitionList
              columns={2}
              items={[
                { label: 'Razón social', value: org.legalName || 'Sin declarar' },
                { label: 'Identificación tributaria', value: org.taxId || 'Sin declarar' },
                { label: 'Tipo de sociedad', value: entityTypeLabel(org.entityType) },
                { label: 'País de constitución', value: org.countryOfIncorporation ? countryLabel(org.countryOfIncorporation) : 'Sin declarar' },
                { label: 'Domicilio legal', value: org.legalAddress || 'Sin declarar' },
                { label: 'Actividad declarada', value: org.economicActivity || industryLabel(org.industry) || 'Sin declarar' },
              ]}
            />
            <div style={{ marginTop: 'var(--ray-space-4)' }}>
              <Callout tone="warning" title="Cambiar un dato legal reabre la revisión">
                <p className="ray-body-sm">
                  Solicita el cambio de datos legales. Se revisará el expediente y algunos productos pueden quedar en pausa.
                </p>
              </Callout>
            </div>
          </CardBody>
          <CardFooter>
            <div className="row between gap-3 wrap">
              <span className="org-inline-note">
                <Lock size={12} aria-hidden="true" /> Protegido por la validación de empresa.
              </span>
              <Button variant="secondary" size="sm" onClick={() => setRequestOpen(true)}>
                Solicitar actualización
              </Button>
            </div>
          </CardFooter>
        </Card>
      </section>

      {/* ------------------------- solicitudes -------------------------- */}
      {updateRequests.length > 0 && (
        <section className="section">
          <div className="section__head">
            <div>
              <h2 className="section__title">Solicitudes de actualización</h2>
              <p className="section__desc">Las solicitudes requieren revisión de cumplimiento.</p>
            </div>
          </div>
          {updateRequests.map(req => (
            <div key={req.id} className="org-block">
              <div className="row between gap-3 wrap">
                <div className="grow">
                  <p className="org-block__title">{req.fieldLabel}</p>
                  <p className="org-block__meta">
                    Enviada el {new Date(req.requestedAt).toLocaleDateString('es-CL')} · {req.reason}
                  </p>
                </div>
                <Badge tone="info" dot>En revisión</Badge>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* --------------------------- contactos -------------------------- */}
      <section className="section">
        <Card>
          <CardHeader
            title="Contactos de la organización"
            description="Contactos para operación, facturación y cumplimiento."
          />
          <CardBody>
            <div className="grid grid-3">
              <Field label="Contacto operativo" htmlFor="org-contact-email" required error={contactErrors.contactEmail}>
                <Input
                  id="org-contact-email"
                  type="email"
                  inputMode="email"
                  value={contacts.contactEmail}
                  invalid={Boolean(contactErrors.contactEmail)}
                  onChange={e => setContacts(c => ({ ...c, contactEmail: e.target.value }))}
                />
              </Field>
              <Field label="Teléfono" htmlFor="org-contact-phone" hint="Incluye el código de país.">
                <Input
                  id="org-contact-phone"
                  inputMode="tel"
                  placeholder="+56 9 0000 0000"
                  value={contacts.contactPhone}
                  onChange={e => setContacts(c => ({ ...c, contactPhone: e.target.value }))}
                />
              </Field>
              <Field label="Correo de facturación" htmlFor="org-billing-email" error={contactErrors.billingEmail}>
                <Input
                  id="org-billing-email"
                  type="email"
                  inputMode="email"
                  value={contacts.billingEmail}
                  invalid={Boolean(contactErrors.billingEmail)}
                  onChange={e => setContacts(c => ({ ...c, billingEmail: e.target.value }))}
                />
              </Field>
            </div>
          </CardBody>
          <CardFooter>
            <div className="row between gap-3 wrap">
              <span className="org-inline-note">
                {contactsDirty ? 'Tienes cambios sin guardar.' : 'Sin cambios pendientes.'}
              </span>
              <Button variant="primary" size="sm" disabled={!contactsDirty} onClick={saveContacts}>
                Guardar contactos
              </Button>
            </div>
          </CardFooter>
        </Card>
      </section>

      {/* ----------------------- entidades jurídicas -------------------- */}
      <section className="section">
        <div className="section__head">
          <div>
            <h2 className="section__title">Entidades jurídicas</h2>
            <p className="section__desc">
              Cada sociedad requiere su propia verificación.
            </p>
          </div>
          <Button variant="secondary" size="sm" icon={<Plus size={15} aria-hidden="true" />} onClick={() => setEntityOpen(true)}>
            Agregar entidad
          </Button>
        </div>

        {org.legalEntities.length === 0 ? (
          <EmptyState
            icon={<Building2 size={20} aria-hidden="true" />}
            title="Todavía no hay entidades registradas"
            description="Agrega las sociedades que forman parte del grupo."
            action={<Button variant="primary" size="sm" onClick={() => setEntityOpen(true)}>Agregar entidad</Button>}
          />
        ) : (
          <div className="grid grid-2">
            {org.legalEntities.map(entity => {
              const meta = KYB_STATUS_META[entity.kybStatus] ?? KYB_STATUS_META.draft
              return (
                <Card key={entity.id}>
                  <CardBody>
                    <div className="row between gap-3 wrap">
                      <div className="grow">
                        <p className="org-block__title">{entity.legalName}</p>
                        <p className="org-block__meta">
                          {countryLabel(entity.country)} · {entityRoleLabel(entity.role)}
                          {entity.entityType ? ` · ${entityTypeLabel(entity.entityType)}` : ''}
                        </p>
                      </div>
                      <Badge tone={meta.tone} dot>{meta.label}</Badge>
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* ---------------------------- diálogos -------------------------- */}
      <Dialog
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        title="Solicitar actualización de datos legales"
        description="El cambio requiere una nueva revisión de cumplimiento."
        footer={(
          <>
            <Button variant="ghost" size="sm" onClick={() => setRequestOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={submitRequest}>Enviar solicitud</Button>
          </>
        )}
      >
        <div className="stack gap-4">
          <Field label="Dato a actualizar" htmlFor="req-field" required error={requestError && !requestField ? requestError : undefined}>
            <Select
              id="req-field"
              placeholder="Elige el dato"
              options={LOCKED_FIELDS}
              value={requestField}
              onChange={e => { setRequestField(e.target.value); setRequestError('') }}
            />
          </Field>
          <Field
            label="Motivo del cambio"
            htmlFor="req-reason"
            required
            hint="Indica qué cambió y desde cuándo. Pueden solicitarse documentos de respaldo."
            error={requestError && requestField ? requestError : undefined}
          >
            <Textarea
              id="req-reason"
              rows={4}
              value={requestReason}
              onChange={e => { setRequestReason(e.target.value); setRequestError('') }}
            />
          </Field>
        </div>
      </Dialog>

      <Dialog
        open={entityOpen}
        onClose={() => setEntityOpen(false)}
        title="Agregar entidad jurídica"
        description="La entidad se guardará como borrador."
        footer={(
          <>
            <Button variant="ghost" size="sm" onClick={() => setEntityOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={submitEntity}>Agregar entidad</Button>
          </>
        )}
      >
        <div className="stack gap-4">
          <Field label="Razón social" htmlFor="ent-name" required error={entityErrors.legalName}>
            <Input
              id="ent-name"
              value={entityDraft.legalName}
              invalid={Boolean(entityErrors.legalName)}
              onChange={e => setEntityDraft(d => ({ ...d, legalName: e.target.value }))}
            />
          </Field>
          <Field label="País de constitución" htmlFor="ent-country" required error={entityErrors.country}>
            <Select
              id="ent-country"
              placeholder="Elige el país"
              options={COUNTRIES}
              value={entityDraft.country}
              onChange={e => setEntityDraft(d => ({ ...d, country: e.target.value }))}
            />
          </Field>
          <Field label="Tipo de sociedad" htmlFor="ent-type" required error={entityErrors.entityType}>
            <Select
              id="ent-type"
              placeholder="Elige el tipo"
              options={ENTITY_TYPES}
              value={entityDraft.entityType}
              onChange={e => setEntityDraft(d => ({ ...d, entityType: e.target.value }))}
            />
          </Field>
          <Field label="Relación con el grupo" htmlFor="ent-role">
            <Select
              id="ent-role"
              options={ENTITY_ROLES}
              value={entityDraft.role}
              onChange={e => setEntityDraft(d => ({ ...d, role: e.target.value }))}
            />
          </Field>
        </div>
      </Dialog>
    </>
  )
}
