import { createClient } from '@supabase/supabase-js';

/*
  Cliente Supabase singleton para el frontend.
  Las claves se leen desde variables de entorno Vite (VITE_*).
  El esquema esperado en la base de datos vive en /supabase/schema.sql.
*/

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  // No lanzamos error en build; sólo advertencia en runtime para no romper SSR/preview.
  // eslint-disable-next-line no-console
  console.warn(
    '[supabaseClient] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Copia .env.example a .env y completa los valores.'
  );
}

export const supabase = createClient(url ?? 'http://localhost', anon ?? 'public-anon-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
