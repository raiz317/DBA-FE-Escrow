import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pemetaan diratakan agar bisa dibaca langsung sebagai bg-bg-primary & text-text-primary
        "bg-primary": "#ffffff",
        "bg-secondary": "#f9f9f9",
        "text-primary": "#111111",
        "text-secondary": "#6e6e73",

        border: {
          DEFAULT: "#d2d2d7",
        },
        accent: {
          primary: "#0071e3",
          error: "#ff3b30",
          success: "#34c759",
        },
        status: {
          pending: { bg: "#f5f5f5", text: "#6e6e73" },
          paid: { bg: "#e8f0fc", text: "#0055b3" },
          processing: { bg: "#fff5e0", text: "#996300" },
          shipped: { bg: "#f0e8fc", text: "#6600cc" },
          completed: { bg: "#e8fce8", text: "#1a7a1a" },
          cancelled: { bg: "#ffe8e8", text: "#cc0000" },
          refunded: { bg: "#fff0e8", text: "#cc5500" },
        },
        stock: {
          available: { bg: "#e8fce8", text: "#1a7a1a" },
          outOfStock: { bg: "#ffe8e8", text: "#cc0000" },
        },
      },
      fontFamily: {
        inter: ["var(--font-inter)"],
      },
      fontSize: {
        hero: ["64px", { lineHeight: "1.2", letterSpacing: "-0.03em", fontWeight: "700" }],
        "section-heading": ["40px", { lineHeight: "1.2", fontWeight: "600" }],
        body: ["15px", { lineHeight: "1.6", fontWeight: "400" }],
        label: ["13px", { lineHeight: "1.5", fontWeight: "500" }],
        xs: ["13px", { lineHeight: "1.5", fontWeight: "400" }],
      },
      spacing: {
        "section-mobile": "64px",
        "section-desktop": "96px",
      },
      maxWidth: {
        content: "1100px",
        form: "440px",
      },
      borderRadius: {
        button: "8px",
        card: "12px",
        input: "8px",
        badge: "100px",
      },
      gridTemplateColumns: {
        products: "repeat(auto-fill, minmax(300px, 1fr))",
      },
      backdropBlur: {
        navbar: "12px",
      },
      // Tambahan Keyframes untuk efek transisi halus saat halaman dimuat
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      // Tambahan Animation utilities
      animation: {
        "fade-in": "fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};
export default config;
