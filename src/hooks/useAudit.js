import { useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import { useAuth } from '@/hooks/useAuth.js';

/*
  useAudit — registra acciones en la tabla audit_logs.

  Uso:
    const { log } = useAudit();
    await log('informes', 'firmar', informeId, { estado_anterior: 'borrador' });

  La inserción falla silenciosamente (no bloquea la acción principal).
*/
export function useAudit() {
  const { profile } = useAuth();

  const log = useCallback(
    async (tabla, accion, registroId, cambios = null) => {
      const clinicaId = profile?.organization_id ?? null;
      const usuarioId = profile?.id ?? null;

      if (!clinicaId || !usuarioId) return;

      const { error } = await supabase.from('audit_logs').insert({
        clinica_id:  clinicaId,
        usuario_id:  usuarioId,
        accion,
        tabla,
        registro_id: registroId ?? null,
        cambios:     cambios ?? null,
      });

      if (error) {
        // No lanzar — audit no debe romper el flujo principal
        console.warn('[useAudit] No se pudo registrar accion:', error.message);
      }
    },
    [profile],
  );

  return { log };
}
