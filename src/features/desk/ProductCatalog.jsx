import { ContentDetails } from '../../ui'
/* =============================================================
   D · Merchant Desk — Catálogo de productos.

   El producto base de una cuenta habilitada es cuenta vista +
   cuentas virtuales. Todo lo demás exige solicitud, evaluación y
   activación propias: acá se inicia esa solicitud, y el estado del
   producto cambia a la vista.
   ============================================================= */
import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CircleSlash, Layers, Sparkles, Wallet } from 'lucide-react'

import {
  Badge, Button, Callout, Card, CardBody, CardFooter, CardHeader, Dialog,
  Divider, Field, Skeleton, Textarea, useToast,
} from '../../ui'
import { ADDITIONAL_PRODUCTS, CORE_PRODUCTS } from '../../mock/products'
import { PRODUCT_STATUS, PRODUCT_STATUS_META } from '../../state/statuses'
import { useDemoState } from '../../state/DemoState'
import { formatDate, useDeskLoad } from './shared'

const CORE_LINK = {
  core_account: { to: '/desk', label: 'Ver saldos y cuentas', icon: Wallet },
  virtual_accounts: { to: '/desk/virtual-accounts', label: 'Gestionar cuentas virtuales', icon: Layers },
}

export default function ProductCatalog() {
  const { state, actions } = useDemoState()
  const toast = useToast()
  const { loading } = useDeskLoad()
  const [requesting, setRequesting] = useState(null)

  const statusOf = id => state.products[id] ?? PRODUCT_STATUS.NOT_AVAILABLE

  const requestByProduct = useMemo(() => {
    const map = {}
    state.productRequests.forEach(req => {
      if (!map[req.productId]) map[req.productId] = req
    })
    return map
  }, [state.productRequests])

  const confirmRequest = note => {
    const product = requesting
    setRequesting(null)
    if (!product) return
    actions.requestProduct(product.id, note)
    toast?.push({
      tone: 'success',
      title: 'Solicitud registrada',
      description: `${product.name} quedó en estado solicitado. Consulta su estado en Productos.`,
    })
  }

  return (
    <>
      <div className="page__head">
        <h1 className="page__title">Productos</h1>
        <p className="page__lead">
          Consulta tus productos y solicita nuevos servicios.
        </p>
      </div>

      {/* --------------------------- Base --------------------------- */}
      <section className="section" aria-labelledby="sec-base">
        <div className="section__head">
          <div>
            <h2 className="section__title" id="sec-base">Incluidos con la cuenta habilitada</h2>
            <p className="section__desc">Se habilitan al activar la cuenta vista, sin una solicitud adicional.</p>
          </div>
        </div>

        <div className="grid grid-2">
          {loading
            ? [0, 1].map(i => (
              <Card key={i} level="low"><CardBody><Skeleton width="55%" height={18} /><div style={{ height: 'var(--ray-space-3)' }} /><Skeleton width="100%" /></CardBody></Card>
            ))
            : CORE_PRODUCTS.map(product => (
              <CoreCard key={product.id} product={product} status={statusOf(product.id)} />
            ))}
        </div>
      </section>

      {/* ------------------------ Adicionales ------------------------ */}
      <section className="section" aria-labelledby="sec-adicionales">
        <div className="section__head">
          <div>
            <h2 className="section__title" id="sec-adicionales">Productos adicionales</h2>
            <p className="section__desc">Cada producto requiere evaluación y activación.</p>
          </div>
        </div>

        <div className="desk-product-grid">
          {loading
            ? [0, 1, 2, 3].map(i => (
              <Card key={i} level="low">
                <CardBody>
                  <Skeleton width="50%" height={18} />
                  <div style={{ height: 'var(--ray-space-3)' }} />
                  <Skeleton width="100%" />
                  <div style={{ height: 'var(--ray-space-2)' }} />
                  <Skeleton width="80%" />
                </CardBody>
              </Card>
            ))
            : ADDITIONAL_PRODUCTS.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                status={statusOf(product.id)}
                request={requestByProduct[product.id]}
                onRequest={() => setRequesting(product)}
              />
            ))}
        </div>
      </section>

      <RequestDialog
        product={requesting}
        onClose={() => setRequesting(null)}
        onConfirm={confirmRequest}
      />
    </>
  )
}

/* --------------------------- subcomponentes -------------------------- */

