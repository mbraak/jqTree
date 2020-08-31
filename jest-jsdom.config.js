module.exports = {
    modulePathIgnorePatterns: [
        "<rootDir>/build/",
        "<rootDir>/lib/",
        "<rootDir>/_site/",
        "<rootDir>/static/",
    ],
    preset: "ts-jest",
    setupFilesAfterEnv: [
        "<rootDir>/src/test/support/setupTests.ts",
        "givens/setup.js",
        "jest-extended",
    ],
    testEnvironment: "jsdom",
    testRegex: "\\/src\\/test\\/.*\\.test\\.ts",
};
