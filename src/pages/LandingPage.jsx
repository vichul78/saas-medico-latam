import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hls from 'hls.js';
import {
  Stethoscope, Brain, Monitor, Receipt, ChevronDown,
  ArrowRight, Sparkles, Zap, CheckCircle2, BarChart3,
  ShieldCheck, Globe, CalendarCheck, FileImage, Menu, X,
} from 'lucide-react';
import { ContainerScroll } from '../components/ui/container-scroll-animation';
import { ModernFeatures } from '../components/ui/modern-features';
import { SpecialistsCarousel } from '../components/ui/specialists-carousel';
import { ContainerTextFlip } from '../components/ui/container-text-flip';

/*
  ┌─────────────────────────────────────────────────────────────────────────────
  │  LandingPage — Hero CodeNest × MediCo LatAm
  │
  │  Hero: dark full-screen HLS video bg, liquid-glass card, Apple-style
  │        typography (Inter + Plus Jakarta Sans + Instrument Serif)
  │  Color: #070b0a bg · #5ed29c accent (hero only) · #7A22FF (rest of site)
  │  Nav: same medical mega-dropdowns, white minimalist, hamburger mobile
  └─────────────────────────────────────────────────────────────────────────────
*/

/* ── HLS Video Stream ──────────────────────────────────────────────────────── */
const HLS_SRC = 'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';

/* ── Nav dropdown data (unchanged) ─────────────────────────────────────────── */
const SOLUCIONES_COL1 = [
  { label: 'Radiología',    href: '/soluciones/radiologia',   icon: '🫁' },
  { label: 'Dental',        href: '/soluciones/dental',       icon: '🦷' },
  { label: 'Cirugía',       href: '/soluciones/cirugia',      icon: '🔬' },
  { label: 'Cardiología',   href: '/soluciones/cardiologia',  icon: '❤️' },
  { label: 'Neumología',    href: '/soluciones/neumologia',   icon: '🌬️' },
  { label: 'Audiometría',   href: '/soluciones/audiometria',  icon: '👂' },
];
const SOLUCIONES_COL2 = [
  { label: 'Patología',     href: '/soluciones/patologia',    icon: '🧬' },
  { label: 'Obstétrico',    href: '/soluciones/obstetrico',   icon: '🤱' },
  { label: 'Colposcopia',   href: '/soluciones/colposcopia',  icon: '🔎' },
  { label: 'Oftalmología',  href: '/soluciones/oftalmologia', icon: '👁️' },
  { label: 'Veterinaria',   href: '/soluciones/veterinaria',  icon: '🐾' },
  { label: 'Teleradiología',href: '/soluciones/teleradiologia',icon:'🌐', highlight: true },
];

const FUNCIONALIDADES_BLOCKS = [
  { title: 'Tecnología Avanzada', items: [
    { label: 'IA Asistente',           href: '/funcionalidades/tecnologia/ia-asistente' },
    { label: 'Visor DICOM',            href: '/funcionalidades/tecnologia/visor-dicom' },
    { label: 'Envío de resultados',    href: '/funcionalidades/tecnologia/envio-resultados' },
    { label: 'Compatibilidad total',   href: '/funcionalidades/tecnologia/compatibilidad-total' },
  ]},
  { title: 'Gestión Integral', items: [
    { label: 'Almacenamiento seguro',  href: '/funcionalidades/gestion/almacenamiento-seguro' },
    { label: 'Gestión de estudios',    href: '/funcionalidades/gestion/estudios' },
    { label: 'Citas y agendas',        href: '/funcionalidades/gestion/citas-agendas' },
    { label: 'Facturación y cobros',   href: '/funcionalidades/gestion/facturacion-cobros' },
  ]},
  { title: 'Fácil de Usar', items: [
    { label: 'Portal pacientes',       href: '/funcionalidades/facil-uso/portal-pacientes' },
    { label: 'Portal médicos',         href: '/funcionalidades/facil-uso/portal-medicos' },
    { label: 'Recordatorios de citas', href: '/funcionalidades/facil-uso/recordatorios-citas' },
  ]},
  { title: 'Personalizado', items: [
    { label: 'Adaptación total',       href: '/funcionalidades/personalizado/adaptacion-total' },
    { label: 'Integraciones',          href: '/funcionalidades/personalizado/integraciones' },
    { label: 'Modelo de precios',      href: '/funcionalidades/personalizado/modelo-precios' },
  ]},
];

