import Drawer, { DrawerSection, DrawerField } from '@/components/common/Drawer.jsx';
import Badge, { statusToVariant }            from '@/components/common/Badge.jsx';
import Skeleton                              from '@/components/common/Skeleton.jsx';
import { usePatient }                        from '@/hooks/usePatient.js';

/*
  PatientDrawer — panel deslizable con el perfil completo del paciente.

  Muestra:
    • Datos demográficos (nombre, DOB, sexo, sangre, alergias)
    • Identificación (ID nacional, teléfono, email, ciudad, país)
    • Historial de citas recientes (con badge de status)
    • Estudios recientes (con badge de status)
    • Skeleton mientras carga cada sección
    • CERO verde
*/
export default function PatientDrawer({ patientId, onClose }) {
  const open = !!patientId;
  const { patient, appointments, studies, loading, error } = usePatient(
    open ? patientId : null,
  );

  const name = patient
    ? `${patient.first_name} ${patient.last_name}`.trim()
    : '';

  const subtitle = patient
    ? [patient.biological_sex === 'F' ? 'Femenino'
       : patient.biological_sex === 'M' ? 'Masculino'
       : null,
       calcAge(patient.date_of_birth) !== null
         ? `${calcAge(patient.date_of_birth)} años`
         : null,
      ].filter(Boolean).join(' · ')
    : '';

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={loading ? 'Cargando…' : name || 'Perfil del paciente'}
      subtitle={subtitle}
      width="520px"
    >
      {/* ── Error global ── */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10
                        px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* ── Skeleton completo mientras carga ── */}
      {loading && (
        <div className="space-y-6" aria-hidden>
          <Skeleton.Card rows={4} />
          <Skeleton.Card rows={3} />
          <Skeleton.Card rows={3} />
        </div>
      )}

      {/* ── Contenido real ── */}
      {!loading && patient && (
        <>
          {/* Identificación visual */}
          <div className="mb-6 flex items-center gap-4">
            <LargeInitialsAvatar
              first={patient.first_name}
              last={patient.last_name}
              sex={patient.biological_sex}
            />
            <div>
              <h3 className="font-display text-xl font-bold text-white">{name}</h3>
              <p className="mt-0.5 text-sm text-clinical-400">
                {patient.national_id_type?.toUpperCase() ?? 'ID'}: {patient.national_id ?? '—'}
              </p>
              {patient.blood_type && (
                <span className="mt-2 inline-flex items-center rounded-full
                                 border border-electric-500/40 bg-electric-500/10
                                 px-2 py-0.5 text-xs font-bold text-electric-300">
                  Sangre {patient.blood_type}
                </span>
              )}
            </div>
          </div>

          {/* Datos demográficos */}
          <DrawerSection title="Datos demográficos">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <DrawerField label="Fecha de nacimiento"
                value={fmtDate(patient.date_of_birth)} />
              <DrawerField label="Edad"
                value={calcAge(patient.date_of_birth) !== null
                  ? `${calcAge(patient.date_of_birth)} años` : null} />
              <DrawerField label="Sexo biológico"
                value={patient.biological_sex === 'F' ? 'Femenino'
                  : patient.biological_sex === 'M' ? 'Masculino'
                  : patient.biological_sex === 'O' ? 'Otro' : null} />
              <DrawerField label="Nacionalidad"
                value={patient.nationality} />
              <DrawerField label="Tipo de sangre"
                value={patient.blood_type} />
              <DrawerField label="País"
                value={patient.country_code} />
            </dl>
          </DrawerSection>

          {/* Contacto */}
          <DrawerSection title="Contacto">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <DrawerField label="Teléfono"  value={patient.phone} />
              <DrawerField label="Correo"    value={patient.email} />
              <DrawerField label="Ciudad"    value={patient.city} />
              <DrawerField label="Dirección" value={patient.address} span />
            </dl>
          </DrawerSection>

          {/* Alergias */}
          {patient.allergies?.length > 0 && (
            <DrawerSection title="Alergias conocidas">
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map(a => (
                  <span
                    key={a}
                    className="rounded-full border border-red-400/30 bg-red-400/10
                               px-2.5 py-0.5 text-xs font-medium text-red-300"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </DrawerSection>
          )}

          {/* Notas clínicas */}
          {patient.notes && (
            <DrawerSection title="Notas">
              <p className="rounded-xl border border-white/[0.06] bg-white/[0.03]
                            px-4 py-3 text-sm leading-relaxed text-clinical-300">
                {patient.notes}
              </p>
            </DrawerSection>
          )}

          {/* Citas recientes */}
          <DrawerSection title={`Citas recientes (${appointments.length})`}>
            {appointments.length === 0 ? (
              <EmptySlate label="Sin citas registradas" />
            ) : (
              <ul className="space-y-2">
                {appointments.map(a => (
                  <li
                    key={a.id}
                    className="flex items-start justify-between gap-3
                               rounded-xl border border-white/[0.06]
                               bg-white/[0.03] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {fmtDateTime(a.starts_at)}
                      </p>
                      <p className="mt-0.5 text-xs text-clinical-400">
                        {a.specialty} · {doctorName(a.doctors)}
                      </p>
                      {a.reason && (
                        <p className="mt-1 text-xs text-clinical-500 italic">
                          {a.reason}
                        </p>
                      )}
                    </div>
                    <Badge variant={statusToVariant(a.status)} />
                  </li>
                ))}
              </ul>
            )}
          </DrawerSection>

          {/* Estudios recientes */}
          <DrawerSection title={`Estudios recientes (${studies.length})`}>
            {studies.length === 0 ? (
              <EmptySlate label="Sin estudios registrados" />
            ) : (
              <ul className="space-y-2">
                {studies.map(s => (
                  <li
                    key={s.id}
                    className="flex items-start justify-between gap-3
                               rounded-xl border border-white/[0.06]
                               bg-white/[0.03] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {s.modality ?? s.specialty} · {fmtDate(s.study_date)}
                      </p>
                      {s.description && (
                        <p className="mt-0.5 text-xs text-clinical-400">
                          {s.description}
                        </p>
                      )}
                      {s.accession_number && (
                        <p className="mt-0.5 font-mono text-[10px] text-clinical-600">
                          {s.accession_number}
                        </p>
                      )}
                    </div>
                    <Badge variant={statusToVariant(s.status)} />
                  </li>
                ))}
              </ul>
            )}
          </DrawerSection>
        </>
      )}
    </Drawer>
  );
}

/* ── Avatar grande de iniciales ─────────────────────────────────── */
function LargeInitialsAvatar({ first = '', last = '', sex }) {
  const initials = `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
  const bg = sex === 'F'
    ? 'bg-violet-500/20 border-violet-400/30 text-violet-200'
    : sex === 'M'
    ? 'bg-electric-500/20 border-electric-400/30 text-electric-200'
    : 'bg-clinical-700/30 border-clinical-600/30 text-clinical-300';

  return (
    <span
      className={`flex h-16 w-16 shrink-0 items-center justify-center
                  rounded-2xl border text-2xl font-bold ${bg}`}
      aria-hidden
    >
      {initials}
    </span>
  );
}

function EmptySlate({ label }) {
  return (
    <p className="rounded-xl border border-dashed border-white/[0.08]
                  py-6 text-center text-sm text-clinical-600">
      {label}
    </p>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────── */
function calcAge(dob) {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000*60*60*24*365.25));
}

function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function doctorName(doc) {
  if (!doc) return '—';
  const p = doc.profiles;
  if (!p) return '—';
  return `Dr/a. ${p.first_name ?? ''} ${p.last_name ?? ''}`.trim();
}
