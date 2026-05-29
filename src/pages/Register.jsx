import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signUp } from '@/lib/supabaseClient.js';
import { useAuth } from '@/hooks/useAuth.js';
import Logo from '@/components/brand/Logo.jsx';

/*
  ┌──────────────────────────────────────────────────────────────┐
  │  REGISTER — Alta de cuenta, modo oscuro clínico              │
  │  Reglas visuales (espejo de Login):                          │
  │    • Fondo: deep-space clínico (clinical-900)               │
  │    • Acentos: Púrpura Eléctrico (#7A22FF) y Violeta          │
  │    • Logo prominente arriba · CERO tonos verdes              │
  │  Flujo:                                                      │
  │    1. signUp() crea el usuario en Supabase Auth.            │
  │    2. El trigger handle_new_usuario crea la fila en          │
  │       `usuarios` (rol + clinica_id) leyendo la metadata.    │
  │    3a. Si la confirmación de email está DESACTIVADA →       │
  │        Supabase devuelve session → AuthContext redirige.    │
  │    3b. Si está ACTIVADA → no hay session → mostramos aviso  │
  │        "revisa tu correo".                                   │
  └──────────────────────────────────────────────────────────────┘
*/

const ROLE_HOME = {
  admin_clinica: '/dashboard/admin',
  medico:        '/dashboard/medico',
  paciente:      '/dashboard/paciente',
};

const ROLE_OPTIONS = [
  { value: 'paciente',      label: 'Paciente' },
  { value: 'medico',        label: 'Médico / Profesional' },
  { value: 'admin_clinica', label: 'Administrador de clínica' },
];

