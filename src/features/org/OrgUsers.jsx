import { ContentDetails } from '../../ui'
/* =============================================================
   Config Org — usuarios y roles (/org/users).

   Regla dura: la organización nunca puede quedarse sin ningún
   Organization Admin activo. La interfaz lo valida y lo explica en
   vez de fallar en silencio.
   ============================================================= */
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MailPlus, UserMinus, UserPlus, X } from 'lucide-react'

import {
  Avatar, Badge, Button, Callout, Card, CardBody, CardHeader, Dialog, EmptyState,
  Field, IconButton, Input, Select, Table, useToast,
} from '../../ui'
import { useDemoState } from '../../state/DemoState'
import { MEMBER_STATUS_META, ROLES, roleLabel } from '../../mock/roles'
import './org.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const ADMIN_ROLE = 'org_admin'

export default function OrgUsers() {
  const { state, actions } = useDemoState()
  const toast = useToast()

  const [inviteOpen, setInviteOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('operator')
  const [errors, setErrors] = useState({})

  const activeAdmins = useMemo(
    () => state.team.filter(m => m.role === ADMIN_ROLE && m.status === 'active'),
    [state.team],
  )

  /** Si esta persona es el último admin activo, nadie puede quedarse sin acceso. */
  const isLastAdmin = member => member.role === ADMIN_ROLE
    && member.status === 'active'
    && activeAdmins.length === 1

  const warnLastAdmin = () => toast.push({
    tone: 'danger',
    title: 'Debe quedar un administrador activo',
    description: 'Asigna otro administrador antes de cambiar o desactivar al último.',
  })

  const changeRole = (member, nextRole) => {
    if (nextRole === member.role) return
    if (isLastAdmin(member) && nextRole !== ADMIN_ROLE) { warnLastAdmin(); return }
    actions.setMemberRole(member.id, nextRole)
    toast.push({
      tone: 'success',
      title: 'Rol actualizado',
      description: `${member.name} ahora es ${roleLabel(nextRole)}.`,
    })
  }

  const changeStatus = (member, nextStatus) => {
    if (nextStatus === 'disabled' && isLastAdmin(member)) { warnLastAdmin(); return }
    actions.setMemberStatus(member.id, nextStatus)
    toast.push({
      tone: nextStatus === 'active' ? 'success' : 'info',
      title: nextStatus === 'active' ? 'Acceso reactivado' : 'Acceso desactivado',
      description: nextStatus === 'active'
        ? `${member.name} puede volver a ingresar.`
        : `${member.name} ya no tiene acceso a la organización.`,
    })
  }

  const submitInvite = () => {
    const next = {}
    if (!EMAIL_RE.test(email.trim())) next.email = 'Escribe un correo válido.'
    else if (state.team.some(m => m.email.toLowerCase() === email.trim().toLowerCase())) {
      next.email = 'Este correo ya tiene acceso.'
    } else if (state.invitations.some(i => i.email.toLowerCase() === email.trim().toLowerCase())) {
      next.email = 'Este correo ya tiene una invitación pendiente.'
    }
    if (!role) next.role = 'Selecciona un rol.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    actions.invite(email.trim().toLowerCase(), role)
    setInviteOpen(false)
    setEmail('')
    setRole('operator')
    setErrors({})
    toast.push({
      tone: 'success',
      title: 'Invitación enviada',
      description: `${email.trim().toLowerCase()} entrará como ${roleLabel(role)} al aceptar.`,
    })
  }

  const cancelInvitation = invitation => {
    actions.cancelInvitation(invitation.id)
    toast.push({
      tone: 'info',
      title: 'Invitación cancelada',
      description: `El enlace enviado a ${invitation.email} deja de ser válido.`,
    })
  }

  /* ------------------------------ columnas ----------------------------- */
  const memberColumns = [
    {
      key: 'member',
      header: 'Persona',
      render: m => (
        <div className="row gap-3">
          <Avatar name={m.name} size="sm" muted={m.status !== 'active'} />
          <div className="grow">
            <span className="org-cell-main truncate" style={{ display: 'block' }}>{m.name}</span>
            <span className="org-cell-sub truncate" style={{ display: 'block' }}>{m.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rol',
      render: m => (
        <Select
          aria-label={`Rol de ${m.name}`}
          options={ROLES}
          value={m.role}
          onChange={e => changeRole(m, e.target.value)}
        />
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: m => {
        const meta = MEMBER_STATUS_META[m.status] ?? MEMBER_STATUS_META.active
        return <Badge tone={meta.tone} dot>{meta.label}</Badge>
      },
    },
    { key: 'lastActive', header: 'Última actividad', render: m => <span className="org-cell-sub">{m.lastActive}</span> },
    {
      key: 'actions',
      header: 'Acceso',
      align: 'right',
      render: m => (
        <div className="org-cell-actions">
          {m.status === 'disabled' ? (
            <Button variant="ghost" size="sm" onClick={() => changeStatus(m, 'active')}>Reactivar</Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              icon={<UserMinus size={14} aria-hidden="true" />}
              onClick={() => changeStatus(m, 'disabled')}
            >
              Desactivar
            </Button>
          )}
        </div>
      ),
    },
  ]

  const invitationColumns = [
    { key: 'email', header: 'Correo', render: i => <span className="org-cell-main">{i.email}</span> },
    { key: 'role', header: 'Rol asignado', render: i => roleLabel(i.role) },
    {
      key: 'invitedAt',
      header: 'Enviada',
      render: i => <span className="org-cell-sub">{new Date(i.invitedAt).toLocaleDateString('es-CL')}</span>,
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      render: i => (
        <div className="org-cell-actions">
          <IconButton label={`Cancelar la invitación de ${i.email}`} bordered onClick={() => cancelInvitation(i)}>
            <X size={15} />
          </IconButton>
        </div>
      ),
    },
  ]

  return (
    <>
      <header className="page__head">
        <h1 className="page__title">Usuarios y roles</h1>
        <p className="page__lead">
          Invita a tu equipo y asigna sus permisos.
        </p>
      </header>

      {activeAdmins.length === 1 && (
        <Callout tone="warning" title="Solo hay un administrador activo">
          <p className="ray-body-sm">
            Asigna otro administrador para conservar el acceso si el actual no está disponible.
          </p>
        </Callout>
      )}

      <section className="section">
        <div className="section__head">
          <div>
            <h2 className="section__title">Personas con acceso</h2>
            <p className="section__desc">
              {state.team.length} {state.team.length === 1 ? 'persona registrada' : 'personas registradas'} ·
              {' '}{activeAdmins.length} {activeAdmins.length === 1 ? 'administrador activo' : 'administradores activos'}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<UserPlus size={15} aria-hidden="true" />}
            onClick={() => setInviteOpen(true)}
          >
            Invitar miembro
          </Button>
        </div>

        <Card>
          <Table
            caption="Personas con acceso a la organización"
            columns={memberColumns}
            rows={state.team}
            rowKey={m => m.id}
            empty={(
              <CardBody>
                <EmptyState
                  icon={<UserPlus size={20} aria-hidden="true" />}
                  title="Todavía no hay personas registradas"
                  description="Invita a tu equipo y asigna un rol a cada persona."
                  action={<Button variant="primary" size="sm" onClick={() => setInviteOpen(true)}>Invitar miembro</Button>}
                />
              </CardBody>
            )}
          />
        </Card>
      </section>

      <section className="section">
        <div className="section__head">
          <div>
            <h2 className="section__title">Invitaciones pendientes</h2>
            <p className="section__desc">Cancelar invalida el enlace de invitación.</p>
          </div>
        </div>

        <Card>
          <Table
            caption="Invitaciones pendientes"
            columns={invitationColumns}
            rows={state.invitations}
            rowKey={i => i.id}
            empty={(
              <CardBody>
                <EmptyState
                  icon={<MailPlus size={20} aria-hidden="true" />}
                  title="No hay invitaciones pendientes"
                  description="Las invitaciones aparecerán aquí."
                />
              </CardBody>
            )}
          />
        </Card>
      </section>

<ContentDetails summary="Permisos por rol">
      <section className="section">
        <div className="section__head">
          <div>
            <h2 className="section__title">Qué puede hacer cada rol</h2>
            <p className="section__desc">
              Configura los límites en Permisos y aprobaciones.
            </p>
          </div>
          <Link className="btn btn--secondary btn--sm" to="/org/approvals">Configurar permisos</Link>
        </div>

        <Card>
          <CardBody>
            {ROLES.map(r => {
              const count = state.team.filter(m => m.role === r.value).length
              return (
                <div key={r.value} className="org-role">
                  <div className="row between gap-3 wrap">
                    <p className="org-role__name">{r.label}</p>
                    <Badge tone="neutral">
                      {count} {count === 1 ? 'persona' : 'personas'}
                    </Badge>
                  </div>
                  <p className="org-role__desc">{r.description}</p>
                </div>
              )
            })}
          </CardBody>
        </Card>
      </section>
</ContentDetails>

      <Dialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invitar a la organización"
        description="Invitación simulada. No se envía un correo."
        footer={(
          <>
            <Button variant="ghost" size="sm" onClick={() => setInviteOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={submitInvite}>Enviar invitación</Button>
          </>
        )}
      >
        <div className="stack gap-4">
          <Field label="Correo electrónico" htmlFor="invite-email" required error={errors.email}>
            <Input
              id="invite-email"
              type="email"
              inputMode="email"
              autoComplete="off"
              placeholder="nombre@empresa.cl"
              value={email}
              invalid={Boolean(errors.email)}
              onChange={e => { setEmail(e.target.value); setErrors(x => ({ ...x, email: undefined })) }}
            />
          </Field>
          <Field
            label="Rol"
            htmlFor="invite-role"
            required
            error={errors.role}
            hint={ROLES.find(r => r.value === role)?.description}
          >
            <Select
              id="invite-role"
              options={ROLES}
              value={role}
              onChange={e => setRole(e.target.value)}
            />
          </Field>
        </div>
      </Dialog>
    </>
  )
}
