/**
 * Connects Tailwind CSS to the Next.js stylesheet build through PostCSS.
 * Tailwind remains CSS-first so product tokens live in the global stylesheet.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
