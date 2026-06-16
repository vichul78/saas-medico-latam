import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase }   from '@/lib/supabaseClient.js';
import { useAuth }    from '@/hooks/useAuth.js';
import {
  CURRENCY_OPTIONS, TAX_PRESETS, getCurrencySymbol, calcTotal, formatCurrency,
} from '@/lib/currency.js';

/**
 * NewInvoiceModal — formulario completo para generar una nueva factura/cobro.
 *
 * Funcionalidades:
 *   • Selector de paciente con búsqueda ilike en Supabase
 *   • Selector de médico opcional
 *   • Líneas de ítems dinámicas (descripción, cantidad, precio unitario)
 *   • Moneda leída del tenant (organization.currency) con override manual
 *   • Presets de impuesto por país LatAm
 *   • Preview de subtotal, impuesto y total en tiempo real
 *   • Campos fiscales: CFDI UUID (MX), NFS-e (BR), número de factura manual
 *
 * REGLA: CERO verde. Estados de éxito → púrpura eléctrico / violeta.
 *
 * Props:
 *   onClose  : fn
 *   onCreate : fn(payload) → Promise<{ error }>
 *   orgCurrency : string — moneda del tenant
 */


const PAYMENT_METHODS = [
  { value: 'efectivo',        label: 'Efectivo' },
  { value: 'tarjeta_credito', label: 'Tarjeta de crédito' },
  { value: 'tarjeta_debito',  label: 'Tarjeta de débito' },
  { value: 'transferencia',   label: 'Transferencia bancaria' },
  { value: 'cheque',          label: 'Cheque' },
  { value: 'otro',            label: 'Otro' },
];

const STUDY_CATALOG = [
  'Radiografía de Tórax PA/Lateral',
  'Tomografía Computada de Tórax',
  'Resonancia Magnética de Cráneo',
  'Ecografía Abdominal',
  'Ecocardiograma',
  'Electrocardiograma (ECG)',
  'Audiometría Tonal y Vocal',
  'Espirometría Completa',
  'Colposcopia con Biopsia',
  'Fondo de Ojo',
  'Radiografía Panorámica Dental',
  'Ultrasonido Obstétrico',
  'Consulta General',
  'Honorarios Médicos',
  'Procedimiento Quirúrgico',
  'Otro',
];

function emptyItem() {
  return { id: Date.now(), description: '', qty: 1, unit_price: '' };
}

