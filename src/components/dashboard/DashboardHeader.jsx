import { Link } from 'react-router-dom';
import { useAuth }       from '@/hooks/useAuth.js';
import Logo              from '@/components/brand/Logo.jsx';
import ClinicalAvatar    from '@/components/common/ClinicalAvatar.jsx';
import IrisAvatar        from '@/components/copilot/IrisAvatar.jsx';

/**
 * DashboardHeader — cabecera del área autenticada.
 *
 * Reglas visuales:
 *   • Fondo oscuro translúcido (clinical-900/95) con blur.
 *   • Logo en contenedor MUY GRANDE (80×96 px + glow + pulso).
 *   • Avatar clínico sin vello facial.
 *   • Badge de rol eléctrico/violeta.
 *   • Botón del Copiloto Iris con indicador visual de estado activo.
 *   • CERO tonos verdes.
 *
 * Props nuevas:
 *   onToggleCopilot : fn   — abre/cierra el panel del copiloto
 *   copilotOpen     : bool — estado del panel
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

export default function DashboardHeader({
  onToggleSidebar,
  sidebarOpen,
  onToggleCopilot,
  copilotOpen = false,
}) {
  const { profile, role, organization, signOut } = useAuth();

  const firstName   = profile?.first_name ?? '';
  const lastName    = profile?.last_name  ?? '';
  const displayName = (profile?.display_name
    ?? `${firstName} ${lastName}`.trim())
    || 'Usuario';

  const avatarVariant =
    profile?.metadata?.gender === 'female' ? 'female'
    : profile?.metadata?.gender === 'male'  ? 'male'
    : 'neutral';

  return (
    <header
      className="sticky top-0 z-40 flex h-20 w-full items-center justify-between
                 border-b border-white/[0.06] bg-clinical-900/95 px-4
                 backdrop-blur-md sm:px-6 lg:px-8"
    >

      {/* ── LEFT: burger + LOGO GRANDE ── */}
      <div className="flex items-center gap-4">

        {/* Burger (móvil/tablet) */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Cerrar menú lateral' : 'Abrir menú lateral'}
          aria-expanded={sidebarOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg
                     border border-white/[0.08] text-clinical-400 transition
                     hover:border-electric-500/40 hover:text-electric-400
                     lg:hidden"
        >
          {sidebarOpen ? <IconX /> : <IconMenu />}
        </button>

        {/* LOGOTIPO — escalado prominente */}
        <Link
          to="/dashboard"
          aria-label="Ir al dashboard principal"
          className="group flex items-center gap-3.5"
        >
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center
                          rounded-2xl bg-electric-gradient p-2.5
                          shadow-[0_0_32px_-6px_rgba(122,34,255,0.70)] transition
                          group-hover:shadow-[0_0_44px_-4px_rgba(122,34,255,0.85)]
                          sm:h-24 sm:w-24 sm:rounded-3xl sm:p-3">
            <Logo className="h-full w-full" />
            <span className="absolute inset-0 rounded-2xl ring-1 ring-electric-400/20
                             animate-[ping_3s_ease-in-out_infinite] sm:rounded-3xl"
                  aria-hidden />
          </div>

          <div className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              MediCo<span className="text-electric-400"> LatAm</span>
            </span>
            <span className="mt-1 text-[10px] font-semibold uppercase
                             tracking-[0.20em] text-clinical-500">
              {organization?.name ?? 'Plataforma clínica'}
            </span>
          </div>
        </Link>
      </div>

      {/* ── RIGHT: copiloto + rol + avatar + signout ── */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* ── BOTÓN DEL COPILOTO IRIS ── */}
        <button
          type="button"
          onClick={onToggleCopilot}
          aria-label={copilotOpen ? 'Cerrar copiloto Iris' : 'Abrir copiloto Iris'}
          aria-pressed={copilotOpen}
          title="Copiloto IA Iris"
          className={`
            relative flex items-center gap-2 rounded-xl border px-3 py-2
            text-xs font-semibold transition
            focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400
            ${copilotOpen
              ? 'border-electric-500/60 bg-electric-500/20 text-electric-200 shadow-[0_0_16px_-4px_rgba(122,34,255,0.5)]'
              : 'border-white/[0.08] bg-white/[0.04] text-clinical-400 hover:border-electric-500/40 hover:text-electric-300'
            }
          `}
        >
          {/* Avatar Iris en miniatura */}
          <IrisAvatar
            size={22}
            variant={copilotOpen ? 'typing' : 'default'}
            className="ring-0"
          />
          <span className="hidden sm:inline">
            {copilotOpen ? 'Iris activa' : 'Iris'}
          </span>

          {/* Indicador de estado: pulsa cuando activo */}
          <span
            className={`h-1.5 w-1.5 rounded-full transition
              ${copilotOpen
                ? 'animate-pulse bg-electric-400'
                : 'bg-clinical-600'
              }`}
            aria-hidden
          />
        </button>

        {/* Rol badge */}
        {role && (
          <span
            className={`hidden items-center rounded-full border px-3 py-1
                        text-[11px] font-semibold uppercase tracking-widest
                        sm:inline-flex ${ROLE_BADGE[role] ?? ROLE_BADGE.paciente}`}
          >
            {ROLE_LABEL[role] ?? role}
          </span>
        )}

        {/* Info textual usuario */}
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
          className="cursor-pointer ring-2 ring-electric-500/30 transition
                     hover:ring-electric-400/60"
        />

        {/* Sign-out */}
        <button
          type="button"
          onClick={signOut}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          className="flex h-9 w-9 items-center justify-center rounded-lg
                     border border-white/[0.08] text-clinical-500 transition
                     hover:border-status-danger/40 hover:bg-status-danger/10
                     hover:text-status-danger"
        >
          <IconLogout />
        </button>
      </div>
    </header>
  );
}

/* ── Micro-íconos inline ── */
function IconMenu() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
function IconX() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
    </svg>
  );
}
