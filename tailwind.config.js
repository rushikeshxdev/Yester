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
        dark: {
          bg: '#0B0B0B',
          surface: '#141414',
          surfaceSecondary: '#1B1B1B',
          text: '#FFFFFF',
          textSecondary: '#A0A0A0',
          border: '#292929',
          borderSubtle: '#1F1F1F',
        },
        light: {
          bg: '#FFFFFF',
          surface: '#F7F7F7',
          surfaceSecondary: '#EFEFEF',
          text: '#111111',
          textSecondary: '#666666',
          border: '#E5E5E5',
          borderSubtle: '#EDEDED',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        wide: '0.04em',
        wider: '0.08em',
        widest: '0.12em',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
        'elevated': '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      }
    },
  },
  plugins: [],
}

