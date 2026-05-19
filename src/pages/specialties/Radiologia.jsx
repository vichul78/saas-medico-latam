import PageShell from '@/components/common/PageShell.jsx';

export default function Radiologia() {
  return (
    <PageShell
      eyebrow="Solución por especialidad · 1"
      title="Radiología"
      description="Lectura de estudios DICOM, reportes estructurados y workflow PACS-ready. Pensado para servicios de imagen en LatAm."
    >
      <p className="text-sm text-clinical-600">
        Módulo placeholder. Aquí se renderizará el visor DICOM, listado de
        estudios pendientes, plantillas de reporte y flujo de firma electrónica.
      </p>
    </PageShell>
  );
}
