module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#121421",
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
