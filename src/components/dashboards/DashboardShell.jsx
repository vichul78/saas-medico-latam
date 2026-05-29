import { Link } from 'react-router-dom';
import ClinicalAvatar from '@/components/common/ClinicalAvatar.jsx';
import { useAuth } from '@/hooks/useAuth.js';

/*
  Shell reutilizable para los 3 dashboards (admin / medico / paciente).

  Muestra:
    • Banda superior con saludo personalizado + avatar clínico
    • Badge de rol y organización
    • Botón de cierre de sesión
    • Slot `children` para el contenido específico del rol
*/

const ROLE_LABELS = {
  admin_clinica: 'Administrador',
  medico:        'Médico / Profesional',
  paciente:      'Paciente',
};

const ROLE_ACCENT = {
  admin_clinica: 'text-electric-600 bg-electric-50 border-electric-200',
  medico:        'text-violet-700  bg-violet-50  border-violet-200',
  paciente:      'text-electric-600 bg-electric-50 border-electric-200',
};

export default function DashboardShell({ role, title, eyebrow, profile, children }) {
  const { signOut, organization } = useAuth();

  const firstName = profile?.first_name ?? 'Usuario';
  const avatarVariant =
    profile?.metadata?.gender === 'female' ? 'female'
    : profile?.metadata?.gender === 'male' ? 'male'
    : 'neutral';

  return (
    <div className="space-y-6">

      {/* ── Cabecera del dashboard ── */}
      <header className="card-clinical relative overflow-hidden">
        {/* Destello decorativo */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-electric-gradient opacity-[0.08] blur-3xl"
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Saludo + rol + org */}
          <div className="flex items-center gap-4">
            <ClinicalAvatar
              name={firstName}
              variant={avatarVariant}
              size={60}
            />
            <div>
              {eyebrow && (
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-600">
                  {eyebrow}
                </p>
              )}
              <h1 className="font-display text-2xl font-bold text-clinical-800 sm:text-3xl">
                {title}
              </h1>
              <p className="mt-0.5 text-sm text-clinical-500">
                Bienvenido/a,{' '}
                <span className="font-semibold text-clinical-700">{firstName}</span>
                {organization ? ` · ${organization.name}` : ''}
              </p>
              {/* Badge de rol */}
              <span
                className={`mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${ROLE_ACCENT[role] ?? ROLE_ACCENT.paciente}`}
              >
                {ROLE_LABELS[role] ?? role}
              </span>
            </div>
          </div>

          {/* Acciones de cabecera */}
          <div className="flex items-center gap-3">
            <Link to="/" className="btn-ghost text-xs">
              ← Inicio
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="btn-ghost text-xs text-status-danger hover:border-status-danger/40 hover:text-status-danger"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* ── Contenido del dashboard ── */}
      {children}
    </div>
  );
}
