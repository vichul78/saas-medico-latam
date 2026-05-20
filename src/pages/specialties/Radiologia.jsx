import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Monitor, Smartphone, Brain, Send, Globe, ShieldCheck } from 'lucide-react';

/**
 * Radiología / Imagenología — Enterprise Product Page
 *
 * Full-screen one-pager scroll:
 *   1. Hero (propuesta de valor principal)
 *   2. Grid de beneficios clave (6 tarjetas liquid-glass)
 *   3. Banner de Teleradiología (cross-selling)
 *   4. CTA final
 *
 * AESTHETICS: bg-black, purple/violet only, ZERO green/blue, Geist font.
 * LAYOUT: Renders inside PublicLayout (navbar-only, no sidebar).
 */

const BENEFITS = [
  {
    icon: <Monitor className="h-6 w-6" />,
    title: 'Acceso Universal',
    desc: 'Visor DICOM web. Funciona en celular, tablet y computadora sin instalar programas ni plugins.',
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: 'Ecología y Ahorro',
    desc: 'Cero placas impresas. Entrega resultados digitales con código QR para validación instantánea.',
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: 'Copiloto Inteligente',
    desc: 'Dictado de voz IA y pre-diagnóstico con redes neuronales integrado directamente en el visor.',
  },
  {
    icon: <Send className="h-6 w-6" />,
    title: 'Distribución Inmediata',
    desc: 'Envía el reporte y las imágenes al paciente y al médico referente automáticamente por WhatsApp o SMS.',
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: 'Multi-Modalidad',
    desc: 'Soporte completo CT · MR · DX · CR · US · MG · ECG. Worklists RIS integradas nativamente.',
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'Cumplimiento Regional',
    desc: 'HIPAA, LGPD y LFPDPPP. Encriptación end-to-end con almacenamiento en servidores regionales.',
  },
];

export default function Radiologia() {
  return (
    <div className="w-full min-h-screen bg-black text-white" style={{ fontFamily: 'Geist, Inter, system-ui, sans-serif' }}>

      {/* ═══════════════════════════════════════════════════════════════════════
         1. HERO SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-4 pt-24 pb-20 sm:px-8">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#7A22FF] opacity-[0.05] blur-[180px]" />
        <div aria-hidden className="pointer-events-none absolute right-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-[#5B27B5] opacity-[0.04] blur-[140px]" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#7A22FF]/40 bg-[#7A22FF]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#CFA8FF]">
            <Sparkles className="h-3.5 w-3.5" />
            Imagenología · Visor PACS
          </div>

          {/* Title */}
          <h1 className="mb-6 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Imagenología{' '}
            <span className="bg-gradient-to-r from-[#7A22FF] via-[#9450FF] to-[#CFA8FF] bg-clip-text text-transparent">
              100% en la nube.
            </span>
            <br />
            Diagnostica desde cualquier lugar.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/50">
            Almacenamiento PACS seguro, visor DICOM móvil y entrega de resultados
            a pacientes vía WhatsApp en un solo clic.
          </p>

          {/* CTA */}
          <Link to="/login"
            className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#7A22FF] to-[#5B27B5]
                       px-8 py-4 text-base font-semibold text-white
                       shadow-[0_8px_40px_-8px_rgba(122,34,255,0.7)]
                       transition hover:brightness-110 hover:scale-[1.02] active:scale-[0.97]">
            Probar Visor DICOM <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
         2. GRID DE BENEFICIOS CLAVE (6 tarjetas liquid-glass)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative px-4 pb-28 sm:px-8">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-[#04001a] to-black" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <h2 className="mb-14 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Arquitectura diseñada para{' '}
            <span className="bg-gradient-to-r from-[#7A22FF] to-[#CFA8FF] bg-clip-text text-transparent">
              la práctica radiológica real
            </span>
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b, i) => (
              <div key={i}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.015] p-7 backdrop-blur-sm
                           transition hover:border-[#7A22FF]/30 hover:bg-[#7A22FF]/[0.03]
                           hover:shadow-[0_0_40px_-8px_rgba(122,34,255,0.2)]">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl
                                bg-white/[0.05] text-[#9450FF] ring-1 ring-[#7A22FF]/15
                                transition group-hover:scale-110 group-hover:ring-[#7A22FF]/50">
                  {b.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{b.title}</h3>
                <p className="text-sm leading-relaxed text-white/45">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
         3. BANNER DE TELERADIOLOGÍA (Cross-selling)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative px-4 pb-24 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-[#7A22FF]/20 bg-white/[0.015] backdrop-blur-sm
                          shadow-[0_0_60px_-16px_rgba(122,34,255,0.12)]">
            {/* Top accent border */}
            <div className="h-1 bg-gradient-to-r from-transparent via-[#5B27B5] to-transparent" />

            <div className="flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left md:p-10">
              {/* Icon */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl
                              bg-[#7A22FF]/10 ring-1 ring-[#7A22FF]/25">
                <span className="text-2xl">🌐</span>
              </div>

              {/* Text */}
              <div className="flex-1">
                <h3 className="mb-2 text-lg font-semibold text-white">
                  ¿Estudios urgentes de madrugada?
                </h3>
                <p className="text-sm leading-relaxed text-white/50">
                  Conéctate a nuestra <span className="font-medium text-[#CFA8FF]">Red Nacional de Teleradiología</span> y
                  obtén diagnósticos de especialistas certificados en minutos. Firma digital con código QR incluida.
                </p>
              </div>

              {/* CTA */}
              <Link to="/soluciones/teleradiologia"
                className="shrink-0 rounded-xl border border-[#7A22FF]/50 bg-[#7A22FF]/10
                           px-5 py-2.5 text-sm font-semibold text-white
                           shadow-[0_0_20px_-6px_rgba(122,34,255,0.4)]
                           transition hover:bg-[#7A22FF]/20 hover:shadow-[0_0_28px_-4px_rgba(122,34,255,0.6)]">
                Conocer la Red →
              </Link>
            </div>
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
            Tu centro de imagen,{' '}
            <span className="bg-gradient-to-r from-[#7A22FF] to-[#CFA8FF] bg-clip-text text-transparent">
              sin límites
            </span>
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-base text-white/45">
            Sin placas, sin CD, sin instalaciones. Imagenología digital de punta a punta con IA integrada.
          </p>
          <Link to="/login"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#7A22FF] to-[#5B27B5]
                       px-8 py-4 text-base font-semibold text-white
                       shadow-[0_8px_40px_-8px_rgba(122,34,255,0.7)]
                       transition hover:brightness-110 hover:scale-[1.02]">
            <ArrowRight className="h-5 w-5" /> Comenzar ahora
          </Link>
        </div>
      </section>
    </div>
  );
}
