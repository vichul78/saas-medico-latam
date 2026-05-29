import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.js';
import ClinicalAvatar from '@/components/common/ClinicalAvatar.jsx';
import DashboardShell from '@/components/dashboards/DashboardShell.jsx';

/*
  Panel de administración.
  Acceso exclusivo: role === 'admin_clinica'
  Muestra métricas globales del tenant, accesos rápidos y resumen operacional.
*/
export default function AdminDashboard() {
  const { profile, organization } = useAuth();

  return (
    <DashboardShell
      role="admin_clinica"
      title="Panel de Administración"
      eyebrow="Panel general · Administrador"
      profile={profile}
    >
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Accesos rápidos */}
      <section className="card-clinical">
        <h2 className="mb-4 font-display text-lg font-semibold text-clinical-800">
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ADMIN_LINKS.map(l => (
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

      {/* Info de organización */}
      {organization && (
        <section className="card-clinical bg-electric-50/40">
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-violet-600">
            Organización activa
          </h2>
          <p className="font-display text-xl font-bold text-clinical-800">{organization.name}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-clinical-500">
            <span>País: <strong className="text-clinical-700">{organization.country_code}</strong></span>
            <span>Moneda: <strong className="text-clinical-700">{organization.currency}</strong></span>
            <span>Plan: <strong className="text-electric-700">{organization.plan}</strong></span>
          </div>
        </section>
      )}
    </DashboardShell>
  );
}

const KPIS = [
  { label: 'Usuarios activos',  value: '—', delta: '+0 hoy',  accent: 'electric' },
  { label: 'Estudios del mes',  value: '—', delta: '+0 hoy',  accent: 'violet'   },
  { label: 'Citas programadas', value: '—', delta: 'próx. 7d', accent: 'electric' },
  { label: 'Facturas emitidas', value: '—', delta: 'del mes',  accent: 'violet'   },
];

const ADMIN_LINKS = [
  { to: '/funcionalidades/gestion/estudios',         label: 'Gestión de estudios',  icon: '🩻' },
  { to: '/funcionalidades/gestion/citas-agendas',    label: 'Citas y agendas',      icon: '📅' },
  { to: '/funcionalidades/gestion/facturacion-cobros', label: 'Facturación',        icon: '🧾' },
  { to: '/funcionalidades/personalizado/integraciones', label: 'Integraciones',     icon: '🔗' },
  { to: '/funcionalidades/tecnologia/ia-asistente',  label: 'IA Asistente',         icon: '🤖' },
  { to: '/nosotros',                                  label: 'Organización',         icon: '🏥' },
];

function KpiCard({ label, value, delta, accent }) {
  const ring = accent === 'electric'
    ? 'border-electric-100 bg-electric-50/60'
    : 'border-violet-100 bg-violet-50/60';
  const text = accent === 'electric' ? 'text-electric-700' : 'text-violet-700';

  return (
    <div className={`rounded-clinical border p-4 ${ring}`}>
      <p className="text-xs font-medium text-clinical-500">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold ${text}`}>{value}</p>
      <p className="mt-0.5 text-xs text-clinical-400">{delta}</p>
    </div>
  );
}
