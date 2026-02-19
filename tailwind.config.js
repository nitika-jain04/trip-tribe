/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      colors: {
        // Core - IMPORTANT: Add hsl() wrapper for CSS variables
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // Primary
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        "primary-light": "hsl(var(--primary-light))",

        // Secondary
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",

        // Accent
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",

        // Status
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        error: "hsl(var(--error))",
        info: "hsl(var(--info))",

        // Admin (hex colors - no hsl wrapper needed)
        "admin-dark": "var(--admin-dark)",
        "admin-haze": "var(--admin-haze)",
        "admin-aqua": "var(--admin-aqua)",
        "admin-aquawater": "var(--admin-aquawater)",
        "admin-success": "var(--admin-success)",
        "admin-warning": "var(--admin-warning)",
        "admin-warning-alt": "var(--admin-warning-alt)",
        "admin-error": "var(--admin-error)",
        "admin-background": "var(--admin-background)",
        "admin-bg-warning": "var(--admin-bg-warning)",
        "admin-bg-error": "var(--admin-bg-error)",
        "admin-backsearch": "var(--admin-backseach)",
      },
      borderRadius: {
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "scale-in": "scaleIn 0.5s ease-out forwards",
        "slide-in-right": "slideInRight 0.5s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        bounce: "bounce 1s infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(30px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        scaleIn: {
          "0%": { opacity: 0, transform: "scale(0.95)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        slideInRight: {
          "0%": { opacity: 0, transform: "translateX(30px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        bounce: {
          "0%, 100%": {
            transform: "translateY(-25%)",
            "animation-timing-function": "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(0)",
            "animation-timing-function": "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
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
  plugins: [require("tailwindcss-animate")],
};
