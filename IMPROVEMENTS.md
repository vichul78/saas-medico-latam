# MEJORAS PENDIENTES — saas-medico-latam

## Prioridad 1 (CRÍTICO)

### 1. ❌ Autenticación Broken — Usuarios sin registro en tabla `usuarios`

**Estado:** BLOCKER para todo testing/desarrollo
**Archivo:** TESTING.md (ver detalles completos)
**Solución:** Crear registros en `usuarios` desde auth.users existentes vía SQL

```sql
-- VER USUARIOS EN auth.users
SELECT id, email FROM auth.users WHERE email IN ('admin@demo.com', 'paciente@demo.com');

-- INSERT en usuarios (reemplazar UUIDs)
INSERT INTO usuarios (id, clinica_id, rol, nombre, apellido, email)
VALUES 
  ('UUID-HERE', (SELECT id FROM clinicas WHERE slug='demo-mx'), 'admin_clinica', 'Admin', 'Clínica', 'admin@demo.com')
ON CONFLICT (id) DO NOTHING;
```

**Tiempo:** 5 minutos
**Responsable:** Manual (no automatizable sin riesgo)

---

### 2. ⚠️ RLS Policy en `share_tokens` NO EXISTE

**Problema:** Tabla `share_tokens` existe (usada por Edge Function) pero sin políticas RLS
**Riesgo:** Acceso público a todos los tokens de compartición
**Solución:** Agregar políticas en schema.sql

```sql
ALTER TABLE share_tokens ENABLE ROW LEVEL SECURITY;

-- Qualquier usuario autenticado puede ver tokens que creó
CREATE POLICY share_tokens_create ON share_tokens
  FOR INSERT 
  WITH CHECK (
    clinica_id = clinica_actual() 
    AND created_by = auth.uid()
  );

-- Pacientes pueden ver tokens válidos para sus informes (público, sin RLS)
-- (No se puede restringir porque URL es pública)
```

**Archivo:** supabase/schema.sql
**Tiempo:** 10 minutos

---

### 3. 🔐 Secrets Twilio en `.env` EXPONEN CREDENCIALES

**Problema:** Archivo `twilioWhatsapp.js` tiene advertencia de seguridad
**Riesgo:** Si alguien habilita el import, credenciales quedan en bundle del cliente
**Solución:** Eliminar archivo antes de producción

```bash
rm src/lib/twilioWhatsapp.js
# Verif que no esté importado en ningún lado:
grep -r "twilioWhatsapp" src/
```

**Archivo:** src/lib/twilioWhatsapp.js
**Tiempo:** 2 minutos

---

## Prioridad 2 (IMPORTANTE)

### 4. 📊 Dashboard KPIs — Citas y Facturas CERO

**Problema:** Seed de citas/facturas fue creado pero no validado en UI
**Solución:** Verificar que `useDashboardMetrics` esté leyendo correctamente

**Query a verificar:**
```javascript
// src/hooks/useDashboardMetrics.js
const { data: citas } = await supabase
  .from('citas')
  .select('count', { count: 'exact' })
  .eq('clinica_id', clinicaId)
  .gte('fecha', primeroDelMes)
  .lte('fecha', hoyUTC);
```

**Si sigue cero:** Verificar que seed_demo.sql fue ejecutado ✓

**Tiempo:** 15 minutos (debugging)

---

### 5. 🔍 Búsqueda — `useEstudios` y `useInformes` No Testeados

**Problema:** Fixes de PostgREST implementados pero sin testing visual
**Status:** ✅ Código está correcto, solo falta testing
**Testing Manual:**
1. Login admin
2. Ir a Estudios
3. Buscar por nombre de paciente (ej: "Carlos")
4. Verificar que se filtra correctamente
5. Repetir en Informes

**Archivos:**
- src/hooks/useEstudios.js
- src/hooks/useInformes.js

**Tiempo:** 20 minutos

---

### 6. 📱 WhatsApp Modal — Edge Function No Testeada

