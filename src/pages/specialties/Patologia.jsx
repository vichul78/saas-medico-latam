import SolucionView from '@/components/specialties/SolucionView.jsx';

export default function Patologia() {
  return (
    <SolucionView
      specialty="Patología"
      icon="🧬"
      subtitle="Patología digital, laminillas escaneadas y reportes histopatológicos estructurados."
      highlights={[
        'Visor de laminillas digitales (WSI)',
        'Reportes sinópticos por órgano',
        'Staging TNM automatizado',
        'Inmunohistoquímica con scoring',
        'Citología con clasificación Bethesda',
        'Integración con laboratorio molecular',
      ]}
      features={[
        { icon: '🔬', title: 'Visor WSI', desc: 'Visualización de whole-slide images con zoom multi-nivel.' },
        { icon: '📋', title: 'Reportes Sinópticos', desc: 'Plantillas CAP por tipo tumoral con campos estructurados.' },
        { icon: '🧬', title: 'Molecular', desc: 'Integración de resultados de PCR, FISH e IHQ.' },
        { icon: '📊', title: 'Staging TNM', desc: 'Cálculo automático de estadificación oncológica.' },
        { icon: '🏷️', title: 'Trazabilidad', desc: 'Seguimiento de muestras desde recepción hasta archivo.' },
        { icon: '📄', title: 'Exportación', desc: 'Reportes PDF con imágenes microscópicas embebidas.' },
      ]}
    />
  );
}
