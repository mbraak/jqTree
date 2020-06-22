module.exports = {
    coverageDirectory: "coverage",
    preset: "ts-jest",
    rootDir: "src",
    setupFilesAfterEnv: ["<rootDir>/test/setupTests.ts"],
    testEnvironment: "jsdom",
};
