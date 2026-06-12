import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import { useAuth } from '@/hooks/useAuth.js';

/*
  useDashboardMetrics — metricas en tiempo real para el dashboard principal.

  Consulta la base de datos para obtener:
    - Total de pacientes de la clinica
    - Estudios del dia (creados hoy)
    - Informes pendientes (estado = 'borrador' o 'rectificado')
    - Ultimos 5 estudios recientes

  Todas las queries estan scoped por clinica_id via RLS.
*/

export function useDashboardMetrics() {
  const { profile } = useAuth();
  const clinicaId = profile?.organization_id ?? null;

  const [metrics, setMetrics] = useState({
    totalPacientes:    0,
    estudiosHoy:       0,
    informesPendientes: 0,
    estudiosRecientes: [],
    citasMes:          0,
    ingresosMes:       0,
    tendenciaEstudios: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    if (!clinicaId) return;

    setLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Ejecutar queries en paralelo
      // Fechas para queries de período
      const hace30Dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const hace7Dias  = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [
        pacientesRes,
        estudiosHoyRes,
        informesPendRes,
        recientesRes,
        citasMesRes,
        ingresosMesRes,
        estudios7dRes,
      ] = await Promise.all([
        // 1. Total pacientes
        supabase
          .from('pacientes')
          .select('id', { count: 'exact', head: true })
          .eq('clinica_id', clinicaId),

        // 2. Estudios creados hoy
        supabase
          .from('estudios')
          .select('id', { count: 'exact', head: true })
          .eq('clinica_id', clinicaId)
          .eq('fecha', today),

        // 3. Informes pendientes (borrador + rectificado)
        supabase
          .from('informes')
          .select('id', { count: 'exact', head: true })
          .eq('clinica_id', clinicaId)
          .in('estado', ['borrador', 'rectificado']),

        // 4. Ultimos 5 estudios recientes
        supabase
          .from('estudios')
          .select(`
            id, tipo, fecha, estado,
            pacientes ( nombre, apellido )
          `)
          .eq('clinica_id', clinicaId)
          .order('created_at', { ascending: false })
          .limit(5),

        // 5. Citas del mes (últimos 30 días)
        supabase
          .from('citas')
          .select('id', { count: 'exact', head: true })
          .eq('clinica_id', clinicaId)
          .gte('created_at', hace30Dias),

        // 6. Ingresos del mes (facturas pagadas, últimos 30 días)
        supabase
          .from('facturas')
          .select('monto')
          .eq('clinica_id', clinicaId)
          .eq('estado', 'pagada')
          .gte('created_at', hace30Dias),

        // 7. Estudios por día últimos 7 días (para sparkline)
        supabase
          .from('estudios')
          .select('fecha')
          .eq('clinica_id', clinicaId)
          .gte('fecha', hace7Dias)
          .order('fecha', { ascending: true }),
      ]);

      // Verificar errores (citas/facturas pueden fallar si tabla no existe aún — ignorar)
      const criticalErrors = [pacientesRes, estudiosHoyRes, informesPendRes, recientesRes]
        .filter(r => r.error)
        .map(r => r.error.message);

      if (criticalErrors.length > 0) {
        console.error('[useDashboardMetrics] Supabase errors:', criticalErrors);
        setError('Error al cargar metricas del dashboard.');
      }

      // Calcular ingresos totales del mes
      const ingresosMes = (ingresosMesRes.data ?? [])
        .reduce((sum, f) => sum + (parseFloat(f.monto) || 0), 0);

      // Agrupar estudios por día para sparkline (últimos 7 días)
      const hoy = new Date();
      const tendencia = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(hoy);
        d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().split('T')[0];
        const count = (estudios7dRes.data ?? []).filter(e => e.fecha === key).length;
        return { fecha: key, count };
      });

      setMetrics({
        totalPacientes:    pacientesRes.count ?? 0,
        estudiosHoy:       estudiosHoyRes.count ?? 0,
        informesPendientes: informesPendRes.count ?? 0,
        estudiosRecientes: recientesRes.data ?? [],
        citasMes:          citasMesRes.count ?? 0,
        ingresosMes,
        tendenciaEstudios: tendencia,
      });
    } catch (err) {
      console.error('[useDashboardMetrics] Unexpected error:', err);
      setError('Error inesperado al cargar metricas.');
    } finally {
      setLoading(false);
    }
  }, [clinicaId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, loading, error, refresh: fetchMetrics };
}
