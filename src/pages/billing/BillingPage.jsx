import { useState, useRef } from 'react';
import { useInvoices }        from '@/hooks/useInvoices.js';
import { formatCurrency }     from '@/lib/currency.js';
import BillingStatusBadge, { STATUS_OPTIONS } from '@/components/billing/BillingStatusBadge.jsx';
import NewInvoiceModal        from '@/components/billing/NewInvoiceModal.jsx';
import Skeleton               from '@/components/common/Skeleton.jsx';

/**
 * BillingPage — Dashboard financiero principal de la clínica.
 *
 * Secciones:
 *   1. KPI Cards: Ingresos del mes, Total facturado, Cuentas por cobrar, Vencidas
 *   2. Tabla de facturas con filtros de estado + búsqueda + paginación
 *   3. Modal Nueva Factura con ítems dinámicos y soporte multidivisa
 *
 * Paleta: acentos electric/violet. CERO verde incluso en "Pagada".
 * Protegida: solo roles admin (router guard).
 */

/* ── Metadatos de KPIs ── */
const KPI_DEFS = [
  { id: 'ingMes',  label: 'Ingresos del mes',   field: 'ingresosMes',   countField: 'countPagadas',    accent: 'electric' },
  { id: 'facMes',  label: 'Total facturado',     field: 'totalFacturado',countField: 'countMes',        accent: 'violet'   },
  { id: 'cobrar',  label: 'Cuentas por cobrar',  field: 'cuentasCobrar', countField: 'countPendientes', accent: 'electric' },
  { id: 'vencida', label: 'Facturas vencidas',   field: 'vencidas',      countField: 'countVencidas',   accent: 'danger'   },
];

export default function BillingPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search,       setSearch]       = useState('');
  const [query,        setQuery]        = useState('');
  const [showModal,    setShowModal]    = useState(false);
  const debounceRef = useRef(null);

  const {
    invoices, loading, error, totalCount, page, setPage, pageSize,
    metrics, metricsLoading, currency,
    createInvoice, updateInvoiceStatus, refresh,
  } = useInvoices({ status: statusFilter || null, search: query });

  function handleSearch(val) {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(val), 300);
  }

  async function handleCreate(payload) {
    const { error: e } = await createInvoice(payload);
    if (!e) setShowModal(false);
    return { error: e };
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      {/* ── Cabecera ── */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-electric-400">
          Módulo financiero
        </p>
        <h1 className="font-display text-3xl font-bold text-white">
          Facturación y Cobros
        </h1>
        <p className="mt-1 text-sm text-clinical-400">
          Gestión de facturas, cobros y métricas financieras · Moneda activa:{' '}
          <span className="font-semibold text-electric-300">{currency}</span>
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metricsLoading
          ? [1,2,3,4].map(i => <Skeleton.Card key={i} rows={2} />)
          : KPI_DEFS.map(k => (
            <KpiCard
              key={k.id}
              label={k.label}
              value={metrics ? formatCurrency(metrics[k.field] ?? 0, currency, true) : '—'}
              sub={metrics ? `${metrics[k.countField] ?? 0} registros` : ''}
              accent={k.accent}
            />
          ))
        }
      </div>

      {/* ── Barra de acciones ── */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Buscador */}
        <div className="relative w-full max-w-xs">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-clinical-500">
            <SearchIcon />
          </span>
          <input
            type="search" value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Buscar por N° de factura…"
            aria-label="Buscar factura"
            className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05]
                       py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-clinical-600
                       transition focus:border-electric-500 focus:outline-none
                       focus:ring-2 focus:ring-electric-500/25"
          />
        </div>

        {/* Filtro estado */}
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          aria-label="Filtrar por estado"
          className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2.5
                     text-sm text-white focus:border-electric-500 focus:outline-none
                     focus:ring-2 focus:ring-electric-500/25"
        >
          <option value="" className="bg-clinical-900">Todos los estados</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s.value} value={s.value} className="bg-clinical-900">{s.label}</option>
          ))}
        </select>

        {/* Refresh */}
        <button type="button" onClick={refresh}
          className="flex items-center gap-2 rounded-xl border border-white/[0.09]
                     px-3 py-2.5 text-sm text-clinical-400 transition
                     hover:border-electric-500/30 hover:text-electric-400">
          <RefreshIcon /> Actualizar
        </button>

        {/* Nueva factura */}
        <button type="button" onClick={() => setShowModal(true)}
          className="ml-auto flex items-center gap-2 rounded-xl bg-electric-gradient
                     px-4 py-2.5 text-sm font-semibold text-white
                     shadow-[0_4px_20px_-6px_rgba(122,34,255,0.5)]
                     transition hover:brightness-110 active:brightness-95">
          <PlusIcon /> Nueva factura
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-400/30
                        bg-red-400/10 px-4 py-3 text-sm text-red-300">
          <AlertIcon className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* ── Tabla de facturas ── */}
      <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] text-left">
                {['N° Factura','Paciente','Moneda','Total','Estado','Emisión','Vence','Acciones'].map(h => (
                  <th key={h}
                    className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold
                               uppercase tracking-[0.14em] text-clinical-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <Skeleton.TableRows rows={6} cols={8} />}

              {!loading && invoices.length === 0 && !error && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-clinical-500">
                    {query || statusFilter
                      ? 'Sin resultados para los filtros aplicados.'
                      : 'No hay facturas registradas. Crea la primera con "Nueva factura".'}
                  </td>
                </tr>
              )}

              {!loading && invoices.map(inv => (
                <InvoiceRow
                  key={inv.id}
                  invoice={inv}
                  orgCurrency={currency}
                  onMarkPaid={() => updateInvoiceStatus(inv.id, 'pagada')}
                  onMarkCancelled={() => updateInvoiceStatus(inv.id, 'cancelada')}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/[0.07]
                          px-4 py-3 text-xs text-clinical-500">
            <span>Pág. {page}/{totalPages} · {totalCount} registros</span>
            <div className="flex gap-1">
              <PagBtn onClick={() => setPage(p => Math.max(1,p-1))}
                disabled={page===1} label="←" />
              <PagBtn onClick={() => setPage(p => Math.min(totalPages,p+1))}
                disabled={page===totalPages} label="→" />
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <NewInvoiceModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
          orgCurrency={currency}
        />
      )}
    </>
  );
}

