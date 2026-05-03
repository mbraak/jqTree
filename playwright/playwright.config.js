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
        command: "pnpm devserver-with-coverage",
        cwd: "..",
        port: 8080,
    },
};

export default config;
