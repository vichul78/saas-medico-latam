import SolucionView from '@/components/specialties/SolucionView.jsx';

export default function Audiometria() {
  return (
    <SolucionView
      specialty="Audiometría"
      icon="👂"
      subtitle="Audiogramas digitales, logoaudiometría y evaluación auditiva completa para clínicas ORL."
      highlights={[
        'Audiograma tonal digital interactivo',
        'Logoaudiometría con porcentajes',
        'Timpanometría e impedanciometría',
        'Emisiones otoacústicas (OEA)',
        'Potenciales evocados auditivos',
        'Calibración y control de calidad',
      ]}
      features={[
        { icon: '👂', title: 'Audiograma Digital', desc: 'Registro de umbrales auditivos con gráfica estándar ISO.' },
        { icon: '🗣️', title: 'Logoaudiometría', desc: 'Evaluación de discriminación del habla con scoring automático.' },
        { icon: '📊', title: 'Timpanograma', desc: 'Curvas de compliance con clasificación de Jerger.' },
        { icon: '📋', title: 'Reportes ORL', desc: 'Informes estructurados con audiograma integrado.' },
        { icon: '👶', title: 'Screening Neonatal', desc: 'Protocolo de tamizaje auditivo para recién nacidos.' },
        { icon: '🔊', title: 'Adaptación Protésica', desc: 'Seguimiento de adaptación de auxiliares auditivos.' },
      ]}
    />
  );
}
