const { devices } = require("@playwright/test");

const config = {
    testDir: "src/playwright",
    projects: [
        {
            name: "Chromium",
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "iPhone 6",
            use: { ...devices["iPhone 6"] },
        },
    ],
};

module.exports = config;
