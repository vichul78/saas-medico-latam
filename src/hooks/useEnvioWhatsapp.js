import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import { useAuth } from '@/hooks/useAuth.js';
import { sendWhatsAppResult } from '@/lib/twilioWhatsapp.js';

/**
 * useEnvioWhatsapp — hook para enviar un informe firmado por WhatsApp.
 *
 * Flujo:
 *  1. Obtiene datos del informe (estudio + paciente)
 *  2. Valida que el estado sea 'firmado'
 *  3. Genera token unico y lo inserta en informe_tokens (24h de expiracion)
 *  4. Construye la URL publica del resultado
 *  5. Envia el mensaje via Twilio (client-side, solo dev)
 *
 * @returns {{
 *   sendResultado: (informeId: string) => Promise<{success: boolean, error: string|null}>,
 *   loading: boolean,
 *   error: string|null,
 *   success: boolean,
 *   reset: () => void,
 * }}
 */
export function useEnvioWhatsapp() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(false);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  const sendResultado = useCallback(async (informeId) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Fetch informe with estudio + paciente data
      const { data: informe, error: fetchError } = await supabase
        .from('informes')
        .select(`
          id,
          texto,
          estado,
          clinica_id,
          estudios (
            tipo,
            fecha,
            paciente_id,
            pacientes (
              nombre,
              apellido,
              telefono
            )
          )
        `)
        .eq('id', informeId)
        .single();

      if (fetchError || !informe) {
        const msg = fetchError?.message || 'No se pudo obtener el informe';
        setError(msg);
        setLoading(false);
        return { success: false, error: msg };
      }

      // 2. Validate estado === 'firmado'
      if (informe.estado !== 'firmado') {
        const msg = 'Solo se pueden enviar informes con estado "firmado"';
        setError(msg);
        setLoading(false);
        return { success: false, error: msg };
      }

      const paciente = informe.estudios?.pacientes;
      if (!paciente || !paciente.telefono) {
        const msg = 'El paciente no tiene telefono registrado';
        setError(msg);
        setLoading(false);
        return { success: false, error: msg };
      }

      // 3. Generate unique token
      const token = crypto.randomUUID();

      // 4. Insert into informe_tokens with 24h expiry
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const clinicaId = profile?.organization_id || informe.clinica_id;

      const { error: insertError } = await supabase
        .from('informe_tokens')
        .insert({
          informe_id: informeId,
          clinica_id: clinicaId,
          token,
          expires_at: expiresAt,
        });

      if (insertError) {
        const msg = insertError.message || 'Error al crear token de acceso';
        setError(msg);
        setLoading(false);
        return { success: false, error: msg };
      }

      // 5. Build public URL
      const linkUrl = `${window.location.origin}/resultado/${token}`;

      // 6. Generate summary (first 200 chars + ellipsis)
      const textoCompleto = informe.texto || '';
      const resumenTexto = textoCompleto.length > 200
        ? textoCompleto.substring(0, 200) + '... Ver informe completo en el enlace'
        : textoCompleto;

      // 7. Send via Twilio
      const pacienteNombre = `${paciente.nombre || ''} ${paciente.apellido || ''}`.trim();
      const result = await sendWhatsAppResult({
        informeId,
        pacienteTelefono: paciente.telefono,
        pacienteNombre,
        resumenTexto,
        linkUrl,
      });

      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return { success: false, error: result.error };
      }

      setSuccess(true);
      setLoading(false);
      return { success: true, error: null };
    } catch (err) {
      const msg = err.message || 'Error inesperado al enviar resultado';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  }, [profile]);

  return { sendResultado, loading, error, success, reset };
}
