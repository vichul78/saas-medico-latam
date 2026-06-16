import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Activity,
  ShieldCheck,
  Smartphone,
  ScanLine,
  UserRound,
  FileText,
  Brain,
  Monitor,
  Receipt,
  CheckCircle2,
  BarChart3,
  ChevronDown,
  Sparkles,
  Globe,
  CalendarCheck,
  FileImage,
  Stethoscope,
  Menu,
  X,
} from 'lucide-react';
import { ContainerScroll } from '../components/ui/container-scroll-animation';
import { ModernFeatures } from '../components/ui/modern-features';
import { SpecialistsCarousel } from '../components/ui/specialists-carousel';

/* ─────────────────────────────────────────────────────────────────────────────
   LOGO SVG
───────────────────────────────────────────────────────────────────────────── */
function Logo() {
  return (
    <svg width="18" height="18" viewBox="0 0 256 256" fill="none">
      <path
        fill="rgb(84, 84, 84)"
        d="M 160 88 L 194 34 L 216 0 L 256 0 L 256 40 L 221.5 93.5 L 200 128 L 256 128 L 256 256 L 96 256 L 96 168 L 64.246 220 L 40 256 L 0 256 L 0 216 L 34 162 L 56 128 L 0 128 L 0 0 L 160 0 Z"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NAV DATA
───────────────────────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Inicio',      to: '/' },
  { label: 'Plataforma',  to: '/productos' },
  { label: 'Beneficios',  to: '/funcionalidades/gestion-integral' },
  { label: 'Demo',        to: '/login' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   DROPDOWN DATA (kept intact — used in mobile nav)
───────────────────────────────────────────────────────────────────────────── */
const SOLUCIONES_COL1 = [
  { label: 'Radiología',    href: '/soluciones/radiologia',   icon: '🫁' },
  { label: 'Dental',        href: '/soluciones/dental',       icon: '🦷' },
  { label: 'Cirugía',       href: '/soluciones/cirugia',      icon: '🔬' },
  { label: 'Cardiología',   href: '/soluciones/cardiologia',  icon: '❤️' },
  { label: 'Neumología',    href: '/soluciones/neumologia',   icon: '🌬️' },
  { label: 'Audiometría',   href: '/soluciones/audiometria',  icon: '👂' },
];
const SOLUCIONES_COL2 = [
  { label: 'Patología',      href: '/soluciones/patologia',     icon: '🧬' },
  { label: 'Obstétrico',     href: '/soluciones/obstetrico',    icon: '🤱' },
  { label: 'Colposcopia',    href: '/soluciones/colposcopia',   icon: '🔎' },
  { label: 'Oftalmología',   href: '/soluciones/oftalmologia',  icon: '👁️' },
  { label: 'Veterinaria',    href: '/soluciones/veterinaria',   icon: '🐾' },
  { label: 'Teleradiología', href: '/soluciones/teleradiologia',icon: '🌐', highlight: true },
];

const FUNCIONALIDADES_BLOCKS = [
  { title: 'Tecnología Avanzada', items: [
    { label: 'IA Asistente',         href: '/funcionalidades/tecnologia/ia-asistente' },
    { label: 'Visor DICOM',          href: '/funcionalidades/tecnologia/visor-dicom' },
    { label: 'Envío de resultados',  href: '/funcionalidades/tecnologia/envio-resultados' },
    { label: 'Compatibilidad total', href: '/funcionalidades/tecnologia/compatibilidad-total' },
  ]},
  { title: 'Gestión Integral', items: [
    { label: 'Almacenamiento seguro', href: '/funcionalidades/gestion/almacenamiento-seguro' },
    { label: 'Gestión de estudios',   href: '/funcionalidades/gestion/estudios' },
    { label: 'Citas y agendas',       href: '/funcionalidades/gestion/citas-agendas' },
    { label: 'Facturación y cobros',  href: '/funcionalidades/gestion/facturacion-cobros' },
  ]},
  { title: 'Fácil de Usar', items: [
    { label: 'Portal pacientes',       href: '/funcionalidades/facil-uso/portal-pacientes' },
    { label: 'Portal médicos',         href: '/funcionalidades/facil-uso/portal-medicos' },
    { label: 'Recordatorios de citas', href: '/funcionalidades/facil-uso/recordatorios-citas' },
  ]},
  { title: 'Personalizado', items: [
    { label: 'Adaptación total',  href: '/funcionalidades/personalizado/adaptacion-total' },
    { label: 'Integraciones',     href: '/funcionalidades/personalizado/integraciones' },
    { label: 'Modelo de precios', href: '/funcionalidades/personalizado/modelo-precios' },
  ]},
];

/* ─────────────────────────────────────────────────────────────────────────────
   PRODUCT + FEATURES DATA (unchanged)
───────────────────────────────────────────────────────────────────────────── */
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
  { icon: <FileImage className="h-6 w-6" />, title: 'DICOM nativo',        desc: 'CT · MR · DX · US. Sin plugins.' },
  { icon: <Brain className="h-6 w-6" />,     title: 'Copiloto Iris',       desc: 'IA clínica para informes y diagnósticos.' },
  { icon: <CalendarCheck className="h-6 w-6" />, title: 'Agenda inteligente', desc: 'Citas multi-recurso con recordatorios.' },
  { icon: <ShieldCheck className="h-6 w-6" />,   title: 'HIPAA · LGPD',   desc: 'Cumplimiento regulatorio regional.' },
  { icon: <Globe className="h-6 w-6" />,     title: '11 monedas LatAm',    desc: 'MXN · BRL · ARS · COP · CLP y más.' },
  { icon: <Stethoscope className="h-6 w-6" />, title: '11 especialidades', desc: 'Radiología, Dental, Cardio y más.' },
];

const STATS = [
  { value: '+500',   label: 'Clínicas activas' },
  { value: '11',     label: 'Monedas LatAm' },
  { value: '99.9%',  label: 'Uptime SLA' },
  { value: '<200ms', label: 'Latencia media' },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   NAVBAR — centered pill, logo circle, simple links
═══════════════════════════════════════════════════════════════════════════════ */
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="relative z-50 flex items-center justify-center gap-2 px-4 pt-4 sm:gap-3 sm:px-8 sm:pt-6">
        <Link
          to="/"
          aria-label="MediCo LatAm"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm transition-transform duration-200 hover:scale-105 sm:h-11 sm:w-11"
          style={{ backgroundColor: '#EDEDED' }}
        >
          <Logo />
        </Link>

        {/* Desktop pill */}
        <div
          className="hidden items-center gap-4 rounded-xl px-4 py-2.5 shadow-sm sm:gap-10 sm:px-8 sm:py-3 lg:flex"
          style={{ backgroundColor: '#EDEDED' }}
        >
          {NAV_LINKS.map(link => (
            <Link
              key={link.label}
              to={link.to}
              className="text-[12px] font-medium text-gray-700 transition-colors duration-200 hover:text-blue-600 sm:text-[14px]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(v => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full shadow-sm lg:hidden"
          style={{ backgroundColor: '#EDEDED' }}
          aria-label="Menú"
        >
          {mobileOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
        </button>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-white/95 backdrop-blur-xl lg:hidden">
          <div className="flex h-16 items-center justify-between px-6">
            <span className="text-base font-semibold text-gray-900">MediCo LatAm</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="text-gray-500 hover:text-gray-900"
              aria-label="Cerrar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {NAV_LINKS.map(link => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block rounded-xl px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-4 border-gray-100" />
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-blue-500">Soluciones</p>
            {[...SOLUCIONES_COL1, ...SOLUCIONES_COL2].map(s => (
              <Link
                key={s.href}
                to={s.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                {s.icon} {s.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HERO SECTION — new light design, video bg, animated UI mockup
═══════════════════════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#f0f0ee] text-gray-900">
      {/* Video background */}
      <video
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px]" />
      <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[32rem] w-[32rem] rounded-full bg-cyan-200/30 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />

        <div className="grid flex-1 items-center gap-10 px-6 pb-10 pt-10 sm:px-12 md:px-20 lg:grid-cols-[0.95fr_1.05fr] lg:px-28 lg:pb-20">
          {/* ── Left col ── */}
          <div className="max-w-xl">
            <Link
              to="/funcionalidades/tecnologia/ia-asistente"
              className="group mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-[11.5px] font-medium text-blue-600 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-blue-300 hover:bg-white"
            >
              <ScanLine className="h-3.5 w-3.5" />
              IA médica para clínicas modernas
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Link>

            <h1 className="animate-fade-up text-[2.35rem] font-medium leading-[1.04] tracking-tight text-gray-950 sm:text-[3.4rem] lg:text-[4.2rem]">
              Software médico inteligente para clínicas que quieren trabajar mejor.
            </h1>

            <p className="mt-5 max-w-md animate-fade-up-delay text-[15px] leading-6 text-gray-500 sm:text-[16px]">
              Centraliza pacientes, historiales, diagnósticos y procesos clínicos en una plataforma rápida, simple y moderna.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-blue-500 bg-blue-500 px-6 py-3 text-[13px] font-medium text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-blue-500/30"
              >
                Solicitar demo
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/productos"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white/60 px-6 py-3 text-[13px] font-medium text-gray-700 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-gray-950"
              >
                Ver plataforma
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Mini feature cards */}
            <div className="mt-8 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { icon: FileText,   title: 'Historial clínico' },
                { icon: UserRound,  title: 'Gestión de pacientes' },
                { icon: Activity,   title: 'Diagnóstico asistido' },
              ].map(item => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/70 bg-white/55 p-4 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:bg-white"
                >
                  <item.icon className="mb-3 h-4 w-4 text-blue-500" />
                  <p className="text-[12px] font-medium text-gray-700">{item.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right col — animated UI ── */}
          <div className="relative mx-auto flex h-[430px] w-full max-w-[620px] items-center justify-center sm:h-[540px]">
            <div className="absolute h-[360px] w-[360px] rounded-full bg-blue-100/70 blur-3xl sm:h-[460px] sm:w-[460px]" />

            {/* Robot arm */}
            <div className="robot-arm absolute left-2 top-36 hidden h-28 w-64 origin-left rounded-full bg-white/80 shadow-xl shadow-blue-950/5 ring-1 ring-gray-200/80 backdrop-blur-md md:block">
              <div className="absolute left-5 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full border border-gray-200 bg-white shadow-inner" />
              <div className="absolute right-8 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full border border-gray-200 bg-white shadow-md">
                <div className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100" />
              </div>
              <div className="absolute -right-8 top-1/2 h-8 w-16 -translate-y-1/2 rounded-full bg-white shadow-md ring-1 ring-gray-200" />
            </div>

            {/* Phone mockup */}
            <div className="phone-float relative z-10 h-[310px] w-[158px] rounded-[2.2rem] border border-gray-200 bg-gray-950 p-2 shadow-2xl shadow-blue-950/20 sm:h-[360px] sm:w-[184px]">
              <div className="h-full w-full overflow-hidden rounded-[1.7rem] bg-gradient-to-b from-gray-50 to-blue-50">
                <div className="mx-auto mt-3 h-5 w-20 rounded-full bg-gray-950" />
                <div className="px-4 pt-8">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-medium text-gray-400">MediCo Scan</p>
                      <p className="text-[13px] font-semibold text-gray-900">Paciente activo</p>
                    </div>
                    <Smartphone className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="rounded-2xl border border-blue-100 bg-white/80 p-3 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      <p className="text-[10px] font-medium text-gray-500">Escaneo en progreso</p>
                    </div>
                    <div className="h-28 rounded-xl bg-gradient-to-br from-blue-50 to-white p-3">
                      <svg viewBox="0 0 120 120" className="h-full w-full">
                        <path d="M60 14 C51 28 49 48 52 76" stroke="#60a5fa" strokeWidth="3" fill="none" opacity="0.9" />
                        <path d="M60 14 C69 28 71 48 68 76" stroke="#60a5fa" strokeWidth="3" fill="none" opacity="0.9" />
                        {[24, 34, 44, 54, 64].map(y => (
                          <g key={y}>
                            <path d={`M58 ${y} C42 ${y+1} 32 ${y+10} 24 ${y+20}`} stroke="#93c5fd" strokeWidth="2" fill="none" />
                            <path d={`M62 ${y} C78 ${y+1} 88 ${y+10} 96 ${y+20}`} stroke="#93c5fd" strokeWidth="2" fill="none" />
                          </g>
                        ))}
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hologram card */}
            <div className="hologram absolute right-0 top-10 z-20 w-[270px] rounded-[2rem] border border-blue-200/80 bg-white/45 p-5 shadow-2xl shadow-blue-500/10 backdrop-blur-xl sm:right-2 sm:top-12 sm:w-[340px]">
              <div className="scan-line" />
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-blue-500">Radiografía IA</p>
                  <p className="text-[15px] font-semibold text-gray-900">Análisis clínico</p>
                </div>
                <div className="rounded-full bg-blue-500/10 p-2">
                  <ShieldCheck className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              <div className="relative h-48 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/90 via-white/80 to-cyan-50/80 sm:h-64">
                <svg viewBox="0 0 240 240" className="h-full w-full p-6">
                  <path d="M120 22 C104 48 100 88 105 162" stroke="#3b82f6" strokeWidth="5" fill="none" opacity="0.75" />
                  <path d="M120 22 C136 48 140 88 135 162" stroke="#3b82f6" strokeWidth="5" fill="none" opacity="0.75" />
                  {[44, 60, 76, 92, 108, 124, 140].map((y, index) => (
                    <g key={y} opacity={1 - index * 0.06}>
                      <path d={`M116 ${y} C83 ${y+1} 60 ${y+18} 42 ${y+38}`} stroke="#60a5fa" strokeWidth="3" fill="none" />
                      <path d={`M124 ${y} C157 ${y+1} 180 ${y+18} 198 ${y+38}`} stroke="#60a5fa" strokeWidth="3" fill="none" />
                    </g>
                  ))}
                  <circle cx="120" cy="175" r="20" stroke="#93c5fd" strokeWidth="4" fill="none" opacity="0.8" />
                </svg>
                <div className="absolute inset-x-8 bottom-5 rounded-full bg-white/70 px-4 py-2 text-center text-[11px] font-medium text-blue-600 shadow-sm backdrop-blur-md">
                  Scan activo · precisión asistida
                </div>
              </div>
            </div>

            {/* Data cards */}
            <div className="data-card card-one absolute left-0 top-10 z-30 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-xl shadow-blue-950/5 backdrop-blur-xl">
              <p className="text-[10px] font-medium text-gray-400">Paciente #0248</p>
              <p className="text-[13px] font-semibold text-gray-900">Historial listo</p>
            </div>
            <div className="data-card card-two absolute bottom-16 right-5 z-30 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-xl shadow-blue-950/5 backdrop-blur-xl">
              <p className="text-[10px] font-medium text-gray-400">Riesgo clínico</p>
              <p className="text-[13px] font-semibold text-blue-600">Bajo</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Inline animations ── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatPhone {
          0%,100% { transform: translateY(0) rotate(-2deg); }
          50%      { transform: translateY(-14px) rotate(1deg); }
        }
        @keyframes hologramPulse {
          0%,100% { opacity: 0.92; transform: translateY(0) scale(1); }
          50%     { opacity: 1; transform: translateY(-5px) scale(1.015); }
        }
        @keyframes scan {
          0%   { transform: translateY(-30px); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(300px); opacity: 0; }
        }
        @keyframes robotIdle {
          0%,100% { transform: rotate(-4deg); }
          50%     { transform: rotate(3deg); }
        }
        @keyframes cardFloat {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-8px); }
        }
        .animate-fade-up       { animation: fadeUp 700ms ease-out both; }
        .animate-fade-up-delay { animation: fadeUp 800ms ease-out 120ms both; }
        .phone-float  { animation: floatPhone 6s ease-in-out infinite; }
        .hologram     { animation: hologramPulse 5s ease-in-out infinite; }
        .robot-arm    { animation: robotIdle 7s ease-in-out infinite; }
        .data-card    { animation: cardFloat 5s ease-in-out infinite; }
        .card-two     { animation-delay: 1.2s; }
        .scan-line {
          position: absolute;
          left: 1.25rem; right: 1.25rem; top: 5.8rem;
          height: 2px; border-radius: 9999px;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.85), transparent);
          box-shadow: 0 0 24px rgba(59,130,246,0.55);
          animation: scan 3.2s ease-in-out infinite;
          z-index: 30; pointer-events: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-up,.animate-fade-up-delay,.phone-float,
          .hologram,.robot-arm,.data-card,.scan-line { animation: none !important; }
        }
      `}</style>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   BROWSER MOCKUP (unchanged)
═══════════════════════════════════════════════════════════════════════════════ */
function BrowserMockup() {
  return (
    <div className="w-full max-w-6xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_32px_80px_-16px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <div className="flex h-10 items-center gap-2.5 border-b border-slate-200 bg-slate-100 px-4">
          <div className="h-3 w-3 rounded-full bg-[#3b82f6]/60" />
          <div className="h-3 w-3 rounded-full bg-[#2563eb]/50" />
          <div className="h-3 w-3 rounded-full bg-[#3b82f6]/30" />
          <div className="mx-auto flex h-6 w-64 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3">
            <div className="h-2 w-2 rounded-full bg-[#3b82f6]/50" />
            <span className="font-mono text-[11px] text-slate-400">app.medicolatam.com/visor</span>
          </div>
        </div>
        <div className="relative flex h-[400px] overflow-hidden sm:h-[480px]">
          <div className="hidden w-36 shrink-0 border-r border-slate-200 bg-black/50 p-3 sm:block">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-[#3b82f6]">Series</p>
            {['TC Tórax Axial', 'TC Tórax Coronal', 'Rx PA'].map((s, i) => (
              <div key={s} className={`mb-1.5 rounded-lg p-2 text-[10px] text-slate-500 ${
                i === 0 ? 'border border-[#3b82f6]/30 bg-[#3b82f6]/8 text-slate-700' : ''}`}>
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
              <line x1="256" y1="110" x2="256" y2="290" stroke="rgba(59,130,246,0.25)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="160" y1="200" x2="352" y2="200" stroke="rgba(59,130,246,0.25)" strokeWidth="1" strokeDasharray="4 4" />
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
              <div className="h-6 w-6 rounded-full bg-[#3b82f6]/20" />
              <p className="text-[11px] font-semibold text-white">Iris · IA</p>
              <div className="ml-auto h-2 w-2 animate-pulse rounded-full bg-[#3b82f6]" />
            </div>
            <div className="flex-1 space-y-2 p-3">
              <div className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] text-slate-500">Analizando TC de tórax…</div>
              <div className="ml-2 rounded-lg border border-[#3b82f6]/20 bg-[#3b82f6]/5 px-2.5 py-1.5 text-[10px] text-slate-500">Parénquima sin consolidaciones. CTR normal.</div>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden className="pointer-events-none mx-auto mt-0 h-14 w-2/3 -translate-y-4 rounded-full bg-[#3b82f6]/10 blur-2xl" />
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
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: '#2563eb' }}>
            <Sparkles className="h-3 w-3" /> Plataforma modular
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Todo lo que tu clínica{' '}
            <span className="bg-gradient-to-r from-[#3b82f6] to-[#2563eb] bg-clip-text text-transparent">necesita</span>
          </h2>
        </div>
        <div className="mb-12 flex flex-wrap justify-center gap-2">
          {PRODUCT_TABS.map(t => (
            <button key={t.id} type="button" onClick={() => setActive(t.id)}
              className={`flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition ${
                active === t.id
                  ? 'border-[#3b82f6]/50 bg-[#3b82f6]/15 text-slate-900 shadow-[0_0_24px_-6px_rgba(59,130,246,0.4)]'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-[#3b82f6]/30 hover:text-slate-700'
              }`}>
              <span className={active === t.id ? 'text-[#2563eb]' : ''}>{t.icon}</span>{t.label}
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
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: '#3b82f6' }} />
                  <span className="text-sm text-slate-600">{pt}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Link to="/login"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold uppercase transition hover:brightness-110"
                style={{ background: '#3b82f6', color: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
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
        <Monitor className="h-5 w-5" style={{ color: '#3b82f6' }} />
        <span className="text-sm font-semibold text-slate-900">Visor DICOM</span>
        <span className="ml-auto rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/10 px-2 py-0.5 text-[10px] font-bold" style={{ color: '#2563eb' }}>CT</span>
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
        { label: 'Ingresos del mes',   val: '$124,500 MXN', pct: 78 },
        { label: 'Cuentas por cobrar', val: '$38,200 MXN',  pct: 45 },
        { label: 'Facturas emitidas',  val: '142',           pct: 90 },
      ].map(r => (
        <div key={r.label} className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs text-slate-500">{r.label}</p>
            <p className="text-sm font-bold text-slate-900">{r.val}</p>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: '#3b82f6' }} />
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
        <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/10 px-2 py-0.5 text-[10px] font-semibold" style={{ color: '#2563eb' }}>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3b82f6]" /> Online
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
            : 'ml-5 border border-[#3b82f6]/20 bg-[#3b82f6]/5 text-slate-700'
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
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3b82f6] opacity-[0.03] blur-[180px]" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: '#2563eb' }}>
            🌐 Red Nacional de Diagnóstico
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Teleradiología:{' '}
            <span className="bg-gradient-to-r from-[#3b82f6] to-[#2563eb] bg-clip-text text-transparent">diagnóstico remoto</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-500">
            Conecta tu clínica con radiólogos certificados en todo LatAm. Estudios leídos en menos de 2 horas con firma digital y trazabilidad completa.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map(s => (
            <div key={s.step} className="group relative rounded-2xl border border-slate-200 bg-white p-7 transition hover:border-[#3b82f6]/30 hover:shadow-[0_0_40px_-8px_rgba(59,130,246,0.2)]">
              <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#3b82f6]/15 text-xs font-bold" style={{ color: '#2563eb' }}>
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
            className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition hover:bg-[#3b82f6]/10"
            style={{ borderColor: 'rgba(59,130,246,0.4)', color: '#2563eb' }}>
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
            <span className="bg-gradient-to-r from-[#3b82f6] to-[#2563eb] bg-clip-text text-transparent">la práctica clínica real</span>
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(f => (
            <div key={f.title} className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-[#3b82f6]/30 hover:shadow-[0_0_36px_-8px_rgba(59,130,246,0.2)]">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 ring-1 ring-[#3b82f6]/20 transition group-hover:scale-110 group-hover:ring-[#3b82f6]/50"
                   style={{ color: '#2563eb' }}>
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
              <span className="mb-1 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] bg-clip-text text-4xl font-bold text-transparent tracking-tight">{s.value}</span>
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
      className="relative overflow-hidden py-28 px-4 sm:px-8 bg-[#f5f5f7]"
    >
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px]"
           style={{ background: 'rgba(59,130,246,0.12)' }} />
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h2
          className="mb-6 font-semibold leading-[1.05] tracking-tight text-gray-950"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(34px, 5vw, 64px)' }}
        >
          Tu clínica, lista<br />
          desde hoy<span style={{ color: '#3b82f6' }}>.</span>
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-gray-500">
          Sin papeles, sin demoras. Únete a las clínicas de LatAm que ya digitalizaron su operación completa.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2.5 rounded-full px-10 py-4 text-base font-bold uppercase transition hover:brightness-110 hover:scale-[1.03]"
          style={{ background: '#3b82f6', color: '#ffffff', fontFamily: "'Inter', sans-serif" }}
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
          <BarChart3 className="h-4 w-4" style={{ color: 'rgba(59,130,246,0.4)' }} />
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
      <Hero />

      {/* ContainerScroll product showcase */}
      <div className="flex flex-col overflow-hidden bg-white">
        <ContainerScroll
          titleComponent={
            <h2 className="text-4xl font-semibold tracking-tight text-gray-950">
              Potencia tu clínica con <br />
              <span className="mt-1 block text-5xl font-semibold leading-none tracking-tight text-blue-600 md:text-[5rem]">
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
