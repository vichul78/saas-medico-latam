import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope, Brain, FileImage, CalendarCheck,
  ShieldCheck, Globe, ArrowRight, Play, Sparkles,
  Zap, Users, BarChart3, ChevronRight, ChevronDown,
  Heart, Wind, Ear, Eye, FlaskConical, Activity,
  Receipt, UserCircle, Monitor, Menu, X,
} from 'lucide-react';

/**
 * LandingPage — Enterprise Edition con Navbar corporativo multi-nivel.
 *
 * NAVBAR:
 *   • Fixed / sticky con .liquid-glass + backdrop-blur
 *   • Dropdown "Soluciones": Radiología, Cardiología, Dental, Neumología
 *   • Dropdown "Funcionalidades": Visor DICOM IA, Facturación Multidivisa, Portal Pacientes
 *   • Botón "Ver Demo Interactiva" destacado
 *   • Botón "Iniciar Sesión" → /login (intacto)
 *   • Menú hamburguesa responsive para móvil
 *
 * REGLAS: Púrpura Eléctrico + Violeta. CERO verde.
 */

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_230229_7c9bc431-46cf-489a-948d-e8144d8eb5d4.mp4';


/* ── Datos de los dropdowns ── */
const SOLUCIONES_ITEMS = [
  {
    icon: <FileImage className="h-5 w-5" />,
    title: 'Radiología',
    desc: 'DICOM nativo, informes IA, PACS-ready',
    to: '/soluciones/radiologia',
    accent: 'text-[#9450FF]',
  },
  {
    icon: <Heart className="h-5 w-5" />,
    title: 'Cardiología',
    desc: 'ECG, Holter, ecocardiograma digital',
    to: '/soluciones/cardiologia',
    accent: 'text-[#9450FF]',
  },
  {
    icon: <Stethoscope className="h-5 w-5" />,
    title: 'Dental',
    desc: 'Odontograma, panorámicas, presupuestos',
    to: '/soluciones/dental',
    accent: 'text-[#7A6FFF]',
  },
  {
    icon: <Wind className="h-5 w-5" />,
    title: 'Neumología',
    desc: 'Espirometría, oximetría, TC torácica',
    to: '/soluciones/neumologia',
    accent: 'text-[#7A6FFF]',
  },
];

const FUNCIONALIDADES_ITEMS = [
  {
    icon: <Monitor className="h-5 w-5" />,
    title: 'Visor DICOM IA',
    desc: 'CT · MR · DX · US con WW/WL y copiloto Iris',
    to: '/funcionalidades/tecnologia/visor-dicom',
    accent: 'text-[#9450FF]',
  },
  {
    icon: <Receipt className="h-5 w-5" />,
    title: 'Facturación Multidivisa',
    desc: 'MXN · BRL · ARS · COP · CLP y más',
    to: '/funcionalidades/gestion/facturacion-cobros',
    accent: 'text-[#9450FF]',
  },
  {
    icon: <UserCircle className="h-5 w-5" />,
    title: 'Portal de Pacientes',
    desc: 'Resultados, citas y mensajes en un clic',
    to: '/funcionalidades/facil-uso/portal-pacientes',
    accent: 'text-[#7A6FFF]',
  },
];


/* ── Características hero ── */
const FEATURES = [
  {
    icon:   <Brain className="h-6 w-6" />,
    title:  'IA Clínica',
    desc:   'Copiloto Iris analiza estudios, genera informes estructurados y sugiere diagnósticos diferenciales.',
    accent: 'text-[#9450FF]',
    ring:   'ring-[#7A22FF]/30',
  },
  {
    icon:   <FileImage className="h-6 w-6" />,
    title:  'Visor DICOM',
    desc:   'Soporte nativo CT · MR · DX · US. WW/WL, mediciones y anotaciones en tiempo real.',
    accent: 'text-[#7A6FFF]',
    ring:   'ring-[#5B27B5]/30',
  },
  {
    icon:   <CalendarCheck className="h-6 w-6" />,
    title:  'Gestión de Citas',
    desc:   'Agenda multi-recurso, recordatorios automáticos y reducción de inasistencias con IA.',
    accent: 'text-[#9450FF]',
    ring:   'ring-[#7A22FF]/30',
  },
  {
    icon:   <ShieldCheck className="h-6 w-6" />,
    title:  'Seguridad LatAm',
    desc:   'Cumplimiento HIPAA · LGPD · LFPDPPP con datos residentes en la región.',
    accent: 'text-[#7A6FFF]',
    ring:   'ring-[#5B27B5]/30',
  },
  {
    icon:   <Globe className="h-6 w-6" />,
    title:  'Multi-moneda',
    desc:   'Facturación en MXN · BRL · ARS · COP · CLP y 6 monedas LatAm adicionales.',
    accent: 'text-[#9450FF]',
    ring:   'ring-[#7A22FF]/30',
  },
  {
    icon:   <Activity className="h-6 w-6" />,
    title:  '11 Especialidades',
    desc:   'Radiología, Dental, Cardiología, Neumología, Oftalmología y más en una sola plataforma.',
    accent: 'text-[#7A6FFF]',
    ring:   'ring-[#5B27B5]/30',
  },
];

