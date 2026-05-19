import { useState, useCallback, useRef } from 'react';

/**
 * useCopilot — estado y lógica del Copiloto IA completamente desacoplados
 * del componente visual. Preparado para conectar cualquier backend LLM.
 *
 * ── Arquitectura LLM-ready ────────────────────────────────────────────
 * Para conectar un backend real, solo hay que reemplazar `simulateReply`
 * por una llamada real, sin tocar el componente de UI:
 *
 *   // Ejemplo OpenAI-compatible:
 *   const res = await fetch('/api/copilot', {
 *     method: 'POST',
 *     body: JSON.stringify({ messages: history, context }),
 *   });
 *   const { reply } = await res.json();
 *
 * ── Estructura de cada mensaje ────────────────────────────────────────
 * {
 *   id        : string   — uuid único
 *   role      : 'user' | 'assistant' | 'system'
 *   text      : string   — contenido visible
 *   timestamp : Date
 *   status    : 'sent' | 'pending' | 'error'
 *   meta?     : object   — datos extra (paciente, estudio, acción…)
 * }
 *
 * @param {object} opts
 *   context  : object  — contexto clínico activo {patient, study, appointment}
 *   onError  : fn(msg) — callback de error para la UI
 */
export function useCopilot({
  context = {},
  onError,
} = {}) {
  const INITIAL_MSG = {
    id:        'iris-welcome',
    role:      'assistant',
    text:      'Hola, soy **Iris**, tu copiloto clínico. Estoy lista para ayudarte a analizar estudios, resumir historiales, redactar informes y sugerir diagnósticos diferenciales.\n\n¿Con qué empezamos?',
    timestamp: new Date(),
    status:    'sent',
  };

  const [messages,  setMessages]  = useState([INITIAL_MSG]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const abortRef   = useRef(null);
  const msgCounter = useRef(1);

  // ── Helper: ID único para mensajes ──────────────────────────────────
  function nextId() {
    return `msg-${Date.now()}-${++msgCounter.current}`;
  }

  // ── Añade un mensaje al historial ───────────────────────────────────
  const pushMessage = useCallback((role, text, meta = {}) => {
    const msg = {
      id:        nextId(),
      role,
      text,
      timestamp: new Date(),
      status:    'sent',
      ...meta,
    };
    setMessages(prev => [...prev, msg]);
    return msg;
  }, []);

  // ── Marca el último mensaje del asistente como error ─────────────────
  const markLastError = useCallback(() => {
    setMessages(prev => prev.map((m, i) =>
      i === prev.length - 1 && m.role === 'assistant'
        ? { ...m, status: 'error', text: 'No se pudo obtener respuesta. Inténtalo de nuevo.' }
        : m
    ));
  }, []);

  // ── Simulador de respuesta IA (reemplazar por fetch real) ────────────
  // Soporta cancelación via AbortController para evitar race conditions.
  const simulateReply = useCallback(async (userText, signal) => {
    await new Promise((res, rej) => {
      const t = setTimeout(res, 900 + Math.random() * 600);
      signal.addEventListener('abort', () => { clearTimeout(t); rej(new DOMException('Aborted', 'AbortError')); });
    });
    return buildMockReply(userText, context);
  }, [context]);

  // ── Enviar mensaje ───────────────────────────────────────────────────
  const sendMessage = useCallback(async (text, meta = {}) => {
    const value = (text ?? input).trim();
    if (!value || loading) return;

    setInput('');
    setError(null);

    // Mensaje del usuario
    pushMessage('user', value, meta);

    // Placeholder "escribiendo…"
    const thinkingId = nextId();
    setMessages(prev => [...prev, {
      id: thinkingId, role: 'assistant', text: '', timestamp: new Date(), status: 'pending',
    }]);
    setLoading(true);

    // Cancelar petición anterior si existe
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      // ── PUNTO DE INTEGRACIÓN LLM ──────────────────────────────────
      // Reemplaza `simulateReply` por tu endpoint real.
      // La firma esperada: fn(userText, signal) → Promise<string>
      // ────────────────────────────────────────────────────────────
      const reply = await simulateReply(value, ctrl.signal);

      setMessages(prev => prev.map(m =>
        m.id === thinkingId
          ? { ...m, text: reply, status: 'sent' }
          : m
      ));
    } catch (err) {
      if (err.name === 'AbortError') return;
      // eslint-disable-next-line no-console
      console.error('[useCopilot] LLM error (original):', err);
      markLastError();
      const friendlyMsg = 'Error de conexión con el asistente IA. Verifica tu red.';
      setError(friendlyMsg);
      onError?.(friendlyMsg);
    } finally {
      setLoading(false);
    }
  }, [input, loading, pushMessage, simulateReply, markLastError, onError]);

  // ── Acciones rápidas: disparan sendMessage con texto predefinido ─────
  const triggerAction = useCallback((action) => {
    sendMessage(action.prompt, { actionId: action.id });
  }, [sendMessage]);

  // ── Limpiar conversación ─────────────────────────────────────────────
  const clearHistory = useCallback(() => {
    abortRef.current?.abort();
    setMessages([INITIAL_MSG]);
    setError(null);
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reintentar último mensaje fallido ────────────────────────────────
  const retryLast = useCallback(() => {
    const last = messages.findLast?.(m => m.role === 'user');
    if (last) sendMessage(last.text);
  }, [messages, sendMessage]);

  return {
    messages,
    input,
    setInput,
    loading,
    error,
    sendMessage,
    triggerAction,
    clearHistory,
    retryLast,
  };
}

// ── Generador de respuestas mock (reemplazar por LLM real) ─────────────
function buildMockReply(prompt, context) {
  const lower = prompt.toLowerCase();
  const pat   = context?.patient;
  const study = context?.study;

  if (lower.includes('informe') || lower.includes('reporte')) {
    return `**Borrador de informe radiológico**\n\nPaciente: ${pat?.name ?? '[NOMBRE]'}\nModalidad: ${study?.modality ?? 'CT'}\nFecha: ${new Date().toLocaleDateString('es')}\n\n**Hallazgos:**\n• Parénquima pulmonar sin consolidaciones activas.\n• Silueta cardiovascular dentro de límites normales (CTR < 0.50).\n• Sin derrame pleural bilateral.\n• Estructuras óseas sin lesiones líticas ni blásticas agudas.\n\n**Impresión:** Estudio dentro de parámetros normales para la edad del paciente.\n\n*Este borrador requiere revisión y firma del médico responsable.*`;
  }
  if (lower.includes('historial') || lower.includes('historia') || lower.includes('expediente')) {
    return pat
      ? `**Resumen del expediente — ${pat.name}**\n\nÚltima consulta: hace 3 semanas\nAlergias: ${pat.allergies?.join(', ') || 'Sin alergias registradas'}\nDiagnósticos activos: pendiente de conexión al módulo HCE.\n\n¿Deseas que genere un resumen más detallado o revise los estudios?`
      : '**Resumen de historial**\n\nNo hay paciente activo en el contexto actual. Abre un expediente desde el módulo de **Pacientes** para que pueda analizar el historial completo.';
  }
  if (lower.includes('cita') || lower.includes('resumen') || lower.includes('consulta')) {
    return '**Resumen de consulta**\n\nPara generar el resumen necesito los datos de la cita activa. Vincula la cita desde el módulo de **Citas y Agendas** y podré:\n\n• Redactar la nota SOAP\n• Sugerir diagnósticos CIE-10\n• Generar la receta o solicitud de estudios';
  }
  if (lower.includes('diferencial') || lower.includes('diagnóstico')) {
    return '**Diagnósticos diferenciales sugeridos**\n\nBasado en los hallazgos disponibles, considera:\n\n1. **Atelectasia subsegmentaria** — patrón de opacidad leve, bases pulmonares\n2. **Proceso neumónico incipiente** — distribución periférica, fiebre asociada\n3. **Contusión pulmonar** — si hay antecedente traumático\n\n*Nota: Este análisis es orientativo. La correlación clínica es obligatoria.*';
  }
  if (lower.includes('receta') || lower.includes('prescripción')) {
    return '**Plantilla de receta médica**\n\nPaciente: [NOMBRE]\nFecha: ' + new Date().toLocaleDateString('es') + '\n\n• Medicamento 1: _____ · dosis _____ · frecuencia _____\n• Medicamento 2: _____ · dosis _____ · frecuencia _____\n\nIndicaciones generales: _____\n\n*Conéctate al módulo HCE para autocompletar con el historial farmacológico.*';
  }
  if (lower.includes('hola') || lower.includes('ayuda') || lower.includes('puedes')) {
    return 'Claro, estoy aquí para ayudarte. Puedo:\n\n• 📋 **Resumir historiales** de pacientes\n• 🩻 **Generar informes** radiológicos\n• 💊 **Redactar recetas** y notas SOAP\n• 🔬 **Sugerir diagnósticos** diferenciales\n• 📅 **Resumir citas** médicas\n\nUsa los botones de acción rápida o escríbeme directamente.';
  }

  const fallbacks = [
    'Entendido. En cuanto conecte el módulo LLM procesaré tu consulta en tiempo real con el contexto clínico completo.',
    'Recibido. *(Modo demostración — respuestas simuladas hasta activar el endpoint de inferencia.)*\n\n¿Quieres explorar las acciones rápidas de la barra superior?',
    'Anotado. La integración con el modelo de lenguaje está configurada en `useCopilot.js` → función `simulateReply`. Reemplázala con tu endpoint para activar respuestas reales.',
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
