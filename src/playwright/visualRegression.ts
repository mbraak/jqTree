import { existsSync } from "fs";
import { open, readFile, writeFile } from "fs/promises";
import * as path from "path";
import { PNG } from "pngjs";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const pixelmatch = require("pixelmatch");

export const matchScreenshot = async (testName: string): Promise<void> => {
    const screenshotBuffer = await page.screenshot();

    const expectedImagePath = path.join(
        __dirname,
        `screenshots/${testName}_${deviceName || "unknown"}.png`
    );

    if (!existsSync(expectedImagePath)) {
        await saveFile(expectedImagePath, screenshotBuffer);
        return;
    }

    const expectedImage = await readPng(expectedImagePath);
    const screenshot = PNG.sync.read(screenshotBuffer);

    const [adjustedExpectedImage, adjustedScreenshot] = getImagesOfEqualSize(
        expectedImage,
        screenshot
    );

    const { width, height } = adjustedExpectedImage;

    const diff = new PNG({ width, height });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const mismatchedPixels = pixelmatch(
        adjustedExpectedImage.data,
        adjustedScreenshot.data,
        diff.data,
        width,
        height,
        {}
    );

    const percentage = (mismatchedPixels / diff.width / diff.height) ** 0.5;

    if (percentage >= 0.1) {
        await saveFile(
            path.join(__dirname, `${testName}.png`),
            PNG.sync.write(adjustedScreenshot)
        );
    }

    expect(percentage).toBeLessThan(0.1);
};

const saveFile = async (filePath: string, buffer: Buffer): Promise<void> => {
    const file = await open(filePath, "w");
    try {
        await writeFile(filePath, buffer);
    } finally {
        await file.close();
    }
};

const readPng = async (filePath: string): Promise<PNG> => {
    const buffer = await readFile(filePath);
    return PNG.sync.read(buffer);
};

const adjustImageSize = (image: PNG, width: number, height: number): PNG => {
    if (image.width === width && image.height === height) {
        return image;
    }

    const adjustedImage = new PNG({ width, height });
    PNG.bitblt(image, adjustedImage, 0, 0, image.width, image.height, 0, 0);
    return adjustedImage;
};

const getImagesOfEqualSize = (image1: PNG, image2: PNG): [PNG, PNG] => {
    const width = Math.max(image1.width, image2.width);
    const height = Math.max(image1.height, image2.height);

    return [
        adjustImageSize(image1, width, height),
        adjustImageSize(image2, width, height),
    ];
};
