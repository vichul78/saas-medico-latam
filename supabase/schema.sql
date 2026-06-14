-- ============================================================
--  MediCo LatAm — Supabase Schema (modelo en español)
--  Versión: 1.0.0
--
--  Tablas:  clinicas · usuarios · pacientes · estudios · informes
--  Multi-tenancy: Row-Level Security por `clinica_id` en TODAS las tablas.
--
--  ✅  SCHEMA CANÓNICO de la plataforma (Opción A).
--  ------------------------------------------------------------
--  Reemplaza al antiguo modelo en inglés (organizations/profiles/…).
--  El frontend lee estas tablas a través de un adaptador en
--  `supabaseClient.getProfile()` que mapea usuarios+clinicas a la forma
--  que consumen los componentes (role / first_name / organizations…).
--
--  Ejecuta este archivo COMPLETO en el SQL Editor de Supabase sobre una
--  base limpia. El trigger `handle_new_usuario` auto-crea la fila en
--  `usuarios` al registrarse (signUp).
-- ============================================================

-- ─────────────────────────────────────────────
-- 0. EXTENSIONES
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- 1. TIPOS ENUMERADOS
--    Rol de usuario, alineado con el resto de la plataforma.
-- ─────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin_clinica', 'medico', 'paciente');
  END IF;
END$$;

-- Estado de un estudio de imagen
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estudio_estado') THEN
    CREATE TYPE estudio_estado AS ENUM (
      'recibido', 'pendiente_lectura', 'en_lectura', 'informado', 'entregado', 'cancelado'
    );
  END IF;
END$$;

-- Estado de un informe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'informe_estado') THEN
    CREATE TYPE informe_estado AS ENUM ('borrador', 'firmado', 'rectificado');
  END IF;
END$$;

