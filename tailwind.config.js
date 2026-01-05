/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'amaretto': {
          'white': '#FFFFFF',
          'beige': '#E3DFD7',
          'gray-light': '#D9D9D9',
          'pink': '#EFA4CC',
          'gold': '#D4AF37',
          'black': '#000000',
        },
      },
      fontFamily: {
        'serif': ['var(--font-serif)', 'Georgia', 'Times New Roman', 'serif'],
        'sans': ['var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

