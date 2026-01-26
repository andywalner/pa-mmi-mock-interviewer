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
        // Core Logo Colors
        brand: {
          'core-red': '#E80D08',
          'core-pink': '#F7B8C2',
          'core-light': '#F5DBDF',
        },
        // Secondary Brand Colors
        'brand-secondary': {
          rose: '#E18384',
          light: '#EED2D5',
          maroon: '#80373A',
          brick: '#B74847',
          red: '#D41716',
        },
        // Pop of Orange
        'brand-orange': {
          DEFAULT: '#F7631A',
          light: '#F98C5F',
          pale: '#F6CDB0',
        },
        // Legacy medical colors mapped to brand colors for backwards compatibility
        medical: {
          50: '#F5DBDF',
          100: '#EED2D5',
          200: '#F7B8C2',
          300: '#E18384',
          400: '#B74847',
          500: '#D41716',
          600: '#E80D08',
          700: '#80373A',
          800: '#80373A',
          900: '#80373A',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}

export default config
