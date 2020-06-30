module.exports = {
    coverageDirectory: "coverage",
    preset: "ts-jest",
    rootDir: "src",
    setupFilesAfterEnv: [
        "<rootDir>/test/support/setupTests.ts",
        "givens/setup.js",
    ],
    testEnvironment: "jsdom",
};
