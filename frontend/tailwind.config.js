// frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Đảm bảo font 'sans' (mặc định) sử dụng Inter
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}