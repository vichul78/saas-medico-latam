import { useState, useCallback, useRef } from 'react';
import { useEstudios } from '@/hooks/useEstudios.js';
import { usePatients } from '@/hooks/usePatients.js';
import Skeleton        from '@/components/common/Skeleton.jsx';

/*
  EstudiosPage — listado de estudios medicos con:
    - Busqueda por nombre de paciente (debounce 300 ms)
    - Filtro por estado (pendiente / en_proceso / completado)
    - Tabla densa estilo clinico oscuro
    - Modal form para crear nuevo estudio
    - Paginacion numerica
*/

const ESTADO_OPTIONS = [
  { value: '',           label: 'Todos' },
  { value: 'pendiente',  label: 'Pendiente' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'completado', label: 'Completado' },
];

const ESTADO_DB_TO_UI = {
  recibido:          'pendiente',
  pendiente_lectura: 'pendiente',
  en_lectura:        'en_proceso',
  informado:         'completado',
  entregado:         'completado',
  cancelado:         'pendiente',
};

const BADGE_CLASSES = {
  pendiente:  'border-amber-400/30 bg-amber-400/10 text-amber-300',
  en_proceso: 'border-electric-400/30 bg-electric-400/10 text-electric-300',
  completado: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
};

const BADGE_LABELS = {
  pendiente:  'Pendiente',
  en_proceso: 'En Proceso',
  completado: 'Completado',
};

