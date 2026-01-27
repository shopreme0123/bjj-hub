/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        belt: {
          white: '#64748b',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          brown: '#b45309',
          black: '#dc2626',
        },
      },
    },
  },
  plugins: [],
}
