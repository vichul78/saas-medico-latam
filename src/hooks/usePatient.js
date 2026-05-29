import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient.js';

/*
  usePatient — detalle de un solo paciente desde la tabla `pacientes`.

  @param {string|null} patientId — UUID del paciente. null = no carga nada.
  @returns {{ patient, loading, error, refresh }}
*/
export function usePatient(patientId) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    if (!patientId) {
      setPatient(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: pat, error: patErr } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', patientId)
        .single();

      if (patErr) {
        console.error('[usePatient] fetch error:', {
          code: patErr.code, message: patErr.message,
        });
        setError('No se pudo cargar el perfil del paciente.');
        return;
      }
      setPatient(pat);
    } catch (err) {
      console.error('[usePatient] unexpected error:', err);
      setError('Error inesperado al cargar el paciente.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { patient, loading, error, refresh: fetch };
}
