import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope, Brain, Monitor, Receipt, ChevronDown,
  ArrowRight, Sparkles, Zap, CheckCircle2, BarChart3,
  ShieldCheck, Globe, CalendarCheck, FileImage, Menu, X,
} from 'lucide-react';
import { ContainerScroll } from '../components/ui/container-scroll-animation';
import { ModernFeatures } from '../components/ui/modern-features';
import { SpecialistsCarousel } from '../components/ui/specialists-carousel';

/* ═══════════════════════════════════════════════════════════════════════════════
   LandingPage — Enterprise Redesign (Edenmed Layout Reference)
   
   ARCHITECTURE:
   - Route '/' renders this component OUTSIDE any layout (no sidebar)
   - Full-screen: w-full min-h-screen bg-slate-50
   - Fixed top navbar with liquid-glass + hierarchical dropdowns
   - Hero + glassmorphism browser mockup + interactive product tabs
   
   AESTHETIC RULES:
   - Background: light slate-50
   - Accents: ONLY purple (#7A22FF) and violet (#5B27B5) densities
   - ZERO green anywhere
   - Typography: Geist (loaded globally)
   - No "Demo" button. Single "Iniciar Sesión" CTA in navbar
   - Avatars: clean, modern, no facial hair
═══════════════════════════════════════════════════════════════════════════════ */


/* ── Dropdown Data ─────────────────────────────────────────────────────────── */
const SOLUCIONES_COL1 = [
  { label: 'Radiología', href: '/soluciones/radiologia', icon: '🫁' },
  { label: 'Dental', href: '/soluciones/dental', icon: '🦷' },
  { label: 'Cirugía', href: '/soluciones/cirugia', icon: '🔬' },
  { label: 'Cardiología', href: '/soluciones/cardiologia', icon: '❤️' },
  { label: 'Neumología', href: '/soluciones/neumologia', icon: '🌬️' },
  { label: 'Audiometría', href: '/soluciones/audiometria', icon: '👂' },
];
const SOLUCIONES_COL2 = [
  { label: 'Patología', href: '/soluciones/patologia', icon: '🧬' },
  { label: 'Obstétrico', href: '/soluciones/obstetrico', icon: '🤱' },
  { label: 'Colposcopia', href: '/soluciones/colposcopia', icon: '🔎' },
  { label: 'Oftalmología', href: '/soluciones/oftalmologia', icon: '👁️' },
  { label: 'Veterinaria', href: '/soluciones/veterinaria', icon: '🐾' },
  { label: 'Teleradiología', href: '/soluciones/teleradiologia', icon: '🌐', highlight: true },
];

const FUNCIONALIDADES_BLOCKS = [
  { title: 'Tecnología Avanzada', items: [
    { label: 'IA Asistente', href: '/funcionalidades/tecnologia/ia-asistente' },
    { label: 'Visor DICOM', href: '/funcionalidades/tecnologia/visor-dicom' },
    { label: 'Envío de resultados', href: '/funcionalidades/tecnologia/envio-resultados' },
    { label: 'Compatibilidad total', href: '/funcionalidades/tecnologia/compatibilidad-total' },
  ]},
  { title: 'Gestión Integral', items: [
    { label: 'Almacenamiento seguro', href: '/funcionalidades/gestion/almacenamiento-seguro' },
    { label: 'Gestión de estudios', href: '/funcionalidades/gestion/estudios' },
    { label: 'Citas y agendas', href: '/funcionalidades/gestion/citas-agendas' },
    { label: 'Facturación y cobros', href: '/funcionalidades/gestion/facturacion-cobros' },
  ]},
  { title: 'Fácil de Usar', items: [
    { label: 'Portal pacientes', href: '/funcionalidades/facil-uso/portal-pacientes' },
    { label: 'Portal médicos', href: '/funcionalidades/facil-uso/portal-medicos' },
    { label: 'Recordatorios de citas', href: '/funcionalidades/facil-uso/recordatorios-citas' },
  ]},
  { title: 'Personalizado', items: [
    { label: 'Adaptación total', href: '/funcionalidades/personalizado/adaptacion-total' },
    { label: 'Integraciones', href: '/funcionalidades/personalizado/integraciones' },
    { label: 'Modelo de precios', href: '/funcionalidades/personalizado/modelo-precios' },
  ]},
];


