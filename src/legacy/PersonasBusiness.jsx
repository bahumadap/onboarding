import React, { useState } from 'react'
import yol1Mark from '../assets/yol1-mark.svg'
import {
  Activity, AlertCircle, Award, ArrowDownLeft, ArrowLeftRight, ArrowRight, ArrowUpRight,
  Bell, Check, CheckCircle2, ChevronDown, ChevronRight, Coffee, Coins, Copy, CreditCard,
  Download, FileWarning, Filter, Gamepad2, Gift, Globe2, GraduationCap, HeartPulse, KeyRound, LayoutDashboard,
  ListFilter, Lock, LogOut, Menu, MoreHorizontal, Percent, PiggyBank, Plane, Plus, QrCode, Repeat2,
  Search, Send, Settings, Shield, ShieldCheck, Smartphone, Sparkles, Star, Stethoscope, Tag, Ticket, TrendingUp, Umbrella, User,
  Wallet, X, Zap
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'

const money = value => `$${Number(value).toLocaleString('es-CL')}`

const cardsData = [
  { id: 'classic', name: 'Yol1 Classic', last4: '4182', type: 'Débito · CLP', balance: 182400, currency: 'CLP', source: 'Cuenta personal', pc: '' },
  { id: 'uni', name: 'USACH Card', last4: '9023', type: 'Tarjeta universitaria', balance: 45000, currency: 'CLP', source: 'Beca · Alimentación', pc: 'pc1' },
  { id: 'casino', name: 'BetArena Card', last4: '3671', type: 'Tarjeta gaming', balance: 28900, currency: 'CLP', source: 'BetArena Gaming', pc: 'pc2' },
  { id: 'usd', name: 'Yol1 USD', last4: '7840', type: 'Prepago · USD', balance: 284.50, currency: 'USD', source: 'Cuenta empresa', pc: 'pc3' },
]
const movements = [
  { id: 1, date: 'Hoy, 14:22', desc: 'Café do Brasil', amount: -3200, card: '4182', Icon: Coffee },
  { id: 2, date: 'Hoy, 11:08', desc: 'Remesa a Perú', amount: -120000, card: '4182', Icon: Globe2 },
  { id: 3, date: 'Hoy, 09:30', desc: 'Abono beca USACH', amount: 45000, card: '9023', Icon: GraduationCap },
  { id: 4, date: 'Ayer, 20:14', desc: 'BetArena recarga', amount: 28900, card: '3671', Icon: Gamepad2 },
  { id: 5, date: 'Ayer, 18:45', desc: 'Líder Express', amount: -18400, card: '4182', Icon: CreditCard },
  { id: 6, date: 'Ayer, 12:00', desc: 'Netflix', amount: -6990, card: '4182', Icon: Smartphone },
  { id: 7, date: 'Lun, 19:30', desc: 'Recibido · María López', amount: 50000, card: '4182', Icon: ArrowDownLeft },
  { id: 8, date: 'Lun, 10:00', desc: 'Starbucks', amount: -4200, card: '4182', Icon: Coffee },
  { id: 9, date: 'Dom, 15:00', desc: 'Uber', amount: -7800, card: '4182', Icon: ArrowRight },
  { id: 10, date: 'Dom, 13:20', desc: 'Rappi', amount: -12300, card: '4182', Icon: CreditCard },
  { id: 11, date: 'Vie, 09:10', desc: 'Suscripción Adobe', amount: -12900, card: '7840', Icon: Smartphone },
  { id: 12, date: 'Mié, 16:40', desc: 'Pago freelance recibido', amount: 150000, card: '7840', Icon: ArrowDownLeft },
]
const countries = [
  { code: 'MX', name: 'México', currency: 'MXN', flag: '🇲🇽', rate: 0.01820 },
  { code: 'PE', name: 'Perú', currency: 'PEN', flag: '🇵🇪', rate: 0.00403 },
  { code: 'CO', name: 'Colombia', currency: 'COP', flag: '🇨🇴', rate: 3.12000 },
  { code: 'AR', name: 'Argentina', currency: 'ARS', flag: '🇦🇷', rate: 1.08000 },
  { code: 'BR', name: 'Brasil', currency: 'BRL', flag: '🇧🇷', rate: 0.00598 },
  { code: 'BO', name: 'Bolivia', currency: 'BOB', flag: '🇧🇴', rate: 0.00727 },
  { code: 'EC', name: 'Ecuador', currency: 'USD', flag: '🇪🇨', rate: 0.00105 },
  { code: 'VE', name: 'Venezuela', currency: 'VES', flag: '🇻🇪', rate: 0.03812 },
  { code: 'UY', name: 'Uruguay', currency: 'UYU', flag: '🇺🇾', rate: 0.04462 },
  { code: 'GT', name: 'Guatemala', currency: 'GTQ', flag: '🇬🇹', rate: 0.00810 },
]
const chartData = [
  { name: 'Ene', ingresos: 620, gastos: 410 }, { name: 'Feb', ingresos: 650, gastos: 455 },
  { name: 'Mar', ingresos: 610, gastos: 480 }, { name: 'Abr', ingresos: 680, gastos: 390 },
  { name: 'May', ingresos: 705, gastos: 512 }, { name: 'Jun', ingresos: 690, gastos: 470 },
]
const categories = [
  { name: 'Comida', amount: 38390, color: '#ff6b6b', pct: 38 },
  { name: 'Transporte', amount: 20260, color: '#4ecdc4', pct: 20 },
  { name: 'Entretenimiento', amount: 35890, color: '#a78bfa', pct: 35 },
  { name: 'Otros', amount: 6740, color: '#fbbf24', pct: 7 },
]
const goals = [
  { name: 'Viaje a Colombia', target: 500000, current: 182000, emoji: '✈️' },
  { name: 'Nuevo celular', target: 250000, current: 87500, emoji: '📱' },
  { name: 'Fondo de emergencia', target: 1000000, current: 410000, emoji: '🛟' },
]
const crypto = [
  { coin: 'BTC', network: 'Bitcoin', addr: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kf' },
  { coin: 'ETH', network: 'Ethereum (ERC-20)', addr: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' },
  { coin: 'USDT', network: 'Tron (TRC-20)', addr: 'TAzpMZUGFDpJjGb5NfMgN5eKbVsz3PiQgh' },
]
const recentTransfers = [
  { id: 'TRF-9021', to: 'María López', route: 'Banco Santander · ···· 2210', amount: 50000, status: 'Completado', date: 'Hoy, 14:38' },
  { id: 'TRF-9018', to: 'Carlos Reyes', route: 'Banco Estado · ···· 8842', amount: 15000, status: 'Completado', date: 'Ayer, 19:02' },
  { id: 'TRF-9012', to: 'Papá', route: 'Banco de Chile · ···· 1029', amount: 80000, status: 'Completado', date: 'Lun, 10:15' },
]
const recentRemesas = [
  { id: 'RM-771', dest: 'Carlos Mendoza', country: countries[1], amountCLP: 120000, date: 'Hoy, 11:08' },
  { id: 'RM-765', dest: 'Familia Rojas', country: countries[2], amountCLP: 95000, date: 'Lun, 09:40' },
]
const remesaRecipients = {
  PE: [{ name: 'Carlos Mendoza', bank: 'BCP', account: '···· 4108' }],
  CO: [{ name: 'Familia Rojas', bank: 'Bancolombia', account: '···· 2290' }],
  AR: [{ name: 'Lucía Fernández', bank: 'Banco Galicia', account: '···· 7734' }],
}
const pointsHistory = [
  { id: 1, date: 'Hoy, 14:22', desc: 'Compra en Café do Brasil', points: 32 },
  { id: 2, date: 'Hoy, 11:08', desc: 'Remesa a Perú', points: 120 },
  { id: 3, date: 'Ayer, 20:14', desc: 'Canje: Entrada de cine 2x1', points: -500 },
  { id: 4, date: 'Ayer, 18:45', desc: 'Compra en Líder Express', points: 18 },
  { id: 5, date: 'Lun, 19:30', desc: 'Bono bienvenida Nivel Gold', points: 200 },
]
const rewardsCatalog = [
  { id: 'r1', name: 'Cupón $5.000 Falabella', cost: 2000, category: 'Retail', Icon: Tag },
  { id: 'r2', name: 'Entrada de cine 2x1', cost: 1200, category: 'Entretenimiento', Icon: Ticket },
  { id: 'r3', name: '500 millas LATAM Pass', cost: 3000, category: 'Viajes', Icon: Plane },
  { id: 'r4', name: '3 meses Spotify Premium', cost: 900, category: 'Streaming', Icon: Smartphone },
  { id: 'r5', name: 'Cupón $10.000 Uber Eats', cost: 4000, category: 'Comida', Icon: Coffee },
]
const discountsPartners = [
  { id: 'd1', merchant: 'Starbucks', desc: '20% de descuento pagando con cualquier tarjeta Yol1', pct: 20, expires: '31 jul 2026', category: 'Comida' },
  { id: 'd2', merchant: 'Uber', desc: 'Cashback de 5% en todos tus viajes', pct: 5, expires: 'Sin fecha límite', category: 'Transporte' },
  { id: 'd3', merchant: 'Rappi', desc: '10% de descuento en tu primera compra del mes', pct: 10, expires: '31 jul 2026', category: 'Comida' },
  { id: 'd4', merchant: 'Netflix', desc: '1 mes gratis al activar pago automático', pct: 100, expires: 'Por tiempo limitado', category: 'Streaming' },
  { id: 'd5', merchant: 'Falabella.com', desc: '15% de descuento en tecnología', pct: 15, expires: '15 jul 2026', category: 'Retail' },
]
const activePolicies = [
  { id: 'p1', name: 'Protección de compras', desc: 'Cobertura automática incluida en tu cuenta Yol1 ante fraude o no recepción de productos.', coverage: 'Hasta $300.000 por compra', price: 0, status: 'Activa', Icon: Shield },
  { id: 'p2', name: 'Seguro celular Yol1', desc: 'Robo, daño accidental y rotura de pantalla para tu celular.', coverage: 'Hasta $500.000', price: 4990, status: 'Activa', Icon: Smartphone },
]
const availablePolicies = [
  { id: 'a1', name: 'Seguro de vida Yol1', desc: 'Protección para tu familia ante imprevistos.', coverage: 'Hasta $10.000.000', price: 6990, Icon: HeartPulse },
  { id: 'a2', name: 'Seguro de viaje', desc: 'Asistencia médica, equipaje y cancelación de viaje.', coverage: 'Cobertura internacional', price: 3990, Icon: Plane },
  { id: 'a3', name: 'Seguro de accidentes personales', desc: 'Indemnización por accidentes graves.', coverage: 'Hasta $5.000.000', price: 2990, Icon: Stethoscope },
]
const claims = [
  { id: 'SN-201', policy: 'Seguro celular Yol1', desc: 'Pantalla rota', amount: 180000, status: 'Aprobado', date: '02 may 2026' },
  { id: 'SN-198', policy: 'Protección de compras', desc: 'Producto no recibido · Retail Online', amount: 45000, status: 'En revisión', date: '28 abr 2026' },
]
const devices = [
  { name: 'iPhone 15 · Santiago', last: 'Hoy, 14:22', status: 'Activa' },
  { name: 'Chrome · Windows · Santiago', last: 'Ayer, 20:10', status: 'Activa' },
  { name: 'Chrome · MacBook · Providencia', last: '12 may', status: 'Cerrada' },
]
const nav = [
  ['Inicio', LayoutDashboard], ['Tarjetas', CreditCard], ['Movimientos', Activity], ['Transferencias', ArrowLeftRight], ['Remesas', Globe2], ['Metas de ahorro', PiggyBank], ['Beneficios', Gift], ['Seguros', Shield],
  ['Perfil', User], ['Seguridad', ShieldCheck], ['Configuración', Settings],
]

function StatusBadge({ children }) {
  const text = String(children)
  const tone = /Activa|Completado|Conectado|Aprobada|Aprobado|Al día|Cumplida/.test(text) ? 'success'
    : /Pendiente|Procesando|En curso|En revisión/.test(text) ? 'warning'
    : /Rechazada|Rechazado|Congelada|Vencida/.test(text) ? 'danger' : 'neutral'
  return <span className={`badge ${tone}`}><span />{text}</span>
}
function Avatar({ name, small = false }) {
  return <span className={`avatar ${small ? 'small' : ''}`}>{name.split(' ').map(x => x[0]).slice(0, 2).join('')}</span>
}
function Button({ children, icon: Icon, secondary = false, ghost = false, onClick, disabled = false }) {
  return <button className={`button ${secondary ? 'secondary' : ''} ${ghost ? 'ghost' : ''}`} onClick={onClick} disabled={disabled}>{Icon && <Icon size={16} />}{children}</button>
}
function MetricCard({ label, value, icon: Icon, detail, tone = 'green', onClick }) {
  return <div className="metric-card" onClick={onClick} style={onClick ? { cursor: 'pointer' } : undefined}>
    <div className={`metric-icon ${tone}`}><Icon size={18} /></div>
    <div className="metric-label">{label}</div><div className="metric-value">{value}</div>
    <div className="metric-detail">{detail}</div>
  </div>
}
function PageTitle({ eyebrow, title, subtitle, actions }) {
  return <div className="page-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div>{actions && <div className="page-actions">{actions}</div>}</div>
}
function Card({ title, subtitle, action, children, className = '' }) {
  return <section className={`card ${className}`}><div className="card-head"><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>
}
function DataTable({ headers, children }) {
  return <div className="table-wrap"><table><thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>
}
function SearchFilters() {
  return <div className="filters"><div className="filter-search"><Search size={16} /><input placeholder="Buscar en esta vista..." /></div><button><ListFilter size={15} /> Estado <ChevronDown size={14} /></button><button><Filter size={15} /> Tarjeta <ChevronDown size={14} /></button></div>
}
function CategoryBar({ name, amount, color, pct }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0' }}>
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
    <span style={{ flex: 1, fontSize: 10 }}>{name}</span>
    <div style={{ width: 90, height: 5, background: '#edf2f0', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: color }} /></div>
    <b style={{ fontSize: 10, minWidth: 60, textAlign: 'right' }}>{money(amount)}</b>
  </div>
}
function Modal({ modal, onClose, onConfirm }) {
  if (!modal) return null
  const { type, payload = {} } = modal
  const title = type === 'send' ? 'Enviar dinero' : type === 'request' ? 'Cobrar con QR' : type === 'card-new' ? 'Solicitar tarjeta' : type === 'card-detail' ? `Detalle · ${payload.name}` : type === 'goal-new' ? 'Nueva meta de ahorro' : type === 'goal-contribute' ? `Aportar a ${payload.name}` : type === 'remesa' ? 'Confirmar envío' : type === 'redeem' ? `Canjear · ${payload.name}` : type === 'discount' ? `Activar · ${payload.merchant}` : type === 'insurance-hire' ? `Contratar · ${payload.name}` : type === 'claim' ? `Reportar siniestro · ${payload.name}` : 'Detalle'
  const confirmLabel = type === 'send' ? 'Enviar transferencia' : type === 'request' ? 'Generar cobro' : type === 'card-new' ? 'Solicitar tarjeta' : type === 'card-detail' ? 'Cerrar' : type === 'goal-new' ? 'Crear meta' : type === 'goal-contribute' ? 'Aportar' : type === 'remesa' ? 'Confirmar envío' : type === 'redeem' ? 'Confirmar canje' : type === 'discount' ? 'Activar descuento' : type === 'insurance-hire' ? 'Contratar seguro' : type === 'claim' ? 'Enviar solicitud' : 'Aceptar'
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={e => e.stopPropagation()}>
    <div className="modal-head"><div><span className="eyebrow">Yol1 Personas</span><h2>{title}</h2></div><button onClick={onClose}><X size={20} /></button></div>
    {type === 'send' && <div className="form-grid">
      <label>Destinatario<input placeholder="RUT, email o alias" defaultValue="María López" /></label>
      <label>Monto<input type="number" defaultValue="50000" /></label>
      <label>Desde<select>{cardsData.filter(c => c.currency === 'CLP').map(c => <option key={c.id}>···· {c.last4} · {c.name}</option>)}</select></label>
      <label>Mensaje<input placeholder="Para..." /></label>
    </div>}
    {type === 'request' && <div className="form-grid">
      <label className="wide">Monto a cobrar<input type="number" placeholder="0" /></label>
      <div className="wide" style={{ gridColumn: '1/-1' }}><div className="qr-box"><QrCode size={90} /><span>Comparte este QR para que te paguen</span></div></div>
    </div>}
    {type === 'card-new' && <div className="form-grid">
      <label>Tipo de tarjeta<select><option>Débito adicional</option><option>Prepago USD</option><option>Virtual</option></select></label>
      <label>Alias<input defaultValue="Tarjeta viajes" /></label>
    </div>}
    {type === 'card-detail' && <>
      <div className="trace-summary">
        <div><small>Tarjeta</small><strong>{payload.name}</strong><span>···· {payload.last4}</span></div>
        <div><small>Origen</small><strong>{payload.source}</strong><span>{payload.type}</span></div>
        <div><small>Saldo</small><strong>{payload.currency === 'CLP' ? money(payload.balance) : `USD ${Number(payload.balance).toFixed(2)}`}</strong><StatusBadge>Activa</StatusBadge></div>
      </div>
      <div style={{ padding: '0 22px 20px' }}><div className="detail-list">{movements.filter(m => m.card === payload.last4).slice(0, 4).map(m => <span key={m.id}>{m.date} · {m.desc}<b className={m.amount > 0 ? 'positive' : 'negative'}>{m.amount > 0 ? '+' : '−'}{money(Math.abs(m.amount))}</b></span>)}</div></div>
    </>}
    {type === 'goal-new' && <div className="form-grid">
      <label>Nombre de la meta<input placeholder="Ej. Vacaciones de verano" /></label>
      <label>Monto objetivo<input type="number" placeholder="500000" /></label>
      <label>Fecha límite<input defaultValue="dic 2026" /></label>
      <label>Ícono<select><option>✈️ Viaje</option><option>📱 Tecnología</option><option>🏠 Hogar</option><option>🛟 Emergencia</option></select></label>
    </div>}
    {type === 'goal-contribute' && <div className="confirm-box"><div className="confirm-icon"><PiggyBank size={25} /></div><h3>Aportar a "{payload.name}"</h3><p>Ya llevas {money(payload.current)} de {money(payload.target)}.</p><div className="form-grid" style={{ padding: '14px 0 0' }}><label className="wide">Monto a aportar<input type="number" defaultValue="20000" /></label></div></div>}
    {type === 'remesa' && <div className="trace-summary">
      <div><small>Envías</small><strong>{money(payload.amount)}</strong><span>CLP · Yol1 Classic</span></div>
      <div><small>Destinatario</small><strong>{payload.recipient?.name || 'Sin datos'}</strong><span>{payload.recipient?.bank} · {payload.recipient?.account}</span></div>
      <div><small>Recibe</small><strong>{payload.country?.currency} {payload.received}</strong><span>{payload.country?.flag} {payload.country?.name} · Instantánea</span></div>
    </div>}
    {type === 'redeem' && <div className="confirm-box"><div className="confirm-icon"><Gift size={25} /></div><h3>Canjear "{payload.name}"</h3><p>Se descontarán {payload.cost?.toLocaleString('es-CL')} puntos de tu saldo disponible.</p></div>}
    {type === 'discount' && <div className="confirm-box"><div className="confirm-icon"><Tag size={25} /></div><h3>Activar descuento en {payload.merchant}</h3><p>{payload.desc}</p></div>}
    {type === 'insurance-hire' && <div className="form-grid">
      <label className="wide">Plan<input readOnly value={`${payload.name} · ${money(payload.price)} /mes`} /></label>
      <label>Forma de pago<select><option>Débito automático · Yol1 Classic</option><option>Yol1 USD</option></select></label>
      <label>Fecha de inicio<input defaultValue="01 jul 2026" /></label>
    </div>}
    {type === 'claim' && <div className="form-grid">
      <label className="wide">Seguro<input readOnly value={payload.name} /></label>
      <label>Tipo de siniestro<select><option>Robo</option><option>Daño accidental</option><option>Producto no recibido</option><option>Otro</option></select></label>
      <label>Monto estimado<input type="number" placeholder="0" /></label>
      <label className="wide">Descripción<input placeholder="Cuéntanos qué pasó" /></label>
    </div>}
    <div className="modal-footer"><Button secondary onClick={onClose}>Cancelar</Button><Button onClick={() => { onConfirm?.(); onClose() }}>{confirmLabel}</Button></div>
  </div></div>
}

const AGG_STATS = { ingresos: 123900, gastos: 101280, ahorro: 22620 }
function Overview({ open, nav }) {
  const [cardId, setCardId] = useState('all')
  const totalCLP = cardsData.filter(c => c.currency === 'CLP').reduce((s, c) => s + c.balance, 0)
  const selectedCard = cardId === 'all' ? null : cardsData.find(c => c.id === cardId)
  const filteredMovements = selectedCard ? movements.filter(m => m.card === selectedCard.last4) : movements
  const ingresos = selectedCard ? filteredMovements.filter(m => m.amount > 0).reduce((s, m) => s + m.amount, 0) : AGG_STATS.ingresos
  const gastos = selectedCard ? filteredMovements.filter(m => m.amount < 0).reduce((s, m) => s + Math.abs(m.amount), 0) : AGG_STATS.gastos
  const ahorro = selectedCard ? ingresos - gastos : AGG_STATS.ahorro
  const balanceValue = selectedCard ? (selectedCard.currency === 'CLP' ? money(selectedCard.balance) : `USD ${selectedCard.balance.toFixed(2)}`) : money(totalCLP)

  return <><PageTitle eyebrow="Miércoles, 10 de junio" title="Hola, Valentina" subtitle="Tu plata personal, ordenada y bajo control." actions={<><Button secondary icon={Download}>Exportar cartola</Button><Button icon={Send} onClick={() => open('send')}>Enviar dinero</Button></>} />
    <div className="billing-tabs">
      <button className={cardId === 'all' ? 'active' : ''} onClick={() => setCardId('all')}>Todas las tarjetas</button>
      {cardsData.map(c => <button key={c.id} className={cardId === c.id ? 'active' : ''} onClick={() => setCardId(c.id)}>{c.name}</button>)}
    </div>
    <div className="hero-balance"><div><span className="eyebrow light">{selectedCard ? `${selectedCard.name} · ${selectedCard.currency}` : 'Balance total · CLP'}</span><h2>{balanceValue}</h2><p><span className="live-dot" /> {selectedCard ? `···· ${selectedCard.last4} · ${selectedCard.source}` : `${cardsData.length} tarjetas activas`}</p></div><div className="hero-stats"><div><span>Ingresos</span><b>+{money(ingresos)}</b></div><div><span>Gastos</span><b>−{money(gastos)}</b></div><div><span>Ahorro</span><b>{ahorro >= 0 ? '+' : '−'}{money(Math.abs(ahorro))}</b></div></div><img className="hero-brand-mark" src={yol1Mark} alt="" /></div>
    <div className="quick-actions">
      <button onClick={() => open('send')}><Send /><span>Enviar</span><small>A una persona</small></button>
      <button onClick={() => nav('Transferencias')}><ArrowDownLeft /><span>Recibir</span><small>Cuenta o QR</small></button>
      <button onClick={() => nav('Remesas')}><Globe2 /><span>Remesa</span><small>Enviar al extranjero</small></button>
      <button onClick={() => open('goal-new')}><PiggyBank /><span>Nueva meta</span><small>Ahorro con objetivo</small></button>
    </div>
    <div className="metric-grid four">
      <MetricCard label={selectedCard ? 'Balance tarjeta' : 'Balance total'} value={balanceValue} icon={Wallet} detail={selectedCard ? selectedCard.type : `${cardsData.length} tarjetas`} />
      <MetricCard label="Gasto esta semana" value={selectedCard ? `−${money(gastos)}` : '$31.790'} icon={TrendingUp} detail={selectedCard ? `Solo ${selectedCard.name}` : '14% menos que la anterior'} />
      <MetricCard label="Meta más cercana" value="65%" icon={PiggyBank} detail="Nuevo celular" tone="blue" onClick={() => nav('Metas de ahorro')} />
      <MetricCard label="Puntos Yol1" value="1.240" icon={Star} detail="Nivel Gold" tone="amber" onClick={() => nav('Beneficios')} />
    </div>
    <div className="two-col wide-left">
      <Card title="Ingresos vs. gastos" subtitle="Flujo mensual · Miles CLP" action={<button className="text-action">Últimos 6 meses <ChevronDown size={14} /></button>}>
        <div className="chart"><ResponsiveContainer><AreaChart data={chartData}><defs><linearGradient id="pg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#80EF0C" stopOpacity=".42" /><stop offset="100%" stopColor="#80EF0C" stopOpacity="0" /></linearGradient></defs><CartesianGrid stroke="#e5e2d8" vertical={false} /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip /><Area dataKey="ingresos" stroke="#80EF0C" fill="url(#pg1)" strokeWidth={2.5} /><Area dataKey="gastos" stroke="#112E3C" fill="transparent" strokeWidth={2} /></AreaChart></ResponsiveContainer></div>
      </Card>
      <Card title="Gasto por categoría" subtitle="Esta semana">
        {categories.map(c => <CategoryBar key={c.name} {...c} />)}
      </Card>
    </div>
    <Card title="Últimos movimientos" subtitle={selectedCard ? `Actividad reciente de ${selectedCard.name}` : 'Actividad reciente de todas tus tarjetas'} action={<button className="text-action" onClick={() => nav('Movimientos')}>Ver todos <ArrowRight size={14} /></button>}>
      {filteredMovements.length === 0 && <div className="empty-state">Esta tarjeta no tiene movimientos registrados.</div>}
      {filteredMovements.length > 0 && <DataTable headers={['Fecha', 'Movimiento', 'Tarjeta', 'Monto']}>{filteredMovements.slice(0, 5).map(m => <tr key={m.id}><td className="muted">{m.date}</td><td><div className="person"><span className="avatar small"><m.Icon size={13} /></span><b>{m.desc}</b></div></td><td><code>···· {m.card}</code></td><td className={m.amount > 0 ? 'positive' : 'negative'}><b>{m.amount > 0 ? '+' : '−'}{money(Math.abs(m.amount))}</b></td></tr>)}</DataTable>}
    </Card>
    <Card title="Mis metas de ahorro" subtitle="Progreso de tus objetivos" action={<button className="text-action" onClick={() => nav('Metas de ahorro')}>Ver todas <ArrowRight size={14} /></button>}>
      <div className="health-bars">{goals.map(g => { const pct = Math.round(g.current / g.target * 100); return <span key={g.name}><b>{g.emoji} {g.name}</b><i><em style={{ width: `${pct}%` }} /></i><small>{pct}%</small></span> })}</div>
    </Card>
    <div className="concept-note"><Sparkles size={20} /><div><strong>Una cuenta, todas tus tarjetas.</strong><p>Yol1 Personas conecta tu cuenta principal con tarjetas de becas, gaming y dólares, todas visibles y controlables desde un solo panel.</p></div></div>
  </>
}
function CardsView({ open }) {
  const [frozen, setFrozen] = useState(new Set())
  return <><PageTitle eyebrow="Mis productos" title="Tarjetas" subtitle="Congela, ajusta límites y revisa el detalle de cada tarjeta." actions={<Button icon={Plus} onClick={() => open('card-new')}>Solicitar tarjeta</Button>} />
    <div className="cards-grid">
      {cardsData.map(c => <div className={`payment-card ${c.pc}`} key={c.id}>
        <div className="pc-top"><span>Yol1 <b>{c.currency === 'USD' ? 'USD' : 'Personas'}</b></span><Zap size={19} /></div>
        <small>{c.type} · {c.source}</small>
        <h3>{c.name}</h3>
        <div className="pc-number">•••• &nbsp;•••• &nbsp;•••• &nbsp;{c.last4}</div>
        <div className="pc-spend"><span><small>Saldo disponible</small><b>{c.currency === 'CLP' ? money(c.balance) : `USD ${c.balance.toFixed(2)}`}</b></span><span><small>Estado</small><b>{frozen.has(c.id) ? 'Congelada' : 'Activa'}</b></span></div>
        <div className="pc-bottom"><StatusBadge>{frozen.has(c.id) ? 'Congelada' : 'Activa'}</StatusBadge>
          <span style={{ display: 'flex', gap: 6 }}>
            <button className="table-action" onClick={() => setFrozen(prev => { const n = new Set(prev); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n })}>{frozen.has(c.id) ? 'Descongelar' : 'Congelar'}</button>
            <button className="table-action" onClick={() => open('card-detail', c)}>Ver detalle</button>
          </span>
        </div>
      </div>)}
    </div>
    <div className="concept-note"><CreditCard size={20} /><div><strong>Cada tarjeta, su propio origen.</strong><p>Las tarjetas de beca, gaming o empresa mantienen su origen de fondos separado, pero se administran desde la misma cuenta Yol1.</p></div></div>
  </>
}
function MovementsView() {
  const income = movements.filter(m => m.amount > 0).reduce((s, m) => s + m.amount, 0)
  const expense = movements.filter(m => m.amount < 0).reduce((s, m) => s + Math.abs(m.amount), 0)
  return <><PageTitle eyebrow="Historial" title="Movimientos" subtitle="Todos los movimientos de tus tarjetas y cuenta personal." />
    <div className="metric-grid four">
      <MetricCard label="Movimientos este mes" value={movements.length} icon={Activity} detail="Todas las tarjetas" />
      <MetricCard label="Ingresos" value={money(income)} icon={ArrowDownLeft} detail="Abonos y transferencias recibidas" />
      <MetricCard label="Gastos" value={money(expense)} icon={ArrowUpRight} detail="Compras y transferencias enviadas" tone="blue" />
      <MetricCard label="Categoría top" value="Entretenimiento" icon={TrendingUp} detail="35% del gasto" tone="amber" />
    </div>
    <Card title="Todos los movimientos" subtitle="Actividad consolidada"><SearchFilters /><DataTable headers={['Fecha', 'Movimiento', 'Tarjeta', 'Monto']}>{movements.map(m => <tr key={m.id}><td className="muted">{m.date}</td><td><div className="person"><span className="avatar small"><m.Icon size={13} /></span><b>{m.desc}</b></div></td><td><code>···· {m.card}</code></td><td className={m.amount > 0 ? 'positive' : 'negative'}><b>{m.amount > 0 ? '+' : '−'}{money(Math.abs(m.amount))}</b></td></tr>)}</DataTable></Card>
  </>
}
function Transfers({ open }) {
  return <><PageTitle eyebrow="Cuenta personal" title="Transferencias" subtitle="Envía, recibe y cobra dinero desde tu cuenta Yol1." actions={<Button icon={Send} onClick={() => open('send')}>Enviar dinero</Button>} />
    <div className="transfer-actions">
      <button onClick={() => open('send')}><span className="transfer-action-icon"><Send /></span><div><b>Enviar dinero</b><small>A cualquier cuenta o alias</small></div><ArrowRight /></button>
      <button onClick={() => open('request')}><span className="transfer-action-icon global"><QrCode /></span><div><b>Cobrar con QR</b><small>Genera un cobro para que te paguen</small></div><ArrowRight /></button>
      <button onClick={() => {}}><span className="transfer-action-icon fx"><Repeat2 /></span><div><b>Recargar tarjeta</b><small>Mueve saldo entre tus tarjetas</small></div><ArrowRight /></button>
    </div>
    <div className="two-col transfer-columns">
      <Card title="Mis datos para recibir" subtitle="Comparte estos datos para que te transfieran">
        <div className="detail-list">{[['Banco', 'Yol1 Personas'], ['Tipo', 'Cuenta vista'], ['RUT', '18.921.344-6'], ['N° cuenta', '000-182-0021']].map(([k, v]) => <span key={k}>{k}<b>{v}</b></span>)}</div>
        <div style={{ marginTop: 12 }}><Button secondary icon={Copy}>Copiar datos</Button></div>
      </Card>
      <Card title="Recibir en cripto" subtitle="Se acredita en CLP al tipo de cambio vigente">
        <DataTable headers={['Moneda', 'Red', 'Dirección', '']}>{crypto.map(c => <tr key={c.coin}><td><b>{c.coin}</b></td><td className="muted">{c.network}</td><td><code>{c.addr.slice(0, 14)}…</code></td><td><button className="more"><Copy size={14} /></button></td></tr>)}</DataTable>
      </Card>
    </div>
    <Card title="Contactos frecuentes" subtitle="Envía en un clic">
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>{['María L.', 'Carlos R.', 'Papá', 'Sofía M.'].map(n => <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 64 }}><Avatar name={n} /><small style={{ fontSize: 9, color: 'var(--muted)' }}>{n.split(' ')[0]}</small></div>)}</div>
    </Card>
    <Card title="Transferencias recientes" subtitle="Historial de envíos y cobros"><DataTable headers={['ID', 'Destinatario', 'Ruta / banco', 'Monto', 'Estado', 'Fecha']}>{recentTransfers.map(t => <tr key={t.id}><td><code>{t.id}</code></td><td><div className="person"><Avatar name={t.to} small /><b>{t.to}</b></div></td><td className="muted">{t.route}</td><td><b>{money(t.amount)}</b></td><td><StatusBadge>{t.status}</StatusBadge></td><td className="muted">{t.date}</td></tr>)}</DataTable></Card>
  </>
}
function Remesas({ open }) {
  const [dest, setDest] = useState(countries[1])
  const [amount, setAmount] = useState('120000')
  const [recipientId, setRecipientId] = useState(0)
  const [newRecipient, setNewRecipient] = useState({ name: '', bank: '', account: '' })
  const received = amount ? (Number(amount) * dest.rate).toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0'
  const savedRecipients = remesaRecipients[dest.code] || []
  const recipient = recipientId === 'new' ? newRecipient : savedRecipients[recipientId]
  const canSend = recipient && recipient.name

  const changeCountry = code => {
    const c = countries.find(x => x.code === code)
    setDest(c)
    const sr = remesaRecipients[c.code] || []
    setRecipientId(sr.length ? 0 : 'new')
    setNewRecipient({ name: '', bank: '', account: '' })
  }

  return <><PageTitle eyebrow="Envíos internacionales" title="Remesas" subtitle="Envía dinero a tu familia en Latinoamérica con llegada instantánea." />
    <Card title="Nueva remesa" subtitle="Tipo de cambio Yol1, sin comisión">
      <div className="fx-converter">
        <div><small>Envías</small><strong>{money(Number(amount) || 0)}</strong><span>CLP · Yol1 Classic</span>
          <input style={{ marginTop: 8, width: '100%', border: '1px solid #dfe7e4', borderRadius: 8, height: 34, padding: '0 8px', fontSize: 11 }} type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <Repeat2 />
        <div><small>Recibe</small><strong>{dest.flag} {dest.currency} {received}</strong><span>{dest.name}</span>
          <select style={{ marginTop: 8, width: '100%', border: '1px solid #dfe7e4', borderRadius: 8, height: 34, padding: '0 8px', fontSize: 11 }} value={dest.code} onChange={e => changeCountry(e.target.value)}>
            {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name} · {c.currency}</option>)}
          </select>
        </div>
      </div>
      <div className="transfer-cost"><span>Tipo de cambio <b>1 CLP = {dest.currency} {dest.rate.toFixed(5)}</b></span><span>Comisión <b>$0</b></span><span>Llegada estimada <b>Instantánea</b></span></div>
    </Card>
    <Card title="Destinatario" subtitle={`A quién le envías en ${dest.name}`}>
      <div className="form-grid" style={{ padding: 0 }}>
        <label className="wide">Destinatario
          <select value={recipientId} onChange={e => setRecipientId(e.target.value === 'new' ? 'new' : Number(e.target.value))}>
            {savedRecipients.map((r, i) => <option key={i} value={i}>{r.name} · {r.bank}</option>)}
            <option value="new">+ Nuevo destinatario</option>
          </select>
        </label>
        {recipientId === 'new' ? <>
          <label>Nombre completo<input placeholder="Nombre y apellido" value={newRecipient.name} onChange={e => setNewRecipient(r => ({ ...r, name: e.target.value }))} /></label>
          <label>Banco<input placeholder="Banco destino" value={newRecipient.bank} onChange={e => setNewRecipient(r => ({ ...r, bank: e.target.value }))} /></label>
          <label className="wide">Número de cuenta o teléfono<input placeholder="···· 0000" value={newRecipient.account} onChange={e => setNewRecipient(r => ({ ...r, account: e.target.value }))} /></label>
        </> : recipient && <div className="wide" style={{ gridColumn: '1/-1' }}>
          <div className="detail-list"><span>Banco<b>{recipient.bank}</b></span><span>Cuenta<b>{recipient.account}</b></span></div>
        </div>}
      </div>
      <div style={{ marginTop: 14 }}><Button icon={Send} disabled={!canSend} onClick={() => open('remesa', { amount: Number(amount) || 0, country: dest, received, recipient })}>Enviar {dest.currency} {received}</Button></div>
    </Card>
    <Card title="Remesas recientes" subtitle="Tus últimos envíos al extranjero"><DataTable headers={['ID', 'Destinatario', 'País', 'Monto enviado', 'Fecha']}>{recentRemesas.map(r => <tr key={r.id}><td><code>{r.id}</code></td><td><div className="person"><Avatar name={r.dest} small /><b>{r.dest}</b></div></td><td>{r.country.flag} {r.country.name}</td><td><b>{money(r.amountCLP)}</b></td><td className="muted">{r.date}</td></tr>)}</DataTable></Card>
  </>
}
function Goals({ open }) {
  return <><PageTitle eyebrow="Ahorro con objetivo" title="Metas de ahorro" subtitle="Define objetivos y haz seguimiento de tu progreso." actions={<Button icon={Plus} onClick={() => open('goal-new')}>Nueva meta</Button>} />
    <div className="cards-grid">
      {goals.map(g => { const pct = Math.round(g.current / g.target * 100); return <Card key={g.name} title={`${g.emoji} ${g.name}`} subtitle={`${pct}% completado · Objetivo ${money(g.target)}`}>
        <div className="health-bars"><span><b>{money(g.current)} ahorrados</b><i><em style={{ width: `${pct}%` }} /></i><small>{pct}%</small></span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}><small className="muted">Faltan {money(Math.max(g.target - g.current, 0))}</small><button className="table-action" onClick={() => open('goal-contribute', g)}>Aportar</button></div>
      </Card> })}
    </div>
    <div className="concept-note"><PiggyBank size={20} /><div><strong>Ahorra con un objetivo claro.</strong><p>Cada meta guarda su propio saldo dentro de tu cuenta Yol1, separado de tu saldo disponible para gastar.</p></div></div>
  </>
}
function Benefits({ open }) {
  const [tab, setTab] = useState('Mis puntos')
  const pointsBalance = 1240
  const earned = pointsHistory.filter(p => p.points > 0).reduce((s, p) => s + p.points, 0)
  const redeemed = Math.abs(pointsHistory.filter(p => p.points < 0).reduce((s, p) => s + p.points, 0))
  return <><PageTitle eyebrow="Recompensas Yol1" title="Beneficios" subtitle="Junta puntos con cada movimiento y cámbialos por descuentos y premios, al estilo CMR Puntos." />
    <div className="metric-grid four">
      <MetricCard label="Puntos disponibles" value={pointsBalance.toLocaleString('es-CL')} icon={Coins} detail="Nivel Gold" tone="amber" />
      <MetricCard label="Puntos ganados" value={`+${earned}`} icon={Award} detail="Este mes" />
      <MetricCard label="Puntos canjeados" value={redeemed} icon={Gift} detail="Este mes" tone="blue" />
      <MetricCard label="Descuentos activos" value={discountsPartners.length} icon={Percent} detail="Con partners Yol1" />
    </div>
    <div className="billing-tabs">{['Mis puntos', 'Canjear puntos', 'Descuentos'].map(t => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
    {tab === 'Mis puntos' && <>
      <Card title="Progreso a tu próximo nivel" subtitle="Nivel Platinum a los 2.000 puntos">
        <div className="health-bars"><span><b>Nivel Gold · {pointsBalance.toLocaleString('es-CL')} / 2.000 pts</b><i><em style={{ width: `${Math.min(pointsBalance / 2000 * 100, 100)}%` }} /></i><small>{Math.round(pointsBalance / 2000 * 100)}%</small></span></div>
      </Card>
      <Card title="Historial de puntos" subtitle="Cómo ganaste y usaste tus puntos"><DataTable headers={['Fecha', 'Detalle', 'Puntos']}>{pointsHistory.map(p => <tr key={p.id}><td className="muted">{p.date}</td><td>{p.desc}</td><td className={p.points > 0 ? 'positive' : 'negative'}><b>{p.points > 0 ? '+' : ''}{p.points} pts</b></td></tr>)}</DataTable></Card>
    </>}
    {tab === 'Canjear puntos' && <div className="cards-grid">{rewardsCatalog.map(r => { const canRedeem = pointsBalance >= r.cost; return <Card key={r.id} title={r.name} subtitle={r.category}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}><div className="metric-icon amber"><r.Icon size={18} /></div><b style={{ fontSize: 13 }}>{r.cost.toLocaleString('es-CL')} pts</b></div>
      <button className="table-action" disabled={!canRedeem} style={{ width: '100%', justifyContent: 'center', padding: '8px 0', opacity: canRedeem ? 1 : .45, cursor: canRedeem ? 'pointer' : 'not-allowed' }} onClick={() => open('redeem', r)}>{canRedeem ? 'Canjear' : 'Puntos insuficientes'}</button>
    </Card> })}</div>}
    {tab === 'Descuentos' && <div className="cards-grid">{discountsPartners.map(d => <Card key={d.id} title={d.merchant} subtitle={d.category}>
      <p style={{ fontSize: 10, color: 'var(--muted)', margin: '0 0 12px' }}>{d.desc}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ background: '#e7f7d3', color: '#315e17', borderRadius: 12, padding: '4px 8px', fontSize: 8, fontWeight: 800 }}>{d.pct}% dcto.</span><small className="muted">{d.expires}</small></div>
      <button className="table-action" style={{ width: '100%', justifyContent: 'center', padding: '8px 0', marginTop: 12 }} onClick={() => open('discount', d)}>Activar descuento</button>
    </Card>)}</div>}
    <div className="concept-note"><Gift size={20} /><div><strong>Gana puntos con cada movimiento.</strong><p>Cada compra, transferencia o remesa con Yol1 suma puntos que puedes canjear por descuentos, cupones y beneficios de partners.</p></div></div>
  </>
}
function Insurance({ open }) {
  const [tab, setTab] = useState('Mis seguros')
  return <><PageTitle eyebrow="Protección Yol1" title="Seguros" subtitle="Protege tu celular, tus compras y tu tranquilidad con coberturas simples." />
    <div className="metric-grid four">
      <MetricCard label="Seguros activos" value={activePolicies.length} icon={Shield} detail="Incluye protección de compras" />
      <MetricCard label="Prima mensual total" value={money(activePolicies.reduce((s, p) => s + p.price, 0))} icon={Wallet} detail="Se descuenta de tu cuenta CLP" tone="blue" />
      <MetricCard label="Siniestros este año" value={claims.length} icon={FileWarning} detail="1 aprobado" tone="amber" />
      <MetricCard label="Cobertura total" value="$10,8M" icon={Umbrella} detail="Sumando todos tus seguros activos" />
    </div>
    <div className="billing-tabs">{['Mis seguros', 'Contratar', 'Siniestros'].map(t => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
    {tab === 'Mis seguros' && <div className="cards-grid">{activePolicies.map(p => <Card key={p.id} title={p.name} subtitle={p.coverage}>
      <p style={{ fontSize: 10, color: 'var(--muted)', margin: '0 0 12px' }}>{p.desc}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><StatusBadge>{p.status}</StatusBadge><b style={{ fontSize: 11 }}>{p.price ? `${money(p.price)} /mes` : 'Incluido'}</b></div>
      <button className="table-action" style={{ width: '100%', justifyContent: 'center', padding: '8px 0', marginTop: 12 }} onClick={() => open('claim', p)}>Reportar siniestro</button>
    </Card>)}</div>}
    {tab === 'Contratar' && <div className="cards-grid">{availablePolicies.map(p => <Card key={p.id} title={p.name} subtitle={p.coverage}>
      <p style={{ fontSize: 10, color: 'var(--muted)', margin: '0 0 12px' }}>{p.desc}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}><div className="metric-icon blue"><p.Icon size={18} /></div><b style={{ fontSize: 13 }}>{money(p.price)} /mes</b></div>
      <button className="table-action" style={{ width: '100%', justifyContent: 'center', padding: '8px 0' }} onClick={() => open('insurance-hire', p)}>Contratar</button>
    </Card>)}</div>}
    {tab === 'Siniestros' && <Card title="Historial de siniestros" subtitle="Solicitudes reportadas sobre tus seguros"><DataTable headers={['ID', 'Seguro', 'Detalle', 'Monto', 'Estado', 'Fecha']}>{claims.map(c => <tr key={c.id}><td><code>{c.id}</code></td><td>{c.policy}</td><td>{c.desc}</td><td><b>{money(c.amount)}</b></td><td><StatusBadge>{c.status}</StatusBadge></td><td className="muted">{c.date}</td></tr>)}</DataTable></Card>}
    <div className="concept-note"><Shield size={20} /><div><strong>Protección simple, sin letra chica.</strong><p>Contrata, gestiona y reporta siniestros de tus seguros directamente desde tu cuenta Yol1, sin trámites adicionales.</p></div></div>
  </>
}
function Profile({ nav }) {
  const menu = [[ShieldCheck, 'Seguridad y acceso', () => nav('Seguridad')], [Bell, 'Notificaciones', () => nav('Configuración')], [Globe2, 'Idioma y región', () => nav('Configuración')], [CreditCard, 'Mis tarjetas', () => nav('Tarjetas')], [Shield, 'Seguros', () => nav('Seguros')], [Gift, 'Beneficios Yol1', () => nav('Beneficios')]]
  return <><PageTitle eyebrow="Mi cuenta" title="Perfil" subtitle="Datos personales, nivel y beneficios de tu cuenta Yol1." />
    <div className="two-col wide-left">
      <Card title="Valentina Rojas" subtitle="18.921.344-6 · Cliente desde 2024">
        <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          <MetricCard label="Balance total" value={money(256300)} icon={Wallet} />
          <MetricCard label="Tarjetas" value={cardsData.length} icon={CreditCard} tone="blue" />
          <MetricCard label="Remesas enviadas" value="12" icon={Globe2} tone="amber" />
        </div>
      </Card>
      <Card title="Nivel Yol1" subtitle="Beneficios activos">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Star size={22} /><div><b style={{ fontSize: 13 }}>Nivel Gold</b><p style={{ fontSize: 10, color: 'var(--muted)', margin: '2px 0 0' }}>1.240 puntos acumulados</p></div></div>
      </Card>
    </div>
    <Card title="Menú de cuenta" subtitle="Accesos rápidos"><div className="settings-grid">{menu.map(([Icon, label, fn]) => <button key={label} className="settings-item" onClick={fn}><span><Icon size={19} /></span><div><b>{label}</b></div><ChevronRight size={18} /></button>)}</div></Card>
  </>
}
function Security() {
  return <><PageTitle eyebrow="Protección de cuenta" title="Seguridad" subtitle="Administra tu acceso, dispositivos y verificación en dos pasos." />
    <div className="metric-grid four">
      <MetricCard label="Verificación 2FA" value="Activa" icon={ShieldCheck} detail="SMS + correo" />
      <MetricCard label="Dispositivos activos" value="2" icon={Smartphone} detail="1 sesión cerrada" />
      <MetricCard label="Último cambio de clave" value="45 días" icon={KeyRound} detail="Recomendado cada 90 días" tone="amber" />
      <MetricCard label="Alertas de seguridad" value="0" icon={AlertCircle} detail="Sin actividad sospechosa" />
    </div>
    <Card title="Dispositivos y sesiones" subtitle="Dónde has iniciado sesión con tu cuenta" action={<Button secondary icon={LogOut}>Cerrar todas las sesiones</Button>}><DataTable headers={['Dispositivo', 'Última actividad', 'Estado', '']}>{devices.map(d => <tr key={d.name}><td><b>{d.name}</b></td><td className="muted">{d.last}</td><td><StatusBadge>{d.status}</StatusBadge></td><td>{d.status === 'Activa' && <button className="table-action">Cerrar sesión</button>}</td></tr>)}</DataTable></Card>
    <div className="concept-note"><Lock size={20} /><div><strong>Tu cuenta, siempre bajo tu control.</strong><p>Activa la verificación en dos pasos y revisa periódicamente los dispositivos con acceso a tu cuenta Yol1.</p></div></div>
  </>
}
function SettingsView() {
  const items = [[Bell, 'Notificaciones', 'Alertas de movimientos, promociones y seguridad'], [Globe2, 'Idioma y región', 'Español (Chile) · CLP'], [CreditCard, 'Métodos de pago', 'Tarjetas y cuentas vinculadas'], [Lock, 'Privacidad', 'Control de datos y permisos'], [LogOut, 'Cerrar sesión', 'Salir de tu cuenta Yol1']]
  return <><PageTitle eyebrow="Preferencias" title="Configuración" subtitle="Ajusta tu experiencia dentro de Yol1 Personas." />
    <div className="settings-grid">{items.map(([Icon, title, sub]) => <button key={title} className="settings-item"><span><Icon size={19} /></span><div><b>{title}</b><small>{sub}</small></div><ChevronRight size={18} /></button>)}</div>
  </>
}

function Sidebar({ active, setActive, mobile, setMobile }) {
  return <aside className={`sidebar ${mobile ? 'mobile-open' : ''}`}>
    <div className="brand"><img src={yol1Mark} alt="" style={{ width: 34, height: 34, objectFit: 'contain' }} /><span style={{ color: '#f4eddc', fontWeight: 800, fontSize: 15, marginLeft: 8 }}>Yol1 <b style={{ color: '#80ef0c' }}>Personas</b></span><button className="mobile-close" onClick={() => setMobile(false)}><X /></button></div>
    <div className="company-switch"><div className="company-icon">VR</div><div><b>Valentina Rojas</b><span>Cuenta personal · CLP</span></div><ChevronDown size={15} /></div>
    <nav>
      <span className="nav-label">MI CUENTA</span>
      {nav.slice(0, 8).map(([name, Icon]) => <button key={name} className={active === name ? 'active' : ''} onClick={() => { setActive(name); setMobile(false) }}><Icon size={17} /><span>{name}</span></button>)}
      <span className="nav-label">CONFIGURACIÓN</span>
      {nav.slice(8).map(([name, Icon]) => <button key={name} className={active === name ? 'active' : ''} onClick={() => { setActive(name); setMobile(false) }}><Icon size={17} /><span>{name}</span></button>)}
    </nav>
    <div className="sidebar-footer"><div className="demo-tag"><Sparkles size={15} /><span><b>Demo conceptual</b><small>No procesa datos reales</small></span></div><div className="profile"><Avatar name="Valentina Rojas" small /><div><b>Valentina</b><span>Cuenta personal</span></div><MoreHorizontal size={17} /></div></div>
  </aside>
}
function Header({ setMobile, onLanding }) {
  return <header><button className="menu-btn" onClick={() => setMobile(true)}><Menu /></button><div className="global-search"><Search size={17} /><span>Buscar movimientos o iniciar una acción</span><kbd>⌘ K</kbd></div><div className="header-right"><button className="demo-back" onClick={onLanding}>Yol1 Landing</button><div className="system-ok"><span /> Cuenta al día</div><button className="icon-btn"><Bell size={18} /><i /></button><Avatar name="Valentina Rojas" small /></div></header>
}
export default function PersonasBusiness({ onBack }) {
  const [active, setActive] = useState('Inicio')
  const [modal, setModal] = useState(null)
  const [mobile, setMobile] = useState(false)
  const open = (type, payload) => setModal({ type, payload })
  const views = {
    'Inicio': <Overview open={open} nav={setActive} />, 'Tarjetas': <CardsView open={open} />, 'Movimientos': <MovementsView />, 'Transferencias': <Transfers open={open} />, 'Remesas': <Remesas open={open} />, 'Metas de ahorro': <Goals open={open} />, 'Beneficios': <Benefits open={open} />, 'Seguros': <Insurance open={open} />,
    'Perfil': <Profile nav={setActive} />, 'Seguridad': <Security />, 'Configuración': <SettingsView />,
  }
  return <div className="app"><Sidebar active={active} setActive={setActive} mobile={mobile} setMobile={setMobile} /><div className="main"><Header setMobile={setMobile} onLanding={onBack} /><main>{views[active]}</main></div>{modal && <Modal modal={modal} onClose={() => setModal(null)} />}</div>
}
