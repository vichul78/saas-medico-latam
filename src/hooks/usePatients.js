import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import { useAuth } from '@/hooks/useAuth.js';

/*
  usePatients — lista paginada de pacientes con búsqueda en tiempo real.

  Respeta RLS: solo devuelve pacientes de la organización del usuario autenticado.
  La política "org_patients_select" filtra automáticamente por organization_id
  usando la función current_org_id() definida en el schema.

  @param {object} opts
    search   : string — texto libre para filtrar por nombre / id nacional
    pageSize : number — registros por página (default 25)

  @returns {{
    patients     : array,
    loading      : bool,
    error        : string | null,
    totalCount   : number,
    page         : number,
    setPage      : fn,
    refresh      : fn,
  }}
*/
export function usePatients({ search = '', pageSize = 25 } = {}) {
  const { organization } = useAuth();
  const orgId = organization?.id ?? null;

  const [patients,   setPatients]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page,       setPage]       = useState(1);

  // Cancelación de fetch obsoleto cuando el componente desmonta o cambia búsqueda
  const abortRef = useRef(false);

  const fetchPatients = useCallback(async () => {
    if (!orgId) return;

    abortRef.current = false;
    setLoading(true);
    setError(null);

    const from = (page - 1) * pageSize;
    const to   = from + pageSize - 1;

    try {
      let query = supabase
        .from('patients')
        .select(
          `id, first_name, last_name, date_of_birth, biological_sex,
           national_id, national_id_type, phone, email, city,
           country_code, blood_type, allergies, created_at`,
          { count: 'exact' },
        )
        .eq('organization_id', orgId)
        .order('last_name', { ascending: true })
        .range(from, to);

      // Búsqueda: nombre completo o id nacional (ilike = case-insensitive)
      if (search.trim()) {
        const term = `%${search.trim()}%`;
        query = query.or(
          `first_name.ilike.${term},last_name.ilike.${term},national_id.ilike.${term}`,
        );
      }

      const { data, error: sbError, count } = await query;

      if (abortRef.current) return;

      if (sbError) {
        // Estrategia híbrida: log original EN en consola, estado en español
        // eslint-disable-next-line no-console
        console.error('[usePatients] Supabase error (EN):', {
          code: sbError.code, message: sbError.message, details: sbError.details,
        });
        setError('No se pudieron cargar los pacientes. Verifica la conexión.');
        setPatients([]);
      } else {
        setPatients(data ?? []);
        setTotalCount(count ?? 0);
      }
    } catch (err) {
      if (!abortRef.current) {
        // eslint-disable-next-line no-console
        console.error('[usePatients] Unexpected error:', err);
        setError('Error inesperado al obtener pacientes.');
      }
    } finally {
      if (!abortRef.current) setLoading(false);
    }
  }, [orgId, search, page, pageSize]);

  useEffect(() => {
    // Cuando cambia la búsqueda, regresamos a la página 1
    setPage(1);
  }, [search]);

  useEffect(() => {
    fetchPatients();
    return () => { abortRef.current = true; };
  }, [fetchPatients]);

  return {
    patients,
    loading,
    error,
    totalCount,
    page,
    setPage,
    refresh: fetchPatients,
    pageSize,
  };
}
