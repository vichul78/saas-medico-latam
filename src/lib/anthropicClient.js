/**
 * ======================================================================
 *  ADVERTENCIA DE SEGURIDAD - SOLO PARA DESARROLLO LOCAL
 *
 *  Este archivo expone la clave de API de Anthropic (VITE_ANTHROPIC_API_KEY)
 *  directamente en el navegador a traves de variables VITE_.
 *
 *  NUNCA usar en produccion. La clave queda visible en el bundle JS del
 *  cliente y cualquier usuario puede extraerla.
 *
 *  Para produccion, usar una Supabase Edge Function o backend que llame
 *  a la API de Anthropic de forma segura (server-side).
 *
 *  ESTE ARCHIVO DEBE ELIMINARSE O REEMPLAZARSE POR UNA LLAMADA A UNA
 *  EDGE FUNCTION ANTES DE DESPLEGAR A CUALQUIER ENTORNO PUBLICO.
 *
 *  CONFIGURACION LOCAL:
 *  Para probar localmente, agrega esta variable a tu .env local
 *  (NO committear, .env esta en .gitignore):
 *    VITE_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxx
 * ======================================================================
 */

/**
 * Genera un informe medico usando la API de Anthropic (Claude).
 *
 * @param {Object} params
 * @param {string} params.tipoEstudio       - Tipo de estudio (ej: Radiografia de torax)
 * @param {string} params.pacienteNombre    - Nombre completo del paciente
 * @param {string} params.pacienteSexo      - Sexo del paciente (M/F)
 * @param {number|string} params.pacienteEdad - Edad del paciente
 * @param {string} [params.contextoAdicional] - Contexto clinico adicional
 * @returns {Promise<{texto: string, error: string|null}>}
 */
export async function generateInformeIA({
  tipoEstudio,
  pacienteNombre,
  pacienteSexo,
  pacienteEdad,
  contextoAdicional,
}) {
  // Production guard: prevent any calls outside dev mode
  if (!import.meta.env.DEV) {
    console.error('[anthropicClient] BLOQUEADO: No usar en produccion. Usar Edge Function.');
    return { texto: '', error: 'Modulo bloqueado en produccion. Usar Edge Function.' };
  }

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      texto: '',
      error: 'Falta la clave VITE_ANTHROPIC_API_KEY en las variables de entorno.',
    };
  }

  const userMessage = [
    `Tipo de estudio: ${tipoEstudio}`,
    `Paciente: ${pacienteNombre}`,
    `Sexo: ${pacienteSexo || 'No especificado'}`,
    `Edad: ${pacienteEdad || 'No especificada'}`,
    contextoAdicional ? `Contexto adicional: ${contextoAdicional}` : '',
  ].filter(Boolean).join('\n');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: 'Eres un radiologo experimentado. Genera un informe medico profesional en espanol basado en el tipo de estudio y datos del paciente. El informe debe incluir: Tecnica, Hallazgos, Impresion diagnostica.',
        messages: [
          { role: 'user', content: userMessage },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        texto: '',
        error: data.error?.message || `Error Anthropic: ${response.status}`,
      };
    }

    const texto = data.content?.[0]?.text || '';
    return { texto, error: null };
  } catch (err) {
    return {
      texto: '',
      error: err.message || 'Error de red al llamar a Anthropic',
    };
  }
}
