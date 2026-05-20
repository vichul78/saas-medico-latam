import SolucionView from '@/components/specialties/SolucionView.jsx';

export default function Cardiologia() {
  return (
    <SolucionView
      specialty="Cardiología"
      icon="❤️"
      subtitle="Electrocardiogramas digitales, ecocardiogramas DICOM y monitoreo cardiovascular integrado."
      highlights={[
        'ECG digital con interpretación asistida',
        'Visor de ecocardiogramas DICOM',
        'Cálculo automático de fracción de eyección',
        'Informes de Holter estructurados',
        'Monitoreo de presión arterial',
        'Seguimiento de factores de riesgo',
      ]}
      features={[
        { icon: '💓', title: 'ECG Digital', desc: 'Captura y visualización de electrocardiogramas con mediciones automáticas.' },
        { icon: '🫀', title: 'Ecocardiograma', desc: 'Visor DICOM para estudios de eco con cálculos hemodinámicos.' },
        { icon: '📈', title: 'Holter y MAPA', desc: 'Reportes estructurados de monitoreo ambulatorio.' },
        { icon: '⚠️', title: 'Score de Riesgo', desc: 'Cálculo automatizado de riesgo cardiovascular.' },
        { icon: '💊', title: 'Control Farmacológico', desc: 'Seguimiento de medicación anticoagulante y antihipertensiva.' },
        { icon: '📊', title: 'Tendencias', desc: 'Gráficos evolutivos de presión arterial y frecuencia cardíaca.' },
      ]}
    />
  );
}
