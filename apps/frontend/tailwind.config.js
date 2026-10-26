/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui-components/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        monopoly: {
          red: '#FF0000',
          blue: '#0000FF',
          green: '#00FF00',
          yellow: '#FFFF00',
          magenta: '#FF00FF',
          cyan: '#00FFFF',
          orange: '#FFA500',
          purple: '#800080',
          brown: '#8B4513',
          lightBlue: '#87CEEB',
          pink: '#FF69B4',
          darkBlue: '#00008B',
        },
        board: {
          bg: '#1a1a2e',
          space: '#16213e',
          highlight: '#0f3460',
          border: '#e94560',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Bangers', 'cursive'],
      },
      animation: {
        'dice-roll': 'diceRoll 0.5s ease-in-out',
        'piece-move': 'pieceMove 0.5s ease-out',
        'card-flip': 'cardFlip 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        diceRoll: {
          '0%, 100%': { transform: 'rotate(0deg) scale(1)' },
          '25%': { transform: 'rotate(90deg) scale(1.1)' },
          '50%': { transform: 'rotate(180deg) scale(1)' },
          '75%': { transform: 'rotate(270deg) scale(1.1)' },
        },
        pieceMove: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(var(--tx), var(--ty)) scale(1.2)' },
          '100%': { transform: 'translate(var(--tx), var(--ty)) scale(1)' },
        },
        cardFlip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
      },
    },
  },
  plugins: [],
}