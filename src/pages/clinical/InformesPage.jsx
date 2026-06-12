import { useState, useCallback, useRef, useEffect } from 'react';
import { useInformes } from '@/hooks/useInformes.js';
import { useEstudios } from '@/hooks/useEstudios.js';
import { generateInformeIA } from '@/lib/anthropicClient.js';
import EnviarWhatsappBtn from '@/components/clinical/EnviarWhatsappBtn.jsx';
import SendWhatsAppModal from '@/components/clinical/SendWhatsAppModal.jsx';
import Skeleton from '@/components/common/Skeleton.jsx';

/*
  InformesPage — listado de informes medicos con:
    - Busqueda por nombre de paciente (debounce 300 ms)
    - Filtro por estado (borrador / rectificado / firmado)
    - Tabla densa estilo clinico oscuro
    - Modal form para crear/editar informe con generacion IA
    - Paginacion numerica
*/

const ESTADO_OPTIONS = [
  { value: '',            label: 'Todos' },
  { value: 'borrador',   label: 'Borrador' },
  { value: 'rectificado', label: 'Revisado' },
  { value: 'firmado',    label: 'Firmado' },
];

const BADGE_CLASSES = {
  borrador:    'border-amber-400/30 bg-amber-400/10 text-amber-300',
  rectificado: 'border-electric-400/30 bg-electric-400/10 text-electric-300',
  firmado:     'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
};

const BADGE_LABELS = {
  borrador:    'Borrador',
  rectificado: 'Revisado',
  firmado:     'Firmado',
};

export default function InformesPage() {
  const [search,       setSearch]       = useState('');
  const [query,        setQuery]        = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [formOpen,     setFormOpen]     = useState(false);
  const [editInforme,  setEditInforme]  = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const handleSearch = useCallback((val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(val), 300);
  }, []);

  const {
    informes, loading, error, totalCount, page, setPage, pageSize,
    createInforme, updateInforme, firmarInforme,
  } = useInformes({ search: query, estado: estadoFilter });

  const totalPages = Math.ceil(totalCount / pageSize);

  const [waInforme, setWaInforme] = useState(null);

  const openNew = () => { setEditInforme(null); setFormOpen(true); };
  const openEdit = (informe) => { setEditInforme(informe); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditInforme(null); };

  const handleSave = async (data) => {
    let result;
    if (editInforme) {
      result = await updateInforme(editInforme.id, data);
    } else {
      result = await createInforme(data);
    }
    if (!result.error) {
      closeForm();
    }
    return result;
  };

  const handleFirmar = async (id) => {
    return await firmarInforme(id);
  };

  return (
    <>
      {/* Cabecera de modulo */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-electric-400">
          Modulo clinico
        </p>
        <h1 className="font-display text-3xl font-bold text-white">
          Informes Medicos
        </h1>
        <p className="mt-1 text-sm text-clinical-400">
          {totalCount > 0
            ? `${totalCount.toLocaleString('es')} informes registrados`
            : 'Gestion de informes diagnosticos'}
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
              aria-label="Buscar informes"
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

        {/* Boton nuevo informe */}
        <button
          type="button"
          onClick={openNew}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-electric-gradient
                     px-4 py-2.5 text-sm font-semibold text-white
                     shadow-[0_4px_20px_-6px_rgba(122,34,255,0.5)]
                     transition hover:brightness-110 active:brightness-95"
        >
          <IconPlus />
          Nuevo Informe
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

      {/* Vista móvil — cards (solo < sm) */}
      <div className="block sm:hidden space-y-3">
        {loading && (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-white/[0.05]" />
            ))}
          </div>
        )}
        {!loading && informes.length === 0 && !error && (
          <p className="py-12 text-center text-sm text-clinical-500">
            {query || estadoFilter
              ? 'Sin resultados para los filtros aplicados.'
              : 'No hay informes registrados en esta clinica.'}
          </p>
        )}
        {!loading && informes.map(inf => (
          <InformeCard
            key={inf.id}
            informe={inf}
            onEdit={openEdit}
            onWhatsApp={() => setWaInforme(inf)}
          />
        ))}
      </div>

      {/* Vista desktop — tabla (sm+) */}
      <div className="hidden sm:block overflow-hidden rounded-xl border border-white/[0.07]
                      bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] text-left">
                {['Paciente', 'Tipo Estudio', 'Fecha', 'Estado', 'Acciones'].map(h => (
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

              {!loading && informes.length === 0 && !error && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-clinical-500">
                    {query || estadoFilter
                      ? 'Sin resultados para los filtros aplicados.'
                      : 'No hay informes registrados en esta clinica.'}
                  </td>
                </tr>
              )}

              {!loading && informes.map(inf => (
                <InformeRow
                  key={inf.id}
                  informe={inf}
                  onEdit={openEdit}
                  onWhatsApp={() => setWaInforme(inf)}
                />
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
        <InformeFormModal
          informe={editInforme}
          onSave={handleSave}
          onFirmar={handleFirmar}
          onClose={closeForm}
        />
      )}

      {/* Modal WhatsApp — por fila */}
      {waInforme && (
        <SendWhatsAppModal
          informe={waInforme}
          onClose={() => setWaInforme(null)}
        />
      )}
    </>
  );
}

/* -- Card mobile para informes -- */
function InformeCard({ informe, onEdit, onWhatsApp }) {
  const estudio = informe.estudios;
  const paciente = estudio?.pacientes;
  const name = paciente
    ? `${paciente.nombre} ${paciente.apellido ?? ''}`.trim()
    : 'Paciente desconocido';
  const esFirmado = informe.estado === 'firmado';

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-white text-sm leading-tight">{name}</p>
        <EstadoBadge estado={informe.estado} />
      </div>
      <p className="text-xs text-clinical-300">
        <span className="text-clinical-500">Estudio:</span>{' '}
        {estudio?.tipo ?? '-'}
      </p>
      <p className="text-xs text-clinical-400">
        {estudio?.fecha ? fmtDate(estudio.fecha) : 'Sin fecha'}
      </p>
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onEdit(informe)}
          className="rounded-lg border border-white/[0.1] bg-white/[0.05]
                     px-3 py-1.5 text-xs font-medium text-clinical-300
                     transition hover:bg-white/[0.08] hover:text-white"
        >
          Editar
        </button>
        {esFirmado && (
          <button
            type="button"
            onClick={onWhatsApp}
            className="rounded-lg border border-emerald-400/30 bg-emerald-500/10
                       px-3 py-1.5 text-xs font-medium text-emerald-300
                       transition hover:bg-emerald-500/20"
          >
            WhatsApp
          </button>
        )}
      </div>
    </div>
  );
}

