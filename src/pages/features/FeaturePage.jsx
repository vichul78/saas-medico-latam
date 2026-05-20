import { useParams, Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

/**
 * FeaturePage — Universal dynamic template for /funcionalidades/:categoria/:item
 *
 * Uses URL params to render a clean, full-screen product page for any feature.
 * Renders inside PublicLayout (navbar-only, ZERO sidebar).
 *
 * AESTHETICS:
 * - bg-black, purple/violet accents only, zero green
 * - Geist typography
 * - Glassmorphism placeholder container
 */

const CATEGORY_LABELS = {
  tecnologia: 'Tecnología Avanzada',
  gestion: 'Gestión Integral',
  'facil-uso': 'Fácil de Usar',
  personalizado: 'Personalizado',
};

function formatTitle(slug) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function FeaturePage() {
  const { categoria, item } = useParams();
  const categoryLabel = CATEGORY_LABELS[categoria] || formatTitle(categoria || '');
  const itemLabel = formatTitle(item || '');

  return (
    <div className="w-full min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-24 pb-20 sm:px-8">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#7A22FF] opacity-[0.05] blur-[160px]" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#7A22FF]/40 bg-[#7A22FF]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#CFA8FF]">
            <Sparkles className="h-3.5 w-3.5" />
            {categoryLabel}
          </div>

          {/* Title */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-[#7A22FF] via-[#9450FF] to-[#CFA8FF] bg-clip-text text-transparent">
              {itemLabel}
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/50">
            Funcionalidad del módulo de {categoryLabel.toLowerCase()} diseñada para optimizar la operación clínica de tu centro médico.
          </p>
        </div>
      </section>

      {/* Glassmorphism placeholder */}
      <section className="px-4 pb-24 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-10 text-center backdrop-blur-sm
                          shadow-[0_0_60px_-16px_rgba(122,34,255,0.15)]">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl
                            bg-[#7A22FF]/10 ring-1 ring-[#7A22FF]/25">
              <Sparkles className="h-8 w-8 text-[#9450FF]" />
            </div>
            <h2 className="mb-3 text-xl font-semibold text-white">
              Módulo en despliegue
            </h2>
            <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-white/45">
              La funcionalidad <span className="font-medium text-[#CFA8FF]">{itemLabel}</span> está siendo implementada por nuestro equipo de ingeniería.
              Pronto estará disponible en tu panel de control.
            </p>
            <Link to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7A22FF] to-[#5B27B5]
                         px-6 py-3 text-sm font-semibold text-white
                         shadow-[0_4px_24px_-6px_rgba(122,34,255,0.6)]
                         transition hover:brightness-110">
              Comenzar ahora <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
