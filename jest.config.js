module.exports = {
    modulePathIgnorePatterns: [
        "<rootDir>/build/",
        "<rootDir>/lib/",
        "<rootDir>/docs/",
        "<rootDir>/static/",
    ],
    setupFilesAfterEnv: [
        "<rootDir>/src/test/support/setupTests.ts",
        "givens/setup.js",
        "jest-extended/all",
    ],
    testEnvironment: "jsdom",
    testRegex: "\\/src\\/test\\/.*\\.test\\.ts",
    coverageDirectory: "jest-coverage",
    coverageReporters: ["json"],
};
