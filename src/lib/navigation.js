// Mapa central de navegación. Una sola fuente de verdad para Header y Sidebar.

export const SPECIALTIES = [
  { slug: 'radiologia', label: 'Radiología' },
  { slug: 'dental', label: 'Dental' },
  { slug: 'cirugia', label: 'Cirugía' },
  { slug: 'cardiologia', label: 'Cardiología' },
  { slug: 'neumologia', label: 'Neumología' },
  { slug: 'audiometria', label: 'Audiometría' },
  { slug: 'patologia', label: 'Patología' },
  { slug: 'obstetrico', label: 'Obstétrico' },
  { slug: 'colposcopia', label: 'Colposcopia' },
  { slug: 'oftalmologia', label: 'Oftalmología' },
  { slug: 'veterinaria', label: 'Veterinaria' },
];

export const FEATURES = {
  tech: {
    label: 'Tecnología avanzada',
    base: 'tecnologia',
    items: [
      { slug: 'ia-asistente', label: 'IA Asistente' },
      { slug: 'visor-dicom', label: 'Visor DICOM' },
      { slug: 'envio-resultados', label: 'Envío de resultados' },
      { slug: 'compatibilidad-total', label: 'Compatibilidad total' },
    ],
  },
  management: {
    label: 'Gestión integral',
    base: 'gestion',
    items: [
      { slug: 'almacenamiento-seguro', label: 'Almacenamiento seguro' },
      { slug: 'estudios', label: 'Gestión de estudios' },
      { slug: 'citas-agendas', label: 'Citas y agendas' },
      { slug: 'documentacion', label: 'Documentación' },
      { slug: 'facturacion-cobros', label: 'Facturación y cobros' },
    ],
  },
  usability: {
    label: 'Fácil de usar',
    base: 'facil-uso',
    items: [
      { slug: 'portal-pacientes', label: 'Portal Pacientes' },
      { slug: 'portal-medicos', label: 'Portal Médicos' },
      { slug: 'recordatorios-citas', label: 'Recordatorios de citas' },
      { slug: 'reduccion-inasistencias', label: 'Reducción de inasistencias' },
    ],
  },
  custom: {
    label: 'Personalizado',
    base: 'personalizado',
    items: [
      { slug: 'adaptacion-total', label: 'Adaptación total' },
      { slug: 'integraciones', label: 'Integraciones' },
      { slug: 'servicios-incluidos', label: 'Servicios incluidos' },
      { slug: 'modelo-precios', label: 'Modelo de precios' },
    ],
  },
};

export const ADDITIONAL = [
  { slug: 'productos', label: 'Productos' },
  { slug: 'nosotros', label: 'Nosotros' },
  { slug: 'contratar', label: 'Contratar' },
];
