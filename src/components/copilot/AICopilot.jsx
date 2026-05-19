import { useEffect, useRef, useState, useCallback } from 'react';
import { useCopilot }             from '@/hooks/useCopilot.js';
import { useSpeechRecognition }   from '@/hooks/useSpeechRecognition.js';
import { generateReportPdf }      from '@/lib/reportPdf.js';
import IrisAvatar                 from '@/components/copilot/IrisAvatar.jsx';

/**
 * AICopilot — panel del Copiloto IA clínico "Iris".
 *
 * Nuevas capacidades (v2):
 *   • Dictado por voz: botón micrófono con pulso eléctrico (CERO verde).
 *   • Impresión diagnóstica estructurada.
 *   • Exportación a PDF profesional con jsPDF.
 *
 * Reglas visuales:
 *   • Acentos: Púrpura Eléctrico (#7A22FF) y Violeta.
 *   • CERO tonos verdes en ningún estado.
 *   • Micrófono activo: animate-pulse bg-electric-500 + anillo violet.
 *   • PDF generado: badge violet (NUNCA verde).
 *   • Avatar Iris: chip IA, sin vello facial.
 */

// ── Acciones rápidas ──────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    id:    'impresion',
    label: 'Impresión diagnóstica',
    prompt:'Genera la estructura formal de un reporte radiológico con impresión diagnóstica.',
    color: 'border-electric-500/50 bg-electric-500/15 text-electric-200 hover:bg-electric-500/25',
  },
  {
    id:    'report',
    label: 'Generar informe',
    prompt:'Genera un borrador de informe radiológico con los datos disponibles.',
    color: 'border-electric-500/40 bg-electric-500/10 text-electric-300 hover:bg-electric-500/20',
  },
  {
    id:    'history',
    label: 'Analizar historial',
    prompt:'Analiza el historial clínico del paciente activo y dame un resumen.',
    color: 'border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20',
  },
  {
    id:    'summary',
    label: 'Resumir cita',
    prompt:'Resume la cita médica actual y genera una nota SOAP.',
    color: 'border-electric-500/40 bg-electric-500/10 text-electric-300 hover:bg-electric-500/20',
  },
  {
    id:    'differential',
    label: 'Diagnóstico diferencial',
    prompt:'Sugiere diagnósticos diferenciales basados en los hallazgos disponibles.',
    color: 'border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20',
  },
  {
    id:    'prescription',
    label: 'Redactar receta',
    prompt:'Ayúdame a redactar una prescripción médica con la plantilla estándar.',
    color: 'border-electric-400/30 bg-electric-400/10 text-electric-300 hover:bg-electric-400/20',
  },
];


