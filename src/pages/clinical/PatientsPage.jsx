import { useState, useCallback, useRef } from 'react';
import { usePatients } from '@/hooks/usePatients.js';
import PatientDrawer   from '@/components/clinical/PatientDrawer.jsx';
import Skeleton        from '@/components/common/Skeleton.jsx';
import { useAuth }     from '@/hooks/useAuth.js';

/*
  PatientsPage — listado de pacientes con:
    - Busqueda en tiempo real (debounce 300 ms)
    - Tabla densa estilo clinico oscuro
    - Modal form para crear/editar paciente
    - Paginacion numerica
    - PatientDrawer al hacer clic en la fila
*/

export default function PatientsPage() {
  const { profile } = useAuth();
  const [search,   setSearch]   = useState('');
  const [query,    setQuery]    = useState('');
  const [selected, setSelected] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const debounceRef = useRef(null);

  const handleSearch = useCallback((val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(val), 300);
  }, []);

  const {
    patients, loading, error, totalCount, page, setPage, pageSize,
    refresh, createPatient, updatePatient,
  } = usePatients({ search: query });

  const totalPages = Math.ceil(totalCount / pageSize);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (patient) => {
    setEditing(patient);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSave = async (data) => {
    let result;
    if (editing) {
      result = await updatePatient(editing.id, data);
    } else {
      result = await createPatient(data);
    }
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
          Pacientes
        </h1>
        <p className="mt-1 text-sm text-clinical-400">
          {totalCount > 0
            ? `${totalCount.toLocaleString('es')} pacientes registrados`
            : 'Gestion del expediente clinico por paciente'}
        </p>
      </div>

      {/* Barra de acciones */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Buscador */}
        <div className="relative w-full max-w-sm">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-clinical-500">
            <IconSearch />
          </span>
          <input
            type="search"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Buscar por nombre o cedula..."
            aria-label="Buscar pacientes"
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

        {/* Boton nuevo paciente */}
        <button
          type="button"
          onClick={openNew}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-electric-gradient
                     px-4 py-2.5 text-sm font-semibold text-white
                     shadow-[0_4px_20px_-6px_rgba(122,34,255,0.5)]
                     transition hover:brightness-110 active:brightness-95"
        >
          <IconPlus />
          Nuevo paciente
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
                {['Paciente', 'Cedula', 'Fecha Nac.', 'Telefono', 'Email', ''].map(h => (
                  <th
                    key={h || 'actions'}
                    className="px-4 py-3 text-[11px] font-semibold uppercase
                               tracking-[0.14em] text-clinical-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading && <Skeleton.TableRows rows={8} cols={6} />}

              {!loading && patients.length === 0 && !error && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-clinical-500">
                    {query
                      ? `Sin resultados para "${query}".`
                      : 'No hay pacientes registrados en esta clinica.'}
                  </td>
                </tr>
              )}

              {!loading && patients.map(p => (
                <PatientRow
                  key={p.id}
                  patient={p}
                  isSelected={selected === p.id}
                  onSelect={() => setSelected(p.id)}
                  onEdit={() => openEdit(p)}
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

      {/* Drawer de perfil */}
      <PatientDrawer
        patientId={selected}
        onClose={() => setSelected(null)}
      />

      {/* Modal de formulario */}
      {formOpen && (
        <PatientFormModal
          patient={editing}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}
    </>
  );
}

/* ── Modal de formulario ──────────────────────────────────────────── */
function PatientFormModal({ patient, onSave, onClose }) {
  const [nombre,          setNombre]          = useState(patient?.nombre ?? '');
  const [apellido,        setApellido]        = useState(patient?.apellido ?? '');
  const [documento,       setDocumento]       = useState(patient?.documento ?? '');
  const [fechaNacimiento, setFechaNacimiento] = useState(patient?.fecha_nacimiento ?? '');
  const [telefono,        setTelefono]        = useState(patient?.telefono ?? '');
  const [email,           setEmail]           = useState(patient?.email ?? '');
  const [saving,          setSaving]          = useState(false);
  const [formError,       setFormError]       = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setFormError('El nombre es obligatorio.');
      return;
    }
    setSaving(true);
    setFormError(null);

    const data = {
      nombre: nombre.trim(),
      apellido: apellido.trim() || null,
      documento: documento.trim() || null,
      documento_tipo: documento.trim() ? 'cedula' : null,
      fecha_nacimiento: fechaNacimiento || null,
      telefono: telefono.trim() || null,
      email: email.trim() || null,
    };

    const result = await onSave(data);
    setSaving(false);
    if (result.error) {
      setFormError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.08]
                      bg-clinical-900 p-6 shadow-2xl">
        <h2 className="mb-4 font-display text-xl font-bold text-white">
          {patient ? 'Editar paciente' : 'Nuevo paciente'}
        </h2>

        {formError && (
          <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10
                          px-4 py-2 text-sm text-red-300">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-clinical-400">
                Nombre *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className="modal-input"
                placeholder="Nombre"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-clinical-400">
                Apellido
              </label>
              <input
                type="text"
                value={apellido}
                onChange={e => setApellido(e.target.value)}
                className="modal-input"
                placeholder="Apellido"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-clinical-400">
              Cedula
            </label>
            <input
              type="text"
              value={documento}
              onChange={e => setDocumento(e.target.value)}
              className="modal-input"
              placeholder="Numero de documento"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-clinical-400">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                value={fechaNacimiento}
                onChange={e => setFechaNacimiento(e.target.value)}
                className="modal-input"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-clinical-400">
                Telefono
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                className="modal-input"
                placeholder="+57 300 000 0000"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-clinical-400">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="modal-input"
              placeholder="correo@ejemplo.com"
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

/* ── Fila individual ─────────────────────────────────────────────── */
function PatientRow({ patient, isSelected, onSelect, onEdit }) {
  const name     = `${patient.nombre} ${patient.apellido ?? ''}`.trim();
  const initials = getInitials(patient.nombre, patient.apellido);

  return (
    <tr
      onClick={onSelect}
      className={`cursor-pointer border-b border-white/[0.04] transition
                  hover:bg-electric-500/[0.06]
                  ${isSelected ? 'bg-electric-500/10' : ''}`}
    >
      {/* Nombre + avatar */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <InitialsAvatar initials={initials} sex={patient.sexo} />
          <div>
            <p className="font-medium text-white">{name}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-clinical-300">
        {patient.documento ?? '-'}
      </td>
      <td className="px-4 py-3 text-clinical-300">
        {patient.fecha_nacimiento ? fmtDate(patient.fecha_nacimiento) : '-'}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-clinical-300">
        {patient.telefono ?? '-'}
      </td>
      <td className="px-4 py-3 text-xs text-clinical-300">
        {patient.email ?? '-'}
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="rounded-lg p-1.5 text-clinical-500 transition
                     hover:bg-white/[0.06] hover:text-electric-400"
          aria-label="Editar paciente"
        >
          <IconPencil />
        </button>
      </td>
    </tr>
  );
}

/* ── Avatar de iniciales ─────────────────────────────────────────── */
function InitialsAvatar({ initials, sex }) {
  const bg = sex === 'F'
    ? 'bg-violet-500/20 border-violet-400/30 text-violet-300'
    : sex === 'M'
    ? 'bg-electric-500/20 border-electric-400/30 text-electric-300'
    : 'bg-clinical-700/40 border-clinical-600/30 text-clinical-300';

  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center
                  rounded-full border text-xs font-bold ${bg}`}
      aria-hidden
    >
      {initials}
    </span>
  );
}

/* ── Boton de paginacion ──────────────────────────────────────────── */
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

/* ── Helpers ─────────────────────────────────────────────────────── */
function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getInitials(first = '', last = '') {
  return `${first[0] ?? ''}${(last ?? '')[0] ?? ''}`.toUpperCase();
}

function buildPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total-4, total-3, total-2, total-1, total];
  return [1, '...', current-1, current, current+1, '...', total];
}

/* ── Micro-iconos SVG inline ─────────────────────────────────────── */
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
function IconPencil() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
