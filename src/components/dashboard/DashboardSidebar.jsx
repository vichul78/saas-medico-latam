import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { SPECIALTIES, FEATURES, ADDITIONAL } from '@/lib/navigation.js';

/*
  DashboardSidebar — navegación lateral del área autenticada.

  Reglas visuales:
    • Fondo: clinical-900 con borde sutil blanco/6.
    • Ítem activo: acento eléctrico (bg-electric-500/15 + text-electric-300 + borde-left).
    • Grupos colapsables con animación suave.
    • CERO tonos verdes.
    • Ancho fijo 260px; en móvil se superpone como drawer.
*/

// Iconos SVG inline para cada grupo de navegación
const GROUP_ICONS = {
  clinical: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  specialties: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  tech: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.25m-1.5-8.964c.251.023.501.05.75.082M19.5 9.25a2.25 2.25 0 00-2.25-2.25h-1.5M19.5 9.25v5.25m0-5.25c0-.414-.336-.75-.75-.75h-1.5" />
    </svg>
  ),
  management: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  ),
  usability: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  custom: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

// Datos de cada grupo de navegación
const NAV_GROUPS = [
  {
    key:   'clinical',
    label: 'Módulos clínicos',
    items: [
      { label: 'Pacientes',       to: '/dashboard/pacientes'    },
      { label: 'Citas y Agendas', to: '/dashboard/citas'        },
      { label: 'Visor DICOM',     to: '/dashboard/visor'        },
      { label: 'Informes',        to: '/dashboard/informes'     },
      { label: 'Facturación',     to: '/dashboard/facturacion'  },
    ],
  },
  {
    key:   'specialties',
    label: '1. Especialidades',
    code:  '',
    items: SPECIALTIES.map(s => ({
      label: s.label,
      to:    `/soluciones/${s.slug}`,
    })),
  },
  {
    key:   'tech',
    label: '2.1 Tecnología',
    code:  '2.1',
    items: FEATURES.tech.items.map(i => ({
      label: i.label,
      to:    `/funcionalidades/${FEATURES.tech.base}/${i.slug}`,
    })),
  },
  {
    key:   'management',
    label: '2.2 Gestión',
    code:  '2.2',
    items: FEATURES.management.items.map(i => ({
      label: i.label,
      to:    `/funcionalidades/${FEATURES.management.base}/${i.slug}`,
    })),
  },
  {
    key:   'usability',
    label: '2.3 Fácil de usar',
    code:  '2.3',
    items: FEATURES.usability.items.map(i => ({
      label: i.label,
      to:    `/funcionalidades/${FEATURES.usability.base}/${i.slug}`,
    })),
  },
  {
    key:   'custom',
    label: '2.4 Personalizado',
    code:  '2.4',
    items: FEATURES.custom.items.map(i => ({
      label: i.label,
      to:    `/funcionalidades/${FEATURES.custom.base}/${i.slug}`,
    })),
  },
];

export default function DashboardSidebar({ open, onClose }) {
  // Grupos expandidos por defecto: especialidades y tecnología
  const [expanded, setExpanded] = useState({ clinical: true, specialties: false, tech: true });

  function toggle(key) {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <>
      {/* ── Overlay móvil ── */}
      {open && (
        <div
          aria-hidden
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ── Panel de navegación ── */}
      <aside
        aria-label="Navegación del sistema"
        className={`
          fixed top-20 left-0 z-40 flex h-[calc(100vh-5rem)] w-64
          flex-col border-r border-white/[0.06] bg-clinical-900
          transition-transform duration-300 ease-in-out
          lg:sticky lg:translate-x-0 lg:shrink-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Scroll container */}
        <nav className="flex-1 overflow-y-auto px-3 py-4
                        scrollbar-thin scrollbar-track-transparent
                        scrollbar-thumb-clinical-700">

          {/* Dashboard propio */}
          <div className="mb-4">
            <SideNavLink to="/dashboard" exact label="Mi Dashboard" icon={<IconHome />} />
          </div>

          <hr className="mb-4 border-white/[0.06]" />

          {/* Grupos colapsables */}
          {NAV_GROUPS.map(group => (
            <CollapsibleGroup
              key={group.key}
              groupKey={group.key}
              label={group.label}
              icon={GROUP_ICONS[group.key]}
              items={group.items}
              isOpen={!!expanded[group.key]}
              onToggle={() => toggle(group.key)}
            />
          ))}

          <hr className="my-3 border-white/[0.06]" />

          {/* Adicionales */}
          <div className="mb-2 px-2 text-[10px] font-semibold uppercase
                          tracking-[0.18em] text-clinical-600">
            Adicionales
          </div>
          {ADDITIONAL.map(a => (
            <SideNavLink
              key={a.slug}
              to={`/${a.slug}`}
              label={a.label}
              icon={<IconDot />}
            />
          ))}
        </nav>

        {/* ── Footer del sidebar: versión ── */}
        <div className="border-t border-white/[0.05] px-4 py-3">
          <p className="text-[10px] text-clinical-600">
            MediCo LatAm · v0.2.0-beta
          </p>
        </div>
      </aside>
    </>
  );
}

/* ── Grupo colapsable ── */
function CollapsibleGroup({ groupKey, label, icon, items, isOpen, onToggle }) {
  return (
    <div className="mb-1">
      {/* Cabecera del grupo */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg px-2 py-2
                   text-left text-[11px] font-semibold uppercase tracking-[0.14em]
                   text-clinical-500 transition
                   hover:bg-white/[0.04] hover:text-clinical-300"
      >
        <span className="flex items-center gap-2">
          <span className="text-electric-500">{icon}</span>
          {label}
        </span>
        <ChevronIcon open={isOpen} />
      </button>

      {/* Ítems */}
      {isOpen && (
        <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-white/[0.06] pl-3">
          {items.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md py-1.5 pl-2 pr-3 text-sm
                   transition
                   ${isActive
                    ? 'bg-electric-500/15 font-semibold text-electric-300 border-l-2 border-electric-500 -ml-[1px] pl-[9px]'
                    : 'text-clinical-400 hover:bg-white/[0.04] hover:text-clinical-200'
                   }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── NavLink simple (dashboard, adicionales) ── */
function SideNavLink({ to, label, icon, exact = false }) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium
         transition
         ${isActive
          ? 'bg-electric-500/15 text-electric-300 border-l-2 border-electric-500'
          : 'text-clinical-400 hover:bg-white/[0.04] hover:text-clinical-200'
         }`
      }
    >
      <span className="shrink-0 text-electric-500/80">{icon}</span>
      {label}
    </NavLink>
  );
}

/* ── Micro-iconos ── */
function ChevronIcon({ open }) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
function IconHome() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}
function IconDot() {
  return (
    <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}
