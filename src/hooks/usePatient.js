import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient.js';

/*
  usePatient — detalle completo de un solo paciente (para el Drawer).

  Incluye citas recientes y estudios recientes mediante joins.
  RLS protege automáticamente: solo el tenant correcto puede leer.

  @param {string|null} patientId — UUID del paciente. null = no carga nada.
  @returns {{ patient, appointments, studies, loading, error, refresh }}
*/
export function usePatient(patientId) {
  const [patient,      setPatient]      = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [studies,      setStudies]      = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  const fetch = useCallback(async () => {
    if (!patientId) {
      setPatient(null);
      setAppointments([]);
      setStudies([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Perfil del paciente
      const { data: pat, error: patErr } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (patErr) {
        // eslint-disable-next-line no-console
        console.error('[usePatient] patient fetch error (EN):', {
          code: patErr.code, message: patErr.message,
        });
        setError('No se pudo cargar el perfil del paciente.');
        return;
      }
      setPatient(pat);

      // 2. Últimas 10 citas (más recientes primero)
      const { data: appts, error: apptErr } = await supabase
        .from('appointments')
        .select(`
          id, starts_at, ends_at, status, specialty, reason,
          doctors ( id, profile_id, specialty,
            profiles ( first_name, last_name )
          )
        `)
        .eq('patient_id', patientId)
        .order('starts_at', { ascending: false })
        .limit(10);

      if (apptErr) {
        // eslint-disable-next-line no-console
        console.error('[usePatient] appointments fetch error (EN):', {
          code: apptErr.code, message: apptErr.message,
        });
      } else {
        setAppointments(appts ?? []);
      }

      // 3. Últimos 10 estudios
      const { data: stds, error: stdsErr } = await supabase
        .from('studies')
        .select('id, study_date, modality, specialty, status, description, accession_number')
        .eq('patient_id', patientId)
        .order('study_date', { ascending: false })
        .limit(10);

      if (stdsErr) {
        // eslint-disable-next-line no-console
        console.error('[usePatient] studies fetch error (EN):', {
          code: stdsErr.code, message: stdsErr.message,
        });
      } else {
        setStudies(stds ?? []);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[usePatient] unexpected error:', err);
      setError('Error inesperado al cargar el paciente.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { patient, appointments, studies, loading, error, refresh: fetch };
}
