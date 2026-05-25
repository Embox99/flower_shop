/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:        "var(--fs-bg)",
        "bg-soft": "var(--fs-bg-soft)",
        "bg-card": "var(--fs-bg-card)",
        ink:       "var(--fs-ink)",
        "ink-soft":"var(--fs-ink-soft)",
        "ink-mute":"var(--fs-ink-mute)",
        accent:    "var(--fs-accent)",
        "accent-2":"var(--fs-accent-2)",
        "accent-3":"var(--fs-accent-3)",
        "accent-soft":"var(--fs-accent-soft)",
        // back-compat with the old project
        lama: "var(--fs-accent)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        sans:  ["var(--font-sans)",  "Inter Tight", "system-ui", "sans-serif"],
        mono:  ["var(--font-mono)",  "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        sm: "var(--fs-radius-sm)",
        DEFAULT: "var(--fs-radius)",
        lg: "var(--fs-radius-lg)",
      },
    },
  },
  plugins: [],
};
