import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{ts,tsx,js,jsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                display: [
                    "Space Grotesk",
                    "system-ui",
                    "sans-serif",
                ],
                mono: ["JetBrains Mono", "monospace"],
            },
            colors: {
                studio: {
                    50: "#f5f7ff",
                    100: "#d8e0ff",
                    200: "#b3c1ff",
                    300: "#8ca1ff",
                    400: "#6c81ff",
                    500: "#4d63ff",
                    600: "#394ad6",
                    700: "#2a39a8",
                    800: "#1d2779",
                    900: "#12194d",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            boxShadow: {
                glow: "0 0 30px rgba(108, 129, 255, 0.35)",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;
