import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope, Brain, FileImage, CalendarCheck,
  ShieldCheck, Globe, ArrowRight, Play, Sparkles,
  Zap, Users, BarChart3, ChevronRight,
  Heart, Wind, Activity, Receipt, UserCircle, Monitor,
  Mic, FileText, Download, Star, CheckCircle2,
  LayoutDashboard, Menu, X,
} from 'lucide-react';

/**
 * LandingPage — Rediseño "SaaS Enterprise".
 *
 * Estructura:
 *   1. Navbar limpio (logo izq + Iniciar Sesión der)
 *   2. Hero centrado: título + 2 CTAs + mockup browser del visor
 *   3. Product Tabs: Visor PACS | Gestión y Cobros | Copiloto IA
 *   4. Sección IA destacada (dictado + PDF)
 *   5. Feature cards glassmorphism
 *   6. Stats / Social proof
 *   7. CTA final + Footer
 *
 * Paleta: fondo #0a0a12. Acentos eléctrico #7A22FF / violeta #5B27B5.
 * CERO verde en ningún token.
 */


/* ── Datos de los tabs de producto ── */
const PRODUCT_TABS = [
  {
    id: 'pacs',
    label: 'Visor PACS',
    icon: <Monitor className="h-4 w-4" />,
    headline: 'Visor DICOM nativo en la nube',
    desc: 'Visualiza y analiza estudios CT, MRI, DX y US directamente en tu navegador. Sin plugins, sin instalaciones. WW/WL, mediciones y multiplanar en un solo clic.',
    points: [
      'Soporte CT · MR · DX · CR · US · ECG',
      'Ajuste WW/WL con presets radiológicos',
      'Herramientas de medición y anotación',
      'Compatible con PACS y worklists RIS',
    ],
    mockBg: 'from-[#0a0a12] to-[#12082a]',
    accent: '#7A22FF',
  },
  {
    id: 'billing',
    label: 'Gestión y Cobros',
    icon: <Receipt className="h-4 w-4" />,
    headline: 'Administración financiera multidivisa',
    desc: 'Emite facturas electrónicas en MXN, BRL, ARS, COP, CLP y 6 monedas más. Dashboard financiero con KPIs en tiempo real y cuentas por cobrar.',
    points: [
      'Facturación CFDI 4.0 (MX), NFS-e (BR)',
      '11 monedas LatAm soportadas',
      'Dashboard: ingresos, cobros, vencidas',
      'Citas y agendas integradas',
    ],
    mockBg: 'from-[#0a0a12] to-[#1a0a2a]',
    accent: '#5B27B5',
  },
  {
    id: 'ai',
    label: 'Copiloto IA',
    icon: <Brain className="h-4 w-4" />,
    headline: 'Iris — tu asistente clínico inteligente',
    desc: 'Dicta hallazgos por voz, genera impresiones diagnósticas estructuradas y exporta reportes PDF firmados. Todo integrado en el panel derecho de tu visor.',
    points: [
      'Dictado de voz con SpeechRecognition nativo',
      'Generación de informes radiológicos',
      'Exportación PDF profesional (jsPDF)',
      'Diagnósticos diferenciales sugeridos',
    ],
    mockBg: 'from-[#0a0a12] to-[#0f0a20]',
    accent: '#9450FF',
  },
];

/* ── Feature cards ── */
const FEATURES = [
  {
    icon: <FileImage className="h-6 w-6" />,
    title: 'DICOM nativo',
    desc: 'CT · MR · DX · US. Sin plugins, sin instalaciones.',
    glow: 'rgba(122,34,255,0.25)',
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: 'Copiloto Iris',
    desc: 'IA clínica para informes, diagnósticos y recetas.',
    glow: 'rgba(91,39,181,0.25)',
  },
  {
    icon: <CalendarCheck className="h-6 w-6" />,
    title: 'Agenda inteligente',
    desc: 'Citas multi-recurso con recordatorios automáticos.',
    glow: 'rgba(122,34,255,0.25)',
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'HIPAA · LGPD',
    desc: 'Cumplimiento regulatorio. Datos en la región.',
    glow: 'rgba(91,39,181,0.25)',
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: '11 monedas LatAm',
    desc: 'MXN · BRL · ARS · COP · CLP y más.',
    glow: 'rgba(122,34,255,0.25)',
  },
  {
    icon: <Stethoscope className="h-6 w-6" />,
    title: '11 especialidades',
    desc: 'Radiología, Dental, Cardio, Neumología y más.',
    glow: 'rgba(91,39,181,0.25)',
  },
];

