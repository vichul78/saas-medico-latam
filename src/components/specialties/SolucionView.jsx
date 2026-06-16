import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

/**
 * SolucionView — Página de especialidad, estilo Apple.
 * Fondo: blanco/#f5f5f7 · Acento: azul #3b82f6 · Sin negro ni violeta.
 */
export default function SolucionView({ specialty, subtitle, icon, features = [], highlights = [] }) {
  return (
    <div className="w-full min-h-screen bg-white text-gray-950" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#f5f5f7] px-4 pt-20 pb-20 sm:px-8">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-200/40 blur-[140px]" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            ✦ Solución por especialidad
          </div>

          <div className="mb-5 text-6xl">{icon}</div>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
            Módulo de{' '}
            <span className="text-blue-600">{specialty}</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-500">
            {subtitle}
          </p>
        </div>
      </section>

      {/* ── Highlights ── */}
      {highlights.length > 0 && (
        <section className="px-4 py-16 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-gray-200 bg-[#f5f5f7] p-8 shadow-sm">
              <ul className="grid gap-3 sm:grid-cols-2">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                    <span className="text-sm text-gray-600">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ── Features Grid ── */}
      {features.length > 0 && (
        <section className="bg-[#f5f5f7] px-4 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">
              Funcionalidades del módulo
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <div key={i}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm
                             transition hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50
                                  transition group-hover:scale-110">
                    <span className="text-xl">{f.icon || '⚡'}</span>
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-gray-950">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-6 text-lg text-gray-500">
            Comienza a digitalizar tu práctica de {specialty.toLowerCase()} hoy.
          </p>
          <Link to="/login"
            className="inline-flex items-center gap-2.5 rounded-2xl bg-blue-600 px-8 py-4 text-base font-semibold text-white
                       shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.97]">
            Comenzar <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
