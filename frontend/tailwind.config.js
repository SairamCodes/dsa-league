module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0F172A",
        card: "#1E293B",
        primary: "#06B6D4",
        success: "#22C55E",
        warning: "#FACC15",
        danger: "#EF4444",
        surface2: "#161b32",
        accent: "#5b91ff",
        accent2: "#8f75ff",
        border: "rgba(255,255,255,0.08)",
      },
      boxShadow: {
        soft: "0 15px 45px rgba(0, 0, 0, 0.18)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