/* ── Product + Features data ────────────────────────────────────────────────── */
const PRODUCT_TABS = [
  { id: 'pacs', label: 'Visor PACS', icon: <Monitor className="h-4 w-4" />,
    headline: 'Visor DICOM nativo en la nube',
    desc: 'Visualiza y analiza estudios CT, MRI, DX y US directamente en tu navegador. Sin plugins, sin instalaciones.',
    points: ['Soporte CT · MR · DX · CR · US · ECG','Ajuste WW/WL con presets radiológicos','Herramientas de medición y anotación','Compatible con PACS y worklists RIS'] },
  { id: 'billing', label: 'Gestión y Cobros', icon: <Receipt className="h-4 w-4" />,
    headline: 'Administración financiera multidivisa',
    desc: 'Emite facturas en MXN, BRL, ARS, COP, CLP y 6 monedas más. Dashboard financiero con KPIs en tiempo real.',
    points: ['Facturación CFDI 4.0 (MX), NFS-e (BR)','11 monedas LatAm soportadas','Dashboard: ingresos, cobros, vencidas','Citas y agendas integradas'] },
  { id: 'ai', label: 'Copiloto IA', icon: <Brain className="h-4 w-4" />,
    headline: 'Iris — tu asistente clínico inteligente',
    desc: 'Dicta hallazgos por voz, genera impresiones diagnósticas estructuradas y exporta reportes PDF firmados.',
    points: ['Dictado de voz con SpeechRecognition nativo','Generación de informes radiológicos','Exportación PDF profesional (jsPDF)','Diagnósticos diferenciales sugeridos'] },
];

const FEATURES = [
  { icon: <FileImage className="h-6 w-6" />, title: 'DICOM nativo',       desc: 'CT · MR · DX · US. Sin plugins.' },
  { icon: <Brain className="h-6 w-6" />,     title: 'Copiloto Iris',      desc: 'IA clínica para informes y diagnósticos.' },
  { icon: <CalendarCheck className="h-6 w-6" />, title: 'Agenda inteligente', desc: 'Citas multi-recurso con recordatorios.' },
  { icon: <ShieldCheck className="h-6 w-6" />,   title: 'HIPAA · LGPD',  desc: 'Cumplimiento regulatorio regional.' },
  { icon: <Globe className="h-6 w-6" />,     title: '11 monedas LatAm',   desc: 'MXN · BRL · ARS · COP · CLP y más.' },
  { icon: <Stethoscope className="h-6 w-6" />, title: '11 especialidades', desc: 'Radiología, Dental, Cardio y más.' },
];

