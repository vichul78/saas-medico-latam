import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient.js';

/**
 * ResultadoViewer — pagina publica para ver un informe compartido via token.
 *
 * Ruta: /resultado/:token
 * Llama al RPC `get_shared_informe(p_token)` que valida expiracion y
 * devuelve los datos del informe con paciente/estudio/clinica.
 */
export default function ResultadoViewer() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(false);

  useEffect(() => {
    if (!token) {
      setError(true);
      setLoading(false);
      return;
    }

    async function fetchInforme() {
      try {
        const { data, error: rpcError } = await supabase
          .rpc('get_shared_informe', { p_token: token });

        if (rpcError || !data || data.length === 0) {
          setError(true);
        } else {
          // RPC returns array for RETURNS TABLE
          setResult(Array.isArray(data) ? data[0] : data);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchInforme();
  }, [token]);

  // Check if expiring soon (less than 2 hours)
  const isExpiringSoon = result?.expires_at
    ? (new Date(result.expires_at).getTime() - Date.now()) < 2 * 60 * 60 * 1000
    : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full
                          border-4 border-indigo-500 border-r-transparent" />
          <p className="mt-4 text-gray-600 text-sm">Cargando resultado...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-red-100
                          flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor"
                 strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Enlace invalido o expirado
          </h1>
          <p className="text-gray-500 text-sm">
            Este enlace ya no es valido. Los enlaces de resultados expiran
            despues de 24 horas por seguridad. Contacte a su clinica para
            solicitar un nuevo enlace.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Expiry warning */}
        {isExpiringSoon && (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3
                          flex items-center gap-2">
            <svg className="h-5 w-5 text-amber-600 shrink-0" fill="none" stroke="currentColor"
                 strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-amber-800">
              Este enlace expirara pronto. Descargue o imprima su resultado ahora.
            </p>
          </div>
        )}

        {/* Report card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header with clinic name */}
          <div className="border-b border-gray-200 bg-indigo-50 px-6 py-5">
            <h1 className="text-lg font-semibold text-indigo-900">
              {result.clinica_nombre || 'Clinica'}
            </h1>
            <p className="text-xs text-indigo-600 mt-1">Resultado de estudio medico</p>
          </div>

          {/* Patient and study info */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Paciente
                </p>
                <p className="text-sm font-semibold text-gray-800 mt-1">
                  {result.paciente_nombre} {result.paciente_apellido}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Tipo de estudio
                </p>
                <p className="text-sm font-semibold text-gray-800 mt-1">
                  {result.estudio_tipo}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Fecha del estudio
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  {result.estudio_fecha
                    ? new Date(result.estudio_fecha).toLocaleDateString('es-MX', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })
                    : 'No disponible'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Estado
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs
                                 font-medium bg-indigo-100 text-indigo-700 capitalize">
                  {result.informe_estado}
                </span>
              </div>
            </div>
          </div>

          {/* Report text */}
          <div className="px-6 py-6">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Informe
            </h2>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
              {result.informe_texto || 'Sin contenido disponible.'}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
            <p className="text-[10px] text-gray-400 text-center">
              Este documento es una copia digital compartida con fines informativos.
              Consulte a su medico para interpretacion de resultados.
            </p>
          </div>
        </div>

        {/* Print button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2
                       text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            Imprimir resultado
          </button>
        </div>
      </div>
    </div>
  );
}
