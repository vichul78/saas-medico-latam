import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header    from '@/components/layout/Header.jsx';
import Sidebar   from '@/components/layout/Sidebar.jsx';
import Footer    from '@/components/layout/Footer.jsx';
import AICopilot from '@/components/copilot/AICopilot.jsx';

/**
 * MainLayout — layout del sitio público (marketing + landing).
 *
 * ┌──────────── Header (logo MUY grande) ────────────────────────────────┐
 * │  ┌──────────┐  ┌──────────────────────────┐  ┌─────────────────────┐│
 * │  │  Sidebar │  │  Centro — Outlet          │  │  Copiloto Iris      ││
 * │  │  (izq.)  │  │  datos / historial        │  │  panel derecho      ││
 * │  └──────────┘  └──────────────────────────┘  └─────────────────────┘│
 * └──────────────────────────────────────────────────────────────────────┘
 * └──────────────────────── Footer ──────────────────────────────────────┘
 *
 * El copiloto puede abrirse/cerrarse:
 *   • En desktop (lg+): columna fija a la derecha cuando está abierto.
 *   • En móvil/tablet: drawer superpuesto desde la derecha con overlay oscuro.
 *
 * Botón flotante de activación (FAB) visible cuando el panel está cerrado.
 */
export default function MainLayout() {
  const [copilotOpen, setCopilotOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col bg-clinical-50">
      <Header
        onToggleCopilot={() => setCopilotOpen(v => !v)}
        copilotOpen={copilotOpen}
      />

      {/* ── CUERPO PRINCIPAL ── */}
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 gap-6 px-4 py-6 sm:px-6 lg:px-8">

        {/* Columna izquierda: navegación */}
        <aside className="hidden w-56 shrink-0 md:block lg:w-48">
          <Sidebar />
        </aside>

        {/* Columna central: datos / historial */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>

        {/* Columna derecha: copiloto (inline en desktop) */}
        {copilotOpen && (
          <aside
            aria-label="Copiloto IA Iris (escritorio)"
            className="hidden w-80 shrink-0 lg:block"
          >
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-hidden
                            rounded-clinical border border-electric-100 shadow-copilot">
              <AICopilot
                dark={false}
                onClose={() => setCopilotOpen(false)}
                isOpen={copilotOpen}
              />
            </div>
          </aside>
        )}
      </div>

      {/* ── OVERLAY + DRAWER para móvil/tablet ── */}
      {copilotOpen && (
        <>
          <div
            aria-hidden
            onClick={() => setCopilotOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
          <aside
            aria-label="Copiloto IA Iris (móvil)"
            className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col
                       border-l border-electric-200 bg-white
                       shadow-[-8px_0_32px_-4px_rgba(122,34,255,0.2)]
                       transition-transform duration-300 ease-out lg:hidden"
          >
            <AICopilot
              dark={false}
              onClose={() => setCopilotOpen(false)}
              isOpen={copilotOpen}
            />
          </aside>
        </>
      )}

      {/* ── FAB: botón flotante cuando el panel está cerrado ── */}
      {!copilotOpen && (
        <button
          type="button"
          onClick={() => setCopilotOpen(true)}
          aria-label="Abrir copiloto IA Iris"
          title="Copiloto IA"
          className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center
                     rounded-full bg-electric-gradient text-white
                     shadow-[0_8px_28px_-4px_rgba(122,34,255,0.65)]
                     transition hover:scale-105 hover:brightness-110
                     active:scale-95 focus:outline-none
                     focus-visible:ring-2 focus-visible:ring-electric-400"
        >
          <SparkleIcon />
        </button>
      )}

      <Footer />
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}
