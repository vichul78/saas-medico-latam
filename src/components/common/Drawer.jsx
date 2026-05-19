import { useEffect, useRef } from 'react';

/**
 * Drawer — panel lateral deslizable desde la derecha.
 *
 * Reglas visuales:
 *   • Fondo: clinical-900 con borde eléctrico sutil
 *   • Overlay oscuro translúcido sobre el contenido principal
 *   • Animación slide-in desde la derecha (transform + transition)
 *   • Ancho configurable (default 480px)
 *   • Focus-trap y cierre con Escape para accesibilidad
 *   • CERO verde
 *
 * Props:
 *   open      : bool
 *   onClose   : fn
 *   title     : string
 *   subtitle  : string (opcional)
 *   width     : string CSS (default '480px')
 *   children  : ReactNode
 */
export default function Drawer({
  open,
  onClose,
  title = '',
  subtitle = '',
  width = '480px',
  children,
}) {
  const drawerRef = useRef(null);

  /* ── Cerrar con Escape ── */
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /* ── Focus al abrir ── */
  useEffect(() => {
    if (open) drawerRef.current?.focus();
  }, [open]);

  /* ── Bloquear scroll del body ── */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* ── Overlay ── */}
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm
                    transition-opacity duration-300
                    ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      {/* ── Panel ── */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={{ width }}
        className={`fixed right-0 top-0 z-50 flex h-full flex-col
                    border-l border-electric-500/20 bg-clinical-900
                    shadow-[−24px_0_80px_-12px_rgba(0,0,0,0.7)]
                    outline-none transition-transform duration-300 ease-out
                    ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* ── Cabecera ── */}
        <header className="flex shrink-0 items-start justify-between
                           border-b border-white/[0.07] px-6 py-5">
          <div className="flex-1 pr-4">
            <h2 className="font-display text-lg font-semibold text-white leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-sm text-clinical-400">{subtitle}</p>
            )}
          </div>

          {/* Botón cerrar */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                       border border-white/[0.08] text-clinical-500
                       transition hover:border-electric-500/40 hover:text-electric-400"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor"
                 strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* ── Barra decorativa eléctrica ── */}
        <div className="h-px w-full bg-electric-gradient opacity-60" />

        {/* ── Cuerpo scrollable ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </>
  );
}

/* ── Sección con título dentro del Drawer ────────────────────────── */
export function DrawerSection({ title, children, className = '' }) {
  return (
    <section className={`mb-6 ${className}`}>
      {title && (
        <h3 className="mb-3 text-[11px] font-semibold uppercase
                       tracking-[0.16em] text-electric-400">
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}

/* ── Fila de dato etiqueta/valor ─────────────────────────────────── */
export function DrawerField({ label, value, span = false }) {
  return (
    <div className={span ? 'col-span-2' : ''}>
      <dt className="text-[11px] font-medium uppercase tracking-wider text-clinical-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-clinical-200">
        {value ?? <span className="text-clinical-600 italic">—</span>}
      </dd>
    </div>
  );
}