// ── Componente principal ─────────────────────────────────────────────────────
export default function AICopilot({
  dark     = false,
  context  = {},
  onClose,
  isOpen   = true,
}) {
  const {
    messages, input, setInput, loading, error,
    sendMessage, triggerAction, clearHistory, retryLast,
    getLastAssistantText,
  } = useCopilot({ context });

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // ── PDF state ──────────────────────────────────────────────────────────────
  const [pdfState, setPdfState] = useState('idle'); // 'idle'|'generating'|'done'|'error'

  // ── Voz: integración SpeechRecognition ────────────────────────────────────
  const [voiceError, setVoiceError] = useState('');

  const handleTranscript = useCallback((text, isFinal) => {
    setInput(prev => {
      // Reemplaza el texto interim anterior por el nuevo
      if (!isFinal) return text;
      // Texto final: concatena al input existente con espacio
      const base = prev.replace(/\[…\]$/, '').trimEnd();
      return base ? `${base} ${text}` : text;
    });
  }, [setInput]);

  const {
    isListening, isSupported, interim,
    toggleListening, stopListening,
  } = useSpeechRecognition({
    lang:         context?.lang ?? 'es-MX',
    continuous:   false,
    onTranscript: handleTranscript,
    onError:      setVoiceError,
  });

  // Cuando termina de escuchar, mueve el foco al input
  useEffect(() => {
    if (!isListening) inputRef.current?.focus();
  }, [isListening]);

  // Muestra el texto interim en el input (prefijo […] para diferenciarlo)
  useEffect(() => {
    if (interim) setInput(prev => prev.replace(/\[…\].*$/, '') + `[…]${interim}`);
  }, [interim, setInput]);

  // Auto-scroll mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus al abrir
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const T = dark ? DARK_TOKENS : LIGHT_TOKENS;

  function handleSubmit(e) {
    e.preventDefault();
    if (isListening) stopListening();
    sendMessage();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isListening) stopListening();
      sendMessage();
    }
  }


  // ── PDF export ─────────────────────────────────────────────────────────────
  async function handleExportPdf() {
    const body = getLastAssistantText();
    if (!body.trim()) {
      triggerAction(QUICK_ACTIONS[0]); // genera impresión primero
      return;
    }
    setPdfState('generating');
    try {
      await new Promise(resolve => setTimeout(resolve, 50)); // yield para repaint
      generateReportPdf({
        title:           'Reporte Clínico · Iris IA',
        patientName:     context?.patient?.name,
        patientId:       context?.patient?.id,
        dob:             context?.patient?.dob,
        modality:        context?.study?.modality,
        studyDate:       context?.study?.studyDate,
        accessionNumber: context?.study?.accessionNumber,
        doctorName:      context?.doctorName,
        orgName:         context?.orgName,
        body,
      });
      setPdfState('done');
      setTimeout(() => setPdfState('idle'), 3500);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[AICopilot] generateReportPdf error:', err);
      setPdfState('error');
      setTimeout(() => setPdfState('idle'), 3000);
    }
  }

  return (
    <div aria-label="Copiloto IA clínico Iris" role="complementary"
         className={`flex h-full flex-col ${T.root}`}>

      {/* ── CABECERA ── */}
      <header className="flex shrink-0 items-center justify-between bg-electric-gradient px-4 py-3">
        <div className="flex items-center gap-3">
          <IrisAvatar size={38} variant={loading ? 'typing' : 'default'} />
          <div>
            <p className="text-sm font-semibold leading-tight text-white">Iris · Copiloto IA</p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-electric-100">
              {loading ? 'Analizando…' : isListening ? 'Escuchando…' : 'Asistente clínico'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ring-1 ring-black/20 transition
            ${loading ? 'animate-pulse bg-electric-300'
            : isListening ? 'animate-pulse bg-violet-300'
            : 'bg-electric-400'}`}
            aria-label={loading ? 'Procesando' : isListening ? 'Escuchando' : 'En línea'} />

          {/* Botón PDF */}
          <button type="button" onClick={handleExportPdf}
            disabled={pdfState === 'generating'}
            title="Exportar reporte a PDF"
            aria-label="Exportar reporte a PDF"
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition
              ${pdfState === 'done'
                ? 'bg-violet-500/30 text-violet-200'
                : pdfState === 'error'
                ? 'bg-red-500/20 text-red-300'
                : pdfState === 'generating'
                ? 'animate-pulse bg-white/10 text-white/50'
                : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
            <PdfIcon />
          </button>

          <button type="button" onClick={clearHistory}
            title="Nueva conversación" aria-label="Nueva conversación"
            className="flex h-7 w-7 items-center justify-center rounded-lg
                       bg-white/10 text-white/70 transition hover:bg-white/20">
            <TrashIcon />
          </button>

          {onClose && (
            <button type="button" onClick={onClose}
              title="Cerrar copiloto" aria-label="Cerrar copiloto"
              className="flex h-7 w-7 items-center justify-center rounded-lg
                         bg-white/10 text-white/70 transition hover:bg-white/20">
              <CloseIcon />
            </button>
          )}
        </div>
      </header>

      {/* Barra decorativa */}
      <div className="h-px w-full bg-electric-gradient opacity-50 shrink-0" />


      {/* ── ACCIONES RÁPIDAS ── */}
      <div className={`shrink-0 border-b ${T.actionsBorder} px-3 py-2.5`}>
        <p className={`mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] ${T.actionsLabel}`}>
          Acciones rápidas
        </p>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {QUICK_ACTIONS.map(action => (
            <ActionChip key={action.id} action={action} disabled={loading}
              onClick={() => triggerAction(action)} />
          ))}
        </div>
      </div>

      {/* ── HISTORIAL ── */}
      <div className={`flex-1 overflow-y-auto px-4 py-4 space-y-4 ${T.messagesArea}`}
           aria-live="polite" aria-label="Historial de conversación">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} tokens={T} />
        ))}
        {loading && <TypingIndicator tokens={T} />}

        {/* Notificación de PDF */}
        {pdfState === 'done' && (
          <div className="flex items-center gap-2 rounded-xl border border-violet-500/30
                          bg-violet-500/10 px-3 py-2 text-xs text-violet-300">
            <PdfIcon /> PDF generado y descargado correctamente.
          </div>
        )}
        {pdfState === 'error' && (
          <div className="flex items-center gap-2 rounded-xl border border-red-400/30
                          bg-red-400/10 px-3 py-2 text-xs text-red-300">
            No se pudo generar el PDF. Inténtalo de nuevo.
          </div>
        )}

        {/* Notificación de voz */}
        {voiceError && (
          <div className="flex items-center justify-between gap-2 rounded-xl
                          border border-red-400/30 bg-red-400/10 px-3 py-2">
            <p className="text-xs text-red-300">{voiceError}</p>
            <button type="button" onClick={() => setVoiceError('')}
              className="shrink-0 text-[10px] text-red-400 hover:underline">Cerrar</button>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between gap-2 rounded-xl
                          border border-red-400/30 bg-red-400/10 px-3 py-2">
            <p className="text-xs text-red-300">{error}</p>
            <button type="button" onClick={retryLast}
              className="shrink-0 rounded-lg border border-red-400/30 px-2 py-1
                         text-[10px] font-medium text-red-300 hover:bg-red-400/10">
              Reintentar
            </button>
          </div>
        )}
        <div ref={messagesEndRef} aria-hidden />
      </div>

      {/* ── ÁREA DE ENTRADA + MICRÓFONO ── */}
      <form onSubmit={handleSubmit}
            className={`shrink-0 border-t ${T.inputBorder} p-3`}>
        <div className="flex items-end gap-2">

          {/* Botón micrófono con pulso eléctrico */}
          {isSupported && (
            <button type="button" onClick={toggleListening}
              aria-label={isListening ? 'Detener dictado' : 'Iniciar dictado por voz'}
              title={isListening ? 'Detener dictado' : 'Dictado por voz'}
              className={`flex h-10 w-10 shrink-0 items-center justify-center
                          rounded-xl transition focus-visible:outline-none
                          focus-visible:ring-2 focus-visible:ring-electric-400
                          ${isListening
                            ? 'bg-electric-500/30 text-electric-200 ring-2 ring-electric-500/60 shadow-[0_0_20px_-4px_rgba(122,34,255,0.7)] animate-[pulse_1.2s_ease-in-out_infinite]'
                            : `${T.micBtn}`
                          }`}>
              {isListening ? <MicActiveIcon /> : <MicIcon />}
            </button>
          )}

          <textarea ref={inputRef} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Escuchando… habla ahora' : 'Escribe a Iris… (Enter para enviar)'}
            rows={1} aria-label="Mensaje para el copiloto"
            disabled={loading}
            className={`flex-1 resize-none rounded-xl px-3 py-2.5 text-sm
                        transition focus:outline-none focus:ring-2 focus:ring-electric-500/30
                        disabled:opacity-50 ${T.inputField}`}
            style={{ maxHeight: '120px', overflowY: 'auto' }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }} />

          <button type="submit" disabled={!input.trim() || loading}
            aria-label="Enviar mensaje"
            className="flex h-10 w-10 shrink-0 items-center justify-center
                       rounded-xl bg-electric-gradient text-white
                       shadow-[0_4px_16px_-4px_rgba(122,34,255,0.5)]
                       transition hover:brightness-110 active:brightness-95
                       disabled:cursor-not-allowed disabled:opacity-40
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-400">
            <SendIcon />
          </button>
        </div>

        <p className={`mt-1.5 text-[10px] ${T.hint}`}>
          {isListening
            ? '🎙 Dictado activo — pulsa el micrófono para detener'
            : 'Shift+Enter nueva línea · 🎙 micrófono para dictar'}
        </p>
      </form>
    </div>
  );
}


// ── Sub-componentes ──────────────────────────────────────────────────────────

function ActionChip({ action, onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={action.label}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1
                  text-[11px] font-medium transition
                  disabled:cursor-not-allowed disabled:opacity-40 ${action.color}`}>
      <span className="whitespace-nowrap">{action.label}</span>
    </button>
  );
}

