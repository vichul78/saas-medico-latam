import { useState, useCallback, useRef } from 'react';
import { usePatients } from '@/hooks/usePatients.js';
import PatientDrawer   from '@/components/clinical/PatientDrawer.jsx';
import Badge           from '@/components/common/Badge.jsx';
import Skeleton        from '@/components/common/Skeleton.jsx';

/*
  PatientsPage — listado de pacientes con:
    • Búsqueda en tiempo real (debounce 300 ms)
    • Tabla densa estilo clínico oscuro
    • Avatares de iniciales sin vello facial
    • Skeleton mientras carga Supabase
    • Clic en fila → PatientDrawer desde la derecha (sin cambio de ruta)
    • Paginación numérica
    • CERO tonos verdes
*/

export default function PatientsPage() {
  const [search,   setSearch]   = useState('');
  const [query,    setQuery]    = useState('');        // valor debounced enviado al hook
  const [selected, setSelected] = useState(null);     // patientId del Drawer
  const debounceRef = useRef(null);

  const handleSearch = useCallback((val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(val), 300);
  }, []);

  const { patients, loading, error, totalCount, page, setPage, pageSize, refresh } =
    usePatients({ search: query });

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      {/* ── Cabecera de módulo ── */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-electric-400">
          Módulo clínico
        </p>
        <h1 className="font-display text-3xl font-bold text-white">
          Pacientes
        </h1>
        <p className="mt-1 text-sm text-clinical-400">
          {totalCount > 0
            ? `${totalCount.toLocaleString('es')} pacientes registrados`
            : 'Gestión del expediente clínico por paciente'}
        </p>
      </div>

      {/* ── Barra de acciones ── */}
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
            placeholder="Buscar por nombre o ID…"
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
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-clinical-500
                         transition hover:text-clinical-300"
            >
              <IconX />
            </button>
          )}
        </div>

        {/* Acción principal */}
        <button
          type="button"
          onClick={refresh}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-electric-gradient
                     px-4 py-2.5 text-sm font-semibold text-white
                     shadow-[0_4px_20px_-6px_rgba(122,34,255,0.5)]
                     transition hover:brightness-110 active:brightness-95"
        >
          <IconPlus />
          Nuevo paciente
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-400/30
                        bg-red-400/10 px-4 py-3 text-sm text-red-300">
          <IconAlert />
          {error}
        </div>
      )}

      {/* ── Tabla ── */}
      <div className="overflow-hidden rounded-xl border border-white/[0.07]
                      bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] text-left">
                {['Paciente', 'ID Nacional', 'Sexo', 'Edad', 'Teléfono', 'Ciudad'].map(h => (
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
              {/* Skeleton */}
              {loading && <Skeleton.TableRows rows={8} cols={6} />}

              {/* Sin resultados */}
              {!loading && patients.length === 0 && !error && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-clinical-500">
                    {query
                      ? `Sin resultados para "${query}".`
                      : 'No hay pacientes registrados en esta organización.'}
                  </td>
                </tr>
              )}

              {/* Filas */}
              {!loading && patients.map(p => (
                <PatientRow
                  key={p.id}
                  patient={p}
                  isSelected={selected === p.id}
                  onSelect={() => setSelected(p.id)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pie de tabla: paginación ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/[0.07]
                          px-4 py-3 text-xs text-clinical-500">
            <span>
              Página {page} de {totalPages} · {totalCount} registros
            </span>
            <div className="flex items-center gap-1">
              <PagBtn
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                label="←"
              />
              {buildPageRange(page, totalPages).map((n, i) =>
                n === '…'
                  ? <span key={`ellipsis-${i}`} className="px-1">…</span>
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
                label="→"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Drawer de perfil del paciente ── */}
      <PatientDrawer
        patientId={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

/* ── Fila individual ─────────────────────────────────────────────── */
function PatientRow({ patient, isSelected, onSelect }) {
  const age   = calcAge(patient.date_of_birth);
  const name  = `${patient.first_name} ${patient.last_name}`.trim();
  const initials = getInitials(patient.first_name, patient.last_name);

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
          <InitialsAvatar initials={initials} sex={patient.biological_sex} />
          <div>
            <p className="font-medium text-white">{name}</p>
            <p className="text-[11px] text-clinical-500">
              {patient.email ?? '—'}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-clinical-300">
        {patient.national_id ?? '—'}
      </td>
      <td className="px-4 py-3">
        {patient.biological_sex
          ? <Badge variant={patient.biological_sex} dot={false} />
          : <span className="text-clinical-600">—</span>}
      </td>
      <td className="px-4 py-3 text-clinical-300">
        {age !== null ? `${age} a` : '—'}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-clinical-300">
        {patient.phone ?? '—'}
      </td>
      <td className="px-4 py-3 text-clinical-300">
        {patient.city ?? '—'}
      </td>
    </tr>
  );
}

/* ── Avatar de iniciales clínico ─────────────────────────────────── */
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

/* ── Botón de paginación ──────────────────────────────────────────── */
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
function calcAge(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function getInitials(first = '', last = '') {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

function buildPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total-4, total-3, total-2, total-1, total];
  return [1, '…', current-1, current, current+1, '…', total];
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
