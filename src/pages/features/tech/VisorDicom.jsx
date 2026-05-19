import { useState, useCallback } from 'react';
import DicomToolbar         from '@/components/dicom/DicomToolbar.jsx';
import DicomViewport        from '@/components/dicom/DicomViewport.jsx';
import DicomSeriesPanel     from '@/components/dicom/DicomSeriesPanel.jsx';
import DicomCopilot         from '@/components/dicom/DicomCopilot.jsx';
import DicomPatientSelector from '@/components/dicom/DicomPatientSelector.jsx';

/*
  VisorDicom — página principal del visor radiológico DICOM.

  ┌─────────────────────────────────────────────────────────────────────┐
  │  TopBar: Selector paciente/estudio + info estudio activo            │
  ├─────────────────────────────────────────────────────────────────────┤
  │  Toolbar: Pan | Zoom | WW/WL | Measure | Annotate | Presets         │
  ├────────────┬────────────────────────────────────────┬───────────────┤
  │  Series    │           VIEWPORT (negro)             │  Copiloto IA  │
  │  Panel     │   Placeholder SVG TC + overlays        │  Radiológico  │
  │  (izq)     │   Interactivo (pan, zoom, scroll)      │  (der)        │
  └────────────┴────────────────────────────────────────┴───────────────┘

  Modo oscuro estricto: bg-[#0d0d0d] en toda la vista.
  Acentos electric/violet en herramientas activas.
  CERO tonos verdes.
*/

const DEMO_SERIES = [
  { uid: 'demo-ct-1', modality: 'CT', description: 'Tórax Axial',   frames: 48, index: 0 },
  { uid: 'demo-ct-2', modality: 'CT', description: 'Tórax Coronal', frames: 32, index: 1 },
  { uid: 'demo-ct-3', modality: 'CT', description: 'Tórax Sagital', frames: 28, index: 2 },
  { uid: 'demo-dx-1', modality: 'DX', description: 'Rx Tórax PA',   frames: 1,  index: 3 },
];

