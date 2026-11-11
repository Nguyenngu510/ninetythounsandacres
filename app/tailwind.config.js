/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        body: ['VT323', 'monospace'],
      },
      colors: {
        ink: '#1a1208',
        parchment: '#f5e6c8',
        panel: '#3a2a16',
        panelLight: '#6e4c2c',
        gold: '#ffd75e',
      },
    },
  },
  plugins: [],
};