/* ── Product Tabs Data ─────────────────────────────────────────────────────── */
const PRODUCT_TABS = [
  { id: 'pacs', label: 'Visor PACS', icon: <Monitor className="h-4 w-4" />,
    headline: 'Visor DICOM nativo en la nube',
    desc: 'Visualiza y analiza estudios CT, MRI, DX y US directamente en tu navegador. Sin plugins, sin instalaciones.',
    points: ['Soporte CT · MR · DX · CR · US · ECG', 'Ajuste WW/WL con presets radiológicos', 'Herramientas de medición y anotación', 'Compatible con PACS y worklists RIS'] },
  { id: 'billing', label: 'Gestión y Cobros', icon: <Receipt className="h-4 w-4" />,
    headline: 'Administración financiera multidivisa',
    desc: 'Emite facturas electrónicas en MXN, BRL, ARS, COP, CLP y 6 monedas más. Dashboard financiero con KPIs en tiempo real.',
    points: ['Facturación CFDI 4.0 (MX), NFS-e (BR)', '11 monedas LatAm soportadas', 'Dashboard: ingresos, cobros, vencidas', 'Citas y agendas integradas'] },
  { id: 'ai', label: 'Copiloto IA', icon: <Brain className="h-4 w-4" />,
    headline: 'Iris — tu asistente clínico inteligente',
    desc: 'Dicta hallazgos por voz, genera impresiones diagnósticas estructuradas y exporta reportes PDF firmados.',
    points: ['Dictado de voz con SpeechRecognition nativo', 'Generación de informes radiológicos', 'Exportación PDF profesional (jsPDF)', 'Diagnósticos diferenciales sugeridos'] },
];

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


/* ═══════════════════════════════════════════════════════════════════════════════
   NAVBAR — Fixed top, liquid-glass, Edenmed-style hierarchical dropdowns
═══════════════════════════════════════════════════════════════════════════════ */
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${scrolled ? 'bg-white/80 shadow-[0_4px_32px_-8px_rgba(122,34,255,0.08)]' : 'bg-white/60'}`}
      style={{ backdropFilter: 'blur(24px) saturate(1.8)', WebkitBackdropFilter: 'blur(24px) saturate(1.8)' }}>
      <div className="h-px bg-gradient-to-r from-transparent via-[#7A22FF]/40 to-transparent" />
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">

        {/* ── Logo (Left) ── */}
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl
                          bg-gradient-to-br from-[#7A22FF] to-[#5B27B5]
                          shadow-[0_0_20px_-4px_rgba(122,34,255,0.8)]
                          transition group-hover:shadow-[0_0_32px_-2px_rgba(122,34,255,1)]">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            MediCo<span className="text-[#9450FF]"> LatAm</span>
          </span>
        </Link>

        {/* ── Center Navigation (Desktop) ── */}
        <nav className="hidden items-center gap-1 lg:flex">
          <SolucionesDropdown />
          <FuncionalidadesDropdown />
          <Link to="/productos" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-900">Productos</Link>
          <Link to="/nosotros" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-900">Nosotros</Link>
        </nav>

        {/* ── Right CTA (Desktop) ── */}
        <div className="hidden lg:flex">
          <Link to="/login"
            className="rounded-xl border border-[#7A22FF]/50 bg-[#7A22FF]/10
                       px-6 py-2.5 text-sm font-semibold text-white
                       shadow-[0_0_24px_-6px_rgba(122,34,255,0.5)]
                       transition hover:bg-[#7A22FF]/20 hover:shadow-[0_0_32px_-4px_rgba(122,34,255,0.7)]">
            Iniciar Sesión
          </Link>
        </div>

        {/* ── Mobile hamburger ── */}
        <button type="button" onClick={() => setMobileOpen(v => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-xl
                     border border-slate-200 text-slate-700 lg:hidden" aria-label="Menú">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      <div className={`overflow-hidden transition-all duration-300 lg:hidden
                       ${mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="space-y-1 border-t border-slate-200 bg-white/95 px-5 pb-6 pt-4 backdrop-blur-xl">
          <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#9450FF]">Soluciones</p>
          {[...SOLUCIONES_COL1, ...SOLUCIONES_COL2].slice(0, 6).map(s => (
            <Link key={s.href} to={s.href} onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-4 py-2 text-sm text-slate-700 hover:text-slate-900">{s.label}</Link>
          ))}
          <p className="mt-3 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#9450FF]">Funcionalidades</p>
          {FUNCIONALIDADES_BLOCKS.slice(0, 2).flatMap(b => b.items).slice(0, 4).map(f => (
            <Link key={f.href} to={f.href} onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-4 py-2 text-sm text-slate-700 hover:text-slate-900">{f.label}</Link>
          ))}
          <div className="my-3 h-px bg-slate-200" />
          <Link to="/login" onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 rounded-xl
                       bg-gradient-to-r from-[#7A22FF] to-[#5B27B5]
                       px-4 py-3 text-sm font-semibold text-white">Iniciar Sesión</Link>
        </div>
      </div>
    </header>
  );
}