function MessageBubble({ message, tokens: T }) {
  const { role, text, status, timestamp } = message;
  if (role === 'system') {
    return (
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/10
                      px-3 py-2.5 text-xs leading-relaxed text-violet-300">
        <FormattedText text={text} />
      </div>
    );
  }
  const isUser  = role === 'user';
  const isError = status === 'error';
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <IrisAvatar size={28} variant="default"
          className="mb-0.5 shrink-0 ring-1 ring-electric-500/30" />
      )}
      <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'} max-w-[82%]`}>
        <div className={`rounded-2xl px-3 py-2 text-sm leading-relaxed
          ${isUser
            ? 'rounded-br-sm bg-violet-600 text-white'
            : isError
            ? 'rounded-bl-sm border border-red-400/30 bg-red-400/10 text-red-300'
            : `rounded-bl-sm ${T.bubbleAssist}`}`}>
          <FormattedText text={text} />
        </div>
        <span className={`text-[10px] ${T.timestamp}`}>
          {timestamp ? new Date(timestamp).toLocaleTimeString('es', { hour:'2-digit', minute:'2-digit' }) : ''}
        </span>
      </div>
    </div>
  );
}

function TypingIndicator({ tokens: T }) {
  return (
    <div className="flex items-end gap-2">
      <IrisAvatar size={28} variant="typing" className="mb-0.5 ring-1 ring-electric-500/30" />
      <div className={`flex items-center gap-1.5 rounded-2xl rounded-bl-sm px-4 py-3 ${T.bubbleAssist}`}>
        {[0,1,2].map(i => (
          <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-electric-400"
            style={{ animationDelay: `${i*0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

function FormattedText({ text = '' }) {
  if (!text) return null;
  return (
    <>
      {text.split('\n').map((line, i, arr) => {
        const segs = line.split(/\*\*(.+?)\*\*/g);
        return (
          <span key={i} className="block">
            {segs.map((s, j) =>
              j % 2 === 1
                ? <strong key={j} className="font-semibold">{s}</strong>
                : <span key={j}>{s}</span>
            )}
            {i < arr.length - 1 && <br />}
          </span>
        );
      })}
    </>
  );
}

// ── Tokens de tema ────────────────────────────────────────────────────────────
const DARK_TOKENS = {
  root:         'bg-transparent',
  actionsBorder:'border-white/[0.07]',
  actionsLabel: 'text-electric-400',
  messagesArea: '',
  bubbleAssist: 'bg-white/[0.07] text-clinical-200',
  inputBorder:  'border-white/[0.07]',
  inputField:   'border border-white/[0.09] bg-white/[0.05] text-white placeholder:text-clinical-600',
  timestamp:    'text-clinical-600',
  hint:         'text-clinical-700',
  micBtn:       'bg-white/[0.07] text-clinical-400 hover:bg-white/[0.12] hover:text-electric-300',
};

const LIGHT_TOKENS = {
  root:         'bg-white rounded-clinical border border-electric-100 shadow-copilot',
  actionsBorder:'border-clinical-100',
  actionsLabel: 'text-violet-600',
  messagesArea: '',
  bubbleAssist: 'bg-electric-50 text-clinical-800',
  inputBorder:  'border-clinical-100',
  inputField:   'border border-clinical-200 bg-white text-clinical-800 placeholder:text-clinical-400',
  timestamp:    'text-clinical-400',
  hint:         'text-clinical-500',
  micBtn:       'bg-electric-50 text-electric-600 hover:bg-electric-100 border border-electric-200',
};

// ── Micro-iconos ──────────────────────────────────────────────────────────────
function SendIcon() {
  return (
    <svg className="h-4 w-4 translate-x-0.5" fill="none" stroke="currentColor"
         strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
  );
}

function MicActiveIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 1.5a3 3 0 00-3 3v8.25a3 3 0 006 0V4.5a3 3 0 00-3-3z"
        fillOpacity=".9" />
      <path fillRule="evenodd" clipRule="evenodd"
        d="M5.25 11.25a.75.75 0 01.75.75 6 6 0 0012 0 .75.75 0 011.5 0 7.5 7.5 0 01-7.5 7.45v2.3h2.25a.75.75 0 010 1.5h-6a.75.75 0 010-1.5H10.5v-2.3A7.5 7.5 0 014.5 12a.75.75 0 01.75-.75z"
        fillOpacity=".9" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
