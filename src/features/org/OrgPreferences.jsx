import React from 'react'
import { Card, CardBody, CardHeader, Field, Select, Switch, Callout } from '../../ui'
import { useDemoState } from '../../state/DemoState'
import './org.css'

export default function OrgPreferences() {
  const { state, actions } = useDemoState()
  const preferences = { notifications: true, securityAlerts: true, language: 'es', timezone: 'America/Santiago', ...state.organization.preferences }
  const update = patch => actions.patchOrganization({ preferences: { ...preferences, ...patch } })
  return <>
    <header className="page__head"><h1 className="page__title">Preferencias</h1><p className="page__lead">Los cambios se guardan automáticamente.</p></header>
    <Card><CardHeader title="Notificaciones" /><CardBody>
      <div className="flow__fields">
        <Switch label="Novedades de productos" checked={preferences.notifications} onChange={e => update({ notifications: e.target.checked })} />
        <Switch label="Alertas de seguridad" checked={preferences.securityAlerts} onChange={e => update({ securityAlerts: e.target.checked })} />
      </div>
    </CardBody></Card>
    <section className="section"><Card><CardHeader title="Idioma y zona horaria" /><CardBody><div className="flow__fields">
      <Field label="Idioma de la demo" htmlFor="pref-language"><Select id="pref-language" value={preferences.language} options={[{ value: 'es', label: 'Español' }]} onChange={e => update({ language: e.target.value })} /></Field>
      <Field label="Zona horaria de la organización" htmlFor="pref-zone"><Select id="pref-zone" value={preferences.timezone} options={['America/Santiago', 'America/Lima', 'America/Bogota', 'UTC']} onChange={e => update({ timezone: e.target.value })} /></Field>
    </div></CardBody></Card></section>
    <Callout tone="info" title="Preferencias de demostración">Las preferencias se guardan en este navegador. No envían avisos ni cambian la seguridad de una cuenta. La zona horaria aún no modifica las fechas de la demo.</Callout>
  </>
}