**Problema:** `send-whatsapp` deployada pero sin testing end-to-end
**Status:** ✅ Código está correcto, setup Twilio completo, solo falta testing
**Testing Manual:**
1. Login admin
2. Ir a Informes
3. Click "Compartir vía WhatsApp"
4. Llenar formulario (teléfono, nombre, resumen)
5. Click "Enviar"
6. Verificar:
   - Share token generado ✓
   - WhatsApp enviado ✓
   - Link válido por 24h ✓

**Archivos:**
- supabase/functions/send-whatsapp/index.ts
- src/hooks/useShareInforme.js
- src/components/WhatsAppShareModal.jsx

**Tiempo:** 30 minutos

---

## Prioridad 3 (NICE-TO-HAVE)

### 7. 🔄 Migrations NO EXISTEN

**Problema:** Schema es monolítico (schema.sql) sin versionamiento de migrations
**Impacto:** Difícil trackear cambios, rollbacks imposibles
**Solución:** Crear estructura de migrations con Supabase CLI

```bash
mkdir supabase/migrations
# Convertir schema.sql en una migration numerada
mv supabase/schema.sql supabase/migrations/001_initial_schema.sql
# Nuevos cambios: supabase migrations new --name <desc>
```

**Tiempo:** 30 minutos
**Beneficio:** Control de versiones de DB

---

### 8. 📋 Seed Data — Sistema mejorado

**Problema:** seed_demo.sql es manual, no se ejecuta automáticamente
**Mejora:** Integrar con `supabase seed` command

```bash
# Crear seed.sql en directorio estándar
mv supabase/seed_demo.sql supabase/seed.sql
# Después: supabase db seed
```

**Tiempo:** 10 minutos

---

### 9. 🚀 CI/CD — No hay pipeline

**Problema:** No hay tests ni deployment automático
**Impacto:** Cambios pueden romperse sin saberlo
**Solución:** Agregar GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm test
```

**Tiempo:** 1 hora
**Prioridad:** Después de estabilizar beta

---

### 10. 📖 Documentación — Falta README completo

**Problema:** No hay setup guide ni architecture docs
**Archivos a crear:**
- README.md (setup, deploy, envs)
- docs/ARCHITECTURE.md (flujos, DB schema diagram)
- docs/API.md (Edge Functions, endpoints)
- docs/DEVELOPMENT.md (local dev setup)

**Tiempo:** 2 horas

---

## Checklist de Deployments Actuales

### ✅ Completado

- [x] Schema SQL en Supabase
- [x] Seed datos demo (citas, facturas, pacientes)
- [x] Edge Function `send-whatsapp` deployada
- [x] Secrets Twilio configurados
- [x] Fixes de búsqueda (PostgREST) implementados
- [x] GitHub repo pusheado

### ⚠️ Pendiente

- [ ] Crear usuarios en tabla `usuarios` (fix #1)
- [ ] Agregar RLS a `share_tokens` (fix #2)
- [ ] Eliminar `twilioWhatsapp.js` (fix #3)
- [ ] Validar KPIs dashboard (fix #4)
- [ ] Testing búsquedas (fix #5)
- [ ] Testing WhatsApp E2E (fix #6)

---

## Timeline Estimado

| Prioridad | Horas | Responsable |
|-----------|-------|-------------|
| 1 (Crítico) | 0.5 | Victor |
| 2 (Importante) | 2 | Victor + tester |
| 3 (Nice-to-have) | 4 | Siguientes sprints |

**Total para MVP:** 2.5 horas

---

## Comandos Útiles para Testing

```bash
# Reinicar dev server
npm run dev

# Ver logs de Edge Function
supabase functions list
supabase functions download send-whatsapp

# Ver últimas queries en SQL
-- En SQL Editor: SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 20;

# Verificar seed fue ejecutado
SELECT COUNT(*) FROM citas;
SELECT COUNT(*) FROM facturas;
```

---

## Próximos Pasos (Después de MVP)

1. **Beta testing** con clínicas reales
2. **Perfil de usuario** — avatar, notificaciones
3. **Reportes avanzados** — gráficos, exportar PDF
4. **Integraciones** — HIS, PACS, HL7
5. **Mobile app** — React Native / Expo
6. **Internacionalización** — PT-BR, EN
