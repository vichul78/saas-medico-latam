import PageShell from '@/components/common/PageShell.jsx';

export default function Contratar() {
  return (
    <PageShell
      eyebrow="Adicionales"
      title="Contratar"
      description="Activa tu organización en menos de 24 horas. Cotización en moneda local y onboarding clínico incluido."
    >
      <form className="grid gap-4 sm:grid-cols-2">
        <Field label="Organización" name="org" placeholder="Hospital, clínica o consultorio" />
        <Field label="País" name="country" placeholder="México, Brasil, Argentina…" />
        <Field label="Email de contacto" name="email" type="email" placeholder="contacto@clinica.com" />
        <Field label="Especialidad principal" name="specialty" placeholder="Radiología, Dental…" />
        <div className="sm:col-span-2">
          <button type="button" className="btn-primary">
            Solicitar contacto
          </button>
        </div>
      </form>
    </PageShell>
  );
}

function Field({ label, name, type = 'text', placeholder }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-clinical-700">{label}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className="rounded-md border border-clinical-200 bg-white px-3 py-2 text-sm text-clinical-800 placeholder:text-clinical-400 focus:border-electric-400 focus:outline-none focus:ring-2 focus:ring-electric-100"
      />
    </label>
  );
}
