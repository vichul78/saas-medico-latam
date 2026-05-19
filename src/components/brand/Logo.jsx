/*
  Logo MediCo LatAm.
  Diseño clínico, basado en cruz médica + signo de bisturí estilizado.
  Renderiza un SVG escalable; el contenedor controla el tamaño final.
  Solo púrpura eléctrico, violeta y neutros (NUNCA verdes).
*/
export default function Logo({ className = '', monochrome = false, title = 'MediCo LatAm' }) {
  const grad = monochrome ? '#1C1C29' : 'url(#mc-grad)';
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="mc-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7A22FF" />
          <stop offset="100%" stopColor="#5B27B5" />
        </linearGradient>
      </defs>
      {/* Hexágono clínico */}
      <path
        d="M32 4 L56 18 V46 L32 60 L8 46 V18 Z"
        fill={grad}
        opacity="0.08"
      />
      <path
        d="M32 4 L56 18 V46 L32 60 L8 46 V18 Z"
        fill="none"
        stroke={grad}
        strokeWidth="2"
      />
      {/* Cruz médica */}
      <rect x="27" y="16" width="10" height="32" rx="2" fill={grad} />
      <rect x="16" y="27" width="32" height="10" rx="2" fill={grad} />
      {/* Pulso */}
      <path
        d="M14 50 H22 L25 44 L29 54 L33 46 L37 52 H50"
        fill="none"
        stroke="#FAFAFE"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
