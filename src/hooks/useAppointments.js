import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import { useAuth } from '@/hooks/useAuth.js';

/*
  useAppointments — citas del día (o rango de fechas) para la clínica.

  El MODELO DE DATOS está en español (tablas `citas`, `pacientes`, `usuarios`,
  columnas `clinica_id`, `paciente_id`, `medico_id`, `fecha`, `hora`, `estado`…).
  Este hook lee ese modelo y NORMALIZA cada fila a la forma legacy en inglés que
  consume AppointmentsPage (appt.starts_at, appt.patients.first_name, appt.status…),
  igual que hace getProfile() con usuarios→profile. Así no hay que renombrar nada
  en los componentes.

  RLS garantiza que solo se ven las citas del tenant del usuario autenticado.

  @param {object} opts
    date     : string ISO (YYYY-MM-DD) — día a consultar. Default = hoy.
    doctorId : string UUID | null      — filtrar por médico. null = todos.

  @returns {{
    appointments, loading, error, refresh, createAppointment
  }}
*/

// Mapa estado(DB español) → status(UI). La UI espera estos valores.
const ESTADO_TO_STATUS = {
  pendiente:  'programada',
  confirmada: 'confirmada',
  cancelada:  'cancelada',
  completada: 'completada',
  no_asistio: 'no_asistio',
};
// Mapa inverso para crear citas desde el formulario (UI → DB).
const STATUS_TO_ESTADO = {
  programada: 'pendiente',
  confirmada: 'confirmada',
  en_curso:   'confirmada',
  completada: 'completada',
  cancelada:  'cancelada',
  no_asistio: 'no_asistio',
};

/** Combina fecha (YYYY-MM-DD) + hora (HH:MM[:SS]) en un ISO local-ish para la UI. */
function joinDateTime(fecha, hora) {
  if (!fecha) return null;
  const h = hora ? (hora.length === 5 ? `${hora}:00` : hora) : '00:00:00';
  return `${fecha}T${h}`;
}

/** Normaliza una fila de `citas` (+joins) a la forma legacy `appointment`. */
function normalizeCita(row) {
  const p = row.pacientes ?? null;
  const m = row.medico ?? null; // alias del join a usuarios

  return {
    id:         row.id,
    starts_at:  joinDateTime(row.fecha, row.hora),
    ends_at:    null,                          // el modelo no guarda fin; UI lo tolera
    status:     ESTADO_TO_STATUS[row.estado] ?? row.estado,
    specialty:  row.tipo ?? null,
    reason:     row.notas ?? null,
    room:       null,
    is_virtual: false,
    patients: p
      ? {
          id:             p.id,
          first_name:     p.nombre,
          last_name:      p.apellido,
          date_of_birth:  p.fecha_nacimiento,
          biological_sex: p.sexo,
          national_id:    p.documento,
          phone:          p.telefono,
        }
      : null,
    doctors: m
      ? {
          id:        m.id,
          specialty: null,
          profiles: { first_name: m.nombre, last_name: m.apellido },
        }
      : null,
  };
}

export function useAppointments({ date, doctorId = null } = {}) {
  const { organization } = useAuth();
  const orgId = organization?.id ?? null;

  const today      = new Date().toISOString().slice(0, 10);
  const targetDate = date ?? today;

  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const abortRef = useRef(false);

  const fetchAppointments = useCallback(async () => {
    if (!orgId) {
      // Sin clínica resuelta aún: no es error, simplemente nada que cargar.
      setLoading(false);
      setAppointments([]);
      return;
    }

    abortRef.current = false;
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('citas')
        .select(`
          id, fecha, hora, estado, tipo, notas,
          pacientes (
            id, nombre, apellido, fecha_nacimiento, sexo, documento, telefono
          ),
          medico:usuarios!citas_medico_id_fkey (
            id, nombre, apellido
          )
        `)
        .eq('clinica_id', orgId)
        .eq('fecha', targetDate)
        .order('hora', { ascending: true });

      if (doctorId) {
        query = query.eq('medico_id', doctorId);
      }

      const { data, error: sbError } = await query;

      if (abortRef.current) return;

      if (sbError) {
        // eslint-disable-next-line no-console
        console.error('[useAppointments] Supabase error (EN):', {
          code: sbError.code, message: sbError.message, details: sbError.details, hint: sbError.hint,
        });
        setError('No se pudieron cargar las citas. Verifica la conexión.');
        setAppointments([]);
      } else {
        setAppointments((data ?? []).map(normalizeCita));
      }
    } catch (err) {
      if (!abortRef.current) {
        // eslint-disable-next-line no-console
        console.error('[useAppointments] Unexpected error:', err);
        setError('Error inesperado al obtener citas.');
        setAppointments([]);
      }
    } finally {
      if (!abortRef.current) setLoading(false);
    }
  }, [orgId, targetDate, doctorId]);

  useEffect(() => {
    fetchAppointments();
    return () => { abortRef.current = true; };
  }, [fetchAppointments]);

  // ── CREATE: inserta una nueva cita y recarga la lista ─────────────────────
  // Acepta el payload legacy del formulario (starts_at, status, reason, specialty)
  // y lo traduce al modelo español (fecha, hora, estado, tipo, notas).
  const createAppointment = useCallback(async (payload = {}) => {
    const startsAt = payload.starts_at ?? null;
    const fecha = startsAt ? startsAt.slice(0, 10) : targetDate;
    const hora  = startsAt && startsAt.includes('T') ? `${startsAt.slice(11, 16)}:00` : null;

    const insertData = {
      clinica_id:  orgId,
      paciente_id: payload.patient_id ?? payload.paciente_id ?? null,
      medico_id:   payload.doctor_id  ?? payload.medico_id   ?? null,
      fecha,
      hora,
      estado: STATUS_TO_ESTADO[payload.status] ?? 'pendiente',
      tipo:   payload.specialty ?? payload.tipo ?? null,
      notas:  payload.reason    ?? payload.notas ?? null,
    };

    const { data, error: sbError } = await supabase
      .from('citas')
      .insert(insertData)
      .select()
      .single();

    if (sbError) {
      // eslint-disable-next-line no-console
      console.error('[useAppointments] createAppointment error (EN):', {
        code: sbError.code, message: sbError.message, details: sbError.details, hint: sbError.hint,
      });
    } else if (fecha === targetDate) {
      fetchAppointments();
    }

    return { data, error: sbError };
  }, [orgId, targetDate, fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    refresh:           fetchAppointments,
    createAppointment,
  };
}
