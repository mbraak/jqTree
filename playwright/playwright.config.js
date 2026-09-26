//const { devices } = require("@playwright/test");
import { devices } from "@playwright/test";

const config = {
    projects: [
        {
            name: "Chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    testDir: "./",
    webServer: {
        command:
            "COVERAGE=true SERVE=true rollup --config config/rollup.config.mjs",
        cwd: "..",
        port: 8080,
    },
};

export default config;
