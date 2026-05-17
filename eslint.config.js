import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
    ...nextVitals,
    {
        rules: {
            "react-hooks/set-state-in-effect": "off",
            "react/no-unescaped-entities": "off",
        },
    },
    {
        ignores: [
            ".next/**",
            "node_modules/**",
            "out/**",
            "build/**",
            "dist/**",
            "coverage/**",
            "ml/data/**",
            "next-env.d.ts",
        ],
    },
];

export default eslintConfig;