export default function VisorDicom() {
  // ── Estado del visor ──────────────────────────────────────────────
  const [activeTool,   setActiveTool]   = useState('pan');
  const [zoom,         setZoom]         = useState(1);
  const [wwwl,         setWwwl]         = useState({ ww: 400, wl: 40 });
  const [isInverted,   setIsInverted]   = useState(false);
  const [activeSeries, setActiveSeries] = useState('demo-ct-1');

  // ── Estudio / paciente activo ─────────────────────────────────────
  const [study,       setStudy]       = useState(null);  // null = modo demo
  const [patient,     setPatient]     = useState(null);
  const [isDemoMode,  setIsDemoMode]  = useState(true);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setZoom(1);
    setWwwl({ ww: 400, wl: 40 });
    setIsInverted(false);
  }, []);

  const handleStudySelect = useCallback((selectedStudy, selectedPatient) => {
    setStudy(selectedStudy);
    setPatient(selectedPatient);
    setIsDemoMode(false);
    setActiveSeries(null);
    handleReset();
  }, [handleReset]);

  // Estudio visual que se pasa al viewport (real o demo)
  const activeStudy = isDemoMode
    ? {
        modality:    'CT',
        description: 'Tórax PA/Lateral · Demostración',
        studyDate:   new Date().toLocaleDateString('es'),
        patientName: 'Paciente Demo',
        patientId:   '00000000',
        dob:         '—',
      }
    : study;

  const seriesList = isDemoMode ? DEMO_SERIES : [];

  return (
    /*
      Vista full-height dentro del DashboardLayout.
      El DashboardLayout ya provee su propio header y copiloto derecho;
      aquí sobreescribimos el área central con un layout propio de visor.
    */
    <div className="flex h-full min-h-0 flex-col bg-[#0d0d0d]">

      {/* ── TOP BAR: selector de paciente/estudio ── */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.06]
                      bg-[#111827] px-4 py-3">

        {/* Selector Supabase */}
        <DicomPatientSelector onStudySelect={handleStudySelect} compact />

        {/* Separador */}
        <div className="h-6 w-px bg-white/[0.08]" />

        {/* Modo demo toggle */}
        <button
          type="button"
          onClick={() => { setIsDemoMode(true); setStudy(null); setPatient(null); handleReset(); }}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition
            ${isDemoMode
              ? 'border-electric-500/50 bg-electric-500/15 text-electric-300'
              : 'border-white/[0.08] text-clinical-500 hover:border-electric-500/30 hover:text-electric-400'}`}
        >
          Demo TC
        </button>

        {/* Info estudio activo */}
        {activeStudy && (
          <div className="ml-auto flex items-center gap-3">
            <ModalityChip modality={activeStudy.modality} />
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-white">
                {activeStudy.patientName}
              </p>
              <p className="font-mono text-[10px] text-clinical-500">
                {activeStudy.modality} · {activeStudy.studyDate ?? '—'}
              </p>
            </div>
          </div>
        )}

        {/* Cornerstone banner */}
        <div className="hidden xl:flex items-center gap-1.5 rounded-lg border
                        border-violet-500/20 bg-violet-500/10 px-3 py-1.5">
          <svg className="h-3.5 w-3.5 text-violet-400" fill="none" stroke="currentColor"
               strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] font-medium text-violet-300">
            Listo para Cornerstone3D
          </span>
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <DicomToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        zoom={zoom}
        onZoomChange={setZoom}
        wwwl={wwwl}
        onWwwlChange={setWwwl}
        onReset={handleReset}
        onInvert={() => setIsInverted(v => !v)}
        isInverted={isInverted}
      />

      {/* ── ÁREA PRINCIPAL: Series | Viewport | Copiloto ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* Panel de series (izquierda) */}
        <DicomSeriesPanel
          study={activeStudy}
          series={seriesList}
          activeSeries={activeSeries}
          onSelect={setActiveSeries}
          loading={false}
        />

        {/* Viewport central (negro, toma todo el espacio disponible) */}
        <div className="flex flex-1 flex-col min-h-0 min-w-0">
          <DicomViewport
            tool={activeTool}
            zoom={zoom}
            onZoomChange={setZoom}
            wwwl={wwwl}
            isInverted={isInverted}
            study={activeStudy}
            activeSeries={activeSeries}
          />

          {/* Barra de estado inferior */}
          <div className="flex shrink-0 items-center gap-4 border-t border-white/[0.05]
                          bg-[#111827] px-4 py-1.5 text-[10px] font-mono text-clinical-600">
            <span>Herramienta: <span className="text-electric-400">{activeTool.toUpperCase()}</span></span>
            <span>Zoom: {Math.round(zoom * 100)}%</span>
            <span>WW/WL: {wwwl.ww}/{wwwl.wl}</span>
            <span>{isInverted ? '🔆 Invertida' : '🔅 Normal'}</span>
            <span className="ml-auto text-clinical-700">
              Placeholder visual · Cornerstone3D pendiente de instalación
            </span>
          </div>
        </div>

        {/* Copiloto IA radiológico (derecha) */}
        <DicomCopilot
          study={activeStudy}
          patientName={activeStudy?.patientName ?? null}
        />
      </div>
    </div>
  );
}

/* ── Badge de modalidad ── */
function ModalityChip({ modality }) {
  const colors = {
    CT: 'border-electric-500/40 bg-electric-500/15 text-electric-300',
    MR: 'border-violet-500/40 bg-violet-500/15 text-violet-300',
    DX: 'border-white/20 bg-white/[0.07] text-clinical-300',
    CR: 'border-white/20 bg-white/[0.07] text-clinical-300',
    US: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
  };
  return (
    <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold
                      ${colors[modality] ?? colors.DX}`}>
      {modality ?? '—'}
    </span>
  );
}
