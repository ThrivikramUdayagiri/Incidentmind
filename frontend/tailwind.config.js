/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'system-bg': '#070505',
        'system-panel': 'rgba(20, 15, 15, 0.4)',
      },
      keyframes: {
        'system-breathe': {
          '0%, 100%': { opacity: '0.3', transform: 'scaleX(1)' },
          '50%': { opacity: '0.8', transform: 'scaleX(2)' },
        },
        'signal-travel': {
          '0%': { transform: 'translateY(-30px)', opacity: '0' },
          '10%': { opacity: '1' },
          '70%': { opacity: '1' },
          '100%': { transform: 'translateY(170px)', opacity: '0' },
        },
        'perimeter-scan': {
          '0%': { strokeDashoffset: 'var(--start-offset)' },
          '100%': { strokeDashoffset: 'calc(var(--start-offset) - 100)' },
        }
      },
      animation: {
        'system-breathe': 'system-breathe 4s ease-in-out infinite',
        'signal-travel': 'signal-travel 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'perimeter-scan': 'perimeter-scan 10s linear infinite',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
