import SolucionView from '@/components/specialties/SolucionView.jsx';

export default function Obstetrico() {
  return (
    <SolucionView
      specialty="Obstétrico"
      icon="🤱"
      subtitle="Ultrasonido obstétrico DICOM, control prenatal y monitoreo fetal integrado."
      highlights={[
        'Ultrasonido obstétrico con biometría fetal',
        'Control prenatal estructurado',
        'Curvas de crecimiento fetal',
        'Monitoreo cardiotocográfico',
        'Cálculo de edad gestacional',
        'Perfil biofísico automatizado',
      ]}
      features={[
        { icon: '👶', title: 'Biometría Fetal', desc: 'Mediciones fetales con percentiles y curvas de crecimiento.' },
        { icon: '📅', title: 'Control Prenatal', desc: 'Seguimiento por semana gestacional con alertas automáticas.' },
        { icon: '💓', title: 'Cardiotocografía', desc: 'Registro y análisis de frecuencia cardíaca fetal.' },
        { icon: '📊', title: 'Perfil Biofísico', desc: 'Scoring automatizado de los 5 parámetros ecográficos.' },
        { icon: '🩺', title: 'US Doppler', desc: 'Visor DICOM para estudios Doppler de arterias uterinas.' },
        { icon: '📋', title: 'Reportes US', desc: 'Informes estructurados por trimestre con imágenes.' },
      ]}
    />
  );
}
