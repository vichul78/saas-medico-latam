import { useState, useRef, useEffect } from 'react';

/**
 * DicomCopilot — panel de IA radiológica anclado a la derecha.
 *
 * Modo oscuro estricto (#111827). Acentos electric/violet. CERO verde.
 * Flujo:
 *   1. Muestra hallazgos sugeridos por la IA (placeholder).
 *   2. Permite al médico escribir notas y generar el borrador de informe.
 *   3. Incluye botón "Generar informe" que pre-rellena la plantilla.
 */

const INITIAL_MESSAGES = [
  {
    role: 'system',
    text: 'Iris está analizando el estudio. Puedo sugerir hallazgos, generar el borrador del informe radiológico y calcular medidas básicas.',
  },
];

const QUICK_ACTIONS = [
  'Analizar hallazgos',
  'Generar informe',
  'Calcular CTR',
  'Describir opacidades',
  'Comparar con previo',
];

const REPORT_TEMPLATE = `INFORME RADIOLÓGICO
──────────────────────────────
Paciente: [NOMBRE]
Fecha:    [FECHA]
Modalidad: [MODALIDAD]
──────────────────────────────

TÉCNICA:
Estudio realizado con [TÉCNICA].

HALLAZGOS:
• Parénquima pulmonar: [DESCRIPCIÓN]
• Silueta cardiovascular: [CTR < 0.5 normal]
• Estructuras óseas: [DESCRIPCIÓN]
• Mediastino: [DESCRIPCIÓN]

IMPRESIÓN DIAGNÓSTICA:
[CONCLUSIÓN]

Firmado: Dr/a. ___________________
Fecha de firma: [FECHA]
──────────────────────────────
NOTA: Este borrador fue generado por IA y requiere revisión médica.`;

