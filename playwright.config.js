const { devices } = require("@playwright/test");

const config = {
    testDir: "src/playwright",
    projects: [
        {
            name: "Chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: {
        command: "pnpm devserver-with-coverage",
        port: 8080,
    },
};

module.exports = config;
