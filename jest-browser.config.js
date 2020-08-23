module.exports = {
    modulePathIgnorePatterns: [
        "<rootDir>/build/",
        "<rootDir>/lib/",
        "<rootDir>/_site/",
        "<rootDir>/static/",
    ],
    preset: "jest-playwright-preset",
    testRegex: "\\/src\\/playwright\\/.*\\.test\\.ts",
    setupFilesAfterEnv: ["expect-playwright"],
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
};
