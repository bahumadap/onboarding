import React, { useState, useRef, useEffect } from 'react'
import yol1Mark from '../assets/yol1-mark.svg'
import brandImg5 from '../assets/brand/img5.jpg'
import brandImg7 from '../assets/brand/img7.jpg'
import './landing.css'
import {
  ArrowLeftRight, ArrowRight, BarChart3, Building2, CheckCircle2, ChevronDown,
  CreditCard, FileText, Globe2, Landmark, Layers3, LayoutDashboard,
  Link2, ShieldCheck, Smartphone, Users, WalletCards, Zap
} from 'lucide-react'

const products = [
  {
    id: 'enterprise',
    eyebrow: 'Yol1 Enterprise',
    title: 'Infraestructura para empresas y plataformas',
    icon: Building2,
    forWho: 'Grandes empresas, PSPs, universidades, factorings, marketplaces y corporativos.',
    copy: 'APIs, cuentas virtuales, nodos, conciliacion avanzada, FX y dashboards para operar flujos financieros complejos.',
    solutions: ['YaaS / APIs', 'Cuentas virtuales y nodos', 'Cuentas nominales', 'Pagos y dispersion', 'FX / cross-border', 'Integraciones custom'],
    cta: 'Explorar Enterprise',
  },
  {
    id: 'smb',
    eyebrow: 'Yol1 SMB',
    title: 'APP Business para pymes',
    icon: Landmark,
    forWho: 'Pymes, comercios, negocios medianos, proveedores e importadores.',
    copy: 'Cuenta empresa, subcuentas, pagos, transferencias, tarjetas, facturacion, cobranza y reportes en una app simple.',
    solutions: ['Cuenta empresa', 'Subcuentas', 'Pagos y transferencias', 'Dashboard', 'Tarjetas', 'Facturacion'],
    cta: 'Ver Yol1 SMB',
  },
  {
    id: 'personas',
    eyebrow: 'Yol1 Personas',
    title: 'Cuenta personal downstream',
    icon: WalletCards,
    forWho: 'Personas conectadas desde empresas, universidades, marketplaces o partners.',
    copy: 'Una cuenta personal que nace desde relaciones Business existentes, con wallet, tarjeta, pagos, remesas y beneficios.',
    solutions: ['Cuenta personal', 'Wallet', 'Tarjeta', 'Pagos', 'Remesas', 'Beneficios'],
    cta: 'Conocer Personas',
  },
]

const infra = [
  [Layers3, 'Cuentas & ledger', 'Cuenta madre, cuentas virtuales, nodos y trazabilidad de saldos.'],
  [ArrowLeftRight, 'Pagos & conciliacion', 'Recaudacion, dispersion, matching operativo y cierres diarios.'],
  [Globe2, 'FX & remesas', 'Rutas cross-border, cambio de divisas y pagos internacionales.'],
  [CreditCard, 'Tarjetas & credito', 'Tarjetas como extension de la cuenta y productos financieros futuros.'],
  [ShieldCheck, 'Compliance & APIs', 'Controles, permisos, auditoria, integraciones y webhooks.'],
  [BarChart3, 'Dashboard & data layer', 'Visibilidad ejecutiva para producto, finanzas y operaciones.'],
]

const enterpriseUseCases = [
  'ProntoPaga + XTransfer',
  'Universidad con alumnos',
  'Factoring con empresas cedentes',
  'Marketplace con sellers',
  'Retail con sucursales',
]

const smbsBase = ['Cuenta empresa', 'Subcuentas', 'Pagos', 'Transferencias', 'Dashboard', 'Conciliacion basica', 'Tarjetas', 'Facturacion', 'Cobranza', 'Rendicion de gastos', 'Reportes']
const smbModules = ['FX', 'Tarjetas adicionales', 'Usuarios adicionales', 'Automatizaciones', 'Conciliacion avanzada', 'API premium', 'Financiamiento futuro']
const personasSolutions = ['Cuenta personal', 'Wallet', 'Tarjeta', 'Pagos', 'Remesas', 'Beneficios', 'Credito futuro', 'Inversiones futuras']
const personasExamples = ['Universidad -> alumno', 'Empresa -> empleado', 'Marketplace -> seller', 'Plataforma -> beneficiario', 'Partner -> usuario final']

