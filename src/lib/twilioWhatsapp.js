/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  ADVERTENCIA DE SEGURIDAD - SOLO PARA DESARROLLO LOCAL                     ║
 * ║                                                                            ║
 * ║  Este archivo expone credenciales de Twilio (ACCOUNT_SID, AUTH_TOKEN)      ║
 * ║  directamente en el navegador a traves de variables VITE_.                 ║
 * ║                                                                            ║
 * ║  NUNCA usar en produccion. Las credenciales quedan visibles en el          ║
 * ║  bundle JS del cliente y cualquier usuario puede extraerlas.               ║
 * ║                                                                            ║
 * ║  Para produccion, usar la implementacion server-side existente:            ║
 * ║    supabase/functions/send-whatsapp/index.ts                               ║
 * ║  (Supabase Edge Function que llama a Twilio de forma segura).              ║
 * ║                                                                            ║
 * ║  ESTE ARCHIVO DEBE ELIMINARSE O REEMPLAZARSE POR UNA LLAMADA A LA         ║
 * ║  EDGE FUNCTION ANTES DE DESPLEGAR A CUALQUIER ENTORNO PUBLICO.            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

/**
 * Envia un mensaje de WhatsApp con el resultado medico del paciente.
 *
 * @param {Object} params
 * @param {string} params.informeId        - ID del informe (para referencia)
 * @param {string} params.pacienteTelefono - Telefono del paciente (formato E.164)
 * @param {string} params.pacienteNombre   - Nombre del paciente
 * @param {string} params.resumenTexto     - Resumen del informe
 * @param {string} params.linkUrl          - URL publica del resultado
 * @returns {Promise<{success: boolean, error: string|null, messageSid: string|null}>}
 */
export async function sendWhatsAppResult({
  informeId,
  pacienteTelefono,
  pacienteNombre,
  resumenTexto,
  linkUrl,
}) {
  const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
  const authToken  = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
  const fromNumber = import.meta.env.VITE_TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

  if (!accountSid || !authToken) {
    return {
      success: false,
      error: 'Faltan credenciales de Twilio (VITE_TWILIO_ACCOUNT_SID / VITE_TWILIO_AUTH_TOKEN)',
      messageSid: null,
    };
  }

  const body = [
    `Hola ${pacienteNombre}, su resultado medico esta listo.`,
    ``,
    `Resumen: ${resumenTexto}`,
    ``,
    `Ver informe completo: ${linkUrl}`,
  ].join('\n');

  const formData = new URLSearchParams();
  formData.append('To', `whatsapp:${pacienteTelefono}`);
  formData.append('From', fromNumber);
  formData.append('Body', body);

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Error Twilio: ${response.status}`,
        messageSid: null,
      };
    }

    return {
      success: true,
      error: null,
      messageSid: data.sid || null,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Error de red al enviar WhatsApp',
      messageSid: null,
    };
  }
}