/* ── Stats ── */
const STATS = [
  { value: '+500',  label: 'Clínicas activas' },
  { value: '11',    label: 'Monedas LatAm'    },
  { value: '99.9%', label: 'Uptime SLA'       },
  { value: '<200ms',label: 'Latencia media'   },
];


/* ══════════════════════════════════════════════
   1. NAVBAR
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
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300
      ${scrolled ? 'bg-[#0a0a12]/90 backdrop-blur-xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.7)]'
                 : 'bg-transparent'}`}>
      {/* Línea eléctrica superior */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#7A22FF]/60 to-transparent" />

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

        {/* Nav links desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          {[
            { label: 'Visor PACS',    href: '#producto'      },
            { label: 'Copiloto IA',   href: '#ia'            },
            { label: 'Características', href: '#features'    },
            { label: 'Nosotros',      href: '/nosotros'      },
          ].map(({ label, href }) => (
            href.startsWith('/') ? (
              <Link key={label} to={href}
                className="rounded-lg px-3 py-2 text-sm text-white/60
                           transition hover:text-white">
                {label}
              </Link>
            ) : (
              <a key={label} href={href}
                className="rounded-lg px-3 py-2 text-sm text-white/60
                           transition hover:text-white">
                {label}
              </a>
            )
          ))}
        </nav>

        {/* CTAs desktop */}
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-white/70
                       transition hover:text-white">
            Iniciar Sesión
          </Link>
          <Link to="/contratar"
            className="inline-flex items-center gap-1.5 rounded-xl
                       bg-gradient-to-r from-[#7A22FF] to-[#5B27B5]
                       px-4 py-2.5 text-sm font-semibold text-white
                       shadow-[0_4px_20px_-6px_rgba(122,34,255,0.65)]
                       transition hover:brightness-110">
            Comenzar <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Hamburguesa */}
        <button type="button" onClick={() => setMobileOpen(v => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg
                     border border-white/[0.08] text-white/70 transition
                     hover:border-[#7A22FF]/50 hover:text-white md:hidden"
          aria-label="Menú">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Menú móvil */}
      <div className={`overflow-hidden transition-all duration-300 md:hidden
                       ${mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="space-y-1 border-t border-white/[0.06] bg-[#0a0a12]/95
                        px-4 pb-5 pt-3 backdrop-blur-xl">
          {['Visor PACS','Copiloto IA','Características'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(' ','-')}`}
               onClick={() => setMobileOpen(false)}
               className="block rounded-xl px-4 py-2.5 text-sm text-white/70
                          transition hover:bg-white/[0.05] hover:text-white">
              {l}
            </a>
          ))}
          <div className="my-2 h-px bg-white/[0.06]" />
          <Link to="/login" onClick={() => setMobileOpen(false)}
            className="block rounded-xl px-4 py-2.5 text-sm text-white/70">
            Iniciar Sesión
          </Link>
          <Link to="/contratar" onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 rounded-xl
                       bg-gradient-to-r from-[#7A22FF] to-[#5B27B5]
                       px-4 py-3 text-sm font-semibold text-white">
            <Zap className="h-4 w-4" /> Comenzar
          </Link>
        </div>
      </div>
    </header>
  );
}


