/*
  Shell reutilizable para páginas de módulo.
  Mantiene tipografía/espaciado consistentes y deja el centro libre
  para datos e historial (los slots `children` y `aside` son opcionales).
*/
export default function PageShell({
  eyebrow,
  title,
  description,
  children,
  aside,
}) {
  return (
    <div className="space-y-6">
      <header className="card-clinical">
        {eyebrow && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl font-bold text-clinical-800 sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-clinical-600">
            {description}
          </p>
        )}
      </header>

      {children && <section className="card-clinical">{children}</section>}

      {aside && (
        <section className="card-clinical bg-electric-50/40">{aside}</section>
      )}
    </div>
  );
}