const STATS = [
  { value: '+500', label: 'Clínicas activas' },
  { value: '11',   label: 'Monedas LatAm' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '<200ms', label: 'Latencia media' },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   HLS VIDEO BACKGROUND
═══════════════════════════════════════════════════════════════════════════════ */
function HeroVideo() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false });
      hls.loadSource(HLS_SRC);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      return () => hls.destroy();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = HLS_SRC;
      video.play().catch(() => {});
    }
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      className="absolute inset-0 h-full w-full object-cover"
      style={{ opacity: 0.6, pointerEvents: 'none' }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LIQUID GLASS CARD (CodeNest spec, adapted to medical content)
═══════════════════════════════════════════════════════════════════════════════ */
function LiquidGlassCard() {
  return (
    <div
      className="relative mb-0 translate-y-[-50px] rounded-2xl"
      style={{
        width: 200,
        height: 200,
        background: 'rgba(255,255,255,0.01)',
        backgroundBlendMode: 'luminosity',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)',
      }}
    >
      {/* gradient border via pseudo-element-equivalent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          padding: '1.4px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      {/* Content */}
      <div className="flex h-full flex-col justify-between p-4">
        {/* Year tag */}
        <span
          className="w-fit rounded-full border border-white/20 px-2.5 py-0.5 text-white/70"
          style={{ fontSize: 14 }}
        >
          [ 2025 ]
        </span>

        {/* Headline */}
        <div>
          <p
            className="mb-1 leading-tight text-white"
            style={{ fontSize: 18, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Diseñado por{' '}
            <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}>
              Especialistas
            </em>
          </p>
          <p className="text-white/50" style={{ fontSize: 11 }}>
            Plataforma clínica de próxima generación para Latinoamérica.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HERO SECTION — CodeNest style, medical content
═══════════════════════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16"
      style={{ background: '#070b0a' }}
    >
      {/* ── HLS Video ── */}
      <HeroVideo />

      {/* ── Dark gradient left ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: 'linear-gradient(to right, #070b0a 0%, transparent 60%)',
        }}
      />

      {/* ── Bottom-up gradient for readability ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-64"
        style={{
          background: 'linear-gradient(to top, #070b0a 0%, transparent 100%)',
        }}
      />

      {/* ── Vertical grid lines (desktop) ── */}
      {[25, 50, 75].map(pct => (
        <div
          key={pct}
          aria-hidden
          className="pointer-events-none absolute inset-y-0 z-[1] hidden w-px lg:block"
          style={{ left: `${pct}%`, background: 'rgba(255,255,255,0.10)' }}
        />
      ))}

      {/* ── Central cyan/green ellipse glow ── */}
      <svg
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 z-[2] -translate-x-1/2"
        width="900"
        height="220"
        viewBox="0 0 900 220"
        fill="none"
      >
        <defs>
          <filter id="heroGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="25" />
          </filter>
        </defs>
        <ellipse cx="450" cy="60" rx="380" ry="60" fill="#0a2e23" filter="url(#heroGlow)" opacity="0.9" />
        <ellipse cx="450" cy="60" rx="240" ry="40" fill="#0d3d2e" filter="url(#heroGlow)" opacity="0.7" />
      </svg>

      {/* ── Liquid Glass Card ── */}
      <div className="relative z-10 flex justify-center">
        <LiquidGlassCard />
      </div>

      {/* ── Eyebrow ── */}
      <p
        className="relative z-10 mb-4 font-bold uppercase"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 11,
          letterSpacing: '0.18em',
          color: '#5ed29c',
        }}
      >
        RIS/PACS Nativo · IA Clínica · LatAm First
      </p>

      {/* ── Main headline ── */}
      <h1
        className="relative z-10 mb-6 max-w-4xl text-center font-extrabold uppercase leading-none tracking-tight"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 'clamp(40px, 7vw, 72px)',
          color: '#ffffff',
        }}
      >
        DIGITALIZA TU CLÍNICA<span style={{ color: '#5ed29c' }}>.</span>
      </h1>

      {/* ── Sub-headline ── */}
      <p
        className="relative z-10 mb-10 max-w-[512px] text-center leading-relaxed"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          color: 'rgba(255,255,255,0.70)',
        }}
      >
        Gestiona estudios DICOM, pacientes y cobros multidivisa desde un solo sistema
        diseñado para clínicas y hospitales de Latinoamérica.
      </p>

      {/* ── CTA ── */}
      <Link
        to="/login"
        className="relative z-10 inline-flex items-center gap-2.5 rounded-full px-8 py-3 font-bold uppercase
                   transition hover:brightness-110 hover:scale-[1.03] active:scale-[0.97]"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          background: '#5ed29c',
          color: '#070b0a',
          letterSpacing: '0.08em',
        }}
      >
        Comenzar <ArrowRight className="h-4 w-4" />
      </Link>

      {/* ── Scroll indicator ── */}
      <div
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 opacity-40"
        aria-hidden
      >
        <div className="h-8 w-px" style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.5))' }} />
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50" style={{ fontFamily: "'Inter', sans-serif" }}>
          scroll
        </span>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   NAVBAR — White minimalist, sticky, hamburger mobile
   Keeps existing medical mega-dropdowns intact
