import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useSpeechRecognition — dictado por voz usando la API nativa del navegador.
 *
 * Usa `window.SpeechRecognition` / `window.webkitSpeechRecognition`.
 * Sin dependencias externas: cero bundle adicional.
 *
 * Reglas de color (CERO verde):
 *   • Activo/grabando → púrpura eléctrico (#7A22FF) con pulso.
 *   • Error           → rojo (status-danger), nunca verde.
 *   • Éxito           → violet.
 *
 * @param {object} opts
 *   lang           : string  — código BCP-47 (default 'es-MX')
 *   continuous     : bool    — dictado continuo (default false)
 *   onTranscript   : fn(text, isFinal) — callback con el texto reconocido
 *   onError        : fn(errorMsg)      — callback de error (mensaje ES)
 *
 * @returns {{
 *   isListening   : bool,
 *   isSupported   : bool,
 *   interim       : string,   — texto parcial en tiempo real
 *   startListening: fn,
 *   stopListening : fn,
 *   toggleListening: fn,
 * }}
 */
export function useSpeechRecognition({
  lang           = 'es-MX',
  continuous     = false,
  onTranscript,
  onError,
} = {}) {
  const [isListening, setIsListening] = useState(false);
  const [interim,     setInterim]     = useState('');
  const recognizerRef = useRef(null);

  /* ── Soporte del navegador ── */
  const SpeechAPI =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;
  const isSupported = !!SpeechAPI;

  /* ── Cleanup al desmontar ── */
  useEffect(() => () => recognizerRef.current?.abort(), []);

  /* ── startListening ── */
  const startListening = useCallback(() => {
    if (!isSupported || isListening) return;

    const recognition = new SpeechAPI();
    recognition.lang         = lang;
    recognition.continuous   = continuous;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognizerRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setInterim('');
    };

    recognition.onresult = (event) => {
      let finalText   = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      setInterim(interimText);

      if (finalText.trim()) {
        onTranscript?.(finalText.trim(), true);
        setInterim('');
      } else if (interimText) {
        onTranscript?.(interimText, false);
      }
    };

    recognition.onerror = (event) => {
      // Log original EN para debug técnico
      // eslint-disable-next-line no-console
      console.error('[useSpeechRecognition] SpeechRecognition error (EN):',
        event.error, event.message);

      // Mensaje amigable ES para la UI
      const friendly = {
        'no-speech':            'No se detectó voz. Habla cerca del micrófono.',
        'audio-capture':        'No se encontró micrófono. Verifica la conexión.',
        'not-allowed':          'Permiso de micrófono denegado. Actívalo en el navegador.',
        'service-not-allowed':  'Servicio de voz no disponible en este entorno.',
        'network':              'Error de red al reconocer la voz.',
        'aborted':              null, // abortado manualmente, no mostrar error
      };
      const msg = friendly[event.error] ?? 'Error al reconocer la voz. Inténtalo de nuevo.';
      if (msg) onError?.(msg);

      setIsListening(false);
      setInterim('');
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterim('');
    };

    recognition.start();
  }, [isSupported, isListening, lang, continuous, onTranscript, onError, SpeechAPI]);

  /* ── stopListening ── */
  const stopListening = useCallback(() => {
    recognizerRef.current?.stop();
    setIsListening(false);
    setInterim('');
  }, []);

  /* ── toggleListening ── */
  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    interim,
    startListening,
    stopListening,
    toggleListening,
  };
}
