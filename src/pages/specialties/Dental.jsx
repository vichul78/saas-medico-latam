import SolucionView from '@/components/specialties/SolucionView.jsx';

export default function Dental() {
  return (
    <SolucionView
      specialty="Dental"
      icon="🦷"
      subtitle="Odontograma digital, periapicales DICOM y gestión integral de tratamientos dentales."
      highlights={[
        'Odontograma interactivo digital',
        'Visualización de periapicales y panorámicas',
        'Historial de tratamientos por pieza',
        'Presupuestos y planes de tratamiento',
        'Imágenes intraorales integradas',
        'Recordatorios de citas automatizados',
      ]}
      features={[
        { icon: '🦷', title: 'Odontograma Digital', desc: 'Registro visual interactivo de estado dental por pieza.' },
        { icon: '📷', title: 'Imaging Dental', desc: 'Periapicales, panorámicas y CBCT en visor DICOM integrado.' },
        { icon: '💰', title: 'Presupuestos', desc: 'Generación de planes de tratamiento con costos desglosados.' },
        { icon: '📋', title: 'Historia Clínica', desc: 'Evoluciones por visita y notas de tratamiento.' },
        { icon: '📅', title: 'Agenda Multi-sillón', desc: 'Calendario por consultorio con colores por tipo de cita.' },
        { icon: '📱', title: 'Portal Paciente', desc: 'Acceso del paciente a su historial y próximas citas.' },
      ]}
    />
  );
}