export default function Register() {
  const { isAuthenticated, role, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [roleSel,   setRoleSel]   = useState('paciente');
  const [clinicaSlug, setClinicaSlug] = useState('');

  const [error,      setError]      = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  // Si ya hay sesión activa, redirige al dashboard del rol.
  useEffect(() => {
    if (!loading && isAuthenticated && role) {
      const from = location.state?.from?.pathname ?? ROLE_HOME[role] ?? '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, role, loading, navigate, location]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setSubmitting(true);

    const { data, error: signErr } = await signUp({
      email,
      password,
      firstName,
      lastName,
      role: roleSel,
      organizationSlug: clinicaSlug.trim() || null,
    });

    if (signErr) {
      // Híbrido: error original EN a consola; mensaje ES clínico a la UI.
      // eslint-disable-next-line no-console
      console.error(
        '[Register] signUp — Supabase error (original EN):',
        { code: signErr.code, message: signErr.message, status: signErr.status },
      );
      setError(friendlyError(signErr.message));
      setSubmitting(false);
      return;
    }

    // Sin sesión → Supabase requiere confirmación por email.
    if (!data?.session) {
      setConfirmSent(true);
      setSubmitting(false);
      return;
    }

    // Con sesión → onAuthChange en AuthContext disparará la redirección
    // a través del useEffect de arriba. Dejamos el spinner activo.
  }

  if (loading) return <FullScreenSpinner />;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-clinical-900 px-4 py-12">

      {/* ── Destellos de fondo decorativos ── */}
      <Glow className="absolute -left-40 -top-40 h-[520px] w-[520px] bg-electric-500 opacity-[0.12]" />
      <Glow className="absolute -bottom-32 -right-32 h-[400px] w-[400px] bg-violet-500 opacity-[0.10]" />
      <Glow className="absolute left-1/2 top-1/3 h-[260px] w-[260px] -translate-x-1/2 bg-electric-700 opacity-[0.07]" />

      <div className="relative z-10 w-full max-w-md">

        {/* LOGO */}
        <div className="mb-8 flex flex-col items-center gap-5">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-electric-gradient p-3 shadow-[0_0_60px_-10px_rgba(122,34,255,0.55)]">
            <Logo className="h-full w-full" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold tracking-tight text-white">
              MediCo<span className="text-electric-400"> LatAm</span>
            </h1>
            <p className="mt-1.5 text-sm font-medium tracking-[0.15em] text-clinical-400 uppercase">
              Crea tu cuenta clínica
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] px-8 py-9 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.7)] backdrop-blur-sm">

          {confirmSent ? (
            /* ── Estado: confirmación enviada ── */
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-electric-500/40 bg-electric-500/10">
                <MailIcon className="h-6 w-6 text-electric-400" />
              </div>
              <h2 className="font-display text-xl font-semibold text-white">
                Revisa tu correo
              </h2>
              <p className="text-sm text-clinical-400">
                Enviamos un enlace de confirmación a{' '}
                <span className="font-semibold text-clinical-200">{email}</span>.
                Confírmalo para activar tu cuenta e iniciar sesión.
              </p>
              <Link
                to="/login"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-electric-gradient py-3 text-sm font-semibold text-white shadow-[0_8px_28px_-8px_rgba(122,34,255,0.6)] transition hover:brightness-110"
              >
                Ir a iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h2 className="font-display text-xl font-semibold text-white">
                  Registro
                </h2>
                <p className="mt-1 text-sm text-clinical-400">
                  Completa tus datos para crear tu cuenta.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">

                {/* Nombre + Apellido */}
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    id="firstName"
                    label="Nombre"
                    type="text"
                    autoComplete="given-name"
                    placeholder="María"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                  />
                  <Field
                    id="lastName"
                    label="Apellido"
                    type="text"
                    autoComplete="family-name"
                    placeholder="García"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                  />
                </div>

                {/* Email */}
                <Field
                  id="email"
                  label="Correo electrónico"
                  type="email"
                  autoComplete="email"
                  placeholder="usuario@clinica.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-clinical-300">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPwd ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="dark-input w-full pr-11"
                    />
                    <button
                      type="button"
                      aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-clinical-500 transition hover:text-clinical-300"
                    >
                      {showPwd ? <EyeOff /> : <EyeOn />}
                    </button>
                  </div>
                </div>

                {/* Rol */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="role" className="text-sm font-medium text-clinical-300">
                    Tipo de cuenta
                  </label>
                  <select
                    id="role"
                    value={roleSel}
                    onChange={e => setRoleSel(e.target.value)}
                    className="dark-input w-full"
                  >
                    {ROLE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Clínica (opcional) */}
                <Field
                  id="clinicaSlug"
                  label="Clínica (opcional)"
                  type="text"
                  autoComplete="off"
                  placeholder="demo-mx"
                  value={clinicaSlug}
                  onChange={e => setClinicaSlug(e.target.value)}
                />
                <p className="-mt-2 text-[11px] leading-relaxed text-clinical-500">
                  Identificador (slug) de tu clínica. Si lo dejas vacío, se te
                  asignará la clínica por defecto.
                </p>

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-xl border border-status-danger/30 bg-status-danger/10 px-4 py-3 text-sm text-status-danger"
                  >
                    <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || !email || !password || !firstName || !lastName}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-electric-gradient py-3 text-sm font-semibold text-white shadow-[0_8px_28px_-8px_rgba(122,34,255,0.6)] transition hover:brightness-110 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400"
                >
                  {submitting ? <Spinner /> : 'Crear cuenta'}
                </button>
              </form>

              {/* Pie del formulario */}
              <div className="mt-7 flex items-center justify-between border-t border-white/[0.07] pt-6 text-xs text-clinical-500">
                <Link to="/login" className="transition hover:text-electric-400">
                  ¿Ya tienes cuenta? Inicia sesión
                </Link>
                <span className="flex items-center gap-1.5">
                  <LockIcon className="h-3 w-3" />
                  Conexión cifrada TLS
                </span>
              </div>
            </>
          )}
        </div>

        {/* Badges de cumplimiento */}
        <div className="mt-6 flex justify-center gap-3">
          {['HIPAA', 'LGPD', 'LFPDPPP'].map(b => (
            <span
              key={b}
              className="rounded-full border border-violet-700/40 bg-violet-900/30 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-400"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sub-componentes internos
// ─────────────────────────────────────────────

function Field({ id, label, type, autoComplete, placeholder, value, onChange, required, minLength }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-clinical-300">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        className="dark-input w-full"
      />
    </div>
  );
}

function Glow({ className }) {
  return (
    <div aria-hidden className={`pointer-events-none rounded-full blur-[120px] ${className}`} />
  );
}

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-clinical-900">
      <Spinner className="h-8 w-8 text-electric-500" />
    </div>
  );
}

function Spinner({ className = 'h-5 w-5 text-white' }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function EyeOn() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-4.477 0-8.268-2.943-9.542-7a10.016 10.016 0 012.34-3.874M6.53 6.53A9.955 9.955 0 0112 5c4.477 0 8.268 2.943 9.542 7a10.02 10.02 0 01-4.293 5.411M3 3l18 18" />
    </svg>
  );
}

function AlertIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}

function LockIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function MailIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6" />
    </svg>
  );
}

// Traduce mensajes de Supabase Auth (signUp) a español clínico.
function friendlyError(msg = '') {
  const m = msg.toLowerCase();
  if (m.includes('already registered') || m.includes('already been registered') || m.includes('user already'))
    return 'Ya existe una cuenta con este correo. Inicia sesión.';
  if (m.includes('password') && m.includes('6'))
    return 'La contraseña debe tener al menos 6 caracteres.';
  if (m.includes('valid email') || m.includes('invalid email') || m.includes('unable to validate email'))
    return 'Ingresa un correo electrónico válido.';
  if (m.includes('signup') && m.includes('disabled'))
    return 'El registro está deshabilitado temporalmente. Contacta al administrador.';
  if (m.includes('network') || m.includes('fetch'))
    return 'Error de conexión. Verifica tu red e inténtalo de nuevo.';
  return 'No se pudo crear la cuenta. Inténtalo de nuevo o contacta al administrador.';
}
