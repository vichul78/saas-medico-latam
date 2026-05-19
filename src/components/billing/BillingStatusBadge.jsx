/**
 * BillingStatusBadge — badge de estado financiero clínico.
 *
 * REGLA ABSOLUTA: CERO tonos verdes, incluso para "Pagado".
 * Estados exitosos/positivos usan Púrpura Eléctrico y Violeta.
 *
 * Variantes (espejo del ENUM `invoice_status` en schema.sql):
 *   borrador | emitida | pagada | vencida | cancelada
 *
 * Props:
 *   status  : string — valor del ENUM
 *   size    : 'xs' | 'sm' | 'md'
 *   dot     : bool   — mostrar punto de color (default true)
 */

const STATUS_CONFIG = {
  borrador: {
    label:   'Borrador',
    cls:     'border-clinical-500/30 bg-clinical-500/10 text-clinical-300',
    dot:     'bg-clinical-400',
  },
  emitida: {
    label:   'Emitida',
    cls:     'border-violet-500/40 bg-violet-500/10 text-violet-300',
    dot:     'bg-violet-400',
  },
  pagada: {
    // ✦ Positivo → Púrpura Eléctrico (NUNCA verde)
    label:   'Pagada',
    cls:     'border-electric-500/50 bg-electric-500/15 text-electric-200',
    dot:     'bg-electric-400',
  },
  vencida: {
    label:   'Vencida',
    cls:     'border-red-400/30 bg-red-400/10 text-red-300',
    dot:     'bg-red-400',
  },
  cancelada: {
    label:   'Cancelada',
    cls:     'border-clinical-600/30 bg-clinical-600/10 text-clinical-500',
    dot:     'bg-clinical-600',
  },
};

const SIZE = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2   py-0.5 text-xs',
  md: 'px-2.5 py-1   text-xs',
};

export default function BillingStatusBadge({
  status = 'borrador',
  size   = 'sm',
  dot    = true,
  className = '',
}) {
  const cfg  = STATUS_CONFIG[status] ?? STATUS_CONFIG.borrador;
  const szCls = SIZE[size] ?? SIZE.sm;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border
                  font-semibold uppercase tracking-wider
                  ${szCls} ${cfg.cls} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`}
          aria-hidden
        />
      )}
      {cfg.label}
    </span>
  );
}

/**
 * Devuelve la config visual de un estado dado (para uso en celdas, tooltips…).
 * @param {string} status
 */
export function getStatusConfig(status) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.borrador;
}

/**
 * Opciones para un select de estado (útil en filtros y formularios).
 */
export const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(
  ([value, cfg]) => ({ value, label: cfg.label }),
);
