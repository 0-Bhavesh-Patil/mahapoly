import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0E14',
        surface: '#141922',
        accent: {
          DEFAULT: '#5B6CFF', // Indigo Trust
          hover: '#4A5BE6',
        },
        status: {
          success: '#33D69F',
          warning: '#FFB020',
          danger: '#FF5D5D',
        },
        text: {
          primary: '#F4F6FA',
          muted: '#8A93A6',
        },
        // Hardcoded category hues for pattern recognition
        category: {
          OPEN: '#F4F6FA',
          OBC: '#5B6CFF',
          SC: '#9D4EDD',
          ST: '#F59E0B',
          EWS: '#10B981',
          TFWS: '#06B6D4',
        }
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        ui: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      fontSize: {
        'fluid-display': 'clamp(2rem, 4vw, 3.5rem)',
        'fluid-h1': 'clamp(1.5rem, 2.5vw, 2rem)',
        'fluid-h2': '1.25rem',
        'fluid-body': ['1rem', '1.6'],
        'fluid-small': '0.8125rem',
        'fluid-mono': '0.9375rem',
      },
    },
  },
  plugins: [],
}
export default config;