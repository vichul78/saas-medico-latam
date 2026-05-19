import { useEffect, useRef } from 'react';
import { useCopilot }   from '@/hooks/useCopilot.js';
import IrisAvatar       from '@/components/copilot/IrisAvatar.jsx';

/**
 * AICopilot — panel del Copiloto IA clínico "Iris".
 *
 * Reglas visuales obligatorias:
 *   • Acentos: Púrpura Eléctrico (#7A22FF) y Violeta.
 *   • CERO tonos verdes en ningún estado ni elemento.
 *   • Avatar Iris: chip IA, sin vello facial, minimalista.
 *
 * Props:
 *   dark     : bool   — modo oscuro (dashboard) vs claro (sitio público)
 *   context  : object — contexto clínico {patient, study, appointment}
 *   onClose  : fn     — llamado cuando el usuario cierra el panel
 *   isOpen   : bool   — controla visibilidad desde el layout padre
 */

// ── Definición de acciones rápidas contextuales ──────────────────────────────
const QUICK_ACTIONS = [
  {
    id:     'report',
    label:  'Generar informe',
    prompt: 'Genera un borrador de informe radiológico con los datos disponibles.',
    icon:   <ReportIcon />,
    color:  'border-electric-500/40 bg-electric-500/10 text-electric-300 hover:bg-electric-500/20',
  },
  {
    id:     'history',
    label:  'Analizar historial',
    prompt: 'Analiza el historial clínico del paciente activo y dame un resumen.',
    icon:   <HistoryIcon />,
    color:  'border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20',
  },
  {
    id:     'summary',
    label:  'Resumir cita',
    prompt: 'Resume la cita médica actual y genera una nota SOAP.',
    icon:   <SummaryIcon />,
    color:  'border-electric-500/40 bg-electric-500/10 text-electric-300 hover:bg-electric-500/20',
  },
  {
    id:     'differential',
    label:  'Diagnóstico diferencial',
    prompt: 'Sugiere diagnósticos diferenciales basados en los hallazgos disponibles.',
    icon:   <DiffIcon />,
    color:  'border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20',
  },
  {
    id:     'prescription',
    label:  'Redactar receta',
    prompt: 'Ayúdame a redactar una prescripción médica con la plantilla estándar.',
    icon:   <RxIcon />,
    color:  'border-electric-400/30 bg-electric-400/10 text-electric-300 hover:bg-electric-400/20',
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
    messages,
    input,
    setInput,
    loading,
    error,
    sendMessage,
    triggerAction,
    clearHistory,
    retryLast,
  } = useCopilot({ context });

  const messagesEndRef  = useRef(null);
  const inputRef        = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus al input al abrir
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // ── Tokens de tema ─────────────────────────────────────────────────────────
  const T = dark ? DARK_TOKENS : LIGHT_TOKENS;

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div
      aria-label="Copiloto IA clínico Iris"
      role="complementary"
      className={`flex h-full flex-col ${T.root}`}
    >

      {/* ══════════════════════════════════════════════════════════════
          CABECERA — identidad Iris + controles
      ══════════════════════════════════════════════════════════════ */}
      <header className="flex shrink-0 items-center justify-between bg-electric-gradient px-4 py-3">
        <div className="flex items-center gap-3">
          <IrisAvatar size={38} variant={loading ? 'typing' : 'default'} />
          <div>
            <p className="text-sm font-semibold leading-tight text-white">
              Iris · Copiloto IA
            </p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-electric-100">
              {loading ? 'Analizando…' : 'Asistente clínico'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Indicador de estado */}
          <span
            className={`h-2 w-2 rounded-full ring-1 ring-black/20 transition
              ${loading ? 'animate-pulse bg-electric-300' : 'bg-electric-400'}`}
            aria-label={loading ? 'Procesando' : 'En línea'}
          />
          {/* Limpiar conversación */}
          <button
            type="button"
            onClick={clearHistory}
            title="Nueva conversación"
            aria-label="Nueva conversación"
            className="flex h-7 w-7 items-center justify-center rounded-lg
                       bg-white/10 text-white/70 transition hover:bg-white/20"
          >
            <TrashIcon />
          </button>
          {/* Cerrar (solo cuando hay un handler) */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Cerrar copiloto"
              aria-label="Cerrar copiloto"
              className="flex h-7 w-7 items-center justify-center rounded-lg
                         bg-white/10 text-white/70 transition hover:bg-white/20"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </header>

      {/* Barra decorativa eléctrica */}
      <div className="h-px w-full bg-electric-gradient opacity-50 shrink-0" />

      {/* ══════════════════════════════════════════════════════════════
          ACCIONES RÁPIDAS — barra horizontal con scroll
      ══════════════════════════════════════════════════════════════ */}
      <div className={`shrink-0 border-b ${T.actionsBorder} px-3 py-2.5`}>
        <p className={`mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] ${T.actionsLabel}`}>
          Acciones rápidas
        </p>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {QUICK_ACTIONS.map(action => (
            <ActionChip
              key={action.id}
              action={action}
              disabled={loading}
              onClick={() => triggerAction(action)}
            />
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          HISTORIAL DE MENSAJES
      ══════════════════════════════════════════════════════════════ */}
      <div
        className={`flex-1 overflow-y-auto px-4 py-4 space-y-4 ${T.messagesArea}`}
        aria-live="polite"
        aria-label="Historial de conversación"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} dark={dark} tokens={T} />
        ))}

        {/* Indicador "escribiendo…" */}
        {loading && <TypingIndicator dark={dark} tokens={T} />}

        {/* Error en línea */}
        {error && (
          <div className="flex items-center justify-between gap-2 rounded-xl
                          border border-red-400/30 bg-red-400/10 px-3 py-2">
            <p className="text-xs text-red-300">{error}</p>
            <button
              type="button"
              onClick={retryLast}
              className="shrink-0 rounded-lg border border-red-400/30 px-2 py-1
                         text-[10px] font-medium text-red-300 transition
                         hover:bg-red-400/10"
            >
              Reintentar
            </button>
          </div>
        )}

        <div ref={messagesEndRef} aria-hidden />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          ÁREA DE ENTRADA
      ══════════════════════════════════════════════════════════════ */}
      <form
        onSubmit={handleSubmit}
        className={`shrink-0 border-t ${T.inputBorder} p-3`}
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe a Iris… (Enter para enviar)"
            rows={1}
            aria-label="Mensaje para el copiloto"
            disabled={loading}
            className={`flex-1 resize-none rounded-xl px-3 py-2.5 text-sm
                        transition focus:outline-none
                        focus:ring-2 focus:ring-electric-500/30
                        disabled:opacity-50
                        ${T.inputField}`}
            style={{ maxHeight: '120px', overflowY: 'auto' }}
            onInput={e => {
              // Auto-resize
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Enviar mensaje"
            className="flex h-10 w-10 shrink-0 items-center justify-center
                       rounded-xl bg-electric-gradient text-white
                       shadow-[0_4px_16px_-4px_rgba(122,34,255,0.5)]
                       transition hover:brightness-110 active:brightness-95
                       disabled:cursor-not-allowed disabled:opacity-40
                       focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-electric-400"
          >
            <SendIcon />
          </button>
        </div>

        <p className={`mt-1.5 text-[10px] ${T.hint}`}>
          ↑↓ historial · Shift+Enter para nueva línea
        </p>
      </form>
    </div>
  );
}

