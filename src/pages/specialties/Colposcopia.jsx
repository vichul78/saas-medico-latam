import SolucionView from '@/components/specialties/SolucionView.jsx';

export default function Colposcopia() {
  return (
    <SolucionView
      specialty="Colposcopia"
      icon="🔎"
      subtitle="Colposcopia digital con captura de imágenes, mapeo cervical y seguimiento de lesiones."
      highlights={[
        'Captura de imágenes colposcópicas',
        'Mapeo cervical con zonas de transformación',
        'Clasificación IFCPC automatizada',
        'Correlación cito-colpo-histológica',
        'Seguimiento de lesiones en el tiempo',
        'Reportes con imágenes anotadas',
      ]}
      features={[
        { icon: '🔎', title: 'Visor Colposcópico', desc: 'Visualización de imágenes con filtros y magnificación digital.' },
        { icon: '🗺️', title: 'Mapeo Cervical', desc: 'Registro de hallazgos por cuadrante con clasificación IFCPC.' },
        { icon: '📸', title: 'Captura Digital', desc: 'Integración con colposcopios digitales para captura directa.' },
        { icon: '📋', title: 'Correlación', desc: 'Vinculación automática con resultados de Pap y biopsia.' },
        { icon: '📈', title: 'Seguimiento', desc: 'Evolución temporal de lesiones con comparación de imágenes.' },
        { icon: '📄', title: 'Reportes', desc: 'Informes estructurados con imágenes y recomendaciones.' },
      ]}
    />
  );
}
