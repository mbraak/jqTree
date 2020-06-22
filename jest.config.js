module.exports = {
    coverageDirectory: "coverage",
    preset: "ts-jest",
    rootDir: "test",
    setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
    testEnvironment: "jsdom",
};
