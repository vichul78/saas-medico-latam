import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import { useAuth } from '@/hooks/useAuth.js';

/**
 * useEnvioWhatsapp — hook para enviar un informe firmado por WhatsApp.
 *
 * Invoca la Edge Function `send-whatsapp` server-side (seguro, sin exponer
 * credenciales Twilio en el cliente).
 *
 * Flujo:
 *  1. Obtiene datos del informe (estudio + paciente)
 *  2. Valida que el estado sea 'firmado'
 *  3. Llama a la Edge Function que genera share_token y envia el mensaje
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

      // Validate phone: strip non-digits, ensure at least 10 digits, prepend '+' if missing
      const digitsOnly = paciente.telefono.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        const msg = 'El telefono del paciente debe tener al menos 10 digitos';
        setError(msg);
        setLoading(false);
        return { success: false, error: msg };
      }
      const telefonoNormalizado = paciente.telefono.startsWith('+')
        ? paciente.telefono
        : '+' + digitsOnly;

      // 3. Build summary (first 200 chars)
      const textoCompleto = informe.texto || '';
      const resumenTexto = textoCompleto.length > 200
        ? textoCompleto.substring(0, 200) + '...'
        : textoCompleto;

      const pacienteNombre = `${paciente.nombre || ''} ${paciente.apellido || ''}`.trim();

      // 4. Invoke Edge Function (server-side Twilio call — seguro)
      const { data: response, error: fnError } = await supabase.functions.invoke(
        'send-whatsapp',
        {
          body: {
            informe_id:     informeId,
            patient_phone:  telefonoNormalizado,
            patient_name:   pacienteNombre,
            report_summary: resumenTexto,
          },
        },
      );

      if (fnError) {
        const msg = fnError.message || 'Error al enviar mensaje';
        setError(msg);
        setLoading(false);
        return { success: false, error: msg };
      }

      if (response && !response.success) {
        const msg = response.error || 'Error desconocido al enviar WhatsApp';
        setError(msg);
        setLoading(false);
        return { success: false, error: msg };
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
