import { useState } from 'react';
import ClinicalAvatar from '@/components/common/ClinicalAvatar.jsx';

/*
  Copiloto IA clínico.
  Regla obligatoria: ANCLADO A LA DERECHA.
  - Posición sticky dentro de su columna.
  - El centro y la izquierda quedan libres para datos e historial.
  - Paleta: púrpura eléctrico / violeta. Sin verdes.
*/
export default function AICopilot() {
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

  return (
    <aside
      aria-label="Copiloto IA clínico"
      className="sticky top-28 flex max-h-[calc(100vh-8rem)] flex-col rounded-clinical border border-electric-200 bg-white shadow-copilot"
    >
      {/* Cabecera del copiloto */}
      <header className="flex items-center justify-between rounded-t-clinical bg-electric-gradient px-4 py-3 text-white">
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
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, idx) => (
          <Message key={idx} role={m.role} text={m.text} />
        ))}
      </div>

      {/* Sugerencias rápidas */}
      <div className="border-t border-clinical-200 px-4 py-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-violet-600">
          Sugerencias
        </p>
        <div className="flex flex-wrap gap-2">
          {['Resumir estudio', 'Reporte DICOM', 'Diferencial', 'Receta'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setInput(s)}
              className="rounded-full border border-electric-200 bg-electric-50 px-2.5 py-1 text-xs font-medium text-electric-700 transition hover:bg-electric-100"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-b-clinical border-t border-clinical-200 bg-clinical-50 p-3"
      >
        <input
          aria-label="Mensaje al copiloto"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta a Iris…"
          className="flex-1 rounded-md border border-clinical-200 bg-white px-3 py-2 text-sm text-clinical-800 placeholder:text-clinical-400 focus:border-electric-400 focus:outline-none focus:ring-2 focus:ring-electric-100"
        />
        <button type="submit" className="btn-primary !px-3 !py-2">
          Enviar
        </button>
      </form>
    </aside>
  );
}

function Message({ role, text }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-clinical px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? 'bg-violet-500 text-white'
            : 'bg-electric-50 text-clinical-800'
        }`}
      >
        {text}
      </div>
    </div>
  );
}
