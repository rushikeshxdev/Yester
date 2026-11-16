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
          bg: '#070707',
          surface: '#0F0F0F',
          surfaceSecondary: '#151515',
          surfaceTertiary: '#1C1C1C',
          text: '#FFFFFF',
          textSecondary: '#A3A3A3',
          textMuted: '#666666',
          border: '#222222',
          borderSubtle: '#181818',
        },
        light: {
          bg: '#FCFCFC',
          surface: '#F5F5F3',
          surfaceSecondary: '#ECECE9',
          surfaceTertiary: '#E3E3DF',
          text: '#111111',
          textSecondary: '#5A5A5A',
          textMuted: '#8E8E8E',
          border: '#E2E2DF',
          borderSubtle: '#ECECE9',
        }
      },
      fontFamily: {
        serif: [
          'Newsreader',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'serif',
        ],
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
        normal: '0',
        wide: '0.04em',
        wider: '0.08em',
        widest: '0.14em',
        epic: '0.22em',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'elevated': '0 8px 24px -4px rgba(0, 0, 0, 0.5)',
        'modal': '0 20px 45px -8px rgba(0, 0, 0, 0.7)',
      }
    },
  },
  plugins: [],
}
