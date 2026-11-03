/* =============================================================
   Config Org — API e integraciones (/org/api).

   Las credenciales nunca se muestran de verdad. Lo que se revela
   es un valor ficticio de demo, y la interfaz lo dice de frente.
   MCP aparece como capacidad experimental, no como producto.
   ============================================================= */
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Eye, EyeOff, KeyRound, Webhook } from 'lucide-react'

import {
  Badge, Button, Callout, Card, CardBody, CardFooter, CardHeader, DefinitionList,
  EmptyState, Skeleton, Table, useToast,
} from '../../ui'
import { useDemoState } from '../../state/DemoState'
import {
  API_CREDENTIALS, INTEGRATION_RESOURCES, WEBHOOKS, WEBHOOK_STATUS_META,
} from '../../mock/integrations'
import './org.css'

/** Valor ficticio de demostración. No corresponde a ninguna credencial real. */
const demoValue = credential => `${credential.prefix}demo_0000_no_es_una_clave_real`

const RESOURCE_TONE = {
  Disponible: 'success',
  Experimental: 'warning',
  'En evaluación': 'info',
}

export default function OrgApi() {
  const { state, actions } = useDemoState()
  const toast = useToast()

  // Los webhooks se consultan al proveedor: mostramos el estado de carga.
  const [loadingWebhooks, setLoadingWebhooks] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setLoadingWebhooks(false), 650)
    return () => clearTimeout(timer)
  }, [])

  const revealed = state.apiKeysRevealed
  const productionRequestedAt = state.organization.apiProductionRequestedAt ?? null

  const toggleReveal = () => {
    actions.revealApiKeys(!revealed)
    toast.push({
      tone: revealed ? 'info' : 'warning',
      title: revealed ? 'Credenciales ocultas de nuevo' : 'Mostrando un valor de demostración',
      description: revealed
        ? 'Volvimos a enmascarar los valores.'
        : 'No es una credencial real: la demo nunca expone secretos productivos.',
    })
  }

  const copy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.push({ tone: 'success', title: 'Copiado al portapapeles', description: `${label} (valor de demostración).` })
    } catch {
      toast.push({
        tone: 'danger',
        title: 'No pudimos copiar',
        description: 'El navegador bloqueó el portapapeles. Selecciona el texto y cópialo a mano.',
      })
    }
  }

  const requestProduction = () => {
    actions.patchOrganization({ apiProductionRequestedAt: new Date().toISOString() })
    toast.push({
      tone: 'info',
      title: 'Activación productiva solicitada',
      description: 'El equipo técnico revisa la integración antes de emitir la clave productiva.',
    })
  }

  return (
    <>
      <header className="page__head">
        <h1 className="page__title">API e integraciones</h1>
        <p className="page__lead">
          Credenciales, webhooks y recursos para conectar tus sistemas. Integrarse es opcional: la
          organización puede operar completa desde el dashboard.
        </p>
      </header>

      <Callout tone="warning" title="Las credenciales de esta demo son ficticias">
        <p className="ray-body-sm">
          Nunca mostramos una clave real en pantalla. En producción, la clave completa se ve una sola
          vez al emitirla y después queda enmascarada para siempre.
        </p>
      </Callout>

      {/* ------------------------- credenciales -------------------------- */}
      <section className="section">
        <div className="section__head">
          <div>
            <h2 className="section__title">Credenciales</h2>
            <p className="section__desc">Un par de claves por ambiente. Sandbox y producción no se mezclan.</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={revealed ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
            onClick={toggleReveal}
          >
            {revealed ? 'Ocultar valores' : 'Revelar valores'}
          </Button>
        </div>

        <div className="grid grid-2">
          {API_CREDENTIALS.map(credential => {
            const pending = Boolean(credential.requiresActivation)
            const value = revealed && !pending ? demoValue(credential) : `${credential.prefix}${credential.masked}`
            return (
              <Card key={credential.id}>
                <CardHeader
                  title={credential.label}
                  description={credential.environment === 'sandbox' ? 'Ambiente de pruebas' : 'Ambiente productivo'}
                  actions={(
                    <Badge tone={pending ? 'warning' : 'success'} dot>
                      {pending ? 'Pendiente de activación' : 'Activa'}
                    </Badge>
                  )}
                />
                <CardBody>
                  <code className="org-secret">{value}</code>
                  <div style={{ marginTop: 'var(--ray-space-4)' }}>
                    <DefinitionList
                      columns={2}
                      items={[
                        { label: 'Creada', value: credential.createdAt ?? 'Sin emitir' },
                        { label: 'Último uso', value: credential.lastUsed ?? 'Sin registros' },
                      ]}
                    />
                  </div>
                  {pending && (
                    <p className="org-inline-note" style={{ display: 'block', marginTop: 'var(--ray-space-3)' }}>
                      {productionRequestedAt
                        ? `Activación solicitada el ${new Date(productionRequestedAt).toLocaleDateString('es-CL')}. Te avisamos al correo operativo.`
                        : 'La clave productiva se emite después de validar la integración en sandbox.'}
                    </p>
                  )}
                </CardBody>
                <CardFooter>
                  <div className="row gap-2 wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Copy size={14} aria-hidden="true" />}
                      disabled={pending}
                      onClick={() => copy(value, credential.label)}
                    >
                      Copiar
                    </Button>
                    {pending && (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={Boolean(productionRequestedAt)}
                        onClick={requestProduction}
                      >
                        {productionRequestedAt ? 'Solicitud enviada' : 'Solicitar activación'}
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </section>

      {/* ---------------------------- webhooks --------------------------- */}
      <section className="section">
        <div className="section__head">
          <div>
            <h2 className="section__title">Webhooks</h2>
            <p className="section__desc">Eventos que empujamos a tus endpoints, con su tasa de entrega.</p>
          </div>
        </div>

        <Card>
          {loadingWebhooks ? (
            <CardBody>
              <div className="stack gap-3" aria-busy="true">
                <Skeleton height={18} width="40%" />
                <Skeleton height={14} />
                <Skeleton height={14} />
                <Skeleton height={14} width="70%" />
              </div>
              <p className="org-inline-note" style={{ display: 'block', marginTop: 'var(--ray-space-3)' }}>
                Consultando el estado de entrega…
              </p>
            </CardBody>
          ) : (
            <Table
              caption="Webhooks configurados"
              columns={[
                {
                  key: 'event',
                  header: 'Evento',
                  render: w => (
                    <div>
                      <span className="org-cell-main ray-mono" style={{ display: 'block' }}>{w.event}</span>
                      <span className="org-cell-sub truncate" style={{ display: 'block' }}>{w.url}</span>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Estado',
                  render: w => {
                    const meta = WEBHOOK_STATUS_META[w.status]
                    return <Badge tone={meta.tone} dot>{meta.label}</Badge>
                  },
                },
                { key: 'lastDelivery', header: 'Última entrega', render: w => <span className="org-cell-sub">{w.lastDelivery ?? 'Sin entregas'}</span> },
                { key: 'successRate', header: 'Tasa de entrega', align: 'right', render: w => <span className="ray-num">{w.successRate ?? '—'}</span> },
                {
                  key: 'actions',
                  header: 'Acciones',
                  align: 'right',
                  render: w => (
                    <div className="org-cell-actions">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Copy size={14} aria-hidden="true" />}
                        onClick={() => copy(w.url, `Endpoint de ${w.event}`)}
                      >
                        Copiar endpoint
                      </Button>
                    </div>
                  ),
                },
              ]}
              rows={WEBHOOKS}
              rowKey={w => w.id}
              empty={(
                <CardBody>
                  <EmptyState
                    icon={<Webhook size={20} aria-hidden="true" />}
                    title="Todavía no hay webhooks"
                    description="Configura un endpoint para recibir abonos, cambios de estado de pagos y actualizaciones de compliance."
                  />
                </CardBody>
              )}
            />
          )}
        </Card>
      </section>

      {/* --------------------------- recursos ---------------------------- */}
      <section className="section">
        <div className="section__head">
          <div>
            <h2 className="section__title">Recursos de integración</h2>
            <p className="section__desc">Lo que está disponible hoy y lo que todavía estamos probando.</p>
          </div>
        </div>

        <div className="grid grid-2">
          {INTEGRATION_RESOURCES.map(resource => (
            <Card key={resource.id}>
              <CardBody>
                <div className="row between gap-3 wrap">
                  <div className="grow">
                    <p className="org-block__title">{resource.title}</p>
                    <p className="org-block__meta">{resource.description}</p>
                  </div>
                  <Badge tone={RESOURCE_TONE[resource.state] ?? 'neutral'} dot>{resource.state}</Badge>
                </div>
                {resource.id === 'mcp' && (
                  <p className="org-inline-note" style={{ display: 'block', marginTop: 'var(--ray-space-3)' }}>
                    Capacidad experimental: permitiría que un agente consulte saldos y movimientos con
                    permisos acotados. Todavía no está habilitada para organizaciones.
                  </p>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="section">
        <Callout tone="info" title="Seguridad de las credenciales" icon={<KeyRound size={16} aria-hidden="true" />}>
          <p className="ray-body-sm">
            Guarda las claves en tu gestor de secretos, nunca en el repositorio. Si sospechas de una
            filtración, revócala y emite una nueva: las claves anteriores dejan de funcionar al instante.
          </p>
          <p className="ray-body-sm" style={{ marginTop: 'var(--ray-space-2)' }}>
            <Link to="/org/users">Revisar quién tiene acceso a la organización</Link>
          </p>
        </Callout>
      </section>
    </>
  )
}
