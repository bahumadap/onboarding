import React, { useState, useRef, useEffect } from 'react'
import yol1Mark from '../assets/yol1-mark.svg'
import './personas.css'
import {
  ArrowDownLeft, ArrowLeft, ArrowRight, Bell, Check, ChevronRight,
  Copy, CreditCard, Eye, EyeOff, Gamepad2, Globe2, GraduationCap,
  Home, Plus, QrCode, Repeat2, Send, Settings, Shield, ShoppingBag,
  Smartphone, Star, TrendingUp, User, Wallet, X, Zap,
  ArrowLeftRight, Coffee, ChevronDown
} from 'lucide-react'

/* ── Hooks ──────────────────────────────────────────────────────────────── */
function useCountUp(target, duration = 1000) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(target * ease))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target])
  return val
}

/* ── Data ───────────────────────────────────────────────────────────────── */
const fmtCLP = v => `$${Number(v).toLocaleString('es-CL')}`

const CARDS = [
  {
    id: 'classic', name: 'Yol1 Classic', last4: '4182',
    type: 'Débito · CLP', balance: 182400, currency: 'CLP',
    theme: 'c-classic', source: 'Cuenta personal', Icon: Wallet,
  },
  {
    id: 'uni', name: 'USACH Card', last4: '9023',
    type: 'Tarjeta universitaria', balance: 45000, currency: 'CLP',
    theme: 'c-uni', source: 'Beca · Alimentación', Icon: GraduationCap,
  },
  {
    id: 'casino', name: 'BetArena Card', last4: '3671',
    type: 'Tarjeta gaming', balance: 28900, currency: 'CLP',
    theme: 'c-casino', source: 'BetArena Gaming', Icon: Gamepad2,
  },
  {
    id: 'usd', name: 'Yol1 USD', last4: '7840',
    type: 'Prepago · USD', balance: 284.50, currency: 'USD',
    theme: 'c-usd', source: 'Cuenta empresa', Icon: Globe2,
  },
]

const TXS = [
  { id: 1, date: 'Hoy · 14:22',    desc: 'Café do Brasil',          amount: -3200,   card: '4182', Icon: Coffee },
  { id: 2, date: 'Hoy · 11:08',    desc: 'Remesa a Perú',           amount: -120000, card: '4182', Icon: Globe2 },
  { id: 3, date: 'Hoy · 09:30',    desc: 'Abono beca USACH',        amount: 45000,   card: '9023', Icon: GraduationCap },
  { id: 4, date: 'Ayer · 20:14',   desc: 'BetArena recarga',        amount: 28900,   card: '3671', Icon: Gamepad2 },
  { id: 5, date: 'Ayer · 18:45',   desc: 'Líder Express',           amount: -18400,  card: '4182', Icon: ShoppingBag },
  { id: 6, date: 'Ayer · 12:00',   desc: 'Netflix',                 amount: -6990,   card: '4182', Icon: Smartphone },
  { id: 7, date: 'Lun · 19:30',    desc: 'Recibido · María López',  amount: 50000,   card: '4182', Icon: ArrowDownLeft },
  { id: 8, date: 'Lun · 10:00',    desc: 'Starbucks',               amount: -4200,   card: '4182', Icon: Coffee },
  { id: 9, date: 'Dom · 15:00',    desc: 'Uber',                    amount: -7800,   card: '4182', Icon: ArrowRight },
  { id: 10, date: 'Dom · 13:20',   desc: 'Rappi',                   amount: -12300,  card: '4182', Icon: ShoppingBag },
]

