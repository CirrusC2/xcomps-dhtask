/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    "./index.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        dhtask: {
          "primary": "#1D70FF",
          "primary-content": "#ffffff",
          "secondary": "#2563eb",
          "secondary-content": "#ffffff",
          "accent": "#3898EC",
          "accent-content": "#ffffff",
          "neutral": "#1e293b",
          "neutral-content": "#e2e8f0",
          "base-100": "#0f172a",
          "base-200": "#1e293b",
          "base-300": "#334155",
          "base-content": "#f1f5f9",
          "info": "#1D70FF",
          "success": "#22c55e",
          "warning": "#f59e0b",
          "error": "#ef4444"
        }
      }
    ],
    darkTheme: "dhtask"
  }
}

