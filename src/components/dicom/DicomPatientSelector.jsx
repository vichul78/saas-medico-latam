import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import { useAuth }  from '@/hooks/useAuth.js';

/**
 * DicomPatientSelector — selector de paciente + estudio vinculado a Supabase.
 *
 * Flujo:
 *   1. Búsqueda de paciente (ilike nombre/ID) contra tabla `patients`.
 *   2. Al seleccionar paciente → carga sus estudios (`studies`).
 *   3. Al seleccionar estudio → llama a onStudySelect(study, patient).
 *
 * Modo oscuro estricto (#111827). CERO verde.
 *
 * Props:
 *   onStudySelect : fn(study, patient) — callback cuando se elige estudio
 *   compact       : bool — versión reducida para la barra
 */
export default function DicomPatientSelector({ onStudySelect, compact = false }) {
  const { organization } = useAuth();
  const orgId = organization?.id ?? null;

  const [query,    setQuery]    = useState('');
  const [patients, setPatients] = useState([]);
  const [studies,  setStudies]  = useState([]);
  const [selPat,   setSelPat]   = useState(null);  // paciente seleccionado
  const [selStudy, setSelStudy] = useState(null);  // estudio seleccionado
  const [loadPat,  setLoadPat]  = useState(false);
  const [loadStd,  setLoadStd]  = useState(false);
  const [open,     setOpen]     = useState(false);  // dropdown abierto
  const debounceRef = useRef(null);
  const wrapRef     = useRef(null);

  /* ── Cierra al hacer clic fuera ── */
  useEffect(() => {
    function outside(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, []);

  /* ── Búsqueda de pacientes con debounce ── */
  const searchPatients = useCallback(async (term) => {
    if (!orgId || !term.trim()) { setPatients([]); return; }
    setLoadPat(true);
    try {
      const like = `%${term.trim()}%`;
      const { data, error } = await supabase
        .from('pacientes')
        .select('id, nombre, apellido, documento, fecha_nacimiento')
        .eq('clinica_id', orgId)
        .or(`nombre.ilike.${like},apellido.ilike.${like},documento.ilike.${like}`)
        .limit(8);

      if (error) {
        // eslint-disable-next-line no-console
        console.error('[DicomPatientSelector] patients error (EN):', error);
        setPatients([]);
      } else {
        // Normaliza paciente(ES) → forma legacy(EN) usada en el render.
        setPatients((data ?? []).map(p => ({
          id:            p.id,
          first_name:    p.nombre,
          last_name:     p.apellido,
          national_id:   p.documento,
          date_of_birth: p.fecha_nacimiento,
        })));
      }
    } finally {
      setLoadPat(false);
    }
  }, [orgId]);

  function handleQueryChange(val) {
    setQuery(val);
    setOpen(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPatients(val), 280);
  }

  /* ── Seleccionar paciente → cargar sus estudios ── */
  async function selectPatient(patient) {
    setSelPat(patient);
    setSelStudy(null);
    setStudies([]);
    setQuery(`${patient.first_name} ${patient.last_name}`.trim());
    setPatients([]);
    setOpen(false);
    setLoadStd(true);

    try {
      const { data, error } = await supabase
        .from('estudios')
        .select('id, fecha, tipo, estado, metadata, archivo_dicom_url')
        .eq('paciente_id', patient.id)
        .order('fecha', { ascending: false })
        .limit(20);

      if (error) {
        // eslint-disable-next-line no-console
        console.error('[DicomPatientSelector] studies error (EN):', error);
      } else {
        // Normaliza estudio(ES) → forma legacy(EN) usada en el render.
        setStudies((data ?? []).map(s => ({
          id:               s.id,
          study_date:       s.fecha,
          modality:         s.tipo,
          specialty:        s.metadata?.especialidad ?? null,
          status:           s.estado,
          description:      s.metadata?.descripcion ?? null,
          accession_number: s.metadata?.accession ?? null,
          dicom_study_uid:  s.metadata?.dicom_study_uid ?? s.archivo_dicom_url ?? null,
        })));
      }
    } finally {
      setLoadStd(false);
    }
  }

  /* ── Seleccionar estudio ── */
  function selectStudy(study) {
    setSelStudy(study.id);
    onStudySelect?.(
      {
        id:              study.id,
        modality:        study.modality ?? 'CT',
        description:     study.description,
        studyDate:       study.study_date,
        accessionNumber: study.accession_number,
        dicomStudyUid:   study.dicom_study_uid,
        patientName:     selPat ? `${selPat.first_name} ${selPat.last_name}`.trim() : '—',
        patientId:       selPat?.national_id ?? '—',
        dob:             selPat?.date_of_birth ?? '—',
      },
      selPat,
    );
  }

  return (
    <div
      ref={wrapRef}
      className={compact
        ? 'flex items-center gap-2'
        : 'space-y-3'
      }
    >
      {/* ── Buscador de paciente ── */}
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-clinical-500">
          <SearchIcon />
        </div>
        <input
          type="search"
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          onFocus={() => query && setOpen(true)}
          placeholder="Buscar paciente…"
          aria-label="Buscar paciente para el visor"
          className={`bg-white/[0.05] border border-white/[0.09] text-white
                      placeholder:text-clinical-600 rounded-xl pl-9 pr-3
                      focus:border-electric-500 focus:outline-none
                      focus:ring-2 focus:ring-electric-500/20 transition
                      ${compact ? 'py-1.5 text-xs w-48' : 'py-2.5 text-sm w-full'}`}
        />
        {loadPat && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <SpinIcon />
          </div>
        )}

        {/* Dropdown de resultados */}
        {open && patients.length > 0 && (
          <ul className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden
                         rounded-xl border border-white/[0.09] bg-[#111827]
                         shadow-[0_16px_40px_-8px_rgba(0,0,0,0.8)]">
            {patients.map(p => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => selectPatient(p)}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left
                             transition hover:bg-electric-500/10"
                >
                  <PatientInitials first={p.first_name} last={p.last_name} />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {p.first_name} {p.last_name}
                    </p>
                    <p className="font-mono text-[10px] text-clinical-500">
                      {p.national_id ?? '—'} · {p.date_of_birth ?? '—'}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Selector de estudio ── */}
      {selPat && (
        <div className={compact ? 'flex items-center gap-2' : ''}>
          {loadStd ? (
            <div className="flex items-center gap-2 text-xs text-clinical-500">
              <SpinIcon /> Cargando estudios…
            </div>
          ) : studies.length === 0 ? (
            <p className="text-xs text-clinical-600">
              {selPat ? 'Sin estudios registrados para este paciente.' : ''}
            </p>
          ) : (
            <select
              value={selStudy ?? ''}
              onChange={e => {
                const s = studies.find(s => s.id === e.target.value);
                if (s) selectStudy(s);
              }}
              aria-label="Seleccionar estudio DICOM"
              className={`bg-white/[0.05] border border-white/[0.09] text-white
                          rounded-xl focus:border-electric-500 focus:outline-none
                          focus:ring-2 focus:ring-electric-500/20 transition
                          ${compact ? 'py-1.5 text-xs' : 'w-full py-2.5 text-sm'}`}
            >
              <option value="" className="bg-[#111827]">— Seleccionar estudio —</option>
              {studies.map(s => (
                <option key={s.id} value={s.id} className="bg-[#111827]">
                  {s.modality} · {s.study_date} · {s.description ?? s.accession_number ?? s.id.slice(0,8)}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Avatar de iniciales del paciente ── */
function PatientInitials({ first = '', last = '' }) {
  const initials = `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center
                     rounded-full bg-electric-500/20 text-xs font-bold text-electric-300"
      aria-hidden>
      {initials}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}
         viewBox="0 0 24 24" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function SpinIcon() {
  return (
    <svg className="h-4 w-4 animate-spin text-electric-400"
         fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
