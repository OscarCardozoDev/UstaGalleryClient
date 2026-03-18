/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  darkMode: "class", // ThemeToggle agrega/quita la clase "dark" en <html>

  theme: {
    fontFamily: {
      sans:  ['Inter', 'sans-serif'],
      forum: ['Forum', 'sans-serif'],
      serif: ['Instrument Serif', 'serif'],
    },

    extend: {
      colors: {
        // ── Paleta Auth (existente) ──────────────────────────
        primary: {
          light:   '#b3b3b3',
          DEFAULT: '#0a0a0a',
          dark:    '#0a0a0a',
        },
        secondary: {
          light:   '#ff7961',
          DEFAULT: '#f44336',
          dark:    '#ba000d',
        },

        // ── Paleta Dashboard (existente) ─────────────────────
        dashboard: {
          primary:       '#2563eb',
          secondary:     '#8b5cf6',
          background:    '#f8f5f8',
          surface:       '#ffffff',
          textPrimary:   '#171717',
          textSecondary: '#6b7280',
        },

        // ── Paleta Brand — Fondo y texto (azul marino) ───────
        brand: {
          50:  '#FAFBFD',
          100: '#D9E1F0',
          200: '#B7C5E2',
          300: '#95AAD5',
          400: '#728EC7',
          500: '#5073B9',
          600: '#3E5D9B',
          700: '#304979',
          800: '#233457',
          900: '#151F35',
          950: '#070B12',
        },

        // ── Paleta Sombras (grises neutros) ──────────────────
        shadow: {
          50:  '#FAFBFD',
          100: '#E0E1E3',
          200: '#C7C8CA',
          300: '#AFB0B1',
          400: '#979899',
          500: '#808181',
          600: '#6A6A6B',
          700: '#545455',
          800: '#3F4040',
          900: '#2C2C2C',
          950: '#19191A',
        },

        // ── Paleta Tonos (grises cálidos) ────────────────────
        tone: {
          50:  '#FAFBFD',
          100: '#EDEEF0',
          200: '#E0E1E3',
          300: '#D4D5D6',
          400: '#C7C8C9',
          500: '#BBBCBD',
          600: '#AFAFB0',
          700: '#A3A3A4',
          800: '#979798',
          900: '#8B8C8C',
          950: '#808080',
        },

        // ── Acento dorado ────────────────────────────────────
        gold: {
          light:   '#f0d080',
          DEFAULT: '#c9a84c',
          dark:    '#a07830',
        },
      },

      borderRadius: {
        dashboard: '12px',
        hero:      '18px',
        pill:      '9999px',
      },

      // ── Tipografía fluid ──────────────────────────────────
      fontSize: {
        'fluid-xs':   ['clamp(0.65rem,  1.2vw, 0.75rem)',  { lineHeight: '1.4' }],
        'fluid-sm':   ['clamp(0.75rem,  1.5vw, 0.875rem)', { lineHeight: '1.5' }],
        'fluid-base': ['clamp(0.875rem, 1.8vw, 1rem)',     { lineHeight: '1.6' }],
        'fluid-md':   ['clamp(1rem,     2vw,   1.2rem)',   { lineHeight: '1.6' }],
        'fluid-lg':   ['clamp(1.1rem,   2.5vw, 1.5rem)',   { lineHeight: '1.4' }],
        'fluid-xl':   ['clamp(1.4rem,   3.5vw, 2.5rem)',   { lineHeight: '1.2' }],
        'fluid-2xl':  ['clamp(2rem,     6vw,   4rem)',     { lineHeight: '1.1' }],
        'fluid-hero': ['clamp(2.8rem,   9vw,   6rem)',     { lineHeight: '1.0' }],
      },

      // ── Espaciado extra ───────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
      },

      // ── Sombras con tinte azul marino ─────────────────────
      boxShadow: {
        'brand-sm': '0 2px 8px  rgba(55, 72, 121, 0.10)',
        'brand-md': '0 8px 24px rgba(55, 72, 121, 0.14)',
        'brand-lg': '0 20px 60px rgba(55, 72, 121, 0.18)',
        'brand-xl': '0 32px 80px rgba(55, 72, 121, 0.22)',
        'gold':     '0 4px 24px rgba(201, 168, 76, 0.25)',
        'dark-sm':  '0 2px 8px  rgba(7, 11, 18, 0.40)',
        'dark-md':  '0 8px 24px rgba(7, 11, 18, 0.55)',
        'dark-lg':  '0 20px 60px rgba(7, 11, 18, 0.65)',
        'dark-xl':  '0 32px 80px rgba(7, 11, 18, 0.75)',
      },

      // ── Transiciones ──────────────────────────────────────
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring':   'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth':   'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '900': '900ms',
      },
    },
  },

  plugins: [],
}