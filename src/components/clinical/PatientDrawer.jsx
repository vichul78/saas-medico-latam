import Drawer, { DrawerSection, DrawerField } from '@/components/common/Drawer.jsx';
import Skeleton                              from '@/components/common/Skeleton.jsx';
import { usePatient }                        from '@/hooks/usePatient.js';

/*
  PatientDrawer — panel deslizable con el perfil del paciente.

  Muestra:
    - Datos demograficos (nombre, fecha nac., sexo, alergias)
    - Identificacion (documento, telefono, email, ciudad)
    - Notas clinicas
    - CERO verde
*/
export default function PatientDrawer({ patientId, onClose }) {
  const open = !!patientId;
  const { patient, loading, error } = usePatient(open ? patientId : null);

  const name = patient
    ? `${patient.nombre} ${patient.apellido ?? ''}`.trim()
    : '';

  const subtitle = patient
    ? [patient.sexo === 'F' ? 'Femenino'
       : patient.sexo === 'M' ? 'Masculino'
       : null,
       calcAge(patient.fecha_nacimiento) !== null
         ? `${calcAge(patient.fecha_nacimiento)} anos`
         : null,
      ].filter(Boolean).join(' - ')
    : '';

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={loading ? 'Cargando...' : name || 'Perfil del paciente'}
      subtitle={subtitle}
      width="520px"
    >
      {/* Error global */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10
                        px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Skeleton mientras carga */}
      {loading && (
        <div className="space-y-6" aria-hidden>
          <Skeleton.Card rows={4} />
          <Skeleton.Card rows={3} />
        </div>
      )}

      {/* Contenido real */}
      {!loading && patient && (
        <>
          {/* Identificacion visual */}
          <div className="mb-6 flex items-center gap-4">
            <LargeInitialsAvatar
              first={patient.nombre}
              last={patient.apellido}
              sex={patient.sexo}
            />
            <div>
              <h3 className="font-display text-xl font-bold text-white">{name}</h3>
              <p className="mt-0.5 text-sm text-clinical-400">
                {patient.documento_tipo?.toUpperCase() ?? 'DOC'}: {patient.documento ?? '-'}
              </p>
            </div>
          </div>

          {/* Datos demograficos */}
          <DrawerSection title="Datos demograficos">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <DrawerField label="Fecha de nacimiento"
                value={fmtDate(patient.fecha_nacimiento)} />
              <DrawerField label="Edad"
                value={calcAge(patient.fecha_nacimiento) !== null
                  ? `${calcAge(patient.fecha_nacimiento)} anos` : null} />
              <DrawerField label="Sexo"
                value={patient.sexo === 'F' ? 'Femenino'
                  : patient.sexo === 'M' ? 'Masculino'
                  : patient.sexo === 'O' ? 'Otro' : null} />
            </dl>
          </DrawerSection>

          {/* Contacto */}
          <DrawerSection title="Contacto">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <DrawerField label="Telefono"  value={patient.telefono} />
              <DrawerField label="Correo"    value={patient.email} />
              <DrawerField label="Ciudad"    value={patient.ciudad} />
              <DrawerField label="Direccion" value={patient.direccion} span />
            </dl>
          </DrawerSection>

          {/* Alergias */}
          {patient.alergias?.length > 0 && (
            <DrawerSection title="Alergias conocidas">
              <div className="flex flex-wrap gap-2">
                {patient.alergias.map(a => (
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

          {/* Notas clinicas */}
          {patient.notas && (
            <DrawerSection title="Notas">
              <p className="rounded-xl border border-white/[0.06] bg-white/[0.03]
                            px-4 py-3 text-sm leading-relaxed text-clinical-300">
                {patient.notas}
              </p>
            </DrawerSection>
          )}
        </>
      )}
    </Drawer>
  );
}

/* ── Avatar grande de iniciales ─────────────────────────────────── */
function LargeInitialsAvatar({ first = '', last = '', sex }) {
  const initials = `${first[0] ?? ''}${(last ?? '')[0] ?? ''}`.toUpperCase();
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

/* ── Helpers ─────────────────────────────────────────────────────── */
function calcAge(dob) {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000*60*60*24*365.25));
}

function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}
