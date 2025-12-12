/** @type {import('tailwindcss').Config} */
export default {
  // Use class-based dark mode with custom selector to match existing .dark-theme class
  darkMode: ['class', '.dark-theme'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom colors that map to CSS variables
      // These will work with the existing CSS variable system
      colors: {
        'title': 'var(--title-color)',
        'description': 'var(--description-color)',
        'undertext': 'var(--undertext-color)',
        'border-separator': 'var(--border-separator-color)',
        'border-big-separator': 'var(--border-big-separator-color)',
        'global-bg': 'var(--global-background-color)',
      },
      // Custom breakpoints to match existing media queries
      screens: {
        'mobile': '600px', // Maps to 37.5em / 600px used throughout
        // Tailwind defaults: sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
      },
      // Font families
      fontFamily: {
        'serif': ['Times New Roman', 'Times', 'serif'],
        'sans': ['system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      // Custom animations
      keyframes: {
        'logo-spin': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'logo-spin': 'logo-spin infinite 20s linear',
      },
      // Typography sizes to match existing styles
      fontSize: {
        // Article list item sizes (from ArticleListItem.css)
        'article-title': '18px',
        'article-description': '14px',
        'article-undertext': '12px',
        // Featured article sizes (from FeaturedArticle.css)
        'featured-title': '28px',
        'featured-description': '16px',
        'featured-undertext': '13px',
      },
      // Spacing that matches common patterns
      spacing: {
        'nav-border': '0.2rem', // --nav-a-link-border-bottom-size
      },
    },
  },
  plugins: [],
}

