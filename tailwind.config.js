/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        /* core */
        background: "var(--background)",
        foreground: "var(--foreground)",

        /* brand */
        primary: "var(--primary)",
        primarySoft: "var(--primary-soft)",

        /* neutrals */
        muted: "var(--text-muted)",
        overlay: "var(--overlay-light)",
        surface: "var(--surface-light)",
        surfaceAlt: "var(--surface-lighter)",
        backgroundDark: "var(--background-dark)",

        /* status */
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        info: "var(--info)",

        /* admin */
        adminBg: "var(--admin-dark)",
        adminMuted: "var(--admin-haze)",

        adminPrimary: "var(--admin-aqua)",
        adminPrimaryAlt: "var(--admin-aquawater)",

        adminSuccess: "var(--admin-success)",
        adminWarning: "var(--admin-warning)",
        adminWarningAlt: "var(--admin-warning-alt)",
        adminError: "var(--admin-error)",
      },
    },
  },
  plugins: [],
};
