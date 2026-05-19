/*
  Avatar de placeholder con perfil clínico.
  Reglas obligatorias:
    - Líneas claras y limpias.
    - Proyecta un perfil clínico (gorro/cofia médica como acento).
    - SIN VELLO FACIAL en ninguna variante.
  Variantes: 'female' | 'male' | 'neutral'.
  Solo usa púrpura/violeta y neutros (sin verdes).
*/
export default function ClinicalAvatar({
  name = 'Paciente',
  variant = 'neutral',
  size = 48,
  className = '',
}) {
  const id = `ca-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <span
      className={`inline-block overflow-hidden rounded-full ring-2 ring-electric-100 ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Avatar de ${name}`}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F4ECFF" />
            <stop offset="100%" stopColor="#E6D2FF" />
          </linearGradient>
          <linearGradient id={`${id}-cap`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7A22FF" />
            <stop offset="100%" stopColor="#5B27B5" />
          </linearGradient>
        </defs>

        {/* Fondo circular suave */}
        <circle cx="32" cy="32" r="32" fill={`url(#${id}-bg)`} />

        {/* Hombros / bata */}
        <path d="M8 60 C12 48 22 44 32 44 C42 44 52 48 56 60 Z" fill="#FFFFFF" />
        <path
          d="M8 60 C12 48 22 44 32 44 C42 44 52 48 56 60"
          fill="none"
          stroke="#CFCFDC"
          strokeWidth="1"
        />
        {/* Cuello en V de bata clínica */}
        <path d="M28 44 L32 50 L36 44" fill="none" stroke="#CFCFDC" strokeWidth="1.2" />

        {/* Cabeza — rostro limpio, sin vello facial */}
        <circle cx="32" cy="28" r="11" fill="#F4F4F8" stroke="#2F2F40" strokeWidth="1.2" />

        {/* Ojos */}
        <circle cx="28" cy="28" r="1.2" fill="#1C1C29" />
        <circle cx="36" cy="28" r="1.2" fill="#1C1C29" />

        {/* Boca neutra */}
        <path
          d="M29 33 Q32 35 35 33"
          fill="none"
          stroke="#1C1C29"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Cabello / cofia clínica según variante (sin barba ni bigote) */}
        {variant === 'female' && (
          <>
            {/* Cabello recogido + diadema clínica */}
            <path
              d="M21 24 C22 16 30 14 32 14 C34 14 42 16 43 24 C40 22 36 21 32 21 C28 21 24 22 21 24 Z"
              fill="#2F2F40"
            />
            <rect x="22" y="22" width="20" height="2.4" rx="1.2" fill={`url(#${id}-cap)`} />
          </>
        )}

        {variant === 'male' && (
          <>
            {/* Cabello corto y prolijo, mentón limpio (sin barba/bigote) */}
            <path
              d="M22 22 C23 16 30 14 32 14 C34 14 41 16 42 22 C39 21 36 20.5 32 20.5 C28 20.5 25 21 22 22 Z"
              fill="#2F2F40"
            />
          </>
        )}

        {variant === 'neutral' && (
          <>
            {/* Cofia/gorro quirúrgico */}
            <path
              d="M20 22 C22 14 30 13 32 13 C34 13 42 14 44 22 L44 24 L20 24 Z"
              fill={`url(#${id}-cap)`}
            />
            <path d="M20 24 L44 24" stroke="#3D098A" strokeWidth="0.8" />
          </>
        )}
      </svg>
    </span>
  );
}
