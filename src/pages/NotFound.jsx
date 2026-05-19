import { Link, useRouteError } from 'react-router-dom';

export default function NotFound() {
  const err = useRouteError?.();
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600">
        404
      </p>
      <h1 className="font-display text-3xl font-bold text-clinical-800">
        Ruta no encontrada
      </h1>
      <p className="text-sm text-clinical-600">
        {err?.statusText || err?.message || 'La página que buscas no existe en esta plataforma clínica.'}
      </p>
      <Link to="/" className="btn-primary">
        Volver al inicio
      </Link>
    </div>
  );
}
