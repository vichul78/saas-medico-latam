-- ============================================================
--  MediCo LatAm — Supabase Schema
--  Versión: 0.1.0
--  Características:
--    • Multi-tenant (organizations)
--    • Roles separados: admin | medico | paciente
--    • Multi-moneda LatAm (ISO 4217)
--    • Row-Level Security (RLS) en todas las tablas sensibles
--    • Auditoría básica (created_at / updated_at automático)
-- ============================================================

-- ─────────────────────────────────────────────
-- 0. EXTENSIONES
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- 1. TIPOS ENUMERADOS
-- ─────────────────────────────────────────────

-- Rol de usuario dentro de la plataforma
CREATE TYPE user_role AS ENUM ('admin', 'medico', 'paciente');

-- Monedas soportadas en Latinoamérica + USD como fallback
CREATE TYPE latam_currency AS ENUM (
  'MXN', -- Peso mexicano
  'BRL', -- Real brasileño
  'ARS', -- Peso argentino
  'COP', -- Peso colombiano
  'CLP', -- Peso chileno
  'PEN', -- Sol peruano
  'UYU', -- Peso uruguayo
  'BOB', -- Boliviano
  'PYG', -- Guaraní paraguayo
  'VES', -- Bolívar venezolano
  'USD'  -- Dólar (fallback)
);

-- Estado de un estudio/imagen médica
CREATE TYPE study_status AS ENUM (
  'recibido',
  'pendiente_lectura',
  'en_lectura',
  'informado',
  'entregado',
  'cancelado'
);

-- Estado de una cita
CREATE TYPE appointment_status AS ENUM (
  'programada',
  'confirmada',
  'en_curso',
  'completada',
  'cancelada',
  'no_asistio'
);

-- Estado de una factura
CREATE TYPE invoice_status AS ENUM (
  'borrador',
  'emitida',
  'pagada',
  'vencida',
  'cancelada'
);

-- Método de pago
CREATE TYPE payment_method AS ENUM (
  'efectivo',
  'tarjeta_credito',
  'tarjeta_debito',
  'transferencia',
  'cheque',
  'criptomoneda',
  'otro'
);

-- Especialidad clínica (espejo del frontend)
CREATE TYPE clinical_specialty AS ENUM (
  'radiologia',
  'dental',
  'cirugia',
  'cardiologia',
  'neumologia',
  'audiometria',
  'patologia',
  'obstetrico',
  'colposcopia',
  'oftalmologia',
  'veterinaria',
  'medicina_general',
  'otra'
);

-- Prioridad de estudio
CREATE TYPE study_priority AS ENUM ('rutina', 'urgente', 'stat');

-- ─────────────────────────────────────────────
-- 2. FUNCIÓN AUXILIAR: updated_at automático
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────
-- 3. ORGANIZACIONES (tenants)
-- ─────────────────────────────────────────────
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,         -- subdominio / URL amigable
  country_code  CHAR(2) NOT NULL,             -- ISO 3166-1 alpha-2
  currency      latam_currency NOT NULL DEFAULT 'MXN',
  locale        TEXT NOT NULL DEFAULT 'es-MX',
  timezone      TEXT NOT NULL DEFAULT 'America/Mexico_City',
  logo_url      TEXT,
  plan          TEXT NOT NULL DEFAULT 'starter', -- starter | professional | enterprise
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─────────────────────────────────────────────
-- 4. PERFILES DE USUARIO
--    Extiende auth.users de Supabase Auth.
--    Rol separado por perfil (un usuario puede tener
--    varios perfiles en distintas organizaciones).
-- ─────────────────────────────────────────────
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role            user_role NOT NULL DEFAULT 'paciente',
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  display_name    TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  email           TEXT NOT NULL,
  phone           TEXT,
  avatar_url      TEXT,
  preferred_lang  CHAR(2) NOT NULL DEFAULT 'es',  -- ISO 639-1
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(id, organization_id)
);

