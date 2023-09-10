"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var _test = require("@playwright/test");
var _testUtils = require("./testUtils");
var _coverage = require("./coverage");
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var initPage = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(page, baseURL) {
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          if (baseURL) {
            _context.next = 2;
            break;
          }
          throw new Error("Missing baseURL");
        case 2:
          _context.next = 4;
          return page["goto"]("".concat(baseURL, "/test_index.html"));
        case 4:
          _context.next = 6;
          return page.waitForLoadState("domcontentloaded");
        case 6:
          page.on("console", function (msg) {
            return console.log("console: ".concat(msg.text()));
          });
          _context.next = 9;
          return page.evaluate("\n        console.log(window.__coverage__ ? 'Coverage enabled' : 'Coverage not enabled');\n    ");
        case 9:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function initPage(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
var initTree = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(page, _ref2) {
    var autoOpen, dragAndDrop;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          autoOpen = _ref2.autoOpen, dragAndDrop = _ref2.dragAndDrop;
          _context2.next = 3;
          return page.evaluate("\n        const $tree = jQuery(\"#tree1\");\n\n        $tree.tree({\n            animationSpeed: 0,\n            autoOpen: ".concat(autoOpen || 0, ",\n            data: ExampleData.exampleData,\n            dragAndDrop: ").concat(dragAndDrop || false, ",\n            startDndDelay: 100,\n        });\n    "));
        case 3:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return function initTree(_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
}();
_test.test.beforeEach( /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(_ref4) {
    var context;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          context = _ref4.context;
          _context3.next = 3;
          return (0, _coverage.initCoverage)(context);
        case 3:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return function (_x5) {
    return _ref5.apply(this, arguments);
  };
}());
_test.test.afterEach( /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(_ref6) {
    var context;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          context = _ref6.context;
          _context4.next = 3;
          return (0, _coverage.saveCoverage)(context);
        case 3:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return function (_x6) {
    return _ref7.apply(this, arguments);
  };
}());
_test.test.describe("without dragAndDrop", function () {
  _test.test.beforeEach( /*#__PURE__*/function () {
    var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(_ref8) {
      var baseURL, page;
      return _regeneratorRuntime().wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            baseURL = _ref8.baseURL, page = _ref8.page;
            _context5.next = 3;
            return initPage(page, baseURL);
          case 3:
            _context5.next = 5;
            return initTree(page, {
              dragAndDrop: false
            });
          case 5:
          case "end":
            return _context5.stop();
        }
      }, _callee5);
    }));
    return function (_x7) {
      return _ref9.apply(this, arguments);
    };
  }());
  (0, _test.test)("displays a tree", /*#__PURE__*/function () {
    var _ref11 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(_ref10) {
      var page, screenshot;
      return _regeneratorRuntime().wrap(function _callee6$(_context6) {
        while (1) switch (_context6.prev = _context6.next) {
          case 0:
            page = _ref10.page;
            _context6.next = 3;
            return (0, _test.expect)(page.locator("body")).toHaveText(/.*Saurischia.*/);
          case 3:
            _context6.next = 5;
            return (0, _test.expect)(page.locator("body")).toHaveText(/.*Ornithischians.*/);
          case 5:
            _context6.next = 7;
            return (0, _test.expect)(page.locator("body")).toHaveText(/.*Coelophysoids.*/);
          case 7:
            _context6.next = 9;
            return page.screenshot();
          case 9:
            screenshot = _context6.sent;
            (0, _test.expect)(screenshot).toMatchSnapshot();
          case 11:
          case "end":
            return _context6.stop();
        }
      }, _callee6);
    }));
    return function (_x8) {
      return _ref11.apply(this, arguments);
    };
  }());
  (0, _test.test)("selects a node", /*#__PURE__*/function () {
    var _ref13 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(_ref12) {
      var page, saurischia, screenshot;
      return _regeneratorRuntime().wrap(function _callee7$(_context7) {
        while (1) switch (_context7.prev = _context7.next) {
          case 0:
            page = _ref12.page;
            _context7.next = 3;
            return (0, _test.expect)(page.locator("body")).toHaveText(/.*Saurischia.*/);
          case 3:
            _context7.next = 5;
            return (0, _testUtils.findNodeElement)(page, "Saurischia");
          case 5:
            saurischia = _context7.sent;
            _context7.next = 8;
            return (0, _testUtils.selectNode)(saurischia);
          case 8:
            _context7.next = 10;
            return page.screenshot();
          case 10:
            screenshot = _context7.sent;
            (0, _test.expect)(screenshot).toMatchSnapshot();
          case 12:
          case "end":
            return _context7.stop();
        }
      }, _callee7);
    }));
    return function (_x9) {
      return _ref13.apply(this, arguments);
    };
  }());
});
_test.test.describe("with dragAndDrop", function () {
  _test.test.beforeEach( /*#__PURE__*/function () {
    var _ref15 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(_ref14) {
      var baseURL, page;
      return _regeneratorRuntime().wrap(function _callee8$(_context8) {
        while (1) switch (_context8.prev = _context8.next) {
          case 0:
            baseURL = _ref14.baseURL, page = _ref14.page;
            _context8.next = 3;
            return initPage(page, baseURL);
          case 3:
            _context8.next = 5;
            return initTree(page, {
              dragAndDrop: true
            });
          case 5:
          case "end":
            return _context8.stop();
        }
      }, _callee8);
    }));
    return function (_x10) {
      return _ref15.apply(this, arguments);
    };
  }());
  (0, _test.test)("moves a node", /*#__PURE__*/function () {
    var _ref17 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(_ref16) {
      var page, structure, screenshot;
      return _regeneratorRuntime().wrap(function _callee9$(_context9) {
        while (1) switch (_context9.prev = _context9.next) {
          case 0:
            page = _ref16.page;
            _context9.next = 3;
            return (0, _testUtils.dragAndDrop)(page, "Herrerasaurians", "Ornithischians");
          case 3:
            _context9.next = 5;
            return (0, _testUtils.getTreeStructure)(page);
          case 5:
            structure = _context9.sent;
            (0, _test.expect)(structure).toEqual([_test.expect.objectContaining({
              name: "Saurischia",
              children: [_test.expect.objectContaining({
                name: "Theropods"
              }), _test.expect.objectContaining({
                name: "Sauropodomorphs"
              })]
            }), _test.expect.objectContaining({
              name: "Ornithischians",
              children: [_test.expect.objectContaining({
                name: "Herrerasaurians"
              }), _test.expect.objectContaining({
                name: "Heterodontosaurids"
              }), _test.expect.objectContaining({
                name: "Thyreophorans"
              }), _test.expect.objectContaining({
                name: "Ornithopods"
              }), _test.expect.objectContaining({
                name: "Pachycephalosaurians"
              }), _test.expect.objectContaining({
                name: "Ceratopsians"
              })]
            })]);
            _context9.next = 9;
            return page.screenshot();
          case 9:
            screenshot = _context9.sent;
            (0, _test.expect)(screenshot).toMatchSnapshot();
          case 11:
          case "end":
            return _context9.stop();
        }
      }, _callee9);
    }));
    return function (_x11) {
      return _ref17.apply(this, arguments);
    };
  }());
});
_test.test.describe("autoscroll when the window is scrollable", function () {
  (0, _test.test)("it scrolls vertically when the users drags an element to the bottom ", /*#__PURE__*/function () {
    var _ref19 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(_ref18) {
      var baseURL, page;
      return _regeneratorRuntime().wrap(function _callee10$(_context10) {
        while (1) switch (_context10.prev = _context10.next) {
          case 0:
            baseURL = _ref18.baseURL, page = _ref18.page;
            _context10.next = 3;
            return page.setViewportSize({
              width: 200,
              height: 100
            });
          case 3:
            _context10.next = 5;
            return initPage(page, baseURL);
          case 5:
            _context10.next = 7;
            return initTree(page, {
              autoOpen: 3,
              dragAndDrop: true
            });
          case 7:
            _context10.t0 = _test.expect;
            _context10.next = 10;
            return page.getByRole("document").evaluate(function (element) {
              return element.scrollTop;
            });
          case 10:
            _context10.t1 = _context10.sent;
            (0, _context10.t0)(_context10.t1).toEqual(0);
            _context10.next = 14;
            return (0, _testUtils.moveMouseToNode)(page, "Saurischia");
          case 14:
            _context10.next = 16;
            return page.mouse.down();
          case 16:
            _context10.next = 18;
            return page.waitForTimeout(200);
          case 18:
            _context10.next = 20;
            return page.mouse.move(20, 190);
          case 20:
            _context10.next = 22;
            return page.waitForTimeout(50);
          case 22:
            _context10.t2 = _test.expect;
            _context10.next = 25;
            return page.getByRole("document").evaluate(function (element) {
              return element.scrollTop;
            });
          case 25:
            _context10.t3 = _context10.sent;
            (0, _context10.t2)(_context10.t3).toBeGreaterThan(0);
          case 27:
          case "end":
            return _context10.stop();
        }
      }, _callee10);
    }));
    return function (_x12) {
      return _ref19.apply(this, arguments);
    };
  }());
  (0, _test.test)("it scrolls horizontally when the users drags an element to the right", /*#__PURE__*/function () {
    var _ref21 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(_ref20) {
      var baseURL, page;
      return _regeneratorRuntime().wrap(function _callee11$(_context11) {
        while (1) switch (_context11.prev = _context11.next) {
          case 0:
            baseURL = _ref20.baseURL, page = _ref20.page;
            _context11.next = 3;
            return page.setViewportSize({
              width: 60,
              height: 400
            });
          case 3:
            _context11.next = 5;
            return initPage(page, baseURL);
          case 5:
            _context11.next = 7;
            return initTree(page, {
              autoOpen: 3,
              dragAndDrop: true
            });
          case 7:
            _context11.t0 = _test.expect;
            _context11.next = 10;
            return page.getByRole("document").evaluate(function (element) {
              return element.scrollLeft;
            });
          case 10:
            _context11.t1 = _context11.sent;
            (0, _context11.t0)(_context11.t1).toEqual(0);
            _context11.next = 14;
            return (0, _testUtils.moveMouseToNode)(page, "Saurischia");
          case 14:
            _context11.next = 16;
            return page.mouse.down();
          case 16:
            _context11.next = 18;
            return page.waitForTimeout(200);
          case 18:
            _context11.next = 20;
            return page.mouse.move(55, 10);
          case 20:
            _context11.next = 22;
            return page.waitForTimeout(50);
          case 22:
            _context11.t2 = _test.expect;
            _context11.next = 25;
            return page.getByRole("document").evaluate(function (element) {
              return element.scrollLeft;
            });
          case 25:
            _context11.t3 = _context11.sent;
            (0, _context11.t2)(_context11.t3).toBeGreaterThan(0);
          case 27:
          case "end":
            return _context11.stop();
        }
      }, _callee11);
    }));
    return function (_x13) {
      return _ref21.apply(this, arguments);
    };
  }());
  (0, _test.test)("scrollToNode scrolls to a node", /*#__PURE__*/function () {
    var _ref23 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee12(_ref22) {
      var baseURL, page;
      return _regeneratorRuntime().wrap(function _callee12$(_context12) {
        while (1) switch (_context12.prev = _context12.next) {
          case 0:
            baseURL = _ref22.baseURL, page = _ref22.page;
            _context12.next = 3;
            return page.setViewportSize({
              width: 200,
              height: 100
            });
          case 3:
            _context12.next = 5;
            return initPage(page, baseURL);
          case 5:
            _context12.next = 7;
            return initTree(page, {
              autoOpen: 3,
              dragAndDrop: true
            });
          case 7:
            _context12.t0 = _test.expect;
            _context12.next = 10;
            return page.getByRole("document").evaluate(function (element) {
              return element.scrollTop;
            });
          case 10:
            _context12.t1 = _context12.sent;
            (0, _context12.t0)(_context12.t1).toEqual(0);
            _context12.next = 14;
            return page.evaluate("\n            const $tree = jQuery(\"#tree1\");\n            const node = $tree.tree(\"getNodeByName\", \"Sauropodomorphs\");\n            $tree.tree(\"scrollToNode\",node);\n        ");
          case 14:
            _context12.t2 = _test.expect;
            _context12.next = 17;
            return page.getByRole("document").evaluate(function (element) {
              return element.scrollTop;
            });
          case 17:
            _context12.t3 = _context12.sent;
            (0, _context12.t2)(_context12.t3).toBeGreaterThan(0);
          case 19:
          case "end":
            return _context12.stop();
        }
      }, _callee12);
    }));
    return function (_x14) {
      return _ref23.apply(this, arguments);
    };
  }());
});
_test.test.describe("autoscroll when the container is scrollable", function () {
  _test.test.beforeEach( /*#__PURE__*/function () {
    var _ref25 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee13(_ref24) {
      var page, baseURL;
      return _regeneratorRuntime().wrap(function _callee13$(_context13) {
        while (1) switch (_context13.prev = _context13.next) {
          case 0:
            page = _ref24.page, baseURL = _ref24.baseURL;
            _context13.next = 3;
            return initPage(page, baseURL);
          case 3:
            _context13.next = 5;
            return page.evaluate("\n            document.body.style.marginLeft = \"40px\";\n            document.body.style.marginTop = \"40px\";\n\n            const treeElement = document.querySelector(\"#tree1\");\n\n            const container = document.createElement(\"div\");\n            container.id = \"container\";\n            container.style.height = \"200px\";\n            container.style.width = \"60px\";\n            container.style.overflowY = \"scroll\";\n\n            document.body.replaceChild(container, treeElement);\n            container.appendChild(treeElement);\n        ");
          case 5:
            _context13.next = 7;
            return initTree(page, {
              autoOpen: 3,
              dragAndDrop: true
            });
          case 7:
          case "end":
            return _context13.stop();
        }
      }, _callee13);
    }));
    return function (_x15) {
      return _ref25.apply(this, arguments);
    };
  }());
  (0, _test.test)("it scrolls vertically when the users drags an element to the bottom", /*#__PURE__*/function () {
    var _ref27 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee14(_ref26) {
      var page;
      return _regeneratorRuntime().wrap(function _callee14$(_context14) {
        while (1) switch (_context14.prev = _context14.next) {
          case 0:
            page = _ref26.page;
            _context14.t0 = _test.expect;
            _context14.next = 4;
            return page.locator("#container").evaluate(function (element) {
              return element.scrollTop;
            });
          case 4:
            _context14.t1 = _context14.sent;
            (0, _context14.t0)(_context14.t1).toEqual(0);
            _context14.next = 8;
            return (0, _testUtils.moveMouseToNode)(page, "Saurischia");
          case 8:
            _context14.next = 10;
            return page.mouse.down();
          case 10:
            _context14.next = 12;
            return page.waitForTimeout(200);
          case 12:
            _context14.next = 14;
            return page.mouse.move(20, 245);
          case 14:
            _context14.next = 16;
            return page.waitForTimeout(50);
          case 16:
            _context14.t2 = _test.expect;
            _context14.next = 19;
            return page.locator("#container").evaluate(function (element) {
              return element.scrollTop;
            });
          case 19:
            _context14.t3 = _context14.sent;
            (0, _context14.t2)(_context14.t3).toBeGreaterThan(0);
          case 21:
          case "end":
            return _context14.stop();
        }
      }, _callee14);
    }));
    return function (_x16) {
      return _ref27.apply(this, arguments);
    };
  }());
  (0, _test.test)("it scrolls horizontally when the users drags an element to the right", /*#__PURE__*/function () {
    var _ref29 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee15(_ref28) {
      var page;
      return _regeneratorRuntime().wrap(function _callee15$(_context15) {
        while (1) switch (_context15.prev = _context15.next) {
          case 0:
            page = _ref28.page;
            _context15.t0 = _test.expect;
            _context15.next = 4;
            return page.locator("#container").evaluate(function (element) {
              return element.scrollLeft;
            });
          case 4:
            _context15.t1 = _context15.sent;
            (0, _context15.t0)(_context15.t1).toEqual(0);
            _context15.next = 8;
            return (0, _testUtils.moveMouseToNode)(page, "Saurischia");
          case 8:
            _context15.next = 10;
            return page.mouse.down();
          case 10:
            _context15.next = 12;
            return page.waitForTimeout(200);
          case 12:
            _context15.next = 14;
            return page.mouse.move(100, 50);
          case 14:
            _context15.next = 16;
            return page.waitForTimeout(50);
          case 16:
            _context15.t2 = _test.expect;
            _context15.next = 19;
            return page.locator("#container").evaluate(function (element) {
              return element.scrollLeft;
            });
          case 19:
            _context15.t3 = _context15.sent;
            (0, _context15.t2)(_context15.t3).toBeGreaterThan(0);
          case 21:
          case "end":
            return _context15.stop();
        }
      }, _callee15);
    }));
    return function (_x17) {
      return _ref29.apply(this, arguments);
    };
  }());
  (0, _test.test)("scrollToNode scrolls to a node", /*#__PURE__*/function () {
    var _ref31 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee16(_ref30) {
      var page;
      return _regeneratorRuntime().wrap(function _callee16$(_context16) {
        while (1) switch (_context16.prev = _context16.next) {
          case 0:
            page = _ref30.page;
            _context16.t0 = _test.expect;
            _context16.next = 4;
            return page.locator("#container").evaluate(function (element) {
              return element.scrollTop;
            });
          case 4:
            _context16.t1 = _context16.sent;
            (0, _context16.t0)(_context16.t1).toEqual(0);
            _context16.next = 8;
            return page.evaluate("\n            const $tree = jQuery(\"#tree1\");\n            const node = $tree.tree(\"getNodeByName\", \"Sauropodomorphs\");\n            $tree.tree(\"scrollToNode\",node);\n        ");
          case 8:
            _context16.t2 = _test.expect;
            _context16.next = 11;
            return page.locator("#container").evaluate(function (element) {
              return element.scrollTop;
            });
          case 11:
            _context16.t3 = _context16.sent;
            (0, _context16.t2)(_context16.t3).toBeGreaterThan(0);
          case 13:
          case "end":
            return _context16.stop();
        }
      }, _callee16);
    }));
    return function (_x18) {
      return _ref31.apply(this, arguments);
    };
  }());
});