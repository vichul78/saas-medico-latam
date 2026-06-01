import { useState, useEffect, useCallback } from 'react';
import { useShareInforme } from '@/hooks/useShareInforme.js';

/**
 * SendWhatsAppModal — modal para enviar un informe firmado via WhatsApp.
 *
 * Props:
 *   open     : boolean
 *   onClose  : fn
 *   informe  : { id, texto, estado }
 *   paciente : { nombre, apellido, telefono }
 */
export default function SendWhatsAppModal({ open, onClose, informe, paciente }) {
  const { loading, error, data, sendWhatsApp, reset } = useShareInforme();

  const [phone, setPhone]     = useState('');
  const [summary, setSummary] = useState('');

  // Pre-fill when modal opens
  useEffect(() => {
    if (open) {
      setPhone(paciente?.telefono || '');
      const texto = informe?.texto || '';
      setSummary(texto.length > 200 ? texto.slice(0, 200) : texto);
      reset();
    }
  }, [open, paciente, informe, reset]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const handleSend = useCallback(async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    const patientName = `${paciente?.nombre || ''} ${paciente?.apellido || ''}`.trim();
    await sendWhatsApp(informe.id, phone.trim(), patientName, summary.trim());
  }, [phone, summary, paciente, informe, sendWhatsApp]);

  if (!open) return null;

  const isSuccess = data?.success;

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
                Se generara un enlace temporal (24 horas)
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

        {/* Body */}
        <div className="px-6 py-5">
          {isSuccess ? (
            /* Success state */
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-electric-500/30
                              bg-electric-500/[0.08] p-4">
                <CheckCircleIcon />
                <div>
                  <p className="text-sm font-semibold text-white">Mensaje enviado correctamente</p>
                  <p className="text-xs text-clinical-400 mt-0.5">
                    El paciente recibira el enlace en su WhatsApp
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-clinical-800/50 p-4">
                <p className="text-xs font-medium text-clinical-400 mb-2">Enlace generado:</p>
                <p className="text-sm text-electric-300 font-mono break-all">
                  {data.share_url}
                </p>
              </div>

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
          ) : (
            /* Form state */
            <form onSubmit={handleSend} className="space-y-4">
              {/* Patient name (read-only) */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-clinical-400">Paciente</span>
                <input
                  type="text"
                  readOnly
                  value={`${paciente?.nombre || ''} ${paciente?.apellido || ''}`.trim()}
                  className="modal-input opacity-70 cursor-not-allowed"
                />
              </label>

              {/* Phone */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-clinical-400">
                  Telefono WhatsApp (con codigo de pais)
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="5215512345678"
                  className="modal-input"
                  required
                />
                <span className="text-[10px] text-clinical-500">
                  Ejemplo: 5215512345678 (Mexico) o 573001234567 (Colombia)
                </span>
              </label>

              {/* Summary */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-clinical-400">
                  Resumen del informe (se incluye en el mensaje)
                </span>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Resumen breve del resultado..."
                  className="modal-input resize-none"
                  maxLength={500}
                />
                <span className="text-[10px] text-clinical-500">
                  {summary.length}/500 caracteres
                </span>
              </label>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-400/30
                                bg-red-400/10 px-4 py-3 text-sm text-red-300">
                  <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-white/[0.07] pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/[0.09] px-4 py-2 text-sm
                             text-clinical-400 transition hover:text-clinical-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !phone.trim()}
                  className="flex items-center gap-2 rounded-xl bg-electric-gradient px-5 py-2.5
                             text-sm font-semibold text-white
                             shadow-[0_4px_20px_-6px_rgba(122,34,255,0.55)]
                             transition hover:brightness-110 disabled:opacity-50"
                >
                  {loading ? <SpinIcon /> : <SendIcon />}
                  {loading ? 'Enviando...' : 'Enviar por WhatsApp'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* -- Micro-iconos -- */
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
    <svg className="h-6 w-6 text-electric-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
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
