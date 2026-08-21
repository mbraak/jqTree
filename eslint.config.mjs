import cspellESLintPluginRecommended from "@cspell/eslint-plugin/recommended";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import-x";
import jestDomPlugin from "eslint-plugin-jest-dom";
import jestExtendedPlugin from "eslint-plugin-jest-extended";
import perfectionistPlugin from "eslint-plugin-perfectionist";
import playwrightPlugin from "eslint-plugin-playwright";
import testingLibraryPlugin from "eslint-plugin-testing-library";
import vitestPlugin from "@vitest/eslint-plugin";

export default [
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    perfectionistPlugin.configs["recommended-natural"],
    cspellESLintPluginRecommended,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@typescript-eslint/consistent-type-imports": "error",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/interface-name-prefix": "off",
            "@typescript-eslint/no-empty-object-type": "off",
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
            "@cspell/spellchecker": [
                "error",
                {
                    configFile: "./config/cspell.json",
                },
            ],
        },
    },
    {
        files: ["src/**/*.ts"],
        rules: {
            "@typescript-eslint/naming-convention": [
                "error",
                {
                    selector: "memberLike",
                    modifiers: ["private"],
                    format: [],
                    leadingUnderscore: "require",
                },
                {
                    selector: "memberLike",
                    modifiers: ["protected"],
                    format: [],
                    leadingUnderscore: "require",
                },
            ],
        },
    },
    {
        files: ["test/**/*.ts"],
        ...vitestPlugin.configs.all,
    },
    {
        files: ["test/**/*.ts"],
        rules: {
            "import-x/no-named-as-default": "off",
            "import-x/no-named-as-default-member": "off",
            "vitest/no-duplicate-hooks": "off",
            "vitest/no-hooks": "off",
            "vitest/no-identical-title": "off",
            "vitest/prefer-called-times": "off",
            "vitest/prefer-describe-function-title": "off",
            "vitest/prefer-expect-assertions": "off",
            "vitest/prefer-importing-vitest-globals": "off",
            "vitest/prefer-lowercase-title": "off",
            "vitest/prefer-strict-boolean-matchers": "off",
            "vitest/require-hook": "off",
            "vitest/require-mock-type-parameters": "off",
        },
    },
    {
        files: ["test/**/*.ts"],
        ...testingLibraryPlugin.configs["flat/dom"],
    },
    {
        files: ["test/**/*.ts"],
        ...jestDomPlugin.configs["flat/recommended"],
    },
    {
        files: ["test/**/*.ts"],
        ...jestExtendedPlugin.configs["flat/all"],
    },
    {
        files: ["test/**/*.ts"],
        rules: {
            "perfectionist/sort-imports": [
                "error",
                {
                    internalPattern: ["^app"],
                },
            ],
        },
    },
    {
        files: ["playwright/**/*.ts"],
        ...playwrightPlugin.configs["flat/recommended"],
    },
];
