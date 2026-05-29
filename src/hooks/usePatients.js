import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import { useAuth } from '@/hooks/useAuth.js';

/*
  usePatients — lista paginada de pacientes con busqueda en tiempo real.

  Consulta la tabla `pacientes` (schema en espanol).
  Filtra por clinica_id = profile.organization_id del usuario autenticado.

  @param {object} opts
    search   : string — texto libre para filtrar por nombre / apellido / documento
    pageSize : number — registros por pagina (default 25)

  @returns {{
    patients       : array,
    loading        : bool,
    error          : string | null,
    totalCount     : number,
    page           : number,
    setPage        : fn,
    refresh        : fn,
    pageSize       : number,
    createPatient  : fn,
    updatePatient  : fn,
    deletePatient  : fn,
  }}
*/
export function usePatients({ search = '', pageSize = 25 } = {}) {
  const { profile } = useAuth();
  const clinicaId = profile?.organization_id ?? null;

  const [patients,   setPatients]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page,       setPage]       = useState(1);

  const abortRef = useRef(false);

  const fetchPatients = useCallback(async () => {
    if (!clinicaId) return;

    abortRef.current = false;
    setLoading(true);
    setError(null);

    const from = (page - 1) * pageSize;
    const to   = from + pageSize - 1;

    try {
      let query = supabase
        .from('pacientes')
        .select(
          `id, nombre, apellido, fecha_nacimiento, sexo,
           documento, documento_tipo, telefono, email,
           direccion, ciudad, alergias, notas, created_at, updated_at`,
          { count: 'exact' },
        )
        .eq('clinica_id', clinicaId)
        .order('apellido', { ascending: true })
        .range(from, to);

      if (search.trim()) {
        const term = `%${search.trim()}%`;
        query = query.or(
          `nombre.ilike.${term},apellido.ilike.${term},documento.ilike.${term}`,
        );
      }

      const { data, error: sbError, count } = await query;

      if (abortRef.current) return;

      if (sbError) {
        console.error('[usePatients] Supabase error:', {
          code: sbError.code, message: sbError.message, details: sbError.details,
        });
        setError('No se pudieron cargar los pacientes. Verifica la conexion.');
        setPatients([]);
      } else {
        setPatients(data ?? []);
        setTotalCount(count ?? 0);
      }
    } catch (err) {
      if (!abortRef.current) {
        console.error('[usePatients] Unexpected error:', err);
        setError('Error inesperado al obtener pacientes.');
      }
    } finally {
      if (!abortRef.current) setLoading(false);
    }
  }, [clinicaId, search, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    fetchPatients();
    return () => { abortRef.current = true; };
  }, [fetchPatients]);

  /* ── CRUD ── */

  const createPatient = useCallback(async (data) => {
    if (!clinicaId) return { data: null, error: 'Sin clinica asociada' };

    const payload = { ...data, clinica_id: clinicaId };
    const { data: created, error: sbError } = await supabase
      .from('pacientes')
      .insert(payload)
      .select()
      .single();

    if (sbError) {
      console.error('[usePatients] create error:', sbError);
      return { data: null, error: sbError.message };
    }

    fetchPatients();
    return { data: created, error: null };
  }, [clinicaId, fetchPatients]);

  const updatePatient = useCallback(async (id, data) => {
    const { data: updated, error: sbError } = await supabase
      .from('pacientes')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (sbError) {
      console.error('[usePatients] update error:', sbError);
      return { data: null, error: sbError.message };
    }

    fetchPatients();
    return { data: updated, error: null };
  }, [fetchPatients]);

  const deletePatient = useCallback(async (id) => {
    const { error: sbError } = await supabase
      .from('pacientes')
      .delete()
      .eq('id', id);

    if (sbError) {
      console.error('[usePatients] delete error:', sbError);
      return { data: null, error: sbError.message };
    }

    fetchPatients();
    return { data: null, error: null };
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
    createPatient,
    updatePatient,
    deletePatient,
  };
}