-- ─────────────────────────────────────────────
-- 2. FUNCIÓN AUXILIAR: updated_at automático
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────
-- 3. CLINICAS  (raíz del tenant)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clinicas (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre       TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,            -- subdominio / URL amigable
  pais         CHAR(2) NOT NULL DEFAULT 'MX',   -- ISO 3166-1 alpha-2
  moneda       CHAR(3) NOT NULL DEFAULT 'MXN',  -- ISO 4217
  locale       TEXT NOT NULL DEFAULT 'es-MX',
  zona_horaria TEXT NOT NULL DEFAULT 'America/Mexico_City',
  logo_url     TEXT,
  plan         TEXT NOT NULL DEFAULT 'starter', -- starter | professional | enterprise
  activa       BOOLEAN NOT NULL DEFAULT TRUE,
  metadata     JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_clinicas_updated_at
  BEFORE UPDATE ON clinicas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────
-- 4. USUARIOS  (extiende auth.users; portador del rol y del clinica_id)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinica_id  UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  rol         user_role NOT NULL DEFAULT 'paciente',
  nombre      TEXT NOT NULL,
  apellido    TEXT NOT NULL,
  email       TEXT NOT NULL,
  telefono    TEXT,
  avatar_url  TEXT,
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_clinica ON usuarios(clinica_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol     ON usuarios(rol);

CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────
-- 5. PACIENTES
--    `usuario_id` es opcional: un paciente puede tener cuenta (portal)
--    o ser sólo un registro demográfico gestionado por la clínica.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pacientes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id      UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  usuario_id      UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  nombre          TEXT NOT NULL,
  apellido        TEXT NOT NULL,
  fecha_nacimiento DATE,
  sexo            CHAR(1) CHECK (sexo IN ('M','F','O')),
  documento       TEXT,                 -- CURP, DNI, CPF, RUT, cédula…
  documento_tipo  TEXT,                 -- curp | dni | cpf | rut | cedula | otro
  telefono        TEXT,
  email           TEXT,
  direccion       TEXT,
  ciudad          TEXT,
  alergias        TEXT[],
  notas           TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pacientes_clinica ON pacientes(clinica_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_usuario ON pacientes(usuario_id);

CREATE TRIGGER trg_pacientes_updated_at
  BEFORE UPDATE ON pacientes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────
-- 6. ESTUDIOS  (imágenes / pruebas asociadas a un paciente)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS estudios (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id        UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id       UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  medico_id         UUID REFERENCES usuarios(id) ON DELETE SET NULL,   -- radiólogo asignado
  tipo              TEXT NOT NULL,                 -- CT | MR | DX | US | ECG | ecografía …
  fecha             DATE NOT NULL DEFAULT CURRENT_DATE,
  archivo_dicom_url TEXT,                          -- URL del DICOM en Supabase Storage
  estado            estudio_estado NOT NULL DEFAULT 'recibido',
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_estudios_clinica  ON estudios(clinica_id);
CREATE INDEX IF NOT EXISTS idx_estudios_paciente ON estudios(paciente_id);
CREATE INDEX IF NOT EXISTS idx_estudios_estado   ON estudios(estado);
CREATE INDEX IF NOT EXISTS idx_estudios_fecha    ON estudios(fecha DESC);

CREATE TRIGGER trg_estudios_updated_at
  BEFORE UPDATE ON estudios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────
-- 7. INFORMES  (reporte clínico de un estudio; puede ser generado por IA)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS informes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id      UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  estudio_id      UUID NOT NULL REFERENCES estudios(id) ON DELETE CASCADE,
  medico_id       UUID REFERENCES usuarios(id) ON DELETE SET NULL,   -- autor / responsable
  texto           TEXT,                              -- cuerpo del informe
  estado          informe_estado NOT NULL DEFAULT 'borrador',
  generado_por_ia BOOLEAN NOT NULL DEFAULT FALSE,    -- ¿lo generó el copiloto IA?
  firmado_at      TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_informes_clinica ON informes(clinica_id);
CREATE INDEX IF NOT EXISTS idx_informes_estudio ON informes(estudio_id);
CREATE INDEX IF NOT EXISTS idx_informes_estado  ON informes(estado);

CREATE TRIGGER trg_informes_updated_at
  BEFORE UPDATE ON informes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═════════════════════════════════════════════
-- 8. ROW-LEVEL SECURITY  (multi-tenancy por clinica_id)
-- ═════════════════════════════════════════════

ALTER TABLE clinicas  ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudios  ENABLE ROW LEVEL SECURITY;
ALTER TABLE informes  ENABLE ROW LEVEL SECURITY;

-- ── Helpers: clínica y rol del usuario autenticado ─────────────────────────
-- SECURITY DEFINER + STABLE: leen `usuarios` sin recursión de políticas.
CREATE OR REPLACE FUNCTION clinica_actual()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT clinica_id FROM usuarios WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION rol_actual()
RETURNS user_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT rol FROM usuarios WHERE id = auth.uid() LIMIT 1;
$$;

-- ── clinicas: cada quien ve SOLO su clínica; admin_clinica la administra ────
DROP POLICY IF EXISTS clinicas_select ON clinicas;
CREATE POLICY clinicas_select ON clinicas
  FOR SELECT USING (id = clinica_actual());

DROP POLICY IF EXISTS clinicas_admin_all ON clinicas;
CREATE POLICY clinicas_admin_all ON clinicas
  FOR ALL
  USING (id = clinica_actual() AND rol_actual() = 'admin_clinica')
  WITH CHECK (id = clinica_actual() AND rol_actual() = 'admin_clinica');

-- ── usuarios: ve su propia fila o los de su misma clínica; admin gestiona ───
DROP POLICY IF EXISTS usuarios_select ON usuarios;
CREATE POLICY usuarios_select ON usuarios
  FOR SELECT USING (id = auth.uid() OR clinica_id = clinica_actual());

DROP POLICY IF EXISTS usuarios_self_insert ON usuarios;
CREATE POLICY usuarios_self_insert ON usuarios
  FOR INSERT WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS usuarios_self_update ON usuarios;
CREATE POLICY usuarios_self_update ON usuarios
  FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS usuarios_admin_all ON usuarios;
CREATE POLICY usuarios_admin_all ON usuarios
  FOR ALL
  USING (clinica_id = clinica_actual() AND rol_actual() = 'admin_clinica')
  WITH CHECK (clinica_id = clinica_actual() AND rol_actual() = 'admin_clinica');

-- ── pacientes: aislados por clínica ─────────────────────────────────────────
-- Personal clínico (admin/médico) ve y gestiona todos los de su clínica.
DROP POLICY IF EXISTS pacientes_staff_all ON pacientes;
CREATE POLICY pacientes_staff_all ON pacientes
  FOR ALL
  USING (
    clinica_id = clinica_actual()
    AND rol_actual() IN ('admin_clinica', 'medico')
  )
  WITH CHECK (
    clinica_id = clinica_actual()
    AND rol_actual() IN ('admin_clinica', 'medico')
  );

-- El paciente con cuenta ve únicamente su propio registro.
DROP POLICY IF EXISTS pacientes_propio ON pacientes;
CREATE POLICY pacientes_propio ON pacientes
  FOR SELECT USING (usuario_id = auth.uid());

-- ── estudios: aislados por clínica ─────────────────────────────────────────
DROP POLICY IF EXISTS estudios_staff_all ON estudios;
CREATE POLICY estudios_staff_all ON estudios
  FOR ALL
  USING (
    clinica_id = clinica_actual()
    AND rol_actual() IN ('admin_clinica', 'medico')
  )
  WITH CHECK (
    clinica_id = clinica_actual()
    AND rol_actual() IN ('admin_clinica', 'medico')
  );

-- El paciente ve los estudios ligados a su registro de paciente.
DROP POLICY IF EXISTS estudios_paciente_select ON estudios;
CREATE POLICY estudios_paciente_select ON estudios
  FOR SELECT USING (
    paciente_id IN (SELECT id FROM pacientes WHERE usuario_id = auth.uid())
  );

-- ── informes: aislados por clínica ─────────────────────────────────────────
DROP POLICY IF EXISTS informes_staff_all ON informes;
CREATE POLICY informes_staff_all ON informes
  FOR ALL
  USING (
    clinica_id = clinica_actual()
    AND rol_actual() IN ('admin_clinica', 'medico')
  )
  WITH CHECK (
    clinica_id = clinica_actual()
    AND rol_actual() IN ('admin_clinica', 'medico')
  );

-- El paciente sólo ve informes FIRMADOS de sus propios estudios.
DROP POLICY IF EXISTS informes_paciente_select ON informes;
CREATE POLICY informes_paciente_select ON informes
  FOR SELECT USING (
    estado = 'firmado'
    AND estudio_id IN (
      SELECT e.id FROM estudios e
      JOIN pacientes p ON p.id = e.paciente_id
      WHERE p.usuario_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- 9. AUTO-APROVISIONAMIENTO DE USUARIO AL REGISTRARSE
--    Al crear una fila en auth.users (signUp), se crea la fila en `usuarios`
--    leyendo raw_user_meta_data: { nombre, apellido, rol, clinica_slug }.
--
--    SECURITY DEFINER permite que el INSERT ignore RLS durante el alta.
--
--    ⚠️  NOTA DE SEGURIDAD: permitir que el usuario elija su propio rol en el
--        alta es cómodo para demos, pero en PRODUCCIÓN el rol 'admin_clinica'
--        (y normalmente 'medico') debería ser asignado por un administrador
--        existente, no auto-servido. Para endurecer: fuerza v_rol := 'paciente'
--        aquí y promueve roles desde el panel de administración.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_rol     user_role;
  v_clinica UUID;
  v_nombre  TEXT;
  v_apellido TEXT;
BEGIN
  BEGIN
    v_rol := (NEW.raw_user_meta_data ->> 'rol')::user_role;
  EXCEPTION WHEN others THEN
    v_rol := 'paciente';
  END;
  IF v_rol IS NULL THEN v_rol := 'paciente'; END IF;

  SELECT id INTO v_clinica
  FROM clinicas
  WHERE slug = (NEW.raw_user_meta_data ->> 'clinica_slug')
  LIMIT 1;

  IF v_clinica IS NULL THEN
    SELECT id INTO v_clinica FROM clinicas WHERE activa = TRUE ORDER BY created_at LIMIT 1;
  END IF;

  v_nombre   := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data ->> 'nombre'), ''), 'Usuario');
  v_apellido := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data ->> 'apellido'), ''), split_part(NEW.email, '@', 1));

  IF v_clinica IS NOT NULL THEN
    INSERT INTO public.usuarios (id, clinica_id, rol, nombre, apellido, email)
    VALUES (NEW.id, v_clinica, v_rol, v_nombre, v_apellido, NEW.email)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger activo: este es el schema canónico de la plataforma.
