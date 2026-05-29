import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getProfile,
  getSession,
  onAuthChange,
  signOut as sbSignOut,
  signUp as sbSignUp,
} from '@/lib/supabaseClient.js';

/*
  AuthContext — fuente de verdad global para sesión y perfil de usuario.

  Expone:
    session     : objeto Supabase Session | null
    profile     : fila de la tabla `profiles` (incluye `role`) | null
    loading     : true mientras resuelve la sesión inicial
    signOut()   : cierra sesión y limpia estado
    refreshProfile() : recarga el perfil desde Supabase (útil tras actualizar datos)

  Roles posibles (espejo del ENUM en schema.sql):
    'admin_clinica' | 'medico' | 'paciente'
*/

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession]   = useState(null);
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);   // cargando sesión inicial
  const [profLoading, setProfLoading] = useState(false);

  // Evita doble fetch si onAuthStateChange y getSession disparan al mismo tiempo.
  const fetchingRef = useRef(false);

  // ── Carga el perfil desde Supabase ──────────────────────────────────────
  const loadProfile = useCallback(async (userId) => {
    if (!userId || fetchingRef.current) return;
    fetchingRef.current = true;
    setProfLoading(true);
    try {
      const { profile: p, error } = await getProfile(userId);
      if (error) {
        /*
          Estrategia híbrida de logging:
            - console.error registra el error ORIGINAL en inglés (objeto completo
              con code, message, details, hint) para depuración técnica.
            - La UI nunca recibe este mensaje; el flujo simplemente deja profile=null
              y el ProtectedRoute redirige a /login en el siguiente render.
        */
        // eslint-disable-next-line no-console
        console.error(
          '[AuthContext] loadProfile — Supabase error (original EN):',
          { code: error.code, message: error.message, details: error.details, hint: error.hint },
        );
        setProfile(null);
      } else {
        setProfile(p);
      }
    } catch (unexpectedError) {
      // Errores de red u otros fallos no-Supabase: también se loggean en crudo.
      // eslint-disable-next-line no-console
      console.error('[AuthContext] loadProfile — unexpected error:', unexpectedError);
      setProfile(null);
    } finally {
      fetchingRef.current = false;
      setProfLoading(false);
    }
  }, []);

  // ── Sesión inicial (una sola vez al montar) ─────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { session: s } = await getSession();
      if (!cancelled) {
        setSession(s);
        if (s?.user?.id) await loadProfile(s.user.id);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [loadProfile]);

  // ── Suscripción reactiva a cambios de auth ─────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthChange(async (event, s) => {
      setSession(s);

      if (event === 'SIGNED_IN' && s?.user?.id) {
        await loadProfile(s.user.id);
      }

      if (event === 'SIGNED_OUT') {
        setProfile(null);
      }

      // Aseguramos que el spinner inicial se quite si llega un evento tardío.
      setLoading(false);
    });

    return unsubscribe;
  }, [loadProfile]);

  // ── signOut público ────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await sbSignOut();
    setSession(null);
    setProfile(null);
  }, []);

  // ── signUp público ─────────────────────────────────────────────────────
  // Crea el usuario en Supabase Auth; el trigger handle_new_user crea el
  // perfil. Si la confirmación por email está desactivada, onAuthChange
  // disparará SIGNED_IN y cargará el perfil automáticamente.
  const signUp = useCallback((params) => sbSignUp(params), []);

  // ── refreshProfile público ─────────────────────────────────────────────
  const refreshProfile = useCallback(() => {
    if (session?.user?.id) loadProfile(session.user.id);
  }, [session, loadProfile]);

  // ── Valor memoizado para evitar re-renders innecesarios ────────────────
  const value = useMemo(() => ({
    session,
    profile,
    loading: loading || profLoading,
    isAuthenticated: !!session,
    role: profile?.role ?? null,          // 'admin_clinica' | 'medico' | 'paciente' | null
    organization: profile?.organizations ?? null,
    signOut,
    refreshProfile,
  }), [session, profile, loading, profLoading, signOut, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
