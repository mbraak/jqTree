module.exports = {
    coverageDirectory: "jest-coverage",
    coverageReporters: ["json"],
    modulePathIgnorePatterns: [
        "<rootDir>/docs/_site/",
        "<rootDir>/docs/static/",
        "<rootDir>/lib/",
    ],
    rootDir: "../",
    setupFilesAfterEnv: [
        "<rootDir>/src/test/support/setupTests.ts",
        "givens/setup.js",
        "jest-extended/all",
    ],
    setupFiles: ["<rootDir>/config/jest.polyfills.js"],
    testEnvironment: "jsdom",
    testEnvironmentOptions: {
        customExportConditions: [""],
    },
    testRegex: "\\/src\\/test\\/.*\\.test\\.ts",
    transform: {
        "\\.tsx?$": ["babel-jest", { root: __dirname }],
    },
};
