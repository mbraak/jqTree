"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.matchScreenshot = void 0;

var _fs = require("fs");

var _promises = require("fs/promises");

var path = _interopRequireWildcard(require("path"));

var _pngjs = require("pngjs");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
var pixelmatch = require("pixelmatch");

var matchScreenshot = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(testName) {
    var screenshotBuffer, expectedImagePath, expectedImage, screenshot, _getImagesOfEqualSize, _getImagesOfEqualSize2, adjustedExpectedImage, adjustedScreenshot, width, height, diff, mismatchedPixels, percentage;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return page.screenshot();

          case 2:
            screenshotBuffer = _context.sent;
            expectedImagePath = path.join(__dirname, "screenshots/".concat(testName, "_").concat(deviceName || "unknown", ".png"));

            if ((0, _fs.existsSync)(expectedImagePath)) {
              _context.next = 8;
              break;
            }

            _context.next = 7;
            return saveFile(expectedImagePath, screenshotBuffer);

          case 7:
            return _context.abrupt("return");

          case 8:
            _context.next = 10;
            return readPng(expectedImagePath);

          case 10:
            expectedImage = _context.sent;
            screenshot = _pngjs.PNG.sync.read(screenshotBuffer);
            _getImagesOfEqualSize = getImagesOfEqualSize(expectedImage, screenshot), _getImagesOfEqualSize2 = _slicedToArray(_getImagesOfEqualSize, 2), adjustedExpectedImage = _getImagesOfEqualSize2[0], adjustedScreenshot = _getImagesOfEqualSize2[1];
            width = adjustedExpectedImage.width, height = adjustedExpectedImage.height;
            diff = new _pngjs.PNG({
              width: width,
              height: height
            }); // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call

            mismatchedPixels = pixelmatch(adjustedExpectedImage.data, adjustedScreenshot.data, diff.data, width, height, {});
            percentage = Math.pow(mismatchedPixels / diff.width / diff.height, 0.5);

            if (!(percentage >= 0.1)) {
              _context.next = 20;
              break;
            }

            _context.next = 20;
            return saveFile(path.join(__dirname, "".concat(testName, ".png")), _pngjs.PNG.sync.write(adjustedScreenshot));

          case 20:
            expect(percentage).toBeLessThan(0.1);

          case 21:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function matchScreenshot(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.matchScreenshot = matchScreenshot;

var saveFile = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(filePath, buffer) {
    var file;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _promises.open)(filePath, "w");

          case 2:
            file = _context2.sent;
            _context2.prev = 3;
            _context2.next = 6;
            return (0, _promises.writeFile)(filePath, buffer);

          case 6:
            _context2.prev = 6;
            _context2.next = 9;
            return file.close();

          case 9:
            return _context2.finish(6);

          case 10:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[3,, 6, 10]]);
  }));

  return function saveFile(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
}();

var readPng = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(filePath) {
    var buffer;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return (0, _promises.readFile)(filePath);

          case 2:
            buffer = _context3.sent;
            return _context3.abrupt("return", _pngjs.PNG.sync.read(buffer));

          case 4:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function readPng(_x4) {
    return _ref3.apply(this, arguments);
  };
}();

var adjustImageSize = function adjustImageSize(image, width, height) {
  if (image.width === width && image.height === height) {
    return image;
  }

  var adjustedImage = new _pngjs.PNG({
    width: width,
    height: height
  });

  _pngjs.PNG.bitblt(image, adjustedImage, 0, 0, image.width, image.height, 0, 0);

  return adjustedImage;
};

var getImagesOfEqualSize = function getImagesOfEqualSize(image1, image2) {
  var width = Math.max(image1.width, image2.width);
  var height = Math.max(image1.height, image2.height);
  return [adjustImageSize(image1, width, height), adjustImageSize(image2, width, height)];
};