import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import { useAuth } from '@/hooks/useAuth.js';

/*
  useInformes — lista paginada de informes medicos con filtros.

  Consulta la tabla `informes` con join a `estudios` y `pacientes`.
  Filtra por clinica_id = profile.organization_id del usuario autenticado.

  Estados DB directos: borrador | rectificado | firmado
  UI labels: Borrador | Revisado | Firmado

  @param {object} opts
    search   : string — filtro por nombre/apellido del paciente (ilike)
    estado   : string — filtro por estado DB ('borrador'|'rectificado'|'firmado'|'')
    pageSize : number — registros por pagina (default 25)

  @returns {{
    informes       : array,
    loading        : bool,
    error          : string | null,
    totalCount     : number,
    page           : number,
    setPage        : fn,
    refresh        : fn,
    pageSize       : number,
    createInforme  : fn,
    updateInforme  : fn,
    firmarInforme  : fn,
  }}
*/

export function useInformes({ search = '', estado = '', pageSize = 25 } = {}) {
  const { profile } = useAuth();
  const clinicaId = profile?.organization_id ?? null;

  const [informes,   setInformes]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page,       setPage]       = useState(1);

  const abortRef = useRef(false);

  const fetchInformes = useCallback(async () => {
    if (!clinicaId) return;

    abortRef.current = false;
    setLoading(true);
    setError(null);

    const from = (page - 1) * pageSize;
    const to   = from + pageSize - 1;

    try {
      let query = supabase
        .from('informes')
        .select(
          `id, estudio_id, texto, estado, generado_por_ia, firmado_at, medico_id, created_at,
           estudios ( id, tipo, fecha, paciente_id, pacientes ( nombre, apellido, fecha_nacimiento, sexo, telefono ) )`,
          { count: 'exact' },
        )
        .eq('clinica_id', clinicaId)
        .order('created_at', { ascending: false })
        .range(from, to);

      // Filtro por estado (directo, sin mapeo)
      if (estado) {
        query = query.eq('estado', estado);
      }

      // Busqueda por nombre/apellido del paciente (via estudios → pacientes)
      // NOTA: PostgREST no soporta .or() sobre joins anidados.
      // Solución: buscar primero paciente_ids → luego estudio_ids → filtrar informes.
      if (search.trim()) {
        const term = `%${search.trim()}%`;

        const { data: pacientesMatch } = await supabase
          .from('pacientes')
          .select('id')
          .eq('clinica_id', clinicaId)
          .or(`nombre.ilike.${term},apellido.ilike.${term}`);

        const pacienteIds = (pacientesMatch ?? []).map(p => p.id);

        if (pacienteIds.length === 0) {
          if (!abortRef.current) {
            setInformes([]);
            setTotalCount(0);
            setLoading(false);
          }
          return;
        }

        const { data: estudiosMatch } = await supabase
          .from('estudios')
          .select('id')
          .eq('clinica_id', clinicaId)
          .in('paciente_id', pacienteIds);

        const estudioIds = (estudiosMatch ?? []).map(e => e.id);

        if (estudioIds.length === 0) {
          if (!abortRef.current) {
            setInformes([]);
            setTotalCount(0);
            setLoading(false);
          }
          return;
        }

        query = query.in('estudio_id', estudioIds);
      }

      const { data, error: sbError, count } = await query;

      if (abortRef.current) return;

      if (sbError) {
        console.error('[useInformes] Supabase error:', {
          code: sbError.code, message: sbError.message, details: sbError.details,
        });
        setError('No se pudieron cargar los informes. Verifica la conexion.');
        setInformes([]);
      } else {
        setInformes(data ?? []);
        setTotalCount(count ?? 0);
      }
    } catch (err) {
      if (!abortRef.current) {
        console.error('[useInformes] Unexpected error:', err);
        setError('Error inesperado al obtener informes.');
      }
    } finally {
      if (!abortRef.current) setLoading(false);
    }
  }, [clinicaId, search, estado, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, estado]);

  useEffect(() => {
    fetchInformes();
    return () => { abortRef.current = true; };
  }, [fetchInformes]);

  /* -- CRUD -- */

  const createInforme = useCallback(async (data) => {
    if (!clinicaId) return { data: null, error: 'Sin clinica asociada' };

    const payload = {
      estudio_id: data.estudio_id,
      texto: data.texto || '',
      estado: 'borrador',
      generado_por_ia: data.generado_por_ia || false,
      clinica_id: clinicaId,
      medico_id: profile?.id ?? null,
    };

    const { data: created, error: sbError } = await supabase
      .from('informes')
      .insert(payload)
      .select()
      .single();

    if (sbError) {
      console.error('[useInformes] create error:', sbError);
      return { data: null, error: sbError.message };
    }

    fetchInformes();
    return { data: created, error: null };
  }, [clinicaId, profile, fetchInformes]);

  const updateInforme = useCallback(async (id, data) => {
    if (!clinicaId) return { data: null, error: 'Sin clinica asociada' };

    const updates = {};
    if (data.texto !== undefined) updates.texto = data.texto;
    if (data.estado !== undefined) updates.estado = data.estado;
    if (data.generado_por_ia !== undefined) updates.generado_por_ia = data.generado_por_ia;

    const { data: updated, error: sbError } = await supabase
      .from('informes')
      .update(updates)
      .eq('id', id)
      .eq('clinica_id', clinicaId)
      .select()
      .single();

    if (sbError) {
      console.error('[useInformes] update error:', sbError);
      return { data: null, error: sbError.message };
    }

    fetchInformes();
    return { data: updated, error: null };
  }, [clinicaId, fetchInformes]);

  const firmarInforme = useCallback(async (id) => {
    if (!clinicaId) return { data: null, error: 'Sin clinica asociada' };

    const { data: updated, error: sbError } = await supabase
      .from('informes')
      .update({ estado: 'firmado', firmado_at: new Date().toISOString() })
      .eq('id', id)
      .eq('clinica_id', clinicaId)
      .select()
      .single();

    if (sbError) {
      console.error('[useInformes] firmar error:', sbError);
      return { data: null, error: sbError.message };
    }

    fetchInformes();
    return { data: updated, error: null };
  }, [clinicaId, fetchInformes]);

  return {
    informes,
    loading,
    error,
    totalCount,
    page,
    setPage,
    refresh: fetchInformes,
    pageSize,
    createInforme,
    updateInforme,
    firmarInforme,
  };
}
