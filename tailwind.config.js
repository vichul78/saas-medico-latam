/** @type {import('tailwindcss').Config} */
// Paleta clínica con acentos de Púrpura Eléctrico y Violeta.
// IMPORTANTE: NO se incluyen tonos verdes en ningún token de color.
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Lienzo clínico: blancos, grises neutros y violetas profundos.
        clinical: {
          50: '#FAFAFE',
          100: '#F4F4F8',
          200: '#E7E7EE',
          300: '#CFCFDC',
          400: '#9A9AAE',
          500: '#6B6B82',
          600: '#4A4A5E',
          700: '#2F2F40',
          800: '#1C1C29',
          900: '#0F0F18',
        },
        // Púrpura eléctrico (acento principal).
        electric: {
          50: '#F4ECFF',
          100: '#E6D2FF',
          200: '#CFA8FF',
          300: '#B17DFF',
          400: '#9450FF',
          500: '#7A22FF', // base
          600: '#6612E6',
          700: '#510BB8',
          800: '#3D098A',
          900: '#28065C',
        },
        // Violeta (acento secundario).
        violet: {
          50: '#F2EEFB',
          100: '#DCD0F4',
          200: '#BBA1E8',
          300: '#9972DC',
          400: '#7843D0',
          500: '#5B27B5', // base
          600: '#481E92',
          700: '#36166E',
          800: '#240F4A',
          900: '#120726',
        },
        // Estados sin tonalidades verdes: éxito en violeta-índigo.
        status: {
          info: '#5B27B5',
          success: '#7A22FF',
          warning: '#F2A024',
          danger: '#E0344F',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Sora"', '"Inter"', 'sans-serif'],
      },
      boxShadow: {
        clinical: '0 8px 24px -12px rgba(89, 39, 181, 0.18)',
        copilot: '-12px 0 36px -16px rgba(122, 34, 255, 0.35)',
      },
      borderRadius: {
        clinical: '14px',
      },
      backgroundImage: {
        'electric-gradient': 'linear-gradient(135deg, #7A22FF 0%, #5B27B5 100%)',
      },
    },
  },
  plugins: [],
};