/* -- Fila individual -- */
function InformeRow({ informe, onEdit, onWhatsApp }) {
  const estudio = informe.estudios;
  const paciente = estudio?.pacientes;
  const name = paciente
    ? `${paciente.nombre} ${paciente.apellido ?? ''}`.trim()
    : 'Paciente desconocido';
  const esFirmado = informe.estado === 'firmado';

  return (
    <tr className="border-b border-white/[0.04] transition hover:bg-electric-500/[0.06]">
      <td className="px-4 py-3">
        <p className="font-medium text-white">{name}</p>
      </td>
      <td className="px-4 py-3 text-clinical-300">
        {estudio?.tipo ?? '-'}
      </td>
      <td className="px-4 py-3 text-clinical-300">
        {estudio?.fecha ? fmtDate(estudio.fecha) : '-'}
      </td>
      <td className="px-4 py-3">
        <EstadoBadge estado={informe.estado} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(informe)}
            className="rounded-lg border border-white/[0.1] bg-white/[0.05]
                       px-3 py-1.5 text-xs font-medium text-clinical-300
                       transition hover:bg-white/[0.08] hover:text-white"
          >
            Editar
          </button>
          {esFirmado && (
            <button
              type="button"
              onClick={onWhatsApp}
              className="rounded-lg border border-emerald-400/30 bg-emerald-500/10
                         px-3 py-1.5 text-xs font-medium text-emerald-300
                         transition hover:bg-emerald-500/20"
            >
              WhatsApp
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

/* -- Badge de estado -- */
function EstadoBadge({ estado }) {
  const classes = BADGE_CLASSES[estado] ?? BADGE_CLASSES.borrador;
  const label = BADGE_LABELS[estado] ?? 'Desconocido';

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5
                      text-[11px] font-semibold ${classes}`}>
      {label}
    </span>
  );
}

/* -- Modal de formulario -- */
function InformeFormModal({ informe, onSave, onFirmar, onClose }) {
  const [estudioId,     setEstudioId]     = useState(informe?.estudio_id || '');
  const [texto,         setTexto]         = useState(informe?.texto || '');
  const [estado,        setEstado]        = useState(informe?.estado || 'borrador');
  const [generadoPorIA, setGeneradoPorIA] = useState(informe?.generado_por_ia || false);
  const [saving,        setSaving]        = useState(false);
  const [generating,    setGenerating]    = useState(false);
  const [formError,     setFormError]     = useState(null);
  const [localInforme,  setLocalInforme]  = useState(informe);

  const isEditing = !!informe;

  const { estudios, loading: loadingEstudios } = useEstudios({ pageSize: 200, enabled: !isEditing });

  const selectedEstudio = estudios.find(e => e.id === estudioId) || null;

  const handleGenerateIA = async () => {
    if (!selectedEstudio) {
      setFormError('Selecciona un estudio para generar el informe con IA.');
      return;
    }

    const paciente = selectedEstudio.pacientes;
    let edad = '';
    if (paciente?.fecha_nacimiento) {
      const birth = new Date(paciente.fecha_nacimiento);
      const today = new Date();
      edad = Math.floor((today - birth) / (365.25 * 24 * 60 * 60 * 1000));
    }

    setGenerating(true);
    setFormError(null);

    const result = await generateInformeIA({
      tipoEstudio: selectedEstudio.tipo || 'Estudio general',
      pacienteNombre: paciente ? `${paciente.nombre} ${paciente.apellido ?? ''}`.trim() : 'Paciente',
      pacienteSexo: paciente?.sexo || '',
      pacienteEdad: edad,
      contextoAdicional: '',
    });

    setGenerating(false);

    if (result.error) {
      setFormError(result.error);
    } else {
      setTexto(result.texto);
      setGeneradoPorIA(true);
    }
  };

  const handleFirmar = async () => {
    if (!informe?.id) return;
    setSaving(true);
    const result = await onFirmar(informe.id);
    setSaving(false);
    if (result.error) {
      setFormError(result.error);
    } else {
      setEstado('firmado');
      setLocalInforme({ ...localInforme, estado: 'firmado', id: informe.id });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing && !estudioId) {
      setFormError('Debe seleccionar un estudio.');
      return;
    }
    setSaving(true);
    setFormError(null);

    const data = isEditing
      ? { texto, estado, generado_por_ia: generadoPorIA }
      : { estudio_id: estudioId, texto, generado_por_ia: generadoPorIA };

    const result = await onSave(data);
    setSaving(false);
    if (result.error) {
      setFormError(result.error);
    }
  };

  const isFirmado = estado === 'firmado';

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
        aria-label={isEditing ? 'Editar informe' : 'Nuevo informe'}
        className="relative w-full max-w-lg rounded-2xl border border-white/[0.08]
                      bg-clinical-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="mb-4 font-display text-xl font-bold text-white">
          {isEditing ? 'Editar Informe' : 'Nuevo Informe'}
        </h2>

        {formError && (
          <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10
                          px-4 py-2 text-sm text-red-300">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Estudio */}
          <div>
            <label className="mb-1 block text-xs font-medium text-clinical-400">
              Estudio *
            </label>
            <select
              value={estudioId}
              onChange={e => setEstudioId(e.target.value)}
              className="modal-input"
              required={!isEditing}
              disabled={isEditing}
            >
              <option value="" className="bg-clinical-900 text-white">
                {loadingEstudios ? 'Cargando estudios...' : 'Seleccionar estudio'}
              </option>
              {estudios.map(est => (
                <option key={est.id} value={est.id} className="bg-clinical-900 text-white">
                  {est.pacientes ? `${est.pacientes.nombre} ${est.pacientes.apellido ?? ''}`.trim() : 'Sin paciente'} - {est.tipo ?? 'Sin tipo'} ({est.fecha ? fmtDate(est.fecha) : 'Sin fecha'})
                </option>
              ))}
            </select>
          </div>

          {/* Texto del informe */}
          <div>
            <label className="mb-1 block text-xs font-medium text-clinical-400">
              Texto del informe
            </label>
            <textarea
              value={texto}
              onChange={e => setTexto(e.target.value)}
              className="modal-input"
              style={{ minHeight: '200px' }}
              placeholder="Escriba el informe o genere con IA..."
              rows={8}
            />
          </div>

          {/* Generar con IA */}
          <div>
            <button
              type="button"
              onClick={handleGenerateIA}
              disabled={generating}
              className="flex items-center gap-2 rounded-xl border border-violet-400/30
                         bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300
                         transition hover:bg-violet-500/20 active:bg-violet-500/30
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <IconSparkles />
              )}
              {generating ? 'Generando...' : 'Generar con IA'}
            </button>
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
              disabled={isFirmado}
            >
              <option value="borrador" className="bg-clinical-900 text-white">Borrador</option>
              <option value="rectificado" className="bg-clinical-900 text-white">Revisado</option>
            </select>
          </div>

          {/* Firmar button (only when editing) */}
          {isEditing && estado !== 'firmado' && (
            <div>
              <button
                type="button"
                onClick={handleFirmar}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl border border-emerald-400/30
                           bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300
                           transition hover:bg-emerald-500/20 active:bg-emerald-500/30
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IconCheck />
                Firmar Informe
              </button>
            </div>
          )}

          {/* WhatsApp button after firmado */}
          {isFirmado && localInforme && (
            <div>
              <EnviarWhatsappBtn informe={localInforme} />
            </div>
          )}

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
function IconSparkles() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}
