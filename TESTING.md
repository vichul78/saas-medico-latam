# TESTING REPORT — saas-medico-latam

## Resumen Ejecutivo

**Status:** ⚠️ BLOQUEADO — Problema crítico de autenticación

### Problema Raíz

Los usuarios demo (`admin@demo.com`, `paciente@demo.com`) **existen en `auth.users` de Supabase pero NO en la tabla `usuarios`**.

#### ¿Por qué pasó?
1. Los usuarios fueron creados via SQL directo: `INSERT INTO usuarios...`
2. Nunca fueron creados via `signUp()` de Supabase Auth
3. El trigger `handle_new_usuario` **solo** crea registros en `usuarios` cuando se autentica alguien en `auth.users`
4. El flow correcto es: usuario se registra → Supabase crea en `auth.users` → trigger crea en `usuarios`

#### ¿Por qué el login falla?
1. Login intenta: `signIn(email, password)`
2. Supabase valida email/pass contra `auth.users` ✅
3. Se genera JWT y se envía al cliente
4. El app intenta buscar usuario en tabla `usuarios` para obtener `clinica_id` y `rol`
5. No lo encuentra → error silencioso → botón se queda en `disabled`

---

## Testing Results

### ❌ BLOCKER: Autenticación No Funciona

**Síntomas:**
- Landing page carga ✅
- Página login accesible ✅
- Formulario acepta datos ✅
- Botón "Entrar al sistema" se queda `disabled` ❌
- No hay error visible en UI ❌

**Root Cause:**
```
Flujo fallido:
auth.users (existe)  ←→  usuarios table (NO EXISTE EL REGISTRO)
                              ↓
                        signIn() → Error silencioso
```

**Intentos fallidos:**
- ✅ Intenté crear usuarios via `supabase.auth.admin.createUser()` → Error "Database error creating new user"
  (Probablemente porque ya existen en auth.users)

---

## Solución Requerida (MANUAL)

### Opción 1: Crear registros en `usuarios` via SQL (RECOMENDADO)

Ve a **Supabase → SQL Editor** y ejecuta:

```sql
-- OBTENER IDS DE USUARIOS YA CREADOS EN AUTH.USERS
-- Luego insertar en tabla usuarios
SELECT id, email FROM auth.users WHERE email IN ('admin@demo.com', 'paciente@demo.com');

-- Copiar los UUIDs y ejecutar:
INSERT INTO usuarios (id, clinica_id, rol, nombre, apellido, email)
VALUES 
  ('UUID-DEL-ADMIN', (SELECT id FROM clinicas WHERE slug = 'demo-mx'), 'admin_clinica', 'Admin', 'Clínica', 'admin@demo.com'),
  ('UUID-DEL-PACIENTE', (SELECT id FROM clinicas WHERE slug = 'demo-mx'), 'paciente', 'Carlos', 'González', 'paciente@demo.com')
ON CONFLICT (id) DO NOTHING;
```

### Opción 2: Crear usuarios nuevos desde el formulario "¿Sin cuenta?"

Usa el formulario de registro (`/register`) para crear usuarios correctamente:
1. Signup creará en `auth.users`
2. Trigger automáticamente creará en `usuarios`
3. Login funcionará

---

## Testing Pendiente (bloqueado por el fix de autenticación)

- [ ] Login exitoso con admin@demo.com
- [ ] Dashboard y KPIs visibles
- [ ] Búsqueda de estudios (test del fix PostgREST)
- [ ] Búsqueda de informes (test del fix PostgREST)
- [ ] Modal WhatsApp (test Edge Function send-whatsapp)
- [ ] Envío WhatsApp efectivo
- [ ] Portal pacientes (resultado/)
- [ ] Audit logs

---

## Notas Técnicas

**Flow correcto de creación de usuarios:**
```
User clicks "Crear cuenta" → signUp(email, password)
  ↓
Supabase crea en auth.users
  ↓
INSERT trigger activado: handle_new_usuario
  ↓
Trigger crea en tabla usuarios con clinica_id lookup via clinica_slug
  ↓
signIn() funciona → JWT válido → usuario en sesión → rol/clinica disponible
```

**Flow que pasó (INCORRECTO):**
```
Admin ejecuta: INSERT INTO usuarios... (manual via SQL)
  ↓
auth.users vacía, no hay JWT, no hay sesión
  ↓
signIn() busca en usuarios → no existe → error
```

---

## Commits Listos para Testing

1. ✅ `f680482` — fix(search): useEstudios/useInformes 
2. ✅ `4513a35` — feat(seed): demo citas/facturas
3. ✅ `fdf9bd6` — Merge #23 (dashboard/register)

---

## Action Items

**BLOQUEANTE (antes de continuar testing):**
1. [ ] Ejecutar SQL para crear registros en `usuarios` desde auth.users existentes
   O
2. [ ] Crear usuarios nuevos via formulario `/register`

**Después del fix:**
3. [ ] Reintento login con admin@demo.com
4. [ ] Test dashboard y KPIs
5. [ ] Test búsquedas (PostgREST fix)
6. [ ] Test WhatsApp (Edge Function)