/* ── Soluciones Mega-Dropdown (2-column grid, hover-triggered) ── */
function SolucionesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} className="relative"
         onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-900">
        Soluciones <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 transition-all duration-200
        ${open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'}`}>
        <div className="w-[520px] rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-2xl p-5
                        shadow-[0_24px_64px_-12px_rgba(0,0,0,0.08),0_0_0_1px_rgba(122,34,255,0.08)]">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#9450FF]">11 Especialidades Clínicas</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <div className="space-y-0.5">
              {SOLUCIONES_COL1.map(s => (
                <Link key={s.href} to={s.href} onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700
                             transition hover:bg-[#7A22FF]/10 hover:text-slate-900">
                  <span className="text-base">{s.icon}</span>{s.label}
                </Link>
              ))}
            </div>
            <div className="space-y-0.5">
              {SOLUCIONES_COL2.map(s => (
                <Link key={s.href} to={s.href} onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition hover:bg-[#7A22FF]/10 hover:text-slate-900 ${s.highlight ? 'text-[#CFA8FF] font-semibold border border-[#7A22FF]/20 bg-[#7A22FF]/5' : 'text-slate-700'}`}>
                  <span className="text-base">{s.icon}</span>{s.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ── Funcionalidades Mega-Dropdown (corporate blocks) ── */
function FuncionalidadesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} className="relative"
         onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-900">
        Funcionalidades <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 transition-all duration-200
        ${open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'}`}>
        <div className="w-[600px] rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-2xl p-5
                        shadow-[0_24px_64px_-12px_rgba(0,0,0,0.08),0_0_0_1px_rgba(122,34,255,0.08)]">
          <div className="grid grid-cols-2 gap-6">
            {FUNCIONALIDADES_BLOCKS.map(block => (
              <div key={block.title}>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#9450FF]">{block.title}</p>
                <div className="space-y-0.5">
                  {block.items.map(item => (
                    <Link key={item.href} to={item.href} onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-1.5 text-sm text-slate-700
                                 transition hover:bg-[#7A22FF]/10 hover:text-slate-900">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════════
   HERO — Centered title + "Comenzar" CTA + glassmorphism browser mockup
═══════════════════════════════════════════════════════════════════════════════ */
function Hero() {
  return (
   <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-28 pb-16">
      {/* Background Video */}
   <video 
  src="https://res.cloudinary.com/dwgcidtkp/video/upload/v1779308888/mp__tyrat4.mp4" 
  autoPlay 
  muted 
  loop 
  playsInline
  className="absolute inset-0 w-full h-full object-cover z-0"
  style={{ pointerEvents: 'none' }}
/>
  
      <div className="relative z-20 mb-6 inline-flex items-center gap-2 rounded-full border border-[#7A22FF]/40 bg-[#7A22FF]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#CFA8FF]">
        <Sparkles className="h-3.5 w-3.5" /> RIS/PACS en la nube para LatAm
      </div>

      import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const ContainerTextFlip = ({ words, className }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <span className={`inline-block relative ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="inline-block absolute left-0 top-0 whitespace-nowrap"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
      <span className="opacity-0 pointer-events-none whitespace-nowrap">
        {/* Invisible span to maintain width based on the longest word */}
        {words.reduce((a, b) => (a.length > b.length ? a : b))}
      </span>
    </span>
  );
};

      <p className="relative z-20 mb-10 max-w-2xl text-center text-lg leading-relaxed text-slate-500">
        Gestiona estudios DICOM, pacientes y cobros multidivisa desde un solo sistema diseñado para clínicas y hospitales de Latinoamérica.
      </p>

      <Link to="/login"
        className="relative z-20 mb-20 inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#7A22FF] to-[#5B27B5]
                   px-10 py-4 text-base font-semibold text-white
                   shadow-[0_8px_40px_-8px_rgba(122,34,255,0.7)]
                   transition hover:brightness-110 hover:scale-[1.02] active:scale-[0.97]">
        <Zap className="h-5 w-5" /> Comenzar
      </Link>

      
    </section>
  );
}


/* ── Browser Mockup (glassmorphism window simulating DICOM viewer) ── */
function BrowserMockup() {
  return (
    <div className="w-full max-w-6xl">
      <div className="rounded-2xl border border-slate-200 bg-white backdrop-blur-xl
                      shadow-[0_32px_80px_-16px_rgba(0,0,0,0.08),0_0_0_1px_rgba(122,34,255,0.1)] overflow-hidden">
        <div className="flex h-10 items-center gap-2.5 border-b border-slate-200 bg-slate-100 px-4">
          <div className="h-3 w-3 rounded-full bg-[#7A22FF]/60" />
          <div className="h-3 w-3 rounded-full bg-[#5B27B5]/50" />
          <div className="h-3 w-3 rounded-full bg-[#9450FF]/40" />
          <div className="mx-auto flex h-6 w-64 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3">
            <div className="h-2 w-2 rounded-full bg-[#7A22FF]/50" />
            <span className="text-[11px] font-mono text-slate-400">app.medicolatam.com/visor</span>
          </div>
        </div>
        <div className="relative flex h-[400px] overflow-hidden sm:h-[480px]">
          {/* Series panel */}
          <div className="hidden w-36 shrink-0 border-r border-slate-200 bg-black/50 p-3 sm:block">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-[#7A22FF]">Series</p>
            {['TC Tórax Axial', 'TC Tórax Coronal', 'Rx PA'].map((s, i) => (
              <div key={s} className={`mb-1.5 rounded-lg p-2 text-[10px] text-slate-500
                ${i === 0 ? 'border border-[#7A22FF]/40 bg-[#7A22FF]/12 text-slate-700' : ''}`}>
                <div className="mb-1 h-12 w-full rounded bg-black/70" />
                <p className="truncate">{s}</p>
              </div>
            ))}
          </div>
          {/* DICOM viewport */}
          <div className="relative flex flex-1 items-center justify-center bg-black">
            <svg viewBox="0 0 512 400" className="w-full max-h-full" aria-hidden>
              <rect width="512" height="400" fill="#000" />
              <ellipse cx="256" cy="200" rx="175" ry="140" fill="#0d0d0d" />
              <ellipse cx="256" cy="200" rx="150" ry="120" fill="#161616" />
              <ellipse cx="198" cy="195" rx="62" ry="85" fill="#080808" />
              <ellipse cx="316" cy="195" rx="65" ry="85" fill="#080808" />
              <ellipse cx="256" cy="210" rx="40" ry="48" fill="#222" />
              <line x1="256" y1="110" x2="256" y2="290" stroke="rgba(122,34,255,0.3)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="160" y1="200" x2="352" y2="200" stroke="rgba(122,34,255,0.3)" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
            <div className="pointer-events-none absolute left-3 top-3 font-mono text-[9px] text-slate-400">
              <p>PACIENTE: Demo · García</p><p>CT · Axial</p>
            </div>
            <div className="pointer-events-none absolute right-3 top-3 text-right font-mono text-[9px] text-slate-400">
              <p>WW/WL: 400/40</p><p>IMG: 24/48</p>
            </div>
          </div>
          {/* Copilot panel */}
          <div className="hidden w-52 shrink-0 border-l border-slate-200 bg-[#050010]/80 sm:flex sm:flex-col">
            <div className="flex items-center gap-2 bg-gradient-to-r from-[#7A22FF] to-[#5B27B5] px-3 py-2.5">
              <div className="h-6 w-6 rounded-full bg-white/15" />
              <p className="text-[11px] font-semibold text-white">Iris · IA</p>
              <div className="ml-auto h-2 w-2 animate-pulse rounded-full bg-[#CFA8FF]" />
            </div>
            <div className="flex-1 space-y-2 p-3">
              <div className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] text-slate-500">Analizando TC de tórax…</div>
              <div className="ml-2 rounded-lg border border-[#7A22FF]/25 bg-[#7A22FF]/8 px-2.5 py-1.5 text-[10px] text-slate-500">Parénquima sin consolidaciones. CTR normal.</div>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden className="pointer-events-none mx-auto mt-0 h-14 w-2/3 bg-[#7A22FF]/12 blur-2xl rounded-full -translate-y-4" />
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════════
   PRODUCT TABS — Interactive horizontal selector
═══════════════════════════════════════════════════════════════════════════════ */
function ProductTabs() {
  const [active, setActive] = useState('pacs');
  const tab = PRODUCT_TABS.find(t => t.id === active);
  return (
    <section className="relative py-28 px-4 sm:px-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#7A22FF]/30 bg-[#7A22FF]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#9450FF]">
            <Sparkles className="h-3 w-3" /> Plataforma modular
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Todo lo que tu clínica<span className="bg-gradient-to-r from-[#7A22FF] to-[#CFA8FF] bg-clip-text text-transparent"> necesita</span>
          </h2>
        </div>
        {/* Tab selector */}
        <div className="mb-12 flex flex-wrap justify-center gap-2">
          {PRODUCT_TABS.map(t => (
            <button key={t.id} type="button" onClick={() => setActive(t.id)}
              className={`flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition
                ${active === t.id
                  ? 'border-[#7A22FF]/60 bg-[#7A22FF]/20 text-white shadow-[0_0_24px_-6px_rgba(122,34,255,0.6)]'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-[#7A22FF]/30 hover:text-slate-700'}`}>
              <span className={active === t.id ? 'text-[#CFA8FF]' : ''}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
        {/* Tab content */}
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h3 className="mb-4 text-3xl font-bold text-slate-900 leading-tight">{tab.headline}</h3>
            <p className="mb-8 text-base leading-relaxed text-slate-500">{tab.desc}</p>
            <ul className="space-y-3">
              {tab.points.map(pt => (
                <li key={pt} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#9450FF]" />
                  <span className="text-sm text-slate-600">{pt}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Link to="/login" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7A22FF] to-[#5B27B5] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_24px_-6px_rgba(122,34,255,0.6)] transition hover:brightness-110">
                Comenzar ahora <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] ring-1 ring-[#7A22FF]/8">
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
      <div className="flex items-center gap-2 mb-3"><Monitor className="h-5 w-5 text-[#7A22FF]" /><span className="text-sm font-semibold text-slate-900">Visor DICOM</span>
        <span className="ml-auto rounded-full border border-[#7A22FF]/30 bg-[#7A22FF]/10 px-2 py-0.5 text-[10px] font-bold text-[#9450FF]">CT</span></div>
      <div className="overflow-hidden rounded-xl bg-black h-48 flex items-center justify-center">
        <svg viewBox="0 0 256 180" className="w-full max-h-full opacity-60" aria-hidden>
          <rect width="256" height="180" fill="#000" /><ellipse cx="128" cy="90" rx="90" ry="70" fill="#111" />
          <ellipse cx="100" cy="88" rx="32" ry="42" fill="#080808" /><ellipse cx="158" cy="88" rx="34" ry="42" fill="#080808" />
        </svg>
      </div>
      <div className="flex gap-2">{['Pulmón','Hueso','Tejido','Cerebro'].map(p => (
        <div key={p} className="flex-1 rounded-lg border border-slate-200 bg-slate-50 py-1.5 text-center text-[10px] font-medium text-slate-500">{p}</div>
      ))}</div>
    </div>
  );
  if (tabId === 'billing') return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2"><Receipt className="h-5 w-5 text-[#5B27B5]" /><span className="text-sm font-semibold text-slate-900">Dashboard Financiero</span></div>
      {[{ label: 'Ingresos del mes', val: '$124,500 MXN', pct: 78, c: '#7A22FF' },
        { label: 'Cuentas por cobrar', val: '$38,200 MXN', pct: 45, c: '#5B27B5' },
        { label: 'Facturas emitidas', val: '142', pct: 90, c: '#9450FF' }].map(r => (
        <div key={r.label} className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-1.5 flex items-center justify-between"><p className="text-xs text-slate-500">{r.label}</p><p className="text-sm font-bold text-slate-900">{r.val}</p></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.c }} /></div>
        </div>
      ))}
    </div>
  );
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3"><Brain className="h-5 w-5 text-[#9450FF]" /><span className="text-sm font-semibold text-slate-900">Copiloto Iris</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-[#9450FF]/40 bg-[#9450FF]/10 px-2 py-0.5 text-[10px] font-semibold text-[#CFA8FF]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9450FF]" /> Online</span></div>
      {[{ who: 'iris', text: 'Listo para analizar estudios y dictar informes.' },
        { who: 'user', text: 'Genera impresión diagnóstica del TC de tórax.' },
        { who: 'iris', text: 'TC de tórax normal. Sin consolidaciones ni derrame.' },
        { who: 'user', text: 'Exporta en PDF con firma.' },
        { who: 'iris', text: 'PDF generado: reporte_garcia_2026.pdf' }].map((m, i) => (
        <div key={i} className={`rounded-xl px-3 py-2 text-[11px] leading-relaxed
          ${m.who === 'iris' ? 'bg-slate-100 text-slate-500' : 'ml-5 border border-[#7A22FF]/25 bg-[#7A22FF]/8 text-slate-700'}`}>{m.text}</div>
      ))}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════════
   TELERADIOLOGY NETWORK — 3-step flow (Carga → Asignación → Dictado IA)
═══════════════════════════════════════════════════════════════════════════════ */
function TeleradiologySection() {
  const steps = [
    {
      step: '01',
      title: 'Carga Segura',
      desc: 'La clínica local sube el estudio DICOM al sistema en la nube. Encriptación end-to-end, cumplimiento HIPAA/LGPD.',
      icon: '☁️',
    },
    {
      step: '02',
      title: 'Asignación Inteligente',
      desc: 'El sistema notifica a la red nacional de especialistas y subespecialistas según la prioridad y modalidad del caso.',
      icon: '🧠',
    },
    {
      step: '03',
      title: 'Dictado e Impresión IA',
      desc: 'El especialista remoto analiza la imagen, usa el Copiloto IA para dictado por voz y emite el informe firmado digitalmente con código QR.',
      icon: '✍️',
    },
  ];

  return (
    <section className="relative py-28 px-4 sm:px-8 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5B27B5] opacity-[0.04] blur-[180px]" />
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#7A22FF]/40 bg-[#7A22FF]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#CFA8FF]">
            <span className="text-sm">🌐</span> Red Nacional de Diagnóstico
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Teleradiología:{' '}
            <span className="bg-gradient-to-r from-[#7A22FF] to-[#CFA8FF] bg-clip-text text-transparent">
              diagnóstico remoto
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-500">
            Conecta tu clínica con una red de radiólogos certificados en todo LatAm.
            Estudios leídos en menos de 2 horas con firma digital y trazabilidad completa.
          </p>
        </div>

        {/* 3-Step Flow */}
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.step}
              className="group relative rounded-2xl border border-slate-200 bg-white p-7 backdrop-blur-sm
                         transition hover:border-[#7A22FF]/30 hover:bg-[#7A22FF]/[0.03]
                         hover:shadow-[0_0_40px_-8px_rgba(122,34,255,0.2)]">
              {/* Step number */}
              <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-lg
                              bg-[#7A22FF]/15 text-xs font-bold text-[#CFA8FF] ring-1 ring-[#7A22FF]/25">
                {s.step}
              </div>
              {/* Icon */}
              <div className="mb-3 text-3xl">{s.icon}</div>
              {/* Content */}
              <h3 className="mb-2 text-lg font-semibold text-slate-900">{s.title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{s.desc}</p>
              {/* Connector line (hidden on last) */}
              {s.step !== '03' && (
                <div aria-hidden className="pointer-events-none absolute right-0 top-1/2 hidden h-px w-6 -translate-y-1/2 translate-x-full bg-gradient-to-r from-[#7A22FF]/40 to-transparent md:block" />
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a href="/soluciones/teleradiologia"
            className="inline-flex items-center gap-2 rounded-xl border border-[#7A22FF]/50 bg-[#7A22FF]/10
                       px-6 py-3 text-sm font-semibold text-white
                       shadow-[0_0_24px_-6px_rgba(122,34,255,0.4)]
                       transition hover:bg-[#7A22FF]/20 hover:shadow-[0_0_32px_-4px_rgba(122,34,255,0.6)]">
            Conocer la Red de Teleradiología
            <span className="text-[#CFA8FF]">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════════
   FEATURES — Glassmorphism cards grid
═══════════════════════════════════════════════════════════════════════════════ */
function FeaturesSection() {
  return (
    <section className="relative py-24 px-4 sm:px-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Diseñado para<span className="bg-gradient-to-r from-[#7A22FF] to-[#CFA8FF] bg-clip-text text-transparent"> la práctica clínica real</span>
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(f => (
            <div key={f.title} className="group rounded-2xl border border-slate-200 bg-white p-6 backdrop-blur-sm transition
                         hover:border-[#7A22FF]/30 hover:bg-[#7A22FF]/[0.03] hover:shadow-[0_0_36px_-8px_rgba(122,34,255,0.2)]">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-[#9450FF]
                              ring-1 ring-[#7A22FF]/15 transition group-hover:scale-110 group-hover:ring-[#7A22FF]/50">{f.icon}</div>
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
            <div key={s.label} className={`flex flex-col items-center justify-center py-10 bg-white ${i < STATS.length - 1 ? 'border-r border-slate-200' : ''}`}>
              <span className="mb-1 bg-gradient-to-r from-[#7A22FF] to-[#CFA8FF] bg-clip-text text-4xl font-bold text-transparent tracking-tight">{s.value}</span>
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
    <section className="relative overflow-hidden py-28 px-4 sm:px-8">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7A22FF] opacity-[0.07] blur-[180px]" />
      <div className="relative z-10 mx-auto max-w-4xl overflow-hidden rounded-3xl border border-[#7A22FF]/20 bg-white p-14 text-center backdrop-blur-sm shadow-[0_0_80px_-20px_rgba(122,34,255,0.2)]">
        <h2 className="mb-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Tu clínica, potenciada<br /><span className="bg-gradient-to-r from-[#7A22FF] to-[#CFA8FF] bg-clip-text text-transparent">con IA desde el primer día.</span>
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-lg text-slate-500">Sin papeles, sin demoras. Únete a las clínicas de LatAm que ya digitalizaron su operación completa.</p>
        <Link to="/login" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#7A22FF] to-[#5B27B5] px-8 py-4 text-base font-semibold text-white shadow-[0_8px_40px_-8px_rgba(122,34,255,0.7)] transition hover:brightness-110 hover:scale-[1.02]">
          <ArrowRight className="h-5 w-5" /> Comenzar
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 py-8 px-4 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-slate-400">© {new Date().getFullYear()} MediCo LatAm · Plataforma clínica regional</p>
        <div className="flex items-center gap-3 text-slate-400">
          <BarChart3 className="h-4 w-4 text-[#7A22FF]/40" />
          <span className="text-sm">Enterprise Edition · v3.0</span>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN EXPORT — Full-screen independent component (no layout wrapper)
═══════════════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900" style={{ fontFamily: 'Geist, Inter, system-ui, sans-serif' }}>
      <Navbar />
      <Hero />
      {/* --- SECCIÓN DE ANIMACIÓN SCROLL --- */}
      <div className="flex flex-col overflow-hidden bg-white">
        <ContainerScroll
          titleComponent={
            <>
              <h2 className="text-4xl font-semibold text-slate-900">
                Potencia tu clínica con <br />
                <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none text-[#7A22FF]">
                  Gestión Inteligente
                </span>
              </h2>
            </>
          }
        >
         <video 
  src="https://res.cloudinary.com/dwgcidtkp/video/upload/v1779383703/creame_un_radiologia_en_video_fbgndm.mp4" 
  autoPlay 
  muted 
  loop 
  playsInline
  className="w-full h-full object-cover rounded-xl"
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
