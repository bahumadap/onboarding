/* =============================================================
   Macroproceso A — Signup.

   Registro progresivo: pide lo mínimo para crear la cuenta y deja
   toda la documentación regulatoria para el onboarding. Al cerrar
   crea tres objetos conceptuales: User, Organization y Onboarding
   Draft. La empresa todavía NO está aprobada para operar.

   El OTP y la creación de la cuenta están simulados. Donde entra el
   proveedor real queda marcado con un comentario.
   ============================================================= */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Building2, Check, FileCheck2, Mail, RefreshCw, ShieldCheck, UserRound,
} from 'lucide-react'
import {
  Button, Callout, Checkbox, Field, Input, MultiSelect, OtpInput, Select, StepsBar, useToast,
} from '../../ui'
import FlowLayout from '../../shell/FlowLayout'
import { useDemoState } from '../../state/DemoState'
import { COUNTRIES, INDUSTRIES } from '../../mock/countries'
import { TERMS_SUMMARY, TERMS_VERSION } from '../../mock/terms'
import './signup.css'

const STEPS = [
  { id: 'email', title: 'Correo electrónico' },
  { id: 'otp', title: 'Verificación' },
  { id: 'profile', title: 'Tus datos' },
  { id: 'company', title: 'Tu empresa' },
  { id: 'password', title: 'Contraseña' },
  { id: 'terms', title: 'Términos' },
  { id: 'done', title: 'Confirmación' },
]

const MAX_OTP_ATTEMPTS = 3
const RESEND_COOLDOWN_S = 30
const OTP_TTL_S = 180
/** Código fijo de la demo: permite probar el camino feliz y el de error. */
const DEMO_OTP = '123456'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

