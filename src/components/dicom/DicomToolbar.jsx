import { clsx } from 'clsx';

/**
 * DicomToolbar — barra de herramientas radiológica.
 *
 * Modo oscuro estricto: bg-[#111827] con bordes subtle.
 * Herramienta activa: acento electric-500 / violet-500.
 * CERO verde en ningún estado.
 *
 * Props:
 *   activeTool  : string  — id de la herramienta activa
 *   onToolChange: fn(id)  — callback al seleccionar herramienta
 *   wwwl        : { ww, wl } — window width/level actuales
 *   onWwwlChange: fn({ ww, wl })
 *   zoom        : number  — factor de zoom actual (1 = 100%)
 *   onZoomChange: fn(number)
 *   onReset     : fn()    — restablecer viewport
 *   onInvert    : fn()    — invertir imagen
 *   isInverted  : bool
 */

const TOOLS = [
  {
    id: 'pan',
    label: 'Mover',
    shortcut: 'M',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 013 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0V11" />
      </svg>
    ),
  },
  {
    id: 'zoom',
    label: 'Zoom',
    shortcut: 'Z',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
        <circle cx="11" cy="11" r="8" />
        <path strokeLinecap="round" d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
      </svg>
    ),
  },
  {
    id: 'wwwl',
    label: 'Contraste',
    shortcut: 'W',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M12 3v18M3 12h18" />
        <path fill="currentColor" d="M12 3a9 9 0 010 18V3z" opacity=".4" />
      </svg>
    ),
  },
  {
    id: 'measure',
    label: 'Medición',
    shortcut: 'L',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 7h18M3 12h4m10 0h4M3 17h18M7 9v-2m4 2v-2m4 2v-2M7 19v-2m4 2v-2m4 2v-2" />
      </svg>
    ),
  },
  {
    id: 'annotate',
    label: 'Anotar',
    shortcut: 'A',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L18 8.625" />
      </svg>
    ),
  },
];

const ACTIONS = [
  {
    id: 'invert',
    label: 'Invertir',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path fill="currentColor" d="M12 3a9 9 0 010 18V3z" />
      </svg>
    ),
  },
  {
    id: 'reset',
    label: 'Restablecer',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
  },
];

export default function DicomToolbar({
  activeTool,
  onToolChange,
  zoom = 1,
  onZoomChange,
  wwwl = { ww: 400, wl: 40 },
  onWwwlChange,
  onReset,
  onInvert,
  isInverted = false,
}) {
  return (
    <div
      role="toolbar"
      aria-label="Herramientas del visor DICOM"
      className="flex w-full flex-wrap items-center gap-1 border-b border-white/[0.07]
                 bg-[#111827] px-3 py-2"
    >
      {/* ── Herramientas de interacción ── */}
      <div className="flex items-center gap-1 pr-3 border-r border-white/[0.07]">
        {TOOLS.map(tool => (
          <ToolBtn
            key={tool.id}
            active={activeTool === tool.id}
            onClick={() => onToolChange(tool.id)}
            label={`${tool.label} (${tool.shortcut})`}
          >
            {tool.icon}
          </ToolBtn>
        ))}
      </div>

      {/* ── Zoom ── */}
      <div className="flex items-center gap-2 px-3 border-r border-white/[0.07]">
        <button
          type="button"
          onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))}
          aria-label="Reducir zoom"
          className="h-7 w-7 rounded-lg border border-white/[0.08] text-clinical-400
                     flex items-center justify-center text-lg font-bold
                     transition hover:border-electric-500/40 hover:text-electric-400"
        >−</button>
        <span className="w-14 text-center font-mono text-xs text-clinical-300">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => onZoomChange(Math.min(8, zoom + 0.1))}
          aria-label="Aumentar zoom"
          className="h-7 w-7 rounded-lg border border-white/[0.08] text-clinical-400
                     flex items-center justify-center text-lg font-bold
                     transition hover:border-electric-500/40 hover:text-electric-400"
        >+</button>
      </div>

      {/* ── Window Width / Level ── */}
      <div className="flex items-center gap-3 px-3 border-r border-white/[0.07]">
        <WwSlider
          label="WW"
          value={wwwl.ww}
          min={1} max={4000}
          onChange={v => onWwwlChange({ ...wwwl, ww: v })}
        />
        <WwSlider
          label="WL"
          value={wwwl.wl}
          min={-1024} max={3000}
          onChange={v => onWwwlChange({ ...wwwl, wl: v })}
        />
      </div>

      {/* ── Presets de contraste ── */}
      <div className="flex items-center gap-1 px-3 border-r border-white/[0.07]">
        {PRESETS.map(p => (
          <button
            key={p.label}
            type="button"
            onClick={() => onWwwlChange({ ww: p.ww, wl: p.wl })}
            className="rounded-md border border-white/[0.08] bg-white/[0.03]
                       px-2 py-1 text-[10px] font-medium text-clinical-400
                       transition hover:border-violet-500/40 hover:text-violet-300"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Acciones ── */}
      <div className="flex items-center gap-1 ml-auto">
        {ACTIONS.map(action => (
          <ToolBtn
            key={action.id}
            active={action.id === 'invert' && isInverted}
            onClick={action.id === 'invert' ? onInvert : onReset}
            label={action.label}
          >
            {action.icon}
          </ToolBtn>
        ))}
      </div>
    </div>
  );
}

/* ── Botón de herramienta ── */
function ToolBtn({ active, onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={clsx(
        'flex h-9 w-9 items-center justify-center rounded-lg transition',
        'border focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-500/50',
        active
          ? 'border-electric-500/60 bg-electric-500/20 text-electric-300 shadow-[0_0_12px_-2px_rgba(122,34,255,0.4)]'
          : 'border-white/[0.07] bg-white/[0.03] text-clinical-400 hover:border-electric-500/30 hover:text-electric-400',
      )}
    >
      {children}
    </button>
  );
}

/* ── Slider de WW/WL ── */
function WwSlider({ label, value, min, max, onChange }) {
  return (
    <label className="flex items-center gap-1.5 text-xs">
      <span className="w-6 font-semibold text-clinical-500">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="h-1.5 w-24 cursor-pointer appearance-none rounded-full
                   bg-clinical-700 accent-electric-500"
        aria-label={`${label}: ${value}`}
      />
      <span className="w-12 font-mono text-clinical-300">{value}</span>
    </label>
  );
}

/* ── Presets radiológicos estándar ── */
const PRESETS = [
  { label: 'Pulmón',  ww: 1600, wl: -600 },
  { label: 'Hueso',   ww: 2000, wl: 400  },
  { label: 'Tejido',  ww: 400,  wl: 40   },
  { label: 'Cerebro', ww: 80,   wl: 40   },
];
