import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import { useAuth }  from '@/hooks/useAuth.js';

/**
 * useInvoices — hook central del módulo de facturación.
 *
 * Respeta RLS: solo devuelve facturas del tenant del usuario autenticado.
 * La política `admin_invoices` filtra por organization_id.
 *
 * @param {object} opts
 *   status   : string | null — filtro de estado ('borrador'|'emitida'|'pagada'|...)
 *   pageSize : number        — registros por página (default 20)
 *   search   : string        — filtro por número de factura o nombre paciente
 *
 * @returns {{
 *   invoices, loading, error, totalCount, page, setPage,
 *   metrics, metricsLoading,
 *   createInvoice, updateInvoiceStatus,
 *   refresh
 * }}
 */
export function useInvoices({ status = null, pageSize = 20, search = '' } = {}) {
  const { organization } = useAuth();
  const orgId = organization?.id ?? null;
  const currency = organization?.currency ?? 'USD';

  const [invoices,       setInvoices]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [totalCount,     setTotalCount]     = useState(0);
  const [page,           setPage]           = useState(1);
  const [metrics,        setMetrics]        = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const abortRef = useRef(false);

  // ── Fetch lista de facturas ──────────────────────────────────────────────
  const fetchInvoices = useCallback(async () => {
    if (!orgId) return;
    abortRef.current = false;
    setLoading(true);
    setError(null);

    const from = (page - 1) * pageSize;
    const to   = from + pageSize - 1;

    try {
      // Modelo real en español: tabla `facturas` (monto/moneda/estado/concepto).
      let query = supabase
        .from('facturas')
        .select(
          `id, monto, moneda, estado, concepto, metadata, created_at,
           pacientes ( id, nombre, apellido, documento )`,
          { count: 'exact' },
        )
        .eq('clinica_id', orgId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (status) query = query.eq('estado', status);

      if (search.trim()) {
        const term = `%${search.trim()}%`;
        query = query.or(`concepto.ilike.${term}`);
      }

      const { data, error: sbErr, count } = await query;

      if (abortRef.current) return;
      if (sbErr) {
        // eslint-disable-next-line no-console
        console.error('[useInvoices] fetch error (EN):', {
          code: sbErr.code, message: sbErr.message, details: sbErr.details,
        });
        setError('No se pudieron cargar las facturas. Verifica la conexión.');
        setInvoices([]);
      } else {
        // Normaliza factura(ES) → forma legacy(EN) que consume BillingPage.
        const norm = (data ?? []).map((f) => ({
          id:             f.id,
          invoice_number: f.id?.slice(0, 8)?.toUpperCase() ?? '—',
          status:         f.estado,
          currency:       f.moneda,
          total:          Number(f.monto) || 0,
          issued_at:      f.created_at,
          due_at:         f.metadata?.due_at ?? null,
          notes:          f.concepto,
          patients: f.pacientes
            ? {
                id:          f.pacientes.id,
                first_name:  f.pacientes.nombre,
                last_name:   f.pacientes.apellido,
                national_id: f.pacientes.documento,
              }
            : null,
        }));
        setInvoices(norm);
        setTotalCount(count ?? 0);
      }
    } catch (err) {
      if (!abortRef.current) {
        // eslint-disable-next-line no-console
        console.error('[useInvoices] unexpected error:', err);
        setError('Error inesperado al cargar facturas.');
      }
    } finally {
      if (!abortRef.current) setLoading(false);
    }
  }, [orgId, status, search, page, pageSize]);

  // ── Fetch métricas financieras ───────────────────────────────────────────
  const fetchMetrics = useCallback(async () => {
    if (!orgId) return;
    setMetricsLoading(true);

    try {
      // Mes actual: primer y último día
      const now   = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

      const { data, error: sbErr } = await supabase
        .from('facturas')
        .select('estado, monto, moneda, created_at')
        .eq('clinica_id', orgId);

      if (sbErr) {
        // eslint-disable-next-line no-console
        console.error('[useInvoices] metrics error (EN):', {
          code: sbErr.code, message: sbErr.message,
        });
        return;
      }

      // Normaliza a la forma que usa el cálculo (status/total/issued_at).
      const rows = (data ?? []).map(r => ({
        status:    r.estado,
        total:     Number(r.monto) || 0,
        issued_at: (r.created_at ?? '').slice(0, 10),
      }));

      // Calcular métricas en memoria (evita múltiples queries)
      const thisMonth = rows.filter(r => r.issued_at >= start && r.issued_at <= end);
      const pagadas   = rows.filter(r => r.status === 'pagada');
      const pendientes= rows.filter(r => r.status === 'pendiente');
      const vencidas  = rows.filter(r => r.status === 'vencida');

      const sum = (arr) => arr.reduce((acc, r) => acc + (Number(r.total) || 0), 0);

      setMetrics({
        ingresosMes:     sum(thisMonth.filter(r => r.status === 'pagada')),
        totalFacturado:  sum(thisMonth),
        cuentasCobrar:   sum(pendientes),
        vencidas:        sum(vencidas),
        countMes:        thisMonth.length,
        countPagadas:    pagadas.length,
        countPendientes: pendientes.length,
        countVencidas:   vencidas.length,
        currency,
      });
    } finally {
      setMetricsLoading(false);
    }
  }, [orgId, currency]);

  useEffect(() => {
    setPage(1);
  }, [status, search]);

  useEffect(() => {
    fetchInvoices();
    return () => { abortRef.current = true; };
  }, [fetchInvoices]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // ── CREATE invoice ───────────────────────────────────────────────────────
  const createInvoice = useCallback(async (payload = {}) => {
    // Traduce payload legacy (total/currency/notes/patient_id) → modelo español.
    const insertData = {
      clinica_id:  orgId,
      paciente_id: payload.patient_id ?? payload.paciente_id ?? null,
      monto:       Number(payload.total ?? payload.monto ?? 0),
      moneda:      payload.currency ?? payload.moneda ?? organization?.currency ?? 'USD',
      estado:      payload.status ?? payload.estado ?? 'pendiente',
      concepto:    payload.notes ?? payload.concepto ?? null,
    };

    const { data, error: sbErr } = await supabase
      .from('facturas')
      .insert(insertData)
      .select()
      .single();

    if (sbErr) {
      // eslint-disable-next-line no-console
      console.error('[useInvoices] createInvoice error (EN):', {
        code: sbErr.code, message: sbErr.message,
      });
    } else {
      await fetchInvoices();
      await fetchMetrics();
    }

    return { data, error: sbErr };
  }, [orgId, organization, fetchInvoices, fetchMetrics]);

  // ── UPDATE status (ej. borrador → emitida → pagada) ──────────────────────
  const updateInvoiceStatus = useCallback(async (invoiceId, newStatus, extra = {}) => {
    // El modelo español usa la columna `estado` (no `status`/`paid_at`).
    const patch = { estado: newStatus, ...extra };

    const { data, error: sbErr } = await supabase
      .from('facturas')
      .update(patch)
      .eq('id', invoiceId)
      .select()
      .single();

    if (sbErr) {
      // eslint-disable-next-line no-console
      console.error('[useInvoices] updateStatus error (EN):', {
        code: sbErr.code, message: sbErr.message,
      });
    } else {
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: newStatus } : inv));
      await fetchMetrics();
    }

    return { data, error: sbErr };
  }, [fetchMetrics]);

  return {
    invoices,
    loading,
    error,
    totalCount,
    page,
    setPage,
    pageSize,
    metrics,
    metricsLoading,
    currency,
    refresh: fetchInvoices,
    createInvoice,
    updateInvoiceStatus,
  };
}
