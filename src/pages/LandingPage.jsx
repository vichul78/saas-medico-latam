import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope, Brain, Monitor, Receipt, ChevronDown,
  ArrowRight, Sparkles, Zap, Mic, FileText, Download,
  CheckCircle2, BarChart3, Users, ShieldCheck, Globe,
  CalendarCheck, FileImage, Menu, X,
} from 'lucide-react';

/**
 * LandingPage — Diseño definitivo.
 *
 * REGLAS:
 * - Fondo: bg-black absoluto.
 * - Acentos: SOLO Púrpura Eléctrico (#7A22FF) y Violeta (#5B27B5). CERO verde.
 * - Navbar: liquid-glass fijo. Logo izq, dropdowns centro, "Iniciar Sesión" der.
 * - Hero: Título "El RIS/PACS en nube líder del mercado". Botón "Comenzar" → /login.
 * - Tabs: "Visor PACS", "Gestión y Cobros", "Copiloto IA".
 * - SIN botón "Demo". SIN tonos verdes. SIN avatares con vello facial.
 */


/* ── Soluciones dropdown data ── */
const SOLUCIONES = [
  { label: 'Radiología', href: '/soluciones/radiologia' },
  { label: 'Dental', href: '/soluciones/dental' },
  { label: 'Cirugía', href: '/soluciones/cirugia' },
  { label: 'Cardiología', href: '/soluciones/cardiologia' },
  { label: 'Neumología', href: '/soluciones/neumologia' },
  { label: 'Audiometría', href: '/soluciones/audiometria' },
  { label: 'Patología', href: '/soluciones/patologia' },
  { label: 'Obstétrico', href: '/soluciones/obstetrico' },
  { label: 'Colposcopia', href: '/soluciones/colposcopia' },
  { label: 'Oftalmología', href: '/soluciones/oftalmologia' },
  { label: 'Veterinaria', href: '/soluciones/veterinaria' },
];

const FUNCIONALIDADES = [
  { label: 'IA Asistente', href: '/funcionalidades/tecnologia/ia-asistente' },
  { label: 'Visor DICOM', href: '/funcionalidades/tecnologia/visor-dicom' },
  { label: 'Envío de resultados', href: '/funcionalidades/tecnologia/envio-resultados' },
  { label: 'Compatibilidad total', href: '/funcionalidades/tecnologia/compatibilidad-total' },
  { label: 'Almacenamiento seguro', href: '/funcionalidades/gestion/almacenamiento-seguro' },
  { label: 'Gestión de estudios', href: '/funcionalidades/gestion/estudios' },
  { label: 'Citas y agendas', href: '/funcionalidades/gestion/citas-agendas' },
  { label: 'Facturación y cobros', href: '/funcionalidades/gestion/facturacion-cobros' },
  { label: 'Portal pacientes', href: '/funcionalidades/facil-uso/portal-pacientes' },
  { label: 'Portal médicos', href: '/funcionalidades/facil-uso/portal-medicos' },
];


/* ── Product Tabs data ── */
const PRODUCT_TABS = [
  {
    id: 'pacs',
    label: 'Visor PACS',
    icon: <Monitor className="h-4 w-4" />,
    headline: 'Visor DICOM nativo en la nube',
    desc: 'Visualiza y analiza estudios CT, MRI, DX y US directamente en tu navegador. Sin plugins, sin instalaciones.',
    points: [
      'Soporte CT · MR · DX · CR · US · ECG',
      'Ajuste WW/WL con presets radiológicos',
      'Herramientas de medición y anotación',
      'Compatible con PACS y worklists RIS',
    ],
  },
  {
    id: 'billing',
    label: 'Gestión y Cobros',
    icon: <Receipt className="h-4 w-4" />,
    headline: 'Administración financiera multidivisa',
    desc: 'Emite facturas electrónicas en MXN, BRL, ARS, COP, CLP y 6 monedas más. Dashboard financiero con KPIs en tiempo real.',
    points: [
      'Facturación CFDI 4.0 (MX), NFS-e (BR)',
      '11 monedas LatAm soportadas',
      'Dashboard: ingresos, cobros, vencidas',
      'Citas y agendas integradas',
    ],
  },
  {
    id: 'ai',
    label: 'Copiloto IA',
    icon: <Brain className="h-4 w-4" />,
    headline: 'Iris — tu asistente clínico inteligente',
    desc: 'Dicta hallazgos por voz, genera impresiones diagnósticas estructuradas y exporta reportes PDF firmados.',
    points: [
      'Dictado de voz con SpeechRecognition nativo',
      'Generación de informes radiológicos',
      'Exportación PDF profesional (jsPDF)',
      'Diagnósticos diferenciales sugeridos',
    ],
  },
];