const STATS = [
  { value: '11',   label: 'Especialidades', icon: <Stethoscope className="h-4 w-4" /> },
  { value: '11',   label: 'Monedas LatAm',  icon: <Globe className="h-4 w-4" /> },
  { value: '100%', label: 'Nativo DICOM',   icon: <FileImage className="h-4 w-4" /> },
  { value: 'IA',   label: 'Copiloto Iris',  icon: <Brain className="h-4 w-4" /> },
];


/* ══════════════════════════════════════════════════════════════════
   HOOK: useDropdown — gestiona apertura/cierre con click-outside
═══════════════════════════════════════════════════════════════════ */
function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) close();
    }
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open, close]);

  // Cierra también con Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  return { open, setOpen, ref, close };
}


/* ══════════════════════════════════════════════════════════════════
   COMPONENTE: DropdownMenu
   Reutilizable para Soluciones y Funcionalidades.
   Hover en desktop, clic en tablet/móvil.
═══════════════════════════════════════════════════════════════════ */
function DropdownMenu({ label, items }) {
  const { open, setOpen, ref } = useDropdown();

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm
                    font-medium transition select-none
                    ${open
                      ? 'text-white'
                      : 'text-white/60 hover:text-white'
                    }`}
      >
        {label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200
                      ${open ? 'rotate-180 text-[#9450FF]' : ''}`}
        />
        {/* Subrayado activo — eléctrico, CERO verde */}
        {open && (
          <span className="absolute bottom-0 left-3 right-3 h-px
                           bg-gradient-to-r from-[#7A22FF] to-[#9450FF]
                           rounded-full" />
        )}
      </button>

      {/* Panel desplegable */}
      <div
        className={`absolute left-0 top-full z-50 mt-2 w-72
                    origin-top-left rounded-2xl
                    border border-white/[0.08] bg-[#0f0a1e]/95
                    backdrop-blur-xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)]
                    transition-all duration-200
                    ${open
                      ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                    }`}
        role="menu"
      >
        {/* Borde superior eléctrico */}
        <div className="h-px w-full rounded-t-2xl
                        bg-gradient-to-r from-[#7A22FF] via-[#9450FF] to-transparent" />

        <div className="p-2">
          {items.map(item => (
            <Link
              key={item.title}
              to={item.to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="group flex items-start gap-3 rounded-xl p-3
                         transition hover:bg-white/[0.06]"
            >
              {/* Ícono */}
              <div className={`mt-0.5 shrink-0 ${item.accent}
                               transition group-hover:scale-110`}>
                {item.icon}
              </div>
              {/* Texto */}
              <div>
                <p className="text-sm font-semibold text-white leading-tight
                               group-hover:text-[#CFA8FF] transition">
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs text-white/40 leading-snug">
                  {item.desc}
                </p>
              </div>
              {/* Flecha sutil */}
              <ChevronRight className="ml-auto mt-1 h-3.5 w-3.5 shrink-0
                                       text-white/20 transition
                                       group-hover:text-[#9450FF]
                                       group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>

        {/* Footer del dropdown */}
        <div className="border-t border-white/[0.06] px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-white/25">
            MediCo LatAm · Plataforma clínica
          </p>
        </div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════
   COMPONENTE: EnterpriseNavbar
   Fixed, liquid-glass, responsive, con dropdowns y Demo CTA.
═══════════════════════════════════════════════════════════════════ */
function EnterpriseNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detecta scroll para intensificar el blur
  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 20); }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300
                  ${scrolled
                    ? 'bg-[#0a0a12]/80 backdrop-blur-xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)]'
                    : 'bg-transparent backdrop-blur-md'
                  }`}
    >
      {/* Línea eléctrica superior */}
      <div className="h-px w-full bg-gradient-to-r
                      from-transparent via-[#7A22FF]/50 to-transparent" />

      <div className="mx-auto flex h-16 max-w-7xl items-center
                      justify-between px-4 sm:px-6 lg:px-8">

        {/* ── LEFT: Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl
                          bg-gradient-to-br from-[#7A22FF] to-[#5B27B5]
                          shadow-[0_0_16px_-4px_rgba(122,34,255,0.7)]
                          transition group-hover:shadow-[0_0_24px_-2px_rgba(122,34,255,0.9)]">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            MediCo<span className="text-[#9450FF]"> LatAm</span>
          </span>
        </Link>

        {/* ── CENTER: Navegación desktop ── */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
          {/* Dropdown Soluciones */}
          <DropdownMenu label="Soluciones" items={SOLUCIONES_ITEMS} />

          {/* Dropdown Funcionalidades */}
          <DropdownMenu label="Funcionalidades" items={FUNCIONALIDADES_ITEMS} />

          {/* Enlace simple */}
          <Link
            to="/nosotros"
            className="rounded-lg px-3 py-2 text-sm font-medium
                       text-white/60 transition hover:text-white"
          >
            Nosotros
          </Link>
        </nav>

        {/* ── RIGHT: CTAs desktop ── */}
        <div className="hidden items-center gap-2.5 lg:flex">
          {/* Demo Interactiva — botón destacado violet */}
          <Link
            to="/funcionalidades/tecnologia/visor-dicom"
            className="inline-flex items-center gap-1.5 rounded-xl
                       border border-[#7A22FF]/50 bg-[#7A22FF]/10
                       px-4 py-2 text-sm font-semibold text-[#CFA8FF]
                       transition hover:bg-[#7A22FF]/20 hover:border-[#7A22FF]/80
                       hover:text-white"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Ver Demo Interactiva
          </Link>

          {/* Iniciar Sesión → /login (INTACTO) */}
          <Link
            to="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium
                       text-white/70 transition hover:text-white"
          >
            Iniciar Sesión
          </Link>

          {/* Comenzar — eléctrico, NUNCA verde */}
          <Link
            to="/contratar"
            className="inline-flex items-center gap-1.5 rounded-xl
                       bg-gradient-to-r from-[#7A22FF] to-[#5B27B5]
                       px-4 py-2.5 text-sm font-semibold text-white
                       shadow-[0_4px_20px_-6px_rgba(122,34,255,0.6)]
                       transition hover:brightness-110 active:brightness-95"
          >
            Comenzar
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* ── Hamburguesa (móvil/tablet) ── */}
        <button
          type="button"
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(v => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg
                     border border-white/[0.08] text-white/70
                     transition hover:border-[#7A22FF]/50 hover:text-white
                     lg:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Menú móvil ── */}
      <div
        className={`overflow-hidden transition-all duration-300 lg:hidden
                    ${mobileOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="border-t border-white/[0.06] bg-[#0a0a12]/95 backdrop-blur-xl
                        px-4 pb-6 pt-4 space-y-1">

          {/* Soluciones — expansible en móvil */}
          <MobileSection title="Soluciones" items={SOLUCIONES_ITEMS}
                         onClose={() => setMobileOpen(false)} />

          {/* Funcionalidades — expansible en móvil */}
          <MobileSection title="Funcionalidades" items={FUNCIONALIDADES_ITEMS}
                         onClose={() => setMobileOpen(false)} />

          <Link to="/nosotros" onClick={() => setMobileOpen(false)}
            className="block rounded-xl px-4 py-2.5 text-sm font-medium
                       text-white/70 transition hover:bg-white/[0.05] hover:text-white">
            Nosotros
          </Link>

          {/* Separador */}
          <div className="my-3 h-px bg-white/[0.06]" />

          {/* Demo */}
          <Link to="/funcionalidades/tecnologia/visor-dicom"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 rounded-xl border border-[#7A22FF]/40
                       bg-[#7A22FF]/10 px-4 py-3 text-sm font-semibold text-[#CFA8FF]">
            <Play className="h-4 w-4 fill-current" />
            Ver Demo Interactiva
          </Link>

          <Link to="/login" onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm
                       font-medium text-white/70">
            Iniciar Sesión
          </Link>

          <Link to="/contratar" onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 rounded-xl
                       bg-gradient-to-r from-[#7A22FF] to-[#5B27B5]
                       px-4 py-3 text-sm font-semibold text-white">
            <Zap className="h-4 w-4" />
            Comenzar
          </Link>
        </div>
      </div>
    </header>
  );
}


/* ── Sección expandible para menú móvil ── */
function MobileSection({ title, items, onClose }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between rounded-xl px-4 py-2.5
                   text-sm font-medium text-white/70 transition
                   hover:bg-white/[0.05] hover:text-white">
        {title}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180 text-[#9450FF]' : ''}`} />
      </button>
      {open && (
        <div className="mt-1 space-y-0.5 pl-2">
          {items.map(item => (
            <Link key={item.title} to={item.to} onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5
                         transition hover:bg-white/[0.05]">
              <span className={`shrink-0 ${item.accent}`}>{item.icon}</span>
              <div>
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="text-xs text-white/40">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL: LandingPage
═══════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a12] text-white" style={{ fontFamily: 'Geist, Inter, system-ui, sans-serif' }}>

      {/* ── NAVBAR ENTERPRISE ── */}
      <EnterpriseNavbar />

      {/* ══════════════════════════════════════════════════════════════
          HERO — pantalla completa, video de fondo, texto abajo-izquierda
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-screen flex-col overflow-hidden">

        {/* Video de fondo */}
        <video src={VIDEO_SRC} autoPlay muted loop playsInline aria-hidden
               className="absolute inset-0 h-full w-full object-cover" />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b
                        from-[#0a0a12]/70 via-[#0a0a12]/30 to-[#0a0a12]/85" />

        {/* Destellos */}
        <div aria-hidden className="pointer-events-none absolute -left-40 top-1/3
                                    h-[500px] w-[500px] rounded-full bg-[#7A22FF]
                                    opacity-[0.12] blur-[120px]" />
        <div aria-hidden className="pointer-events-none absolute -right-32 top-1/2
                                    h-[400px] w-[400px] rounded-full bg-[#5B27B5]
                                    opacity-[0.10] blur-[100px]" />

        {/* Contenido hero — abajo a la izquierda */}
        <div className="relative z-10 flex flex-1 flex-col justify-end
                        px-5 pb-20 sm:px-12 lg:px-20">

          {/* Badge eyebrow */}
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full
                          border border-[#7A22FF]/40 bg-[#7A22FF]/10
                          px-3 py-1 text-xs font-semibold uppercase
                          tracking-[0.16em] text-[#CFA8FF]">
            <Sparkles className="h-3.5 w-3.5" />
            Plataforma clínica para LatAm
          </div>

          {/* H1 */}
          <h1 className="mb-5 max-w-3xl text-5xl font-bold leading-[1.05]
                         tracking-tight text-white sm:text-6xl lg:text-7xl">
            La Evolución del
            <br />
            <span className="bg-gradient-to-r from-[#9450FF] to-[#CFA8FF]
                             bg-clip-text text-transparent">
              Diagnóstico Radiológico
            </span>
          </h1>

          {/* Descripción */}
          <p className="mb-8 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            Gestiona pacientes, analiza imágenes DICOM y potencia tu clínica
            con Inteligencia Artificial diseñada para Latinoamérica.
          </p>

          {/* CTAs principales */}
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/contratar"
              className="inline-flex items-center gap-2 rounded-2xl
                         bg-gradient-to-r from-[#7A22FF] to-[#5B27B5]
                         px-7 py-3.5 text-base font-semibold text-white
                         shadow-[0_8px_32px_-8px_rgba(122,34,255,0.65)]
                         transition hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]">
              <Zap className="h-5 w-5" />
              Comenzar gratis
            </Link>
            <Link to="/funcionalidades/tecnologia/visor-dicom"
              className="liquid-glass inline-flex items-center gap-2 rounded-2xl
                         px-7 py-3.5 text-base font-semibold text-white
                         transition hover:bg-white/[0.08]">
              <Play className="h-5 w-5 fill-current" />
              Ver demo DICOM
            </Link>
          </div>

          {/* Stats pills */}
          <div className="mt-10 flex flex-wrap gap-4">
            {STATS.map(s => (
              <div key={s.label} className="liquid-glass flex items-center
                                            gap-2.5 rounded-2xl px-4 py-2.5">
                <span className="text-[#9450FF]">{s.icon}</span>
                <span className="text-xl font-bold text-white">{s.value}</span>
                <span className="text-xs text-white/50">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex justify-center pb-6 animate-bounce">
          <div className="flex h-6 w-6 items-center justify-center rounded-full
                          border border-white/20 text-white/40">
            <ChevronRight className="h-4 w-4 rotate-90" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CARACTERÍSTICAS
      ══════════════════════════════════════════════════════════════ */}
      <section id="funcionalidades" className="relative py-24 px-5 sm:px-8">
        <div aria-hidden className="pointer-events-none absolute inset-0
                                    bg-gradient-to-b from-[#0a0a12] via-[#0f0a1e] to-[#0a0a12]" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full
                          border border-[#7A22FF]/30 bg-[#7A22FF]/10
                          px-3 py-1 text-xs font-semibold uppercase
                          tracking-[0.16em] text-[#9450FF]">
              <Sparkles className="h-3 w-3" />
              Todo en una plataforma
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Tecnología clínica de
              <span className="bg-gradient-to-r from-[#9450FF] to-[#CFA8FF]
                               bg-clip-text text-transparent"> primer nivel</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-white/50">
              Diseñado para los flujos reales de clínicas y hospitales en México,
              Brasil, Colombia y toda la región.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(f => <FeatureCard key={f.title} feature={f} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          ESPECIALIDADES
      ══════════════════════════════════════════════════════════════ */}
      <section id="especialidades" className="py-20 px-5 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              11 especialidades, una sola plataforma
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {['Radiología','Dental','Cirugía','Cardiología','Neumología',
              'Audiometría','Patología','Obstétrico','Colposcopia',
              'Oftalmología','Veterinaria'].map(spec => (
              <span key={spec}
                className="liquid-glass rounded-full px-5 py-2.5 text-sm
                           font-medium text-white/80 transition
                           hover:text-white hover:bg-white/[0.06]">
                {spec}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-28 px-5 sm:px-8">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2
                                    h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2
                                    rounded-full bg-[#7A22FF] opacity-[0.12] blur-[140px]" />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h2 className="mb-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Tu clínica, potenciada con IA.
          </h2>
          <p className="mb-10 text-lg text-white/50">
            Únete a las clínicas de LatAm que ya digitalizaron su operación.
            Sin papeles, sin demoras.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contratar"
              className="inline-flex items-center gap-2 rounded-2xl
                         bg-gradient-to-r from-[#7A22FF] to-[#5B27B5]
                         px-8 py-4 text-base font-semibold text-white
                         shadow-[0_8px_40px_-8px_rgba(122,34,255,0.7)]
                         transition hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]">
              <ArrowRight className="h-5 w-5" />
              Comenzar ahora
            </Link>
            <Link to="/login"
              className="liquid-glass inline-flex items-center gap-2 rounded-2xl
                         px-8 py-4 text-base font-semibold text-white
                         transition hover:bg-white/[0.08]">
              <Users className="h-5 w-5" />
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.06] py-8 px-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center
                        justify-between gap-4 sm:flex-row">
          <p className="text-sm text-white/30">
            © {new Date().getFullYear()} MediCo LatAm · Plataforma clínica regional
          </p>
          <div className="flex items-center gap-3">
            {['HIPAA','LGPD','LFPDPPP'].map(b => (
              <span key={b}
                className="rounded-full border border-[#5B27B5]/30
                           bg-[#5B27B5]/10 px-2 py-0.5 text-[10px]
                           font-semibold uppercase tracking-wider text-[#9450FF]">
                {b}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-white/30">
            <BarChart3 className="h-4 w-4 text-[#7A22FF]/50" />
            <span>v2.0 · Enterprise</span>
          </div>
        </div>
      </footer>

    </div>
  );
}


/* ── Tarjeta de característica ── */
function FeatureCard({ feature: f }) {
  return (
    <div className={`liquid-glass group rounded-2xl p-6 ring-1 ${f.ring}
                     transition hover:ring-2 hover:bg-white/[0.04]`}>
      <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center
                       rounded-xl bg-white/[0.06] ${f.accent}
                       ring-1 ${f.ring} transition group-hover:scale-110`}>
        {f.icon}
      </div>
      <h3 className="mb-2 text-base font-semibold text-white">{f.title}</h3>
      <p className="text-sm leading-relaxed text-white/50">{f.desc}</p>
    </div>
  );
}
