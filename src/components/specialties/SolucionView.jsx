import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * SolucionView — Reusable enterprise product page for each specialty.
 *
 * Renders a full-screen, immersive one-pager with:
 *   - Hero section with specialty name + value proposition
 *   - Features grid (glassmorphism cards)
 *   - CTA to login
 *
 * Props:
 *   @param {string} specialty - Specialty name (e.g. "Cirugía")
 *   @param {string} subtitle - Value proposition subtitle
 *   @param {string} icon - Emoji or icon string
 *   @param {Array}  features - Array of { title, desc } objects
 *   @param {Array}  highlights - Array of string bullet points
 */
export default function SolucionView({ specialty, subtitle, icon, features = [], highlights = [] }) {
  return (
    <div className="w-full min-h-screen bg-black text-white">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden px-4 pt-20 pb-16 sm:px-8">
        {/* Ambient glow */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#7A22FF] opacity-[0.05] blur-[160px]" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#7A22FF]/40 bg-[#7A22FF]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#CFA8FF]">
            <Sparkles className="h-3.5 w-3.5" />
            Solución por especialidad
          </div>

          {/* Icon + Title */}
          <div className="mb-4 text-5xl">{icon}</div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Módulo de{' '}
            <span className="bg-gradient-to-r from-[#7A22FF] via-[#9450FF] to-[#CFA8FF] bg-clip-text text-transparent">
              {specialty}
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/50">
            {subtitle}
          </p>
        </div>
      </section>

      {/* ── Highlights (bullet points) ── */}
      {highlights.length > 0 && (
        <section className="px-4 pb-16 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
              <ul className="grid gap-3 sm:grid-cols-2">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#7A22FF]" />
                    <span className="text-sm text-white/65">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ── Features Grid (glassmorphism cards) ── */}
      {features.length > 0 && (
        <section className="relative px-4 pb-24 sm:px-8">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-[#040010] to-black" />
          <div className="relative z-10 mx-auto max-w-6xl">
            <h2 className="mb-10 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Funcionalidades del módulo
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <div key={i}
                  className="group rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 backdrop-blur-sm
                             transition hover:border-[#7A22FF]/30 hover:bg-[#7A22FF]/[0.03]
                             hover:shadow-[0_0_36px_-8px_rgba(122,34,255,0.2)]">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl
                                  bg-white/[0.05] text-[#9450FF] ring-1 ring-[#7A22FF]/15
                                  transition group-hover:scale-110 group-hover:ring-[#7A22FF]/50">
                    <span className="text-lg">{f.icon || '⚡'}</span>
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-white">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-white/45">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="px-4 pb-20 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-6 text-lg text-white/45">
            Comienza a digitalizar tu práctica de {specialty.toLowerCase()} hoy.
          </p>
          <Link to="/login"
            className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#7A22FF] to-[#5B27B5]
                       px-8 py-4 text-base font-semibold text-white
                       shadow-[0_8px_40px_-8px_rgba(122,34,255,0.7)]
                       transition hover:brightness-110 hover:scale-[1.02] active:scale-[0.97]">
            Comenzar <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