const PASSWORD_RULES = [
  { id: 'length', label: 'Al menos 10 caracteres', test: v => v.length >= 10 },
  { id: 'case', label: 'Mayúsculas y minúsculas', test: v => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { id: 'number', label: 'Al menos un número', test: v => /\d/.test(v) },
]

const ASIDE = {
  title: 'Una cuenta empresarial para operar tu plata en un solo lugar.',
  body: 'Crea tu organización en minutos. La validación regulatoria viene después, con acompañamiento.',
  items: [
    { title: 'Registro', description: 'Creas tu usuario y tu organización.', marker: '1' },
    { title: 'Onboarding', description: 'Validamos tu identidad y los datos de la empresa.', marker: '2' },
    { title: 'Cuenta habilitada', description: 'Tu cuenta vista y tus cuentas virtuales quedan operativas.', marker: '3' },
  ],
}

/** j***@empresa.cl — no mostramos el correo completo en pantallas compartidas. */
function maskEmail(email) {
  const [user, domain] = email.split('@')
  if (!domain) return email
  const visible = user.slice(0, 1)
  return `${visible}${'*'.repeat(Math.max(user.length - 1, 1))}@${domain}`
}

export default function SignupFlow() {
  const navigate = useNavigate()
  const toast = useToast()
  const { state, actions } = useDemoState()

  const step = Math.min(state.signupStep ?? 0, STEPS.length - 1)
  const current = STEPS[step]

  /* --- borrador local: la contraseña nunca entra al estado persistido --- */
  const [email, setEmailValue] = useState(state.user.email || '')
  const [firstName, setFirstName] = useState(state.user.firstName || '')
  const [lastName, setLastName] = useState(state.user.lastName || '')
  const [company, setCompany] = useState({
    tradeName: state.organization.tradeName || '',
    industry: state.organization.industry || '',
    countryOfIncorporation: state.organization.countryOfIncorporation || '',
    operatingCountries: state.organization.operatingCountries || [],
  })
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState(null)
  const [otpExpired, setOtpExpired] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState({})

  const headingRef = useRef(null)

  // El foco viaja al título en cada paso: con teclado o lector de pantalla
  // el cambio de pantalla tiene que anunciarse.
  useEffect(() => { headingRef.current?.focus() }, [step])

  /* ------------------------------ OTP ------------------------------ */
  useEffect(() => {
    if (current.id !== 'otp' || cooldown <= 0) return
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown, current.id])

  useEffect(() => {
    if (current.id !== 'otp') return
    setOtpExpired(false)
    const timer = setTimeout(() => setOtpExpired(true), OTP_TTL_S * 1000)
    return () => clearTimeout(timer)
  }, [current.id, state.user.email])

  const attemptsLeft = MAX_OTP_ATTEMPTS - state.otpAttempts
  const otpBlocked = attemptsLeft <= 0

  const sendOtp = useCallback((isResend) => {
    // Integración real: acá se llama al proveedor de OTP por correo.
    setOtp('')
    setOtpError(null)
    setOtpExpired(false)
    setCooldown(RESEND_COOLDOWN_S)
    if (isResend) {
      toast?.push({ tone: 'info', title: 'Enviamos un código nuevo', description: `Revisa ${maskEmail(email)}.` })
    }
  }, [email, toast])

  const goTo = useCallback(nextStep => {
    setErrors({})
    actions.setSignupStep(nextStep)
  }, [actions])

  const back = () => {
    if (step === 0) return
    goTo(step - 1)
  }

  /* ---------------------------- submits ---------------------------- */
  async function handleSubmit(event) {
    event.preventDefault()

    switch (current.id) {
      case 'email': {
        if (!EMAIL_RE.test(email.trim())) {
          setErrors({ email: 'Escribe un correo válido, por ejemplo nombre@empresa.cl' })
          return
        }
        setBusy(true)
        actions.setEmail(email.trim())
        // Simula la latencia del envío del código.
        await new Promise(r => setTimeout(r, 600))
        setBusy(false)
        sendOtp(false)
        goTo(1)
        return
      }

      case 'otp': {
        if (otpBlocked) return
        // El valor puede traer espacios en los casilleros vacíos.
        const code = otp.replace(/\s/g, '')
        if (!/^\d{6}$/.test(code)) {
          setOtpError('Ingresa los seis dígitos del código.')
          return
        }
        if (otpExpired) {
          setOtpError('El código expiró. Pide uno nuevo para continuar.')
          return
        }
        setBusy(true)
        await new Promise(r => setTimeout(r, 500))
        setBusy(false)
        if (code !== DEMO_OTP) {
          actions.registerOtpAttempt()
          setOtp('')
          setOtpError(
            attemptsLeft - 1 > 0
              ? `El código no coincide. Te ${attemptsLeft - 1 === 1 ? 'queda 1 intento' : `quedan ${attemptsLeft - 1} intentos`}.`
              : 'Agotaste los intentos. Pide un código nuevo para seguir.',
          )
          return
        }
        actions.verifyOtp()
        setOtpError(null)
        goTo(2)
        return
      }

      case 'profile': {
        if (!firstName.trim()) {
          setErrors({ firstName: 'Necesitamos tu nombre para crear la cuenta.' })
          return
        }
        actions.setProfile(firstName.trim(), lastName.trim())
        goTo(3)
        return
      }

      case 'company': {
        const next = {}
        if (!company.tradeName.trim()) next.tradeName = 'Escribe el nombre con el que opera tu empresa.'
        if (!company.industry) next.industry = 'Elige la actividad económica principal.'
        if (!company.countryOfIncorporation) next.countryOfIncorporation = 'Indica dónde está constituida la empresa.'
        if (company.operatingCountries.length === 0) next.operatingCountries = 'Elige al menos un país donde quieras operar.'
        if (Object.keys(next).length > 0) { setErrors(next); return }
        actions.setCompany({
          tradeName: company.tradeName.trim(),
          industry: company.industry,
          countryOfIncorporation: company.countryOfIncorporation,
          operatingCountries: company.operatingCountries,
        })
        goTo(4)
        return
      }

      case 'password': {
        const unmet = PASSWORD_RULES.filter(r => !r.test(password))
        if (unmet.length > 0) {
          setErrors({ password: 'La contraseña todavía no cumple los requisitos.' })
          return
        }
        if (password !== passwordConfirm) {
          setErrors({ passwordConfirm: 'Las contraseñas no coinciden.' })
          return
        }
        // En el producto real acá se envía la credencial al backend.
        // En la demo no se guarda ni se persiste.
        goTo(5)
        return
      }

      case 'terms': {
        if (!termsAccepted) {
          setErrors({ terms: 'Necesitamos tu aceptación para crear la cuenta.' })
          return
        }
        setBusy(true)
        actions.acceptTerms()
        await new Promise(r => setTimeout(r, 700))
        actions.completeSignup()
        setBusy(false)
        goTo(6)
        return
      }

      default:
        navigate('/onboarding')
    }
  }

  /* ---------------------------- contenido --------------------------- */
  const stepMeta = current.id === 'done'
    ? 'Registro completo'
    : `Paso ${step + 1} de ${STEPS.length - 1} · ${current.title}`

  const content = {
    email: (
      <>
        <h1 className="flow__title" tabIndex={-1} ref={headingRef}>Crea tu cuenta de YOL1 Enterprise</h1>
        <p className="flow__lead">
          Empezamos con tu correo corporativo. Te enviaremos un código para verificarlo.
        </p>
        <div className="flow__fields">
          <Field label="Correo electrónico" htmlFor="email" error={errors.email} required>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="nombre@empresa.cl"
              value={email}
              invalid={Boolean(errors.email)}
              icon={<Mail size={15} aria-hidden="true" />}
              onChange={e => setEmailValue(e.target.value)}
            />
          </Field>
        </div>
        <div className="flow__actions">
          <Button type="submit" variant="brand" size="lg" block loading={busy}>Enviar código</Button>
        </div>
        <p className="flow__footnote">
          ¿Te invitó alguien de tu equipo? Usa el enlace del correo de invitación para unirte a esa organización.
        </p>
      </>
    ),

    otp: (
      <>
        <h1 className="flow__title" tabIndex={-1} ref={headingRef}>Verifica tu correo</h1>
        <p className="flow__lead">
          Enviamos un código de seis dígitos a <strong>{maskEmail(state.user.email || email)}</strong>.
        </p>

        <div className="flow__fields">
          <Field label="Código de verificación" error={otpError}>
            <OtpInput
              value={otp}
              onChange={v => { setOtp(v); if (otpError) setOtpError(null) }}
              invalid={Boolean(otpError)}
              disabled={otpBlocked || busy}
            />
          </Field>

          {otpExpired && !otpBlocked && (
            <Callout tone="warning" title="El código expiró">
              Por seguridad los códigos duran tres minutos. Pide uno nuevo para continuar.
            </Callout>
          )}

          {otpBlocked && (
            <Callout tone="danger" title="Demasiados intentos">
              Agotaste los {MAX_OTP_ATTEMPTS} intentos con este código. Solicita uno nuevo para volver a intentarlo.
            </Callout>
          )}

          <Callout tone="brand" title="Código de la demo">
            Esta demo no envía correos. Usa <strong>{DEMO_OTP}</strong> para continuar, o escribe otro número para ver el manejo de errores.
          </Callout>
        </div>

        <div className="flow__actions">
          <Button type="submit" variant="brand" size="lg" block loading={busy} disabled={otpBlocked || otpExpired}>
            Verificar
          </Button>
        </div>

        <div className="signup__otp-meta">
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw size={14} aria-hidden="true" />}
            disabled={cooldown > 0}
            onClick={() => sendOtp(true)}
          >
            {cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Reenviar código'}
          </Button>
          {!otpBlocked && attemptsLeft < MAX_OTP_ATTEMPTS && (
            <span className="ray-caption text-tertiary">
              {attemptsLeft === 1 ? 'Te queda 1 intento' : `Te quedan ${attemptsLeft} intentos`}
            </span>
          )}
        </div>
      </>
    ),

    profile: (
      <>
        <h1 className="flow__title" tabIndex={-1} ref={headingRef}>¿Cómo te llamas?</h1>
        <p className="flow__lead">
          Serás el administrador inicial de la organización. Más adelante podrás invitar al resto del equipo.
        </p>
        <div className="flow__fields">
          <Field label="Nombre" htmlFor="firstName" error={errors.firstName} required>
            <Input
              id="firstName"
              autoComplete="given-name"
              autoFocus
              value={firstName}
              invalid={Boolean(errors.firstName)}
              onChange={e => setFirstName(e.target.value)}
            />
          </Field>
          <Field label="Apellido" htmlFor="lastName" hint="Opcional">
            <Input
              id="lastName"
              autoComplete="family-name"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
            />
          </Field>
        </div>
        <div className="flow__actions">
          <Button type="submit" variant="brand" size="lg" block>Continuar</Button>
        </div>
        <p className="flow__footnote">
          Ser el administrador inicial no implica ser representante legal, accionista ni beneficiario final: eso se determina durante el onboarding.
        </p>
      </>
    ),

    company: (
      <>
        <h1 className="flow__title" tabIndex={-1} ref={headingRef}>Cuéntanos de tu empresa</h1>
        <p className="flow__lead">
          Con esto creamos tu organización. Los datos legales y la documentación vienen después.
        </p>
        <div className="flow__fields">
          <Field label="Nombre de la empresa" htmlFor="tradeName" error={errors.tradeName} required>
            <Input
              id="tradeName"
              autoFocus
              placeholder="Como la conocen tus clientes"
              value={company.tradeName}
              invalid={Boolean(errors.tradeName)}
              icon={<Building2 size={15} aria-hidden="true" />}
              onChange={e => setCompany(c => ({ ...c, tradeName: e.target.value }))}
            />
          </Field>

          <Field label="Industria o actividad económica" htmlFor="industry" error={errors.industry} required>
            <Select
              id="industry"
              options={INDUSTRIES}
              placeholder="Elige una actividad"
              value={company.industry}
              onChange={e => setCompany(c => ({ ...c, industry: e.target.value }))}
            />
          </Field>

          <Field label="País de constitución" htmlFor="country" error={errors.countryOfIncorporation} required
            hint="Donde está legalmente constituida la sociedad.">
            <Select
              id="country"
              options={COUNTRIES}
              placeholder="Elige un país"
              value={company.countryOfIncorporation}
              onChange={e => setCompany(c => ({ ...c, countryOfIncorporation: e.target.value }))}
            />
          </Field>

          <Field
            label="Países donde quieres operar con YOL1"
            htmlFor="operating"
            error={errors.operatingCountries}
            required
            hint="Puedes elegir varios. No necesitas tener una sociedad en cada país."
          >
            <MultiSelect
              id="operating"
              options={COUNTRIES}
              value={company.operatingCountries}
              placeholder="Elige uno o más países"
              searchPlaceholder="Buscar país…"
              onChange={v => setCompany(c => ({ ...c, operatingCountries: v }))}
            />
          </Field>
        </div>
        <div className="flow__actions">
          <Button type="submit" variant="brand" size="lg" block>Continuar</Button>
        </div>
      </>
    ),

    password: (
      <>
        <h1 className="flow__title" tabIndex={-1} ref={headingRef}>Define tu contraseña</h1>
        <p className="flow__lead">Con ella entrarás a la consola de tu organización.</p>
        <div className="flow__fields">
          <Field label="Contraseña" htmlFor="password" error={errors.password} required>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              autoFocus
              value={password}
              invalid={Boolean(errors.password)}
              onChange={e => setPassword(e.target.value)}
            />
            <div className="signup__requirements">
              {PASSWORD_RULES.map(rule => {
                const met = rule.test(password)
                return (
                  <span key={rule.id} className={met ? 'signup__requirement signup__requirement--met' : 'signup__requirement'}>
                    <span className="signup__requirement-dot" aria-hidden="true">
                      {met && <Check size={9} strokeWidth={4} />}
                    </span>
                    {rule.label}
                  </span>
                )
              })}
            </div>
          </Field>

          <Field label="Repite la contraseña" htmlFor="passwordConfirm" error={errors.passwordConfirm} required>
            <Input
              id="passwordConfirm"
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              invalid={Boolean(errors.passwordConfirm)}
              onChange={e => setPasswordConfirm(e.target.value)}
            />
          </Field>
        </div>
        <div className="flow__actions">
          <Button type="submit" variant="brand" size="lg" block>Continuar</Button>
        </div>
      </>
    ),

    terms: (
      <>
        <h1 className="flow__title" tabIndex={-1} ref={headingRef}>Términos del registro</h1>
        <p className="flow__lead">
          Guardamos la versión que aceptas junto a tu usuario, con fecha y hora.
        </p>
        <div className="flow__fields">
          <div className="signup__terms">
            {TERMS_SUMMARY.map(item => (
              <div className="signup__terms-item" key={item.id}>
                <b>{item.title}</b>
                <span>{item.body}</span>
              </div>
            ))}
          </div>

          <Checkbox
            checked={termsAccepted}
            onChange={e => { setTermsAccepted(e.target.checked); if (errors.terms) setErrors({}) }}
            label={`Acepto los términos y condiciones, versión ${TERMS_VERSION}`}
            description="Incluye la autorización para validar tu identidad y los antecedentes de la empresa."
          />
          {errors.terms && <p className="field__error">{errors.terms}</p>}
        </div>
        <div className="flow__actions">
          <Button type="submit" variant="brand" size="lg" block loading={busy} disabled={!termsAccepted}>
            Crear mi cuenta
          </Button>
        </div>
      </>
    ),

    done: (
      <>
        <h1 className="flow__title" tabIndex={-1} ref={headingRef}>Tu cuenta está creada</h1>
        <p className="flow__lead">
          Registramos tu usuario y tu organización. Todavía falta validar la información para habilitar la cuenta vista.
        </p>

        <div className="signup__summary">
          <div className="signup__summary-row">
            <UserRound size={17} aria-hidden="true" className="text-brand" />
            <span className="grow">
              <b>{[state.user.firstName, state.user.lastName].filter(Boolean).join(' ') || 'Usuario'}</b>
              <span>{state.user.email} · administrador inicial</span>
            </span>
            <span className="signup__summary-id">User</span>
          </div>
          <div className="signup__summary-row">
            <Building2 size={17} aria-hidden="true" className="text-brand" />
            <span className="grow">
              <b>{state.organization.tradeName}</b>
              <span>
                {state.organization.operatingCountries.length === 1
                  ? '1 país de operación'
                  : `${state.organization.operatingCountries.length} países de operación`}
                {state.organization.id ? ` · ${state.organization.id}` : ''}
              </span>
            </span>
            <span className="signup__summary-id">Organization</span>
          </div>
          <div className="signup__summary-row">
            <FileCheck2 size={17} aria-hidden="true" className="text-brand" />
            <span className="grow">
              <b>Expediente de onboarding abierto</b>
              <span>Pendiente de validación de identidad y empresa</span>
            </span>
            <span className="signup__summary-id">{state.onboardingDraftId}</span>
          </div>
        </div>

        <div className="flow__actions">
          <Button variant="brand" size="lg" block onClick={() => navigate('/onboarding')}>
            Continuar con el onboarding
          </Button>
        </div>
        <p className="flow__footnote">
          Puedes salir y retomar cuando quieras: el avance queda guardado en tu expediente.
        </p>
      </>
    ),
  }[current.id]

  return (
    <FlowLayout
      aside={ASIDE}
      topRight={current.id !== 'done' && step > 0 && (
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} aria-hidden="true" />} onClick={back}>
          Atrás
        </Button>
      )}
    >
      <p className="flow__step-meta">{stepMeta}</p>
      {current.id !== 'done' && (
        <div style={{ marginBottom: 'var(--ray-space-6)' }}>
          <StepsBar total={STEPS.length - 1} current={step} label={`Paso ${step + 1} de ${STEPS.length - 1}`} />
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {content}
      </form>

      {current.id === 'email' && (
        <p className="flow__footnote" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={13} aria-hidden="true" />
          Demo conceptual: no se envían correos ni se guardan contraseñas.
        </p>
      )}
    </FlowLayout>
  )
}
