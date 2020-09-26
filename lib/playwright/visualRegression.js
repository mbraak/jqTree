var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { existsSync } from "fs";
import { open, readFile, writeFile } from "fs/promises";
import * as path from "path";
import { PNG } from "pngjs";
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const pixelmatch = require("pixelmatch");
export const matchScreenshot = (testName) => __awaiter(void 0, void 0, void 0, function* () {
    const screenshotBuffer = yield page.screenshot();
    const expectedImagePath = path.join(__dirname, `screenshots/${testName}_${deviceName || "unknown"}.png`);
    if (!existsSync(expectedImagePath)) {
        yield saveFile(expectedImagePath, screenshotBuffer);
        return;
    }
    const expectedImage = yield readPng(expectedImagePath);
    const screenshot = PNG.sync.read(screenshotBuffer);
    const [adjustedExpectedImage, adjustedScreenshot] = getImagesOfEqualSize(expectedImage, screenshot);
    const { width, height } = adjustedExpectedImage;
    const diff = new PNG({ width, height });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const mismatchedPixels = pixelmatch(adjustedExpectedImage.data, adjustedScreenshot.data, diff.data, width, height, {});
    const percentage = Math.pow((mismatchedPixels / diff.width / diff.height), 0.5);
    if (percentage >= 0.1) {
        yield saveFile(path.join(__dirname, `${testName}.png`), PNG.sync.write(adjustedScreenshot));
    }
    expect(percentage).toBeLessThan(0.1);
});
const saveFile = (filePath, buffer) => __awaiter(void 0, void 0, void 0, function* () {
    const file = yield open(filePath, "w");
    try {
        yield writeFile(filePath, buffer);
    }
    finally {
        yield file.close();
    }
});
const readPng = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const buffer = yield readFile(filePath);
    return PNG.sync.read(buffer);
});
const adjustImageSize = (image, width, height) => {
    if (image.width === width && image.height === height) {
        return image;
    }
    const adjustedImage = new PNG({ width, height });
    PNG.bitblt(image, adjustedImage, 0, 0, image.width, image.height, 0, 0);
    return adjustedImage;
};
const getImagesOfEqualSize = (image1, image2) => {
    const width = Math.max(image1.width, image2.width);
    const height = Math.max(image1.height, image2.height);
    return [
        adjustImageSize(image1, width, height),
        adjustImageSize(image2, width, height),
    ];
};
