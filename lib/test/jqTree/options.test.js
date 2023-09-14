"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var _givens = _interopRequireDefault(require("givens"));
var _dom = require("@testing-library/dom");
var _msw = require("msw");
var _node = require("msw/node");
require("../../tree.jquery");
var _exampleData = _interopRequireDefault(require("../support/exampleData"));
var _testUtil = require("../support/testUtil");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw new Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw new Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var context = describe;
var server = (0, _node.setupServer)();
beforeAll(function () {
  return server.listen();
});
beforeEach(function () {
  $("body").append('<div id="tree1"></div>');
});
afterEach(function () {
  server.resetHandlers();
  var $tree = $("#tree1");
  $tree.tree("destroy");
  $tree.remove();
  localStorage.clear();
});
afterAll(function () {
  return server.close();
});
describe("autoEscape", function () {
  var given = (0, _givens["default"])();
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      autoEscape: given.autoEscape,
      data: ["<span>test</span>"]
    });
  });
  context("with autoEscape true", function () {
    given("autoEscape", function () {
      return true;
    });
    it("escapes the node name", function () {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "&lt;span&gt;test&lt;/span&gt;"
      })]);
    });
  });
  context("with autoEscape false", function () {
    given("autoEscape", function () {
      return false;
    });
    it("doesn't escape the node name", function () {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "<span>test</span>"
      })]);
    });
  });
});
describe("autoOpen", function () {
  var given = (0, _givens["default"])();
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      autoOpen: given.autoOpen,
      data: _exampleData["default"]
    });
  });
  context("with autoOpen false", function () {
    given("autoOpen", function () {
      return false;
    });
    it("doesn't open any nodes", function () {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1",
        open: false
      }), expect.objectContaining({
        name: "node2",
        open: false
      })]);
    });
  });
  context("with autoOpen true", function () {
    given("autoOpen", function () {
      return true;
    });
    it("opens all nodes", function () {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1",
        open: true
      }), expect.objectContaining({
        name: "node2",
        open: true,
        children: [expect.objectContaining({
          name: "node3",
          open: true
        })]
      })]);
    });
  });
  context("with autoOpen 0", function () {
    given("autoOpen", function () {
      return 0;
    });
    it("opens level 0", function () {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1",
        open: true
      }), expect.objectContaining({
        name: "node2",
        open: true,
        children: [expect.objectContaining({
          name: "node3",
          open: false
        })]
      })]);
    });
  });
  context("with autoOpen 1", function () {
    given("autoOpen", function () {
      return 1;
    });
    it("opens levels 1", function () {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1",
        open: true
      }), expect.objectContaining({
        name: "node2",
        open: true,
        children: [expect.objectContaining({
          name: "node3",
          open: true
        })]
      })]);
    });
  });
  context("with autoOpen '1'", function () {
    given("autoOpen", function () {
      return "1";
    });
    it("opens levels 1", function () {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1",
        open: true
      }), expect.objectContaining({
        name: "node2",
        open: true,
        children: [expect.objectContaining({
          name: "node3",
          open: true
        })]
      })]);
    });
  });
});
describe("closedIcon", function () {
  it("renders a string", function () {
    var $tree = $("#tree1");
    $tree.tree({
      closedIcon: "closed",
      data: _exampleData["default"]
    });
    var $button = $tree.find("a.jqtree-toggler:first");
    expect($button.text()).toBe("closed");
  });
  it("escapes html", function () {
    var $tree = $("#tree1");
    $tree.tree({
      closedIcon: "<span>test</span>",
      data: _exampleData["default"]
    });
    var $button = $tree.find("a.jqtree-toggler:first");
    expect($button.text()).toBe("<span>test</span>");
  });
  it("renders a jquery element", function () {
    var $tree = $("#tree1");
    $tree.tree({
      closedIcon: $("<span class='abc'>test</span>"),
      data: _exampleData["default"]
    });
    var $span = $tree.find("a.jqtree-toggler:first span.abc");
    expect($span.text()).toBe("test");
  });
  it("renders a html element", function () {
    var closedIcon = document.createElement("span");
    closedIcon.className = "abc";
    closedIcon.textContent = "test";
    var $tree = $("#tree1");
    $tree.tree({
      closedIcon: closedIcon,
      data: _exampleData["default"]
    });
    var $span = $tree.find("a.jqtree-toggler:first span.abc");
    expect($span.text()).toBe("test");
  });
});
describe("dataUrl", function () {
  var exampleStructure = [expect.objectContaining({
    name: "node1"
  }), expect.objectContaining({
    name: "node2"
  })];
  var testCases = [{
    name: "string",
    dataUrl: "/tree/",
    expectedNode: "node1",
    expectedStructure: exampleStructure
  }, {
    name: "object with url and headers",
    dataUrl: {
      url: "/tree/",
      headers: {
        node: "test-node"
      }
    },
    expectedNode: "test-node",
    expectedStructure: [expect.objectContaining({
      name: "test-node"
    })]
  }, {
    name: "function",
    dataUrl: function dataUrl() {
      return {
        url: "/tree/"
      };
    },
    expectedNode: "node1",
    expectedStructure: exampleStructure
  }];
  beforeEach(function () {
    server.use(_msw.rest.get("/tree/", function (request, response, ctx) {
      var nodeName = request.headers.get("node");
      var data = nodeName ? [nodeName] : _exampleData["default"];
      return response(ctx.status(200), ctx.json(data));
    }));
  });
  var given = (0, _givens["default"])();
  given("$tree", function () {
    return $("#tree1");
  });
  testCases.forEach(function (_ref) {
    var dataUrl = _ref.dataUrl,
      expectedNode = _ref.expectedNode,
      expectedStructure = _ref.expectedStructure,
      name = _ref.name;
    context("with ".concat(name), function () {
      it("loads the data from the url", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              given.$tree.tree({
                dataUrl: dataUrl
              });
              _context.next = 3;
              return _dom.screen.findByText(expectedNode);
            case 3:
              expect(given.$tree).toHaveTreeStructure(expectedStructure);
            case 4:
            case "end":
              return _context.stop();
          }
        }, _callee);
      })));
    });
  });
});
describe("onCanSelectNode", function () {
  var given = (0, _givens["default"])();
  given("node1", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node1");
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: _exampleData["default"],
      onCanSelectNode: function onCanSelectNode(node) {
        return node.name !== "node1";
      }
    });
  });
  it("doesn't select the node", function () {
    given.$tree.tree("selectNode", given.node1);
    expect(given.$tree.tree("getSelectedNode")).toBe(false);
  });
});
describe("onCreateLi", function () {
  var given = (0, _givens["default"])();
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: _exampleData["default"],
      onCreateLi: function onCreateLi(node, el) {
        (0, _testUtil.titleSpan)(el).text("_".concat(node.name, "_"));
      }
    });
  });
  it("is called when creating a node", function () {
    expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
      name: "_node1_"
    }), expect.objectContaining({
      name: "_node2_"
    })]);
  });
});
describe("onGetStateFromStorage and onSetStateFromStorage", function () {
  var savedState = "";
  var setState = function setState(state) {
    savedState = state;
  };
  var getState = function getState() {
    return savedState;
  };
  var given = (0, _givens["default"])();
  given("initialState", function () {
    return "";
  });
  given("node1", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node1");
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    savedState = given.initialState;
    given.$tree.tree({
      autoOpen: false,
      data: _exampleData["default"],
      onGetStateFromStorage: getState,
      onSetStateFromStorage: setState,
      saveState: true
    });
  });
  context("with an open and a selected node", function () {
    beforeEach(function () {
      given.$tree.tree("selectNode", given.node1);
      given.$tree.tree("openNode", given.node1);
    });
    it("saves the state", function () {
      expect(JSON.parse(savedState)).toEqual({
        open_nodes: [123],
        selected_node: [123]
      });
    });
  });
  context("with a saved state", function () {
    given("initialState", function () {
      return JSON.stringify({
        open_nodes: [123],
        selected_node: [123]
      });
    });
    it("restores the state", function () {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1",
        open: true
      }), expect.objectContaining({
        name: "node2",
        open: false
      })]);
      expect(given.node1.element).toBeSelected();
    });
  });
});
describe("onLoadFailed", function () {
  var given = (0, _givens["default"])();
  given("$tree", function () {
    return $("#tree1");
  });
  context("when the loading fails", function () {
    beforeEach(function () {
      server.use(_msw.rest.get("/tree/", function (_request, response, ctx) {
        return response(ctx.status(500), ctx.body("Internal server error"));
      }));
    });
    it("calls onLoadFailed", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
      var onLoadFailed;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            onLoadFailed = jest.fn();
            given.$tree.tree({
              dataUrl: "/tree/",
              onLoadFailed: onLoadFailed
            });
            _context2.next = 4;
            return (0, _dom.waitFor)(function () {
              expect(onLoadFailed).toHaveBeenCalledWith(expect.objectContaining({
                status: 500
              }));
            });
          case 4:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    })));
  });
});
describe("rtl", function () {
  var given = (0, _givens["default"])();
  given("node1", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node1");
  });
  given("$tree", function () {
    return $("#tree1");
  });
  context("with the rtl option is true", function () {
    beforeEach(function () {
      given.$tree.tree({
        data: _exampleData["default"],
        rtl: true
      });
    });
    it("has a different closed icon", function () {
      expect((0, _testUtil.togglerLink)(given.node1.element).text()).toBe("◀");
    });
  });
  context("with the rtl data option", function () {
    beforeEach(function () {
      given.$tree.attr("data-rtl", "true");
      given.$tree.tree({
        data: _exampleData["default"]
      });
    });
    it("has a different closed icon", function () {
      expect((0, _testUtil.togglerLink)(given.node1.element).text()).toBe("◀");
    });
  });
});
describe("saveState", function () {
  var given = (0, _givens["default"])();
  given("node1", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node1");
  });
  given("$tree", function () {
    return $("#tree1");
  });
  context("when a node is open and selected", function () {
    beforeEach(function () {
      given.$tree.tree({
        animationSpeed: 0,
        autoOpen: false,
        data: _exampleData["default"],
        saveState: given.saveState
      });
      given.$tree.tree("selectNode", given.node1);
      given.$tree.tree("openNode", given.node1);
    });
    context("when saveState is true", function () {
      given("saveState", function () {
        return true;
      });
      it("saves the state to local storage", function () {
        expect(localStorage.getItem("tree")).toBe('{"open_nodes":[123],"selected_node":[123]}');
      });
    });
    context("when saveState is a string", function () {
      given("saveState", function () {
        return "my-state";
      });
      it("uses the string as a key", function () {
        expect(localStorage.getItem("my-state")).toBe('{"open_nodes":[123],"selected_node":[123]}');
      });
    });
    context("when saveState is false", function () {
      given("saveState", function () {
        return false;
      });
      it("doesn't save to local storage", function () {
        expect(localStorage.getItem("tree")).toBeNull();
      });
    });
  });
  context("when there is a state in the local storage", function () {
    given("saveState", function () {
      return true;
    });
    beforeEach(function () {
      localStorage.setItem("tree", '{"open_nodes":[123],"selected_node":[123]}');
      given.$tree.tree({
        animationSpeed: 0,
        autoOpen: false,
        data: _exampleData["default"],
        saveState: given.saveState
      });
    });
    it("restores the state", function () {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1",
        open: true,
        selected: true
      }), expect.objectContaining({
        name: "node2",
        open: false,
        selected: false
      })]);
    });
  });
});
describe("showEmptyFolder", function () {
  context("when children attribute is an empty array", function () {
    var given = (0, _givens["default"])();
    given("$tree", function () {
      return $("#tree1");
    });
    beforeEach(function () {
      given.$tree.tree({
        data: [{
          name: "parent1",
          children: []
        }],
        showEmptyFolder: given.showEmptyFolder
      });
    });
    context("with showEmptyFolder false", function () {
      given("showEmptyFolder", function () {
        return false;
      });
      it("creates a child node", function () {
        expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
          name: "parent1"
        })]);
      });
    });
    context("with showEmptyFolder true", function () {
      given("showEmptyFolder", function () {
        return true;
      });
      it("creates a folder", function () {
        expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
          name: "parent1",
          children: []
        })]);
      });
    });
  });
});