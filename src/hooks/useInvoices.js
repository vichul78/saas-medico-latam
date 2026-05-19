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
      let query = supabase
        .from('invoices')
        .select(
          `id, invoice_number, status, currency, subtotal, tax_rate,
           tax_amount, total, issued_at, due_at, paid_at, payment_method,
           cfdi_uuid, nfse_number, notes, created_at,
           patients ( id, first_name, last_name, national_id ),
           doctors  ( id, profiles ( first_name, last_name ) )`,
          { count: 'exact' },
        )
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (status) query = query.eq('status', status);

      if (search.trim()) {
        const term = `%${search.trim()}%`;
        query = query.or(`invoice_number.ilike.${term}`);
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
        setInvoices(data ?? []);
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
        .from('invoices')
        .select('status, total, currency, issued_at, paid_at')
        .eq('organization_id', orgId);

      if (sbErr) {
        // eslint-disable-next-line no-console
        console.error('[useInvoices] metrics error (EN):', {
          code: sbErr.code, message: sbErr.message,
        });
        return;
      }

      const rows = data ?? [];

      // Calcular métricas en memoria (evita múltiples queries)
      const thisMonth = rows.filter(r => r.issued_at >= start && r.issued_at <= end);
      const pagadas   = rows.filter(r => r.status === 'pagada');
      const pendientes= rows.filter(r => r.status === 'emitida' || r.status === 'borrador');
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
  const createInvoice = useCallback(async (payload) => {
    const insertData = {
      ...payload,
      organization_id: orgId,
      currency: payload.currency ?? organization?.currency ?? 'USD',
    };

    const { data, error: sbErr } = await supabase
      .from('invoices')
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
    const patch = {
      status: newStatus,
      ...(newStatus === 'pagada' ? { paid_at: new Date().toISOString() } : {}),
      ...extra,
    };

    const { data, error: sbErr } = await supabase
      .from('invoices')
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
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, ...patch } : inv));
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
