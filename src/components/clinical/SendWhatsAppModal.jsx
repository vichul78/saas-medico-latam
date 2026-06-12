import { useState, useEffect, useCallback } from 'react';
import { useShareInforme } from '@/hooks/useShareInforme.js';
import { useHistorialEnvios } from '@/hooks/useHistorialEnvios.js';
import { generateReportPdf as generarPDFInforme } from '@/lib/reportPdf.js';

/**
 * SendWhatsAppModal v2 — modal mejorado para enviar informe firmado via WhatsApp.
 *
 * Mejoras vs v1:
 *   - Preview del mensaje antes de enviar
 *   - Teléfono editable con validación visual
 *   - Resumen editable (hasta 500 chars)
 *   - Checkbox: incluir link al PDF del informe
 *   - Historial de últimos 5 envíos a este paciente
 *   - Contador de caracteres
 *   - Estado: pendiente → éxito / error
 *
 * Props:
 *   open     : boolean
 *   onClose  : fn
 *   informe  : { id, texto, estado, estudios: { tipo, fecha, pacientes: { nombre, apellido, telefono } } }
 *   paciente : { nombre, apellido, telefono }
 */
export default function SendWhatsAppModal({ open, onClose, informe, paciente }) {
  const { loading, error, data, sendWhatsApp, reset } = useShareInforme();
  const { historial, loadingHistorial } = useHistorialEnvios(informe?.id, open);

  const [phone, setPhone]           = useState('');
  const [summary, setSummary]       = useState('');
  const [incluirPDF, setIncluirPDF] = useState(false);
  const [tab, setTab]               = useState('form'); // 'form' | 'preview' | 'historial'
  const [phoneError, setPhoneError] = useState('');

  // Pre-fill al abrir
  useEffect(() => {
    if (open) {
      setPhone(paciente?.telefono || '');
      const texto = informe?.texto || '';
      setSummary(texto.length > 300 ? texto.slice(0, 300) : texto);
      setIncluirPDF(false);
      setPhoneError('');
      setTab('form');
      reset();
    }
  }, [open, paciente, informe, reset]);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Validar teléfono en tiempo real
  const handlePhoneChange = (val) => {
    setPhone(val);
    const digits = val.replace(/\D/g, '');
    if (digits.length > 0 && digits.length < 10) {
      setPhoneError('Debe tener al menos 10 dígitos con código de país');
    } else {
      setPhoneError('');
    }
  };

  // Construir preview del mensaje
  const buildPreview = () => {
    const nombre = `${paciente?.nombre || ''} ${paciente?.apellido || ''}`.trim();
    const tipoEstudio = informe?.estudios?.tipo || 'Estudio médico';
    const fecha = informe?.estudios?.fecha
      ? new Date(informe.estudios.fecha).toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' })
      : '';
    return [
      `Hola ${nombre},`,
      ``,
      `Sus resultados de *${tipoEstudio}*${fecha ? ` del ${fecha}` : ''} están disponibles.`,
      ``,
      summary ? `*Resumen:* ${summary}` : '',
      ``,
      `🔗 Acceda a su informe completo aquí:`,
      `[ENLACE TEMPORAL — 24 horas]`,
      incluirPDF ? `📄 El PDF adjunto también está disponible en el enlace.` : '',
    ].filter(l => l !== undefined).join('\n').replace(/\n{3,}/g, '\n\n');
  };

  const handleSend = useCallback(async (e) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setPhoneError('Ingresa un número de WhatsApp válido con código de país.');
      return;
    }
    const patientName = `${paciente?.nombre || ''} ${paciente?.apellido || ''}`.trim();
    await sendWhatsApp(informe.id, phone.trim(), patientName, summary.trim());
  }, [phone, summary, paciente, informe, sendWhatsApp]);

  if (!open) return null;

  const isSuccess = data?.success;
  const pacienteNombre = `${paciente?.nombre || ''} ${paciente?.apellido || ''}`.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/70 backdrop-blur-sm px-4 py-8 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.08]
                      bg-clinical-900 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.8)]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
          <div className="flex items-center gap-3">
            <WhatsAppIcon />
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                Enviar resultado por WhatsApp
              </h2>
              <p className="text-xs text-clinical-400">
                Enlace temporal · 24 horas de acceso
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg
                       border border-white/[0.08] text-clinical-500
                       transition hover:border-electric-500/40 hover:text-electric-400"
          >
            <XIcon />
          </button>
        </div>
        <div className="h-px w-full bg-electric-gradient opacity-60" />

        {/* Tabs (solo en estado form) */}
        {!isSuccess && (
          <div className="flex border-b border-white/[0.07]">
            {[
              { id: 'form',      label: 'Mensaje' },
              { id: 'preview',   label: 'Preview' },
              { id: 'historial', label: `Historial${historial.length ? ` (${historial.length})` : ''}` },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-5 py-2.5 text-xs font-medium transition border-b-2
                  ${tab === t.id
                    ? 'border-electric-400 text-electric-300'
                    : 'border-transparent text-clinical-500 hover:text-clinical-300'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">

          {/* ── SUCCESS ── */}
          {isSuccess && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30
                              bg-emerald-500/[0.08] p-4">
                <CheckCircleIcon />
                <div>
                  <p className="text-sm font-semibold text-white">¡Mensaje enviado correctamente!</p>
                  <p className="text-xs text-clinical-400 mt-0.5">
                    {pacienteNombre} recibirá el enlace en su WhatsApp
                  </p>
                </div>
              </div>
              {data?.share_url && (
                <div className="rounded-xl border border-white/[0.07] bg-clinical-800/50 p-4 space-y-1">
                  <p className="text-xs font-medium text-clinical-400">Enlace generado:</p>
                  <p className="text-sm text-electric-300 font-mono break-all">{data.share_url}</p>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(data.share_url)}
                    className="mt-1 text-[11px] text-electric-400 hover:text-electric-300 underline"
                  >
                    Copiar enlace
                  </button>
                </div>
              )}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-electric-gradient px-5 py-2.5
                             text-sm font-semibold text-white
                             shadow-[0_4px_20px_-6px_rgba(122,34,255,0.55)]
                             transition hover:brightness-110"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {/* ── TAB: FORM ── */}
          {!isSuccess && tab === 'form' && (
            <form onSubmit={handleSend} className="space-y-4">

              {/* Paciente (readonly) */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-clinical-400">Paciente</span>
                <input
                  type="text"
                  readOnly
                  value={pacienteNombre}
                  className="modal-input opacity-60 cursor-not-allowed"
                />
              </label>

              {/* Teléfono editable */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-clinical-400">
                  Teléfono WhatsApp <span className="text-electric-400">*</span>
                </span>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-clinical-500 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="5930912345678"
                    className={`modal-input pl-9 ${phoneError ? 'border-red-400/50 focus:border-red-400' : ''}`}
                    required
                  />
                </div>
                {phoneError ? (
                  <span className="text-[10px] text-red-400">{phoneError}</span>
                ) : (
                  <span className="text-[10px] text-clinical-500">
                    Con código de país: Ecuador +593 · México +52 · Colombia +57
                  </span>
                )}
              </label>

              {/* Resumen editable */}
              <label className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-clinical-400">
                    Resumen del informe
                  </span>
                  <span className={`text-[10px] ${summary.length > 450 ? 'text-amber-400' : 'text-clinical-500'}`}>
                    {summary.length}/500
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Resumen del resultado para incluir en el mensaje..."
                  className="modal-input resize-none"
                  maxLength={500}
                />
                <span className="text-[10px] text-clinical-500">
                  Este texto aparecerá en el cuerpo del WhatsApp junto al enlace.
                </span>
              </label>

              {/* Checkbox: incluir PDF */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center
                                rounded border border-white/[0.15] bg-white/[0.05]
                                transition group-hover:border-electric-400/50">
                  <input
                    type="checkbox"
                    checked={incluirPDF}
                    onChange={(e) => setIncluirPDF(e.target.checked)}
                    className="sr-only"
                  />
                  {incluirPDF && (
                    <svg className="h-3 w-3 text-electric-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-clinical-300">Mencionar PDF en el mensaje</p>
                  <p className="text-[10px] text-clinical-500 mt-0.5">
                    El paciente podrá descargar el PDF desde el enlace compartido
                  </p>
                </div>
              </label>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-400/30
                                bg-red-400/10 px-4 py-3 text-sm text-red-300">
                  <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Acciones */}
              <div className="flex justify-end gap-3 border-t border-white/[0.07] pt-4">
                <button
                  type="button"
                  onClick={() => setTab('preview')}
                  className="rounded-xl border border-white/[0.09] px-4 py-2 text-sm
                             text-clinical-400 transition hover:text-clinical-200 hover:border-white/20"
                >
                  Ver preview
                </button>
                <button
                  type="submit"
                  disabled={loading || !!phoneError || !phone.trim()}
                  className="flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1ebe5a]
                             px-5 py-2.5 text-sm font-semibold text-white
                             transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <SpinIcon /> : <SendIcon />}
                  {loading ? 'Enviando...' : 'Enviar por WhatsApp'}
                </button>
              </div>
            </form>
          )}

          {/* ── TAB: PREVIEW ── */}
          {!isSuccess && tab === 'preview' && (
            <div className="space-y-4">
              <p className="text-xs text-clinical-400">
                Así verá el paciente el mensaje en WhatsApp:
              </p>

              {/* Burbuja estilo WhatsApp */}
              <div className="rounded-2xl rounded-tl-none bg-white/[0.06] border border-white/[0.08] p-4 max-w-sm">
                <div className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                  {buildPreview()}
                </div>
                <p className="mt-2 text-[10px] text-clinical-500 text-right">
                  {new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-xs text-clinical-400">
                <p><span className="text-clinical-300 font-medium">Para:</span> {phone || '(sin teléfono)'}</p>
                <p><span className="text-clinical-300 font-medium">Incluye PDF:</span> {incluirPDF ? 'Sí' : 'No'}</p>
                <p><span className="text-clinical-300 font-medium">Expira en:</span> 24 horas</p>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/[0.07] pt-4">
                <button
                  type="button"
                  onClick={() => setTab('form')}
                  className="rounded-xl border border-white/[0.09] px-4 py-2 text-sm
                             text-clinical-400 transition hover:text-clinical-200"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={(e) => { setTab('form'); handleSend(e); }}
                  disabled={loading || !!phoneError || !phone.trim()}
                  className="flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1ebe5a]
                             px-5 py-2.5 text-sm font-semibold text-white
                             transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <SpinIcon /> : <SendIcon />}
                  Confirmar y Enviar
                </button>
              </div>
            </div>
          )}

          {/* ── TAB: HISTORIAL ── */}
          {!isSuccess && tab === 'historial' && (
            <div className="space-y-3">
              <p className="text-xs text-clinical-400">Últimos envíos de este informe:</p>

              {loadingHistorial ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-white/[0.04]" />
                  ))}
                </div>
              ) : historial.length === 0 ? (
                <div className="py-8 text-center text-sm text-clinical-500">
                  No hay envíos anteriores registrados.
                </div>
              ) : (
                <div className="space-y-2">
                  {historial.map((h) => (
                    <div key={h.id} className="flex items-center justify-between rounded-xl
                                               border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                      <div>
                        <p className="text-sm text-white">
                          {h.metadata?.patient_phone || '—'}
                        </p>
                        <p className="text-[10px] text-clinical-500 mt-0.5">
                          {h.created_at
                            ? new Date(h.created_at).toLocaleString('es', {
                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                              })
                            : '—'}
                        </p>
                      </div>
                      <div className="text-right">
                        {h.accessed_at ? (
                          <span className="inline-flex items-center gap-1 rounded-full border
                                           border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5
                                           text-[10px] font-medium text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Visto
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border
                                           border-amber-400/30 bg-amber-400/10 px-2 py-0.5
                                           text-[10px] font-medium text-amber-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            Sin abrir
                          </span>
                        )}
                        <p className="text-[10px] text-clinical-600 mt-1">
                          {new Date(h.expires_at) > new Date() ? 'Activo' : 'Expirado'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end border-t border-white/[0.07] pt-4">
                <button
                  type="button"
                  onClick={() => setTab('form')}
                  className="rounded-xl bg-electric-gradient px-5 py-2.5
                             text-sm font-semibold text-white
                             shadow-[0_4px_20px_-6px_rgba(122,34,255,0.55)]
                             transition hover:brightness-110"
                >
                  Nuevo envío
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Micro-iconos ── */
function XIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg className="h-7 w-7 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
function CheckCircleIcon() {
  return (
    <svg className="h-6 w-6 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
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
function SpinIcon() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
function PhoneIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}
