/**
 * currency.js — helpers multidivisa para MediCo LatAm.
 *
 * Soporta todas las monedas del ENUM `latam_currency` definido en schema.sql:
 *   MXN · BRL · ARS · COP · CLP · PEN · UYU · BOB · PYG · VES · USD
 *
 * Uso:
 *   import { formatCurrency, getCurrencySymbol, LATAM_CURRENCIES } from '@/lib/currency.js';
 *   formatCurrency(1500, 'MXN')   → '$1,500.00'
 *   getCurrencySymbol('COP')      → 'COP$'
 */

// ── Tabla de metadatos por moneda ──────────────────────────────────────────
export const LATAM_CURRENCIES = {
  MXN: { symbol: '$',    name: 'Peso mexicano',     locale: 'es-MX', decimals: 2 },
  BRL: { symbol: 'R$',   name: 'Real brasileño',    locale: 'pt-BR', decimals: 2 },
  ARS: { symbol: '$',    name: 'Peso argentino',     locale: 'es-AR', decimals: 2 },
  COP: { symbol: 'COP$', name: 'Peso colombiano',   locale: 'es-CO', decimals: 0 },
  CLP: { symbol: '$',    name: 'Peso chileno',       locale: 'es-CL', decimals: 0 },
  PEN: { symbol: 'S/',   name: 'Sol peruano',        locale: 'es-PE', decimals: 2 },
  UYU: { symbol: '$U',   name: 'Peso uruguayo',      locale: 'es-UY', decimals: 2 },
  BOB: { symbol: 'Bs.',  name: 'Boliviano',          locale: 'es-BO', decimals: 2 },
  PYG: { symbol: '₲',    name: 'Guaraní paraguayo',  locale: 'es-PY', decimals: 0 },
  VES: { symbol: 'Bs.S', name: 'Bolívar venezolano', locale: 'es-VE', decimals: 2 },
  USD: { symbol: 'US$',  name: 'Dólar',              locale: 'en-US', decimals: 2 },
};

/**
 * Devuelve los metadatos de una moneda ISO 4217.
 * @param {string} code — código ISO (ej. 'MXN')
 */
export function getCurrencyMeta(code) {
  return LATAM_CURRENCIES[code] ?? LATAM_CURRENCIES.USD;
}

/**
 * Devuelve el símbolo de la moneda (ej. '$', 'R$', 'COP$').
 * @param {string} code
 */
export function getCurrencySymbol(code) {
  return getCurrencyMeta(code).symbol;
}

/**
 * Formatea un número como moneda localizada.
 *
 * @param {number}  amount  — valor numérico
 * @param {string}  code    — código ISO 4217 (ej. 'MXN')
 * @param {boolean} compact — usar notación compacta para valores grandes (ej. $1.5M)
 *
 * @returns {string}  ej. '$1,500.00' | 'R$2.350,00' | 'COP$45.000'
 */
export function formatCurrency(amount, code = 'USD', compact = false) {
  const meta = getCurrencyMeta(code);

  try {
    return new Intl.NumberFormat(meta.locale, {
      style:                 'currency',
      currency:              code,
      minimumFractionDigits: meta.decimals,
      maximumFractionDigits: meta.decimals,
      notation:              compact ? 'compact' : 'standard',
      compactDisplay:        'short',
    }).format(amount ?? 0);
  } catch {
    // Fallback si Intl no reconoce el código
    const formatted = (amount ?? 0).toLocaleString('es', {
      minimumFractionDigits: meta.decimals,
      maximumFractionDigits: meta.decimals,
    });
    return `${meta.symbol}${formatted}`;
  }
}

/**
 * Formatea solo el número (sin símbolo de moneda), respetando el locale.
 * Útil para inputs y tablas donde el símbolo ya está en el encabezado.
 *
 * @param {number} amount
 * @param {string} code
 */
export function formatNumber(amount, code = 'USD') {
  const meta = getCurrencyMeta(code);
  return (amount ?? 0).toLocaleString(meta.locale, {
    minimumFractionDigits: meta.decimals,
    maximumFractionDigits: meta.decimals,
  });
}

/**
 * Parsea un string de entrada del usuario a número (maneja comas/puntos de locale).
 * @param {string} str
 */
export function parseAmount(str) {
  if (!str) return 0;
  // Elimina todo excepto dígitos, punto y signo negativo
  const clean = String(str).replace(/[^\d.-]/g, '');
  const num   = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

/**
 * Calcula el total con impuesto.
 * @param {number} subtotal
 * @param {number} taxRate  — fracción decimal (ej. 0.16 para 16%)
 */
export function calcTotal(subtotal, taxRate = 0) {
  const sub = subtotal ?? 0;
  return sub + sub * (taxRate ?? 0);
}

/**
 * Lista de opciones para selectores en formularios.
 */
export const CURRENCY_OPTIONS = Object.entries(LATAM_CURRENCIES).map(([code, meta]) => ({
  value: code,
  label: `${code} — ${meta.name} (${meta.symbol})`,
  symbol: meta.symbol,
}));

/**
 * Tasas de impuesto predefinidas por país (simplificadas).
 * Se muestran como sugerencias en el formulario de factura.
 */
export const TAX_PRESETS = [
  { label: 'Sin impuesto',     rate: 0     },
  { label: 'IVA 16% (MX)',     rate: 0.16  },
  { label: 'IVA 19% (CO)',     rate: 0.19  },
  { label: 'IVA 21% (AR)',     rate: 0.21  },
  { label: 'IVA 19% (CL)',     rate: 0.19  },
  { label: 'ICMS 18% (BR)',    rate: 0.18  },
  { label: 'IGV 18% (PE)',     rate: 0.18  },
  { label: 'IVA 10% (PY)',     rate: 0.10  },
  { label: 'IVA 12% (BO)',     rate: 0.12  },
  { label: 'IVA 22% (UY)',     rate: 0.22  },
  { label: 'GST 10%',          rate: 0.10  },
];