DROP TRIGGER IF EXISTS on_auth_user_created_usuario ON auth.users;
CREATE TRIGGER on_auth_user_created_usuario
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_usuario();

-- ─────────────────────────────────────────────
-- 7.5. SHARE_TOKENS (compartir informes via WhatsApp / link temporal)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS share_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id  UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  informe_id  UUID NOT NULL REFERENCES informes(id) ON DELETE CASCADE,
  token       TEXT UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_by  UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  accessed_at TIMESTAMPTZ,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_share_tokens_token ON share_tokens(token);

ALTER TABLE share_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS share_tokens_staff ON share_tokens;
CREATE POLICY share_tokens_staff ON share_tokens
  FOR ALL
  USING (
    clinica_id = clinica_actual()
    AND rol_actual() IN ('admin_clinica', 'medico')
  )
  WITH CHECK (
    clinica_id = clinica_actual()
    AND rol_actual() IN ('admin_clinica', 'medico')
  );

-- ── Funcion publica para consultar un informe compartido via token ──────────
CREATE OR REPLACE FUNCTION get_shared_informe(p_token TEXT)
RETURNS TABLE (
  informe_texto     TEXT,
  informe_estado    informe_estado,
  estudio_tipo      TEXT,
  estudio_fecha     DATE,
  paciente_nombre   TEXT,
  paciente_apellido TEXT,
  clinica_nombre    TEXT,
  expires_at        TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_share share_tokens%ROWTYPE;
BEGIN
  SELECT * INTO v_share
  FROM share_tokens st
  WHERE st.token = p_token
    AND st.expires_at > NOW()
  LIMIT 1;

  IF v_share.id IS NULL THEN
    RETURN;
  END IF;

  UPDATE share_tokens SET accessed_at = NOW() WHERE id = v_share.id;

  RETURN QUERY
  SELECT
    i.texto          AS informe_texto,
    i.estado         AS informe_estado,
    e.tipo           AS estudio_tipo,
    e.fecha          AS estudio_fecha,
    p.nombre         AS paciente_nombre,
    p.apellido       AS paciente_apellido,
    c.nombre         AS clinica_nombre,
    v_share.expires_at AS expires_at
  FROM informes i
  JOIN estudios e ON e.id = i.estudio_id
  JOIN pacientes p ON p.id = e.paciente_id
  JOIN clinicas c ON c.id = i.clinica_id
  WHERE i.id = v_share.informe_id;
END;
$$;

-- ─────────────────────────────────────────────
-- 10. SEED MÍNIMO (desarrollo)
-- ─────────────────────────────────────────────
INSERT INTO clinicas (nombre, slug, pais, moneda, locale, zona_horaria, plan)
VALUES
  ('Clínica Demo MX', 'demo-mx', 'MX', 'MXN', 'es-MX', 'America/Mexico_City', 'professional'),
  ('Clínica Demo CO', 'demo-co', 'CO', 'COP', 'es-CO', 'America/Bogota',      'starter')
ON CONFLICT (slug) DO NOTHING;

-- FIN DEL SCHEMA

-- ─────────────────────────────────────────────
-- 11. CITAS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS citas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id  UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE SET NULL,
  medico_id   UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha       DATE NOT NULL,
  hora        TIME,
  estado      TEXT NOT NULL DEFAULT 'pendiente'
              CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada', 'no_asistio')),
  tipo        TEXT,
  notas       TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_citas_clinica_fecha   ON citas(clinica_id, fecha);
CREATE INDEX IF NOT EXISTS idx_citas_paciente        ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_medico          ON citas(medico_id);

ALTER TABLE citas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS citas_staff ON citas;
CREATE POLICY citas_staff ON citas
  FOR ALL
  USING (clinica_id = clinica_actual())
  WITH CHECK (clinica_id = clinica_actual());

-- ─────────────────────────────────────────────
-- 12. FACTURAS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS facturas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id  UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE SET NULL,
  monto       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  moneda      TEXT NOT NULL DEFAULT 'USD',
  estado      TEXT NOT NULL DEFAULT 'pendiente'
              CHECK (estado IN ('pendiente', 'pagada', 'vencida', 'anulada')),
  concepto    TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_facturas_clinica_estado ON facturas(clinica_id, estado);
CREATE INDEX IF NOT EXISTS idx_facturas_paciente       ON facturas(paciente_id);

ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS facturas_staff ON facturas;
CREATE POLICY facturas_staff ON facturas
  FOR ALL
  USING (
    clinica_id = clinica_actual()
    AND rol_actual() IN ('admin_clinica', 'medico')
  )
  WITH CHECK (
    clinica_id = clinica_actual()
    AND rol_actual() IN ('admin_clinica', 'medico')
  );

-- ─────────────────────────────────────────────
-- 13. AUDIT LOGS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id  UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  usuario_id  UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  accion      TEXT NOT NULL,           -- ej: 'crear', 'editar', 'firmar', 'enviar_whatsapp'
  tabla       TEXT NOT NULL,           -- ej: 'informes', 'estudios'
  registro_id UUID,                    -- ID del registro afectado
  cambios     JSONB,                   -- diff opcional { antes, despues }
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_clinica      ON audit_logs(clinica_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_usuario      ON audit_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_tabla_reg    ON audit_logs(tabla, registro_id);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Solo admin puede leer audit logs
DROP POLICY IF EXISTS audit_logs_admin_read ON audit_logs;
CREATE POLICY audit_logs_admin_read ON audit_logs
  FOR SELECT
  USING (
    clinica_id = clinica_actual()
    AND rol_actual() = 'admin_clinica'
  );

-- Staff puede insertar (insert-only, no update/delete)
DROP POLICY IF EXISTS audit_logs_insert ON audit_logs;
CREATE POLICY audit_logs_insert ON audit_logs
  FOR INSERT
  WITH CHECK (
    clinica_id = clinica_actual()
    AND rol_actual() IN ('admin_clinica', 'medico')
  );

