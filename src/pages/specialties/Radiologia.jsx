import SolucionView from '@/components/specialties/SolucionView.jsx';

export default function Radiologia() {
  return (
    <SolucionView
      specialty="Radiología"
      icon="🫁"
      subtitle="Visor DICOM nativo en la nube, worklists RIS integradas y reportes radiológicos asistidos por IA."
      highlights={[
        'Visor DICOM sin plugins (CT, MR, DX, US)',
        'Worklists RIS integradas',
        'Informes estructurados con dictado por voz',
        'Exportación PDF con firma digital',
        'Soporte multiplanar y MPR',
        'Mediciones y anotaciones avanzadas',
      ]}
      features={[
        { icon: '🖥️', title: 'Visor DICOM Cloud', desc: 'Visualización directa en navegador. WW/WL, zoom, pan y presets radiológicos.' },
        { icon: '🤖', title: 'Copiloto IA Iris', desc: 'Impresión diagnóstica asistida y dictado de hallazgos por voz.' },
        { icon: '📄', title: 'Informes Profesionales', desc: 'Plantillas por modalidad con exportación PDF A4.' },
        { icon: '📡', title: 'Integración PACS', desc: 'Conexión con archivos DICOM existentes y migración transparente.' },
        { icon: '📊', title: 'Dashboard de Productividad', desc: 'KPIs de estudios leídos, tiempos de respuesta y pendientes.' },
        { icon: '🔐', title: 'Cumplimiento HIPAA/LGPD', desc: 'Encriptación end-to-end y almacenamiento regional.' },
      ]}
    />
  );
}
