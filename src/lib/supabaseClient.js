import { createClient } from '@supabase/supabase-js';

/*
  Cliente Supabase singleton + helpers de autenticación.
  Flujo:
    1. signIn(email, password)  → signInWithPassword
    2. signOut()                → cierra sesión y limpia storage
    3. getProfile(userId)       → lee `usuarios` (+join `clinicas`) y normaliza
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
 * Registra un nuevo usuario (email + password) y envía metadata que el trigger
 * `handle_new_user` de la base de datos usa para crear su fila en `profiles`.
 *
 * La metadata viaja en options.data → raw_user_meta_data, en español, porque
 * el trigger `handle_new_usuario` lee:
 *   { nombre, apellido, rol, clinica_slug }
 *
 * @param {Object} params
 * @param {string}  params.email
 * @param {string}  params.password
 * @param {string}  params.firstName        — se mapea a `nombre`
 * @param {string}  params.lastName         — se mapea a `apellido`
 * @param {('admin_clinica'|'medico'|'paciente')} [params.role='paciente']  — se mapea a `rol`
 * @param {string}  [params.organizationSlug]  — slug de la clínica → `clinica_slug`
 * @returns {{ data, error }}
 */
export async function signUp({
  email,
  password,
  firstName = '',
  lastName  = '',
  role      = 'paciente',
  organizationSlug = null,
}) {
  // Las claves de metadata viajan en español porque el trigger de la base de
  // datos `handle_new_usuario` lee { nombre, apellido, rol, clinica_slug }.
  const { data, error } = await supabase.auth.signUp({
    email:    email.trim().toLowerCase(),
    password,
    options: {
      data: {
        nombre:       firstName.trim(),
        apellido:     lastName.trim(),
        rol:          role,
        clinica_slug: organizationSlug,
      },
    },
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error(
      '[supabaseClient] signUp — Supabase error (original EN):',
      { code: error.code, message: error.message, status: error.status },
    );
  }
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
 * Recupera el perfil del usuario desde la tabla `usuarios` (join a `clinicas`)
 * y lo NORMALIZA a la forma que consumen los componentes del frontend
 * (role / first_name / last_name / display_name / organizations{…}).
 *
 * Esta capa adaptadora permite que el modelo de datos esté en español
 * (usuarios/clinicas/rol/clinica_id) sin obligar a renombrar campos en
 * todos los componentes que ya esperaban la forma `profiles`/`organizations`.
 *
 * @param {string} userId  — auth.users.id (UUID)
 * @returns {{ profile: object|null, error }}
 */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      id,
      rol,
      nombre,
      apellido,
      email,
      telefono,
      avatar_url,
      activo,
      metadata,
      clinica_id,
      clinicas (
        id,
        nombre,
        slug,
        pais,
        moneda,
        locale,
        zona_horaria,
        logo_url,
        plan
      )
    `)
    .eq('id', userId)
    .single();

  if (error || !data) {
    return { profile: null, error };
  }

  const c = data.clinicas ?? null;

  // ── Adaptador: usuarios+clinicas → forma legacy `profile` ──
  const profile = {
    id:             data.id,
    role:           data.rol,                                   // 'admin_clinica' | 'medico' | 'paciente'
    first_name:     data.nombre,
    last_name:      data.apellido,
    display_name:   `${data.nombre ?? ''} ${data.apellido ?? ''}`.trim() || 'Usuario',
    email:          data.email,
    phone:          data.telefono,
    avatar_url:     data.avatar_url,
    is_active:      data.activo,
    metadata:       data.metadata ?? {},
    organization_id: data.clinica_id,
    // Los componentes leen `organization` (= profile.organizations) con estos campos:
    organizations: c
      ? {
          id:           c.id,
          name:         c.nombre,
          slug:         c.slug,
          country_code: c.pais,
          currency:     c.moneda,
          locale:       c.locale,
          timezone:     c.zona_horaria,
          logo_url:     c.logo_url,
          plan:         c.plan,
        }
      : null,
  };

  return { profile, error: null };
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
