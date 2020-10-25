module.exports = {
    modulePathIgnorePatterns: [
        "<rootDir>/build/",
        "<rootDir>/lib/",
        "<rootDir>/_site/",
        "<rootDir>/static/",
    ],
    preset: "jest-playwright-preset",
    testRegex: "\\/src\\/playwright\\/.*\\.test\\.ts",
    setupFilesAfterEnv: ["expect-playwright", "givens/setup.js"],
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    coveragePathIgnorePatterns: [
        "<rootDir>/node_modules/",
        "<rootDir>/src/playwright/",
    ],
};