function CoreCard({ product, status }) {
  const navigate = useNavigate()
  const meta = PRODUCT_STATUS_META[status]
  const link = CORE_LINK[product.id]
  const Icon = link?.icon ?? Sparkles
  const operable = status === PRODUCT_STATUS.ACTIVE

  return (
    <Card level="medium">
      <CardHeader
        title={product.name}
        description={product.summary}
        actions={<Badge tone={meta.tone} dot>{meta.label}</Badge>}
      />
      <Divider />
      <CardBody>
        <ContentDetails summary="Qué incluye"><ul className="desk-list">
          {product.capabilities.map(cap => (
            <li key={cap}><span className="desk-list__marker" aria-hidden="true" />{cap}</li>
          ))}
        </ul></ContentDetails>
      </CardBody>
      <CardFooter>
        {operable ? (
          <Button
            variant="secondary"
            size="sm"
            icon={<Icon size={15} aria-hidden="true" />}
            onClick={() => navigate(link.to)}
          >
            {link.label}
          </Button>
        ) : (
          <p className="ray-body-sm text-secondary">
            Se habilita cuando la cuenta vista queda activa.
          </p>
        )}
      </CardFooter>
    </Card>
  )
          }

          function ProductCard({ product, status, request, onRequest }) {
  const meta = PRODUCT_STATUS_META[status]

  return (
    <Card level={status === PRODUCT_STATUS.ACTIVE ? 'medium' : 'low'}>
      <CardHeader
        title={product.name}
        description={product.summary}
        actions={<Badge tone={meta.tone} dot>{meta.label}</Badge>}
      />
      <Divider />
      <CardBody>
        <ContentDetails summary="Requisitos y características">
          <div className="grid grid-2">
          <div>
            <p className="desk-balance__label">Requisitos</p>
            <ul className="desk-list" style={{ marginTop: 'var(--ray-space-2)' }}>
              {(product.requirements ?? []).map(req => (
                <li key={req}><span className="desk-list__marker" aria-hidden="true" />{req}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="desk-balance__label">Características</p>
            <ul className="desk-list" style={{ marginTop: 'var(--ray-space-2)' }}>
              {(product.capabilities ?? []).map(cap => (
                <li key={cap}><span className="desk-list__marker" aria-hidden="true" />{cap}</li>
              ))}
            </ul>
          </div>
        </div>
        </ContentDetails>

        <p className="ray-caption text-tertiary" style={{ marginTop: 'var(--ray-space-4)' }}>
          {product.reviewDays
            ? `Plazo estimado de evaluación: ${product.reviewDays}.`
            : 'Plazo sujeto a evaluación.'}
        </p>

        <ProductStateNote product={product} status={status} request={request} />
      </CardBody>
      <CardFooter>
        <ProductAction product={product} status={status} onRequest={onRequest} />
      </CardFooter>
    </Card>
  )
          }

          /** Explica, en una frase, en qué punto del proceso está el producto. */
          function ProductStateNote({ product, status, request }) {
  if (status === PRODUCT_STATUS.NOT_AVAILABLE) {
    return (
      <div style={{ marginTop: 'var(--ray-space-4)' }}>
        <Callout tone="info" title="Por qué no está disponible" icon={<CircleSlash size={16} aria-hidden="true" />}>
          <p className="ray-body-sm">
            {product.unavailableReason ?? 'No disponible para el país de constitución de tu empresa.'}
          </p>
        </Callout>
      </div>
    )
  }

  if (status === PRODUCT_STATUS.REQUESTED || status === PRODUCT_STATUS.IN_REVIEW) {
    return (
      <div style={{ marginTop: 'var(--ray-space-4)' }}>
        <Callout tone="info" title={status === PRODUCT_STATUS.REQUESTED ? 'Solicitud registrada' : 'Solicitud en evaluación'}>
          <p className="ray-body-sm">
            {request?.requestedAt
              ? `Enviada el ${formatDate(request.requestedAt)}. `
              : ''}
            Consulta el estado de tu solicitud en este catálogo.
          </p>
          {request?.note && <p className="ray-caption text-tertiary">Nota enviada: {request.note}</p>}
        </Callout>
      </div>
    )
  }

  if (status === PRODUCT_STATUS.PENDING_CONFIGURATION) {
    return (
      <div style={{ marginTop: 'var(--ray-space-4)' }}>
        <Callout tone="warning" title="Falta configurarlo">
          <p className="ray-body-sm">
            Evaluación aprobada. Completa la configuración en Config Org para operar.
          </p>
        </Callout>
      </div>
    )
  }

  if (status === PRODUCT_STATUS.REJECTED) {
    return (
      <div style={{ marginTop: 'var(--ray-space-4)' }}>
        <Callout tone="danger" title="Solicitud rechazada">
          <p className="ray-body-sm">
            Solicitud rechazada. Contacta a tu ejecutivo para revisar el motivo.
          </p>
        </Callout>
      </div>
    )
  }

  if (status === PRODUCT_STATUS.DISABLED) {
    return (
      <div style={{ marginTop: 'var(--ray-space-4)' }}>
        <Callout tone="warning" title="Producto deshabilitado">
          <p className="ray-body-sm">El producto está deshabilitado y no permite operar.</p>
        </Callout>
      </div>
    )
  }

  return null
          }

          /** El control que corresponde al estado: nunca un botón decorativo. */
          function ProductAction({ product, status, onRequest }) {
  if (status === PRODUCT_STATUS.AVAILABLE_TO_REQUEST) {
    return (
      <Button variant="brand" size="sm" icon={<Sparkles size={15} aria-hidden="true" />} onClick={onRequest}>
        Solicitar producto
      </Button>
    )
  }

  if (status === PRODUCT_STATUS.REQUESTED || status === PRODUCT_STATUS.IN_REVIEW) {
    return (
      <Button variant="secondary" size="sm" disabled title="La solicitud ya está en curso">
        Solicitud en curso
      </Button>
    )
  }

  if (status === PRODUCT_STATUS.PENDING_CONFIGURATION) {
    return <Link to="/org/products">Configurar en Config Org</Link>
  }

  if (status === PRODUCT_STATUS.ACTIVE) {
    return (
      <div className="row wrap gap-3">
        <Link to="/desk">Ver cuentas que lo usan</Link>
        <Link to="/org/products">Administrar en Config Org</Link>
      </div>
    )
  }

  if (status === PRODUCT_STATUS.NOT_AVAILABLE) {
    return (
      <Button variant="secondary" size="sm" disabled title={product.unavailableReason ?? 'No disponible para tu organización'}>
        No disponible en tu país
      </Button>
    )
  }

  if (status === PRODUCT_STATUS.REJECTED) {
    return <p className="ray-body-sm text-secondary">Contacta a tu ejecutivo para revisar el caso.</p>
  }

  return <p className="ray-body-sm text-secondary">Sin acciones disponibles en este estado.</p>
          }

          function RequestDialog({ product, onClose, onConfirm }) {
  const [note, setNote] = useState('')

  const close = () => { setNote(''); onClose() }
  const confirm = () => { onConfirm(note.trim()); setNote('') }

  return (
    <Dialog
      open={Boolean(product)}
      onClose={close}
      title={product ? `Solicitar ${product.name}` : 'Solicitar producto'}
      description="Solicitar no activa el producto: primero debe aprobarse la evaluación."
      footer={(
        <>
          <Button variant="ghost" onClick={close}>Cancelar</Button>
          <Button variant="brand" onClick={confirm}>Enviar solicitud</Button>
        </>
      )}
    >
      {product && (
        <div className="stack gap-5">
          <div>
            <p className="desk-balance__label">Qué pasa después</p>
            <ol className="desk-list" style={{ marginTop: 'var(--ray-space-2)' }}>
              <li><span className="desk-list__marker" aria-hidden="true" />Registramos tu solicitud.</li>
              <li><span className="desk-list__marker" aria-hidden="true" />Riesgo evalúa los requisitos.</li>
              <li><span className="desk-list__marker" aria-hidden="true" />Si se aprueba, configuras el producto en Config Org.</li>
              <li><span className="desk-list__marker" aria-hidden="true" />Después de activarlo, puedes usarlo en Merchant Desk.</li>
            </ol>
          </div>

          <div>
            <p className="desk-balance__label">Requisitos</p>
            <ul className="desk-list" style={{ marginTop: 'var(--ray-space-2)' }}>
              {(product.requirements ?? []).map(req => (
                <li key={req}><span className="desk-list__marker" aria-hidden="true" />{req}</li>
              ))}
            </ul>
          </div>

          <Callout tone="info" title="Plazo estimado">
            <p className="ray-body-sm">
              {product.reviewDays
                ? `La evaluación demora ${product.reviewDays}.`
                : 'Consulta el plazo con tu ejecutivo.'}
            </p>
          </Callout>

          <Field
            label="Contexto para la evaluación"
            htmlFor="req-note"
            hint="Opcional. Indica cómo usarás el producto."
          >
            <Textarea
              id="req-note"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Monedas, volúmenes estimados, países de destino…"
            />
          </Field>
        </div>
      )}
    </Dialog>
  )
          }