// ── Chip de acción rápida ──────────────────────────────────────────────────
function ActionChip({ action, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={action.label}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1
                  text-[11px] font-medium transition
                  disabled:cursor-not-allowed disabled:opacity-40
                  ${action.color}`}
    >
      <span className="h-3.5 w-3.5 shrink-0">{action.icon}</span>
      <span className="whitespace-nowrap">{action.label}</span>
    </button>
  );
}

// ── Burbuja de mensaje ─────────────────────────────────────────────────────
function MessageBubble({ message, dark, tokens: T }) {
  const { role, text, status, timestamp } = message;

  if (role === 'system') {
    return (
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/10
                      px-3 py-2.5 text-xs leading-relaxed text-violet-300">
        <FormattedText text={text} />
      </div>
    );
  }

  const isUser      = role === 'user';
  const isError     = status === 'error';

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar Iris (solo mensajes del asistente) */}
      {!isUser && (
        <IrisAvatar
          size={28}
          variant="default"
          className="mb-0.5 shrink-0 ring-1 ring-electric-500/30"
        />
      )}

      <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'} max-w-[82%]`}>
        {/* Burbuja */}
        <div
          className={`rounded-2xl px-3 py-2 text-sm leading-relaxed
            ${isUser
              ? 'rounded-br-sm bg-violet-600 text-white'
              : isError
              ? 'rounded-bl-sm border border-red-400/30 bg-red-400/10 text-red-300'
              : `rounded-bl-sm ${T.bubbleAssist}`
            }`}
        >
          <FormattedText text={text} />
        </div>

        {/* Timestamp */}
        <span className={`text-[10px] ${T.timestamp}`}>
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
}

// ── Indicador "escribiendo…" ───────────────────────────────────────────────
function TypingIndicator({ tokens: T }) {
  return (
    <div className="flex items-end gap-2">
      <IrisAvatar size={28} variant="typing" className="mb-0.5 ring-1 ring-electric-500/30" />
      <div className={`flex items-center gap-1.5 rounded-2xl rounded-bl-sm px-4 py-3 ${T.bubbleAssist}`}>
        {[0, 1, 2].map(i => (
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

// ── Texto con markdown básico (negrita, saltos) ───────────────────────────
function FormattedText({ text = '' }) {
  if (!text) return null;
  // Convierte **negrita** y saltos de línea
  const parts = text.split('\n');
  return (
    <>
      {parts.map((line, i) => {
        const segments = line.split(/\*\*(.+?)\*\*/g);
        return (
          <span key={i} className="block">
            {segments.map((s, j) =>
              j % 2 === 1
                ? <strong key={j} className="font-semibold">{s}</strong>
                : <span key={j}>{s}</span>
            )}
            {i < parts.length - 1 && <br />}
          </span>
        );
      })}
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────
function formatTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

// ── Tokens de tema ─────────────────────────────────────────────────────────
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
};

// ── Micro-iconos SVG inline ────────────────────────────────────────────────
function SendIcon() {
  return (
    <svg className="h-4 w-4 translate-x-0.5" fill="none" stroke="currentColor"
         strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
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
function TrashIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}
function ReportIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}
function HistoryIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}
function SummaryIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
  );
}
function DiffIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.25m-1.5-8.964c.251.023.501.05.75.082M19.5 9.25a2.25 2.25 0 00-2.25-2.25h-1.5" />
    </svg>
  );
}
function RxIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  );
}
