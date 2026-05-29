import { createBrowserRouter } from 'react-router-dom';

// ── Layouts ──────────────────────────────────────────────────────────────────
import MainLayout      from '@/components/layout/MainLayout.jsx';
import PublicLayout    from '@/components/layout/PublicLayout.jsx';
import DashboardLayout from '@/components/dashboard/DashboardLayout.jsx';

// ── Auth guards ───────────────────────────────────────────────────────────────
import ProtectedRoute from '@/components/auth/ProtectedRoute.jsx';
import RoleRedirect   from '@/components/auth/RoleRedirect.jsx';

// ── Páginas públicas ──────────────────────────────────────────────────────────
import Login    from '@/pages/Login.jsx';
import Register from '@/pages/Register.jsx';
import NotFound from '@/pages/NotFound.jsx';
import ResultadoViewer from '@/pages/public/ResultadoViewer.jsx';

// ── Páginas del sitio (acceso público + autenticado) ─────────────────────────
import LandingPage from '@/pages/LandingPage.jsx';  // ← nueva landing pública
import Home      from '@/pages/Home.jsx';
import Productos from '@/pages/Productos.jsx';
import Nosotros  from '@/pages/Nosotros.jsx';
import Contratar from '@/pages/Contratar.jsx';

// ── Dashboards por rol ────────────────────────────────────────────────────────
import AdminDashboard    from '@/pages/dashboards/AdminDashboard.jsx';
import MedicoDashboard   from '@/pages/dashboards/MedicoDashboard.jsx';
import PacienteDashboard from '@/pages/dashboards/PacienteDashboard.jsx';

// ── Módulos clínicos ──────────────────────────────────────────────────────────
import PatientsPage     from '@/pages/clinical/PatientsPage.jsx';
import AppointmentsPage from '@/pages/clinical/AppointmentsPage.jsx';
import EstudiosPage     from '@/pages/clinical/EstudiosPage.jsx';
import VisorDicomPage   from '@/pages/features/tech/VisorDicom.jsx';
import BillingPage      from '@/pages/billing/BillingPage.jsx';

// ── Soluciones por especialidades (orden obligatorio) ─────────────────────────
import Radiologia  from '@/pages/specialties/Radiologia.jsx';
import Dental      from '@/pages/specialties/Dental.jsx';
import Cirugia     from '@/pages/specialties/Cirugia.jsx';
import Cardiologia from '@/pages/specialties/Cardiologia.jsx';
import Neumologia  from '@/pages/specialties/Neumologia.jsx';
import Audiometria from '@/pages/specialties/Audiometria.jsx';
import Patologia   from '@/pages/specialties/Patologia.jsx';
import Obstetrico  from '@/pages/specialties/Obstetrico.jsx';
import Colposcopia from '@/pages/specialties/Colposcopia.jsx';
import Oftalmologia from '@/pages/specialties/Oftalmologia.jsx';
import Veterinaria from '@/pages/specialties/Veterinaria.jsx';
import Teleradiologia from '@/pages/specialties/Teleradiologia.jsx';

// ── Funcionalidades 2.1 — Tecnología avanzada ────────────────────────────────
import IAAsistente       from '@/pages/features/tech/IAAsistente.jsx';
import VisorDicom        from '@/pages/features/tech/VisorDicom.jsx';
import EnvioResultados   from '@/pages/features/tech/EnvioResultados.jsx';
import CompatibilidadTotal from '@/pages/features/tech/CompatibilidadTotal.jsx';

// ── Funcionalidades 2.2 — Gestión integral ───────────────────────────────────
import AlmacenamientoSeguro from '@/pages/features/management/AlmacenamientoSeguro.jsx';
import GestionEstudios      from '@/pages/features/management/GestionEstudios.jsx';
import GestionCitas         from '@/pages/features/management/GestionCitas.jsx';
import Documentacion        from '@/pages/features/management/Documentacion.jsx';
import FacturacionCobros    from '@/pages/features/management/FacturacionCobros.jsx';

// ── Funcionalidades 2.3 — Fácil de usar ──────────────────────────────────────
import PortalPacientes       from '@/pages/features/usability/PortalPacientes.jsx';
import PortalMedicos         from '@/pages/features/usability/PortalMedicos.jsx';
import RecordatoriosCitas    from '@/pages/features/usability/RecordatoriosCitas.jsx';
import ReduccionInasistencias from '@/pages/features/usability/ReduccionInasistencias.jsx';

