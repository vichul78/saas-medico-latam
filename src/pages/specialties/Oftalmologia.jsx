import SolucionView from '@/components/specialties/SolucionView.jsx';

export default function Oftalmologia() {
  return (
    <SolucionView
      specialty="Oftalmología"
      icon="👁️"
      subtitle="Retinografía digital, OCT, campimetría y gestión integral de la práctica oftalmológica."
      highlights={[
        'Retinografía digital con análisis IA',
        'OCT con segmentación automática',
        'Campimetría computarizada',
        'Topografía corneal',
        'Biometría para cálculo de LIO',
        'Refracción y agudeza visual',
      ]}
      features={[
        { icon: '👁️', title: 'Retinografía', desc: 'Visor de fondo de ojo con detección de retinopatía asistida por IA.' },
        { icon: '📊', title: 'OCT Viewer', desc: 'Visualización de capas retinianas con medición de espesores.' },
        { icon: '🎯', title: 'Campimetría', desc: 'Campos visuales con progresión de defectos glaucomatosos.' },
        { icon: '🔵', title: 'Topografía', desc: 'Mapas corneales para screening de queratocono y pre-cirugía.' },
        { icon: '📏', title: 'Biometría', desc: 'Cálculo de lente intraocular con fórmulas de última generación.' },
        { icon: '📋', title: 'Historia Clínica', desc: 'Evoluciones especializadas con refracción y PIO.' },
      ]}
    />
  );
}
