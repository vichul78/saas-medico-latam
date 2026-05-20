import SolucionView from '@/components/specialties/SolucionView.jsx';

export default function Cirugia() {
  return (
    <SolucionView
      specialty="Cirugía"
      icon="🔬"
      subtitle="Programación de quirófanos, checklist preoperatorio, consentimiento informado y notas operatorias integradas en un flujo digital completo."
      highlights={[
        'Programación quirúrgica multi-sala',
        'Checklist de seguridad OMS automatizado',
        'Consentimiento informado digital con firma',
        'Notas operatorias estructuradas',
        'Bitácora intraoperatoria en tiempo real',
        'Integración con anestesiología',
      ]}
      features={[
        { icon: '📋', title: 'Bitácora Intraoperatoria', desc: 'Registro cronológico de eventos quirúrgicos con timestamps automáticos.' },
        { icon: '✍️', title: 'Consentimientos Digitales', desc: 'Firma electrónica del paciente con validez legal LFPDPPP.' },
        { icon: '📅', title: 'Agenda Quirúrgica', desc: 'Calendario visual multi-sala con asignación de equipos y personal.' },
        { icon: '📊', title: 'Reportes Postoperatorios', desc: 'Generación automática de notas quirúrgicas y reportes PDF.' },
        { icon: '🔒', title: 'Trazabilidad Completa', desc: 'Auditoría de cada paso del proceso quirúrgico.' },
        { icon: '🏥', title: 'Integración RIS/PACS', desc: 'Acceso directo a estudios de imagen desde el módulo quirúrgico.' },
      ]}
    />
  );
}
