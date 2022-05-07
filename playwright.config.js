//import { devices } from "@playwright/test";
const { devices } = require("@playwright/test");

const config = {
    testDir: "src/playwright",
    projects: [
        {
            name: "Chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
};

module.exports = config;
