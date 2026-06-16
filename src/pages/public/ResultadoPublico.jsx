import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient.js';
import DicomViewportPublic from '@/components/dicom/DicomViewportPublic.jsx';

/**
 * ResultadoPublico — página pública para resultados compartidos vía token.
 *
 * Ruta: /resultado/:token
 * Diseño estilo Apple: blanco limpio / azul / negro. Sin login requerido.
 *
 * Secciones:
 *  1. Header clínica (logo + nombre)
 *  2. Hero: datos del paciente + estudio
 *  3. Visor DICOM (si hay archivo)
 *  4. Informe médico
 *  5. Footer con expiración + botón imprimir
 */
export default function ResultadoPublico() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(false);
  const [tab, setTab]         = useState('informe'); // 'informe' | 'imagenes'

  useEffect(() => {
    if (!token) { setError(true); setLoading(false); return; }

    supabase
      .rpc('get_shared_informe', { p_token: token })
      .then(({ data, error: rpcError }) => {
        if (rpcError || !data || data.length === 0) {
          setError(true);
        } else {
          const r = Array.isArray(data) ? data[0] : data;
          setResult(r);
          // Si hay imagen DICOM, abrir pestaña imagenes por defecto
          if (r.archivo_dicom_url) setTab('imagenes');
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  /* ────── Loading ────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-[3px] border-[#0071e3]/20" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent
                          border-t-[#0071e3] animate-spin" />
        </div>
        <p className="text-[15px] text-gray-400 font-medium">Cargando resultado…</p>
      </div>
    );
  }

  /* ────── Error / expirado ────── */
  if (error || !result) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          {/* Icono */}
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="h-10 w-10 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight mb-2">
            Enlace expirado o inválido
          </h1>
          <p className="text-[15px] text-gray-500 leading-relaxed">
            Este enlace ya no está disponible. Los resultados expiran pasadas
            24 horas por seguridad. Solicita un nuevo enlace a tu clínica.
          </p>
        </div>
      </div>
    );
  }

  /* ────── Helpers ────── */
  const nombrePaciente = `${result.paciente_nombre ?? ''} ${result.paciente_apellido ?? ''}`.trim();
  const fechaEstudio   = result.estudio_fecha
    ? new Date(result.estudio_fecha).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const fechaExpira = result.expires_at
    ? new Date(result.expires_at).toLocaleString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null;
  const tieneDicom = Boolean(result.archivo_dicom_url || result.estudio_id);

  /* ────── Render ────── */
  return (
    <div className="min-h-screen bg-[#f5f5f7] font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','Segoe_UI',sans-serif]">

      {/* ══════════════════════════════════════════════
          HEADER CLÍNICA
      ══════════════════════════════════════════════ */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo / nombre clínica */}
          <div className="flex items-center gap-3">
            {result.clinica_logo_url ? (
              <img src={result.clinica_logo_url} alt={result.clinica_nombre}
                   className="h-7 w-auto object-contain" />
            ) : (
              <div className="h-7 w-7 rounded-lg bg-[#0071e3] flex items-center justify-center">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                </svg>
              </div>
            )}
            <span className="text-[15px] font-semibold text-gray-900 tracking-tight">
              {result.clinica_nombre ?? 'Clínica'}
            </span>
          </div>

          {/* Badge "Resultado oficial" */}
          <span className="flex items-center gap-1.5 text-[12px] text-[#1d8a4e] font-medium">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            Resultado oficial
          </span>
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          HERO — datos del paciente
      ══════════════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-200/60">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Tipo de estudio (eyebrow) */}
          <p className="text-[13px] font-medium text-[#0071e3] tracking-wide uppercase mb-2">
            {result.estudio_tipo ?? 'Estudio médico'}
          </p>

          {/* Nombre paciente */}
          <h1 className="text-[28px] sm:text-[34px] font-semibold text-gray-900 tracking-tight leading-tight mb-5">
            {nombrePaciente}
          </h1>

          {/* Grid de metadatos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {fechaEstudio && (
              <MetaCard icon={<CalendarIcon />} label="Fecha del estudio" value={fechaEstudio} />
            )}
            {result.medico_nombre && (
              <MetaCard icon={<DoctorIcon />} label="Médico tratante" value={result.medico_nombre} />
            )}
            <MetaCard icon={<StatusIcon />} label="Estado" value="Firmado"
                      valueClass="text-[#1d8a4e] font-semibold" />
            {tieneDicom && (
              <MetaCard icon={<DicomIcon />} label="Imágenes" value="Incluidas"
                        valueClass="text-[#0071e3] font-semibold" />
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TABS (si hay DICOM)
      ══════════════════════════════════════════════ */}
      {tieneDicom && (
        <div className="bg-white border-b border-gray-200/60">
          <div className="max-w-3xl mx-auto px-6">
            <nav className="flex gap-1" role="tablist">
              {[
                { id: 'imagenes', label: 'Imágenes DICOM', icon: <DicomIcon /> },
                { id: 'informe',  label: 'Informe médico', icon: <DocIcon /> },
              ].map(t => (
                <button key={t.id}
                        role="tab"
                        aria-selected={tab === t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-[14px] font-medium
                                    border-b-2 transition-colors
                                    ${tab === t.id
                                      ? 'border-[#0071e3] text-[#0071e3]'
                                      : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                  <span className="w-4 h-4">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          CONTENIDO PRINCIPAL
      ══════════════════════════════════════════════ */}
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* ── Pestaña DICOM ── */}
        {tieneDicom && tab === 'imagenes' && (
          <section>
            <div className="mb-4">
              <h2 className="text-[17px] font-semibold text-gray-900">Imágenes del estudio</h2>
              <p className="text-[13px] text-gray-400 mt-0.5">
                Arrastra para mover · Rueda para navegar cortes · Ctrl+Rueda para zoom
              </p>
            </div>
            <DicomViewportPublic
              study={{
                tipo:             result.estudio_tipo,
                fecha:            result.estudio_fecha,
                archivo_dicom_url: result.archivo_dicom_url,
                paciente_nombre:  result.paciente_nombre,
                paciente_apellido: result.paciente_apellido,
              }}
            />
            {/* Aclaración técnica */}
            <div className="mt-3 flex items-start gap-2">
              <svg className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
              <p className="text-[12px] text-gray-400 leading-relaxed">
                Estas imágenes son de carácter médico. La interpretación debe realizarse
                por un profesional de la salud. Para descarga en formato DICOM contáctese
                con su clínica.
              </p>
            </div>
          </section>
        )}

        {/* ── Pestaña Informe ── */}
        {(!tieneDicom || tab === 'informe') && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[17px] font-semibold text-gray-900">Informe médico</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1
                               bg-[#f0f9f4] text-[#1d8a4e] text-[12px] font-medium">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                Firmado digitalmente
              </span>
            </div>

            {/* Cuerpo del informe */}
            <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden">
              {/* Firma del médico */}
              {result.medico_nombre && (
                <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-100
                                flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-[#0071e3]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="h-5 w-5 text-[#0071e3]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800">{result.medico_nombre}</p>
                    <p className="text-[11px] text-gray-400">Médico responsable</p>
                  </div>
                </div>
              )}

              {/* Texto del informe */}
              <div className="px-6 py-6">
                <p className="text-[15px] text-gray-800 leading-[1.75] whitespace-pre-wrap">
                  {result.informe_texto ?? 'Sin contenido disponible.'}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── Botones de acción ── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl
                       bg-[#0071e3] hover:bg-[#0077ed] active:bg-[#006cdb]
                       text-white text-[15px] font-medium py-3.5 transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            Imprimir resultado
          </button>
          <button
            onClick={() => navigator.share?.({ title: 'Resultado médico', url: window.location.href })
                           || navigator.clipboard?.writeText(window.location.href)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl
                       bg-gray-100 hover:bg-gray-200 active:bg-gray-300
                       text-gray-800 text-[15px] font-medium py-3.5 transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
            </svg>
            Compartir enlace
          </button>
        </div>

      </main>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer className="border-t border-gray-200/60 bg-white mt-8">
        <div className="max-w-3xl mx-auto px-6 py-5 flex flex-col sm:flex-row
                        items-center justify-between gap-3">
          <p className="text-[12px] text-gray-400 text-center sm:text-left leading-relaxed">
            Este documento es una copia digital compartida con fines informativos.
            Consulte a su médico para la interpretación clínica.
          </p>
          {fechaExpira && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <svg className="h-3.5 w-3.5 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span className="text-[12px] text-amber-600 font-medium">
                Expira: {fechaExpira}
              </span>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

/* ── Meta card helper ── */
function MetaCard({ icon, label, value, valueClass = 'text-gray-800' }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-gray-400">
        <span className="w-3.5 h-3.5">{icon}</span>
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-[14px] font-medium ${valueClass}`}>{value}</p>
    </div>
  );
}

/* ── Micro icons ── */
function CalendarIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}
function DoctorIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}
function StatusIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
function DicomIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0Z" />
    </svg>
  );
}
function DocIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}
