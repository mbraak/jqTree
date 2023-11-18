import fs from "fs";
import path from "path";
import crypto from "crypto";
import { BrowserContext } from "@playwright/test";

const istanbulCLIOutput = path.join(process.cwd(), ".nyc_output");

const generateUUID = () => crypto.randomBytes(16).toString("hex");

export const initCoverage = async (context: BrowserContext) => {
    await fs.promises.mkdir(istanbulCLIOutput, { recursive: true });

    await context.exposeFunction(
        "collectIstanbulCoverage",
        (coverageJSON: string) => {
            if (!coverageJSON) {
                console.log("No coverage");
            } else {
                const filename = path.join(
                    istanbulCLIOutput,
                    `playwright_coverage_${generateUUID()}.json`
                );
                fs.writeFileSync(filename, coverageJSON);
            }
        }
    );
};

export const saveCoverage = async (context: BrowserContext) => {
    for (const page of context.pages()) {
        await page.evaluate(() => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const anyWindow = window as any;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const coverageData = anyWindow.__coverage__;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            anyWindow.collectIstanbulCoverage(JSON.stringify(coverageData));
        });
    }
};
