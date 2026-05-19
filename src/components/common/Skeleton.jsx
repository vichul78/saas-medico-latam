/**
 * Skeleton — animaciones de carga clínicas.
 *
 * Paleta oscura: bg-white/[0.06] con pulso suave.
 * CERO verde. Variantes: line, circle, card, table.
 *
 * Uso:
 *   <Skeleton.Line w="w-48" />
 *   <Skeleton.Circle size={40} />
 *   <Skeleton.Card rows={4} />
 *   <Skeleton.TableRows rows={6} cols={5} />
 */

const base =
  'animate-pulse rounded bg-white/[0.07]';

/* ── Línea de texto ─────────────────────────────────────────────────── */
function Line({ w = 'w-full', h = 'h-3', className = '' }) {
  return <div className={`${base} ${w} ${h} ${className}`} aria-hidden />;
}

/* ── Círculo (avatar placeholder) ──────────────────────────────────── */
function Circle({ size = 40, className = '' }) {
  return (
    <div
      className={`${base} shrink-0 rounded-full ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

/* ── Tarjeta genérica ───────────────────────────────────────────────── */
function Card({ rows = 3, className = '' }) {
  return (
    <div
      className={`rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 ${className}`}
      aria-hidden
    >
      {/* Cabecera */}
      <div className="mb-4 flex items-center gap-3">
        <Circle size={36} />
        <div className="flex-1 space-y-2">
          <Line w="w-1/2" h="h-3" />
          <Line w="w-1/3" h="h-2.5" />
        </div>
      </div>
      {/* Filas de contenido */}
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <Line
            key={i}
            w={i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-4/5' : 'w-2/3'}
            h="h-2.5"
          />
        ))}
      </div>
    </div>
  );
}

/* ── Filas de tabla ─────────────────────────────────────────────────── */
function TableRows({ rows = 5, cols = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} aria-hidden>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              {c === 0
                /* primera celda: avatar + nombre */
                ? (
                  <div className="flex items-center gap-2.5">
                    <Circle size={32} />
                    <Line w="w-28" h="h-3" />
                  </div>
                )
                : <Line w={c % 2 === 0 ? 'w-20' : 'w-16'} h="h-3" />
              }
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ── Fila de lista de citas ─────────────────────────────────────────── */
function AppointmentRow({ count = 4 }) {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-white/[0.06]
                     bg-white/[0.03] px-4 py-3"
        >
          {/* Hora */}
          <div className={`${base} h-8 w-12 rounded-lg`} />
          {/* Avatar */}
          <Circle size={36} />
          {/* Info */}
          <div className="flex-1 space-y-1.5">
            <Line w="w-36" h="h-3" />
            <Line w="w-24" h="h-2.5" />
          </div>
          {/* Badge */}
          <div className={`${base} h-5 w-20 rounded-full`} />
        </div>
      ))}
    </div>
  );
}

const Skeleton = { Line, Circle, Card, TableRows, AppointmentRow };
export default Skeleton;
