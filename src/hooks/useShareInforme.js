import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient.js';

/**
 * useShareInforme — hook para compartir un informe via WhatsApp.
 *
 * Invoca la Edge Function `send-whatsapp` que genera un token temporal
 * y envia el enlace por WhatsApp via Twilio.
 *
 * @returns {{
 *   loading     : boolean,
 *   error       : string | null,
 *   data        : object | null,
 *   sendWhatsApp: fn(informeId, patientPhone, patientName, reportSummary) => Promise,
 *   reset       : fn,
 * }}
 */
export function useShareInforme() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [data, setData]       = useState(null);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  const sendWhatsApp = useCallback(async (informeId, patientPhone, patientName, reportSummary) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const { data: response, error: fnError } = await supabase.functions.invoke(
        'send-whatsapp',
        {
          body: {
            informe_id: informeId,
            patient_phone: patientPhone,
            patient_name: patientName,
            report_summary: reportSummary,
          },
        },
      );

      if (fnError) {
        setError(fnError.message || 'Error al enviar mensaje');
        setLoading(false);
        return;
      }

      if (response && !response.success) {
        setError(response.error || 'Error desconocido');
        // Still save share_url if available (token was created even if Twilio failed)
        if (response.share_url) {
          setData(response);
        }
        setLoading(false);
        return;
      }

      setData(response);
    } catch (err) {
      setError(err.message || 'Error inesperado al enviar mensaje');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, data, sendWhatsApp, reset };
}
