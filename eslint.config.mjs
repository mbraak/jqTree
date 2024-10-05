import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import jestPlugin from "eslint-plugin-jest";
import perfectionistPlugin from "eslint-plugin-perfectionist";
import playwrightPlugin from "eslint-plugin-playwright";

export default [
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    perfectionistPlugin.configs["recommended-natural"],
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/interface-name-prefix": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-use-before-define": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/non-nullable-type-assertion-style": "off",
            "@typescript-eslint/prefer-includes": "off",
            "@typescript-eslint/triple-slash-reference": "off",
            "@typescript-eslint/prefer-string-starts-ends-with": "off",
            "@typescript-eslint/restrict-template-expressions": [
                "error",
                {
                    allowNumber: true,
                    allowBoolean: true,
                    allowAny: false,
                    allowNullish: false,
                },
            ],
            "@typescript-eslint/unified-signatures": "off",
        },
    },
    {
        files: ["src/test/**/*.ts"],
        ...jestPlugin.configs["flat/recommended"],
    },
    {
        files: ["src/test/**/*.ts"],
        rules: {
            "jest/no-identical-title": "off",
        },
    },
    {
        files: ["src/playwright/**/*.ts"],
        ...playwrightPlugin.configs["flat/recommended"],
    },
];
