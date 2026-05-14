/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#556B2F", // Olive Green
        'primary-dark': "#3D4F1C", // Dark Olive
        accent: "#FF8C00", // Orange
        background: "#F5F5F5",
        card: "#FFFFFF",
        text: "#1A1A1A",
        border: "#E5E7EB",
      },
      borderRadius: {
        'xl': '1rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