═══════════════════════════════════════════════════════════════════════════════ */
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 shadow-sm'
            : 'bg-transparent'
        }`}
        style={{ backdropFilter: scrolled ? 'blur(20px)' : 'none' }}
      >
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 lg:px-8">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: scrolled ? '#070b0a' : 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
            >
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span
              className="text-lg font-bold tracking-tight"
              style={{ color: scrolled ? '#070b0a' : '#ffffff' }}
            >
              MediCo<span style={{ color: '#5ed29c' }}> LatAm</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            <SolucionesDropdown scrolled={scrolled} />
            <FuncionalidadesDropdown scrolled={scrolled} />
            {['Productos', 'Nosotros'].map(label => (
              <Link
                key={label}
                to={`/${label.toLowerCase()}`}
                className="rounded-lg px-4 py-2 text-sm font-medium transition"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 16,
                  color: scrolled ? '#555' : 'rgba(255,255,255,0.75)',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#5ed29c'; }}
                onMouseLeave={e => { e.currentTarget.style.color = scrolled ? '#555' : 'rgba(255,255,255,0.75)'; }}
              >
                {label.toUpperCase()}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex">
            <Link
              to="/login"
              className="rounded-full border px-6 py-2 text-sm font-semibold transition hover:brightness-110"
              style={{
                fontFamily: "'Inter', sans-serif",
                borderColor: scrolled ? '#070b0a' : 'rgba(255,255,255,0.25)',
                color: scrolled ? '#070b0a' : '#ffffff',
                background: 'transparent',
              }}
            >
              Iniciar Sesión
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(v => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg lg:hidden"
            style={{ color: scrolled ? '#070b0a' : '#ffffff' }}
            aria-label="Menú"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* ── Mobile full-screen overlay ── */}
      <div
        className={`fixed inset-0 z-40 flex flex-col transition-all duration-300 lg:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        style={{ background: 'rgba(7,11,10,0.97)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex h-[68px] items-center justify-between px-5">
          <span
            className="text-lg font-bold text-white tracking-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            MediCo<span style={{ color: '#5ed29c' }}> LatAm</span>
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="text-white/70 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#5ed29c]">Soluciones</p>
          {[...SOLUCIONES_COL1, ...SOLUCIONES_COL2].map(s => (
            <Link
              key={s.href}
              to={s.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm text-white/70 hover:text-white"
            >
              {s.icon} {s.label}
            </Link>
          ))}
          <p className="mb-2 mt-5 text-[10px] font-bold uppercase tracking-widest text-[#5ed29c]">Funcionalidades</p>
          {FUNCIONALIDADES_BLOCKS.slice(0, 2).flatMap(b => b.items).map(f => (
            <Link
              key={f.href}
              to={f.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm text-white/70 hover:text-white"
            >
              {f.label}
            </Link>
          ))}
          <div className="mt-8">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-bold uppercase"
              style={{ background: '#5ed29c', color: '#070b0a', fontSize: 14, fontFamily: "'Inter', sans-serif" }}
            >
              Comenzar <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Dropdown base wrapper ───────────────────────────────────────────────────── */
function DropdownWrapper({ label, scrolled, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 16,
          color: scrolled ? '#555' : 'rgba(255,255,255,0.75)',
        }}
      >
        {label.toUpperCase()}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 transition-all duration-200 ${
          open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function SolucionesDropdown({ scrolled }) {
  return (
    <DropdownWrapper label="Soluciones" scrolled={scrolled}>
      <div className="w-[520px] rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-xl backdrop-blur-2xl">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#5ed29c' }}>
          11 Especialidades Clínicas
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          <div className="space-y-0.5">
            {SOLUCIONES_COL1.map(s => (
              <Link key={s.href} to={s.href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
                <span>{s.icon}</span>{s.label}
              </Link>
            ))}
          </div>
          <div className="space-y-0.5">
            {SOLUCIONES_COL2.map(s => (
              <Link key={s.href} to={s.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition hover:bg-slate-50 hover:text-slate-900 ${
                  s.highlight ? 'border border-[#5ed29c]/30 bg-[#5ed29c]/5 font-semibold text-[#3ab87a]' : 'text-slate-600'
                }`}>
                <span>{s.icon}</span>{s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DropdownWrapper>
  );
}

function FuncionalidadesDropdown({ scrolled }) {
  return (
    <DropdownWrapper label="Funcionalidades" scrolled={scrolled}>
      <div className="w-[600px] rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-xl backdrop-blur-2xl">
        <div className="grid grid-cols-2 gap-6">
          {FUNCIONALIDADES_BLOCKS.map(block => (
            <div key={block.title}>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#5ed29c' }}>
                {block.title}
              </p>
              <div className="space-y-0.5">
                {block.items.map(item => (
                  <Link key={item.href} to={item.href}
                    className="block rounded-lg px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DropdownWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   BROWSER MOCKUP (unchanged, cleaned)
═══════════════════════════════════════════════════════════════════════════════ */
function BrowserMockup() {
  return (
    <div className="w-full max-w-6xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_32px_80px_-16px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <div className="flex h-10 items-center gap-2.5 border-b border-slate-200 bg-slate-100 px-4">
          <div className="h-3 w-3 rounded-full bg-[#5ed29c]/60" />
          <div className="h-3 w-3 rounded-full bg-[#3ab87a]/50" />
          <div className="h-3 w-3 rounded-full bg-[#5ed29c]/30" />
          <div className="mx-auto flex h-6 w-64 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3">
            <div className="h-2 w-2 rounded-full bg-[#5ed29c]/50" />
            <span className="font-mono text-[11px] text-slate-400">app.medicolatam.com/visor</span>
          </div>
        </div>
        <div className="relative flex h-[400px] overflow-hidden sm:h-[480px]">
          <div className="hidden w-36 shrink-0 border-r border-slate-200 bg-black/50 p-3 sm:block">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-[#5ed29c]">Series</p>
            {['TC Tórax Axial', 'TC Tórax Coronal', 'Rx PA'].map((s, i) => (
              <div key={s} className={`mb-1.5 rounded-lg p-2 text-[10px] text-slate-500 ${
                i === 0 ? 'border border-[#5ed29c]/30 bg-[#5ed29c]/8 text-slate-700' : ''}`}>
                <div className="mb-1 h-12 w-full rounded bg-black/70" />
                <p className="truncate">{s}</p>
              </div>
            ))}
          </div>
          <div className="relative flex flex-1 items-center justify-center bg-black">
            <svg viewBox="0 0 512 400" className="w-full max-h-full" aria-hidden>
              <rect width="512" height="400" fill="#000" />
              <ellipse cx="256" cy="200" rx="175" ry="140" fill="#0d0d0d" />
              <ellipse cx="256" cy="200" rx="150" ry="120" fill="#161616" />
              <ellipse cx="198" cy="195" rx="62" ry="85" fill="#080808" />
              <ellipse cx="316" cy="195" rx="65" ry="85" fill="#080808" />
              <ellipse cx="256" cy="210" rx="40" ry="48" fill="#222" />
              <line x1="256" y1="110" x2="256" y2="290" stroke="rgba(94,210,156,0.25)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="160" y1="200" x2="352" y2="200" stroke="rgba(94,210,156,0.25)" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
            <div className="pointer-events-none absolute left-3 top-3 font-mono text-[9px] text-slate-400">
              <p>PACIENTE: Demo · García</p><p>CT · Axial</p>
            </div>
            <div className="pointer-events-none absolute right-3 top-3 text-right font-mono text-[9px] text-slate-400">
              <p>WW/WL: 400/40</p><p>IMG: 24/48</p>
            </div>
          </div>
          <div className="hidden w-52 shrink-0 border-l border-slate-200 bg-[#050010]/80 sm:flex sm:flex-col">
            <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: 'linear-gradient(to right, #070b0a, #0d2b1e)' }}>
              <div className="h-6 w-6 rounded-full bg-[#5ed29c]/20" />
              <p className="text-[11px] font-semibold text-white">Iris · IA</p>
              <div className="ml-auto h-2 w-2 animate-pulse rounded-full bg-[#5ed29c]" />
            </div>
            <div className="flex-1 space-y-2 p-3">
              <div className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] text-slate-500">Analizando TC de tórax…</div>
              <div className="ml-2 rounded-lg border border-[#5ed29c]/20 bg-[#5ed29c]/5 px-2.5 py-1.5 text-[10px] text-slate-500">Parénquima sin consolidaciones. CTR normal.</div>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden className="pointer-events-none mx-auto mt-0 h-14 w-2/3 -translate-y-4 rounded-full bg-[#5ed29c]/10 blur-2xl" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PRODUCT TABS
═══════════════════════════════════════════════════════════════════════════════ */
function ProductTabs() {
  const [active, setActive] = useState('pacs');
  const tab = PRODUCT_TABS.find(t => t.id === active);
  return (
    <section className="relative py-28 px-4 sm:px-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#5ed29c]/30 bg-[#5ed29c]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: '#3ab87a' }}>
            <Sparkles className="h-3 w-3" /> Plataforma modular
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Todo lo que tu clínica{' '}
            <span className="bg-gradient-to-r from-[#5ed29c] to-[#3ab87a] bg-clip-text text-transparent">necesita</span>
          </h2>
        </div>
        <div className="mb-12 flex flex-wrap justify-center gap-2">
          {PRODUCT_TABS.map(t => (
            <button key={t.id} type="button" onClick={() => setActive(t.id)}
              className={`flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition ${
                active === t.id
                  ? 'border-[#5ed29c]/50 bg-[#5ed29c]/15 text-slate-900 shadow-[0_0_24px_-6px_rgba(94,210,156,0.4)]'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-[#5ed29c]/30 hover:text-slate-700'
              }`}>
              <span className={active === t.id ? 'text-[#3ab87a]' : ''}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h3 className="mb-4 text-3xl font-bold leading-tight text-slate-900">{tab.headline}</h3>
            <p className="mb-8 text-base leading-relaxed text-slate-500">{tab.desc}</p>
            <ul className="space-y-3">
              {tab.points.map(pt => (
                <li key={pt} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: '#5ed29c' }} />
                  <span className="text-sm text-slate-600">{pt}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Link to="/login"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold uppercase transition hover:brightness-110"
                style={{ background: '#5ed29c', color: '#070b0a', fontFamily: "'Inter', sans-serif" }}>
                Comenzar ahora <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)]">
            <TabVisual tabId={active} />
          </div>
        </div>
      </div>
    </section>
  );
}

function TabVisual({ tabId }) {
  if (tabId === 'pacs') return (
    <div className="space-y-3">
      <div className="mb-3 flex items-center gap-2">
        <Monitor className="h-5 w-5" style={{ color: '#5ed29c' }} />
        <span className="text-sm font-semibold text-slate-900">Visor DICOM</span>
        <span className="ml-auto rounded-full border border-[#5ed29c]/30 bg-[#5ed29c]/10 px-2 py-0.5 text-[10px] font-bold" style={{ color: '#3ab87a' }}>CT</span>
      </div>
      <div className="flex h-48 items-center justify-center overflow-hidden rounded-xl bg-black">
        <svg viewBox="0 0 256 180" className="w-full max-h-full opacity-60" aria-hidden>
          <rect width="256" height="180" fill="#000" />
          <ellipse cx="128" cy="90" rx="90" ry="70" fill="#111" />
          <ellipse cx="100" cy="88" rx="32" ry="42" fill="#080808" />
          <ellipse cx="158" cy="88" rx="34" ry="42" fill="#080808" />
        </svg>
      </div>
      <div className="flex gap-2">
        {['Pulmón','Hueso','Tejido','Cerebro'].map(p => (
          <div key={p} className="flex-1 rounded-lg border border-slate-200 bg-slate-50 py-1.5 text-center text-[10px] font-medium text-slate-500">{p}</div>
        ))}
      </div>
    </div>
  );
  if (tabId === 'billing') return (
    <div className="space-y-3">
      <div className="mb-2 flex items-center gap-2">
        <Receipt className="h-5 w-5 text-slate-500" />
        <span className="text-sm font-semibold text-slate-900">Dashboard Financiero</span>
      </div>
      {[
        { label: 'Ingresos del mes',    val: '$124,500 MXN', pct: 78 },
        { label: 'Cuentas por cobrar',  val: '$38,200 MXN',  pct: 45 },
        { label: 'Facturas emitidas',   val: '142',           pct: 90 },
      ].map(r => (
        <div key={r.label} className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs text-slate-500">{r.label}</p>
            <p className="text-sm font-bold text-slate-900">{r.val}</p>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: '#5ed29c' }} />
          </div>
        </div>
      ))}
    </div>
  );
  return (
    <div className="space-y-2">
      <div className="mb-3 flex items-center gap-2">
        <Brain className="h-5 w-5 text-slate-500" />
        <span className="text-sm font-semibold text-slate-900">Copiloto Iris</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-[#5ed29c]/30 bg-[#5ed29c]/10 px-2 py-0.5 text-[10px] font-semibold" style={{ color: '#3ab87a' }}>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5ed29c]" /> Online
        </span>
      </div>
      {[
        { who: 'iris', text: 'Listo para analizar estudios y dictar informes.' },
        { who: 'user', text: 'Genera impresión diagnóstica del TC de tórax.' },
        { who: 'iris', text: 'TC de tórax normal. Sin consolidaciones ni derrame.' },
        { who: 'user', text: 'Exporta en PDF con firma.' },
        { who: 'iris', text: 'PDF generado: reporte_garcia_2026.pdf' },
      ].map((m, i) => (
        <div key={i} className={`rounded-xl px-3 py-2 text-[11px] leading-relaxed ${
          m.who === 'iris'
            ? 'bg-slate-100 text-slate-500'
            : 'ml-5 border border-[#5ed29c]/20 bg-[#5ed29c]/5 text-slate-700'
        }`}>{m.text}</div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   TELERADIOLOGY
═══════════════════════════════════════════════════════════════════════════════ */
function TeleradiologySection() {
  const steps = [
    { step: '01', title: 'Carga Segura', desc: 'La clínica local sube el estudio DICOM al sistema. Encriptación end-to-end, cumplimiento HIPAA/LGPD.', icon: '☁️' },
    { step: '02', title: 'Asignación Inteligente', desc: 'El sistema notifica a la red de especialistas según prioridad y modalidad del caso.', icon: '🧠' },
    { step: '03', title: 'Dictado e Impresión IA', desc: 'El especialista analiza la imagen, dicta por voz con IA y emite el informe firmado con QR.', icon: '✍️' },
  ];
  return (
    <section className="relative overflow-hidden py-28 px-4 sm:px-8">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5ed29c] opacity-[0.03] blur-[180px]" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#5ed29c]/30 bg-[#5ed29c]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: '#3ab87a' }}>
            🌐 Red Nacional de Diagnóstico
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Teleradiología:{' '}
            <span className="bg-gradient-to-r from-[#5ed29c] to-[#3ab87a] bg-clip-text text-transparent">diagnóstico remoto</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-500">
            Conecta tu clínica con radiólogos certificados en todo LatAm. Estudios leídos en menos de 2 horas con firma digital y trazabilidad completa.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map(s => (
            <div key={s.step} className="group relative rounded-2xl border border-slate-200 bg-white p-7 transition hover:border-[#5ed29c]/30 hover:shadow-[0_0_40px_-8px_rgba(94,210,156,0.2)]">
              <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#5ed29c]/15 text-xs font-bold" style={{ color: '#3ab87a' }}>
                {s.step}
              </div>
              <div className="mb-3 text-3xl">{s.icon}</div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">{s.title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/soluciones/teleradiologia"
            className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition hover:bg-[#5ed29c]/10"
            style={{ borderColor: 'rgba(94,210,156,0.4)', color: '#3ab87a' }}>
            Conocer la Red de Teleradiología <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   FEATURES GRID
═══════════════════════════════════════════════════════════════════════════════ */
function FeaturesSection() {
  return (
    <section className="relative py-24 px-4 sm:px-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Diseñado para{' '}
            <span className="bg-gradient-to-r from-[#5ed29c] to-[#3ab87a] bg-clip-text text-transparent">la práctica clínica real</span>
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(f => (
            <div key={f.title} className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-[#5ed29c]/30 hover:shadow-[0_0_36px_-8px_rgba(94,210,156,0.2)]">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 ring-1 ring-[#5ed29c]/20 transition group-hover:scale-110 group-hover:ring-[#5ed29c]/50"
                   style={{ color: '#3ab87a' }}>
                {f.icon}
              </div>
              <h3 className="mb-2 text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   STATS
═══════════════════════════════════════════════════════════════════════════════ */
function StatsSection() {
  return (
    <section className="relative py-20 px-4 sm:px-8">
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.label} className={`flex flex-col items-center justify-center bg-white py-10 ${i < STATS.length - 1 ? 'border-r border-slate-200' : ''}`}>
              <span className="mb-1 bg-gradient-to-r from-[#5ed29c] to-[#3ab87a] bg-clip-text text-4xl font-bold text-transparent tracking-tight">{s.value}</span>
              <span className="text-xs font-medium text-slate-400">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CTA + FOOTER
═══════════════════════════════════════════════════════════════════════════════ */
function CTASection() {
  return (
    <section
      className="relative overflow-hidden py-28 px-4 sm:px-8"
      style={{ background: '#070b0a' }}
    >
      {/* glow */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[180px]"
           style={{ background: 'rgba(94,210,156,0.06)' }} />
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* vertical lines */}
        {[25, 75].map(pct => (
          <div key={pct} aria-hidden className="pointer-events-none absolute inset-y-0 hidden w-px lg:block" style={{ left: `${pct}%`, background: 'rgba(255,255,255,0.06)' }} />
        ))}
        <h2
          className="mb-6 font-extrabold uppercase leading-none tracking-tight text-white"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(32px, 5vw, 60px)' }}
        >
          TU CLÍNICA, LISTA<br />
          DESDE HOY<span style={{ color: '#5ed29c' }}>.</span>
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Sin papeles, sin demoras. Únete a las clínicas de LatAm que ya digitalizaron su operación completa.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2.5 rounded-full px-10 py-4 text-base font-bold uppercase transition hover:brightness-110 hover:scale-[1.03]"
          style={{ background: '#5ed29c', color: '#070b0a', fontFamily: "'Inter', sans-serif" }}
        >
          Comenzar <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 px-4 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-slate-400">© {new Date().getFullYear()} MediCo LatAm · Plataforma clínica regional</p>
        <div className="flex items-center gap-3 text-slate-400">
          <BarChart3 className="h-4 w-4" style={{ color: 'rgba(94,210,156,0.4)' }} />
          <span className="text-sm">Enterprise Edition · v3.0</span>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900" style={{ fontFamily: "'Inter', Geist, system-ui, sans-serif" }}>
      <Navbar />
      <Hero />

      {/* ContainerScroll product showcase */}
      <div className="flex flex-col overflow-hidden bg-white">
        <ContainerScroll
          titleComponent={
            <h2 className="text-4xl font-semibold text-slate-900">
              Potencia tu clínica con <br />
              <span className="mt-1 block text-4xl font-bold leading-none md:text-[6rem]" style={{ color: '#5ed29c' }}>
                Gestión Inteligente
              </span>
            </h2>
          }
        >
          <video
            src="https://res.cloudinary.com/dwgcidtkp/video/upload/v1779383703/creame_un_radiologia_en_video_fbgndm.mp4"
            autoPlay muted loop playsInline
            className="h-full w-full rounded-xl object-cover"
            style={{ pointerEvents: 'none' }}
          />
        </ContainerScroll>
      </div>

      <ModernFeatures />
      <SpecialistsCarousel />
      <ProductTabs />
      <TeleradiologySection />
      <FeaturesSection />
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
