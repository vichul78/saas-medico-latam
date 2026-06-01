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
    totalPacientes: 0,
    estudiosHoy: 0,
    informesPendientes: 0,
    estudiosRecientes: [],
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
      const [pacientesRes, estudiosHoyRes, informesPendRes, recientesRes] = await Promise.all([
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
      ]);

      // Verificar errores
      const errors = [pacientesRes, estudiosHoyRes, informesPendRes, recientesRes]
        .filter(r => r.error)
        .map(r => r.error.message);

      if (errors.length > 0) {
        console.error('[useDashboardMetrics] Supabase errors:', errors);
        setError('Error al cargar metricas del dashboard.');
      }

      setMetrics({
        totalPacientes: pacientesRes.count ?? 0,
        estudiosHoy: estudiosHoyRes.count ?? 0,
        informesPendientes: informesPendRes.count ?? 0,
        estudiosRecientes: recientesRes.data ?? [],
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
