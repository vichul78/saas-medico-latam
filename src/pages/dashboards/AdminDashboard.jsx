import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.js';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics.js';
import DashboardShell from '@/components/dashboards/DashboardShell.jsx';

/*
  Panel de administracion — Dashboard principal con metricas reales.
  Acceso exclusivo: role === 'admin_clinica'
  Muestra: total pacientes, estudios del dia, informes pendientes,
  ultimos estudios recientes, accesos rapidos y datos de organizacion.
*/
export default function AdminDashboard() {
  const { profile, organization } = useAuth();
  const { metrics, loading, error, refresh } = useDashboardMetrics();

  return (
    <DashboardShell
      role="admin_clinica"
      title="Panel de Administracion"
      eyebrow="Panel general · Administrador"
      profile={profile}
    >
      {/* Error de metricas */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-400/30
                        bg-red-400/10 px-4 py-3 text-sm text-red-300">
          <IconAlert />
          {error}
          <button
            type="button"
            onClick={refresh}
            className="ml-auto text-xs underline hover:text-red-200"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* KPI cards con datos reales — 6 tarjetas */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <KpiCard
          label="Total Pacientes"
          value={loading ? '...' : metrics.totalPacientes.toLocaleString('es')}
          delta="registrados"
          accent="electric"
          icon="👥"
        />
        <KpiCard
          label="Estudios Hoy"
          value={loading ? '...' : metrics.estudiosHoy.toLocaleString('es')}
          delta="creados hoy"
          accent="violet"
          icon="🩻"
        />
        <KpiCard
          label="Informes Pendientes"
          value={loading ? '...' : metrics.informesPendientes.toLocaleString('es')}
          delta="por revisar/firmar"
          accent="electric"
          icon="📋"
        />
        <KpiCard
          label="Citas del Mes"
          value={loading ? '...' : metrics.citasMes.toLocaleString('es')}
          delta="ultimos 30 dias"
          accent="violet"
          icon="📅"
        />
        <KpiCard
          label="Ingresos del Mes"
          value={loading ? '...' : `${metrics.ingresosMes.toLocaleString('es', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          delta="facturas pagadas"
          accent="electric"
          icon="💰"
        />
        <KpiCard
          label="Estudios Recientes"
          value={loading ? '...' : metrics.estudiosRecientes.length.toString()}
          delta="ultimos registros"
          accent="violet"
          icon="📊"
        />
      </div>

      {/* Sparkline — estudios por dia (últimos 7 días) */}
      {!loading && metrics.tendenciaEstudios?.length > 0 && (
        <section className="card-clinical">
          <h2 className="mb-4 font-display text-lg font-semibold text-clinical-800">
            Estudios — Últimos 7 días
          </h2>
          <EstudiosSparkline data={metrics.tendenciaEstudios} />
        </section>
      )}

      {/* Ultimos estudios recientes */}
      <section className="card-clinical">
        <h2 className="mb-4 font-display text-lg font-semibold text-clinical-800">
          Ultimos Estudios
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-clinical-200/50" />
            ))}
          </div>
        ) : metrics.estudiosRecientes.length === 0 ? (
          <p className="text-sm text-clinical-500">No hay estudios registrados aun.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-clinical-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-clinical-200 bg-clinical-50">
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-clinical-500">Paciente</th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-clinical-500">Tipo</th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-clinical-500">Fecha</th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-clinical-500">Estado</th>
                </tr>
              </thead>
              <tbody>
                {metrics.estudiosRecientes.map(est => {
                  const paciente = est.pacientes;
                  const name = paciente
                    ? `${paciente.nombre} ${paciente.apellido ?? ''}`.trim()
                    : 'Sin paciente';
                  return (
                    <tr key={est.id} className="border-b border-clinical-100 last:border-0">
                      <td className="px-4 py-2.5 font-medium text-clinical-800">{name}</td>
                      <td className="px-4 py-2.5 text-clinical-600">{est.tipo ?? '-'}</td>
                      <td className="px-4 py-2.5 text-clinical-600">
                        {est.fecha ? new Date(est.fecha).toLocaleDateString('es', { day: '2-digit', month: 'short' }) : '-'}
                      </td>
                      <td className="px-4 py-2.5">
                        <EstadoBadge estado={est.estado} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Accesos rapidos */}
      <section className="card-clinical">
        <h2 className="mb-4 font-display text-lg font-semibold text-clinical-800">
          Accesos rapidos
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

      {/* Info de organizacion */}
      {organization && (
        <section className="card-clinical bg-electric-50/40">
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-violet-600">
            Organizacion activa
          </h2>
          <p className="font-display text-xl font-bold text-clinical-800">{organization.name}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-clinical-500">
            <span>Pais: <strong className="text-clinical-700">{organization.country_code}</strong></span>
            <span>Moneda: <strong className="text-clinical-700">{organization.currency}</strong></span>
            <span>Plan: <strong className="text-electric-700">{organization.plan}</strong></span>
          </div>
        </section>
      )}
    </DashboardShell>
  );
}

const ADMIN_LINKS = [
  { to: '/dashboard/pacientes',  label: 'Pacientes',   icon: '👥' },
  { to: '/dashboard/estudios',   label: 'Estudios',    icon: '🩻' },
  { to: '/dashboard/informes',   label: 'Informes',    icon: '📋' },
  { to: '/dashboard/visor',      label: 'Visor DICOM', icon: '🖥️' },
  { to: '/dashboard/citas',      label: 'Citas',       icon: '📅' },
  { to: '/dashboard/facturacion', label: 'Facturacion', icon: '🧾' },
];

/* -- Sparkline SVG inline — estudios por día -- */
function EstudiosSparkline({ data }) {
  const W = 560;
  const H = 72;
  const PAD = { top: 8, bottom: 28, left: 8, right: 8 };
  const n = data.length;
  const maxVal = Math.max(...data.map(d => d.count), 1);
  const barW = Math.floor((W - PAD.left - PAD.right) / n) - 4;
  const chartH = H - PAD.top - PAD.bottom;

  const fmtDay = (iso) => {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('es', { weekday: 'short', day: 'numeric' });
  };

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-2xl"
        aria-label="Estudios por día — últimos 7 días"
      >
        {data.map((d, i) => {
          const barH = maxVal > 0 ? Math.max(3, (d.count / maxVal) * chartH) : 3;
          const x = PAD.left + i * ((W - PAD.left - PAD.right) / n) + 2;
          const y = PAD.top + (chartH - barH);
          const isToday = i === n - 1;

          return (
            <g key={d.fecha}>
              {/* Barra */}
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={3}
                fill={isToday ? '#7a22ff' : '#7a22ff66'}
              />
              {/* Valor */}
              {d.count > 0 && (
                <text
                  x={x + barW / 2}
                  y={y - 3}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isToday ? '#7a22ff' : '#94a3b8'}
                  fontWeight={isToday ? '700' : '400'}
                >
                  {d.count}
                </text>
              )}
              {/* Label día */}
              <text
                x={x + barW / 2}
                y={H - 6}
                textAnchor="middle"
                fontSize="8"
                fill="#64748b"
              >
                {fmtDay(d.fecha)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* -- KPI Card con icono -- */
function KpiCard({ label, value, delta, accent, icon }) {
  const ring = accent === 'electric'
    ? 'border-electric-100 bg-electric-50/60'
    : 'border-violet-100 bg-violet-50/60';
  const text = accent === 'electric' ? 'text-electric-700' : 'text-violet-700';

  return (
    <div className={`rounded-clinical border p-4 ${ring}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-clinical-500">{label}</p>
        <span className="text-lg" aria-hidden>{icon}</span>
      </div>
      <p className={`mt-1 font-display text-2xl font-bold ${text}`}>{value}</p>
      <p className="mt-0.5 text-xs text-clinical-400">{delta}</p>
    </div>
  );
}

/* -- Badge de estado de estudio -- */
function EstadoBadge({ estado }) {
  const map = {
    recibido: { cls: 'border-amber-200 bg-amber-50 text-amber-700', label: 'Pendiente' },
    pendiente_lectura: { cls: 'border-amber-200 bg-amber-50 text-amber-700', label: 'Pendiente' },
    en_lectura: { cls: 'border-electric-200 bg-electric-50 text-electric-700', label: 'En proceso' },
    informado: { cls: 'border-emerald-200 bg-emerald-50 text-emerald-700', label: 'Completado' },
    entregado: { cls: 'border-emerald-200 bg-emerald-50 text-emerald-700', label: 'Entregado' },
    cancelado: { cls: 'border-rose-200 bg-rose-50 text-rose-700', label: 'Cancelado' },
  };
  const { cls, label } = map[estado] ?? { cls: 'border-clinical-200 bg-clinical-50 text-clinical-600', label: estado };

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}

/* -- Micro-icono -- */
function IconAlert() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round"
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}
