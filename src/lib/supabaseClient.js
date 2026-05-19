import { createClient } from '@supabase/supabase-js';

/*
  Cliente Supabase singleton + helpers de autenticación.
  Flujo:
    1. signIn(email, password)  → signInWithPassword
    2. signOut()                → cierra sesión y limpia storage
    3. getProfile(userId)       → lee tabla `profiles` y devuelve rol + datos
    4. onAuthChange(cb)         → suscripción reactiva a cambios de sesión
*/

const url  = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  // Solo advertencia en dev; no rompe build ni preview.
  // eslint-disable-next-line no-console
  console.warn(
    '[supabaseClient] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.\n' +
    'Copia .env.example → .env y completa los valores.'
  );
}

export const supabase = createClient(
  url  ?? 'http://localhost',
  anon ?? 'public-anon-key',
  {
    auth: {
      persistSession:     true,
      autoRefreshToken:   true,
      detectSessionInUrl: true,
    },
  }
);

// ─────────────────────────────────────────────
// AUTH HELPERS
// ─────────────────────────────────────────────

/**
 * Inicia sesión con correo y contraseña.
 * @returns {{ data, error }}
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email:    email.trim().toLowerCase(),
    password,
  });
  return { data, error };
}

/**
 * Cierra la sesión activa.
 * Log híbrido: si Supabase devuelve error, se registra el objeto original EN
 * en consola; el caller recibe el error crudo para decidir qué mostrar en UI.
 * @returns {{ error }}
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    // eslint-disable-next-line no-console
    console.error(
      '[supabaseClient] signOut — Supabase error (original EN):',
      { code: error.code, message: error.message, status: error.status },
    );
  }
  return { error };
}

/**
 * Recupera el perfil completo del usuario desde la tabla `profiles`.
 * Incluye: rol, nombre, organización, idioma, avatar.
 * @param {string} userId  — auth.users.id (UUID)
 * @returns {{ profile: object|null, error }}
 */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      role,
      first_name,
      last_name,
      display_name,
      email,
      phone,
      avatar_url,
      preferred_lang,
      is_active,
      organization_id,
      organizations (
        id,
        name,
        slug,
        country_code,
        currency,
        locale,
        timezone,
        logo_url,
        plan
      )
    `)
    .eq('id', userId)
    .single();

  return { profile: data ?? null, error };
}

/**
 * Suscripción reactiva a cambios de sesión (login / logout / token refresh).
 * Devuelve la función de cancelación (unsubscribe).
 * @param {(event: string, session: object|null) => void} callback
 */
export function onAuthChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}

/**
 * Devuelve la sesión activa sin suscribirse.
 * Log híbrido: registra error original EN si falla; el caller decide qué mostrar.
 * @returns {{ session: object|null, error }}
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    // eslint-disable-next-line no-console
    console.error(
      '[supabaseClient] getSession — Supabase error (original EN):',
      { code: error.code, message: error.message, status: error.status },
    );
  }
  return { session, error };
}