/* ── Features data ── */
const FEATURES = [
  { icon: <FileImage className="h-6 w-6" />, title: 'DICOM nativo', desc: 'CT · MR · DX · US. Sin plugins.' },
  { icon: <Brain className="h-6 w-6" />, title: 'Copiloto Iris', desc: 'IA clínica para informes y diagnósticos.' },
  { icon: <CalendarCheck className="h-6 w-6" />, title: 'Agenda inteligente', desc: 'Citas multi-recurso con recordatorios.' },
  { icon: <ShieldCheck className="h-6 w-6" />, title: 'HIPAA · LGPD', desc: 'Cumplimiento regulatorio regional.' },
  { icon: <Globe className="h-6 w-6" />, title: '11 monedas LatAm', desc: 'MXN · BRL · ARS · COP · CLP y más.' },
  { icon: <Stethoscope className="h-6 w-6" />, title: '11 especialidades', desc: 'Radiología, Dental, Cardio y más.' },
];

const STATS = [
  { value: '+500', label: 'Clínicas activas' },
  { value: '11', label: 'Monedas LatAm' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '<200ms', label: 'Latencia media' },
];


/* ══════════════════════════════════════════════
   DROPDOWN COMPONENT
══════════════════════════════════════════════ */
function NavDropdown({ label, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm
                   text-white/60 transition hover:text-white"
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-[220px]
                        rounded-xl border border-white/[0.08]
                        bg-black/90 backdrop-blur-2xl p-2
                        shadow-[0_16px_48px_-12px_rgba(0,0,0,0.9)]">
          {items.map(item => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-white/70
                         transition hover:bg-[#7A22FF]/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


/* ══════════════════════════════════════════════
   1. NAVBAR — liquid-glass, fijo superior
══════════════════════════════════════════════ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300
        ${scrolled
          ? 'bg-black/60 backdrop-blur-2xl shadow-[0_4px_32px_-8px_rgba(122,34,255,0.15)]'
          : 'bg-transparent backdrop-blur-sm'}`}
      style={{
        WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
        backdropFilter: 'blur(20px) saturate(1.6)',
      }}
    >
      {/* Línea eléctrica superior */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#7A22FF]/50 to-transparent" />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl
                          bg-gradient-to-br from-[#7A22FF] to-[#5B27B5]
                          shadow-[0_0_16px_-4px_rgba(122,34,255,0.8)]
                          transition group-hover:shadow-[0_0_28px_-2px_rgba(122,34,255,1)]">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            MediCo<span className="text-[#9450FF]"> LatAm</span>
          </span>
        </Link>

        {/* Centro: dropdowns */}
        <nav className="hidden items-center gap-1 md:flex">
          <NavDropdown label="Soluciones" items={SOLUCIONES} />
          <NavDropdown label="Funcionalidades" items={FUNCIONALIDADES} />
        </nav>

        {/* Derecha: SOLO "Iniciar Sesión" */}
        <div className="hidden md:flex">
          <Link to="/login"
            className="rounded-xl border border-[#7A22FF]/50 bg-[#7A22FF]/10
                       px-5 py-2.5 text-sm font-semibold text-white
                       shadow-[0_0_20px_-6px_rgba(122,34,255,0.5)]
                       transition hover:bg-[#7A22FF]/20 hover:shadow-[0_0_28px_-4px_rgba(122,34,255,0.7)]">
            Iniciar Sesión
          </Link>
        </div>

        {/* Hamburguesa móvil */}
        <button type="button" onClick={() => setMobileOpen(v => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg
                     border border-white/[0.08] text-white/70 md:hidden"
          aria-label="Menú">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>


      {/* Menú móvil */}
      <div className={`overflow-hidden transition-all duration-300 md:hidden
                       ${mobileOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="space-y-1 border-t border-white/[0.06] bg-black/95
                        px-4 pb-5 pt-3 backdrop-blur-xl">
          <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#9450FF]">Soluciones</p>
          {SOLUCIONES.slice(0, 5).map(s => (
            <Link key={s.href} to={s.href} onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-4 py-2 text-sm text-white/70 hover:text-white">{s.label}</Link>
          ))}
          <p className="mt-2 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#9450FF]">Funcionalidades</p>
          {FUNCIONALIDADES.slice(0, 5).map(f => (
            <Link key={f.href} to={f.href} onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-4 py-2 text-sm text-white/70 hover:text-white">{f.label}</Link>
          ))}
          <div className="my-2 h-px bg-white/[0.06]" />
          <Link to="/login" onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 rounded-xl
                       bg-gradient-to-r from-[#7A22FF] to-[#5B27B5]
                       px-4 py-3 text-sm font-semibold text-white">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </header>
  );
}


/* ══════════════════════════════════════════════
   2. HERO — título + botón Comenzar + mockup glass
══════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center
                        justify-center overflow-hidden px-4 pt-24 pb-12">
      {/* Destellos de fondo */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/4
                      h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2
                      rounded-full bg-[#7A22FF] opacity-[0.07] blur-[140px]" />
      <div aria-hidden className="pointer-events-none absolute left-1/4 bottom-1/3
                      h-[400px] w-[400px] rounded-full bg-[#5B27B5]
                      opacity-[0.06] blur-[120px]" />

      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full
                      border border-[#7A22FF]/40 bg-[#7A22FF]/10
                      px-4 py-1.5 text-xs font-semibold uppercase
                      tracking-[0.18em] text-[#CFA8FF]">
        <Sparkles className="h-3.5 w-3.5" />
        RIS/PACS en la nube para LatAm
      </div>

      {/* Título principal */}
      <h1 className="mb-6 max-w-4xl text-center text-5xl font-bold
                     leading-[1.06] tracking-tight text-white
                     sm:text-6xl lg:text-[72px]">
        El RIS/PACS en nube
        <br />
        <span className="bg-gradient-to-r from-[#7A22FF] via-[#9450FF] to-[#CFA8FF]
                         bg-clip-text text-transparent">
          líder del mercado.
        </span>
      </h1>

      {/* Subtítulo */}
      <p className="mb-10 max-w-2xl text-center text-lg leading-relaxed text-white/55">
        Gestiona estudios DICOM, pacientes y cobros multidivisa desde
        un solo sistema diseñado para clínicas de Latinoamérica.
      </p>

      {/* UN SOLO CTA: Comenzar → /login */}
      <div className="mb-16">
        <Link to="/login"
          className="inline-flex items-center gap-2 rounded-2xl
                     bg-gradient-to-r from-[#7A22FF] to-[#5B27B5]
                     px-10 py-4 text-base font-semibold text-white
                     shadow-[0_8px_40px_-8px_rgba(122,34,255,0.7)]
                     transition hover:brightness-110 hover:scale-[1.02]
                     active:scale-[0.97]">
          <Zap className="h-5 w-5" />
          Comenzar
        </Link>
      </div>

      {/* Mockup glass de la interfaz */}
      <BrowserMockup />
    </section>
  );
}


/* ── Mockup browser glassmorphism ── */
function BrowserMockup() {
  return (
    <div className="w-full max-w-6xl">
      <div className="rounded-2xl border border-white/[0.10]
                      bg-white/[0.03] backdrop-blur-xl
                      shadow-[0_32px_80px_-16px_rgba(0,0,0,0.8),0_0_0_1px_rgba(122,34,255,0.12)]
                      overflow-hidden">
        {/* Barra de título */}
        <div className="flex h-10 items-center gap-2.5 border-b border-white/[0.07]
                        bg-black/60 px-4">
          <div className="h-3 w-3 rounded-full bg-[#7A22FF]/60" />
          <div className="h-3 w-3 rounded-full bg-[#5B27B5]/60" />
          <div className="h-3 w-3 rounded-full bg-[#9450FF]/40" />
          <div className="mx-auto flex h-6 w-72 items-center gap-2 rounded-md
                          border border-white/[0.08] bg-white/[0.04] px-3">
            <div className="h-2 w-2 rounded-full bg-[#7A22FF]/60" />
            <span className="text-[11px] font-mono text-white/40">app.medicolatam.com/visor</span>
          </div>
        </div>

        {/* Contenido: 3 paneles simulados */}
        <div className="relative flex h-[420px] overflow-hidden sm:h-[500px]">
          {/* Panel izq: series */}
          <div className="hidden w-40 shrink-0 border-r border-white/[0.06] bg-black/40 p-3 sm:block">
            <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-[#7A22FF]">Series</p>
            {['TC Tórax Axial', 'TC Tórax Coronal', 'Rx Tórax PA'].map((s, i) => (
              <div key={s} className={`mb-1.5 rounded-lg p-2 text-[11px] text-white/60
                ${i === 0 ? 'border border-[#7A22FF]/40 bg-[#7A22FF]/15 text-white' : ''}`}>
                <div className="mb-1 h-14 w-full rounded bg-black/60" />
                <p className="truncate">{s}</p>
              </div>
            ))}
          </div>

          {/* Centro: viewport DICOM */}
          <div className="relative flex flex-1 items-center justify-center bg-black">
            <MockDicomViewport />
            <div className="pointer-events-none absolute left-3 top-3 font-mono text-[10px] text-white/40">
              <p>PACIENTE: Demo · García</p>
              <p>MODALIDAD: CT</p>
            </div>
            <div className="pointer-events-none absolute right-3 top-3 text-right font-mono text-[10px] text-white/40">
              <p>WW/WL: 400/40</p>
              <p>IMG: 24/48</p>
            </div>
          </div>


          {/* Panel der: Copiloto */}
          <div className="hidden w-56 shrink-0 border-l border-white/[0.06] bg-[#0a0018]/60 sm:flex sm:flex-col">
            <div className="flex items-center gap-2 bg-gradient-to-r from-[#7A22FF] to-[#5B27B5] px-3 py-2.5">
              <div className="h-6 w-6 rounded-full bg-white/20" />
              <p className="text-xs font-semibold text-white">Iris · IA</p>
              <div className="ml-auto h-2 w-2 animate-pulse rounded-full bg-[#CFA8FF]" />
            </div>
            <div className="flex-1 space-y-2 p-3">
              <div className="rounded-lg bg-white/[0.05] px-2.5 py-1.5 text-[10px] text-white/60">
                Analizando TC de tórax…
              </div>
              <div className="ml-3 rounded-lg border border-[#7A22FF]/30 bg-[#7A22FF]/10 px-2.5 py-1.5 text-[10px] text-white/70">
                Parénquima sin consolidaciones. CTR normal.
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Glow inferior */}
      <div aria-hidden className="pointer-events-none mx-auto mt-0 h-16 w-2/3
                      bg-[#7A22FF]/15 blur-2xl rounded-full -translate-y-4" />
    </div>
  );
}

/* ── SVG Viewport DICOM simulado ── */
function MockDicomViewport() {
  return (
    <svg viewBox="0 0 512 400" className="w-full max-h-full" aria-hidden>
      <rect width="512" height="400" fill="#000" />
      <ellipse cx="256" cy="200" rx="180" ry="145" fill="#111" />
      <ellipse cx="256" cy="200" rx="155" ry="125" fill="#1a1a1a" />
      <ellipse cx="195" cy="195" rx="65" ry="88" fill="#080808" />
      <ellipse cx="320" cy="195" rx="68" ry="88" fill="#080808" />
      <ellipse cx="256" cy="215" rx="44" ry="52" fill="#2d2d2d" />
      <line x1="256" y1="120" x2="256" y2="280" stroke="rgba(122,34,255,0.35)" strokeWidth="1" strokeDasharray="4 4" />
      <line x1="170" y1="200" x2="342" y2="200" stroke="rgba(122,34,255,0.35)" strokeWidth="1" strokeDasharray="4 4" />
    </svg>
  );
}


/* ══════════════════════════════════════════════
   3. PRODUCT TABS — 3 pestañas interactivas
══════════════════════════════════════════════ */
function ProductTabs() {
  const [active, setActive] = useState('pacs');
  const tab = PRODUCT_TABS.find(t => t.id === active);

  return (
    <section id="producto" className="relative py-24 px-4 sm:px-8">
      <div aria-hidden className="pointer-events-none absolute inset-0
                      bg-gradient-to-b from-black via-[#0a0018] to-black" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full
                        border border-[#7A22FF]/30 bg-[#7A22FF]/10
                        px-3 py-1 text-xs font-semibold uppercase
                        tracking-[0.16em] text-[#9450FF]">
            <Sparkles className="h-3 w-3" /> Plataforma modular
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Todo lo que tu clínica
            <span className="bg-gradient-to-r from-[#7A22FF] to-[#CFA8FF]
                             bg-clip-text text-transparent"> necesita</span>
          </h2>
        </div>

        {/* Tab selector */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {PRODUCT_TABS.map(t => (
            <button key={t.id} type="button" onClick={() => setActive(t.id)}
              className={`flex items-center gap-2 rounded-xl border px-5 py-2.5
                          text-sm font-semibold transition
                ${active === t.id
                  ? 'border-[#7A22FF]/60 bg-[#7A22FF]/20 text-white shadow-[0_0_20px_-6px_rgba(122,34,255,0.6)]'
                  : 'border-white/[0.08] bg-white/[0.03] text-white/50 hover:border-[#7A22FF]/30 hover:text-white/80'
                }`}>
              <span className={active === t.id ? 'text-[#CFA8FF]' : ''}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>


        {/* Tab content */}
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h3 className="mb-4 text-3xl font-bold text-white leading-tight">{tab.headline}</h3>
            <p className="mb-8 text-base leading-relaxed text-white/55">{tab.desc}</p>
            <ul className="space-y-3">
              {tab.points.map(pt => (
                <li key={pt} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#9450FF]" />
                  <span className="text-sm text-white/70">{pt}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link to="/login"
                className="inline-flex items-center gap-2 rounded-xl
                           bg-gradient-to-r from-[#7A22FF] to-[#5B27B5]
                           px-5 py-3 text-sm font-semibold text-white
                           shadow-[0_4px_20px_-6px_rgba(122,34,255,0.6)]
                           transition hover:brightness-110">
                Comenzar ahora <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Visual panel */}
          <div className="rounded-2xl border border-white/[0.08]
                          bg-gradient-to-br from-black to-[#0f0a20]
                          p-6 backdrop-blur-sm
                          shadow-[0_16px_40px_-8px_rgba(0,0,0,0.6)]
                          ring-1 ring-[#7A22FF]/10">
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
      <div className="flex items-center gap-2 mb-4">
        <Monitor className="h-5 w-5 text-[#7A22FF]" />
        <span className="text-sm font-semibold text-white">Visor DICOM</span>
        <span className="ml-auto rounded-full border border-[#7A22FF]/30 bg-[#7A22FF]/10
                         px-2 py-0.5 text-[10px] font-bold text-[#9450FF]">CT</span>
      </div>
      <div className="overflow-hidden rounded-xl bg-black"><MockDicomViewport /></div>
      <div className="flex gap-2">
        {['Pulmón','Hueso','Tejido','Cerebro'].map(p => (
          <div key={p} className="flex-1 rounded-lg border border-white/[0.08]
                       bg-white/[0.04] py-1.5 text-center text-[10px] font-medium text-white/50">{p}</div>
        ))}
      </div>
    </div>
  );

  if (tabId === 'billing') return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Receipt className="h-5 w-5 text-[#5B27B5]" />
        <span className="text-sm font-semibold text-white">Dashboard Financiero</span>
      </div>
      {[
        { label: 'Ingresos del mes', val: '$124,500 MXN', pct: 78, c: '#7A22FF' },
        { label: 'Cuentas por cobrar', val: '$38,200 MXN', pct: 45, c: '#5B27B5' },
        { label: 'Facturas emitidas', val: '142', pct: 90, c: '#9450FF' },
      ].map(r => (
        <div key={r.label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs text-white/50">{r.label}</p>
            <p className="text-sm font-bold text-white">{r.val}</p>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
            <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.c }} />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="h-5 w-5 text-[#9450FF]" />
        <span className="text-sm font-semibold text-white">Copiloto Iris</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full
                         border border-[#9450FF]/40 bg-[#9450FF]/10
                         px-2 py-0.5 text-[10px] font-semibold text-[#CFA8FF]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9450FF]" /> Online
        </span>
      </div>
      {[
        { who: 'iris', text: 'Listo para analizar estudios y dictar informes.' },
        { who: 'user', text: 'Genera impresión diagnóstica del TC de tórax.' },
        { who: 'iris', text: 'TC de tórax normal. Sin consolidaciones ni derrame pleural.' },
        { who: 'user', text: 'Exporta en PDF con firma.' },
        { who: 'iris', text: 'PDF generado: reporte_garcia_2026.pdf' },
      ].map((m, i) => (
        <div key={i} className={`rounded-xl px-3 py-2 text-[11px] leading-relaxed
          ${m.who === 'iris' ? 'bg-white/[0.06] text-white/70'
            : 'ml-6 border border-[#7A22FF]/30 bg-[#7A22FF]/10 text-white/80'}`}>
          {m.text}
        </div>
      ))}
    </div>
  );
}


/* ══════════════════════════════════════════════
   4. FEATURES — glassmorphism cards
══════════════════════════════════════════════ */
function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 px-4 sm:px-8">
      <div aria-hidden className="pointer-events-none absolute inset-0
                      bg-gradient-to-b from-black via-[#080012] to-black" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Diseñado para
            <span className="bg-gradient-to-r from-[#7A22FF] to-[#CFA8FF]
                             bg-clip-text text-transparent"> la práctica clínica real</span>
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(f => (
            <div key={f.title}
              className="group rounded-2xl border border-white/[0.07]
                         bg-white/[0.02] p-6 backdrop-blur-sm transition
                         hover:border-[#7A22FF]/30 hover:bg-[#7A22FF]/[0.04]
                         hover:shadow-[0_0_32px_-8px_rgba(122,34,255,0.25)]">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center
                              rounded-xl bg-white/[0.06] text-[#9450FF]
                              ring-1 ring-[#7A22FF]/20
                              transition group-hover:scale-110 group-hover:ring-[#7A22FF]/50">
                {f.icon}
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-white/50">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ══════════════════════════════════════════════
   5. STATS
══════════════════════════════════════════════ */
function StatsSection() {
  return (
    <section className="relative py-20 px-4 sm:px-8">
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-px overflow-hidden
                        rounded-2xl border border-white/[0.07] md:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.label}
              className={`flex flex-col items-center justify-center py-10
                          bg-white/[0.02] backdrop-blur-sm
                          ${i < STATS.length - 1 ? 'border-r border-white/[0.05]' : ''}`}>
              <span className="mb-1 bg-gradient-to-r from-[#7A22FF] to-[#CFA8FF]
                               bg-clip-text text-4xl font-bold text-transparent tracking-tight">
                {s.value}
              </span>
              <span className="text-xs font-medium text-white/45">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   6. CTA FINAL
══════════════════════════════════════════════ */
function CTASection() {
  return (
    <section className="relative overflow-hidden py-28 px-4 sm:px-8">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2
                      h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2
                      rounded-full bg-[#7A22FF] opacity-[0.08] blur-[160px]" />
      <div className="relative z-10 mx-auto max-w-4xl overflow-hidden rounded-3xl
                      border border-[#7A22FF]/25 bg-white/[0.02]
                      p-12 text-center backdrop-blur-sm
                      shadow-[0_0_80px_-20px_rgba(122,34,255,0.25)]">
        <h2 className="mb-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Tu clínica, potenciada
          <br />
          <span className="bg-gradient-to-r from-[#7A22FF] to-[#CFA8FF]
                           bg-clip-text text-transparent">
            con IA desde el primer día.
          </span>
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-lg text-white/50">
          Sin papeles, sin demoras. Únete a las clínicas de LatAm que
          ya digitalizaron su operación completa.
        </p>
        <Link to="/login"
          className="inline-flex items-center gap-2 rounded-2xl
                     bg-gradient-to-r from-[#7A22FF] to-[#5B27B5]
                     px-8 py-4 text-base font-semibold text-white
                     shadow-[0_8px_40px_-8px_rgba(122,34,255,0.75)]
                     transition hover:brightness-110 hover:scale-[1.02]">
          <ArrowRight className="h-5 w-5" /> Comenzar
        </Link>
      </div>
    </section>
  );
}


/* ══════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-8 px-4 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center
                      justify-between gap-4 sm:flex-row">
        <p className="text-sm text-white/30">
          © {new Date().getFullYear()} MediCo LatAm · Plataforma clínica regional
        </p>
        <div className="flex items-center gap-3 text-white/30">
          <BarChart3 className="h-4 w-4 text-[#7A22FF]/50" />
          <span className="text-sm">Enterprise Edition · v3.0</span>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════
   EXPORT — COMPONENTE PRINCIPAL
══════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-black text-white"
         style={{ fontFamily: 'Geist, Inter, system-ui, sans-serif' }}>
      <Navbar />
      <Hero />
      <ProductTabs />
      <FeaturesSection />
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
