import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.js';
import Logo from '@/components/brand/Logo.jsx';
import ClinicalAvatar from '@/components/common/ClinicalAvatar.jsx';

/*
  DashboardHeader — cabecera del área autenticada.

  Reglas visuales:
    • Fondo oscuro translúcido (clinical-900/95) con blur — contraste clínico.
    • Logo en contenedor MUCHO MÁS GRANDE que lo habitual (96 × 96 px + glow).
    • Avatar clínico sin vello facial (variant se infiere de profile.metadata).
    • Badge de rol con acento eléctrico/violeta.
    • CERO tonos verdes.
*/

const ROLE_LABEL = {
  admin:    'Administrador',
  medico:   'Médico',
  paciente: 'Paciente',
};

const ROLE_BADGE = {
  admin:    'border-electric-500/40 bg-electric-500/10 text-electric-300',
  medico:   'border-violet-500/40  bg-violet-500/10  text-violet-300',
  paciente: 'border-electric-400/30 bg-electric-400/10 text-electric-300',
};

export default function DashboardHeader({ onToggleSidebar, sidebarOpen }) {
  const { profile, role, organization, signOut } = useAuth();

  const firstName   = profile?.first_name ?? '';
  const lastName    = profile?.last_name  ?? '';
  const displayName = profile?.display_name ?? `${firstName} ${lastName}`.trim() || 'Usuario';
  const avatarVariant =
    profile?.metadata?.gender === 'female' ? 'female'
    : profile?.metadata?.gender === 'male' ? 'male'
    : 'neutral';

  return (
    <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between
                       border-b border-white/[0.06] bg-clinical-900/95 px-4
                       backdrop-blur-md sm:px-6 lg:px-8">

      {/* ── LEFT: burger + LOGO GRANDE ── */}
      <div className="flex items-center gap-4">

        {/* Burger para colapsar sidebar (visible en móvil/tablet) */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
          className="flex h-9 w-9 items-center justify-center rounded-lg
                     border border-white/[0.08] text-clinical-400
                     transition hover:border-electric-500/40 hover:text-electric-400
                     lg:hidden"
        >
          {sidebarOpen ? <IconX /> : <IconMenu />}
        </button>

        {/* CONTENEDOR DEL LOGOTIPO — escalado prominente */}
        <Link
          to="/dashboard"
          aria-label="Ir al dashboard"
          className="group flex items-center gap-3.5"
        >
          {/* Caja del ícono: 80×80 en móvil, 96×96 en desktop */}
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center
                          rounded-2xl bg-electric-gradient p-2.5
                          shadow-[0_0_32px_-6px_rgba(122,34,255,0.70)]
                          transition group-hover:shadow-[0_0_44px_-4px_rgba(122,34,255,0.85)]
                          sm:h-24 sm:w-24 sm:rounded-3xl sm:p-3">
            <Logo className="h-full w-full" />
            {/* Pulso decorativo */}
            <span className="absolute inset-0 rounded-2xl ring-1 ring-electric-400/20
                             animate-[ping_3s_ease-in-out_infinite] sm:rounded-3xl" />
          </div>

          {/* Wordmark — oculto en pantallas muy pequeñas */}
          <div className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-2xl font-bold tracking-tight text-white
                             sm:text-3xl">
              MediCo
              <span className="text-electric-400"> LatAm</span>
            </span>
            <span className="mt-1 text-[10px] font-semibold uppercase
                             tracking-[0.20em] text-clinical-500">
              {organization?.name ?? 'Plataforma clínica'}
            </span>
          </div>
        </Link>
      </div>

      {/* ── RIGHT: info de usuario + avatar ── */}
      <div className="flex items-center gap-3">

        {/* Rol badge */}
        {role && (
          <span className={`hidden items-center rounded-full border px-3 py-1
                            text-[11px] font-semibold uppercase tracking-widest
                            sm:inline-flex ${ROLE_BADGE[role] ?? ROLE_BADGE.paciente}`}>
            {ROLE_LABEL[role] ?? role}
          </span>
        )}

        {/* Info textual */}
        <div className="hidden flex-col items-end leading-tight md:flex">
          <span className="text-sm font-semibold text-white">{displayName}</span>
          <span className="text-xs text-clinical-500">
            {organization?.country_code} · {organization?.currency}
          </span>
        </div>

        {/* Avatar clínico — sin vello facial */}
        <ClinicalAvatar
          name={displayName}
          variant={avatarVariant}
          size={44}
          className="ring-2 ring-electric-500/30 hover:ring-electric-400/60 transition cursor-pointer"
        />

        {/* Sign-out */}
        <button
          type="button"
          onClick={signOut}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          className="flex h-9 w-9 items-center justify-center rounded-lg
                     border border-white/[0.08] text-clinical-500
                     transition hover:border-status-danger/40
                     hover:bg-status-danger/10 hover:text-status-danger"
        >
          <IconLogout />
        </button>
      </div>
    </header>
  );
}

/* ── Micro-íconos SVG inline (sin dependencias externas) ── */
function IconMenu() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
function IconX() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
    </svg>
  );
}
