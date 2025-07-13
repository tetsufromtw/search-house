/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // 啟用 class 模式的深色主題
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        header: 'var(--color-header)',
        'header-text': 'var(--color-header-text)',
        main: 'var(--color-main)',
        'main-text': 'var(--color-main-text)',
        footer: 'var(--color-footer)',
        'footer-text': 'var(--color-footer-text)',
        border: 'var(--color-border)',
        accent: 'var(--color-accent)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
      },
      borderRadius: {
        'themed': 'var(--border-radius)',
        'themed-button': 'var(--button-radius)',
        'themed-input': 'var(--input-radius)',
        'themed-card': 'var(--card-radius)',
      },
      borderWidth: {
        'themed': 'var(--border-width)',
      },
      boxShadow: {
        'themed': 'var(--shadow)',
      },
      spacing: {
        'themed': 'var(--spacing)',
      },
      fontWeight: {
        'themed': 'var(--font-weight-normal)',
        'themed-bold': 'var(--font-weight-bold)',
      },
    },
  },
  plugins: [],
}