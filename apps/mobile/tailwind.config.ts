import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'warm-bg': '#FAFAF8',
        'warm-text': '#1C1917',
        'warm-muted': '#78716C',
        'warm-border': '#E7E5E4',
        'calm-green': '#16A34A',
        'calm-amber': '#D97706',
        'calm-indigo': '#4F46E5',
      },
    },
  },
  plugins: [],
} satisfies Config
