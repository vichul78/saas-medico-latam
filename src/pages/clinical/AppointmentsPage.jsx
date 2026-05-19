import { useState } from 'react';
import { useAppointments } from '@/hooks/useAppointments.js';
import Badge, { statusToVariant } from '@/components/common/Badge.jsx';
import Skeleton from '@/components/common/Skeleton.jsx';
import PatientDrawer from '@/components/clinical/PatientDrawer.jsx';

/*
  AppointmentsPage — gestión de citas del día:
    • Selector de fecha (hoy por defecto)
    • Lista estructurada con hora, paciente, médico y badge de status
    • Skeleton durante la carga
    • Formulario modal para crear nueva cita
    • Clic en paciente → PatientDrawer sin cambio de ruta
    • CERO verde en badges o estados
*/

const STATUS_OPTIONS = [
  { value: 'programada', label: 'Programada' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'en_curso',   label: 'En curso' },
  { value: 'completada', label: 'Completada' },
  { value: 'cancelada',  label: 'Cancelada' },
  { value: 'no_asistio', label: 'No asistió' },
];

const SPECIALTY_OPTIONS = [
  'radiologia','dental','cirugia','cardiologia','neumologia',
  'audiometria','patologia','obstetrico','colposcopia','oftalmologia',
  'veterinaria','medicina_general','otra',
];

