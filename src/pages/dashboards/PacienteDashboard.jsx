import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.js';
import DashboardShell from '@/components/dashboards/DashboardShell.jsx';

/*
  Portal del Paciente.
  Acceso exclusivo: role === 'paciente'
  Muestra próximas citas, resultados disponibles y mensajes del médico.
*/
export default function PacienteDashboard() {
  const { profile } = useAuth();

  return (
    <DashboardShell
      role="paciente"
      title="Tu Portal de Salud"
      eyebrow="Portal del paciente"
      profile={profile}
    >
      {/* Próximas citas */}
      <section className="card-clinical">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-clinical-800">
            Próximas citas
          </h2>
          <span className="badge-violet">+Nueva cita</span>
        </div>
        <p className="rounded-xl border border-dashed border-clinical-200 py-10 text-center text-sm text-clinical-400">
          No tienes citas programadas próximamente.
        </p>
      </section>

      {/* Resultados disponibles */}
      <section className="card-clinical">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-clinical-800">
            Resultados disponibles
          </h2>
          <Link
            to="/funcionalidades/tecnologia/envio-resultados"
            className="text-xs font-medium text-electric-600 hover:underline"
          >
            Ver todos →
          </Link>
        </div>
        <p className="rounded-xl border border-dashed border-clinical-200 py-10 text-center text-sm text-clinical-400">
          Aquí aparecerán tus estudios e imágenes cuando estén listos.
        </p>
      </section>

      {/* Accesos del paciente */}
      <section className="card-clinical">
        <h2 className="mb-4 font-display text-lg font-semibold text-clinical-800">
          Mis recursos
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PACIENTE_LINKS.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className="flex flex-col gap-1.5 rounded-clinical border border-clinical-200 bg-white p-4 transition hover:border-electric-300 hover:shadow-clinical"
            >
              <span className="text-xl" aria-hidden>{l.icon}</span>
              <span className="text-sm font-medium text-clinical-700">{l.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recordatorio de cumplimiento */}
      <aside className="rounded-clinical border border-violet-200 bg-violet-50/50 p-5">
        <p className="text-sm font-medium text-violet-800">
          🔒 Tu información médica está cifrada y protegida bajo los estándares{' '}
          <strong>HIPAA · LGPD · LFPDPPP</strong>.
        </p>
      </aside>
    </DashboardShell>
  );
}

const PACIENTE_LINKS = [
  { to: '/funcionalidades/facil-uso/portal-pacientes',       label: 'Mi expediente',     icon: '📂' },
  { to: '/funcionalidades/facil-uso/recordatorios-citas',    label: 'Recordatorios',     icon: '🔔' },
  { to: '/funcionalidades/tecnologia/envio-resultados',      label: 'Mis resultados',    icon: '📄' },
  { to: '/funcionalidades/facil-uso/reduccion-inasistencias',label: 'Reagendar',         icon: '📅' },
  { to: '/contratar',                                         label: 'Soporte',           icon: '💬' },
];
