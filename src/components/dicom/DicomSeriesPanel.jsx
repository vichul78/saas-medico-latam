/**
 * DicomSeriesPanel — panel lateral izquierdo de series/estudios.
 *
 * Modo oscuro estricto (#111827). CERO verde.
 * Muestra el listado de series del estudio activo y permite navegar entre ellas.
 * Thumbnail placeholder SVG por cada serie.
 *
 * Props:
 *   study        : object | null
 *   series       : array  — lista de series del estudio
 *   activeSeries : string | null — UID activo
 *   onSelect     : fn(uid) — seleccionar serie
 *   loading      : bool
 */

import Skeleton from '@/components/common/Skeleton.jsx';

/* Modalities disponibles con su abreviatura para el badge */
const MODALITY_BADGE = {
  CT:  { label: 'CT',  cls: 'text-electric-300 bg-electric-500/15 border-electric-500/30' },
  MR:  { label: 'MR',  cls: 'text-violet-300 bg-violet-500/15 border-violet-500/30' },
  DX:  { label: 'DX',  cls: 'text-clinical-300 bg-white/[0.07] border-white/10' },
  CR:  { label: 'CR',  cls: 'text-clinical-300 bg-white/[0.07] border-white/10' },
  US:  { label: 'US',  cls: 'text-violet-300 bg-violet-500/15 border-violet-500/30' },
  ECG: { label: 'ECG', cls: 'text-electric-300 bg-electric-500/15 border-electric-500/30' },
};

export default function DicomSeriesPanel({
  study = null,
  series = [],
  activeSeries = null,
  onSelect,
  loading = false,
}) {
  return (
    <aside
      aria-label="Series del estudio"
      className="flex w-52 shrink-0 flex-col border-r border-white/[0.06] bg-[#111827]"
    >
      {/* ── Cabecera ── */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-clinical-500">
          Series
        </h2>
        {study && (
          <span className="rounded-full border border-white/10 bg-white/[0.05]
                           px-2 py-0.5 text-[10px] font-mono text-clinical-400">
            {series.length}
          </span>
        )}
      </div>

      {/* ── Lista de series ── */}
      <div className="flex-1 overflow-y-auto py-2">
        {loading && (
          <div className="space-y-2 px-2">
            {[1,2,3].map(i => <Skeleton.Card key={i} rows={2} className="!p-3" />)}
          </div>
        )}

        {!loading && !study && (
          <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
            <p className="text-xs text-clinical-600">Carga un estudio para ver las series</p>
          </div>
        )}

        {!loading && study && series.length === 0 && (
          <p className="px-3 py-4 text-xs text-clinical-600">Sin series disponibles.</p>
        )}

        {!loading && series.map(s => (
          <SeriesThumb
            key={s.uid}
            series={s}
            isActive={activeSeries === s.uid}
            onSelect={() => onSelect(s.uid)}
          />
        ))}

        {/* Demo series cuando no hay estudio cargado pero sí una sesión */}
        {!loading && study && series.length === 0 && (
          DEMO_SERIES.map(s => (
            <SeriesThumb
              key={s.uid}
              series={s}
              isActive={activeSeries === s.uid}
              onSelect={() => onSelect(s.uid)}
            />
          ))
        )}
      </div>
    </aside>
  );
}

/* ── Thumbnail de una serie ── */
function SeriesThumb({ series, isActive, onSelect }) {
  const badge = MODALITY_BADGE[series.modality] ?? MODALITY_BADGE.DX;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={`group w-full px-2 py-2 text-left transition
        ${isActive
          ? 'bg-electric-500/15'
          : 'hover:bg-white/[0.04]'}`}
    >
      {/* Thumbnail SVG */}
      <div className={`relative mb-1.5 overflow-hidden rounded-lg border
        ${isActive
          ? 'border-electric-500/50'
          : 'border-white/[0.07] group-hover:border-white/20'}`}
      >
        <MiniThumbnail modality={series.modality} index={series.index ?? 0} />
        {/* Badge de modalidad */}
        <span className={`absolute left-1.5 top-1.5 rounded border px-1 py-0.5
                          text-[9px] font-bold ${badge.cls}`}>
          {badge.label}
        </span>
        {/* Índice de imágenes */}
        <span className="absolute bottom-1 right-1.5 font-mono text-[9px] text-white/50">
          {series.frames ?? '—'} img
        </span>
      </div>

      {/* Descripción */}
      <p className={`truncate text-[11px] font-medium leading-tight
        ${isActive ? 'text-electric-200' : 'text-clinical-300'}`}>
        {series.description ?? `Serie ${series.index + 1}`}
      </p>
      <p className="mt-0.5 truncate text-[10px] text-clinical-600">
        {series.uid?.slice(0, 20)}…
      </p>
    </button>
  );
}

