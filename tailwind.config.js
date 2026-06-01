/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // رنگ‌های آبی دودی سفارشی
        'navy': {
          50: '#e8edf5',
          100: '#cbd9eb',
          200: '#9db5d6',
          300: '#6f91c2',
          400: '#416dad',
          500: '#1a3a6e',
          600: '#152e58',
          700: '#0f2242',
          800: '#0a162c',
          900: '#050b16',
          950: '#02050b',
        },
        'blue-dark': {
          50: '#e8f0fe',
          100: '#cde1fd',
          200: '#9bc3fb',
          300: '#68a4f9',
          400: '#3686f7',
          500: '#0468f5',
          600: '#0353c4',
          700: '#023e93',
          800: '#022a62',
          900: '#011531',
          950: '#000a19',
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
