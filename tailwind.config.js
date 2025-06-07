/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Mona Sans", "sans-serif"],
      },
      colors: {
        white: {
          50: "#d9ecff",
          100: "#b3d9ff",
          DEFAULT: "#ffffff",
        },
        black: {
          50: "#1c1c21",
          100: "#0e0e10",
          200: "#282732",
          300: "#404040", // Add this if you're using black-300 in your components
          DEFAULT: "#000000",
        },
        blue: {
          50: "#839cb5",
          100: "#2d2d38",
          200:"#006666",
        },
      },
      spacing: {
        100: "25rem",
        120: "30rem",
        140: "35rem",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle, #e5e5e5 0%, #fff 100%)',
      },
      animation: {
        'word-slider': 'wordSlider 21s infinite cubic-bezier(0.9, 0.01, 0.3, 0.99)',
        'marquee': 'marquee 60s linear infinite',
      },
      keyframes: {
        wordSlider: {
          '0%': { transform: 'translateY(0.5%)' },
          '12.5%': { transform: 'translateY(-12.5%)' },
          '25%': { transform: 'translateY(-25%)' },
          '37.5%': { transform: 'translateY(-37.5%)' },
          '50%': { transform: 'translateY(-50%)' },
          '62.5%': { transform: 'translateY(-62.5%)' },
          '75%': { transform: 'translateY(-75%)' },
          '87.5%': { transform: 'translateY(-87.5%)' },
        },
        marquee: {
          '0%': { left: '0' },
          '100%': { left: '-100%' },
        },
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
}