/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,ts,jsx,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        // Apple system palette
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
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        ledBlink: {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 4px 1px rgba(52, 199, 89, 0.8)",
          },
          "50%": {
            opacity: "0.35",
            boxShadow: "0 0 0 0 rgba(52, 199, 89, 0)",
          },
        },
      },
      animation: {
        gradient: "gradient 8s ease infinite",
        float: "float 6s ease-in-out infinite",
        pulseGlow: "pulseGlow 5s ease-in-out infinite",
        ledBlink: "ledBlink 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
