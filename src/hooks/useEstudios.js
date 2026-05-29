import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import { useAuth } from '@/hooks/useAuth.js';

/*
  useEstudios — lista paginada de estudios medicos con filtros.

  Consulta la tabla `estudios` con join a `pacientes` para mostrar nombre.
  Filtra por clinica_id = profile.organization_id del usuario autenticado.

  Mapeo UI → DB para estado:
    pendiente   → ['recibido', 'pendiente_lectura']
    en_proceso  → ['en_lectura']
    completado  → ['informado', 'entregado']
    cancelado   → ['cancelado']

  @param {object} opts
    search   : string — filtro por nombre/apellido del paciente (ilike)
    estado   : string — filtro por estado UI ('pendiente'|'en_proceso'|'completado'|'cancelado'|'')
    pageSize : number — registros por pagina (default 25)

  @returns {{
    estudios       : array,
    loading        : bool,
    error          : string | null,
    totalCount     : number,
    page           : number,
    setPage        : fn,
    refresh        : fn,
    pageSize       : number,
    createEstudio  : fn,
  }}
*/

const ESTADO_UI_TO_DB = {
  pendiente:  ['recibido', 'pendiente_lectura'],
  en_proceso: ['en_lectura'],
  completado: ['informado', 'entregado'],
  cancelado:  ['cancelado'],
};

export function useEstudios({ search = '', estado = '', pageSize = 25, enabled = true } = {}) {
  const { profile } = useAuth();
  const clinicaId = profile?.organization_id ?? null;

  const [estudios,   setEstudios]   = useState([]);
  const [loading,    setLoading]    = useState(enabled);
  const [error,      setError]      = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page,       setPage]       = useState(1);

  const abortRef = useRef(false);

  const fetchEstudios = useCallback(async () => {
    if (!clinicaId || !enabled) return;

    abortRef.current = false;
    setLoading(true);
    setError(null);

    const from = (page - 1) * pageSize;
    const to   = from + pageSize - 1;

    try {
      let query = supabase
        .from('estudios')
        .select(
          `id, paciente_id, tipo, fecha, estado, metadata, created_at,
           pacientes ( nombre, apellido )`,
          { count: 'exact' },
        )
        .eq('clinica_id', clinicaId)
        .order('fecha', { ascending: false })
        .range(from, to);

      // Filtro por estado (mapeado de UI a DB)
      if (estado && ESTADO_UI_TO_DB[estado]) {
        query = query.in('estado', ESTADO_UI_TO_DB[estado]);
      }

      // Busqueda por nombre/apellido del paciente
      if (search.trim()) {
        const term = `%${search.trim()}%`;
        query = query.or(
          `pacientes.nombre.ilike.${term},pacientes.apellido.ilike.${term}`,
        );
      }

      const { data, error: sbError, count } = await query;

      if (abortRef.current) return;

      if (sbError) {
        console.error('[useEstudios] Supabase error:', {
          code: sbError.code, message: sbError.message, details: sbError.details,
        });
        setError('No se pudieron cargar los estudios. Verifica la conexion.');
        setEstudios([]);
      } else {
        setEstudios(data ?? []);
        setTotalCount(count ?? 0);
      }
    } catch (err) {
      if (!abortRef.current) {
        console.error('[useEstudios] Unexpected error:', err);
        setError('Error inesperado al obtener estudios.');
      }
    } finally {
      if (!abortRef.current) setLoading(false);
    }
  }, [clinicaId, search, estado, page, pageSize, enabled]);

  useEffect(() => {
    setPage(1);
  }, [search, estado]);

  useEffect(() => {
    fetchEstudios();
    return () => { abortRef.current = true; };
  }, [fetchEstudios]);

  /* -- CRUD -- */

  const createEstudio = useCallback(async (data) => {
    if (!clinicaId) return { data: null, error: 'Sin clinica asociada' };

    const dbEstado = ESTADO_UI_TO_DB[data.estado]?.[0] ?? 'recibido';

    const payload = {
      paciente_id: data.paciente_id,
      tipo: data.tipo,
      fecha: data.fecha,
      estado: dbEstado,
      metadata: {
        medico_solicitante: data.medico_solicitante || null,
      },
      clinica_id: clinicaId,
    };

    const { data: created, error: sbError } = await supabase
      .from('estudios')
      .insert(payload)
      .select()
      .single();

    if (sbError) {
      console.error('[useEstudios] create error:', sbError);
      return { data: null, error: sbError.message };
    }

    fetchEstudios();
    return { data: created, error: null };
  }, [clinicaId, fetchEstudios]);

  return {
    estudios,
    loading,
    error,
    totalCount,
    page,
    setPage,
    refresh: fetchEstudios,
    pageSize,
    createEstudio,
  };
}