export default function DicomCopilot({ study = null, patientName = null }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [tab,      setTab]      = useState('chat'); // 'chat' | 'report'
  const [report,   setReport]   = useState('');
  const endRef = useRef(null);

  /* Auto-scroll al último mensaje */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendMessage(text) {
    const value = (text ?? input).trim();
    if (!value) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: value }]);
    setLoading(true);

    /* Simula respuesta IA (se conectará al endpoint real) */
    setTimeout(() => {
      const response = buildAIResponse(value, study, patientName);
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
      setLoading(false);
    }, 800);
  }

  function generateReport() {
    setTab('report');
    const filled = REPORT_TEMPLATE
      .replace('[NOMBRE]',    patientName ?? '—')
      .replace('[FECHA]',     new Date().toLocaleDateString('es'))
      .replace('[MODALIDAD]', study?.modality ?? '—')
      .replace('[TÉCNICA]',   study?.modality === 'CT'
        ? 'técnica helicoidal sin contraste'
        : 'técnica estándar');
    setReport(filled);
  }

  return (
    <aside
      aria-label="Copiloto IA radiológico"
      className="flex w-72 shrink-0 flex-col border-l border-white/[0.06] bg-[#111827]"
    >
      {/* ── Cabecera ── */}
      <header className="border-b border-white/[0.06] bg-electric-gradient px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <IrisAvatar />
            <div>
              <p className="text-sm font-semibold leading-tight text-white">Iris · IA Radiol.</p>
              <p className="text-[10px] uppercase tracking-widest text-electric-100">
                Copiloto clínico
              </p>
            </div>
          </div>
          <StatusDot active={!loading} />
        </div>
      </header>

      {/* ── Pestañas Chat / Informe ── */}
      <div className="flex border-b border-white/[0.06]">
        {['chat', 'report'].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider
                        transition
                        ${tab === t
                          ? 'border-b-2 border-electric-500 text-electric-300'
                          : 'text-clinical-500 hover:text-clinical-300'}`}
          >
            {t === 'chat' ? 'Análisis' : 'Informe'}
          </button>
        ))}
      </div>

      {/* ── TAB: Chat de análisis ── */}
      {tab === 'chat' && (
        <>
          {/* Acciones rápidas */}
          <div className="flex flex-wrap gap-1.5 border-b border-white/[0.06] px-3 py-2">
            {QUICK_ACTIONS.map(a => (
              <button
                key={a}
                type="button"
                onClick={() => a === 'Generar informe' ? generateReport() : sendMessage(a)}
                className="rounded-full border border-electric-500/25 bg-electric-500/10
                           px-2 py-0.5 text-[10px] font-medium text-electric-300
                           transition hover:bg-electric-500/20"
              >
                {a}
              </button>
            ))}
          </div>

          {/* Mensajes */}
          <div className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
            {messages.map((m, i) => (
              <ChatBubble key={i} message={m} />
            ))}
            {loading && <ThinkingBubble />}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={e => { e.preventDefault(); sendMessage(); }}
            className="flex items-center gap-2 border-t border-white/[0.06] p-3"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Pregunta a Iris…"
              aria-label="Mensaje al copiloto radiológico"
              className="flex-1 rounded-xl border border-white/[0.09] bg-white/[0.05]
                         px-3 py-2 text-xs text-white placeholder:text-clinical-600
                         transition focus:border-electric-500 focus:outline-none
                         focus:ring-2 focus:ring-electric-500/20"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl
                         bg-electric-gradient text-white transition
                         hover:brightness-110 disabled:opacity-40"
              aria-label="Enviar"
            >
              <SendIcon />
            </button>
          </form>
        </>
      )}

      {/* ── TAB: Borrador de informe ── */}
      {tab === 'report' && (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
            <p className="text-[11px] font-medium text-clinical-400">Borrador generado por IA</p>
            <button
              type="button"
              onClick={generateReport}
              className="text-[10px] font-medium text-electric-400 hover:underline"
            >
              Regenerar
            </button>
          </div>

          {report ? (
            <textarea
              value={report}
              onChange={e => setReport(e.target.value)}
              aria-label="Borrador del informe radiológico"
              className="flex-1 resize-none bg-transparent p-3 font-mono text-[11px]
                         leading-relaxed text-clinical-300 focus:outline-none"
              spellCheck={false}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
              <p className="text-center text-xs text-clinical-600">
                Selecciona "Generar informe" en el chat o pulsa el botón de abajo.
              </p>
              <button
                type="button"
                onClick={generateReport}
                className="rounded-xl bg-electric-gradient px-4 py-2 text-xs font-semibold
                           text-white shadow-[0_4px_20px_-6px_rgba(122,34,255,0.5)]
                           transition hover:brightness-110"
              >
                Generar informe
              </button>
            </div>
          )}

          {/* Acciones del informe */}
          {report && (
            <div className="flex items-center gap-2 border-t border-white/[0.06] p-3">
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(report)}
                className="flex-1 rounded-xl border border-white/[0.09] py-2 text-xs
                           font-medium text-clinical-400 transition
                           hover:border-electric-500/30 hover:text-electric-300"
              >
                Copiar
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl bg-electric-gradient py-2 text-xs
                           font-semibold text-white transition hover:brightness-110"
              >
                Firmar
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

/* ── Burbuja de chat ── */
function ChatBubble({ message }) {
  const isUser   = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/10
                      px-3 py-2 text-[11px] leading-relaxed text-violet-300">
        {message.text}
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[90%] rounded-xl px-3 py-2 text-[11px] leading-relaxed
          ${isUser
            ? 'bg-violet-500/20 text-violet-100'
            : 'bg-white/[0.06] text-clinical-200'}`}
      >
        {message.text}
      </div>
    </div>
  );
}

