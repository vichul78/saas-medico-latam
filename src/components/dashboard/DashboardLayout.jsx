import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DashboardHeader  from '@/components/dashboard/DashboardHeader.jsx';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar.jsx';
import AICopilot        from '@/components/copilot/AICopilot.jsx';

/**
 * DashboardLayout — layout de 3 zonas del área autenticada.
 *
 * ┌──────────────── DashboardHeader (sticky, logo GRANDE) ──────────────────┐
 * │  ┌──────────┐  ┌──────────────────────────────┐  ┌──────────────────┐  │
 * │  │ Sidebar  │  │  Centro — Outlet (HCE/datos)  │  │  Copiloto Iris   │  │
 * │  │  izq.    │  │  izquierda libre              │  │  panel derecho   │  │
 * │  └──────────┘  └──────────────────────────────┘  └──────────────────┘  │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * El copiloto se puede abrir/cerrar con el botón en el DashboardHeader.
 * En móvil/tablet se superpone como drawer desde la derecha con overlay.
 * En escritorio (xl+) puede ser inline fijo o drawer según estado.
 *
 * El visor DICOM (/dashboard/visor) desactiva el copiloto global (tiene el suyo propio).
 */
export default function DashboardLayout() {
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [copilotOpen,  setCopilotOpen]  = useState(false);
  const location = useLocation();

  // El Visor DICOM gestiona su propio copiloto radiológico.
  const isVisor = location.pathname.startsWith('/dashboard/visor');

  return (
    <div className="flex min-h-screen flex-col bg-clinical-900">

      {/* ── HEADER ── */}
      <DashboardHeader
        onToggleSidebar={() => setSidebarOpen(v => !v)}
        sidebarOpen={sidebarOpen}
        onToggleCopilot={() => setCopilotOpen(v => !v)}
        copilotOpen={copilotOpen}
      />

      {/* ── BODY ── */}
      <div className="relative flex flex-1 overflow-hidden">

        {/* SIDEBAR izquierdo */}
        <DashboardSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* ZONA CENTRAL */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          {isVisor ? (
            <div className="flex min-h-0 flex-1 overflow-hidden">
              <Outlet />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="min-h-full bg-gradient-to-b from-clinical-900 to-clinical-800/60
                              px-4 py-6 sm:px-6 lg:px-8">
                <Outlet />
              </div>
            </div>
          )}
        </main>

        {/* ── COPILOTO IA ─────────────────────────────────────────────────
            Comportamiento:
              • xl+: columna inline fija de 320px cuando copilotOpen=true.
              • < xl: drawer superpuesto desde la derecha con overlay.
            Animación: translate-x (slide-in desde el borde derecho).
            Se oculta completamente en el visor DICOM.
        ──────────────────────────────────────────────────────────────── */}
        {!isVisor && (
          <>
            {/* Overlay para móvil/tablet */}
            {copilotOpen && (
              <div
                aria-hidden
                onClick={() => setCopilotOpen(false)}
                className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm xl:hidden"
              />
            )}

            {/* Panel del copiloto */}
            <aside
              aria-label="Copiloto IA clínico Iris"
              className={`
                fixed right-0 top-20 z-40 flex h-[calc(100vh-5rem)] w-80 flex-col
                border-l border-electric-500/20 bg-clinical-900
                shadow-[-12px_0_40px_-8px_rgba(0,0,0,0.6)]
                transition-transform duration-300 ease-in-out
                xl:sticky xl:shrink-0
                ${copilotOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0 xl:hidden'}
              `}
            >
              <AICopilot
                dark
                onClose={() => setCopilotOpen(false)}
                isOpen={copilotOpen}
              />
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
