/* =============================================================
   Kit de UI de YOL1 Enterprise.
   Primitivas accesibles sobre los tokens del Design System.
   Todas las features consumen estos componentes; ninguna feature
   escribe colores ni tamaños propios.
   ============================================================= */
import React, {
  createContext, useCallback, useContext, useEffect, useId,
  useMemo, useRef, useState,
} from 'react'
import { createPortal } from 'react-dom'
import {
  AlertTriangle, Check, ChevronDown, Info, Search, X, CircleCheck, CircleAlert,
} from 'lucide-react'
import './ui.css'

const cx = (...parts) => parts.filter(Boolean).join(' ')

/* ----------------------------- Button ---------------------------- */
export function Button({
  variant = 'secondary', size = 'md', block, loading, icon, iconRight,
  children, className, disabled, ...rest
}) {
  return (
    <button
      type="button"
      className={cx('btn', `btn--${variant}`, `btn--${size}`, block && 'btn--block', className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  )
}

/** Botón de solo ícono. `label` es obligatorio: va como aria-label y title. */
export function IconButton({ label, children, bordered, className, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx('icon-btn', bordered && 'icon-btn--bordered', className)}
      {...rest}
    >
      {children}
    </button>
  )
}

/* ------------------------------ Card ------------------------------ */
export function Card({ level = 'low', flat, className, children, ...rest }) {
  return (
    <div className={cx('card', level !== 'low' && `card--${level}`, flat && 'card--flat', className)} {...rest}>
      {children}
    </div>
  )
}
export const CardHeader = ({ title, description, actions, children }) => (
  <div className="card__header">
    <div className="grow">
      {title && <h3 className="card__title">{title}</h3>}
      {description && <p className="card__desc">{description}</p>}
      {children}
    </div>
    {actions}
  </div>
)
export const CardBody = ({ className, children }) => <div className={cx('card__body', className)}>{children}</div>
export const CardFooter = ({ className, children }) => <div className={cx('card__footer', className)}>{children}</div>
export const Divider = () => <hr className="card__divider" />

/* --------------------------- Badge / Tag -------------------------- */
export const Badge = ({ tone = 'neutral', dot, children, className }) => (
  <span className={cx('badge', `badge--${tone}`, className)}>
    {dot && <span className="badge__dot" aria-hidden="true" />}
    {children}
  </span>
)
export const Tag = ({ tone = 'neutral', children, className }) => (
  <span className={cx('tag', `tag--${tone}`, className)}>{children}</span>
)

/* ----------------------------- Avatar ----------------------------- */
export function Avatar({ name = '', size = 'md', muted, className }) {
  const initials = useMemo(
    () => name.trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase(),
    [name],
  )
  return (
    <span className={cx('avatar', `avatar--${size}`, muted && 'avatar--muted', className)} aria-hidden="true">
      {initials}
    </span>
  )
}

/* ---------------------------- Progress ---------------------------- */
export function Progress({ value = 0, tone = 'brand', size, label }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div
      className={cx('progress', tone && `progress--${tone}`, size === 'sm' && 'progress--sm')}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="progress__fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

/* ---------------------------- Skeleton ---------------------------- */
export const Skeleton = ({ width = '100%', height = 14, radius, className }) => (
  <span
    className={cx('skeleton', className)}
    style={{ display: 'block', width, height, borderRadius: radius }}
    aria-hidden="true"
  />
)

/* ----------------------------- Field ------------------------------ */
export function Field({ label, hint, error, required, htmlFor, children, className }) {
  const messageId = useId()
  const fields = React.Children.map(children, child => {
    if (!React.isValidElement(child) || ![Input, Select, Textarea, MultiSelect, OtpInput].includes(child.type)) return child
    const description = [child.props['aria-describedby'], (error || hint) ? messageId : null].filter(Boolean).join(' ')
    return React.cloneElement(child, {
      'aria-describedby': description || undefined,
      'aria-required': required || child.props['aria-required'] || undefined,
      'aria-invalid': error ? true : child.props['aria-invalid'],
    })
  })
  return (
    <div className={cx('field', className)}>
      {label && (
        <label className="field__label" htmlFor={htmlFor}>
          {label}{required && <span className="field__required" aria-hidden="true"> *</span>}
        </label>
      )}
      {fields}
      {error
        ? <span id={messageId} className="field__error" role="alert"><CircleAlert size={13} aria-hidden="true" />{error}</span>
        : hint ? <span id={messageId} className="field__hint">{hint}</span> : null}
    </div>
  )
}

export function Input({ invalid, icon, suffix, className, ...rest }) {
  const input = (
    <input className={cx('input', invalid && 'input--invalid', className)} aria-invalid={invalid || undefined} {...rest} />
  )
  if (!icon && !suffix) return input
  return (
    <span className="input-group">
      {icon && <span className="input-group__icon">{icon}</span>}
      {input}
      {suffix && <span className="input-group__suffix">{suffix}</span>}
    </span>
  )
}

export const Textarea = ({ invalid, className, ...rest }) => (
  <textarea className={cx('textarea', invalid && 'textarea--invalid', className)} aria-invalid={invalid || undefined} {...rest} />
)

export function Select({ options = [], placeholder, className, ...rest }) {
  return (
    <span className="select-wrap">
      <select className={cx('select', className)} {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
      <ChevronDown size={15} className="select-wrap__chevron" aria-hidden="true" />
    </span>
  )
}

export const Checkbox = ({ label, description, className, ...rest }) => (
  <label className={cx('checkbox', className)}>
    <input type="checkbox" {...rest} />
    <span className="checkbox__box" aria-hidden="true"><Check size={12} strokeWidth={3.5} /></span>
    <span>
      {label && <span className="checkbox__text">{label}</span>}
      {description && <span className="checkbox__desc" style={{ display: 'block' }}>{description}</span>}
    </span>
  </label>
)

export const Radio = ({ label, description, className, ...rest }) => (
  <label className={cx('radio', className)}>
    <input type="radio" {...rest} />
    <span className="radio__dot" aria-hidden="true" />
    <span>
      <span className="checkbox__text">{label}</span>
      {description && <span className="checkbox__desc" style={{ display: 'block' }}>{description}</span>}
    </span>
  </label>
)

export const Switch = ({ label, className, ...rest }) => (
  <label className={cx('switch', className)}>
    <input type="checkbox" role="switch" {...rest} />
    <span className="switch__track" aria-hidden="true"><span className="switch__thumb" /></span>
    {label && <span className="ray-label">{label}</span>}
  </label>
)

/* --------------------------- Multiselect -------------------------- */
export function MultiSelect({ options = [], value = [], onChange, placeholder = 'Selecciona…', searchPlaceholder = 'Buscar…', id, ...rest }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef(null)
  const selected = useMemo(() => new Set(value), [value])

  useEffect(() => {
    if (!open) return
    const onDocDown = e => { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    const onKey = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDocDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(o => (o.label ?? o).toLowerCase().includes(q))
  }, [options, query])

  const toggle = useCallback(val => {
    onChange(selected.has(val) ? value.filter(v => v !== val) : [...value, val])
  }, [onChange, selected, value])

  const labelOf = val => options.find(o => (o.value ?? o) === val)?.label ?? val

  return (
    <div className="multiselect" ref={wrapRef}>
      <button
        type="button"
        id={id}
        {...rest}
        className="multiselect__control"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen(o => !o)}
      >
        {value.length === 0 && <span className="multiselect__placeholder">{placeholder}</span>}
        {value.map(v => (
          <span key={v} className="multiselect__chip">
            {labelOf(v)}
            <span
              role="button"
              tabIndex={-1}
              aria-label={`Quitar ${labelOf(v)}`}
              className="multiselect__chip-remove"
              onClick={e => { e.stopPropagation(); toggle(v) }}
            >
              <X size={11} aria-hidden="true" />
            </span>
          </span>
        ))}
        <ChevronDown size={15} className="select-wrap__chevron" aria-hidden="true" />
      </button>

      {open && (
        <div className="dropdown" role="listbox" aria-multiselectable="true">
          <div className="dropdown__search">
            <Input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              icon={<Search size={14} aria-hidden="true" />}
            />
          </div>
          {filtered.length === 0 && <p className="dropdown__empty">Sin resultados para “{query}”.</p>}
          {filtered.map(o => {
            const val = o.value ?? o
            const isSel = selected.has(val)
            return (
              <button
                type="button"
                key={val}
                role="option"
                aria-selected={isSel}
                className="dropdown__option"
                onClick={() => toggle(val)}
              >
                <span className="checkbox__box" aria-hidden="true" style={isSel ? {
                  background: 'var(--ray-checkbox-brand-bg)',
                  borderColor: 'var(--ray-checkbox-brand-bg)',
                  color: 'var(--ray-checkbox-check)',
                } : undefined}>
                  <Check size={12} strokeWidth={3.5} />
                </span>
                {o.label ?? o}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ------------------------------ OTP ------------------------------- */
export function OtpInput({ length = 6, value, onChange, invalid, disabled, label = 'Código de verificación', ...rest }) {
  const refs = useRef([])
  const chars = useMemo(() => value.padEnd(length, ' ').slice(0, length).split(''), [value, length])

  // El foco salta al siguiente casillero dentro del mismo handler, así que
  // la tecla siguiente puede llegar antes del re-render. Guardamos el valor
  // vigente en una ref para que cada dígito se escriba en su posición y no
  // sobre una copia obsoleta del estado.
  const latest = useRef(value)
  latest.current = value

  const commit = next => {
    latest.current = next
    onChange(next)
  }

  /** El espacio marca un casillero vacío: conserva la posición de cada dígito. */
  const write = (index, char) => {
    const arr = latest.current.padEnd(length, ' ').slice(0, length).split('')
    arr[index] = char || ' '
    commit(arr.join('').replace(/\s+$/, ''))
  }

  const onKeyDown = (e, i) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const filled = chars[i] !== ' ' && chars[i] !== ''
      if (filled) write(i, '')
      else if (i > 0) { write(i - 1, ''); refs.current[i - 1]?.focus() }
    } else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
    else if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus()
  }

  const onPaste = e => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!digits) return
    e.preventDefault()
    commit(digits)
    refs.current[Math.min(digits.length, length - 1)]?.focus()
  }

  return (
    <div className={cx('otp', invalid && 'otp--invalid')} role="group" aria-label={label} {...rest}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el }}
          className="otp__slot"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          aria-label={`Dígito ${i + 1} de ${length}`}
          aria-invalid={invalid || undefined}
          value={chars[i] === ' ' ? '' : chars[i]}
          onPaste={onPaste}
          onKeyDown={e => onKeyDown(e, i)}
          onChange={e => {
            const digit = e.target.value.replace(/\D/g, '').slice(-1)
            if (!digit) return
            write(i, digit)
            if (i < length - 1) refs.current[i + 1]?.focus()
          }}
        />
      ))}
    </div>
  )
}

/* ---------------------------- Stepper ----------------------------- */
export function Stepper({ steps = [], current = 0 }) {
  return (
    <ol className="stepper">
      {steps.map((s, i) => {
        const state = s.state ?? (i < current ? 'done' : i === current ? 'active' : 'upcoming')
        return (
          <li key={s.id ?? i} className={cx('step', `step--${state}`)}>
            <span className="step__marker" aria-hidden="true">
              {state === 'done' ? <Check size={15} strokeWidth={3} /> : i + 1}
            </span>
            <div>
              <p className="step__title">{s.title}</p>
              {s.description && <p className="step__desc">{s.description}</p>}
              {s.children}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function StepsBar({ total, current, label }) {
  return (
    <div className="steps-bar" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current + 1} aria-label={label}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cx('steps-bar__seg', i < current && 'steps-bar__seg--done', i === current && 'steps-bar__seg--current')} />
      ))}
    </div>
  )
}

/* ----------------------------- Table ------------------------------ */
export function Table({ columns = [], rows = [], rowKey = (_, i) => i, caption, empty }) {
  if (rows.length === 0 && empty) return empty
  return (
    <div className="table-wrap">
      <table className="table">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c.key} scope="col" className={c.align === 'right' ? 'num' : undefined}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey(row, i)}>
              {columns.map(c => (
                <td key={c.key} className={c.align === 'right' ? 'num' : undefined}>
                  {c.render ? c.render(row, i) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ----------------------------- Dialog ----------------------------- */
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export function Dialog({ open, onClose, title, description, footer, wide, children }) {
  const panelRef = useRef(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const panel = panelRef.current
    const first = panel?.querySelector(FOCUSABLE)
    ;(first ?? panel)?.focus()

    const onKeyDown = e => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose?.(); return }
      if (e.key !== 'Tab' || !panel) return
      const items = [...panel.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null)
      if (items.length === 0) return
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus() }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus() }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.body.style.overflow = overflow
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose?.() }}>
      <div
        ref={panelRef}
        className={cx('dialog', wide && 'dialog--wide')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
      >
        <div className="dialog__header">
          <div className="grow">
            {title && <h2 className="dialog__title" id={titleId}>{title}</h2>}
            {description && <p className="dialog__desc" id={descId}>{description}</p>}
          </div>
          <IconButton label="Cerrar" onClick={onClose}><X size={16} /></IconButton>
        </div>
        <div className="dialog__body">{children}</div>
        {footer && <div className="dialog__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

export function Drawer({ open, onClose, title, description, footer, children }) {
  const panelRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    const onKeyDown = e => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.body.style.overflow = overflow
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="overlay" style={{ padding: 0, justifyContent: 'flex-end' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose?.() }}>
      <div ref={panelRef} className="drawer" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <div className="dialog__header">
          <div className="grow">
            <h2 className="dialog__title" id={titleId}>{title}</h2>
            {description && <p className="dialog__desc">{description}</p>}
          </div>
          <IconButton label="Cerrar" onClick={onClose}><X size={16} /></IconButton>
        </div>
        <div className="dialog__body grow">{children}</div>
        {footer && <div className="dialog__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

/* ------------------------------ Toast ----------------------------- */
const ToastContext = createContext(null)
export const useToast = () => useContext(ToastContext)

const TOAST_ICON = {
  success: <CircleCheck size={17} aria-hidden="true" />,
  danger: <CircleAlert size={17} aria-hidden="true" />,
  info: <Info size={17} aria-hidden="true" />,
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const dismiss = useCallback(id => setToasts(list => list.filter(t => t.id !== id)), [])

  const push = useCallback((toast) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(list => [...list, { tone: 'info', ...toast, id }])
    setTimeout(() => dismiss(id), toast.duration ?? 4200)
  }, [dismiss])

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="toast-region" role="region" aria-label="Notificaciones">
          {toasts.map(t => (
            <div key={t.id} className={cx('toast', `toast--${t.tone}`)} role="status" aria-live="polite">
              <span className="toast__icon">{TOAST_ICON[t.tone] ?? TOAST_ICON.info}</span>
              <div className="grow">
                <p className="toast__title">{t.title}</p>
                {t.description && <p className="toast__desc">{t.description}</p>}
              </div>
              <IconButton label="Descartar" onClick={() => dismiss(t.id)}><X size={14} /></IconButton>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

/* ------------------------------ Tabs ------------------------------ */
export function Tabs({ tabs = [], value, onChange, ariaLabel = 'Secciones' }) {
  const refs = useRef([])
  const index = tabs.findIndex(t => t.id === value)

  const onKeyDown = e => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const next = (index + delta + tabs.length) % tabs.length
    onChange(tabs[next].id)
    refs.current[next]?.focus()
  }

  return (
    <div className="tabs" role="tablist" aria-label={ariaLabel} onKeyDown={onKeyDown}>
      {tabs.map((t, i) => (
        <button
          key={t.id}
          ref={el => { refs.current[i] = el }}
          type="button"
          role="tab"
          id={`tab-${t.id}`}
          aria-controls={`panel-${t.id}`}
          aria-selected={t.id === value}
          tabIndex={t.id === value ? 0 : -1}
          className="tab"
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export const TabPanel = ({ id, active, children }) => (
  <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} hidden={!active} tabIndex={0}>
    {active && children}
  </div>
)

/* --------------------------- Empty state -------------------------- */
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="empty">
    {icon && <span className="empty__icon">{icon}</span>}
    <p className="empty__title">{title}</p>
    {description && <p className="empty__desc">{description}</p>}
    {action}
  </div>
)

/* ----------------------------- Callout ---------------------------- */
const CALLOUT_ICON = {
  info: <Info size={16} aria-hidden="true" />,
  success: <CircleCheck size={16} aria-hidden="true" />,
  warning: <AlertTriangle size={16} aria-hidden="true" />,
  danger: <CircleAlert size={16} aria-hidden="true" />,
  brand: <Info size={16} aria-hidden="true" />,
}

export const Callout = ({ tone = 'info', title, children, action, icon }) => (
  <div className={cx('callout', `callout--${tone}`)}>
    <span className="callout__icon">{icon ?? CALLOUT_ICON[tone]}</span>
    <div className="grow">
      {title && <p className="callout__title">{title}</p>}
      {children}
    </div>
    {action}
  </div>
)

/* ------------------------- Metric / KPI --------------------------- */
export const Metric = ({ label, value, meta, children }) => (
  <div className="metric">
    <p className="metric__label">{label}</p>
    <p className="metric__value">{value}</p>
    {meta && <p className="metric__meta">{meta}</p>}
    {children}
  </div>
)

/* ------------------------ Definition list ------------------------- */
export const DefinitionList = ({ items = [], columns = 2, className }) => (
  <dl className={cx('dl', `dl--${columns}`, className)}>
    {items.map(it => (
      <div key={it.label}>
        <dt>{it.label}</dt>
        <dd>{it.value ?? '—'}</dd>
      </div>
    ))}
  </dl>
)

export { cx }

/** Secondary guidance stays available without competing with the main action. */
export function ContentDetails({ summary, children }) {
  return (
    <details className="content-details">
      <summary className="content-details__summary">{summary}</summary>
      <div className="content-details__body">{children}</div>
    </details>
  )
}