/* ── Sub-componentes locales ── */

function KpiCard({ label, value, sub, accent }) {
  const S = {
    electric: { wrap: 'border-electric-500/20 bg-electric-500/[0.07]', val: 'text-electric-300' },
    violet:   { wrap: 'border-violet-500/20 bg-violet-500/[0.07]',     val: 'text-violet-300'   },
    danger:   { wrap: 'border-red-400/20 bg-red-400/[0.06]',            val: 'text-red-300'      },
  };
  const s = S[accent] ?? S.electric;
  return (
    <div className={`rounded-xl border p-4 ${s.wrap}`}>
      <p className="text-xs font-medium text-clinical-500">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold leading-none ${s.val}`}>{value}</p>
      <p className="mt-1 text-[11px] text-clinical-600">{sub}</p>
    </div>
  );
}

function InvoiceRow({ invoice: inv, orgCurrency, onMarkPaid, onMarkCancelled }) {
  const patName = inv.patients
    ? `${inv.patients.first_name} ${inv.patients.last_name}`.trim()
    : '—';
  return (
    <tr className="border-b border-white/[0.04] transition hover:bg-electric-500/[0.04]">
      <td className="px-4 py-3 font-mono text-xs text-electric-300">{inv.invoice_number}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <PatInitials name={patName} />
          <span className="text-sm text-white">{patName}</span>
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-clinical-400">
        {inv.currency ?? orgCurrency}
      </td>
      <td className="px-4 py-3 font-mono text-sm font-semibold text-white">
        {formatCurrency(Number(inv.total) || 0, inv.currency ?? orgCurrency)}
      </td>
      <td className="px-4 py-3">
        <BillingStatusBadge status={inv.status} size="xs" />
      </td>
      <td className="px-4 py-3 text-xs text-clinical-400">{fmtDate(inv.issued_at)}</td>
      <td className="px-4 py-3 text-xs text-clinical-400">{inv.due_at ? fmtDate(inv.due_at) : '—'}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {!['pagada','cancelada'].includes(inv.status) && (
            <button type="button" onClick={onMarkPaid} title="Marcar como pagada"
              className="rounded-lg border border-electric-500/30 bg-electric-500/10
                         px-2 py-1 text-[10px] font-semibold text-electric-300
                         transition hover:bg-electric-500/20">
              Cobrar
            </button>
          )}
          {!['pagada','cancelada'].includes(inv.status) && (
            <button type="button" onClick={onMarkCancelled} title="Cancelar"
              className="rounded-lg border border-white/[0.07] px-2 py-1
                         text-[10px] font-medium text-clinical-500
                         transition hover:border-red-400/30 hover:text-red-400">
              Cancelar
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function PatInitials({ name = '' }) {
  const parts = name.trim().split(' ');
  const i = `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                     bg-electric-500/20 text-[11px] font-bold text-electric-300" aria-hidden>
      {i}
    </span>
  );
}

function PagBtn({ onClick, disabled, label }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="flex h-7 w-7 items-center justify-center rounded-lg border
                 border-white/[0.08] text-xs text-clinical-400 transition
                 hover:border-electric-500/40 hover:text-electric-400
                 disabled:cursor-not-allowed disabled:opacity-30">
      {label}
    </button>
  );
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function SearchIcon()  { return <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>; }
function PlusIcon()    { return <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>; }
function RefreshIcon() { return <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>; }
function AlertIcon({ className }) { return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>; }
