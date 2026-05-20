import SolucionView from '@/components/specialties/SolucionView.jsx';

export default function Neumologia() {
  return (
    <SolucionView
      specialty="Neumología"
      icon="🌬️"
      subtitle="Espirometrías digitales, TC de tórax con IA y manejo integral de patología respiratoria."
      highlights={[
        'Espirometría digital con curvas interactivas',
        'TC de tórax con detección asistida por IA',
        'Polisomnografía y estudios de sueño',
        'Gasometrías y oximetría de pulso',
        'Protocolos de EPOC y asma',
        'Broncoscopia con reporte integrado',
      ]}
      features={[
        { icon: '🌬️', title: 'Espirometría', desc: 'Curvas flujo-volumen con interpretación automática y valores predichos.' },
        { icon: '🫁', title: 'TC Pulmonar + IA', desc: 'Análisis de parénquima con detección de nódulos asistida.' },
        { icon: '😴', title: 'Estudios de Sueño', desc: 'Polisomnografía con scoring automático y reporte PDF.' },
        { icon: '📋', title: 'Protocolos Clínicos', desc: 'Guías GOLD para EPOC y GINA para asma integradas.' },
        { icon: '🩺', title: 'Broncoscopia', desc: 'Reporte de procedimientos con imágenes y biopsias.' },
        { icon: '📊', title: 'Seguimiento', desc: 'Evolución de función pulmonar a lo largo del tiempo.' },
      ]}
    />
  );
}