/* ── Indicador "pensando" ── */
function ThinkingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-xl bg-white/[0.06] px-3 py-2">
        {[0,1,2].map(i => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-electric-400"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Avatar de Iris (sin vello facial, líneas pulcras) ── */
function IrisAvatar() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center
                     rounded-full bg-white/10 ring-2 ring-electric-500/30">
      <svg viewBox="0 0 36 36" width="36" height="36" aria-hidden>
        {/* Fondo */}
        <circle cx="18" cy="18" r="18" fill="rgba(122,34,255,0.2)" />
        {/* Bata IA */}
        <path d="M8 33 C10 26 14 24 18 24 C22 24 26 26 28 33 Z" fill="rgba(255,255,255,0.15)" />
        {/* Cabeza limpia */}
        <circle cx="18" cy="16" r="7.5" fill="#F4F4F8" />
        {/* Cabello neutro estilizado */}
        <path d="M11 13 C12 8 14 7 18 7 C22 7 24 8 25 13 L23 14 C22 10 20 9 18 9 C16 9 14 10 13 14 Z"
              fill="#2F2F40" />
        {/* Ojos */}
        <circle cx="15" cy="16" r="1" fill="#1C1C29" />
        <circle cx="21" cy="16" r="1" fill="#1C1C29" />
        {/* Boca neutra — sin vello */}
        <path d="M15.5 20 Q18 21.5 20.5 20" fill="none" stroke="#1C1C29" strokeWidth="1" strokeLinecap="round" />
        {/* Chip IA en la sien */}
        <rect x="8" y="14" width="4" height="3" rx="0.8" fill="rgba(122,34,255,0.6)" />
        <path d="M9 12.5 v1.5 M11 12.5 v1.5" stroke="rgba(122,34,255,0.6)" strokeWidth="0.8" />
      </svg>
    </span>
  );
}

/* ── Dot de estado online ── */
function StatusDot({ active }) {
  return (
    <span className={`h-2 w-2 rounded-full ring-1 ring-black/20
      ${active ? 'bg-electric-400' : 'bg-clinical-600'}`}
      aria-label={active ? 'En línea' : 'Procesando'}
    />
  );
}

/* ── Icono send ── */
function SendIcon() {
  return (
    <svg className="h-4 w-4 translate-x-0.5" fill="none" stroke="currentColor"
         strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );
}

/* ── Generador de respuesta IA (placeholder hasta conectar LLM) ── */
function buildAIResponse(prompt, study, patientName) {
  const lower = prompt.toLowerCase();

  if (lower.includes('hallazgo') || lower.includes('analizar')) {
    return `Analizando el estudio ${study?.modality ?? 'CT'}:\n\n• Opacidades en base pulmonar derecha compatibles con condensación.\n• Silueta cardiovascular en límite superior de la normalidad (CTR ≈ 0.49).\n• Sin derrame pleural evidente.\n• Estructuras óseas sin alteraciones agudas.\n\n¿Deseas que genere el informe completo?`;
  }
  if (lower.includes('informe') || lower.includes('generar')) {
    return `Borrador generado. Ve a la pestaña "Informe" para revisarlo y firmarlo.`;
  }
  if (lower.includes('ctr') || lower.includes('cardiotorácico')) {
    return `Cálculo CTR (Índice Cardiotorácico):\n• Diámetro cardíaco medido: 14.2 cm\n• Diámetro torácico: 29.1 cm\n• CTR = 0.49 → dentro del rango normal (< 0.50)`;
  }
  if (lower.includes('opacidad') || lower.includes('condensación')) {
    return `Descripción de opacidades:\n• Consolidación subsegmentaria en segmento posterior del LID.\n• Sin broncograma aéreo visible.\n• Distribución periférica.\n• Posible etiología: atelectasia pasiva vs. proceso neumónico incipiente.`;
  }
  if (lower.includes('comparar') || lower.includes('previo')) {
    return `No hay estudios previos vinculados para este paciente${patientName ? ` (${patientName})` : ''}. ¿Deseas importar un estudio de comparación?`;
  }
  return `Entendido. Analizando: "${prompt}"\n\nConexión al modelo IA en configuración. Este es el modo demostración — las respuestas son ilustrativas hasta activar el endpoint de inferencia.`;
}
