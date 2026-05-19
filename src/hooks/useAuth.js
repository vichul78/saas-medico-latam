import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext.jsx';

/*
  Hook de acceso al contexto de autenticación.

  Uso:
    const { session, profile, role, loading, signOut } = useAuth();

  Propiedades expuestas:
    session         — objeto Supabase Session | null
    profile         — fila de `profiles` con join a `organizations` | null
    role            — 'admin' | 'medico' | 'paciente' | null
    organization    — datos de la org del usuario | null
    loading         — true mientras resuelve sesión/perfil inicial
    isAuthenticated — shorthand: !!session
    signOut()       — cierra sesión
    refreshProfile()— recarga el perfil desde Supabase
*/
export function useAuth() {
  const ctx = useContext(AuthContext);

  if (ctx === null) {
    throw new Error(
      '[useAuth] debe usarse dentro de <AuthProvider>. ' +
      'Asegúrate de envolver la app en <AuthProvider> en main.jsx.'
    );
  }

  return ctx;
}
