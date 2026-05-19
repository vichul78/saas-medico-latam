import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.js';

/*
  ProtectedRoute — guarda de navegación con dos modos:

  1. Modo "autenticado" (sin prop `requiredRoles`):
       Solo verifica que exista sesión activa.
       Si no hay sesión → redirige a /login guardando el `from`.

  2. Modo "por rol" (con prop `requiredRoles`):
       Verifica sesión + que el rol del usuario esté en el array.
       Si no tiene el rol → redirige a su dashboard natural (/dashboard/:rol)
       para no mostrar un 403 desconcertante.

  Uso en router.jsx:
    // Solo autenticado
    <Route element={<ProtectedRoute />}>…</Route>

    // Solo admins
    <Route element={<ProtectedRoute requiredRoles={['admin']} />}>…</Route>

    // Admins y médicos
    <Route element={<ProtectedRoute requiredRoles={['admin','medico']} />}>…</Route>
*/

// Destino natural de cada rol cuando se le niega una ruta ajena.
const ROLE_FALLBACK = {
  admin:    '/dashboard/admin',
  medico:   '/dashboard/medico',
  paciente: '/dashboard/paciente',
};

export default function ProtectedRoute({ requiredRoles = [] }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  // ── Mientras resuelve la sesión inicial, muestra un loader clínico ──
  if (loading) return <AuthLoader />;

  // ── Sin sesión → /login con estado "from" para volver tras login ──
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // ── Con sesión pero sin el rol requerido → redirige al dashboard propio ──
  if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
    const fallback = ROLE_FALLBACK[role] ?? '/';
    return <Navigate to={fallback} replace />;
  }

  // ── Acceso concedido → renderiza la ruta hija ──
  return <Outlet />;
}

// Loader mínimo en pantalla completa mientras carga la sesión.
// Usa la paleta clínica oscura para que no haya "flash" de blanco.
function AuthLoader() {
  return (
    <div
      role="status"
      aria-label="Verificando sesión"
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-clinical-900"
    >
      {/* Anillo de carga púrpura */}
      <svg
        className="h-10 w-10 animate-spin text-electric-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <circle
          className="opacity-20"
          cx="12" cy="12" r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-80"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <p className="text-sm font-medium text-clinical-400">Verificando sesión…</p>
    </div>
  );
}
