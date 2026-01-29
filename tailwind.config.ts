import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: {
                    main: "#050505",
                    section: "#0B0B0B",
                    card: "#121212",
                    elevated: "#181818",
                },
                accent: {
                    primary: "#E50914", // Netflix Red
                    secondary: "#8B5CF6", // Violet
                    highlight: "#22D3EE", // Cyan
                },
                text: {
                    primary: "#FFFFFF",
                    secondary: "#CFCFCF",
                    muted: "#8A8A8A",
                },
            },
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"],
                display: ["var(--font-clash)", "sans-serif"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-cinematic": "linear-gradient(180deg, rgba(5,5,5,0) 0%, #050505 100%)",
                "gradient-fade-right": "linear-gradient(90deg, #050505 0%, rgba(5,5,5,0) 100%)",
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out forwards",
                "fade-in-up": "fadeInUp 0.7s ease-out forwards",
                "glow": "glow 2s ease-in-out infinite alternate",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                fadeInUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                glow: {
                    "0%": { boxShadow: "0 0 5px rgba(229, 9, 20, 0.2)" },
                    "100%": { boxShadow: "0 0 20px rgba(229, 9, 20, 0.6)" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
