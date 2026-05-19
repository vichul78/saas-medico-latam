import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * DicomViewport — área principal de visualización radiológica.
 *
 * Modo oscuro estricto (bg-black). Preparado para Cornerstone3D:
 *   1. El div con ref=viewportRef es el canvas mount point.
 *   2. Por ahora renderiza un placeholder estructurado fiel al wireframe real.
 *   3. La integración real de Cornerstone3D se activa cuando
 *      window.__CORNERSTONE_ENABLED__ === true (flag de feature).
 *
 * Props:
 *   tool        : string — herramienta activa ('pan'|'zoom'|'wwwl'|'measure'|'annotate')
 *   zoom        : number — factor de zoom (1 = 100%)
 *   wwwl        : { ww, wl }
 *   isInverted  : bool
 *   study       : object | null — estudio activo
 *   activeSeries: string | null — UID de serie activa
 */
export default function DicomViewport({
  tool = 'pan',
  zoom = 1,
  wwwl = { ww: 400, wl: 40 },
  isInverted = false,
  study = null,
  activeSeries = null,
}) {
  const viewportRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset]         = useState({ x: 0, y: 0 });
  const [startPos, setStartPos]     = useState(null);
  const [frameIdx, setFrameIdx]     = useState(0);
  const TOTAL_FRAMES = 48; // simulado

  /* ── Scroll de frames con rueda ── */
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (tool === 'zoom') return; // zoom lo maneja la toolbar
    setFrameIdx(prev => {
      const next = prev + (e.deltaY > 0 ? 1 : -1);
      return Math.max(0, Math.min(TOTAL_FRAMES - 1, next));
    });
  }, [tool]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  /* ── Pan con mouse ── */
  function onMouseDown(e) {
    if (tool !== 'pan') return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  }
  function onMouseMove(e) {
    if (!isDragging || !startPos) return;
    setOffset({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  }
  function onMouseUp() {
    setIsDragging(false);
    setStartPos(null);
  }

  /* ── Cursor por herramienta ── */
  const cursorMap = {
    pan:      isDragging ? 'cursor-grabbing' : 'cursor-grab',
    zoom:     'cursor-zoom-in',
    wwwl:     'cursor-col-resize',
    measure:  'cursor-crosshair',
    annotate: 'cursor-crosshair',
  };

  return (
    <div
      ref={viewportRef}
      role="img"
      aria-label={study ? `Visor DICOM: ${study.description ?? study.modality}` : 'Visor DICOM — sin estudio cargado'}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      className={`relative flex flex-1 items-center justify-center overflow-hidden
                  select-none bg-black ${cursorMap[tool] ?? 'cursor-default'}`}
      style={{ minHeight: 0 }}
    >
      {/* ── Capa de transformación (zoom + pan) ── */}
      <div
        className="relative transition-none"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          filter: isInverted ? 'invert(1)' : 'none',
        }}
      >
        {/* ── PLACEHOLDER ESTRUCTURADO ─────────────────────────────────────
            Simula un estudio TC de tórax con ruido visual y anatomía básica.
            Se reemplaza completo por Cornerstone3D en producción.
        ─────────────────────────────────────────────────────────────────── */}
        <PlaceholderImage
          ww={wwwl.ww}
          wl={wwwl.wl}
          frame={frameIdx}
          total={TOTAL_FRAMES}
          study={study}
        />
      </div>

      {/* ── Overlay superior: metadatos del estudio ── */}
      <StudyOverlay study={study} activeSeries={activeSeries} />

      {/* ── Overlay inferior: frame counter + WW/WL ── */}
      <div className="pointer-events-none absolute bottom-3 left-0 right-0
                      flex items-end justify-between px-4">
        <DicomTag label="WW/WL" value={`${wwwl.ww} / ${wwwl.wl}`} />
        <FrameProgress current={frameIdx + 1} total={TOTAL_FRAMES} />
        <DicomTag label="ZOOM" value={`${Math.round(zoom * 100)}%`} />
      </div>

      {/* ── Sin estudio cargado ── */}
      {!study && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3
                        pointer-events-none">
          <DicomCrossIcon />
          <p className="text-sm font-medium text-clinical-600">
            Selecciona un paciente y estudio para visualizar
          </p>
          <p className="text-xs text-clinical-700">
            Compatible con CT · MR · DX · CR · US · ECG
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Placeholder visual: simula TC de tórax ── */
function PlaceholderImage({ ww, wl, frame, total, study }) {
  /* Brightness simula el ajuste de ventana: WL controla el centro,
     WW controla el contraste. Fórmula simplificada para el placeholder. */
  const brightness = 40 + (wl / 3000) * 60;   // 40–100%
  const contrast   = 50 + (1600 / ww) * 100;  // más alto = más contraste

  return (
    <svg
      width="512"
      height="512"
      viewBox="0 0 512 512"
      className="block"
      style={{
        filter: `brightness(${brightness}%) contrast(${contrast}%)`,
        maxWidth: '100%',
        maxHeight: '100%',
      }}
      aria-hidden
    >
      {/* Fondo negro */}
      <rect width="512" height="512" fill="#000" />

      {/* ── Cuerpo / sección axial TC tórax (silueta estilizada) ── */}
      {/* Caja torácica exterior */}
      <ellipse cx="256" cy="256" rx="185" ry="155" fill="#1a1a1a" />
      {/* Tejido blando */}
      <ellipse cx="256" cy="256" rx="160" ry="130" fill="#2a2a2a" />
      {/* Pulmón izquierdo */}
      <ellipse cx="200" cy="250" rx="68" ry="90"
        fill={`hsl(0,0%,${8 + (frame % 10)}%)`} />
      {/* Pulmón derecho */}
      <ellipse cx="315" cy="250" rx="72" ry="90"
        fill={`hsl(0,0%,${8 + ((frame + 3) % 10)}%)`} />
      {/* Mediastino / corazón */}
      <ellipse cx="256" cy="265" rx="45" ry="55" fill="#3d3d3d" />
      {/* Aorta descendente */}
      <circle cx="230" cy="290" r="14" fill="#555" />
      {/* Vena cava */}
      <circle cx="280" cy="295" r="10" fill="#444" />
      {/* Columna vertebral */}
      <ellipse cx="256" cy="310" rx="22" ry="18" fill="#888" />
      <ellipse cx="256" cy="310" rx="10" ry="8" fill="#bbb" />
      {/* Costillas (izq) */}
      {[0,1,2,3,4].map(i => (
        <path key={`rl-${i}`}
          d={`M${130 + i*4} ${185 + i*25} Q${80 + i*2} ${230 + i*25} ${130 + i*4} ${270 + i*25}`}
          fill="none" stroke="#777" strokeWidth="4" strokeLinecap="round" />
      ))}
      {/* Costillas (der) */}
      {[0,1,2,3,4].map(i => (
        <path key={`rr-${i}`}
          d={`M${382 - i*4} ${185 + i*25} Q${430 - i*2} ${230 + i*25} ${382 - i*4} ${270 + i*25}`}
          fill="none" stroke="#777" strokeWidth="4" strokeLinecap="round" />
      ))}
      {/* Tráquea */}
      <rect x="248" y="100" width="16" height="65" rx="8" fill="#222" stroke="#555" strokeWidth="1" />
      {/* Escápulas */}
      <path d="M130 170 L90 220 L105 280 L140 260 Z" fill="#444" opacity="0.6" />
      <path d="M382 170 L422 220 L407 280 L372 260 Z" fill="#444" opacity="0.6" />
      {/* Ruido digital leve */}
      {Array.from({ length: 40 }).map((_, i) => (
        <rect key={`noise-${i}`}
          x={10 + (i * 37 + frame * 17) % 492}
          y={10 + (i * 53 + frame * 23) % 492}
          width="2" height="2"
          fill={`hsl(0,0%,${20 + (i % 4) * 8}%)`}
          opacity="0.4" />
      ))}
      {/* Escala de gris (barra lateral) */}
      <defs>
        <linearGradient id="gsBar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#000" />
          <stop offset="100%" stopColor="#fff" />
        </linearGradient>
      </defs>
      <rect x="488" y="20" width="12" height="200" fill="url(#gsBar)" rx="2" />
    </svg>
  );
}

/* ── Overlay de metadatos del estudio (esquinas) ── */
function StudyOverlay({ study, activeSeries }) {
  if (!study) return null;
  return (
    <>
      {/* Esquina superior izquierda */}
      <div className="pointer-events-none absolute left-3 top-3 space-y-0.5">
        <DicomTag label="PACIENTE" value={study.patientName ?? '—'} />
        <DicomTag label="DOB"     value={study.dob ?? '—'} />
        <DicomTag label="ID"      value={study.patientId ?? '—'} />
      </div>
      {/* Esquina superior derecha */}
      <div className="pointer-events-none absolute right-3 top-3 space-y-0.5 text-right">
        <DicomTag label="MODALIDAD" value={study.modality ?? '—'} />
        <DicomTag label="FECHA"     value={study.studyDate ?? '—'} />
        <DicomTag label="ACC#"      value={study.accessionNumber ?? '—'} />
      </div>
      {/* Serie activa (inferior izq) */}
      {activeSeries && (
        <div className="pointer-events-none absolute bottom-10 left-3">
          <DicomTag label="SERIE" value={activeSeries} />
        </div>
      )}
    </>
  );
}

/* ── Etiqueta DICOM overlay ── */
function DicomTag({ label, value }) {
  return (
    <p className="font-mono text-[10px] leading-tight text-white/60">
      <span className="text-white/35">{label}: </span>{value}
    </p>
  );
}

/* ── Progreso de frames ── */
function FrameProgress({ current, total }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="h-0.5 w-32 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-electric-500/70"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
      <p className="font-mono text-[10px] text-white/40">{current}/{total}</p>
    </div>
  );
}

/* ── Icono DICOM cross (placeholder sin estudio) ── */
function DicomCrossIcon() {
  return (
    <svg className="h-16 w-16 text-clinical-800" fill="none" stroke="currentColor"
         strokeWidth={1} viewBox="0 0 64 64" aria-hidden>
      <rect x="4" y="4" width="56" height="56" rx="4" />
      <path d="M32 14v36M14 32h36" strokeLinecap="round" />
      <circle cx="32" cy="32" r="12" />
    </svg>
  );
}
