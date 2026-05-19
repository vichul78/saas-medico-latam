/**
 * IrisAvatar — avatar SVG de la IA clínica "Iris".
 *
 * Reglas de diseño obligatorias:
 *   • Líneas claras, minimalista, perfil clínico moderno.
 *   • SIN vello facial en ninguna variante.
 *   • Chip tecnológico en la sien izquierda (identidad IA).
 *   • Paleta: eléctrico/violeta — CERO verde.
 *
 * Props:
 *   size     : number  — px (default 40)
 *   variant  : 'default' | 'large' | 'typing'
 *   className: string
 */
export default function IrisAvatar({ size = 40, variant = 'default', className = '' }) {
  const isTyping = variant === 'typing';
  const id = `iris-${size}-${variant}`;

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center
                  overflow-hidden rounded-full ring-2 ring-electric-500/40 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Fondo radial */}
          <radialGradient id={`${id}-bg`} cx="50%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="#2D1060" />
            <stop offset="100%" stopColor="#0F0F18" />
          </radialGradient>
          {/* Gradiente eléctrico para el chip y detalles */}
          <linearGradient id={`${id}-elec`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#7A22FF" />
            <stop offset="100%" stopColor="#5B27B5" />
          </linearGradient>
          {/* Iris del ojo (efecto digital) */}
          <radialGradient id={`${id}-eye`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#CFA8FF" />
            <stop offset="100%" stopColor="#7A22FF" />
          </radialGradient>
        </defs>

        {/* ── Fondo circular ── */}
        <circle cx="24" cy="24" r="24" fill={`url(#${id}-bg)`} />

        {/* ── Bata / hombros clínicos ── */}
        <path
          d="M6 46 C8 36 15 32 24 32 C33 32 40 36 42 46 Z"
          fill="rgba(255,255,255,0.10)"
        />
        {/* Cuello V de bata */}
        <path
          d="M21 32 L24 37 L27 32"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* ── Cabeza — rostro limpio, sin vello facial ── */}
        <ellipse cx="24" cy="21" rx="9" ry="10.5" fill="#E8E0F0" />

        {/* ── Cabello recogido / cobertura clínica ── */}
        {/* Cabello oscuro estilizado (no barba/bigote — solo cima y lados) */}
        <path
          d="M15.5 19 C16 11 20 9 24 9 C28 9 32 11 32.5 19 L31 20 C29 14 26 12.5 24 12.5 C22 12.5 19 14 17 20 Z"
          fill="#1C1C29"
        />
        {/* Línea de cabello limpia */}
        <path
          d="M17 20 Q24 17 31 20"
          fill="none"
          stroke="#2F2F40"
          strokeWidth="0.8"
        />

        {/* ── Ojos digitales ── */}
        {/* Ojo izquierdo */}
        <ellipse cx="20.5" cy="21" rx="1.8" ry="1.8" fill={`url(#${id}-eye)`} />
        <circle cx="20.5" cy="21" r="0.7" fill="#0F0F18" />
        <circle cx="21.1" cy="20.4" r="0.4" fill="rgba(255,255,255,0.7)" />
        {/* Ojo derecho */}
        <ellipse cx="27.5" cy="21" rx="1.8" ry="1.8" fill={`url(#${id}-eye)`} />
        <circle cx="27.5" cy="21" r="0.7" fill="#0F0F18" />
        <circle cx="28.1" cy="20.4" r="0.4" fill="rgba(255,255,255,0.7)" />

        {/* ── Nariz mínima ── */}
        <path
          d="M23 23 Q24 24.5 25 23"
          fill="none"
          stroke="rgba(100,80,140,0.5)"
          strokeWidth="0.8"
          strokeLinecap="round"
        />

        {/* ── Boca neutra, sin bigote ni barba ── */}
        <path
          d="M21.5 26 Q24 27.8 26.5 26"
          fill="none"
          stroke="#9972DC"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* ── Chip IA en sien izquierda (identidad tecnológica) ── */}
        <rect
          x="8"
          y="18"
          width="5"
          height="4"
          rx="1"
          fill={`url(#${id}-elec)`}
          opacity="0.9"
        />
        {/* Trazas del chip */}
        <path
          d="M9 17 v1 M11 17 v1 M13 17 v1"
          stroke="#7A22FF"
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M9 22 v1 M11 22 v1 M13 22 v1"
          stroke="#7A22FF"
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* Punto de actividad */}
        <circle
          cx="10.5"
          cy="20"
          r="1"
          fill="#CFA8FF"
          className={isTyping ? 'animate-pulse' : ''}
        />

        {/* ── Indicador de estado (esquina inferior derecha del chip) ── */}
        <circle cx="35" cy="33" r="3.5" fill="#0F0F18" />
        <circle
          cx="35"
          cy="33"
          r="2.2"
          fill={isTyping ? '#7A22FF' : '#5B27B5'}
          className={isTyping ? 'animate-pulse' : ''}
        />
      </svg>
    </span>
  );
}