export default function EstudiosPage() {
  const [search,      setSearch]      = useState('');
  const [query,       setQuery]       = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [formOpen,    setFormOpen]    = useState(false);
  const debounceRef = useRef(null);

  const handleSearch = useCallback((val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(val), 300);
  }, []);

  const {
    estudios, loading, error, totalCount, page, setPage, pageSize, createEstudio,
  } = useEstudios({ search: query, estado: estadoFilter });

  const totalPages = Math.ceil(totalCount / pageSize);

  const openNew = () => setFormOpen(true);
  const closeForm = () => setFormOpen(false);

  const handleSave = async (data) => {
    const result = await createEstudio(data);
    if (!result.error) {
      closeForm();
    }
    return result;
  };

  return (
    <>
      {/* Cabecera de modulo */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-electric-400">
          Modulo clinico
        </p>
        <h1 className="font-display text-3xl font-bold text-white">
          Estudios Medicos
        </h1>
        <p className="mt-1 text-sm text-clinical-400">
          {totalCount > 0
            ? `${totalCount.toLocaleString('es')} estudios registrados`
            : 'Gestion de estudios e imagenes diagnosticas'}
        </p>
      </div>

      {/* Barra de acciones */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Buscador */}
          <div className="relative w-full max-w-sm">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-clinical-500">
              <IconSearch />
            </span>
            <input
              type="search"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Buscar por nombre de paciente..."
              aria-label="Buscar estudios"
              className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05]
                         py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-clinical-600
                         transition focus:border-electric-500 focus:outline-none
                         focus:ring-2 focus:ring-electric-500/25"
            />
            {search && (
              <button
                type="button"
                onClick={() => handleSearch('')}
                aria-label="Limpiar busqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-clinical-500
                           transition hover:text-clinical-300"
              >
                <IconX />
              </button>
            )}
          </div>

          {/* Filtro de estado */}
          <select
            value={estadoFilter}
            onChange={e => setEstadoFilter(e.target.value)}
            aria-label="Filtrar por estado"
            className="rounded-xl border border-white/[0.09] bg-white/[0.05]
                       py-2.5 px-3 text-sm text-white
                       transition focus:border-electric-500 focus:outline-none
                       focus:ring-2 focus:ring-electric-500/25"
          >
            {ESTADO_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-clinical-900 text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Boton nuevo estudio */}
        <button
          type="button"
          onClick={openNew}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-electric-gradient
                     px-4 py-2.5 text-sm font-semibold text-white
                     shadow-[0_4px_20px_-6px_rgba(122,34,255,0.5)]
                     transition hover:brightness-110 active:brightness-95"
        >
          <IconPlus />
          Nuevo Estudio
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-400/30
                        bg-red-400/10 px-4 py-3 text-sm text-red-300">
          <IconAlert />
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-white/[0.07]
                      bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] text-left">
                {['Paciente', 'Tipo Estudio', 'Fecha', 'Medico Solicitante', 'Estado'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[11px] font-semibold uppercase
                               tracking-[0.14em] text-clinical-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading && <Skeleton.TableRows rows={8} cols={5} />}

              {!loading && estudios.length === 0 && !error && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-clinical-500">
                    {query || estadoFilter
                      ? 'Sin resultados para los filtros aplicados.'
                      : 'No hay estudios registrados en esta clinica.'}
                  </td>
                </tr>
              )}

              {!loading && estudios.map(est => (
                <EstudioRow key={est.id} estudio={est} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginacion */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/[0.07]
                          px-4 py-3 text-xs text-clinical-500">
            <span>
              Pagina {page} de {totalPages} - {totalCount} registros
            </span>
            <div className="flex items-center gap-1">
              <PagBtn
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                label="<"
              />
              {buildPageRange(page, totalPages).map((n, i) =>
                n === '...'
                  ? <span key={`ellipsis-${i}`} className="px-1">...</span>
                  : (
                    <PagBtn
                      key={n}
                      onClick={() => setPage(n)}
                      active={n === page}
                      label={n}
                    />
                  ),
              )}
              <PagBtn
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                label=">"
              />
            </div>
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {formOpen && (
        <EstudioFormModal
          onSave={handleSave}
          onClose={closeForm}
        />
      )}
    </>
  );
}

/* -- Fila individual -- */
function EstudioRow({ estudio }) {
  const paciente = estudio.pacientes;
  const name = paciente
    ? `${paciente.nombre} ${paciente.apellido ?? ''}`.trim()
    : 'Paciente desconocido';

  const estadoUI = ESTADO_DB_TO_UI[estudio.estado] ?? 'pendiente';
  const medicoSolicitante = estudio.metadata?.medico_solicitante ?? '-';

  return (
    <tr className="border-b border-white/[0.04] transition hover:bg-electric-500/[0.06]">
      <td className="px-4 py-3">
        <p className="font-medium text-white">{name}</p>
      </td>
      <td className="px-4 py-3 text-clinical-300">
        {estudio.tipo ?? '-'}
      </td>
      <td className="px-4 py-3 text-clinical-300">
        {estudio.fecha ? fmtDate(estudio.fecha) : '-'}
      </td>
      <td className="px-4 py-3 text-clinical-300">
        {medicoSolicitante}
      </td>
      <td className="px-4 py-3">
        <EstadoBadge estado={estadoUI} />
      </td>
    </tr>
  );
}

/* -- Badge de estado -- */
function EstadoBadge({ estado }) {
  const classes = BADGE_CLASSES[estado] ?? BADGE_CLASSES.pendiente;
  const label = BADGE_LABELS[estado] ?? 'Desconocido';

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5
                      text-[11px] font-semibold ${classes}`}>
      {label}
    </span>
  );
}

/* -- Modal de formulario -- */
function EstudioFormModal({ onSave, onClose }) {
  const [pacienteId,        setPacienteId]        = useState('');
  const [tipo,              setTipo]              = useState('');
  const [fecha,             setFecha]             = useState('');
  const [medicoSolicitante, setMedicoSolicitante] = useState('');
  const [estado,            setEstado]            = useState('pendiente');
  const [saving,            setSaving]            = useState(false);
  const [formError,         setFormError]         = useState(null);

  const { patients, loading: loadingPatients } = usePatients({ pageSize: 200 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pacienteId) {
      setFormError('Debe seleccionar un paciente.');
      return;
    }
    if (!tipo.trim()) {
      setFormError('El tipo de estudio es obligatorio.');
      return;
    }
    setSaving(true);
    setFormError(null);

    const data = {
      paciente_id: pacienteId,
      tipo: tipo.trim(),
      fecha: fecha || null,
      medico_solicitante: medicoSolicitante.trim() || null,
      estado,
    };

    const result = await onSave(data);
    setSaving(false);
    if (result.error) {
      setFormError(result.error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Nuevo estudio"
        className="relative w-full max-w-lg rounded-2xl border border-white/[0.08]
                      bg-clinical-900 p-6 shadow-2xl"
      >
        <h2 className="mb-4 font-display text-xl font-bold text-white">
          Nuevo Estudio
        </h2>

        {formError && (
          <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10
                          px-4 py-2 text-sm text-red-300">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Paciente */}
          <div>
            <label className="mb-1 block text-xs font-medium text-clinical-400">
              Paciente *
            </label>
            <select
              value={pacienteId}
              onChange={e => setPacienteId(e.target.value)}
              className="modal-input"
              required
            >
              <option value="" className="bg-clinical-900 text-white">
                {loadingPatients ? 'Cargando pacientes...' : 'Seleccionar paciente'}
              </option>
              {patients.map(p => (
                <option key={p.id} value={p.id} className="bg-clinical-900 text-white">
                  {p.nombre} {p.apellido ?? ''}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de estudio */}
          <div>
            <label className="mb-1 block text-xs font-medium text-clinical-400">
              Tipo de estudio *
            </label>
            <input
              type="text"
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              className="modal-input"
              placeholder="Ej: Radiografia de torax"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Fecha */}
            <div>
              <label className="mb-1 block text-xs font-medium text-clinical-400">
                Fecha
              </label>
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                className="modal-input"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="mb-1 block text-xs font-medium text-clinical-400">
                Estado
              </label>
              <select
                value={estado}
                onChange={e => setEstado(e.target.value)}
                className="modal-input"
              >
                <option value="pendiente" className="bg-clinical-900 text-white">Pendiente</option>
                <option value="en_proceso" className="bg-clinical-900 text-white">En Proceso</option>
                <option value="completado" className="bg-clinical-900 text-white">Completado</option>
              </select>
            </div>
          </div>

          {/* Medico solicitante */}
          <div>
            <label className="mb-1 block text-xs font-medium text-clinical-400">
              Medico solicitante
            </label>
            <input
              type="text"
              value={medicoSolicitante}
              onChange={e => setMedicoSolicitante(e.target.value)}
              className="modal-input"
              placeholder="Nombre del medico que solicita"
            />
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/[0.1] bg-white/[0.05]
                         px-4 py-2 text-sm font-medium text-clinical-300
                         transition hover:bg-white/[0.08]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-electric-gradient px-5 py-2 text-sm
                         font-semibold text-white shadow-[0_4px_20px_-6px_rgba(122,34,255,0.5)]
                         transition hover:brightness-110 active:brightness-95
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -- Boton de paginacion -- */
function PagBtn({ onClick, disabled, active, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-7 w-7 items-center justify-center rounded-lg
                  text-xs font-medium transition
                  ${active
                    ? 'bg-electric-500/20 text-electric-300 border border-electric-500/40'
                    : 'text-clinical-400 hover:bg-white/[0.06] hover:text-clinical-200'}
                  disabled:cursor-not-allowed disabled:opacity-30`}
    >
      {label}
    </button>
  );
}

/* -- Helpers -- */
function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

function buildPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total-4, total-3, total-2, total-1, total];
  return [1, '...', current-1, current, current+1, '...', total];
}

/* -- Micro-iconos SVG inline -- */
function IconSearch() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}
         viewBox="0 0 24 24" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
    </svg>
  );
}
function IconX() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconAlert() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round"
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}
