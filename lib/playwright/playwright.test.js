"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var _test = require("@playwright/test");
var _testUtils = require("./testUtils");
var _coverage = require("./coverage");
var _ref, _ref3, _ref5, _ref7;
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw new Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw new Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var initPage = function initPage(_x, _x2) {
  return (_ref = _ref || _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(page, baseURL) {
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
  }))).apply(this, arguments);
};
var initTree = function initTree(_x3, _x4) {
  return (_ref3 = _ref3 || _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(page, _ref2) {
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
  }))).apply(this, arguments);
};
_test.test.beforeEach(function (_x5) {
  return (_ref5 = _ref5 || _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(_ref4) {
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
  }))).apply(this, arguments);
});
_test.test.afterEach(function (_x6) {
  return (_ref7 = _ref7 || _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(_ref6) {
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
  }))).apply(this, arguments);
});
_test.test.describe("without dragAndDrop", function () {
  var _ref9, _ref11, _ref13;
  _test.test.beforeEach(function (_x7) {
    return (_ref9 = _ref9 || _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(_ref8) {
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
    }))).apply(this, arguments);
  });
  (0, _test.test)("displays a tree", function (_x8) {
    return (_ref11 = _ref11 || _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(_ref10) {
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
    }))).apply(this, arguments);
  });
  (0, _test.test)("selects a node", function (_x9) {
    return (_ref13 = _ref13 || _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(_ref12) {
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
    }))).apply(this, arguments);
  });
});
_test.test.describe("with dragAndDrop", function () {
  var _ref15, _ref17;
  _test.test.beforeEach(function (_x10) {
    return (_ref15 = _ref15 || _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(_ref14) {
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
    }))).apply(this, arguments);
  });
  (0, _test.test)("moves a node", function (_x11) {
    return (_ref17 = _ref17 || _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(_ref16) {
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
    }))).apply(this, arguments);
  });
});
_test.test.describe("autoscroll when the window is scrollable", function () {
  var _ref19, _ref21, _ref23;
  (0, _test.test)("it scrolls vertically when the users drags an element to the bottom ", function (_x12) {
    return (_ref19 = _ref19 || _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(_ref18) {
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
    }))).apply(this, arguments);
  });
  (0, _test.test)("it scrolls horizontally when the users drags an element to the right", function (_x13) {
    return (_ref21 = _ref21 || _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(_ref20) {
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
    }))).apply(this, arguments);
  });
  (0, _test.test)("scrollToNode scrolls to a node", function (_x14) {
    return (_ref23 = _ref23 || _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee12(_ref22) {
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
    }))).apply(this, arguments);
  });
});
_test.test.describe("autoscroll when the container is scrollable", function () {
  var _ref25, _ref27, _ref29, _ref31;
  _test.test.beforeEach(function (_x15) {
    return (_ref25 = _ref25 || _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee13(_ref24) {
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
    }))).apply(this, arguments);
  });
  (0, _test.test)("it scrolls vertically when the users drags an element to the bottom", function (_x16) {
    return (_ref27 = _ref27 || _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee14(_ref26) {
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
    }))).apply(this, arguments);
  });
  (0, _test.test)("it scrolls horizontally when the users drags an element to the right", function (_x17) {
    return (_ref29 = _ref29 || _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee15(_ref28) {
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
    }))).apply(this, arguments);
  });
  (0, _test.test)("scrollToNode scrolls to a node", function (_x18) {
    return (_ref31 = _ref31 || _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee16(_ref30) {
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
    }))).apply(this, arguments);
  });
});