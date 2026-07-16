/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,ts,jsx,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        // Apple system palette (same design language as kadiryaren.dev)
        "apple-black": "#000000",
        "apple-dark": "#1c1c1e",
        "apple-card": "#141416",
        "apple-blue": "#2997ff",
        "apple-purple": "#bf5af2",
        "apple-gray": "#86868b",
        "apple-green": "#34c759",
        "apple-light": "#f5f5f7",
        "apple-orange": "#ff9500",
        "apple-pink": "#ff2d55",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "system-ui",
          "SF Pro Display",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        hand: ["Caveat", "cursive"],
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        gradient: "gradient 8s ease infinite",
        marquee: "marquee 40s linear infinite",
        float: "float 6s ease-in-out infinite",
        pulseGlow: "pulseGlow 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
