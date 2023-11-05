"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.saveCoverage = exports.initCoverage = void 0;
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
var _crypto = _interopRequireDefault(require("crypto"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const istanbulCLIOutput = _path.default.join(process.cwd(), ".nyc_output");
const generateUUID = () => _crypto.default.randomBytes(16).toString("hex");
const initCoverage = async context => {
  await _fs.default.promises.mkdir(istanbulCLIOutput, {
    recursive: true
  });
  await context.exposeFunction("collectIstanbulCoverage", coverageJSON => {
    if (!coverageJSON) {
      console.log("No coverage");
    } else {
      const filename = _path.default.join(istanbulCLIOutput, `playwright_coverage_${generateUUID()}.json`);
      console.log(`Writing coverage to ${filename}`);
      _fs.default.writeFileSync(filename, coverageJSON);
    }
  });
};
exports.initCoverage = initCoverage;
const saveCoverage = async context => {
  for (const page of context.pages()) {
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const anyWindow = window;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const coverageData = anyWindow.__coverage__;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      anyWindow.collectIstanbulCoverage(JSON.stringify(coverageData));
    });
  }
};
exports.saveCoverage = saveCoverage;