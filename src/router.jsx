import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout.jsx';
import NotFound from '@/pages/NotFound.jsx';
import Home from '@/pages/Home.jsx';

// Soluciones por especialidades (orden obligatorio)
import Radiologia from '@/pages/specialties/Radiologia.jsx';
import Dental from '@/pages/specialties/Dental.jsx';
import Cirugia from '@/pages/specialties/Cirugia.jsx';
import Cardiologia from '@/pages/specialties/Cardiologia.jsx';
import Neumologia from '@/pages/specialties/Neumologia.jsx';
import Audiometria from '@/pages/specialties/Audiometria.jsx';
import Patologia from '@/pages/specialties/Patologia.jsx';
import Obstetrico from '@/pages/specialties/Obstetrico.jsx';
import Colposcopia from '@/pages/specialties/Colposcopia.jsx';
import Oftalmologia from '@/pages/specialties/Oftalmologia.jsx';
import Veterinaria from '@/pages/specialties/Veterinaria.jsx';

// Funcionalidades 2.1 — Tecnología avanzada
import IAAsistente from '@/pages/features/tech/IAAsistente.jsx';
import VisorDicom from '@/pages/features/tech/VisorDicom.jsx';
import EnvioResultados from '@/pages/features/tech/EnvioResultados.jsx';
import CompatibilidadTotal from '@/pages/features/tech/CompatibilidadTotal.jsx';

// Funcionalidades 2.2 — Gestión integral
import AlmacenamientoSeguro from '@/pages/features/management/AlmacenamientoSeguro.jsx';
import GestionEstudios from '@/pages/features/management/GestionEstudios.jsx';
import GestionCitas from '@/pages/features/management/GestionCitas.jsx';
import Documentacion from '@/pages/features/management/Documentacion.jsx';
import FacturacionCobros from '@/pages/features/management/FacturacionCobros.jsx';

// Funcionalidades 2.3 — Fácil de usar
import PortalPacientes from '@/pages/features/usability/PortalPacientes.jsx';
import PortalMedicos from '@/pages/features/usability/PortalMedicos.jsx';
import RecordatoriosCitas from '@/pages/features/usability/RecordatoriosCitas.jsx';
import ReduccionInasistencias from '@/pages/features/usability/ReduccionInasistencias.jsx';

// Funcionalidades 2.4 — Personalizado
import AdaptacionTotal from '@/pages/features/custom/AdaptacionTotal.jsx';
import Integraciones from '@/pages/features/custom/Integraciones.jsx';
import ServiciosIncluidos from '@/pages/features/custom/ServiciosIncluidos.jsx';
import ModeloPrecios from '@/pages/features/custom/ModeloPrecios.jsx';

// Adicionales
import Productos from '@/pages/Productos.jsx';
import Nosotros from '@/pages/Nosotros.jsx';
import Contratar from '@/pages/Contratar.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },

      // 1) Soluciones por especialidades
      {
        path: 'soluciones',
        children: [
          { path: 'radiologia', element: <Radiologia /> },
          { path: 'dental', element: <Dental /> },
          { path: 'cirugia', element: <Cirugia /> },
          { path: 'cardiologia', element: <Cardiologia /> },
          { path: 'neumologia', element: <Neumologia /> },
          { path: 'audiometria', element: <Audiometria /> },
          { path: 'patologia', element: <Patologia /> },
          { path: 'obstetrico', element: <Obstetrico /> },
          { path: 'colposcopia', element: <Colposcopia /> },
          { path: 'oftalmologia', element: <Oftalmologia /> },
          { path: 'veterinaria', element: <Veterinaria /> },
        ],
      },

      // 2) Funcionalidades
      {
        path: 'funcionalidades',
        children: [
          // 2.1 Tecnología avanzada
          { path: 'tecnologia/ia-asistente', element: <IAAsistente /> },
          { path: 'tecnologia/visor-dicom', element: <VisorDicom /> },
          { path: 'tecnologia/envio-resultados', element: <EnvioResultados /> },
          { path: 'tecnologia/compatibilidad-total', element: <CompatibilidadTotal /> },

          // 2.2 Gestión integral
          { path: 'gestion/almacenamiento-seguro', element: <AlmacenamientoSeguro /> },
          { path: 'gestion/estudios', element: <GestionEstudios /> },
          { path: 'gestion/citas-agendas', element: <GestionCitas /> },
          { path: 'gestion/documentacion', element: <Documentacion /> },
          { path: 'gestion/facturacion-cobros', element: <FacturacionCobros /> },

          // 2.3 Fácil de usar
          { path: 'facil-uso/portal-pacientes', element: <PortalPacientes /> },
          { path: 'facil-uso/portal-medicos', element: <PortalMedicos /> },
          { path: 'facil-uso/recordatorios-citas', element: <RecordatoriosCitas /> },
          { path: 'facil-uso/reduccion-inasistencias', element: <ReduccionInasistencias /> },

          // 2.4 Personalizado
          { path: 'personalizado/adaptacion-total', element: <AdaptacionTotal /> },
          { path: 'personalizado/integraciones', element: <Integraciones /> },
          { path: 'personalizado/servicios-incluidos', element: <ServiciosIncluidos /> },
          { path: 'personalizado/modelo-precios', element: <ModeloPrecios /> },
        ],
      },

      // Adicionales
      { path: 'productos', element: <Productos /> },
      { path: 'nosotros', element: <Nosotros /> },
      { path: 'contratar', element: <Contratar /> },

      // 404
      { path: '*', element: <NotFound /> },
    ],
  },
]);
