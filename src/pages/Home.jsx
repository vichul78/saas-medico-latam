import { Link } from 'react-router-dom';
import { SPECIALTIES, FEATURES } from '@/lib/navigation.js';

export default function Home() {
  return (
    <div className="space-y-6">
      {/* HERO */}
      <section className="card-clinical relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-electric-gradient opacity-20 blur-3xl"
        />
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600">
          SaaS clínico regional · Latinoamérica
        </p>
        <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold leading-tight text-clinical-800 sm:text-5xl">
          La plataforma médica que tu equipo entiende{' '}
          <span className="text-electric-600">desde el primer día</span>.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-clinical-600">
          11 especialidades, visor DICOM nativo, IA copiloto, facturación
          multi-moneda y portales para médicos y pacientes. Pensado para LatAm.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/contratar" className="btn-primary">
            Contratar
          </Link>
          <Link to="/productos" className="btn-ghost">
            Ver productos
          </Link>
        </div>
      </section>

      {/* Especialidades destacadas */}
      <section className="card-clinical">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600">
              1. Soluciones por especialidad
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-clinical-800">
              Cobertura clínica completa
            </h2>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {SPECIALTIES.map((s) => (
            <li key={s.slug}>
              <Link
                to={`/soluciones/${s.slug}`}
                className="block rounded-clinical border border-clinical-200 bg-white px-3 py-2.5 text-sm font-medium text-clinical-700 transition hover:border-electric-300 hover:text-electric-700"
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Funcionalidades resumidas */}
      <section className="grid gap-4 lg:grid-cols-2">
        {Object.entries(FEATURES).map(([key, group]) => (
          <article key={key} className="card-clinical">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600">
              {keyToCode(key)} {group.label}
            </p>
            <ul className="mt-3 space-y-1.5">
              {group.items.map((item) => (
                <li key={item.slug}>
                  <Link
                    to={`/funcionalidades/${group.base}/${item.slug}`}
                    className="text-sm text-clinical-700 hover:text-electric-700"
                  >
                    · {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  );
}

function keyToCode(key) {
  return {
    tech: '2.1',
    management: '2.2',
    usability: '2.3',
    custom: '2.4',
  }[key];
}