CREATE INDEX idx_profiles_org ON profiles(organization_id);
CREATE INDEX idx_profiles_role ON profiles(role);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─────────────────────────────────────────────
-- 5. MÉDICOS (extensión del perfil)
-- ─────────────────────────────────────────────
CREATE TABLE doctors (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  specialty        clinical_specialty NOT NULL DEFAULT 'medicina_general',
  license_number   TEXT,                        -- cédula profesional / registro
  license_country  CHAR(2),
  bio              TEXT,
  signature_url    TEXT,                        -- firma digital para reportes
  consultation_fee NUMERIC(12,2),
  currency         latam_currency,              -- moneda del honorario
  is_available     BOOLEAN NOT NULL DEFAULT TRUE,
  metadata         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doctors_org ON doctors(organization_id);
CREATE INDEX idx_doctors_specialty ON doctors(specialty);

CREATE TRIGGER trg_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─────────────────────────────────────────────
-- 6. PACIENTES (extensión del perfil)
-- ─────────────────────────────────────────────
CREATE TABLE patients (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id         UUID REFERENCES profiles(id) ON DELETE SET NULL, -- puede ser anónimo
  organization_id    UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  -- Datos demográficos
  first_name         TEXT NOT NULL,
  last_name          TEXT NOT NULL,
  date_of_birth      DATE,
  biological_sex     CHAR(1) CHECK (biological_sex IN ('M','F','O')),
  national_id        TEXT,                    -- DNI, CURP, CPF, RUT, etc.
  national_id_type   TEXT,                    -- curp | dni | cpf | rut | cedula | otro
  nationality        CHAR(2),
  phone              TEXT,
  email              TEXT,
  address            TEXT,
  city               TEXT,
  country_code       CHAR(2),
  blood_type         TEXT,
  allergies          TEXT[],
  notes              TEXT,
  metadata           JSONB DEFAULT '{}',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patients_org ON patients(organization_id);
CREATE INDEX idx_patients_profile ON patients(profile_id);

CREATE TRIGGER trg_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─────────────────────────────────────────────
-- 7. ESTUDIOS / IMÁGENES MÉDICAS
-- ─────────────────────────────────────────────
CREATE TABLE studies (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id        UUID REFERENCES doctors(id) ON DELETE SET NULL,
  referring_doctor UUID REFERENCES doctors(id) ON DELETE SET NULL,
  specialty        clinical_specialty NOT NULL,
  modality         TEXT,                      -- CT | MR | DX | US | ECG | SP …
  description      TEXT,
  priority         study_priority NOT NULL DEFAULT 'rutina',
  status           study_status NOT NULL DEFAULT 'recibido',
  accession_number TEXT UNIQUE,               -- número de acceso DICOM / RIS
  dicom_study_uid  TEXT UNIQUE,               -- 0020,000D Study Instance UID
  storage_path     TEXT,                      -- ruta en Supabase Storage
  report_html      TEXT,                      -- reporte firmado en HTML
  signed_at        TIMESTAMPTZ,
  signed_by        UUID REFERENCES doctors(id),
  study_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_studies_org ON studies(organization_id);
CREATE INDEX idx_studies_patient ON studies(patient_id);
CREATE INDEX idx_studies_status ON studies(status);
CREATE INDEX idx_studies_date ON studies(study_date DESC);

CREATE TRIGGER trg_studies_updated_at
  BEFORE UPDATE ON studies
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─────────────────────────────────────────────
-- 8. CITAS Y AGENDAS
-- ─────────────────────────────────────────────
CREATE TABLE appointments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id        UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  specialty        clinical_specialty NOT NULL,
  status           appointment_status NOT NULL DEFAULT 'programada',
  starts_at        TIMESTAMPTZ NOT NULL,
  ends_at          TIMESTAMPTZ NOT NULL,
  duration_min     SMALLINT GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (ends_at - starts_at)) / 60
  ) STORED,
  reason           TEXT,
  notes            TEXT,
  room             TEXT,
  is_virtual       BOOLEAN NOT NULL DEFAULT FALSE,
  video_url        TEXT,
  reminder_sent_at TIMESTAMPTZ,
  metadata         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX idx_appointments_org ON appointments(organization_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id, starts_at);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_status ON appointments(status);

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─────────────────────────────────────────────
-- 9. FACTURAS
--    Multi-moneda LatAm: cada factura almacena
--    monto, moneda ISO y tipo de cambio de referencia.
-- ─────────────────────────────────────────────
CREATE TABLE invoices (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id        UUID REFERENCES doctors(id) ON DELETE SET NULL,
  invoice_number   TEXT NOT NULL,
  status           invoice_status NOT NULL DEFAULT 'borrador',
  currency         latam_currency NOT NULL,
  subtotal         NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_rate         NUMERIC(5,4) NOT NULL DEFAULT 0,       -- Ej: 0.16 para IVA 16%
  tax_amount       NUMERIC(14,2) GENERATED ALWAYS AS (
    subtotal * tax_rate
  ) STORED,
  total            NUMERIC(14,2) GENERATED ALWAYS AS (
    subtotal + subtotal * tax_rate
  ) STORED,
  usd_exchange_rate NUMERIC(14,6),                        -- tasa al momento de emisión
  issued_at        DATE,
  due_at           DATE,
  paid_at          TIMESTAMPTZ,
  payment_method   payment_method,
  cfdi_uuid        TEXT,                                  -- UUID fiscal MX (SAT)
  nfse_number      TEXT,                                  -- NFS-e Brasil
  notes            TEXT,
  metadata         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, invoice_number)
);

CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_patient ON invoices(patient_id);
CREATE INDEX idx_invoices_status ON invoices(status);

CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Items de factura
CREATE TABLE invoice_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id   UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description  TEXT NOT NULL,
  quantity     NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price   NUMERIC(14,2) NOT NULL,
  currency     latam_currency NOT NULL,
  study_id     UUID REFERENCES studies(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- ─────────────────────────────────────────────
-- 10. HISTORIAL CLÍNICO (notas / SOAP)
-- ─────────────────────────────────────────────
CREATE TABLE clinical_notes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id        UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_id   UUID REFERENCES appointments(id) ON DELETE SET NULL,
  note_type        TEXT NOT NULL DEFAULT 'soap',     -- soap | evolucion | receta | interconsulta
  subjective       TEXT,
  objective        TEXT,
  assessment       TEXT,
  plan             TEXT,
  full_text        TEXT,                             -- para notas libres
  cie10_codes      TEXT[],                           -- diagnósticos CIE-10
  signed_at        TIMESTAMPTZ,
  metadata         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_patient ON clinical_notes(patient_id);
CREATE INDEX idx_notes_org ON clinical_notes(organization_id);

CREATE TRIGGER trg_notes_updated_at
  BEFORE UPDATE ON clinical_notes
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─────────────────────────────────────────────
-- 11. AUDITORÍA (log inmutable de acciones clave)
-- ─────────────────────────────────────────────
CREATE TABLE audit_log (
  id              BIGSERIAL PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  actor_id        UUID,                -- auth.users.id
  actor_role      user_role,
  action          TEXT NOT NULL,       -- 'study.signed' | 'invoice.paid' | etc.
  table_name      TEXT,
  record_id       UUID,
  old_data        JSONB,
  new_data        JSONB,
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_org ON audit_log(organization_id);
CREATE INDEX idx_audit_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_action ON audit_log(action);

-- ─────────────────────────────────────────────
-- 12. ROW-LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────

-- Habilitamos RLS en todas las tablas sensibles
ALTER TABLE organizations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors          ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients         ENABLE ROW LEVEL SECURITY;
ALTER TABLE studies          ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices         ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log        ENABLE ROW LEVEL SECURITY;

-- ── Función helper: obtiene el organization_id del usuario actual ──
CREATE OR REPLACE FUNCTION current_org_id()
RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- ── Función helper: obtiene el rol del usuario actual ──
CREATE OR REPLACE FUNCTION current_role_in_org()
RETURNS user_role LANGUAGE sql STABLE AS $$
  SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- ── organizations: sólo visible por miembros del tenant ──
CREATE POLICY "org_members_select" ON organizations
  FOR SELECT USING (id = current_org_id());

CREATE POLICY "admin_all_org" ON organizations
  FOR ALL USING (id = current_org_id() AND current_role_in_org() = 'admin');

-- ── profiles: cada usuario ve su propio perfil; admin ve todos los de su org ──
CREATE POLICY "own_profile" ON profiles
  FOR SELECT USING (id = auth.uid() OR organization_id = current_org_id());

CREATE POLICY "admin_manage_profiles" ON profiles
  FOR ALL USING (organization_id = current_org_id() AND current_role_in_org() = 'admin');

-- ── patients: médicos y admin de la misma org ──
CREATE POLICY "org_patients_select" ON patients
  FOR SELECT USING (
    organization_id = current_org_id()
    AND current_role_in_org() IN ('admin', 'medico')
  );

CREATE POLICY "paciente_own" ON patients
  FOR SELECT USING (
    profile_id = auth.uid()
  );

CREATE POLICY "admin_medico_manage_patients" ON patients
  FOR ALL USING (
    organization_id = current_org_id()
    AND current_role_in_org() IN ('admin', 'medico')
  );

-- ── studies: médico ve los asignados a él; admin ve todos; paciente ve los suyos ──
CREATE POLICY "doctor_studies" ON studies
  FOR SELECT USING (
    organization_id = current_org_id()
    AND (
      current_role_in_org() = 'admin'
      OR doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid())
      OR referring_doctor IN (SELECT id FROM doctors WHERE profile_id = auth.uid())
    )
  );

CREATE POLICY "patient_own_studies" ON studies
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE profile_id = auth.uid())
  );

