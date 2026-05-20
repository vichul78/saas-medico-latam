import SolucionView from '@/components/specialties/SolucionView.jsx';

export default function Teleradiologia() {
  return (
    <SolucionView
      specialty="Teleradiología"
      icon="🌐"
      subtitle="Red nacional de diagnóstico remoto. Conecta tu clínica con radiólogos certificados en todo LatAm para lectura de estudios en menos de 2 horas."
      highlights={[
        'Red de radiólogos certificados a nivel nacional',
        'Lectura remota en menos de 2 horas (urgentes < 30 min)',
        'Firma digital con código QR de validación',
        'Dictado por voz asistido por IA (Copiloto Iris)',
        'Soporte CT, MR, DX, US, MG y todas las modalidades',
        'Trazabilidad completa y auditoría de cada estudio',
        'Cumplimiento HIPAA, LGPD y LFPDPPP',
        'Integración transparente con tu PACS existente',
      ]}
      features={[
        { icon: '☁️', title: 'Carga Segura en la Nube', desc: 'La clínica local sube el estudio DICOM al sistema. Encriptación end-to-end y almacenamiento regional certificado.' },
        { icon: '🧠', title: 'Asignación Inteligente', desc: 'El motor de distribución notifica automáticamente a especialistas según modalidad, subespecialidad y prioridad del caso.' },
        { icon: '✍️', title: 'Dictado e Impresión IA', desc: 'El radiólogo remoto analiza el estudio, dicta hallazgos por voz con Iris y genera el informe estructurado en segundos.' },
        { icon: '🔏', title: 'Firma Digital + QR', desc: 'Cada informe lleva firma electrónica avanzada y código QR verificable para validez legal en toda la región.' },
        { icon: '⚡', title: 'SLA de Respuesta', desc: 'Estudios urgentes en menos de 30 minutos. Rutinas en menos de 2 horas. Monitoreo de cumplimiento en tiempo real.' },
        { icon: '📊', title: 'Dashboard de Red', desc: 'Panel administrativo con métricas de productividad, tiempos de respuesta y distribución por especialista.' },
        { icon: '🏥', title: 'Multi-Sede', desc: 'Configura múltiples centros de imagen que comparten la misma red de lectura remota centralizada.' },
        { icon: '👨‍⚕️', title: 'Red de Especialistas', desc: 'Acceso a subespecialistas en neurorradiología, musculoesquelético, pediátrico, mama y más.' },
        { icon: '📱', title: 'Notificaciones en Tiempo Real', desc: 'El médico referente recibe notificación instantánea cuando el informe está disponible.' },
      ]}
    />
  );
}
