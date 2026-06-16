import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * DicomViewportPublic — visor DICOM read-only para ResultadoPublico.
 *
 * Sin toolbar, sin herramientas de edición.
 * Solo pan + scroll de frames + zoom con rueda.
 * Diseño Apple: fondo negro puro, overlays mínimos en blanco.
 *
 * Props:
 *   study   : { tipo, fecha, archivo_dicom_url, paciente_nombre, ... }
 *   compact : bool — versión reducida para mobile
 */
export default function DicomViewportPublic({ study = null, compact = false }) {
  const viewportRef = useRef(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [offset, setOffset]           = useState({ x: 0, y: 0 });
  const [startPos, setStartPos]       = useState(null);
  const [frameIdx, setFrameIdx]       = useState(0);
  const [zoom, setZoom]               = useState(1);
  const TOTAL_FRAMES = 48;

  /* ── Scroll frames / zoom con rueda ── */
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Ctrl+scroll → zoom
      setZoom(prev => Math.max(0.5, Math.min(4, prev + (e.deltaY < 0 ? 0.1 : -0.1))));
    } else {
      setFrameIdx(prev => {
        const next = prev + (e.deltaY > 0 ? 1 : -1);
        return Math.max(0, Math.min(TOTAL_FRAMES - 1, next));
      });
    }
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  /* ── Pan ── */
  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const onMouseMove = (e) => {
    if (!isDragging || !startPos) return;
    setOffset({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };
  const onMouseUp = () => { setIsDragging(false); setStartPos(null); };

  /* ── Touch pan ── */
  const touchStart = useRef(null);
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX - offset.x, y: t.clientY - offset.y };
  };
  const onTouchMove = (e) => {
    if (!touchStart.current) return;
    const t = e.touches[0];
    setOffset({ x: t.clientX - touchStart.current.x, y: t.clientY - touchStart.current.y });
  };
  const onTouchEnd = () => { touchStart.current = null; };

  const height = compact ? 'h-64' : 'h-96 sm:h-[520px]';

  return (
    <div className={`relative w-full ${height} bg-black rounded-2xl overflow-hidden select-none`}
         ref={viewportRef}
         onMouseDown={onMouseDown}
         onMouseMove={onMouseMove}
         onMouseUp={onMouseUp}
         onMouseLeave={onMouseUp}
         onTouchStart={onTouchStart}
         onTouchMove={onTouchMove}
         onTouchEnd={onTouchEnd}
         style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>

      {/* ── Imagen transformada ── */}
      <div className="absolute inset-0 flex items-center justify-center"
           style={{
             transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
             transformOrigin: 'center center',
             transition: isDragging ? 'none' : 'transform 0.05s',
           }}>
        <DicomPlaceholder frame={frameIdx} total={TOTAL_FRAMES} study={study} />
      </div>

      {/* ── Overlay superior izquierdo: datos estudio ── */}
      {study && (
        <div className="pointer-events-none absolute left-4 top-4 space-y-0.5">
          <Tag label="MODALIDAD" value={study.tipo?.toUpperCase() ?? 'DX'} />
          <Tag label="PACIENTE"  value={`${study.paciente_nombre ?? ''} ${study.paciente_apellido ?? ''}`.trim()} />
          <Tag label="FECHA"     value={study.fecha
            ? new Date(study.fecha).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—'} />
        </div>
      )}

      {/* ── Overlay superior derecho: zoom ── */}
      <div className="pointer-events-none absolute right-4 top-4">
        <Tag label="ZOOM" value={`${Math.round(zoom * 100)}%`} />
      </div>

      {/* ── Barra de frames inferior ── */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0
                      flex flex-col items-center pb-3 gap-1.5">
        <div className="h-0.5 w-40 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-white/50 rounded-full transition-all"
               style={{ width: `${((frameIdx + 1) / TOTAL_FRAMES) * 100}%` }} />
        </div>
        <span className="font-mono text-[10px] text-white/30">
          {frameIdx + 1} / {TOTAL_FRAMES}
        </span>
      </div>

      {/* ── Hint de interacción (desaparece al primer pan) ── */}
      {!isDragging && offset.x === 0 && offset.y === 0 && (
        <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2">
          <span className="text-[10px] text-white/20 font-mono tracking-widest">
            ARRASTRA · RUEDA = FRAMES · CTRL+RUEDA = ZOOM
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Etiqueta overlay DICOM ── */
function Tag({ label, value }) {
  return (
    <p className="font-mono text-[10px] leading-snug text-white/50">
      <span className="text-white/25">{label}: </span>{value}
    </p>
  );
}

/* ── Placeholder visual (mismo SVG anatómico del DicomViewport principal) ── */
function DicomPlaceholder({ frame, total, study }) {
  const brightness = 45;
  const contrast   = 120;
  return (
    <svg width="512" height="512" viewBox="0 0 512 512"
         style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)`, maxWidth: '100%', maxHeight: '100%' }}
         aria-hidden>
      <rect width="512" height="512" fill="#000" />
      <ellipse cx="256" cy="256" rx="185" ry="155" fill="#1a1a1a" />
      <ellipse cx="256" cy="256" rx="160" ry="130" fill="#2a2a2a" />
      <ellipse cx="200" cy="250" rx="68" ry="90" fill={`hsl(0,0%,${8 + (frame % 10)}%)`} />
      <ellipse cx="315" cy="250" rx="72" ry="90" fill={`hsl(0,0%,${8 + ((frame + 3) % 10)}%)`} />
      <ellipse cx="256" cy="265" rx="45" ry="55" fill="#3d3d3d" />
      <circle cx="230" cy="290" r="14" fill="#555" />
      <circle cx="280" cy="295" r="10" fill="#444" />
      <ellipse cx="256" cy="310" rx="22" ry="18" fill="#888" />
      <ellipse cx="256" cy="310" rx="10" ry="8" fill="#bbb" />
      {[0,1,2,3,4].map(i => (
        <path key={`rl-${i}`}
          d={`M${130 + i*4} ${185 + i*25} Q${80 + i*2} ${230 + i*25} ${130 + i*4} ${270 + i*25}`}
          fill="none" stroke="#777" strokeWidth="4" strokeLinecap="round" />
      ))}
      {[0,1,2,3,4].map(i => (
        <path key={`rr-${i}`}
          d={`M${382 - i*4} ${185 + i*25} Q${430 - i*2} ${230 + i*25} ${382 - i*4} ${270 + i*25}`}
          fill="none" stroke="#777" strokeWidth="4" strokeLinecap="round" />
      ))}
      <rect x="248" y="100" width="16" height="65" rx="8" fill="#222" stroke="#555" strokeWidth="1" />
      <path d="M130 170 L90 220 L105 280 L140 260 Z" fill="#444" opacity="0.6" />
      <path d="M382 170 L422 220 L407 280 L372 260 Z" fill="#444" opacity="0.6" />
      {Array.from({ length: 40 }).map((_, i) => (
        <rect key={`n-${i}`}
          x={10 + (i * 37 + frame * 17) % 492}
          y={10 + (i * 53 + frame * 23) % 492}
          width="2" height="2"
          fill={`hsl(0,0%,${20 + (i % 4) * 8}%)`}
          opacity="0.4" />
      ))}
      <defs>
        <linearGradient id="gs2" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#000" />
          <stop offset="100%" stopColor="#fff" />
        </linearGradient>
      </defs>
      <rect x="488" y="20" width="12" height="200" fill="url(#gs2)" rx="2" />
    </svg>
  );
}