CREATE POLICY "admin_medico_manage_studies" ON studies
  FOR ALL USING (
    organization_id = current_org_id()
    AND current_role_in_org() IN ('admin', 'medico')
  );

-- ── appointments ──
CREATE POLICY "org_appointments" ON appointments
  FOR SELECT USING (organization_id = current_org_id());

CREATE POLICY "patient_own_appointments" ON appointments
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE profile_id = auth.uid())
  );

CREATE POLICY "admin_medico_manage_appointments" ON appointments
  FOR ALL USING (
    organization_id = current_org_id()
    AND current_role_in_org() IN ('admin', 'medico')
  );

-- ── invoices ──
CREATE POLICY "admin_invoices" ON invoices
  FOR ALL USING (
    organization_id = current_org_id()
    AND current_role_in_org() = 'admin'
  );

CREATE POLICY "patient_own_invoices" ON invoices
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE profile_id = auth.uid())
  );

-- ── clinical_notes: sólo médicos y admin ──
CREATE POLICY "medico_admin_notes" ON clinical_notes
  FOR ALL USING (
    organization_id = current_org_id()
    AND current_role_in_org() IN ('admin', 'medico')
  );

-- ── audit_log: sólo admin puede leer, nadie puede borrar ──
CREATE POLICY "admin_read_audit" ON audit_log
  FOR SELECT USING (
    organization_id = current_org_id()
    AND current_role_in_org() = 'admin'
  );

-- ─────────────────────────────────────────────
-- 13. DATOS SEMILLA (seed mínimo para desarrollo)
-- ─────────────────────────────────────────────
INSERT INTO organizations (name, slug, country_code, currency, locale, timezone, plan)
VALUES
  ('Clínica Demo MX',  'demo-mx', 'MX', 'MXN', 'es-MX', 'America/Mexico_City',   'professional'),
  ('Clínica Demo BR',  'demo-br', 'BR', 'BRL', 'pt-BR', 'America/Sao_Paulo',     'starter'),
  ('Clínica Demo AR',  'demo-ar', 'AR', 'ARS', 'es-AR', 'America/Argentina/Buenos_Aires', 'starter'),
  ('Clínica Demo CO',  'demo-co', 'CO', 'COP', 'es-CO', 'America/Bogota',        'starter'),
  ('Clínica Demo CL',  'demo-cl', 'CL', 'CLP', 'es-CL', 'America/Santiago',      'starter');

-- FIN DEL SCHEMA
