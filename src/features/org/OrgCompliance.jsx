import React from 'react'
import { Link } from 'react-router-dom'
import { Badge, Callout, Card, CardBody, CardHeader, DefinitionList, Table } from '../../ui'
import { useDemoState } from '../../state/DemoState'
import { KYB_STATUS_META, IDENTITY_STATUS_META, SECTION_STATUS_META } from '../../state/statuses'
import { KYB_SECTIONS } from '../../mock/compliance'
import './org.css'

export default function OrgCompliance() {
  const { state } = useDemoState()
  const kyb = KYB_STATUS_META[state.kybStatus]
  const identity = IDENTITY_STATUS_META[state.identityStatus]
  return <>
    <header className="page__head"><h1 className="page__title">Documentación y cumplimiento</h1><p className="page__lead">Consulta la verificación y los documentos de tu empresa.</p></header>
    <div className="grid grid-2">
      <Card><CardHeader title="Verificación empresarial" actions={<Badge tone={kyb.tone}>{kyb.label}</Badge>} /><CardBody>
        <p className="ray-body-sm">{kyb.description}</p><Link to="/onboarding/business">Revisar expediente KYB</Link>
      </CardBody></Card>
      <Card><CardHeader title="Verificación de identidad" actions={<Badge tone={identity.tone}>{identity.label}</Badge>} /><CardBody><Link to="/onboarding/identity">Ver validación de identidad</Link></CardBody></Card>
    </div>
    <section className="section"><Card><CardHeader title="Secciones del expediente" /><CardBody><Table rows={KYB_SECTIONS} rowKey={r => r.id} columns={[
      { key: 'title', header: 'Sección', render: r => r.title },
      { key: 'status', header: 'Estado', render: r => { const meta = SECTION_STATUS_META[state.kybSections[r.id]]; return <Badge tone={meta.tone}>{meta.label}</Badge> } },
    ]} /></CardBody></Card></section>
    {state.kybObservations.length > 0 && <Callout tone="warning" title="Observaciones pendientes">{state.kybObservations.map(o => <p key={o.id}>{o.title}: {o.detail}</p>)}<Link to="/onboarding/business">Corregir observaciones</Link></Callout>}
    <section className="section"><Card><CardHeader title="Términos y documentación" /><CardBody>
      <DefinitionList items={[
        { label: 'Versión aceptada', value: state.user.termsVersion || 'Sin aceptación registrada' },
        { label: 'Aceptación', value: state.user.acceptedAt ? new Date(state.user.acceptedAt).toLocaleString('es-CL') : 'Pendiente' },
        { label: 'Expediente', value: state.onboardingDraftId || 'Pendiente' },
      ]} />
      <p className="ray-body-sm text-secondary">Demo: no se suben documentos ni se firman contratos bancarios.</p>
    </CardBody></Card></section>
  </>
}
