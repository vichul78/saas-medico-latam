import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient.js';

/*
  useHistorialEnvios — últimos envíos de un informe via share_tokens.

  Parámetros:
    - informeId (string | null): UUID del informe a consultar
    - enabled (bool): si false, no ejecuta la query

  Retorna:
    - historial: array de share_tokens con accessed_at, expires_at, created_at, metadata
    - loadingHistorial: boolean
*/
export function useHistorialEnvios(informeId, enabled = true) {
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  useEffect(() => {
    if (!informeId || !enabled) {
      setHistorial([]);
      return;
    }

    let cancelled = false;

    async function fetchHistorial() {
      setLoadingHistorial(true);
      try {
        const { data, error } = await supabase
          .from('share_tokens')
          .select('id, token, accessed_at, expires_at, created_at, metadata')
          .eq('informe_id', informeId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (cancelled) return;

        if (error) {
          console.error('[useHistorialEnvios] Error:', error.message);
          setHistorial([]);
        } else {
          setHistorial(data ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[useHistorialEnvios] Unexpected error:', err);
          setHistorial([]);
        }
      } finally {
        if (!cancelled) setLoadingHistorial(false);
      }
    }

    fetchHistorial();

    return () => { cancelled = true; };
  }, [informeId, enabled]);

  return { historial, loadingHistorial };
}
