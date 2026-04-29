/** @type {import('tailwindcss').Config} */
import animatePlugin from "tailwindcss-animate";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  darkMode: "class",

  theme: {
    fontFamily: {
      sans:  ['Inter', 'sans-serif'],
      forum: ['Forum', 'sans-serif'],
      serif: ['Instrument Serif', 'serif'],
    },

    extend: {
      screens: {
        xs: "460px",
      },

      maxWidth: {
        "8xl": "90rem",
      },

      colors: {
        // ── Paleta Principal (Design System USTA Gallery) ────
        primary: {
          50:  '#F5F5F5',
          100: '#E8E8E8',
          200: '#D1D1D1',
          300: '#B0B0B0',
          400: '#888888',
          500: '#636363',
          600: '#4A4A4A',
          700: '#333333',
          800: '#242424',
          900: '#1A1A1A',
          950: '#0D0D0D',
          DEFAULT: '#1A1A1A',
          light:   '#4A4A4A',
          dark:    '#0D0D0D',
          // Needed by shadcn button variant="default"
          foreground: 'hsl(var(--primary-foreground))',
        },

        // ── Secondary — Gris medio ────────────────────────────
        secondary: {
          50:  '#F8F8F9',
          100: '#EDEDEE',
          200: '#DADADC',
          300: '#C5C5C7',
          400: '#B8B8BC',
          500: '#A8A8AC',
          600: '#96969A',
          700: '#808084',
          800: '#636366',
          900: '#4A4A4C',
          950: '#2E2E30',
          DEFAULT: '#B8B8BC',
          light:   '#DADADC',
          dark:    '#96969A',
          // Needed by shadcn button variant="secondary"
          foreground: 'hsl(var(--secondary-foreground))',
        },

        // ── Tertiary — Gris cálido medio ──────────────────────
        tertiary: {
          50:  '#F7F7F7',
          100: '#EBEBEB',
          200: '#D8D8D8',
          300: '#C3C3C4',
          400: '#B3B3B4',
          500: '#A3A3A4',
          600: '#909091',
          700: '#797979',
          800: '#5C5C5C',
          900: '#424242',
          950: '#282828',
          DEFAULT: '#A3A3A4',
          light:   '#C3C3C4',
          dark:    '#797979',
        },

        // ── Neutral — Fondos y superficies ───────────────────
        neutral: {
          50:  '#FAFBFD',
          100: '#F2F3F5',
          200: '#E8E9EB',
          300: '#D8D9DB',
          400: '#C4C5C7',
          500: '#ADADAE',
          600: '#919293',
          700: '#717273',
          800: '#515253',
          900: '#343535',
          950: '#1A1B1B',
          DEFAULT: '#FAFBFD',
        },

        // ── shadcn/ui compatibility (used by Calendar component) ─────────────
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input:  'hsl(var(--input))',
        ring:   'hsl(var(--ring))',
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },

        // ── Paleta Dashboard ─────────────────────────────────
        dashboard: {
          primary:       '#1A1A1A',
          secondary:     '#B8B8BC',
          background:    '#FAFBFD',
          surface:       '#ffffff',
          textPrimary:   '#1A1A1A',
          textSecondary: '#A3A3A4',
        },

        // ── Acento dorado ────────────────────────────────────
        gold: {
          light:   '#f0d080',
          DEFAULT: '#c9a84c',
          dark:    '#a07830',
        },
      },

      borderRadius: {
        // shadcn/ui (calendar component)
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // UstaGallery design system
        dashboard: '12px',
        hero:      '18px',
        pill:      '9999px',
      },

      backgroundImage: {
        // Diagonal stripe pattern for non-working hours in calendar day/week view
        "calendar-disabled-hour": "repeating-linear-gradient(-60deg, hsl(var(--border)) 0 0.5px, transparent 0.5px 8px)",
      },

      // ── Tipografía fluid ──────────────────────────────────
      fontSize: {
        xxs:          ['0.625rem', '1rem'],
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
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '6.5': '1.625rem',
        '8.5': '2.125rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
        '26':  '6.5rem',
      },

      // ── Sombras ───────────────────────────────────────────
      boxShadow: {
        'brand-sm': '0 2px 8px  rgba(26, 26, 26, 0.08)',
        'brand-md': '0 8px 24px rgba(26, 26, 26, 0.12)',
        'brand-lg': '0 20px 60px rgba(26, 26, 26, 0.16)',
        'brand-xl': '0 32px 80px rgba(26, 26, 26, 0.20)',
        'gold':     '0 4px 24px rgba(201, 168, 76, 0.25)',
        'dark-sm':  '0 2px 8px  rgba(13, 13, 13, 0.40)',
        'dark-md':  '0 8px 24px rgba(13, 13, 13, 0.55)',
        'dark-lg':  '0 20px 60px rgba(13, 13, 13, 0.65)',
        'dark-xl':  '0 32px 80px rgba(13, 13, 13, 0.75)',
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

      // ── Animaciones (shadcn/ui accordion) ─────────────────
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
    },
  },

  plugins: [animatePlugin],
}