// ── Funcionalidades 2.4 — Personalizado ──────────────────────────────────────
import AdaptacionTotal  from '@/pages/features/custom/AdaptacionTotal.jsx';
import Integraciones    from '@/pages/features/custom/Integraciones.jsx';
import ServiciosIncluidos from '@/pages/features/custom/ServiciosIncluidos.jsx';
import ModeloPrecios    from '@/pages/features/custom/ModeloPrecios.jsx';

// ── Funcionalidades — Gestión Integral (product page) ─────────────────────────
import GestionIntegral from '@/pages/features/management/GestionIntegral.jsx';

// ── Funcionalidades — Catch-all dynamic page ──────────────────────────────────
import FeaturePage from '@/pages/features/FeaturePage.jsx';

/*
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │  ÁRBOL DE RUTAS                                                             │
  │                                                                             │
  │  COMPLETAMENTE FUERA DE LAYOUTS:                                            │
  │    /login  → Login (pantalla completa oscura)                               │
  │                                                                             │
  │  BAJO MainLayout (sitio público — sidebar de marketing + copiloto claro):   │
  │    /                 → Home                                                 │
  │    /productos        → Productos                                            │
  │    /nosotros         → Nosotros                                             │
  │    /contratar        → Contratar                                            │
  │    /soluciones/…     → 11 especialidades                                    │
  │    /funcionalidades/…→ 16 funcionalidades                                   │
  │                                                                             │
  │  BAJO DashboardLayout (área autenticada — 3 cols oscuras + copiloto dark):  │
  │    /dashboard            → RoleRedirect (dispatcher por rol)                │
  │    /dashboard/admin      → AdminDashboard    [solo admin]                   │
  │    /dashboard/medico     → MedicoDashboard   [solo medico]                  │
  │    /dashboard/paciente   → PacienteDashboard [solo paciente]                │
  │                                                                             │
  │  ERRORES:                                                                   │
  │    *  → NotFound                                                            │
  └─────────────────────────────────────────────────────────────────────────────┘
*/
export const router = createBrowserRouter([

  // ── 1. Pantalla de Login (fuera de cualquier layout) ──────────────────────
  {
    path:         '/login',
    element:      <Login />,
    errorElement: <NotFound />,
  },

  // ── 1b. Registro de cuenta (fuera de cualquier layout, como /login) ───────
  {
    path:         '/register',
    element:      <Register />,
    errorElement: <NotFound />,
  },

  // ── 1c. Visor publico de resultados compartidos (sin layout) ──────────────
  {
    path:         '/resultado/:token',
    element:      <ResultadoViewer />,
    errorElement: <NotFound />,
  },

  // ── 2. DashboardLayout — área autenticada ─────────────────────────────────
  //    Tiene su propio header oscuro, sidebar colapsable y copiloto dark.
  //    Todas las rutas aquí requieren sesión; el guard está por rol.
  {
    path:         '/dashboard',
    element:      <DashboardLayout />,
    errorElement: <NotFound />,
    children: [

      // Dispatcher: redirige según rol sin renderizar nada propio.
      { index: true, element: <RoleRedirect /> },

      // Admin
      {
        element: <ProtectedRoute requiredRoles={['admin_clinica']} />,
        children: [
          { path: 'admin', element: <AdminDashboard /> },
        ],
      },

      // Médico
      {
        element: <ProtectedRoute requiredRoles={['medico']} />,
        children: [
          { path: 'medico', element: <MedicoDashboard /> },
        ],
      },

      // Paciente
      {
        element: <ProtectedRoute requiredRoles={['paciente']} />,
        children: [
          { path: 'paciente', element: <PacienteDashboard /> },
        ],
      },

      // ── Módulos clínicos (admin + medico) ────────────────────────────────
      {
        element: <ProtectedRoute requiredRoles={['admin_clinica', 'medico']} />,
        children: [
          { path: 'pacientes', element: <PatientsPage /> },
          { path: 'citas',     element: <AppointmentsPage /> },
          { path: 'visor',     element: <VisorDicomPage /> },
          { path: 'estudios',  element: <EstudiosPage /> },
        ],
      },

      // ── Módulo de facturación (solo admin) ───────────────────────────────
      {
        element: <ProtectedRoute requiredRoles={['admin_clinica']} />,
        children: [
          { path: 'facturacion', element: <BillingPage /> },
        ],
      },

      // 404 dentro del dashboard
      { path: '*', element: <NotFound /> },
    ],
  },

  // ── 3. LandingPage — pública, SIN layout interno (sin sidebar) ───────────
  //    Se monta en la raíz como ruta independiente para que NO herede
  //    el MainLayout (que aporta header lateral + sidebar de marketing).
  {
    path:         '/',
    element:      <LandingPage />,
    errorElement: <NotFound />,
  },

  // ── 4. PublicLayout — páginas públicas SIN sidebar ──────────────────────
  //    Solo Navbar superior liquid-glass + Outlet. Cero barra lateral.
  //    Usado para: /soluciones/*, /funcionalidades/*, /productos, /nosotros
  {
    element:      <PublicLayout />,
    errorElement: <NotFound />,
    children: [

      // Marketing pages
      { path: 'home',       element: <Home /> },
      { path: 'productos',  element: <Productos /> },
      { path: 'nosotros',   element: <Nosotros /> },
      { path: 'contratar',  element: <Contratar /> },

      // 1. Soluciones por especialidades (AISLADAS del sidebar)
      {
        path: 'soluciones',
        children: [
          { path: 'radiologia',   element: <Radiologia /> },
          { path: 'dental',       element: <Dental /> },
          { path: 'cirugia',      element: <Cirugia /> },
          { path: 'cardiologia',  element: <Cardiologia /> },
          { path: 'neumologia',   element: <Neumologia /> },
          { path: 'audiometria',  element: <Audiometria /> },
          { path: 'patologia',    element: <Patologia /> },
          { path: 'obstetrico',   element: <Obstetrico /> },
          { path: 'colposcopia',  element: <Colposcopia /> },
          { path: 'oftalmologia', element: <Oftalmologia /> },
          { path: 'veterinaria',  element: <Veterinaria /> },
          { path: 'teleradiologia', element: <Teleradiologia /> },
        ],
      },

      // 2. Funcionalidades (AISLADAS del sidebar)
      {
        path: 'funcionalidades',
        children: [
          // Página de producto: Gestión Integral
          { path: 'gestion-integral',               element: <GestionIntegral /> },
          { path: 'tecnologia/ia-asistente',        element: <IAAsistente /> },
          { path: 'tecnologia/visor-dicom',          element: <VisorDicom /> },
          { path: 'tecnologia/envio-resultados',     element: <EnvioResultados /> },
          { path: 'tecnologia/compatibilidad-total', element: <CompatibilidadTotal /> },
          { path: 'gestion/almacenamiento-seguro',   element: <AlmacenamientoSeguro /> },
          { path: 'gestion/estudios',                element: <GestionEstudios /> },
          { path: 'gestion/citas-agendas',           element: <GestionCitas /> },
          { path: 'gestion/documentacion',           element: <Documentacion /> },
          { path: 'gestion/facturacion-cobros',      element: <FacturacionCobros /> },
          { path: 'facil-uso/portal-pacientes',          element: <PortalPacientes /> },
          { path: 'facil-uso/portal-medicos',            element: <PortalMedicos /> },
          { path: 'facil-uso/recordatorios-citas',       element: <RecordatoriosCitas /> },
          { path: 'facil-uso/reduccion-inasistencias',   element: <ReduccionInasistencias /> },
          { path: 'personalizado/adaptacion-total',      element: <AdaptacionTotal /> },
          { path: 'personalizado/integraciones',         element: <Integraciones /> },
          { path: 'personalizado/servicios-incluidos',   element: <ServiciosIncluidos /> },
          { path: 'personalizado/modelo-precios',        element: <ModeloPrecios /> },
          // Catch-all: any /funcionalidades/:categoria/:item not matched above
          { path: ':categoria/:item',                        element: <FeaturePage /> },
        ],
      },

      // 404 dentro del sitio público
      { path: '*', element: <NotFound /> },
    ],
  },
]);
