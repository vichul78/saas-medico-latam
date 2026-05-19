import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import { useAuth } from '@/hooks/useAuth.js';

/*
  useAppointments — citas del día (o rango de fechas) para la organización.

  RLS garantiza que solo se ven las citas del tenant del usuario autenticado.

  @param {object} opts
    date     : string ISO (YYYY-MM-DD) — día a consultar. Default = hoy.
    doctorId : string UUID | null      — filtrar por médico. null = todos.

  @returns {{
    appointments : array,
    loading      : bool,
    error        : string | null,
    refresh      : fn,
    createAppointment : fn(payload) → Promise<{ data, error }>
  }}
*/
export function useAppointments({ date, doctorId = null } = {}) {
  const { organization } = useAuth();
  const orgId = organization?.id ?? null;

  const today    = new Date().toISOString().slice(0, 10);
  const targetDate = date ?? today;

  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const abortRef = useRef(false);

  const fetchAppointments = useCallback(async () => {
    if (!orgId) return;

    abortRef.current = false;
    setLoading(true);
    setError(null);

    try {
      // Rango del día: 00:00:00 → 23:59:59 en UTC
      const dayStart = `${targetDate}T00:00:00`;
      const dayEnd   = `${targetDate}T23:59:59`;

      let query = supabase
        .from('appointments')
        .select(`
          id, starts_at, ends_at, status, specialty, reason, room, is_virtual,
          patients (
            id, first_name, last_name, date_of_birth,
            biological_sex, national_id, phone
          ),
          doctors (
            id, specialty,
            profiles ( first_name, last_name )
          )
        `)
        .eq('organization_id', orgId)
        .gte('starts_at', dayStart)
        .lte('starts_at', dayEnd)
        .order('starts_at', { ascending: true });

      if (doctorId) {
        query = query.eq('doctor_id', doctorId);
      }

      const { data, error: sbError } = await query;

      if (abortRef.current) return;

      if (sbError) {
        // eslint-disable-next-line no-console
        console.error('[useAppointments] Supabase error (EN):', {
          code: sbError.code, message: sbError.message, details: sbError.details,
        });
        setError('No se pudieron cargar las citas. Verifica la conexión.');
        setAppointments([]);
      } else {
        setAppointments(data ?? []);
      }
    } catch (err) {
      if (!abortRef.current) {
        // eslint-disable-next-line no-console
        console.error('[useAppointments] Unexpected error:', err);
        setError('Error inesperado al obtener citas.');
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
  const createAppointment = useCallback(async (payload) => {
    const insertData = { ...payload, organization_id: orgId };

    const { data, error: sbError } = await supabase
      .from('appointments')
      .insert(insertData)
      .select()
      .single();

    if (sbError) {
      // eslint-disable-next-line no-console
      console.error('[useAppointments] createAppointment error (EN):', {
        code: sbError.code, message: sbError.message,
      });
    } else {
      // Recarga la lista si la nueva cita es del mismo día visible
      const apptDate = payload.starts_at?.slice(0, 10);
      if (!apptDate || apptDate === targetDate) fetchAppointments();
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
