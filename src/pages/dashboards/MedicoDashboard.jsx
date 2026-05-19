import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.js';
import DashboardShell from '@/components/dashboards/DashboardShell.jsx';

/*
  Dashboard del Médico.
  Acceso exclusivo: role === 'medico'
  Muestra agenda del día, estudios pendientes de lectura y accesos clínicos rápidos.
*/
export default function MedicoDashboard() {
  const { profile } = useAuth();

  return (
    <DashboardShell
      role="medico"
      title="Dashboard Médico"
      eyebrow="Portal clínico · Médico"
      profile={profile}
    >
      {/* Resumen del día */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {MEDICO_KPIS.map(k => <MedicoKpi key={k.label} {...k} />)}
      </div>

      {/* Agenda de hoy — placeholder */}
      <section className="card-clinical">
        <h2 className="mb-4 font-display text-lg font-semibold text-clinical-800">
          Agenda de hoy
        </h2>
        <p className="rounded-xl border border-dashed border-clinical-200 py-8 text-center text-sm text-clinical-400">
          Sin citas programadas · Conecta tu agenda en{' '}
          <Link to="/funcionalidades/gestion/citas-agendas" className="text-electric-600 underline-offset-2 hover:underline">
            Gestión de Citas
          </Link>
        </p>
      </section>

      {/* Estudios pendientes — placeholder */}
      <section className="card-clinical">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-clinical-800">
            Estudios pendientes de lectura
          </h2>
          <Link
            to="/funcionalidades/gestion/estudios"
            className="text-xs font-medium text-electric-600 hover:underline"
          >
            Ver todos →
          </Link>
        </div>
        <p className="rounded-xl border border-dashed border-clinical-200 py-8 text-center text-sm text-clinical-400">
          Worklist vacía · Los estudios asignados aparecerán aquí.
        </p>
      </section>

      {/* Accesos clínicos rápidos */}
      <section className="card-clinical">
        <h2 className="mb-4 font-display text-lg font-semibold text-clinical-800">
          Accesos clínicos
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {MEDICO_LINKS.map(l => (
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
    </DashboardShell>
  );
}

const MEDICO_KPIS = [
  { label: 'Citas hoy',               value: '—', sub: 'programadas',      color: 'text-electric-700', bg: 'bg-electric-50/60 border-electric-100' },
  { label: 'Estudios por leer',        value: '—', sub: 'pendientes',       color: 'text-violet-700',   bg: 'bg-violet-50/60 border-violet-100'     },
  { label: 'Pacientes del mes',        value: '—', sub: 'atendidos',        color: 'text-electric-700', bg: 'bg-electric-50/60 border-electric-100' },
];

const MEDICO_LINKS = [
  { to: '/funcionalidades/tecnologia/visor-dicom',   label: 'Visor DICOM',       icon: '🖥️' },
  { to: '/funcionalidades/tecnologia/ia-asistente',  label: 'Copiloto IA',       icon: '🤖' },
  { to: '/funcionalidades/gestion/documentacion',    label: 'Historia clínica',  icon: '📋' },
  { to: '/funcionalidades/tecnologia/envio-resultados', label: 'Enviar resultados', icon: '📤' },
];

function MedicoKpi({ label, value, sub, color, bg }) {
  return (
    <div className={`rounded-clinical border p-4 ${bg}`}>
      <p className="text-xs font-medium text-clinical-500">{label}</p>
      <p className={`mt-1 font-display text-3xl font-bold ${color}`}>{value}</p>
      <p className="mt-0.5 text-xs text-clinical-400">{sub}</p>
    </div>
  );
}
