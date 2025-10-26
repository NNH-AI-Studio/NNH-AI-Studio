/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'orange-border': '#ff6b00',
        'nnh-orange': '#ff6b00',
        'nnh-dark': '#0a0a0a',
        'nnh-orange-hover': '#ff8533',
        'neon-orange': '#ff6b00',
        surface: 'var(--surface)',
        surfaceStrong: 'var(--surface-strong)',
        borderSubtle: 'var(--border-subtle)',
        ringBrand: 'var(--ring-brand)',
        textMuted: 'var(--text-muted)',
      },
      boxShadow: {
        'neon-orange': '0 0 5px #ff6b00, 0 0 10px #ff6b00',
        'neon-orange-strong': '0 0 10px #ff6b00, 0 0 20px #ff6b00, 0 0 30px #ff6b00',
      },
    },
  },
  plugins: [],
};
