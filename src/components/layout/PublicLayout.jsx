import { useState, useRef, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import {
  Stethoscope, ChevronDown, Menu, X,
} from 'lucide-react';

/**
 * PublicLayout — Layout público sin sidebar.
 *
 * Contiene ÚNICAMENTE:
 *   - Navbar superior fixed liquid-glass (idéntico al de LandingPage)
 *   - <Outlet /> para renderizar las rutas hijas
 *
 * SIN barra lateral izquierda. SIN copiloto. SIN header interno.
 * Fondo: bg-black. Acentos: solo púrpura/violeta.
 */

/* ── Dropdown Data ── */
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
];

const FUNCIONALIDADES_BLOCKS = [
  { title: 'Tecnología Avanzada', items: [
    { label: 'IA Asistente', href: '/funcionalidades/tecnologia/ia-asistente' },
    { label: 'Visor DICOM', href: '/funcionalidades/tecnologia/visor-dicom' },
    { label: 'Envío de resultados', href: '/funcionalidades/tecnologia/envio-resultados' },
  ]},
  { title: 'Gestión Integral', items: [
    { label: 'Almacenamiento seguro', href: '/funcionalidades/gestion/almacenamiento-seguro' },
    { label: 'Citas y agendas', href: '/funcionalidades/gestion/citas-agendas' },
    { label: 'Facturación y cobros', href: '/funcionalidades/gestion/facturacion-cobros' },
  ]},
];


/* ── Mega-Dropdown: Soluciones ── */
function SolucionesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white/60 transition hover:text-white">
        Soluciones <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 transition-all duration-200
        ${open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'}`}>
        <div className="w-[520px] rounded-2xl border border-white/[0.08] bg-black/95 backdrop-blur-2xl p-5
                        shadow-[0_24px_64px_-12px_rgba(0,0,0,0.9),0_0_0_1px_rgba(122,34,255,0.08)]">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#9450FF]">11 Especialidades Clínicas</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <div className="space-y-0.5">
              {SOLUCIONES_COL1.map(s => (
                <Link key={s.href} to={s.href} onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-[#7A22FF]/10 hover:text-white">
                  <span className="text-base">{s.icon}</span>{s.label}
                </Link>
              ))}
            </div>
            <div className="space-y-0.5">
              {SOLUCIONES_COL2.map(s => (
                <Link key={s.href} to={s.href} onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-[#7A22FF]/10 hover:text-white">
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

/* ── Mega-Dropdown: Funcionalidades ── */
function FuncionalidadesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white/60 transition hover:text-white">
        Funcionalidades <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 transition-all duration-200
        ${open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'}`}>
        <div className="w-[480px] rounded-2xl border border-white/[0.08] bg-black/95 backdrop-blur-2xl p-5
                        shadow-[0_24px_64px_-12px_rgba(0,0,0,0.9),0_0_0_1px_rgba(122,34,255,0.08)]">
          <div className="grid grid-cols-2 gap-6">
            {FUNCIONALIDADES_BLOCKS.map(block => (
              <div key={block.title}>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#9450FF]">{block.title}</p>
                <div className="space-y-0.5">
                  {block.items.map(item => (
                    <Link key={item.href} to={item.href} onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-1.5 text-sm text-white/70 transition hover:bg-[#7A22FF]/10 hover:text-white">
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
   PUBLIC LAYOUT — Navbar superior + Outlet (CERO sidebar)
═══════════════════════════════════════════════════════════════════════════════ */
export default function PublicLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div className="w-full min-h-screen bg-black text-white" style={{ fontFamily: 'Geist, Inter, system-ui, sans-serif' }}>
      {/* ── Navbar Fixed Top ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${scrolled ? 'bg-black/70 shadow-[0_4px_32px_-8px_rgba(122,34,255,0.12)]' : 'bg-black/30'}`}
        style={{ backdropFilter: 'blur(24px) saturate(1.8)', WebkitBackdropFilter: 'blur(24px) saturate(1.8)' }}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-[#7A22FF]/40 to-transparent" />
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">

          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl
                            bg-gradient-to-br from-[#7A22FF] to-[#5B27B5]
                            shadow-[0_0_20px_-4px_rgba(122,34,255,0.8)]
                            transition group-hover:shadow-[0_0_32px_-2px_rgba(122,34,255,1)]">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              MediCo<span className="text-[#9450FF]"> LatAm</span>
            </span>
          </Link>

          {/* Center nav (desktop) */}
          <nav className="hidden items-center gap-1 lg:flex">
            <SolucionesDropdown />
            <FuncionalidadesDropdown />
            <Link to="/productos" className="rounded-lg px-4 py-2 text-sm font-medium text-white/60 transition hover:text-white">Productos</Link>
            <Link to="/nosotros" className="rounded-lg px-4 py-2 text-sm font-medium text-white/60 transition hover:text-white">Nosotros</Link>
          </nav>

          {/* Right CTA */}
          <div className="hidden lg:flex">
            <Link to="/login"
              className="rounded-xl border border-[#7A22FF]/50 bg-[#7A22FF]/10
                         px-6 py-2.5 text-sm font-semibold text-white
                         shadow-[0_0_24px_-6px_rgba(122,34,255,0.5)]
                         transition hover:bg-[#7A22FF]/20 hover:shadow-[0_0_32px_-4px_rgba(122,34,255,0.7)]">
              Iniciar Sesión
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button type="button" onClick={() => setMobileOpen(v => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] text-white/70 lg:hidden" aria-label="Menú">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`overflow-hidden transition-all duration-300 lg:hidden
                         ${mobileOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="space-y-1 border-t border-white/[0.06] bg-black/95 px-5 pb-6 pt-4 backdrop-blur-xl">
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#9450FF]">Soluciones</p>
            {[...SOLUCIONES_COL1, ...SOLUCIONES_COL2].slice(0, 6).map(s => (
              <Link key={s.href} to={s.href} onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-4 py-2 text-sm text-white/70 hover:text-white">{s.label}</Link>
            ))}
            <div className="my-3 h-px bg-white/[0.06]" />
            <Link to="/login" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7A22FF] to-[#5B27B5] px-4 py-3 text-sm font-semibold text-white">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </header>

      {/* ── Page Content (no sidebar, full width) ── */}
      <main className="pt-[72px]">
        <Outlet />
      </main>
    </div>
  );
}
