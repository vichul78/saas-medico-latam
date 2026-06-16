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

  // Cachea el último userId cuyo perfil ya se cargó para evitar refetch en cada
  // TOKEN_REFRESHED / INITIAL_SESSION duplicado, sin colgar el estado de loading.
  const loadedForRef = useRef(null);

  // ── Carga el perfil desde Supabase ──────────────────────────────────────
  // Devuelve siempre (no lanza). Nunca deja un flag de loading colgado: el
  // control de `loading` vive fuera de esta función, de forma determinista.
  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      loadedForRef.current = null;
      return;
    }
    try {
      const { profile: p, error } = await getProfile(userId);
      if (error) {
        // eslint-disable-next-line no-console
        console.error(
          '[AuthContext] loadProfile — Supabase error (original EN):',
          { code: error?.code, message: error?.message, details: error?.details, hint: error?.hint },
        );
        setProfile(null);
        loadedForRef.current = null;
      } else {
        setProfile(p);
        loadedForRef.current = userId;
      }
    } catch (unexpectedError) {
      // eslint-disable-next-line no-console
      console.error('[AuthContext] loadProfile — unexpected error:', unexpectedError);
      setProfile(null);
      loadedForRef.current = null;
    }
  }, []);

  // ── Sesión inicial (una sola vez al montar) ─────────────────────────────
  // `loading` SIEMPRE se libera en el finally, pase lo que pase con el perfil.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { session: s } = await getSession();
        if (cancelled) return;
        setSession(s);
        if (s?.user?.id) await loadProfile(s.user.id);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[AuthContext] init session — error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [loadProfile]);

  // ── Suscripción reactiva a cambios de auth ─────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthChange(async (event, s) => {
      setSession(s);

      const uid = s?.user?.id ?? null;

      if (event === 'SIGNED_OUT' || !uid) {
        setProfile(null);
        loadedForRef.current = null;
      } else if (
        (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') &&
        loadedForRef.current !== uid
      ) {
        // Solo recargamos si el perfil aún no corresponde a este usuario.
        await loadProfile(uid);
      }

      // El spinner inicial nunca debe quedar colgado por un evento de auth.
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
    loading,
    isAuthenticated: !!session,
    role: profile?.role ?? null,          // 'admin_clinica' | 'medico' | 'paciente' | null
    organization: profile?.organizations ?? null,
    signOut,
    refreshProfile,
  }), [session, profile, loading, signOut, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
