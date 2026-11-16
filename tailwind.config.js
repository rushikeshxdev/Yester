/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        yester: {
          orange: '#FF7138',
          orangeHover: '#FF8555',
          orangePressed: '#E85A27',
          orangeSubtle: '#291A14',
          orangeLight: '#E95D2B',
          orangeSubtleLight: '#FCE9E0',
          midnight: '#263E65',
        },
        dark: {
          bg: '#090A0C',
          bgSecondary: '#0E1013',
          surface: '#13161A',
          surfaceSecondary: '#191D23',
          surfaceTertiary: '#20252C',
          text: '#F5F4F0',
          textSecondary: '#A2A6AE',
          textMuted: '#747A84',
          borderSubtle: '#242930',
          border: '#303740',
          borderStrong: '#454C56',
        },
        light: {
          bg: '#F5F4F0',
          bgSecondary: '#EEEDE8',
          surface: '#FFFFFF',
          surfaceSecondary: '#F8F7F4',
          surfaceTertiary: '#EBE9E3',
          text: '#191B20',
          textSecondary: '#626872',
          textMuted: '#858A92',
          borderSubtle: '#E5E3DC',
          border: '#D7D5CE',
          borderStrong: '#B9B8B1',
        }
      },
      fontFamily: {
        serif: [
          'Newsreader',
          'Georgia',
          'Cambria',
          'serif',
        ],
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        normal: '0',
        wide: '0.04em',
        wider: '0.08em',
        widest: '0.14em',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'elevated': '0 8px 24px -4px rgba(0, 0, 0, 0.5)',
        'modal': '0 20px 45px -8px rgba(0, 0, 0, 0.7)',
        'orange': '0 8px 24px -4px rgba(255, 113, 56, 0.35)',
        'orange-sm': '0 2px 10px -2px rgba(255, 113, 56, 0.3)',
      }
    },
  },
  plugins: [],
}