/* ══════════════════════════════════════════════
   2. HERO — título centrado + mockup browser
══════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center
                        justify-center overflow-hidden px-4 pt-24 pb-12">
      {/* Destellos de fondo */}
      <div aria-hidden
           className="pointer-events-none absolute left-1/2 top-1/4
                      h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2
                      rounded-full bg-[#7A22FF] opacity-[0.08] blur-[140px]" />
      <div aria-hidden
           className="pointer-events-none absolute left-1/4 bottom-1/3
                      h-[400px] w-[400px] rounded-full bg-[#5B27B5]
                      opacity-[0.07] blur-[120px]" />

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
        un solo sistema diseñado para clínicas y hospitales de Latinoamérica.
      </p>

      {/* CTAs */}
      <div className="mb-16 flex flex-wrap items-center justify-center gap-4">
        <Link to="/contratar"
          className="inline-flex items-center gap-2 rounded-2xl
                     bg-gradient-to-r from-[#7A22FF] to-[#5B27B5]
                     px-8 py-4 text-base font-semibold text-white
                     shadow-[0_8px_40px_-8px_rgba(122,34,255,0.7)]
                     transition hover:brightness-110 hover:scale-[1.02]
                     active:scale-[0.97]">
          <Zap className="h-5 w-5" />
          Comenzar gratis
        </Link>
        <Link to="/funcionalidades/tecnologia/visor-dicom"
          className="inline-flex items-center gap-2 rounded-2xl
                     border border-white/[0.12] bg-white/[0.04]
                     px-8 py-4 text-base font-semibold text-white
                     backdrop-blur-sm transition
                     hover:bg-white/[0.08] hover:border-[#7A22FF]/50">
          <Play className="h-5 w-5 fill-current" />
          Ver demo interactiva
        </Link>
      </div>

      {/* ── Mockup "ventana de navegador" ── */}
      <BrowserMockup />
    </section>
  );
}

/* Mockup visual del visor + dashboard enmarcado como ventana de navegador */
function BrowserMockup() {
  return (
    <div className="w-full max-w-6xl">
      {/* Marco del navegador */}
      <div className="rounded-2xl border border-white/[0.10]
                      bg-[#0d0d1a]/80 backdrop-blur-xl
                      shadow-[0_32px_80px_-16px_rgba(0,0,0,0.8),0_0_0_1px_rgba(122,34,255,0.15)]
                      overflow-hidden">

        {/* Barra de título del navegador */}
        <div className="flex h-10 items-center gap-2.5 border-b border-white/[0.07]
                        bg-[#0a0a12]/80 px-4">
          {/* Dots */}
          <div className="h-3 w-3 rounded-full bg-[#7A22FF]/60" />
          <div className="h-3 w-3 rounded-full bg-[#5B27B5]/60" />
          <div className="h-3 w-3 rounded-full bg-[#9450FF]/40" />
          {/* URL bar */}
          <div className="mx-auto flex h-6 w-72 items-center gap-2 rounded-md
                          border border-white/[0.08] bg-white/[0.04] px-3">
            <div className="h-2 w-2 rounded-full bg-[#7A22FF]/60" aria-hidden />
            <span className="text-[11px] font-mono text-white/40">
              app.medicolatam.com/visor
            </span>
          </div>
        </div>

        {/* Contenido del mockup */}
        <div className="relative flex h-[480px] overflow-hidden sm:h-[560px]">

          {/* Panel izquierdo: sidebar de series */}
          <div className="hidden w-44 shrink-0 border-r border-white/[0.06]
                          bg-[#0a0a12]/90 p-3 sm:block">
            <p className="mb-2 px-1 text-[10px] font-semibold uppercase
                          tracking-widest text-[#7A22FF]">Series</p>
            {['TC Tórax Axial','TC Tórax Coronal','TC Tórax Sag.','Rx Tórax PA'].map((s, i) => (
              <div key={s}
                className={`mb-1 rounded-xl p-2 text-[11px] text-white/60
                  ${i === 0
                    ? 'border border-[#7A22FF]/40 bg-[#7A22FF]/15 text-white'
                    : 'hover:bg-white/[0.04]'}`}>
                <div className="mb-1 h-16 w-full rounded-lg bg-black/60
                                flex items-center justify-center">
                  <MockCTThumb idx={i} />
                </div>
                <p className="truncate">{s}</p>
                <p className="text-[10px] text-white/30">
                  {[48,32,28,1][i]} imgs
                </p>
              </div>
            ))}
          </div>

          {/* Viewport DICOM central */}
          <div className="relative flex flex-1 items-center justify-center bg-black">
            <MockDicomViewport />
            {/* Overlays DICOM */}
            <div className="pointer-events-none absolute left-3 top-3 space-y-0.5 font-mono text-[10px] text-white/50">
              <p>PACIENTE: Demo · García</p>
              <p>MODALIDAD: CT</p>
              <p>FECHA: {new Date().toLocaleDateString('es')}</p>
            </div>
            <div className="pointer-events-none absolute right-3 top-3 space-y-0.5 text-right font-mono text-[10px] text-white/50">
              <p>WW/WL: 400/40</p>
              <p>ZOOM: 100%</p>
              <p>IMG: 24/48</p>
            </div>
            {/* Toolbar inferior */}
            <div className="pointer-events-none absolute bottom-3 left-1/2
                            flex -translate-x-1/2 gap-2">
              {['Mover','Zoom','Contrast','Medir'].map(t => (
                <div key={t}
                  className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-medium
                    ${t === 'Zoom'
                      ? 'border-[#7A22FF]/60 bg-[#7A22FF]/20 text-[#CFA8FF]'
                      : 'border-white/[0.10] bg-white/[0.04] text-white/50'}`}>
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Panel derecho: Copiloto Iris */}
          <div className="hidden w-60 shrink-0 border-l border-white/[0.06]
                          bg-[#0f0a1e]/90 sm:flex sm:flex-col">
            {/* Header copiloto */}
            <div className="flex items-center gap-2.5 bg-gradient-to-r
                            from-[#7A22FF] to-[#5B27B5] px-3 py-3">
              <IrisAvatarMini />
              <div>
                <p className="text-xs font-semibold text-white">Iris · IA Radiol.</p>
                <p className="text-[9px] uppercase tracking-widest text-white/60">
                  Copiloto clínico
                </p>
              </div>
              <div className="ml-auto h-2 w-2 animate-pulse rounded-full bg-[#CFA8FF]" />
            </div>
            {/* Mensajes */}
            <div className="flex-1 space-y-2 overflow-hidden px-3 py-3">
              <div className="rounded-xl bg-white/[0.06] px-3 py-2 text-[10px]
                              leading-relaxed text-white/70">
                Analizando estudio CT de tórax…
              </div>
              <div className="ml-4 rounded-xl border border-[#7A22FF]/30
                              bg-[#7A22FF]/10 px-3 py-2 text-[10px]
                              leading-relaxed text-white/80">
                Parénquima pulmonar sin consolidaciones. CTR dentro de límites normales.
              </div>
              <div className="rounded-xl bg-white/[0.06] px-3 py-2 text-[10px] text-white/60">
                ¿Genero el informe estructurado?
              </div>
            </div>
            {/* Input */}
            <div className="border-t border-white/[0.06] p-2">
              <div className="flex items-center gap-1.5 rounded-xl
                              border border-white/[0.08] bg-white/[0.04] px-2.5 py-2">
                <Mic className="h-3.5 w-3.5 text-[#9450FF]" />
                <span className="flex-1 text-[10px] text-white/30">Dictar…</span>
                <div className="h-5 w-5 rounded-lg bg-[#7A22FF]/60 flex items-center
                                justify-center">
                  <ArrowRight className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Glow inferior del mockup */}
      <div aria-hidden
           className="pointer-events-none mx-auto mt-0 h-16 w-2/3
                      bg-[#7A22FF]/20 blur-2xl rounded-full -translate-y-4" />
    </div>
  );
}

/* ── SVGs del mockup ── */
function MockCTThumb({ idx }) {
  const opacities = [0.9, 0.7, 0.6, 0.5];
  return (
    <svg viewBox="0 0 64 48" width="48" height="36" aria-hidden>
      <rect width="64" height="48" fill="#000" />
      <ellipse cx="32" cy="24" rx="24" ry="18" fill={`rgba(30,20,50,${opacities[idx]})`} />
      <ellipse cx="22" cy="22" rx="9" ry="12" fill={`rgba(8,8,8,${opacities[idx]})`} />
      <ellipse cx="42" cy="22" rx="9" ry="12" fill={`rgba(8,8,8,${opacities[idx]})`} />
      <ellipse cx="32" cy="28" rx="6" ry="8" fill="rgba(50,50,50,0.9)" />
      <ellipse cx="32" cy="34" rx="3" ry="2.5" fill="rgba(120,120,120,0.8)" />
    </svg>
  );
}

function MockDicomViewport() {
  return (
    <svg viewBox="0 0 512 400" width="100%" className="max-h-full" aria-hidden>
      <rect width="512" height="400" fill="#000" />
      <ellipse cx="256" cy="200" rx="180" ry="145" fill="#111" />
      <ellipse cx="256" cy="200" rx="155" ry="125" fill="#1a1a1a" />
      <ellipse cx="195" cy="195" rx="65" ry="88" fill="#080808" />
      <ellipse cx="320" cy="195" rx="68" ry="88" fill="#080808" />
      <ellipse cx="256" cy="215" rx="44" ry="52" fill="#2d2d2d" />
      <ellipse cx="240" cy="250" rx="13" ry="11" fill="#444" />
      <ellipse cx="272" cy="254" rx="10" ry="8" fill="#3a3a3a" />
      <ellipse cx="256" cy="268" rx="22" ry="15" fill="#555" />
      <ellipse cx="256" cy="268" rx="10" ry="6" fill="#888" />
      {[0,1,2,3,4].map(i=>(
        <path key={`l${i}`}
          d={`M${128+i*4} ${155+i*20} Q${80+i*2} ${188+i*20} ${128+i*4} ${220+i*20}`}
          fill="none" stroke="#444" strokeWidth="3.5" strokeLinecap="round" />
      ))}
      {[0,1,2,3,4].map(i=>(
        <path key={`r${i}`}
          d={`M${384-i*4} ${155+i*20} Q${432-i*2} ${188+i*20} ${384-i*4} ${220+i*20}`}
          fill="none" stroke="#444" strokeWidth="3.5" strokeLinecap="round" />
      ))}
      <rect x="486" y="20" width="10" height="160" rx="2"
            fill="url(#gsBar)" opacity="0.6" />
      <defs>
        <linearGradient id="gsBar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#000" />
          <stop offset="100%" stopColor="#fff" />
        </linearGradient>
      </defs>
      {/* Crosshair */}
      <line x1="256" y1="120" x2="256" y2="280" stroke="rgba(122,34,255,0.4)" strokeWidth="1" strokeDasharray="4 4" />
      <line x1="170" y1="200" x2="342" y2="200" stroke="rgba(122,34,255,0.4)" strokeWidth="1" strokeDasharray="4 4" />
    </svg>
  );
}

function IrisAvatarMini() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center
                     rounded-full bg-white/10 ring-1 ring-[#7A22FF]/40">
      <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden>
        <circle cx="16" cy="16" r="16" fill="rgba(122,34,255,0.2)" />
        <path d="M5 30 C7 23 11 20 16 20 C21 20 25 23 27 30 Z"
              fill="rgba(255,255,255,0.08)" />
        <circle cx="16" cy="13" r="6" fill="#E8E0F0" />
        <path d="M10.5 11 C11 7 13 6 16 6 C19 6 21 7 21.5 11
                 L20 12 C19 9 17.5 8 16 8 C14.5 8 13 9 12 12 Z"
              fill="#1C1C29" />
        <circle cx="13.5" cy="13" r="1" fill="#1C1C29" />
        <circle cx="18.5" cy="13" r="1" fill="#1C1C29" />
        <path d="M14 16.5 Q16 17.8 18 16.5" fill="none"
              stroke="#9972DC" strokeWidth="0.9" strokeLinecap="round" />
        <rect x="5" y="12" width="4" height="3" rx="0.8"
              fill="rgba(122,34,255,0.7)" />
        <circle cx="7" cy="13.5" r="0.8" fill="#CFA8FF" />
      </svg>
    </span>
  );
}


/* ══════════════════════════════════════════════
   3. PRODUCT TABS
══════════════════════════════════════════════ */
function ProductTabs() {
  const [active, setActive] = useState('pacs');
  const tab = PRODUCT_TABS.find(t => t.id === active);

  return (
    <section id="producto" className="relative py-24 px-4 sm:px-8">
      <div aria-hidden
           className="pointer-events-none absolute inset-0
                      bg-gradient-to-b from-[#0a0a12] via-[#0f0a1e] to-[#0a0a12]" />
      <div className="relative z-10 mx-auto max-w-6xl">

        {/* Cabecera */}
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

        {/* Selector de tabs */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {PRODUCT_TABS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={`flex items-center gap-2 rounded-xl border px-5 py-2.5
                          text-sm font-semibold transition
                          ${active === t.id
                            ? 'border-[#7A22FF]/60 bg-[#7A22FF]/20 text-white shadow-[0_0_20px_-6px_rgba(122,34,255,0.6)]'
                            : 'border-white/[0.08] bg-white/[0.03] text-white/50 hover:border-[#7A22FF]/30 hover:text-white/80'
                          }`}
            >
              <span className={active === t.id ? 'text-[#CFA8FF]' : ''}>
                {t.icon}
              </span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenido del tab activo */}
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          {/* Texto */}
          <div>
            <h3 className="mb-4 text-3xl font-bold text-white leading-tight">
              {tab.headline}
            </h3>
            <p className="mb-8 text-base leading-relaxed text-white/55">
              {tab.desc}
            </p>
            <ul className="space-y-3">
              {tab.points.map(pt => (
                <li key={pt} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#9450FF]" />
                  <span className="text-sm text-white/70">{pt}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contratar"
                className="inline-flex items-center gap-2 rounded-xl
                           bg-gradient-to-r from-[#7A22FF] to-[#5B27B5]
                           px-5 py-3 text-sm font-semibold text-white
                           shadow-[0_4px_20px_-6px_rgba(122,34,255,0.6)]
                           transition hover:brightness-110">
                Comenzar ahora <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Panel visual del tab */}
          <div className={`rounded-2xl border border-white/[0.08]
                           bg-gradient-to-br ${tab.mockBg}
                           p-6 backdrop-blur-sm
                           shadow-[0_16px_40px_-8px_rgba(0,0,0,0.6)]
                           ring-1 ring-[#7A22FF]/10`}>
            <TabMockPanel tabId={active} accent={tab.accent} />
          </div>
        </div>
      </div>
    </section>
  );
}

function TabMockPanel({ tabId, accent }) {
  if (tabId === 'pacs') return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Monitor className="h-5 w-5" style={{ color: accent }} />
        <span className="text-sm font-semibold text-white">Visor DICOM</span>
        <span className="ml-auto rounded-full border border-[#7A22FF]/30
                         bg-[#7A22FF]/10 px-2 py-0.5 text-[10px]
                         font-bold text-[#9450FF]">CT</span>
      </div>
      <div className="overflow-hidden rounded-xl bg-black">
        <MockDicomViewport />
      </div>
      <div className="flex gap-2">
        {['Pulmón','Hueso','Tejido','Cerebro'].map(p => (
          <div key={p}
            className="flex-1 rounded-lg border border-white/[0.08]
                       bg-white/[0.04] py-1.5 text-center text-[10px]
                       font-medium text-white/50">
            {p}
          </div>
        ))}
      </div>
    </div>
  );

  if (tabId === 'billing') return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <LayoutDashboard className="h-5 w-5" style={{ color: accent }} />
        <span className="text-sm font-semibold text-white">Dashboard Financiero</span>
      </div>
      {[
        { label: 'Ingresos del mes',   val: '$124,500 MXN', pct: 78, c: '#7A22FF' },
        { label: 'Cuentas por cobrar', val: '$38,200 MXN',  pct: 45, c: '#5B27B5' },
        { label: 'Facturas emitidas',  val: '142',          pct: 90, c: '#9450FF' },
      ].map(r => (
        <div key={r.label}
             className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs text-white/50">{r.label}</p>
            <p className="text-sm font-bold text-white">{r.val}</p>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
            <div className="h-full rounded-full transition-all duration-500"
                 style={{ width: `${r.pct}%`, background: r.c }} />
          </div>
        </div>
      ))}
    </div>
  );

  /* ai tab */
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="h-5 w-5" style={{ color: accent }} />
        <span className="text-sm font-semibold text-white">Copiloto Iris</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full
                         border border-[#9450FF]/40 bg-[#9450FF]/10
                         px-2 py-0.5 text-[10px] font-semibold text-[#CFA8FF]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9450FF]" />
          Online
        </span>
      </div>
      {[
        { who: 'iris',   text: 'Listo para analizar estudios y dictar informes.' },
        { who: 'user',   text: 'Genera impresión diagnóstica del TC de tórax.' },
        { who: 'iris',   text: 'TC de tórax dentro de parámetros normales. Sin consolidaciones ni derrame pleural.' },
        { who: 'user',   text: 'Exporta en PDF con firma.' },
        { who: 'iris',   text: 'PDF generado: reporte_garcia_2026-05-20.pdf ↓' },
      ].map((m, i) => (
        <div key={i}
          className={`rounded-xl px-3 py-2 text-[11px] leading-relaxed
            ${m.who === 'iris'
              ? 'bg-white/[0.06] text-white/70'
              : 'ml-6 border border-[#7A22FF]/30 bg-[#7A22FF]/10 text-white/80'}`}>
          {m.text}
        </div>
      ))}
    </div>
  );
}


/* ══════════════════════════════════════════════
   4. SECCIÓN IA DESTACADA
══════════════════════════════════════════════ */
function AISection() {
  return (
    <section id="ia" className="relative overflow-hidden py-24 px-4 sm:px-8">
      {/* Glow central */}
      <div aria-hidden
           className="pointer-events-none absolute left-1/2 top-1/2
                      h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2
                      rounded-full bg-[#5B27B5] opacity-[0.09] blur-[160px]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

          {/* Texto */}
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full
                          border border-[#7A22FF]/30 bg-[#7A22FF]/10
                          px-3 py-1 text-xs font-semibold uppercase
                          tracking-[0.16em] text-[#9450FF]">
              <Brain className="h-3 w-3" /> Inteligencia Artificial Clínica
            </p>
            <h2 className="mb-6 text-4xl font-bold leading-tight tracking-tight
                           text-white sm:text-5xl">
              Iris: tu copiloto
              <br />
              <span className="bg-gradient-to-r from-[#7A22FF] to-[#CFA8FF]
                               bg-clip-text text-transparent">
                radiológico con IA
              </span>
            </h2>
            <p className="mb-8 text-base leading-relaxed text-white/55">
              Dicta tus hallazgos por voz mientras revisas el estudio.
              Iris los convierte en un informe estructurado y exporta
              el reporte a PDF con tu firma digital — sin tocar el teclado.
            </p>

            {/* Feature pills */}
            <div className="space-y-4">
              {[
                {
                  icon: <Mic className="h-5 w-5" />,
                  title: 'Dictado por voz',
                  desc: 'Usa SpeechRecognition nativo del navegador. Sin plugins, transcripción en tiempo real.',
                },
                {
                  icon: <FileText className="h-5 w-5" />,
                  title: 'Impresión diagnóstica estructurada',
                  desc: 'Genera informes con secciones: Técnica, Hallazgos, Impresión, Recomendación.',
                },
                {
                  icon: <Download className="h-5 w-5" />,
                  title: 'Exportación a PDF profesional',
                  desc: 'PDF A4 con encabezado, tabla de paciente, firma y badges HIPAA/LGPD.',
                },
              ].map(f => (
                <div key={f.title}
                     className="flex items-start gap-4 rounded-2xl
                                border border-white/[0.07] bg-white/[0.03]
                                p-4 backdrop-blur-sm
                                transition hover:border-[#7A22FF]/30
                                hover:bg-[#7A22FF]/[0.04]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center
                                  rounded-xl bg-[#7A22FF]/15 text-[#9450FF]">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.title}</p>
                    <p className="mt-0.5 text-xs text-white/50">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel visual IA */}
          <div className="rounded-2xl border border-[#7A22FF]/20
                          bg-[#0f0a1e]/70 backdrop-blur-xl p-5
                          shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7)]">

            {/* Header */}
            <div className="mb-4 flex items-center gap-3 rounded-xl
                            bg-gradient-to-r from-[#7A22FF] to-[#5B27B5] p-3">
              <IrisAvatarMini />
              <div>
                <p className="text-sm font-semibold text-white">Iris · Copiloto IA</p>
                <p className="text-[10px] uppercase tracking-widest text-white/60">
                  Asistente clínico
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 rounded-full
                              border border-white/10 bg-white/10
                              px-2 py-0.5 text-[10px] font-semibold text-white/80">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#CFA8FF]" />
                Online
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="mb-3 flex flex-wrap gap-1.5">
              {['Impresión diagnóstica','Generar informe','Calcular CTR'].map(a => (
                <span key={a}
                      className="rounded-full border border-[#7A22FF]/30
                                 bg-[#7A22FF]/10 px-2.5 py-1 text-[10px]
                                 font-medium text-[#CFA8FF]">
                  {a}
                </span>
              ))}
            </div>

            {/* Chat simulado */}
            <div className="space-y-2 rounded-xl bg-black/30 p-3">
              {[
                { r: 'ai',   t: 'Listo. Analizando TC de tórax…' },
                { r: 'user', t: 'Genera impresión diagnóstica.' },
                { r: 'ai',   t: 'INFORME RADIOLÓGICO\n\nHALLAZGOS:\n• Parénquima pulmonar sin consolidaciones.\n• CTR < 0.50, normal.\n• Sin derrame pleural.\n\nIMPRESIÓN: Estudio dentro de parámetros normales.' },
              ].map((m, i) => (
                <div key={i}
                     className={`rounded-xl px-3 py-2 text-[11px] leading-relaxed
                       whitespace-pre-line
                       ${m.r === 'ai'
                         ? 'bg-white/[0.06] text-white/75'
                         : 'ml-4 border border-[#7A22FF]/30 bg-[#7A22FF]/10 text-white/85'}`}>
                  {m.t}
                </div>
              ))}
            </div>

            {/* Barra de dictado */}
            <div className="mt-3 flex items-center gap-2 rounded-xl
                            border border-white/[0.08] bg-white/[0.04] px-3 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg
                              bg-gradient-to-br from-[#7A22FF] to-[#5B27B5]">
                <Mic className="h-4 w-4 text-white" />
              </div>
              <span className="flex-1 text-xs text-white/40">
                Pulsa para dictar hallazgos…
              </span>
              <span className="rounded-full border border-[#9450FF]/40
                               bg-[#9450FF]/10 px-2 py-0.5 text-[10px]
                               font-semibold text-[#CFA8FF]">
                es-MX
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


/* ══════════════════════════════════════════════
   5. FEATURE CARDS — glassmorphism
══════════════════════════════════════════════ */
function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 px-4 sm:px-8">
      <div aria-hidden
           className="pointer-events-none absolute inset-0
                      bg-gradient-to-b from-[#0a0a12] via-[#0f0a20] to-[#0a0a12]" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Diseñado para
            <span className="bg-gradient-to-r from-[#7A22FF] to-[#CFA8FF]
                             bg-clip-text text-transparent"> la práctica clínica real</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/50">
            Todo lo que una clínica moderna necesita, sin comprometer
            la seguridad ni la experiencia del médico.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(f => (
            <div key={f.title}
                 className="group rounded-2xl border border-white/[0.07]
                            bg-white/[0.03] p-6 backdrop-blur-sm transition
                            hover:border-[#7A22FF]/30 hover:bg-[#7A22FF]/[0.04]"
                 style={{ boxShadow: `0 0 0 0 ${f.glow}` }}
                 onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 32px -8px ${f.glow}`}
                 onMouseLeave={e => e.currentTarget.style.boxShadow = `0 0 0 0 ${f.glow}`}
            >
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
   6. STATS
══════════════════════════════════════════════ */
function StatsSection() {
  return (
    <section className="relative py-20 px-4 sm:px-8">
      <div aria-hidden
           className="pointer-events-none absolute inset-0
                      bg-gradient-to-b from-[#0a0a12] to-[#0a0a12]" />
      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Stats grid */}
        <div className="mb-16 grid grid-cols-2 gap-px overflow-hidden
                        rounded-2xl border border-white/[0.07] md:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.label}
                 className={`flex flex-col items-center justify-center py-10
                             bg-white/[0.02] backdrop-blur-sm
                             ${i < STATS.length - 1 ? 'border-r border-white/[0.05]' : ''}`}>
              <span className="mb-1 bg-gradient-to-r from-[#7A22FF] to-[#CFA8FF]
                               bg-clip-text text-4xl font-bold
                               text-transparent tracking-tight">
                {s.value}
              </span>
              <span className="text-xs font-medium text-white/45">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Especialidades pills */}
        <div className="text-center">
          <p className="mb-5 text-sm font-medium text-white/40 uppercase tracking-widest">
            11 especialidades
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Radiología','Dental','Cirugía','Cardiología','Neumología',
              'Audiometría','Patología','Obstétrico','Colposcopia',
              'Oftalmología','Veterinaria'].map(s => (
              <span key={s}
                    className="rounded-full border border-white/[0.08]
                               bg-white/[0.03] px-4 py-2 text-sm
                               font-medium text-white/65 backdrop-blur-sm
                               transition hover:border-[#7A22FF]/40 hover:text-white/90">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   7. CTA FINAL
══════════════════════════════════════════════ */
function CTASection() {
  return (
    <section className="relative overflow-hidden py-28 px-4 sm:px-8">
      <div aria-hidden
           className="pointer-events-none absolute left-1/2 top-1/2
                      h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2
                      rounded-full bg-[#7A22FF] opacity-[0.10] blur-[160px]" />
      {/* Borde eléctrico */}
      <div className="relative z-10 mx-auto max-w-4xl overflow-hidden rounded-3xl
                      border border-[#7A22FF]/25 bg-white/[0.02]
                      p-12 text-center backdrop-blur-sm
                      shadow-[0_0_80px_-20px_rgba(122,34,255,0.3)]">
        <div aria-hidden
             className="pointer-events-none absolute -top-24 left-1/2
                        h-48 w-48 -translate-x-1/2 rounded-full
                        bg-[#7A22FF] opacity-20 blur-3xl" />
        <p className="mb-4 inline-flex items-center gap-2 rounded-full
                      border border-[#7A22FF]/30 bg-[#7A22FF]/10
                      px-3 py-1 text-xs font-semibold uppercase
                      tracking-[0.16em] text-[#9450FF]">
          <Zap className="h-3 w-3" /> Empieza hoy
        </p>
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
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/contratar"
            className="inline-flex items-center gap-2 rounded-2xl
                       bg-gradient-to-r from-[#7A22FF] to-[#5B27B5]
                       px-8 py-4 text-base font-semibold text-white
                       shadow-[0_8px_40px_-8px_rgba(122,34,255,0.75)]
                       transition hover:brightness-110 hover:scale-[1.02]
                       active:scale-[0.97]">
            <ArrowRight className="h-5 w-5" /> Comenzar ahora
          </Link>
          <Link to="/login"
            className="inline-flex items-center gap-2 rounded-2xl
                       border border-white/[0.12] bg-white/[0.04]
                       px-8 py-4 text-base font-semibold text-white
                       backdrop-blur-sm transition
                       hover:bg-white/[0.08] hover:border-[#7A22FF]/40">
            <Users className="h-5 w-5" /> Ya tengo cuenta
          </Link>
        </div>
        {/* Compliance */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {['HIPAA','LGPD','LFPDPPP'].map(b => (
            <span key={b}
                  className="rounded-full border border-[#5B27B5]/40
                             bg-[#5B27B5]/10 px-2.5 py-0.5 text-[10px]
                             font-semibold uppercase tracking-wider text-[#9450FF]">
              {b}
            </span>
          ))}
        </div>
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
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a12] text-white"
         style={{ fontFamily: 'Geist, Inter, system-ui, sans-serif' }}>
      <Navbar />
      <Hero />
      <ProductTabs />
      <AISection />
      <FeaturesSection />
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