export default function AppointmentsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [date,        setDate]        = useState(today);
  const [showForm,    setShowForm]    = useState(false);
  const [selectedPid, setSelectedPid] = useState(null);

  const { appointments, loading, error, refresh, createAppointment } =
    useAppointments({ date });

  return (
    <>
      {/* ── Cabecera ── */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-electric-400">
          Módulo clínico
        </p>
        <h1 className="font-display text-3xl font-bold text-white">
          Citas y Agendas
        </h1>
        <p className="mt-1 text-sm text-clinical-400">
          {appointments.length > 0
            ? `${appointments.length} cita${appointments.length !== 1 ? 's' : ''} para el ${fmtDateLabel(date)}`
            : `Agenda del ${fmtDateLabel(date)}`}
        </p>
      </div>

      {/* ── Barra de acciones ── */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {/* Selector de fecha */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-clinical-500">Fecha:</span>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="rounded-xl border border-white/[0.09] bg-white/[0.05]
                       px-3 py-2 text-sm text-white
                       focus:border-electric-500 focus:outline-none
                       focus:ring-2 focus:ring-electric-500/25"
          />
        </div>

        {/* Atajos rápidos de fecha */}
        <div className="flex items-center gap-1">
          {[
            { label: 'Ayer',    delta: -1 },
            { label: 'Hoy',     delta:  0 },
            { label: 'Mañana',  delta:  1 },
          ].map(({ label, delta }) => {
            const d = new Date();
            d.setDate(d.getDate() + delta);
            const val = d.toISOString().slice(0, 10);
            return (
              <button
                key={label}
                type="button"
                onClick={() => setDate(val)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition
                  ${date === val
                    ? 'bg-electric-500/20 text-electric-300 border border-electric-500/40'
                    : 'text-clinical-400 hover:bg-white/[0.05] hover:text-clinical-200 border border-transparent'}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="ml-auto">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-electric-gradient
                       px-4 py-2.5 text-sm font-semibold text-white
                       shadow-[0_4px_20px_-6px_rgba(122,34,255,0.5)]
                       transition hover:brightness-110 active:brightness-95"
          >
            <IconPlus />
            Nueva cita
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-400/30
                        bg-red-400/10 px-4 py-3 text-sm text-red-300">
          <IconAlert /> {error}
        </div>
      )}


      {/* ── Lista de citas ── */}
      {loading ? (
        <Skeleton.AppointmentRow count={6} />
      ) : appointments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/[0.08]
                        py-16 text-center text-sm text-clinical-600">
          Sin citas para el {fmtDateLabel(date)}.
          <br />
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-3 text-electric-400 hover:underline"
          >
            + Agregar primera cita
          </button>
        </div>
      ) : (
        <ol className="space-y-2">
          {appointments.map(appt => (
            <AppointmentCard
              key={appt.id}
              appt={appt}
              onClickPatient={() => setSelectedPid(appt.patients?.id ?? null)}
            />
          ))}
        </ol>
      )}

      {/* ── Modal nueva cita ── */}
      {showForm && (
        <NewAppointmentModal
          onClose={() => setShowForm(false)}
          onCreate={async (payload) => {
            const { error: e } = await createAppointment(payload);
            if (!e) setShowForm(false);
            return { error: e };
          }}
          defaultDate={date}
        />
      )}

      {/* ── Drawer paciente ── */}
      <PatientDrawer
        patientId={selectedPid}
        onClose={() => setSelectedPid(null)}
      />
    </>
  );
}


/* ── Tarjeta de cita individual ────────────────────────────────── */
function AppointmentCard({ appt, onClickPatient }) {
  const patName = appt.patients
    ? `${appt.patients.first_name} ${appt.patients.last_name}`.trim()
    : '—';
  const docName = appt.doctors?.profiles
    ? `Dr/a. ${appt.doctors.profiles.first_name} ${appt.doctors.profiles.last_name}`.trim()
    : '—';

  return (
    <li className="flex items-start gap-4 rounded-xl border border-white/[0.07]
                   bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.05]">
      {/* Hora */}
      <div className="flex w-14 shrink-0 flex-col items-center justify-center
                      rounded-xl border border-white/[0.08] bg-white/[0.04]
                      py-2 text-center">
        <span className="text-lg font-bold leading-none text-electric-300">
          {fmtTime(appt.starts_at)}
        </span>
        <span className="mt-0.5 text-[10px] text-clinical-500">
          {fmtTime(appt.ends_at)}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-wrap items-start justify-between gap-2">
        <div>
          {/* Nombre del paciente — clicable → Drawer */}
          <button
            type="button"
            onClick={onClickPatient}
            className="text-left text-sm font-semibold text-white
                       transition hover:text-electric-300"
          >
            {patName}
          </button>
          <p className="text-xs text-clinical-400">{docName}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10
                             px-2 py-0.5 text-[10px] font-medium text-violet-300">
              {appt.specialty}
            </span>
            {appt.is_virtual && (
              <span className="rounded-full border border-electric-400/30 bg-electric-400/10
                               px-2 py-0.5 text-[10px] font-medium text-electric-300">
                Virtual
              </span>
            )}
            {appt.room && (
              <span className="text-[10px] text-clinical-500">Sala: {appt.room}</span>
            )}
          </div>
          {appt.reason && (
            <p className="mt-1 text-xs text-clinical-500 italic">{appt.reason}</p>
          )}
        </div>
        <Badge variant={statusToVariant(appt.status)} size="sm" />
      </div>
    </li>
  );
}


/* ── Modal: Nueva cita ───────────────────────────────────────────── */
function NewAppointmentModal({ onClose, onCreate, defaultDate }) {
  const [form,      setForm]      = useState({
    patient_id:   '',
    doctor_id:    '',
    specialty:    'medicina_general',
    starts_at:    `${defaultDate}T09:00`,
    ends_at:      `${defaultDate}T09:30`,
    reason:       '',
    room:         '',
    is_virtual:   false,
    status:       'programada',
  });
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState('');

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setApiError('');
    const { error } = await onCreate(form);
    if (error) {
      setApiError('No se pudo crear la cita. Verifica los datos e inténtalo de nuevo.');
    }
    setSubmitting(false);
  }

  return (
    /* Overlay */
    <div className="fixed inset-0 z-50 flex items-center justify-center
                    bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.08]
                      bg-clinical-900 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.8)]">

        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">Nueva cita</h2>
            <p className="text-xs text-clinical-400">Completa los campos obligatorios</p>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg
                       border border-white/[0.08] text-clinical-500
                       transition hover:border-electric-500/40 hover:text-electric-400">
            <IconX />
          </button>
        </div>

        {/* Barra eléctrica */}
        <div className="h-px w-full bg-electric-gradient opacity-60" />

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 px-6 py-5">
          <ModalField label="ID del paciente *" span>
            <input required value={form.patient_id}
              onChange={e => set('patient_id', e.target.value)}
              placeholder="UUID del paciente"
              className="modal-input" />
          </ModalField>

          <ModalField label="ID del médico *" span>
            <input required value={form.doctor_id}
              onChange={e => set('doctor_id', e.target.value)}
              placeholder="UUID del médico"
              className="modal-input" />
          </ModalField>

          <ModalField label="Especialidad">
            <select value={form.specialty} onChange={e => set('specialty', e.target.value)}
              className="modal-input">
              {SPECIALTY_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </ModalField>

          <ModalField label="Estado">
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="modal-input">
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </ModalField>

          <ModalField label="Inicio *">
            <input required type="datetime-local" value={form.starts_at}
              onChange={e => set('starts_at', e.target.value)}
              className="modal-input" />
          </ModalField>

          <ModalField label="Fin *">
            <input required type="datetime-local" value={form.ends_at}
              onChange={e => set('ends_at', e.target.value)}
              className="modal-input" />
          </ModalField>

          <ModalField label="Motivo" span>
            <input value={form.reason} onChange={e => set('reason', e.target.value)}
              placeholder="Motivo de consulta (opcional)"
              className="modal-input" />
          </ModalField>

          <ModalField label="Sala">
            <input value={form.room} onChange={e => set('room', e.target.value)}
              placeholder="Sala / consultorio"
              className="modal-input" />
          </ModalField>

          <ModalField label="¿Virtual?">
            <label className="flex cursor-pointer items-center gap-2 py-2 text-sm text-clinical-300">
              <input type="checkbox" checked={form.is_virtual}
                onChange={e => set('is_virtual', e.target.checked)}
                className="h-4 w-4 rounded accent-electric-500" />
              Cita por videollamada
            </label>
          </ModalField>

          {apiError && (
            <div className="col-span-2 rounded-xl border border-red-400/30
                            bg-red-400/10 px-4 py-2 text-sm text-red-300">
              {apiError}
            </div>
          )}

          <div className="col-span-2 flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="rounded-xl border border-white/[0.09] px-4 py-2 text-sm
                         text-clinical-400 transition hover:border-electric-500/30
                         hover:text-clinical-200">
              Cancelar
            </button>
            <button type="submit" disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-electric-gradient
                         px-5 py-2 text-sm font-semibold text-white
                         shadow-[0_4px_20px_-6px_rgba(122,34,255,0.5)]
                         transition hover:brightness-110 disabled:opacity-50">
              {submitting ? 'Guardando…' : 'Crear cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalField({ label, span = false, children }) {
  return (
    <label className={`flex flex-col gap-1.5 ${span ? 'col-span-2' : ''}`}>
      <span className="text-xs font-medium text-clinical-400">{label}</span>
      {children}
    </label>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────── */
function fmtTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

function fmtDateLabel(iso) {
  if (!iso) return '—';
  return new Date(iso + 'T12:00:00').toLocaleDateString('es', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

/* ── Micro-iconos ─────────────────────────────────────────────────── */
function IconPlus() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconX() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function IconAlert() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2}
         viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round"
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}
