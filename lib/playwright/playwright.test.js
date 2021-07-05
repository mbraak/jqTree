"use strict";

var _givens = _interopRequireDefault(require("givens"));

var _testUtil = require("./testUtil");

var _visualRegression = require("./visualRegression");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var given = (0, _givens["default"])();
given("dragAndDrop", function () {
  return false;
});
beforeEach( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return jestPlaywright.resetPage();

        case 2:
          _context.next = 4;
          return page["goto"]("http://localhost:8080/test_index.html");

        case 4:
          _context.next = 6;
          return page.waitForLoadState("domcontentloaded");

        case 6:
          _context.next = 8;
          return page.evaluate(function () {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            window["reportCodeCoverage"] = function () {
              return null;
            };
          });

        case 8:
          _context.next = 10;
          return page.evaluate("\n        const $tree = jQuery(\"#tree1\");\n\n        $tree.tree({\n            animationSpeed: 0,\n            autoOpen: 0,\n            data: ExampleData.exampleData,\n            dragAndDrop: ".concat(given.dragAndDrop, ",\n            startDndDelay: 100,\n        });\n    "));

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
})));
afterEach( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
  return regeneratorRuntime.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return jestPlaywright.saveCoverage(page);

        case 2:
        case "end":
          return _context2.stop();
      }
    }
  }, _callee2);
})));
it("displays a tree", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
  return regeneratorRuntime.wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return expect(page).toHaveText("Saurischia");

        case 2:
          _context3.next = 4;
          return expect(page).toHaveText("Ornithischians");

        case 4:
          _context3.next = 6;
          return expect(page).toHaveText("Coelophysoids");

        case 6:
          _context3.next = 8;
          return (0, _visualRegression.matchScreenshot)("displays_a_tree");

        case 8:
        case "end":
          return _context3.stop();
      }
    }
  }, _callee3);
})));
it("selects a node", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
  var saurischia;
  return regeneratorRuntime.wrap(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return expect(page).toHaveText("Saurischia");

        case 2:
          _context4.next = 4;
          return (0, _testUtil.findNodeElement)("Saurischia");

        case 4:
          saurischia = _context4.sent;
          _context4.next = 7;
          return (0, _testUtil.selectNode)(saurischia);

        case 7:
          _context4.next = 9;
          return (0, _testUtil.expectToBeSelected)(saurischia);

        case 9:
          _context4.next = 11;
          return (0, _visualRegression.matchScreenshot)("selects_a_node");

        case 11:
        case "end":
          return _context4.stop();
      }
    }
  }, _callee4);
})));
it("opens a node", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
  var theropods;
  return regeneratorRuntime.wrap(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return expect(page).toHaveText("Saurischia");

        case 2:
          _context5.next = 4;
          return (0, _testUtil.findNodeElement)("Theropods");

        case 4:
          theropods = _context5.sent;
          _context5.next = 7;
          return (0, _testUtil.expectToBeClosed)(theropods);

        case 7:
          _context5.next = 9;
          return (0, _testUtil.openNode)(theropods);

        case 9:
          _context5.next = 11;
          return (0, _testUtil.expectToBeOpen)(theropods);

        case 11:
          _context5.next = 13;
          return (0, _visualRegression.matchScreenshot)("opens_a_node");

        case 13:
        case "end":
          return _context5.stop();
      }
    }
  }, _callee5);
})));
describe("dragAndDrop", function () {
  given("dragAndDrop", function () {
    return true;
  });
  it("moves a node", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return (0, _testUtil.dragAndDrop)("Herrerasaurians", "Ornithischians");

          case 2:
            _context6.next = 4;
            return (0, _testUtil.getTreeStructure)().then(function (structure) {
              expect(structure).toEqual([expect.objectContaining({
                name: "Saurischia",
                children: [expect.objectContaining({
                  name: "Theropods"
                }), expect.objectContaining({
                  name: "Sauropodomorphs"
                })]
              }), expect.objectContaining({
                name: "Ornithischians",
                children: [expect.objectContaining({
                  name: "Herrerasaurians"
                }), expect.objectContaining({
                  name: "Heterodontosaurids"
                }), expect.objectContaining({
                  name: "Thyreophorans"
                }), expect.objectContaining({
                  name: "Ornithopods"
                }), expect.objectContaining({
                  name: "Pachycephalosaurians"
                }), expect.objectContaining({
                  name: "Ceratopsians"
                })]
              })]);
            });

          case 4:
            _context6.next = 6;
            return (0, _visualRegression.matchScreenshot)("moves_a_node");

          case 6:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  })));
});