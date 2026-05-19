export default function Footer() {
  return (
    <footer className="mt-auto border-t border-clinical-200 bg-white">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col items-start justify-between gap-4 px-4 py-6 text-sm text-clinical-500 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <p>
          © {new Date().getFullYear()}{' '}
          <span className="font-semibold text-clinical-700">MediCo LatAm</span>. Plataforma
          clínica regional para Latinoamérica.
        </p>
        <p className="text-xs">
          Cumplimiento{' '}
          <span className="badge-violet">HIPAA</span>{' '}
          <span className="badge-violet ml-1">LGPD</span>{' '}
          <span className="badge-violet ml-1">LFPDPPP</span>
        </p>
      </div>
    </footer>
  );
}
