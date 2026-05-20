import SolucionView from '@/components/specialties/SolucionView.jsx';

export default function Veterinaria() {
  return (
    <SolucionView
      specialty="Veterinaria"
      icon="🐾"
      subtitle="Imagenología veterinaria DICOM, fichas clínicas por especie y gestión de clínica animal."
      highlights={[
        'Visor DICOM para radiología veterinaria',
        'Fichas clínicas por especie y raza',
        'Vacunación y desparasitación',
        'Cirugía veterinaria con notas',
        'Laboratorio y hemogramas',
        'Portal para tutores de mascotas',
      ]}
      features={[
        { icon: '🐾', title: 'Ficha Veterinaria', desc: 'Historia clínica adaptada por especie con campos específicos.' },
        { icon: '🩻', title: 'Imaging Veterinario', desc: 'Visor DICOM para Rx y US con presets por especie.' },
        { icon: '💉', title: 'Vacunación', desc: 'Calendario vacunal por especie con recordatorios automáticos.' },
        { icon: '🔬', title: 'Laboratorio', desc: 'Hemogramas y química sanguínea con valores de referencia por especie.' },
        { icon: '🏥', title: 'Cirugía', desc: 'Notas operatorias y protocolos anestésicos veterinarios.' },
        { icon: '📱', title: 'Portal Tutor', desc: 'Acceso del dueño al historial y carnet de vacunación.' },
      ]}
    />
  );
}
