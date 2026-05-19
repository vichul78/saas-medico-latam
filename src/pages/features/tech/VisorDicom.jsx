import PageShell from '@/components/common/PageShell.jsx';

export default function VisorDicom() {
  return (
    <PageShell
      eyebrow="2.1 Tecnología avanzada"
      title="Visor de Imágenes Médicas (DICOM)"
      description="Soporte completo DICOM: multiplanar, MIP/MPR, mediciones, anotaciones y comparación entre estudios."
    >
      <p className="text-sm text-clinical-600">
        Placeholder. Aquí montaremos el visor (Cornerstone3D) y la lista de series.
      </p>
    </PageShell>
  );
}
