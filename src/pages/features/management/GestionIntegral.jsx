import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Calendar, Users, Receipt, Smartphone } from 'lucide-react';

/**
 * GestionIntegral — Product Page "Gestión Integral y Cobros (RIS)"
 *
 * Full-screen one-pager scroll:
 *   1. Hero (alto impacto)
 *   2. Comparativa flujo tradicional vs automatizado
 *   3. Grid de funcionalidades clave (4 pilares)
 *   4. CTA final
 *
 * AESTHETICS: bg-black, purple/violet only, ZERO green, Geist font.
 * LAYOUT: Renders inside PublicLayout (navbar-only, no sidebar).
 */

/* ── Feature cards data ── */
const PILLARS = [
  {
    icon: <Calendar className="h-6 w-6" />,
    title: 'Agenda Inteligente',
    desc: 'Recordatorios automáticos vía WhatsApp para reducir inasistencias. Multi-recurso, multi-sala, multi-profesional.',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Portal de Médicos Referentes',
    desc: 'Acceso directo a diagnósticos y visor web para los doctores que remiten pacientes a tu centro.',
  },
  {
    icon: <Receipt className="h-6 w-6" />,
    title: 'Facturación y Cobros',
    desc: 'Gestión multidivisa integrada (MXN, BRL, ARS, COP, CLP), control de caja y CFDI 4.0.',
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: 'Entrega 100% Digital',
    desc: 'Elimina costos de impresión. Los pacientes reciben su código QR y resultados directo en su teléfono.',
  },
];

export default function GestionIntegral() {
  return (
    <div className="w-full min-h-screen bg-black text-white" style={{ fontFamily: 'Geist, Inter, system-ui, sans-serif' }}>

      {/* ═══════════════════════════════════════════════════════════════════════
         1. HERO SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-4 pt-24 pb-20 sm:px-8">
        {/* Ambient glow */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#7A22FF] opacity-[0.05] blur-[180px]" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#7A22FF]/40 bg-[#7A22FF]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#CFA8FF]">
            <Sparkles className="h-3.5 w-3.5" />
            Gestión Integral · RIS
          </div>

          {/* Title */}
          <h1 className="mb-6 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Más que gestión,{' '}
            <span className="bg-gradient-to-r from-[#7A22FF] via-[#9450FF] to-[#CFA8FF] bg-clip-text text-transparent">
              automatización total
            </span>{' '}
            de tu clínica.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/50">
            Centraliza agendas, cobros multidivisa y entrega de resultados
            desde una sola plataforma en la nube.
          </p>

          {/* CTA */}
          <Link to="/login"
            className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#7A22FF] to-[#5B27B5]
                       px-8 py-4 text-base font-semibold text-white
                       shadow-[0_8px_40px_-8px_rgba(122,34,255,0.7)]
                       transition hover:brightness-110 hover:scale-[1.02] active:scale-[0.97]">
            Agendar demostración <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
         2. COMPARATIVA: FLUJO TRADICIONAL vs AUTOMATIZADO
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative px-4 pb-24 sm:px-8">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-[#04001a] to-black" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Tu flujo de trabajo,{' '}
            <span className="bg-gradient-to-r from-[#7A22FF] to-[#CFA8FF] bg-clip-text text-transparent">
              reinventado
            </span>
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Flujo Tradicional */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                Flujo Tradicional
              </div>
              <div className="space-y-4">
                {[
                  'Registro físico en papel',
                  'Envío manual de estudios a PACS',
                  'Impresión de placas y reportes',
                  'Entrega física al paciente',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-[10px] font-bold text-white/30">
                      {i + 1}
                    </div>
                    <p className="text-sm text-white/40 line-through decoration-white/20">{step}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs text-white/25 italic">Lento, costoso, propenso a errores.</p>
            </div>

            {/* Flujo Automatizado */}
            <div className="rounded-2xl border border-[#7A22FF]/25 bg-white/[0.02] p-7 backdrop-blur-sm
                            shadow-[0_0_60px_-16px_rgba(122,34,255,0.15)]"
                 style={{ backdropFilter: 'blur(12px) saturate(1.4)' }}>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#7A22FF]/40 bg-[#7A22FF]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#CFA8FF]">
                <Sparkles className="h-3 w-3" /> Flujo Automatizado
              </div>
              <div className="space-y-4">
                {[
                  'Registro digital con agenda inteligente',
                  'Interpretación asistida por IA (Copiloto Iris)',
                  'Envío automático por WhatsApp al paciente',
                  'Código QR para acceso instantáneo a resultados',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full
                                    bg-[#7A22FF]/20 ring-1 ring-[#7A22FF]/40 text-[10px] font-bold text-[#CFA8FF]">
                      {i + 1}
                    </div>
                    <p className="text-sm text-white/70">{step}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs text-[#CFA8FF]/60 italic">Rápido, sin papel, sin errores.</p>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
         3. GRID DE FUNCIONALIDADES CLAVE (4 PILARES)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative px-4 pb-28 sm:px-8">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-[#030010] to-black" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <h2 className="mb-14 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Los 4 pilares de la{' '}
            <span className="bg-gradient-to-r from-[#7A22FF] to-[#CFA8FF] bg-clip-text text-transparent">
              gestión automatizada
            </span>
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            {PILLARS.map((p, i) => (
              <div key={i}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.015] p-7 backdrop-blur-sm
                           transition hover:border-[#7A22FF]/30 hover:bg-[#7A22FF]/[0.03]
                           hover:shadow-[0_0_40px_-8px_rgba(122,34,255,0.2)]">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl
                                bg-white/[0.05] text-[#9450FF] ring-1 ring-[#7A22FF]/15
                                transition group-hover:scale-110 group-hover:ring-[#7A22FF]/50">
                  {p.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{p.title}</h3>
                <p className="text-sm leading-relaxed text-white/45">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
         4. CTA FINAL
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-4 pb-24 sm:px-8">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7A22FF] opacity-[0.06] blur-[160px]" />
        <div className="relative z-10 mx-auto max-w-3xl rounded-3xl border border-[#7A22FF]/20 bg-white/[0.015] p-12 text-center backdrop-blur-sm
                        shadow-[0_0_60px_-20px_rgba(122,34,255,0.2)]">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Digitaliza tu operación{' '}
            <span className="bg-gradient-to-r from-[#7A22FF] to-[#CFA8FF] bg-clip-text text-transparent">hoy</span>
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-base text-white/45">
            Sin papeles, sin demoras, sin impresiones. Tu clínica funcionando a velocidad digital.
          </p>
          <Link to="/login"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#7A22FF] to-[#5B27B5]
                       px-8 py-4 text-base font-semibold text-white
                       shadow-[0_8px_40px_-8px_rgba(122,34,255,0.7)]
                       transition hover:brightness-110 hover:scale-[1.02]">
            <ArrowRight className="h-5 w-5" /> Comenzar
          </Link>
        </div>
      </section>
    </div>
  );
}
