"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.matchScreenshot = void 0;
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var path = require("path");
var pngjs_1 = require("pngjs");
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
var pixelmatch = require("pixelmatch");
exports.matchScreenshot = function (testName) { return __awaiter(void 0, void 0, void 0, function () {
    var screenshotBuffer, expectedImagePath, expectedImage, screenshot, _a, adjustedExpectedImage, adjustedScreenshot, width, height, diff, mismatchedPixels, percentage;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, page.screenshot()];
            case 1:
                screenshotBuffer = _b.sent();
                expectedImagePath = path.join(__dirname, "screenshots/" + testName + "_" + (deviceName || "unknown") + ".png");
                if (!!fs_1.existsSync(expectedImagePath)) return [3 /*break*/, 3];
                return [4 /*yield*/, saveFile(expectedImagePath, screenshotBuffer)];
            case 2:
                _b.sent();
                return [2 /*return*/];
            case 3: return [4 /*yield*/, readPng(expectedImagePath)];
            case 4:
                expectedImage = _b.sent();
                screenshot = pngjs_1.PNG.sync.read(screenshotBuffer);
                _a = getImagesOfEqualSize(expectedImage, screenshot), adjustedExpectedImage = _a[0], adjustedScreenshot = _a[1];
                width = adjustedExpectedImage.width, height = adjustedExpectedImage.height;
                diff = new pngjs_1.PNG({ width: width, height: height });
                mismatchedPixels = pixelmatch(adjustedExpectedImage.data, adjustedScreenshot.data, diff.data, width, height, {});
                percentage = Math.pow((mismatchedPixels / diff.width / diff.height), 0.5);
                if (!(percentage >= 0.1)) return [3 /*break*/, 6];
                return [4 /*yield*/, saveFile(path.join(__dirname, testName + ".png"), pngjs_1.PNG.sync.write(adjustedScreenshot))];
            case 5:
                _b.sent();
                _b.label = 6;
            case 6:
                expect(percentage).toBeLessThan(0.1);
                return [2 /*return*/];
        }
    });
}); };
var saveFile = function (filePath, buffer) { return __awaiter(void 0, void 0, void 0, function () {
    var file;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, promises_1.open(filePath, "w")];
            case 1:
                file = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, , 4, 6]);
                return [4 /*yield*/, promises_1.writeFile(filePath, buffer)];
            case 3:
                _a.sent();
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, file.close()];
            case 5:
                _a.sent();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); };
var readPng = function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
    var buffer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, promises_1.readFile(filePath)];
            case 1:
                buffer = _a.sent();
                return [2 /*return*/, pngjs_1.PNG.sync.read(buffer)];
        }
    });
}); };
var adjustImageSize = function (image, width, height) {
    if (image.width === width && image.height === height) {
        return image;
    }
    var adjustedImage = new pngjs_1.PNG({ width: width, height: height });
    pngjs_1.PNG.bitblt(image, adjustedImage, 0, 0, image.width, image.height, 0, 0);
    return adjustedImage;
};
var getImagesOfEqualSize = function (image1, image2) {
    var width = Math.max(image1.width, image2.width);
    var height = Math.max(image1.height, image2.height);
    return [
        adjustImageSize(image1, width, height),
        adjustImageSize(image2, width, height),
    ];
};
