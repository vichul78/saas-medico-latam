import PageShell from '@/components/common/PageShell.jsx';

export default function Cardiologia() {
  return (
    <PageShell
      eyebrow="Solución por especialidad · 4"
      title="Cardiología"
      description="ECG estructurado, Holter, ecocardiograma y métricas longitudinales del paciente."
    >
      <p className="text-sm text-clinical-600">
        Módulo placeholder. Lectura de ECG y reportes longitudinales.
      </p>
    </PageShell>
  );
}