/* ── Mini-thumbnail SVG generado para cada serie ── */
function MiniThumbnail({ modality, index }) {
  const patterns = {
    CT: <CTPattern idx={index} />,
    MR: <MRPattern idx={index} />,
    DX: <DXPattern idx={index} />,
    default: <DefaultPattern idx={index} />,
  };

  return (
    <svg
      viewBox="0 0 96 80"
      width="100%"
      className="block aspect-[6/5]"
      aria-hidden
    >
      <rect width="96" height="80" fill="#0a0a0a" />
      {patterns[modality] ?? patterns.default}
    </svg>
  );
}

function CTPattern({ idx }) {
  return (
    <>
      <ellipse cx="48" cy="40" rx="34" ry="28" fill="#1e1e1e" />
      <ellipse cx="36" cy="38" rx="13" ry="16" fill={`hsl(0,0%,${5 + idx}%)`} />
      <ellipse cx="60" cy="38" rx="14" ry="16" fill={`hsl(0,0%,${5 + idx}%)`} />
      <ellipse cx="48" cy="48" rx="8" ry="10" fill="#333" />
      <ellipse cx="48" cy="56" rx="4" ry="3" fill="#666" />
    </>
  );
}

function MRPattern({ idx }) {
  return (
    <>
      <ellipse cx="48" cy="40" rx="30" ry="32" fill="#0d0d20" />
      <ellipse cx="48" cy="38" rx="22" ry="24" fill={`hsl(240,20%,${10 + idx}%)`} />
      <ellipse cx="48" cy="35" rx="12" ry="14" fill="#1a1a3a" />
      <path d="M30 45 Q48 58 66 45" fill="none" stroke="#334" strokeWidth="3" />
    </>
  );
}

function DXPattern({ idx }) {
  return (
    <>
      <rect x="12" y="8" width="72" height="64" rx="3" fill="#111" />
      {[0,1,2,3,4,5,6].map(i => (
        <path key={i}
          d={`M${18 + i*10} 12 Q${13 + i*10} 40 ${18 + i*10} 68`}
          fill="none" stroke="#2a2a2a" strokeWidth="4" strokeLinecap="round" />
      ))}
      <ellipse cx="48" cy="40" rx="14" ry="20" fill="#222" stroke="#333" strokeWidth="1" />
    </>
  );
}

function DefaultPattern({ idx }) {
  return (
    <>
      <rect x="8" y="8" width="80" height="64" rx="4" fill="#151515" />
      <circle cx="48" cy="40" r="20" fill="none" stroke="#2a2a2a" strokeWidth="2" />
      <path d="M28 40 h40 M48 20 v40" stroke="#222" strokeWidth="1.5" />
    </>
  );
}

/* ── Series de demo cuando no hay datos de Supabase ── */
const DEMO_SERIES = [
  { uid: 'demo-ct-1',  modality: 'CT',  description: 'Tórax Axial',     frames: 48, index: 0 },
  { uid: 'demo-ct-2',  modality: 'CT',  description: 'Tórax Coronal',   frames: 32, index: 1 },
  { uid: 'demo-ct-3',  modality: 'CT',  description: 'Tórax Sagital',   frames: 28, index: 2 },
  { uid: 'demo-dx-1',  modality: 'DX',  description: 'Rx Tórax PA',     frames: 1,  index: 3 },
];
