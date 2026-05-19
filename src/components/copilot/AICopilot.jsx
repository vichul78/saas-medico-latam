import { useState } from 'react';
import ClinicalAvatar from '@/components/common/ClinicalAvatar.jsx';

/*
  Copiloto IA clínico — Iris.
  Regla obligatoria: ANCLADO A LA DERECHA.

  Props:
    dark (bool) — activa la variante oscura para el DashboardLayout.
                  Por defecto false (modo claro, para el MainLayout público).
*/
export default function AICopilot({ dark = false }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hola, soy Iris, tu copiloto clínico. Puedo resumir estudios, sugerir diagnósticos diferenciales y preparar reportes DICOM.',
    },
  ]);
  const [input, setInput] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: value },
      {
        role: 'assistant',
        text: 'Recibido. (Conexión al modelo IA pendiente — placeholder.)',
      },
    ]);
    setInput('');
  }

  // ── Tokens de color según modo claro/oscuro ──
  const t = dark ? {
    wrap:        'flex h-full flex-col border-0 bg-transparent',
    body:        'flex-1 space-y-3 overflow-y-auto px-4 py-4',
    chipsBorder: 'border-t border-white/[0.07] px-4 py-3',
    chipsLabel:  'mb-2 text-[11px] font-semibold uppercase tracking-wider text-violet-400',
    chip:        'rounded-full border border-electric-500/30 bg-electric-500/10 px-2.5 py-1 text-xs font-medium text-electric-300 transition hover:bg-electric-500/20',
    formWrap:    'flex items-center gap-2 border-t border-white/[0.07] bg-clinical-900 p-3',
    input:       'flex-1 rounded-lg border border-white/[0.10] bg-white/[0.05] px-3 py-2 text-sm text-white placeholder:text-clinical-600 focus:border-electric-500 focus:outline-none focus:ring-2 focus:ring-electric-500/25',
    msgAssist:   'bg-white/[0.06] text-clinical-200',
  } : {
    wrap:        'sticky top-28 flex max-h-[calc(100vh-8rem)] flex-col rounded-clinical border border-electric-200 bg-white shadow-copilot',
    body:        'flex-1 space-y-3 overflow-y-auto px-4 py-4',
    chipsBorder: 'border-t border-clinical-200 px-4 py-3',
    chipsLabel:  'mb-2 text-[11px] font-semibold uppercase tracking-wider text-violet-600',
    chip:        'rounded-full border border-electric-200 bg-electric-50 px-2.5 py-1 text-xs font-medium text-electric-700 transition hover:bg-electric-100',
    formWrap:    'flex items-center gap-2 rounded-b-clinical border-t border-clinical-200 bg-clinical-50 p-3',
    input:       'flex-1 rounded-md border border-clinical-200 bg-white px-3 py-2 text-sm text-clinical-800 placeholder:text-clinical-400 focus:border-electric-400 focus:outline-none focus:ring-2 focus:ring-electric-100',
    msgAssist:   'bg-electric-50 text-clinical-800',
  };

  return (
    <aside aria-label="Copiloto IA clínico" className={t.wrap}>

      {/* Cabecera — igual en ambos modos */}
      <header className="flex items-center justify-between bg-electric-gradient px-4 py-3 text-white
                         rounded-t-clinical">
        <div className="flex items-center gap-3">
          <ClinicalAvatar name="Iris" variant="neutral" size={36} />
          <div>
            <p className="text-sm font-semibold leading-tight">Iris · Copiloto IA</p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-electric-100">
              Asistente clínico
            </p>
          </div>
        </div>
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
          Online
        </span>
      </header>

      {/* Conversación */}
      <div className={t.body}>
        {messages.map((m, idx) => (
          <Message key={idx} role={m.role} text={m.text} assistClass={t.msgAssist} />
        ))}
      </div>

      {/* Sugerencias rápidas */}
      <div className={t.chipsBorder}>
        <p className={t.chipsLabel}>Sugerencias</p>
        <div className="flex flex-wrap gap-2">
          {['Resumir estudio', 'Reporte DICOM', 'Diferencial', 'Receta'].map((s) => (
            <button key={s} type="button" onClick={() => setInput(s)} className={t.chip}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className={t.formWrap}>
        <input
          aria-label="Mensaje al copiloto"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta a Iris…"
          className={t.input}
        />
        <button type="submit" className="btn-primary !px-3 !py-2">
          Enviar
        </button>
      </form>
    </aside>
  );
}

function Message({ role, text, assistClass }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-clinical px-3 py-2 text-sm leading-relaxed ${
          isUser ? 'bg-violet-500 text-white' : assistClass
        }`}
      >
        {text}
      </div>
    </div>
  );
}
