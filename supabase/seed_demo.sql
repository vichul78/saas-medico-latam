-- ============================================================
-- SEED DATOS DEMO — Citas y Facturas para KPIs del dashboard
-- ============================================================
-- Ejecutar en Supabase SQL Editor después del schema.sql
-- Requiere que existan: clínica 'demo-mx', al menos 1 paciente
-- ============================================================

DO $$
DECLARE
  v_clinica_id UUID;
  v_paciente_id UUID;
BEGIN
  -- Obtener IDs base
  SELECT id INTO v_clinica_id FROM clinicas WHERE slug = 'demo-mx' LIMIT 1;
  SELECT id INTO v_paciente_id FROM pacientes WHERE clinica_id = v_clinica_id LIMIT 1;

  IF v_clinica_id IS NULL THEN
    RAISE EXCEPTION 'Clínica demo-mx no encontrada. Ejecuta el schema.sql primero.';
  END IF;

  IF v_paciente_id IS NULL THEN
    RAISE EXCEPTION 'No hay pacientes en demo-mx. Inserta al menos uno primero.';
  END IF;

  -- ─── CITAS ───────────────────────────────────────────────
  -- Citas de los últimos 30 días + próximas 7 días
  INSERT INTO citas (clinica_id, paciente_id, fecha, hora, estado, tipo, notas)
  VALUES
    (v_clinica_id, v_paciente_id, CURRENT_DATE - 20, '09:00', 'completada',  'Consulta general',    'Control rutinario'),
    (v_clinica_id, v_paciente_id, CURRENT_DATE - 15, '10:30', 'completada',  'Radiografía torácica','Seguimiento'),
    (v_clinica_id, v_paciente_id, CURRENT_DATE - 10, '08:00', 'completada',  'Ecografía abdominal', 'Dolor abdominal leve'),
    (v_clinica_id, v_paciente_id, CURRENT_DATE - 7,  '11:00', 'completada',  'Consulta general',    'Revisión resultados'),
    (v_clinica_id, v_paciente_id, CURRENT_DATE - 5,  '14:00', 'completada',  'Densitometría',       NULL),
    (v_clinica_id, v_paciente_id, CURRENT_DATE - 3,  '09:30', 'confirmada',  'Tomografía cráneo',   'Cefalea persistente'),
    (v_clinica_id, v_paciente_id, CURRENT_DATE - 1,  '10:00', 'no_asistio',  'Consulta general',    NULL),
    (v_clinica_id, v_paciente_id, CURRENT_DATE,       '15:00', 'pendiente',   'Radiografía columna', NULL),
    (v_clinica_id, v_paciente_id, CURRENT_DATE + 1,  '09:00', 'confirmada',  'Ecografía renal',     NULL),
    (v_clinica_id, v_paciente_id, CURRENT_DATE + 2,  '11:30', 'pendiente',   'Consulta general',    'Primera visita'),
    (v_clinica_id, v_paciente_id, CURRENT_DATE + 3,  '16:00', 'pendiente',   'Mamografía',          'Control anual'),
    (v_clinica_id, v_paciente_id, CURRENT_DATE + 5,  '08:30', 'confirmada',  'Tomografía abdomen',  NULL),
    (v_clinica_id, v_paciente_id, CURRENT_DATE - 25, '13:00', 'cancelada',   'Densitometría',       'Paciente reagendó'),
    (v_clinica_id, v_paciente_id, CURRENT_DATE - 12, '10:00', 'completada',  'Radiografía rodilla', NULL),
    (v_clinica_id, v_paciente_id, CURRENT_DATE - 8,  '09:00', 'completada',  'Consulta general',    NULL)
  ON CONFLICT DO NOTHING;

  -- ─── FACTURAS ────────────────────────────────────────────
  -- Facturas del mes actual + mes anterior
  INSERT INTO facturas (clinica_id, paciente_id, monto, moneda, estado, concepto)
  VALUES
    (v_clinica_id, v_paciente_id, 1200.00, 'MXN', 'pagada',   'Tomografía computada torácica'),
    (v_clinica_id, v_paciente_id,  850.00, 'MXN', 'pagada',   'Radiografía de tórax + Informe'),
    (v_clinica_id, v_paciente_id,  650.00, 'MXN', 'pagada',   'Ecografía abdominal completa'),
    (v_clinica_id, v_paciente_id, 2400.00, 'MXN', 'pagada',   'Resonancia magnética cerebral'),
    (v_clinica_id, v_paciente_id,  450.00, 'MXN', 'pagada',   'Consulta médica + prescripción'),
    (v_clinica_id, v_paciente_id,  980.00, 'MXN', 'pendiente','Densitometría ósea dual'),
    (v_clinica_id, v_paciente_id, 1750.00, 'MXN', 'pendiente','Tomografía abdominal con contraste'),
    (v_clinica_id, v_paciente_id,  320.00, 'MXN', 'pendiente','Radiografía columna lumbar'),
    (v_clinica_id, v_paciente_id,  550.00, 'MXN', 'vencida',  'Ecografía renal bilateral'),
    (v_clinica_id, v_paciente_id, 1100.00, 'MXN', 'pagada',   'Mamografía bilateral + informe'),
    (v_clinica_id, v_paciente_id,  420.00, 'MXN', 'pagada',   'Radiografía rodilla bilateral'),
    (v_clinica_id, v_paciente_id,  870.00, 'MXN', 'anulada',  'Estudio cancelado por paciente'),
    (v_clinica_id, v_paciente_id, 1650.00, 'MXN', 'pagada',   'TC columna cervical + reconstrucción 3D'),
    (v_clinica_id, v_paciente_id,  720.00, 'MXN', 'pagada',   'Ecografía obstétrica'),
    (v_clinica_id, v_paciente_id, 3200.00, 'MXN', 'pendiente','PET-CT oncológico')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed completado: 15 citas, 15 facturas insertadas en clínica %', v_clinica_id;
END $$;
