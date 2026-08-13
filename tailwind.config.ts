import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: {
                    main: "#030305",
                    secondary: "#07070C",
                    surface: "#0B0B11",
                    elevated: "#111118",
                },
                glass: "rgba(255,255,255,0.035)",
                border: "rgba(255,255,255,0.07)",
                accent: {
                    primary: "#FF3158",
                    secondary: "#8B5CF6",
                },
                text: {
                    primary: "#FFFFFF",
                    secondary: "#A1A1AA",
                    muted: "#71717A",
                },
                status: {
                    success: "#10B981",
                    warning: "#F59E0B",
                    danger: "#EF4444",
                }
            },
            fontFamily: {
                sans: ["var(--font-inter)", "var(--font-dm-sans)", "sans-serif"],
                display: ["var(--font-outfit)", "sans-serif"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-cinematic": "linear-gradient(180deg, rgba(3,3,5,0) 0%, #030305 100%)",
                "gradient-fade-right": "linear-gradient(90deg, #030305 0%, rgba(3,3,5,0) 100%)",
                "gradient-fade-left": "linear-gradient(270deg, #030305 0%, rgba(3,3,5,0) 100%)",
                "gradient-accent": "linear-gradient(135deg, #FF3158 0%, #8B5CF6 100%)",
            },
            boxShadow: {
                'cinematic-glow': '0 0 40px -10px rgba(255, 49, 88, 0.4)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'elevated': '0 20px 40px -10px rgba(0,0,0,0.5)',
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out forwards",
                "fade-in-up": "fadeInUp 0.7s ease-out forwards",
                "glow": "glow 2s ease-in-out infinite alternate",
                "shimmer": "shimmer 2s linear infinite",
                "ambient-pulse": "ambientPulse 10s ease-in-out infinite",
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
                    "0%": { boxShadow: "0 0 5px rgba(255, 49, 88, 0.2)" },
                    "100%": { boxShadow: "0 0 20px rgba(255, 49, 88, 0.6)" },
                },
                shimmer: {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(100%)" },
                },
                ambientPulse: {
                    "0%, 100%": { opacity: "0.5" },
                    "50%": { opacity: "0.8" },
                }
            },
        },
    },
    plugins: [],
};
export default config;