const COUNTRIES = [
  { code: 'MX', name: 'México',          currency: 'MXN', flag: '🇲🇽', rate: 0.01820  },
  { code: 'GT', name: 'Guatemala',       currency: 'GTQ', flag: '🇬🇹', rate: 0.00810  },
  { code: 'HN', name: 'Honduras',        currency: 'HNL', flag: '🇭🇳', rate: 0.02596  },
  { code: 'SV', name: 'El Salvador',     currency: 'USD', flag: '🇸🇻', rate: 0.00105  },
  { code: 'NI', name: 'Nicaragua',       currency: 'NIO', flag: '🇳🇮', rate: 0.03862  },
  { code: 'CR', name: 'Costa Rica',      currency: 'CRC', flag: '🇨🇷', rate: 0.54600  },
  { code: 'PA', name: 'Panamá',          currency: 'USD', flag: '🇵🇦', rate: 0.00105  },
  { code: 'CU', name: 'Cuba',            currency: 'CUP', flag: '🇨🇺', rate: 0.02835  },
  { code: 'DO', name: 'Rep. Dominicana', currency: 'DOP', flag: '🇩🇴', rate: 0.06384  },
  { code: 'HT', name: 'Haití',           currency: 'HTG', flag: '🇭🇹', rate: 0.14022  },
  { code: 'CO', name: 'Colombia',        currency: 'COP', flag: '🇨🇴', rate: 3.12000  },
  { code: 'VE', name: 'Venezuela',       currency: 'VES', flag: '🇻🇪', rate: 0.03812  },
  { code: 'EC', name: 'Ecuador',         currency: 'USD', flag: '🇪🇨', rate: 0.00105  },
  { code: 'PE', name: 'Perú',            currency: 'PEN', flag: '🇵🇪', rate: 0.00403  },
  { code: 'BO', name: 'Bolivia',         currency: 'BOB', flag: '🇧🇴', rate: 0.00727  },
  { code: 'BR', name: 'Brasil',          currency: 'BRL', flag: '🇧🇷', rate: 0.00598  },
  { code: 'PY', name: 'Paraguay',        currency: 'PYG', flag: '🇵🇾', rate: 7.83000  },
  { code: 'UY', name: 'Uruguay',         currency: 'UYU', flag: '🇺🇾', rate: 0.04462  },
  { code: 'AR', name: 'Argentina',       currency: 'ARS', flag: '🇦🇷', rate: 1.08000  },
]

const WEEKLY_SPEND = [
  { day: 'L', amount: 18400, max: false },
  { day: 'M', amount: 6990,  max: false },
  { day: 'X', amount: 3200,  max: false },
  { day: 'J', amount: 28900, max: false },
  { day: 'V', amount: 31790, max: true  },
  { day: 'S', amount: 7800,  max: false },
  { day: 'D', amount: 4200,  max: false },
]

const CATEGORIES = [
  { name: 'Comida',          amount: 38390, color: '#ff6b6b', pct: 38 },
  { name: 'Transporte',      amount: 20260, color: '#4ecdc4', pct: 20 },
  { name: 'Entretenimiento', amount: 35890, color: '#a78bfa', pct: 35 },
  { name: 'Otros',           amount: 6740,  color: '#fbbf24', pct: 7  },
]