export default function NewInvoiceModal({ onClose, onCreate, orgCurrency = 'USD' }) {
  const { organization } = useAuth();
  const effectiveCurrency = orgCurrency || organization?.currency || 'USD';

  // ── Form state ───────────────────────────────────────────────────────────
  const [patientId,  setPatientId]  = useState('');
  const [doctorId,   setDoctorId]   = useState('');
  const [currency,   setCurrency]   = useState(effectiveCurrency);
  const [taxRate,    setTaxRate]    = useState(0);
  const [payMethod,  setPayMethod]  = useState('efectivo');
  const [status,     setStatus]     = useState('emitida');
  const [issuedAt,   setIssuedAt]   = useState(new Date().toISOString().slice(0, 10));
  const [dueAt,      setDueAt]      = useState('');
  const [invoiceNum, setInvoiceNum] = useState(`FAC-${Date.now().toString().slice(-6)}`);
  const [cfdiUuid,   setCfdiUuid]   = useState('');
  const [nfseNum,    setNfseNum]    = useState('');
  const [notes,      setNotes]      = useState('');
  const [items,      setItems]      = useState([emptyItem()]);
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState('');

  // ── Patient search ───────────────────────────────────────────────────────
  const [patQuery,    setPatQuery]    = useState('');
  const [patResults,  setPatResults]  = useState([]);
  const [selPatient,  setSelPatient]  = useState(null);
  const [patLoading,  setPatLoading]  = useState(false);
  const [patOpen,     setPatOpen]     = useState(false);
  const debounceRef  = useRef(null);
  const wrapRef      = useRef(null);

  useEffect(() => {
    function outside(e) { if (!wrapRef.current?.contains(e.target)) setPatOpen(false); }
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, []);

  const searchPatients = useCallback(async (term) => {
    if (!organization?.id || !term.trim()) { setPatResults([]); return; }
    setPatLoading(true);
    try {
      const like = `%${term.trim()}%`;
      const { data, error } = await supabase
        .from('pacientes')
        .select('id, nombre, apellido, documento')
        .eq('clinica_id', organization.id)
        .or(`nombre.ilike.${like},apellido.ilike.${like},documento.ilike.${like}`)
        .limit(7);
      if (error) {
        // eslint-disable-next-line no-console
        console.error('[NewInvoiceModal] patient search (EN):', error);
      }
      // Normaliza paciente(ES) → forma legacy(EN).
      setPatResults((data ?? []).map(p => ({
        id:          p.id,
        first_name:  p.nombre,
        last_name:   p.apellido,
        national_id: p.documento,
      })));
    } finally { setPatLoading(false); }
  }, [organization]);

  function handlePatQuery(val) {
    setPatQuery(val);
    setPatOpen(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPatients(val), 280);
  }

  function selectPatient(p) {
    setSelPatient(p);
    setPatientId(p.id);
    setPatQuery(`${p.first_name} ${p.last_name}`.trim());
    setPatResults([]);
    setPatOpen(false);
  }


  // ── Items CRUD ───────────────────────────────────────────────────────────
  function addItem()            { setItems(p => [...p, emptyItem()]); }
  function removeItem(id)       { setItems(p => p.filter(i => i.id !== id)); }
  function updateItem(id, k, v) { setItems(p => p.map(i => i.id === id ? { ...i, [k]: v } : i)); }

  // ── Totales en tiempo real ───────────────────────────────────────────────
  const subtotal = items.reduce((acc, i) => {
    const qty   = parseFloat(i.qty)        || 0;
    const price = parseFloat(i.unit_price) || 0;
    return acc + qty * price;
  }, 0);
  const taxAmount = subtotal * (taxRate || 0);
  const total     = subtotal + taxAmount;
  const sym       = getCurrencySymbol(currency);

  // ── Submit ───────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!patientId) { setApiError('Debes seleccionar un paciente.'); return; }
    if (items.every(i => !i.description || !i.unit_price)) {
      setApiError('Agrega al menos un ítem con descripción y precio.'); return;
    }
    setSubmitting(true);
    setApiError('');

    const payload = {
      patient_id: patientId,
      currency,
      total,                       // monto final (subtotal + impuesto)
      status,
      notes:      notes || null,
    };

    const { error } = await onCreate(payload);
    if (error) {
      setApiError('No se pudo guardar la factura. Verifica los datos e intenta de nuevo.');
    }
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
                    bg-black/70 backdrop-blur-sm px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-white/[0.08]
                      bg-clinical-900 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.8)]">

        {/* ── Cabecera ── */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">Nueva factura / cobro</h2>
            <p className="text-xs text-clinical-400">Completa los campos para registrar el cobro</p>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg
                       border border-white/[0.08] text-clinical-500
                       transition hover:border-electric-500/40 hover:text-electric-400">
            <XIcon />
          </button>
        </div>
        <div className="h-px w-full bg-electric-gradient opacity-60" />

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">

          {/* Número de factura + Estado */}
          <div className="grid grid-cols-2 gap-4">
            <MF label="N° de Factura *">
              <input required value={invoiceNum} onChange={e => setInvoiceNum(e.target.value)}
                placeholder="FAC-001" className="modal-input" />
            </MF>
            <MF label="Estado inicial">
              <select value={status} onChange={e => setStatus(e.target.value)} className="modal-input">
                <option value="borrador"  className="bg-clinical-900">Borrador</option>
                <option value="emitida"   className="bg-clinical-900">Emitida</option>
                <option value="pagada"    className="bg-clinical-900">Pagada</option>
              </select>
            </MF>
          </div>

          {/* Paciente — búsqueda Supabase */}
          <MF label="Paciente *">
            <div ref={wrapRef} className="relative">
              <input
                value={patQuery}
                onChange={e => handlePatQuery(e.target.value)}
                onFocus={() => patQuery && setPatOpen(true)}
                placeholder="Buscar por nombre o ID…"
                className="modal-input w-full"
                aria-label="Buscar paciente"
              />
              {patLoading && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  <SpinIcon />
                </span>
              )}
              {patOpen && patResults.length > 0 && (
                <ul className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden
                               rounded-xl border border-white/[0.09] bg-clinical-900
                               shadow-[0_16px_40px_-8px_rgba(0,0,0,0.8)]">
                  {patResults.map(p => (
                    <li key={p.id}>
                      <button type="button" onClick={() => selectPatient(p)}
                        className="flex w-full items-center gap-2.5 px-3 py-2.5
                                   text-left transition hover:bg-electric-500/10">
                        <PatInitials first={p.first_name} last={p.last_name} />
                        <div>
                          <p className="text-sm font-medium text-white">
                            {p.first_name} {p.last_name}
                          </p>
                          <p className="font-mono text-[10px] text-clinical-500">{p.national_id ?? '—'}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </MF>

          {/* Moneda + Impuesto */}
          <div className="grid grid-cols-2 gap-4">
            <MF label="Moneda">
              <select value={currency} onChange={e => setCurrency(e.target.value)} className="modal-input">
                {CURRENCY_OPTIONS.map(c => (
                  <option key={c.value} value={c.value} className="bg-clinical-900">{c.label}</option>
                ))}
              </select>
            </MF>
            <MF label="Impuesto">
              <select value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} className="modal-input">
                {TAX_PRESETS.map(t => (
                  <option key={t.label} value={t.rate} className="bg-clinical-900">{t.label}</option>
                ))}
              </select>
            </MF>
          </div>

          {/* ── Ítems de factura ── */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-electric-400">
                Conceptos / Ítems
              </p>
              <button type="button" onClick={addItem}
                className="flex items-center gap-1 text-xs font-medium text-electric-400 hover:underline">
                <PlusIcon /> Agregar ítem
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_80px_100px_36px] gap-2 items-center">
                  {/* Descripción con datalist */}
                  <div className="relative">
                    <input
                      list={`studies-${item.id}`}
                      value={item.description}
                      onChange={e => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Descripción o estudio"
                      className="modal-input w-full text-sm"
                    />
                    <datalist id={`studies-${item.id}`}>
                      {STUDY_CATALOG.map(s => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                  {/* Cantidad */}
                  <input type="number" min="1" value={item.qty}
                    onChange={e => updateItem(item.id, 'qty', e.target.value)}
                    className="modal-input text-center text-sm" placeholder="Cant." />
                  {/* Precio unitario */}
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2
                                     text-xs text-clinical-500">{sym}</span>
                    <input type="number" min="0" step="0.01" value={item.unit_price}
                      onChange={e => updateItem(item.id, 'unit_price', e.target.value)}
                      className="modal-input w-full pl-7 text-sm" placeholder="0.00" />
                  </div>
                  {/* Eliminar */}
                  <button type="button" onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg
                               border border-white/[0.07] text-clinical-600
                               transition hover:border-red-400/30 hover:text-red-400
                               disabled:opacity-30">
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preview de totales */}
          <div className="rounded-xl border border-electric-500/20 bg-electric-500/[0.06] p-4">
            <div className="flex items-center justify-between text-sm text-clinical-400">
              <span>Subtotal</span>
              <span className="font-mono text-clinical-200">{sym} {subtotal.toFixed(2)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex items-center justify-between text-sm text-clinical-400 mt-1">
                <span>Impuesto ({(taxRate * 100).toFixed(0)}%)</span>
                <span className="font-mono text-clinical-200">{sym} {taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-white/[0.07] pt-2">
              <span className="font-semibold text-white">Total</span>
              <span className="font-mono text-lg font-bold text-electric-300">
                {formatCurrency(total, currency)}
              </span>
            </div>
          </div>

          {/* Método de pago (solo si pagada) */}
          {status === 'pagada' && (
            <MF label="Método de pago">
              <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className="modal-input">
                {PAYMENT_METHODS.map(m => (
                  <option key={m.value} value={m.value} className="bg-clinical-900">{m.label}</option>
                ))}
              </select>
            </MF>
          )}

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <MF label="Fecha de emisión">
              <input type="date" value={issuedAt} onChange={e => setIssuedAt(e.target.value)} className="modal-input" />
            </MF>
            <MF label="Fecha límite de pago">
              <input type="date" value={dueAt} onChange={e => setDueAt(e.target.value)} className="modal-input" />
            </MF>
          </div>

          {/* Campos fiscales */}
          <div className="grid grid-cols-2 gap-4">
            <MF label="UUID CFDI (México)">
              <input value={cfdiUuid} onChange={e => setCfdiUuid(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className="modal-input font-mono text-xs" />
            </MF>
            <MF label="NFS-e (Brasil)">
              <input value={nfseNum} onChange={e => setNfseNum(e.target.value)}
                placeholder="Número NFS-e" className="modal-input" />
            </MF>
          </div>

          {/* Notas */}
          <MF label="Notas internas">
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Notas para el expediente (no se imprimen en la factura)"
              className="modal-input resize-none" />
          </MF>

          {/* Error */}
          {apiError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-400/30
                            bg-red-400/10 px-4 py-3 text-sm text-red-300">
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" /> {apiError}
            </div>
          )}

          {/* Acciones */}
          <div className="flex justify-end gap-3 border-t border-white/[0.07] pt-4">
            <button type="button" onClick={onClose}
              className="rounded-xl border border-white/[0.09] px-4 py-2 text-sm
                         text-clinical-400 transition hover:text-clinical-200">
              Cancelar
            </button>
            <button type="submit" disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-electric-gradient px-5 py-2.5
                         text-sm font-semibold text-white
                         shadow-[0_4px_20px_-6px_rgba(122,34,255,0.55)]
                         transition hover:brightness-110 disabled:opacity-50">
              {submitting ? <SpinIcon /> : <CheckIcon />}
              {submitting ? 'Guardando…' : 'Generar factura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Sub-componentes internos ── */
function MF({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-clinical-400">{label}</span>
      {children}
    </label>
  );
}

function PatInitials({ first = '', last = '' }) {
  const i = `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                     bg-electric-500/20 text-xs font-bold text-electric-300" aria-hidden>
      {i}
    </span>
  );
}

/* ── Micro-iconos ── */
function XIcon()     { return <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>; }
function PlusIcon()  { return <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>; }
function TrashIcon() { return <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>; }
function CheckIcon() { return <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>; }
function AlertIcon({ className }) { return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>; }
function SpinIcon()  { return <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>; }
