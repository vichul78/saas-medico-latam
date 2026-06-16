import { useState, useRef, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';

/**
 * PublicLayout — Navbar Apple-style + Outlet.
 * Paleta: blanco, gris, azul #3b82f6. Sin violeta/morado.
 */

const SOLUCIONES_COL1 = [
  { label: 'Radiología',   href: '/soluciones/radiologia',  icon: '🫁' },
  { label: 'Dental',       href: '/soluciones/dental',       icon: '🦷' },
  { label: 'Cirugía',      href: '/soluciones/cirugia',      icon: '🔬' },
  { label: 'Cardiología',  href: '/soluciones/cardiologia',  icon: '❤️' },
  { label: 'Neumología',   href: '/soluciones/neumologia',   icon: '🌬️' },
  { label: 'Audiometría',  href: '/soluciones/audiometria',  icon: '👂' },
];
const SOLUCIONES_COL2 = [
  { label: 'Patología',      href: '/soluciones/patologia',      icon: '🧬' },
  { label: 'Obstétrico',     href: '/soluciones/obstetrico',     icon: '🤱' },
  { label: 'Colposcopia',    href: '/soluciones/colposcopia',    icon: '🔎' },
  { label: 'Oftalmología',   href: '/soluciones/oftalmologia',   icon: '👁️' },
  { label: 'Veterinaria',    href: '/soluciones/veterinaria',    icon: '🐾' },
  { label: 'Teleradiología', href: '/soluciones/teleradiologia', icon: '🌐', highlight: true },
];
const FUNCIONALIDADES_BLOCKS = [
  { title: 'Tecnología Avanzada', items: [
    { label: 'IA Asistente',        href: '/funcionalidades/tecnologia/ia-asistente' },
    { label: 'Visor DICOM',         href: '/funcionalidades/tecnologia/visor-dicom' },
    { label: 'Envío de resultados', href: '/funcionalidades/tecnologia/envio-resultados' },
  ]},
  { title: 'Gestión Integral', items: [
    { label: 'Almacenamiento seguro', href: '/funcionalidades/gestion/almacenamiento-seguro' },
    { label: 'Citas y agendas',       href: '/funcionalidades/gestion/citas-agendas' },
    { label: 'Facturación y cobros',  href: '/funcionalidades/gestion/facturacion-cobros' },
  ]},
];

/* ── Dropdown Soluciones ── */
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
        className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:text-blue-600">
        Soluciones <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 transition-all duration-200
        ${open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'}`}>
        <div className="w-[520px] rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-2xl p-5 shadow-2xl shadow-gray-300/40">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-blue-600">11 Especialidades Clínicas</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <div className="space-y-0.5">
              {SOLUCIONES_COL1.map(s => (
                <Link key={s.href} to={s.href} onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-700">
                  <span>{s.icon}</span>{s.label}
                </Link>
              ))}
            </div>
            <div className="space-y-0.5">
              {SOLUCIONES_COL2.map(s => (
                <Link key={s.href} to={s.href} onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition hover:bg-blue-50 hover:text-blue-700
                    ${s.highlight ? 'font-semibold text-blue-600 border border-blue-100 bg-blue-50/60' : 'text-gray-700'}`}>
                  <span>{s.icon}</span>{s.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Dropdown Funcionalidades ── */
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
        className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:text-blue-600">
        Funcionalidades <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 transition-all duration-200
        ${open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'}`}>
        <div className="w-[440px] rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-2xl p-5 shadow-2xl shadow-gray-300/40">
          <div className="grid grid-cols-2 gap-6">
            {FUNCIONALIDADES_BLOCKS.map(block => (
              <div key={block.title}>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-blue-600">{block.title}</p>
                <div className="space-y-0.5">
                  {block.items.map(item => (
                    <Link key={item.href} to={item.href} onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-1.5 text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-700">
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

/* ── PublicLayout ── */
export default function PublicLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div className="w-full min-h-screen bg-white text-gray-950" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Navbar ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${scrolled ? 'bg-white/90 shadow-sm shadow-gray-200/60' : 'bg-white/70'}`}
        style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        {/* línea de acento sutil arriba */}
        <div className="h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent" />

        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 lg:px-8">

          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600
                            shadow-md shadow-blue-500/20 transition group-hover:shadow-blue-500/40">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight text-gray-950">
              MediCo<span className="text-blue-600"> LatAm</span>
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-1 lg:flex">
            <SolucionesDropdown />
            <FuncionalidadesDropdown />
            <Link to="/productos"  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:text-blue-600">Productos</Link>
            <Link to="/nosotros"   className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:text-blue-600">Nosotros</Link>
          </nav>

          {/* CTA derecho */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/login"
              className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700
                         transition hover:border-blue-300 hover:text-blue-600 shadow-sm">
              Iniciar sesión
            </Link>
            <Link to="/contratar"
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white
                         shadow-md shadow-blue-500/20 transition hover:bg-blue-700">
              Contratar
            </Link>
          </div>

          {/* Hamburger móvil */}
          <button type="button" onClick={() => setMobileOpen(v => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-700 lg:hidden" aria-label="Menú">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Menú móvil */}
        <div className={`overflow-hidden transition-all duration-300 lg:hidden
                         ${mobileOpen ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="space-y-1 border-t border-gray-100 bg-white px-5 pb-6 pt-4">
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-600">Soluciones</p>
            {[...SOLUCIONES_COL1, ...SOLUCIONES_COL2].slice(0, 8).map(s => (
              <Link key={s.href} to={s.href} onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                {s.icon} {s.label}
              </Link>
            ))}
            <div className="my-3 h-px bg-gray-100" />
            <Link to="/login" onClick={() => setMobileOpen(false)}
              className="mb-2 flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-600">
              Iniciar sesión
            </Link>
            <Link to="/contratar" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">
              Contratar
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-[68px]">
        <Outlet />
      </main>
    </div>
  );
}