/* ── Shared components ──────────────────────────────────────────────────── */
function CardVisual({ card, mini = false, frozen = false }) {
  const [hidden, setHidden] = useState(false)
  const bal = card.currency === 'CLP'
    ? fmtCLP(card.balance)
    : `USD ${card.balance.toFixed(2)}`

  return (
    <div className={`card-visual ${card.theme} ${mini ? 'mini' : ''}`}>
      <div className="cv-top">
        <div className="cv-logo"><img src={yol1Mark} alt="" /><span>Yol1</span></div>
        {!mini && (
          <button className="cv-eye" onClick={e => { e.stopPropagation(); setHidden(h => !h) }}>
            {hidden ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
        )}
      </div>
      <div className="cv-chip">
        <div className="cv-chip-inner" />
      </div>
      <div className="cv-balance">{hidden ? '•••••' : bal}</div>
      <div className="cv-bottom">
        <span className="cv-name">{card.name}</span>
        <span className="cv-num">•••• {card.last4}</span>
      </div>
      {frozen && (
        <div className="cv-frozen">
          <Shield size={20} />
          <span>Congelada</span>
        </div>
      )}
    </div>
  )
}

function TxRow({ tx }) {
  const { Icon } = tx
  const pos = tx.amount > 0
  return (
    <div className="tx-row">
      <div className="tx-icon-wrap"><Icon size={15} /></div>
      <div className="tx-info">
        <b>{tx.desc}</b>
        <small>{tx.date} · ···· {tx.card}</small>
      </div>
      <span className={`tx-amt ${pos ? 'pos' : 'neg'}`}>
        {pos ? '+' : ''}{pos ? fmtCLP(tx.amount) : fmtCLP(Math.abs(tx.amount))}
      </span>
    </div>
  )
}

function TabBar({ active, set }) {
  const tabs = [
    [Home,           'Inicio',    'inicio'  ],
    [CreditCard,     'Tarjetas',  'tarjetas'],
    [ArrowLeftRight, 'Mover',     'mover'   ],
    [Globe2,         'Remesas',   'remesas' ],
    [User,           'Perfil',    'perfil'  ],
  ]
  return (
    <nav className="p-tabbar">
      {tabs.map(([Icon, label, key]) => (
        <button key={key} className={active === key ? 'on' : ''} onClick={() => set(key)}>
          <Icon size={21} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}

/* ── Card carousel with drag support ────────────────────────────────────── */
function CardCarousel({ cardIdx, setCardIdx }) {
  const trackRef = useRef(null)
  const drag = useRef(null)
  const dragging = useRef(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const item = track.children[cardIdx]
    if (item) track.scrollTo({ left: item.offsetLeft, behavior: 'smooth' })
  }, [cardIdx])

  const onScroll = () => {
    if (dragging.current) return
    const track = trackRef.current
    if (!track || !track.children[0]) return
    const itemW = track.children[0].offsetWidth + 10
    setCardIdx(Math.round(track.scrollLeft / itemW))
  }

  const startDrag = x => { drag.current = { x, scroll: trackRef.current?.scrollLeft ?? 0 } }
  const moveDrag = x => {
    if (!drag.current || !trackRef.current) return
    dragging.current = true
    trackRef.current.scrollLeft = drag.current.scroll - (x - drag.current.x)
  }
  const endDrag = () => {
    if (!dragging.current) { drag.current = null; return }
    const track = trackRef.current
    if (track && track.children[0]) {
      const itemW = track.children[0].offsetWidth + 10
      setCardIdx(Math.round(track.scrollLeft / itemW))
    }
    drag.current = null
    setTimeout(() => { dragging.current = false }, 50)
  }

  return (
    <div className="cards-carousel">
      <div
        ref={trackRef}
        className="carousel-track"
        onScroll={onScroll}
        onMouseDown={e => { startDrag(e.clientX); e.preventDefault() }}
        onMouseMove={e => { if (drag.current) moveDrag(e.clientX) }}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        style={{ cursor: drag.current ? 'grabbing' : 'grab' }}
      >
        {CARDS.map((card, i) => (
          <div
            key={card.id}
            className={`carousel-item ${i === cardIdx ? 'sel' : ''}`}
            onClick={() => { if (!dragging.current) setCardIdx(i) }}
          >
            <CardVisual card={card} mini />
          </div>
        ))}
      </div>
      <div className="carousel-dots">
        {CARDS.map((_, i) => <span key={i} className={i === cardIdx ? 'on' : ''} onClick={() => setCardIdx(i)} />)}
      </div>
    </div>
  )
}

/* ── Views ──────────────────────────────────────────────────────────────── */
function ViewInicio({ nav }) {
  const [cardIdx, setCardIdx] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)
  const totalCLP = CARDS.filter(c => c.currency === 'CLP').reduce((s, c) => s + c.balance, 0)
  const animatedBalance = useCountUp(totalCLP)

  return (
    <div className="p-view">
      {/* Header */}
      <div className="inicio-bar">
        <div>
          <p className="greeting">Buenos días</p>
          <h2 className="username">Valentina 👋</h2>
        </div>
        <button className="notif-btn" onClick={() => setNotifOpen(o => !o)}>
          <Bell size={20} /><i />
        </button>
      </div>

      {/* Notification panel */}
      {notifOpen && (
        <div className="notif-panel">
          <div className="notif-head">
            <b>Notificaciones</b>
            <button onClick={() => setNotifOpen(false)}><X size={16} /></button>
          </div>
          {[
            { icon: ArrowDownLeft, title: 'Abono recibido',  desc: '+$45.000 · Beca USACH',   time: 'Hace 2h', color: '#22c55e' },
            { icon: Send,          title: 'Remesa enviada',  desc: 'PEN 484 · Carlos Mendoza', time: 'Hace 3h', color: '#3b82f6' },
            { icon: Zap,           title: 'Oferta especial', desc: '2x puntos en compras hoy', time: 'Hace 5h', color: '#f59e0b' },
          ].map((n, i) => (
            <div key={i} className="notif-item">
              <div className="notif-icon" style={{ background: n.color + '20', color: n.color }}>
                <n.icon size={15} />
              </div>
              <div className="notif-info">
                <b>{n.title}</b>
                <small>{n.desc}</small>
              </div>
              <span className="notif-time">{n.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* Balance */}
      <div className="balance-block">
        <span>Balance total</span>
        <h1>{fmtCLP(animatedBalance)}</h1>
        <small>{CARDS.length} tarjetas activas · CLP</small>
      </div>

      {/* Quick actions */}
      <div className="quick-row">
        {[
          [Send,          'Enviar',   () => nav('mover')   ],
          [ArrowDownLeft, 'Recibir',  () => nav('mover')   ],
          [Globe2,        'Remesa',   () => nav('remesas') ],
          [QrCode,        'QR',       () => {}             ],
          [Plus,          'Recargar', () => nav('tarjetas')],
        ].map(([Icon, label, fn]) => (
          <button key={label} className="quick-btn" onClick={fn}>
            <div className="quick-icon"><Icon size={19} /></div>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Cards mini carousel */}
      <CardCarousel cardIdx={cardIdx} setCardIdx={setCardIdx} />

      {/* Weekly spend chart */}
      <div className="spend-chart-card">
        <div className="scc-head">
          <span>Gastos esta semana</span>
          <b>$101.280</b>
        </div>
        <div className="scc-bars">
          {WEEKLY_SPEND.map(({ day, amount, max }) => {
            const maxAmt = Math.max(...WEEKLY_SPEND.map(x => x.amount))
            const pct = (amount / maxAmt) * 100
            return (
              <div key={day} className="scc-bar-wrap">
                <div className="scc-bar" style={{ height: `${pct}%` }} data-active={max || undefined} />
                <span>{day}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="spend-categories">
        <div className="list-head" style={{ marginBottom: 10 }}><b>Por categoría</b></div>
        {CATEGORIES.map(({ name, amount, color, pct }) => (
          <div key={name} className="cat-row">
            <div className="cat-dot" style={{ background: color }} />
            <span className="cat-name">{name}</span>
            <div className="cat-bar-bg">
              <div className="cat-bar" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="cat-amt">{fmtCLP(amount)}</span>
          </div>
        ))}
      </div>

      {/* Insight strip */}
      <div className="insight-strip">
        <TrendingUp size={14} />
        <span>Gastaste <b>$31.790</b> esta semana — 14% menos que la anterior</span>
      </div>

      {/* Transactions */}
      <div className="list-head">
        <b>Últimos movimientos</b>
        <button onClick={() => nav('historial')}>Ver todos <ChevronRight size={13} /></button>
      </div>
      <div className="tx-list">
        {TXS.slice(0, 5).map(tx => <TxRow key={tx.id} tx={tx} />)}
      </div>

      {/* Goals / Savings */}
      <div className="list-head" style={{ marginTop: 20 }}>
        <b>Mis metas</b>
        <button>Ver todas <ChevronRight size={13} /></button>
      </div>
      <div className="goals-list">
        {[
          { name: 'Viaje a Colombia', target: 500000, current: 182000, emoji: '✈️', color: '#3b82f6' },
          { name: 'Nuevo celular',    target: 250000, current: 87500,  emoji: '📱', color: '#a78bfa' },
        ].map(({ name, target, current, emoji, color }) => {
          const pct = Math.round((current / target) * 100)
          return (
            <div key={name} className="goal-card">
              <span className="goal-emoji">{emoji}</span>
              <div className="goal-info">
                <div className="goal-top"><b>{name}</b><span>{pct}%</span></div>
                <div className="goal-bar"><div style={{ width: `${pct}%`, background: color }} /></div>
                <div className="goal-nums">
                  <small>{fmtCLP(current)}</small>
                  <small>{fmtCLP(target)}</small>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ViewTarjetas() {
  const [open, setOpen] = useState(null)
  const [frozen, setFrozen] = useState(new Set())
  const card = open !== null ? CARDS[open] : null

  return (
    <div className="p-view">
      <div className="view-bar">
        <h2>Mis tarjetas</h2>
        <button className="icon-action"><Plus size={18} /></button>
      </div>

      <div className="card-stack">
        {CARDS.map((c, i) => {
          const { Icon } = c
          return (
            <div key={c.id} className="card-entry" onClick={() => setOpen(i)}>
              <CardVisual card={c} frozen={frozen.has(c.id)} />
              <div className="ce-meta">
                <div className="ce-source"><Icon size={12} /> {c.source}</div>
                <div className="ce-actions">
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      setFrozen(prev => {
                        const n = new Set(prev)
                        n.has(c.id) ? n.delete(c.id) : n.add(c.id)
                        return n
                      })
                    }}
                    className={frozen.has(c.id) ? 'active' : ''}
                  >
                    <Shield size={13} /> {frozen.has(c.id) ? 'Descongelar' : 'Congelar'}
                  </button>
                  <button><Settings size={13} /> Límites</button>
                  <button><Copy size={13} /> Datos</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {card && (
        <div className="drawer-overlay" onClick={() => setOpen(null)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-handle" />
            <div className="drawer-head">
              <b>Detalle tarjeta</b>
              <button onClick={() => setOpen(null)}><X size={18} /></button>
            </div>
            <CardVisual card={card} frozen={frozen.has(card.id)} />
            <div className="drawer-grid">
              {[['Tipo', card.type], ['Origen', card.source],
                ['Estado', frozen.has(card.id) ? 'Congelada' : 'Activa'],
                ['Saldo', card.currency === 'CLP' ? fmtCLP(card.balance) : `USD ${card.balance.toFixed(2)}`]
              ].map(([k, v]) => (
                <div key={k} className="drawer-field"><small>{k}</small><b>{v}</b></div>
              ))}
            </div>
            <div className="list-head"><b>Movimientos recientes</b></div>
            <div className="tx-list">
              {TXS.filter(t => t.card === card.last4).slice(0, 3).map(tx => <TxRow key={tx.id} tx={tx} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const CRYPTO = [
  { coin: 'BTC',  symbol: '₿', network: 'Bitcoin',           addr: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kf',        color: '#f7931a' },
  { coin: 'ETH',  symbol: 'Ξ', network: 'Ethereum (ERC-20)', addr: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', color: '#627eea' },
  { coin: 'USDT', symbol: '₮', network: 'Tron (TRC-20)',     addr: 'TAzpMZUGFDpJjGb5NfMgN5eKbVsz3PiQgh',        color: '#26a17b' },
]

function ViewMover() {
  const [tab, setTab] = useState('enviar')
  const [recibirMode, setRecibirMode] = useState('banco')
  const [sent, setSent] = useState(false)

  if (sent) return (
    <div className="p-view center-view">
      <div className="success-wrap">
        <div className="success-circle"><Check size={32} /></div>
        <h2>¡Enviado!</h2>
        <p>Transferencia a <b>María López</b></p>
        <div className="success-amount">{fmtCLP(50000)}</div>
        <small>Hoy · 14:38 · Banco Santander</small>
        <button className="btn-primary" onClick={() => setSent(false)}>Volver</button>
      </div>
    </div>
  )

  return (
    <div className="p-view">
      <div className="view-bar"><h2>Transferir</h2></div>
      <div className="pill-tabs">
        {['enviar', 'recibir', 'cobrar'].map(t => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
            {t === 'enviar' ? 'Enviar' : t === 'recibir' ? 'Recibir' : 'Cobrar QR'}
          </button>
        ))}
      </div>

      {tab === 'enviar' && (
        <div className="form-section">
          <div className="recents-block">
            <span className="block-label">Recientes</span>
            <div className="recents-row">
              {['María L.', 'Carlos R.', 'Papá', 'Sofía M.'].map(n => (
                <div key={n} className="rc"><div className="rc-av">{n[0]}</div><span>{n.split(' ')[0]}</span></div>
              ))}
              <div className="rc"><div className="rc-av new"><Plus size={14} /></div><span>Nuevo</span></div>
            </div>
          </div>
          <label className="f-label">Destinatario<input placeholder="RUT, email o alias" /></label>
          <label className="f-label">
            Monto
            <div className="amount-row"><span>$</span><input type="number" placeholder="0" /></div>
          </label>
          <label className="f-label">
            Desde
            <select>
              {CARDS.filter(c => c.currency === 'CLP').map(c => (
                <option key={c.id}>···· {c.last4} · {c.name} · {fmtCLP(c.balance)}</option>
              ))}
            </select>
          </label>
          <label className="f-label">Mensaje<input placeholder="Para..." /></label>
          <button className="btn-primary" onClick={() => setSent(true)}>Enviar transferencia</button>
        </div>
      )}

      {tab === 'recibir' && (
        <div className="recibir-block">
          <div className="pill-tabs-sm">
            <button className={recibirMode === 'banco' ? 'on' : ''} onClick={() => setRecibirMode('banco')}>Cuenta bancaria</button>
            <button className={recibirMode === 'cripto' ? 'on' : ''} onClick={() => setRecibirMode('cripto')}>Cripto</button>
          </div>

          {recibirMode === 'banco' && <>
            <div className="qr-box"><QrCode size={88} /><span>valentina.yol1</span></div>
            <div className="account-grid">
              {[['Banco', 'Yol1 Personas'], ['Tipo', 'Cuenta vista'], ['RUT', '18.921.344-6'], ['N° cuenta', '000-182-0021']].map(([k, v]) => (
                <div key={k} className="acc-field"><small>{k}</small><b>{v}</b></div>
              ))}
            </div>
            <button className="btn-secondary"><Copy size={14} /> Copiar datos</button>
          </>}

          {recibirMode === 'cripto' && (
            <div className="crypto-block">
              {CRYPTO.map(({ coin, symbol, network, addr, color }) => (
                <div key={coin} className="crypto-card">
                  <div className="crypto-coin" style={{ background: color }}>{symbol}</div>
                  <div className="crypto-info">
                    <b>{coin}</b>
                    <small>{network}</small>
                    <code>{addr}</code>
                  </div>
                  <button className="crypto-copy"><Copy size={13} /></button>
                </div>
              ))}
              <p className="crypto-note">Deposita solo la criptomoneda correspondiente a cada red. Los fondos se acreditan en CLP al tipo de cambio vigente.</p>
            </div>
          )}
        </div>
      )}

      {tab === 'cobrar' && (
        <div className="recibir-block">
          <label className="f-label">
            Monto a cobrar
            <div className="amount-row"><span>$</span><input type="number" placeholder="0" /></div>
          </label>
          <div className="qr-box large"><QrCode size={110} /><span>Mostrar para que te paguen</span></div>
        </div>
      )}
    </div>
  )
}

function ViewRemesas() {
  const [dest, setDest] = useState(COUNTRIES[13]) // Perú default
  const [amount, setAmount] = useState('120000')
  const [sent, setSent] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [search, setSearch] = useState('')

  const received = amount
    ? (Number(amount) * dest.rate).toLocaleString('en-US', { maximumFractionDigits: 2 })
    : '0'

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.currency.toLowerCase().includes(search.toLowerCase())
  )

  if (sent) return (
    <div className="p-view center-view">
      <div className="success-wrap">
        <div className="success-circle globe"><Globe2 size={30} /></div>
        <h2>¡Remesa enviada!</h2>
        <p>Tu envío a <b>{dest.name}</b> está en camino</p>
        <div className="success-amount">{dest.flag} {dest.currency} {received}</div>
        <small className="instant-badge">⚡ Llegada instantánea</small>
        <div className="track-row">
          {['Enviado', 'Procesando', 'Entregado'].map((s, i) => (
            <div key={s} className={`track-step ${i < 3 ? 'done' : ''}`}>
              <div className="ts-dot">{<Check size={10} />}</div>
              <small>{s}</small>
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={() => setSent(false)}>Nueva remesa</button>
      </div>
    </div>
  )

  return (
    <div className="p-view">
      <div className="view-bar">
        <h2>Remesas</h2>
        <span className="view-tag">Internacional</span>
      </div>

      {/* Swap UI */}
      <div className="swap-card">
        {/* From box */}
        <div className="swap-box">
          <span className="swap-label">Envías</span>
          <div className="swap-row">
            <div className="swap-token fixed">
              <span className="swap-flag">🇨🇱</span>
              <span className="swap-currency">CLP</span>
            </div>
            <input
              className="swap-input"
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>
          <span className="swap-sub">Chile · Yol1 Classic ···· 4182</span>
        </div>

        {/* Divider + flip */}
        <div className="swap-divider">
          <div className="swap-flip-btn">
            <Repeat2 size={16} />
          </div>
          <div className="swap-rate-line">
            <span>1 CLP = {dest.currency} {dest.rate.toFixed(5)}</span>
            <span className="rate-tag">Mejor que el banco</span>
          </div>
        </div>

        {/* To box */}
        <div className="swap-box">
          <span className="swap-label">Reciben</span>
          <div className="swap-row">
            <button className="swap-token selectable" onClick={() => { setPickerOpen(true); setSearch('') }}>
              <span className="swap-flag">{dest.flag}</span>
              <span className="swap-currency">{dest.currency}</span>
              <ChevronDown size={14} />
            </button>
            <input className="swap-input ro" type="text" value={received} readOnly />
          </div>
          <span className="swap-sub">{dest.name}</span>
        </div>
      </div>

      {/* Info row */}
      <div className="swap-info-row">
        <div className="sinfo-item"><span>Comisión</span><b className="green-txt">$0</b></div>
        <div className="sinfo-sep" />
        <div className="sinfo-item"><span>Tasa</span><b>Interbancaria</b></div>
        <div className="sinfo-sep" />
        <div className="sinfo-item"><span>Llegada</span><b className="instant-txt">⚡ Instantánea</b></div>
      </div>

      {/* Recipient */}
      <div className="recipient-block">
        <span className="block-label">Destinatario</span>
        <div className="recipient-row">
          <div className="rc-av flag">{dest.flag}</div>
          <div className="ri">
            <b>Carlos Mendoza</b>
            <small>BCP · ···· 4108 · {dest.name}</small>
          </div>
          <ChevronRight size={15} />
        </div>
      </div>

      <button className="btn-primary" onClick={() => setSent(true)}>
        Enviar {dest.currency} {received}
      </button>

      <div className="list-head" style={{ marginTop: 28 }}><b>Remesas recientes</b></div>
      <div className="tx-list">
        <div className="tx-row">
          <div className="tx-icon-wrap"><Globe2 size={15} /></div>
          <div className="tx-info"><b>Perú · Carlos Mendoza</b><small>Hoy · 11:08 · PEN 484,03</small></div>
          <span className="tx-amt neg">-$120.000</span>
        </div>
        <div className="tx-row">
          <div className="tx-icon-wrap"><Globe2 size={15} /></div>
          <div className="tx-info"><b>Colombia · Familia</b><small>Lun · COP 374.400</small></div>
          <span className="tx-amt neg">-$95.000</span>
        </div>
      </div>

      {/* Country picker sheet */}
      {pickerOpen && (
        <div className="drawer-overlay" onClick={() => setPickerOpen(false)}>
          <div className="drawer country-picker-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-handle" />
            <div className="picker-head">
              <b>Selecciona país</b>
              <button onClick={() => setPickerOpen(false)}><X size={18} /></button>
            </div>
            <div className="picker-search-wrap">
              <input
                className="picker-search"
                placeholder="Buscar país o moneda..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="picker-list">
              {filtered.map(c => (
                <button
                  key={c.code}
                  className={`picker-item ${dest.code === c.code ? 'on' : ''}`}
                  onClick={() => { setDest(c); setPickerOpen(false) }}
                >
                  <span className="picker-flag">{c.flag}</span>
                  <div className="picker-info">
                    <b>{c.name}</b>
                    <small>{c.currency}</small>
                  </div>
                  <span className="picker-rate">1 CLP = {c.rate >= 1 ? c.rate.toFixed(2) : c.rate.toFixed(5)} {c.currency}</span>
                  {dest.code === c.code && <Check size={15} className="picker-check" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ViewPerfil({ onBack }) {
  const menu = [
    [Shield,      'Seguridad y acceso'],
    [Bell,        'Notificaciones'],
    [Globe2,      'Idioma y región'],
    [CreditCard,  'Mis tarjetas'],
    [Star,        'Beneficios Yol1'],
    [Settings,    'Configuración'],
  ]
  return (
    <div className="p-view">
      <div className="perfil-hero">
        <div className="p-avatar">V</div>
        <h2>Valentina Rojas</h2>
        <small>18.921.344-6 · Cliente desde 2024</small>
        <div className="p-level"><Zap size={12} /> Nivel Gold · 1.240 pts</div>
      </div>
      <div className="perfil-stats">
        <div><b>{fmtCLP(256300)}</b><span>Balance total</span></div>
        <div><b>4</b><span>Tarjetas</span></div>
        <div><b>12</b><span>Remesas</span></div>
      </div>
      <div className="perfil-menu">
        {menu.map(([Icon, label]) => (
          <button key={label} className="pm-item">
            <span className="pm-icon"><Icon size={16} /></span>
            <span>{label}</span>
            <ChevronRight size={15} />
          </button>
        ))}
      </div>
      <button className="btn-ghost back-btn" onClick={onBack}>← Volver al landing</button>
    </div>
  )
}

function ViewHistorial({ nav }) {
  return (
    <div className="p-view">
      <div className="view-bar">
        <button className="back-icon" onClick={() => nav('inicio')}><ArrowLeft size={20} /></button>
        <h2>Historial</h2>
      </div>
      <div className="tx-list">
        {TXS.map(tx => <TxRow key={tx.id} tx={tx} />)}
      </div>
    </div>
  )
}

/* ── Root ───────────────────────────────────────────────────────────────── */
export default function Personas({ onBack }) {
  const [tab, setTab] = useState('inicio')

  const views = {
    inicio:    <ViewInicio    nav={setTab} />,
    tarjetas:  <ViewTarjetas />,
    mover:     <ViewMover />,
    remesas:   <ViewRemesas />,
    perfil:    <ViewPerfil onBack={onBack} />,
    historial: <ViewHistorial nav={setTab} />,
  }

  return (
    <div className="personas-shell">
      <div className="personas-phone">
        <div className="personas-topbar">
          <div className="pt-brand">
            <img src={yol1Mark} alt="" />
            <span>Yol1 <b>Personas</b></span>
            <span className="pt-tag">Demo</span>
          </div>
          <button className="pt-back" onClick={onBack}>✕ Salir</button>
        </div>
        <div className="phone-scroll">{views[tab]}</div>
        <TabBar active={tab} set={setTab} />
      </div>
    </div>
  )
}