const useCases = [
  ['Enterprise / XTransfer via ProntoPaga', 'ProntoPaga opera la relacion comercial; Yol1 habilita cuentas, nodos, conciliacion, FX y salida internacional.'],
  ['Universidad', 'Cuenta madre institucional, cuentas nominales para alumnos, pagos, becas y devoluciones trazables.'],
  ['SMB', 'Cuenta empresa, subcuentas, pagos, tarjetas, facturacion, cobranza, rendicion de gastos y conciliacion basica.'],
  ['Marketplace', 'Cuentas para sellers, recaudacion, conciliacion y liquidacion por operacion.'],
  ['Personas downstream', 'Usuarios activados desde Business con cuenta, wallet, tarjeta y remesas.'],
]


const tickerItems = ['PSPs', 'Universidades', 'Marketplaces', 'Factorings', 'Corporativos', 'Pymes', 'Importadores', 'Sellers', 'Empleados', 'Alumnos', 'Beneficiarios']

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target) }
      })
    }, { threshold: 0.12 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function LandingButton({ children, icon: Icon, secondary = false, ghost = false, onClick }) {
  return <button className={`button ${secondary ? 'secondary' : ''} ${ghost ? 'ghost' : ''}`} onClick={onClick}>{Icon && <Icon size={16}/>} {children}</button>
}

function SectionHeader({ eyebrow, title, subtitle }) {
  return <div className="site-section-head">
    {eyebrow && <span className="eyebrow">{eyebrow}</span>}
    <h2>{title}</h2>
    {subtitle && <p>{subtitle}</p>}
  </div>
}

function ChipList({ items }) {
  return <div className="chip-list">{items.map(item => <span key={item}>{item}</span>)}</div>
}

function NavDropdown({ label, children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  return (
    <div className="nav-dd" ref={ref}>
      <button className={open ? 'open' : ''} onClick={() => setOpen(o => !o)}>
        {label} <ChevronDown size={12} />
      </button>
      {open && <div className="nav-dd-menu" onClick={() => setOpen(false)}>{children}</div>}
    </div>
  )
}

export default function Landing({ onDemo, onPersonas, onPersonasWeb }) {
  useScrollReveal()
  const scrollTo = id => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }

  return <div className="landing-shell">
    <header className="landing-nav">
      <button className="landing-brand" onClick={() => scrollTo('top')} aria-label="Ir al inicio">
        <img src={yol1Mark} alt=""/>
        <b>Yol1</b>
      </button>
      <nav className="landing-nav-actions" aria-label="Navegacion principal">
        <NavDropdown label="Productos">
          <button className="dd-item" onClick={() => scrollTo('enterprise-detail')}>
            <Building2 size={15}/>
            <span><b>Enterprise</b><small>APIs, cuentas virtuales y flujos complejos</small></span>
          </button>
          <button className="dd-item" onClick={() => scrollTo('smb-detail')}>
            <Landmark size={15}/>
            <span><b>SMB</b><small>APP Business para pymes</small></span>
          </button>
          <button className="dd-item" onClick={() => scrollTo('personas-detail')}>
            <WalletCards size={15}/>
            <span><b>Personas</b><small>Cuenta personal downstream</small></span>
          </button>
        </NavDropdown>
        <button onClick={() => scrollTo('infrastructure')}>Infraestructura</button>
        <button onClick={() => scrollTo('cases')}>Casos de uso</button>
        <NavDropdown label="Demos">
          <button className="dd-item" onClick={onDemo}>
            <LayoutDashboard size={15}/>
            <span><b>Demo SMB</b><small>Dashboard empresas y pymes</small></span>
          </button>
          <button className="dd-item" onClick={onPersonas}>
            <Smartphone size={15}/>
            <span><b>Demo Personas</b><small>App neobanco personal</small></span>
          </button>
          <button className="dd-item" onClick={onPersonasWeb}>
            <LayoutDashboard size={15}/>
            <span><b>Demo Personas Web</b><small>Panel Personas en formato Business</small></span>
          </button>
        </NavDropdown>
      </nav>
      <div style={{display:'flex',gap:'8px',flexWrap:'wrap',justifyContent:'flex-end'}}>
        <LandingButton secondary icon={Smartphone} onClick={onPersonas}>Demo Personas</LandingButton>
        <LandingButton secondary icon={LayoutDashboard} onClick={onPersonasWeb}>Personas Web</LandingButton>
        <LandingButton icon={LayoutDashboard} onClick={onDemo}>Demo SMB</LandingButton>
      </div>
    </header>

    <main id="top">
      <section className="official-hero">
        <div className="hero-diagonal" aria-hidden="true" />
        <div className="hero-img-panel" aria-hidden="true"><img src={brandImg7} alt="" /></div>
        <div className="hero-copy">
          <span className="eyebrow">Yol1</span>
          <h1>Infraestructura financiera para empresas, plataformas y personas</h1>
          <div className="hero-accent-bar" aria-hidden="true"><span /><span /><span /></div>
          <p className="hero-lead">Yol1 combina cuentas virtuales, pagos, conciliacion, FX, tarjetas y APIs en una infraestructura comun que se adapta a distintos modelos de negocio.</p>
          <p className="hero-sub">Desde grandes empresas y plataformas hasta pymes y usuarios finales conectados al ecosistema Business.</p>
          <div className="landing-actions">
            <LandingButton icon={ArrowRight} onClick={()=>scrollTo('products')}>Explorar productos</LandingButton>
          </div>
        </div>
        <div className="hero-platform-card">
          <div className="hpc-header">
            <img src={yol1Mark} alt="Yol1"/>
            <span>Tres productos, una infraestructura</span>
          </div>
          <div className="hpc-products">
            <div className="hpc-product enterprise">
              <b>Enterprise</b>
              <p>APIs, flujos complejos y cuentas virtuales a escala</p>
              <small>PSPs · Universidades · Marketplaces · Corporativos</small>
            </div>
            <div className="hpc-product smb">
              <b>SMB</b>
              <p>APP Business con pagos, tarjetas, facturacion y conciliacion</p>
              <small>Pymes · Comercios · Importadores</small>
            </div>
            <div className="hpc-product personas">
              <b>Personas</b>
              <p>Cuenta personal activada desde relaciones Business existentes</p>
              <small>Empleados · Alumnos · Beneficiarios · Sellers</small>
            </div>
          </div>
          <div className="hpc-metrics">
            <div><b>18.420+</b><span>Cuentas virtuales</span></div>
            <div><b>$845M</b><span>CLP administrados</span></div>
            <div><b>98,2%</b><span>Conciliacion diaria</span></div>
          </div>
        </div>
      </section>

      <section className="site-section intro-section reveal" id="what-is-yol1">
        <SectionHeader eyebrow="Que es Yol1" title="Una plataforma financiera Business-first" subtitle="Yol1 construye una base comun para cuentas, pagos y datos financieros, y la convierte en productos para empresas, pymes y personas conectadas."/>
        <div className="intro-grid reveal-grid">
          <div><Zap size={22}/><b>Infraestructura compartida</b><p>La base tecnologica y financiera se construye una vez, con capacidades reutilizables para distintos canales.</p></div>
          <div><Link2 size={22}/><b>Productos empaquetados</b><p>Enterprise, SMB y Personas usan la misma base, pero cambian experiencia, complejidad y modelo comercial.</p></div>
          <div><Users size={22}/><b>Expansion downstream</b><p>Personas se activa desde relaciones Business existentes, no desde adquisicion masiva B2C.</p></div>
        </div>
      </section>

      <section className="site-section brand-visual-section reveal">
        <div className="bv-content">
          <span className="eyebrow">Mas vida, menos barreras</span>
          <h2>Tu dinero se mueve tan rapido como tu</h2>
          <p>Una plataforma para empresas, pymes y personas conectadas al ecosistema financiero moderno.</p>
        </div>
        <div className="bv-image"><img src={brandImg5} alt="" /></div>
      </section>

      <section className="site-section products-section reveal" id="products">
        <SectionHeader eyebrow="Productos Yol1" title="Tres productos sobre una misma infraestructura" subtitle="Yol1 construye una base financiera comun y la empaqueta segun el tipo de cliente, canal y complejidad."/>
        <div className="product-card-grid reveal-grid">
          {products.map(({ id, eyebrow, title, icon: Icon, forWho, copy, solutions, cta }) => <article className={`product-card ${id}`} key={id}>
            <div className="product-icon"><Icon size={22}/></div>
            <span>{eyebrow}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
            <b>Para</b>
            <p>{forWho}</p>
            <ChipList items={solutions}/>
            <div className="product-actions">
              <LandingButton secondary icon={ArrowRight} onClick={id === 'smb' ? onDemo : ()=>scrollTo(`${id}-detail`)}>{cta}</LandingButton>
              {id === 'smb' && <LandingButton icon={LayoutDashboard} onClick={onDemo}>Ver demo SMB</LandingButton>}
      {id === 'personas' && <LandingButton icon={Smartphone} onClick={onPersonas}>Ver demo Personas</LandingButton>}
      {id === 'personas' && <LandingButton icon={LayoutDashboard} onClick={onPersonasWeb}>Ver panel web</LandingButton>}
            </div>
          </article>)}
        </div>
      </section>

      <section className="site-section reveal" id="infrastructure">
        <SectionHeader eyebrow="Infraestructura comun" title="Una infraestructura comun para multiples modelos financieros" subtitle="Las verticales cambian. La base es la misma."/>
        <div className="infra-grid reveal-grid">{infra.map(([Icon,title,copy])=><article className="infra-card" key={title}><Icon size={20}/><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>

      <div className="ticker-wrap" aria-hidden="true">
        <div className="ticker-track">
          {tickerItems.map((item, i) => <span key={i}><span className="ticker-dot" />{item}</span>)}
          {tickerItems.map((item, i) => <span key={`b${i}`}><span className="ticker-dot" />{item}</span>)}
        </div>
      </div>

      <section className="detail-section enterprise-detail reveal" id="enterprise-detail">
        <div>
          <SectionHeader eyebrow="Yol1 Enterprise" title="Infraestructura financiera para empresas, plataformas y operaciones complejas."/>
          <p className="detail-copy">Permite separar flujos por cliente, seller, alumno, sucursal, proveedor o factura; conciliar operaciones; ejecutar pagos, dispersion, FX o salidas internacionales; y operar via API, dashboard o solucion custom.</p>
          <LandingButton icon={ArrowRight}>Solicitar demo Enterprise</LandingButton>
        </div>
        <div className="detail-panels">
          <article><h3>Para quien</h3><ChipList items={['PSPs y fintechs', 'Universidades', 'Factorings', 'Marketplaces', 'Retailers', 'Corporativos']}/></article>
          <article><h3>Casos</h3><ul>{enterpriseUseCases.map(item => <li key={item}><CheckCircle2 size={15}/>{item}</li>)}</ul></article>
        </div>
      </section>

      <section className="detail-section smb-detail reveal" id="smb-detail">
        <div>
          <SectionHeader eyebrow="Yol1 SMB" title="La APP Business para pymes que necesitan ordenar caja, pagos y operacion financiera."/>
          <p className="detail-copy">Una experiencia simple para operar cuenta empresa, subcuentas, pagos, tarjetas, facturacion, cobranza, conciliacion y reportes. La demo SMB anterior sigue disponible como prototipo navegable.</p>
          <LandingButton icon={LayoutDashboard} onClick={onDemo}>Ver demo Yol1 SMB</LandingButton>
        </div>
        <div className="detail-panels">
          <article><h3>Funciones base</h3><ChipList items={smbsBase}/></article>
          <article><h3>Modulos extra</h3><ChipList items={smbModules}/></article>
        </div>
      </section>

      <section className="detail-section personas-detail reveal" id="personas-detail">
        <div>
          <SectionHeader eyebrow="Yol1 Personas" title="La cuenta personal que nace desde relaciones Business."/>
          <p className="detail-copy">Yol1 Personas no parte como una wallet masiva desde cero. Se activa cuando una empresa, universidad, marketplace o partner crea una relacion financiera con una persona.</p>
          <div className="landing-actions">
            <LandingButton icon={ArrowRight} onClick={onPersonas}>Ver demo Personas</LandingButton>
            <LandingButton secondary icon={LayoutDashboard} onClick={onPersonasWeb}>Ver panel web</LandingButton>
          </div>
        </div>
        <div className="detail-panels">
          <article><h3>Soluciones</h3><ChipList items={personasSolutions}/></article>
          <article><h3>Ejemplos</h3><ChipList items={personasExamples}/></article>
        </div>
        <div className="persona-flow"><span>Empresa / universidad / marketplace / partner</span><ArrowRight/><span>Activa cuenta persona</span><ArrowRight/><span>APP Personas</span><ArrowRight/><span>Pagos, tarjeta, remesas y beneficios</span><ArrowRight/><span>Productos futuros</span></div>
      </section>

      <section className="site-section reveal" id="cases">
        <SectionHeader eyebrow="Casos de uso" title="Donde la infraestructura se vuelve producto"/>
        <div className="use-case-grid reveal-grid">{useCases.map(([title,copy],i)=><article key={title}><small>{String(i+1).padStart(2,'0')}</small><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>

      <section className="landing-cta">
        <h2>Una infraestructura. Tres productos. Multiples modelos de negocio.</h2>
        <p>Yol1 Enterprise, Yol1 SMB y Yol1 Personas comparten la misma base financiera: cuentas, pagos, conciliacion, FX, tarjetas y APIs.</p>
        <div className="landing-actions">
          <LandingButton icon={ArrowRight}>Solicitar demo</LandingButton>
          <LandingButton secondary icon={LayoutDashboard} onClick={onDemo}>Ver demo SMB</LandingButton>
        </div>
      </section>
    </main>
  </div>
}
