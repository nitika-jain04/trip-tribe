/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",

        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        "primary-soft": "var(--primary-soft)",
        "primary-aqua": "var(--primary-aqua)",
        "primary-blue": "var(--primary-blue)",
        "primary-orange": "var(--primary-orange)",

        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",

        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",

        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",

        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        info: "var(--info)",

        "admin-dark": "var(--admin-dark)",
        "admin-haze": "var(--admin-haze)",
        "admin-aqua": "var(--admin-aqua)",
        "admin-aquawater": "var(--admin-aquawater)",
        "admin-success": "var(--admin-success)",
        "admin-warning": "var(--admin-warning)",
        "admin-error": "var(--admin-error)",
        "admin-background": "var(--admin-background)",
        "admin-bg-warning": "var(--admin-bg-warning)",
        "admin-bg-error": "var(--admin-bg-error)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "scale-in": "scaleIn 0.5s ease-out forwards",
        "slide-in-right": "slideInRight 0.5s ease-out forwards",
        float: "float 6s ease-in-out infinite",
      },
      fontSize: {
        "body-sm": "var(--text-body-sm)",
        body: "var(--text-body)",
        "body-lg": "var(--text-body-lg)",
        "heading-sm": "var(--text-heading-sm)",
        heading: "var(--text-heading)",
        "heading-lg": "var(--text-heading-lg)",
        "heading-2xl": "var(--text-heading-2xl)",
        "display-sm": "var(--text-display-sm)",
        display: "var(--text-display)",
        "display-lg": "var(--text-display-lg)",
        "display-xl": "var(--text-display-xl)",
        "display-2xl": "var(--text-display-2xl)",
      },
    },
  },
  plugins: [],
};
