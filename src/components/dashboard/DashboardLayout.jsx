import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader.jsx';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar.jsx';
import AICopilot from '@/components/copilot/AICopilot.jsx';

/*
  DashboardLayout — layout de 3 zonas para el área autenticada.

  ┌───────────────────────── DashboardHeader (sticky, oscuro, logo GRANDE) ──────────────────────────┐
  │                                                                                                   │
  │  ┌──────────────┐   ┌─────────────────────────────────────────────┐   ┌────────────────────────┐ │
  │  │  Dashboard   │   │   CENTRO — Outlet (datos, historial, HCE)   │   │  AI Copilot            │ │
  │  │  Sidebar     │   │   ← izquierda libre para expedientes        │   │  Anclado a la derecha  │ │
  │  │  (izquierda) │   │                                             │   │  Panel fijo 320px      │ │
  │  └──────────────┘   └─────────────────────────────────────────────┘   └────────────────────────┘ │
  │                                                                                                   │
  └──────────────────────────────────────────────────────────────────────────────────────────────────┘

  Paleta oscura clínica:
    • Fondo general: clinical-900 (#0F0F18)
    • Sidebar:       clinical-900 con borde white/6
    • Centro:        clinical-800/50 (ligeramente más claro para el contenido)
    • Copiloto:      columna derecha fija, borde electric-500/20
    • CERO verdes.
*/

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // El visor DICOM tiene su propio layout interno (modo oscuro estricto,
  // copiloto propio, sin padding). Desactivamos el padding y el copiloto global.
  const isVisor = location.pathname.startsWith('/dashboard/visor');

  return (
    <div className="flex min-h-screen flex-col bg-clinical-900">

      {/* ── HEADER ── */}
      <DashboardHeader
        onToggleSidebar={() => setSidebarOpen(v => !v)}
        sidebarOpen={sidebarOpen}
      />

      {/* ── BODY: sidebar + centro + copiloto ── */}
      <div className="relative flex flex-1 overflow-hidden">

        {/* ── SIDEBAR IZQUIERDO ── */}
        <DashboardSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* ── ZONA CENTRAL (datos, historial, HCE) ── */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          {isVisor ? (
            /* El visor ocupa todo sin padding — tiene su propio layout interno */
            <div className="flex flex-1 min-h-0 overflow-hidden">
              <Outlet />
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
              <div className="min-h-full bg-gradient-to-b from-clinical-900 to-clinical-800/60 px-4 py-6 sm:px-6 lg:px-8">
                <Outlet />
              </div>
            </div>
          )}
        </main>

        {/* ── COPILOTO IA — ANCLADO A LA DERECHA (oculto en visor) ── */}
        {!isVisor && (
          <aside
            aria-label="Copiloto IA clínico"
            className="hidden w-80 shrink-0 flex-col border-l border-white/[0.06]
                       bg-clinical-900 xl:flex"
          >
            <div className="sticky top-0 flex h-[calc(100vh-5rem)] flex-col">
              <AICopilot dark />
            </div>
          </aside>
        )}

      </div>
    </div>
  );
}
