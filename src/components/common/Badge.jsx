/**
 * Badge — etiqueta de estado clínico.
 *
 * REGLAS VISUALES ESTRICTAS:
 *   • Estados positivos / confirmados → electric / violet (NUNCA verde)
 *   • Estados negativos / cancelados  → danger (rojo-rosado)
 *   • Estados pendientes              → eléctrico tenue
 *   • CERO tonos verdes en ninguna variante
 *
 * Props:
 *   variant : 'confirmed' | 'pending' | 'in_progress' | 'completed'
 *             | 'cancelled' | 'no_show' | 'reported' | 'delivered'
 *             | 'received' | 'default'
 *   size    : 'sm' | 'md'
 *   dot     : bool — muestra punto de color (default true)
 */

const VARIANTS = {
  // ── Citas ──────────────────────────────────────────────────────────
  confirmed:   {
    label: 'Confirmada',
    cls:   'border-electric-500/40 bg-electric-500/10 text-electric-300',
    dot:   'bg-electric-400',
  },
  programada:  {
    label: 'Programada',
    cls:   'border-violet-500/40 bg-violet-500/10 text-violet-300',
    dot:   'bg-violet-400',
  },
  in_progress: {
    label: 'En curso',
    cls:   'border-electric-400/50 bg-electric-400/15 text-electric-200',
    dot:   'bg-electric-300',
  },
  completed:   {
    label: 'Completada',
    cls:   'border-violet-400/40 bg-violet-400/10 text-violet-200',
    dot:   'bg-violet-300',
  },
  cancelled:   {
    label: 'Cancelada',
    cls:   'border-red-400/30 bg-red-400/10 text-red-300',
    dot:   'bg-red-400',
  },
  no_show:     {
    label: 'No asistió',
    cls:   'border-rose-500/30 bg-rose-500/10 text-rose-300',
    dot:   'bg-rose-400',
  },
  // ── Estudios ───────────────────────────────────────────────────────
  received:    {
    label: 'Recibido',
    cls:   'border-clinical-400/30 bg-clinical-400/10 text-clinical-300',
    dot:   'bg-clinical-400',
  },
  pendiente_lectura: {
    label: 'Pendiente',
    cls:   'border-violet-500/40 bg-violet-500/10 text-violet-300',
    dot:   'bg-violet-400',
  },
  en_lectura:  {
    label: 'En lectura',
    cls:   'border-electric-500/40 bg-electric-500/15 text-electric-200',
    dot:   'bg-electric-400 animate-pulse',
  },
  reported:    {
    label: 'Informado',
    cls:   'border-electric-400/40 bg-electric-400/10 text-electric-200',
    dot:   'bg-electric-300',
  },
  delivered:   {
    label: 'Entregado',
    cls:   'border-violet-300/40 bg-violet-300/10 text-violet-200',
    dot:   'bg-violet-300',
  },
  // ── Sexo biológico ─────────────────────────────────────────────────
  M:           {
    label: 'M',
    cls:   'border-electric-500/30 bg-electric-500/10 text-electric-300',
    dot:   null,
  },
  F:           {
    label: 'F',
    cls:   'border-violet-400/30 bg-violet-400/10 text-violet-300',
    dot:   null,
  },
  O:           {
    label: 'Otro',
    cls:   'border-clinical-400/30 bg-white/[0.05] text-clinical-300',
    dot:   null,
  },
  // ── Default ────────────────────────────────────────────────────────
  default: {
    label: '—',
    cls:   'border-white/[0.10] bg-white/[0.05] text-clinical-400',
    dot:   'bg-clinical-500',
  },
};

const SIZE = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export default function Badge({
  variant = 'default',
  label,
  size = 'sm',
  dot = true,
  className = '',
}) {
  const cfg = VARIANTS[variant] ?? VARIANTS.default;
  const displayLabel = label ?? cfg.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold
                  uppercase tracking-wider ${SIZE[size]} ${cfg.cls} ${className}`}
    >
      {dot && cfg.dot && (
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} aria-hidden />
      )}
      {displayLabel}
    </span>
  );
}

/**
 * Convierte el status de Supabase (snake_case) al variant del Badge.
 * Uso: <Badge variant={statusToVariant(appt.status)} />
 */
export function statusToVariant(status = '') {
  const map = {
    programada:        'programada',
    confirmada:        'confirmed',
    en_curso:          'in_progress',
    completada:        'completed',
    cancelada:         'cancelled',
    no_asistio:        'no_show',
    recibido:          'received',
    pendiente_lectura: 'pendiente_lectura',
    en_lectura:        'en_lectura',
    informado:         'reported',
    entregado:         'delivered',
  };
  return map[status] ?? 'default';
}
