import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.js';

/*
  RoleRedirect — redirige al usuario autenticado a su dashboard propio
  según el rol leído de AuthContext.

  Uso en el router:
    { path: '/dashboard', element: <RoleRedirect /> }

  Si aún está cargando → spinner.
  Si no autenticado   → /login.
  Si tiene rol        → /dashboard/:rol
*/

const ROLE_HOME = {
  admin:    '/dashboard/admin',
  medico:   '/dashboard/medico',
  paciente: '/dashboard/paciente',
};

export default function RoleRedirect() {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-clinical-900">
        <svg
          className="h-8 w-8 animate-spin text-electric-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const destination = ROLE_HOME[role] ?? '/';
  return <Navigate to={destination} replace />;
}
