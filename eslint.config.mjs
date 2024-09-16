import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import deprecationPlugin from "eslint-plugin-deprecation";
import jestPlugin from "eslint-plugin-jest";
import playwrightPlugin from "eslint-plugin-playwright";
import testingLibraryPlugin from "eslint-plugin-testing-library";

export default [
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            deprecation: deprecationPlugin,
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
            "deprecation/deprecation": "error",
        },
    },
    {
        settings: {
            "import/parsers": {
                "@typescript-eslint/parser": [".ts", ".js", ".mjs"],
            },
            "import/resolver": {
                typescript: {
                    alwaysTryTypes: true,
                    project: "./tsconfig.json",
                },
            },
        },
    },
    {
        files: ["src/test/**/*.ts"],
        ...jestPlugin.configs["flat/recommended"],
    },
    {
        files: ["src/test/**/*.ts"],
        ...testingLibraryPlugin.configs["flat/dom"],
    },
    {
        files: ["src/test/**/*.ts"],
        rules: {
            "jest/no-identical-title": "off",
            "testing-library/no-node-access": "off",
        },
    },
    {
        files: ["src/playwright/**/*.ts"],
        ...playwrightPlugin.configs["flat/recommended"],
    },
];
