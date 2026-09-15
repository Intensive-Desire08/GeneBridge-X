/** @type {import('tailwindcss').Config} */
export default {
      content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            "surface-container": "#e3efff",
            "on-tertiary": "#ffffff",
            "outline-variant": "#cbd5e1",
            "primary": "#059669",
            "primary-dark": "#047857",
            "secondary": "#334155",
            "surface-dark": "#091424",
            "on-surface": "#0f172a",
            "on-surface-variant": "#334155",
            "surface-container-lowest": "#ffffff",
            "surface-bright": "#f8fafc",
            "surface-dim": "#e2e8f0"
          },
          borderRadius: {
            "DEFAULT": "0.375rem",
            "lg": "0.5rem",
            "xl": "0.75rem",
            "2xl": "1rem",
            "3xl": "1.5rem",
            "full": "9999px"
          },
          fontFamily: {
            "headline": ["Plus Jakarta Sans", "sans-serif"],
            "body": ["Plus Jakarta Sans", "sans-serif"],
            "mono": ["JetBrains Mono", "monospace"]
          }
        }
      }
    };
