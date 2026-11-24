/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tenant: {
          primary: 'var(--tenant-primary, #2563eb)',
          secondary: 'var(--tenant-secondary, #1e40af)',
        }
      }
    },
  },
  plugins: [],
}
