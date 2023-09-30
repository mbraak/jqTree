"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var _givens = _interopRequireDefault(require("givens"));
var _dom = require("@testing-library/dom");
var _msw = require("msw");
var _node = require("msw/node");
require("../../tree.jquery");
var _exampleData = _interopRequireDefault(require("../support/exampleData"));
var _testUtil = require("../support/testUtil");
var _version = _interopRequireDefault(require("../../version"));
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
describe("addNodeAfter", function () {
  var given = (0, _givens["default"])();
  given("$tree", function () {
    return $("#tree1");
  });
  given("node", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node1");
  });
  beforeEach(function () {
    given.$tree.tree({
      autoOpen: true,
      data: _exampleData["default"]
    });
    given.$tree.tree("addNodeAfter", "added-node", given.node);
  });
  it("adds the node", function () {
    expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
      name: "node1"
    }), expect.objectContaining({
      name: "added-node"
    }), expect.objectContaining({
      name: "node2"
    })]);
  });
});
describe("addNodeBefore", function () {
  var given = (0, _givens["default"])();
  given("$tree", function () {
    return $("#tree1");
  });
  given("node", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node1");
  });
  beforeEach(function () {
    given.$tree.tree({
      autoOpen: true,
      data: _exampleData["default"]
    });
    given.$tree.tree("addNodeBefore", "added-node", given.node);
  });
  it("adds the node", function () {
    expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
      name: "added-node"
    }), expect.objectContaining({
      name: "node1"
    }), expect.objectContaining({
      name: "node2"
    })]);
  });
});
describe("addParentNode", function () {
  var given = (0, _givens["default"])();
  given("$tree", function () {
    return $("#tree1");
  });
  given("child1", function () {
    return given.$tree.tree("getNodeByNameMustExist", "child1");
  });
  beforeEach(function () {
    given.$tree.tree({
      autoOpen: true,
      data: _exampleData["default"]
    });
    given.$tree.tree("addParentNode", "new-parent-node", given.child1);
  });
  it("adds the parent node", function () {
    expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
      name: "node1",
      children: [expect.objectContaining({
        name: "new-parent-node",
        children: [expect.objectContaining({
          name: "child1"
        }), expect.objectContaining({
          name: "child2"
        })]
      })]
    }), expect.objectContaining({
      name: "node2"
    })]);
  });
});
describe("addToSelection", function () {
  var given = (0, _givens["default"])();
  given("$tree", function () {
    return $("#tree1");
  });
  given("child1", function () {
    return given.$tree.tree("getNodeByNameMustExist", "child1");
  });
  given("child2", function () {
    return given.$tree.tree("getNodeByNameMustExist", "child2");
  });
  beforeEach(function () {
    given.$tree.tree({
      autoOpen: true,
      data: _exampleData["default"]
    });
    given.$tree.tree("addToSelection", given.child1);
    given.$tree.tree("addToSelection", given.child2);
  });
  it("selects the nodes", function () {
    expect(given.$tree.tree("getSelectedNodes")).toEqual(expect.arrayContaining([given.child1, given.child2]));
  });
  it("renders the nodes correctly", function () {
    expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
      name: "node1",
      selected: false,
      children: [expect.objectContaining({
        name: "child1",
        selected: true
      }), expect.objectContaining({
        name: "child2",
        selected: true
      })]
    }), expect.objectContaining({
      name: "node2",
      selected: false,
      children: [expect.objectContaining({
        name: "node3",
        selected: false
      })]
    })]);
  });
});
describe("appendNode", function () {
  var given = (0, _givens["default"])();
  given("$tree", function () {
    return $("#tree1");
  });
  given("parent", function () {
    return undefined;
  });
  given("nodeData", function () {
    return "appended-node";
  });
  beforeEach(function () {
    given.$tree.tree({
      autoOpen: true,
      data: _exampleData["default"]
    });
    given.$tree.tree("appendNode", given.nodeData, given.parent);
  });
  context("with an empty parent parameter", function () {
    it("appends the node to the tree", function () {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1"
      }), expect.objectContaining({
        name: "node2"
      }), expect.objectContaining({
        name: "appended-node"
      })]);
    });
  });
  context("when appending to a parent node", function () {
    given("parent", function () {
      return given.$tree.tree("getNodeByNameMustExist", "node1");
    });
    it("appends the node to parent node", function () {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1",
        children: [expect.objectContaining({
          name: "child1"
        }), expect.objectContaining({
          name: "child2"
        }), expect.objectContaining({
          name: "appended-node"
        })]
      }), expect.objectContaining({
        name: "node2"
      })]);
    });
  });
  context("when appending a node using an object", function () {
    given("nodeData", function () {
      return {
        color: "green",
        id: 99,
        name: "appended-using-object"
      };
    });
    it("appends the node to the tree", function () {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1"
      }), expect.objectContaining({
        name: "node2"
      }), expect.objectContaining({
        name: "appended-using-object"
      })]);
    });
    it("sets the properties of the object", function () {
      expect(given.$tree.tree("getNodeById", 99)).toMatchObject(given.nodeData);
    });
  });
});
describe("closeNode", function () {
  var given = (0, _givens["default"])();
  given("node1", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node1");
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      autoOpen: true,
      data: _exampleData["default"]
    });
    given.$tree.tree("closeNode", given.node1, false);
  });
  it("closes the node", function () {
    expect(given.node1.element).toBeClosed();
  });
});
describe("getNodeByCallback", function () {
  var given = (0, _givens["default"])();
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: _exampleData["default"]
    });
  });
  it("returns the node", function () {
    var callback = function callback(node) {
      return node.name.startsWith("chi");
    };
    expect(given.$tree.tree("getNodeByCallback", callback)).toMatchObject({
      name: "child1"
    });
  });
});
describe("getNodeByHtmlElement", function () {
  var given = (0, _givens["default"])();
  given("htmlElement", function () {
    return _dom.screen.getByText("node1", {
      selector: ".jqtree-title"
    });
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: _exampleData["default"]
    });
  });
  it("returns the node", function () {
    expect(given.$tree.tree("getNodeByHtmlElement", given.htmlElement)).toEqual(expect.objectContaining({
      name: "node1"
    }));
  });
});
describe("getNodeById", function () {
  var given = (0, _givens["default"])();
  given("data", function () {
    return _exampleData["default"];
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: given.data
    });
  });
  it("returns the node", function () {
    expect(given.$tree.tree("getNodeById", 127)).toMatchObject({
      name: "node3"
    });
  });
  context("with a string parameter", function () {
    it("doesn't return the node", function () {
      expect(given.$tree.tree("getNodeById", "127")).toBeNull();
    });
  });
  context("when the node doesn't exist", function () {
    it("returns null", function () {
      expect(given.$tree.tree("getNodeById", 99999)).toBeNull();
    });
  });
  context("when the data has string ids", function () {
    given("data", function () {
      return [{
        id: "123",
        name: "node1"
      }];
    });
    context("with a string parameter", function () {
      it("returns the node", function () {
        expect(given.$tree.tree("getNodeById", "123")).toMatchObject({
          name: "node1"
        });
      });
    });
    context("with a number parameter", function () {
      it("doesn't return the node", function () {
        expect(given.$tree.tree("getNodeById", 123)).toBeNull();
      });
    });
    context("when the node doesn't exist", function () {
      it("returns null", function () {
        expect(given.$tree.tree("getNodeById", "abc")).toBeNull();
      });
    });
  });
});
describe("getNodesByProperty", function () {
  var given = (0, _givens["default"])();
  given("node1", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node1");
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: _exampleData["default"]
    });
  });
  it("gets nodes by property", function () {
    expect(given.$tree.tree("getNodesByProperty", "intProperty", 1)).toEqual([given.node1]);
  });
});
describe("getSelectedNode", function () {
  var given = (0, _givens["default"])();
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: given.treeData
    });
  });
  context("when nodes have ids", function () {
    given("node", function () {
      return given.$tree.tree("getNodeByNameMustExist", "node1");
    });
    given("treeData", function () {
      return _exampleData["default"];
    });
    context("when no node is selected", function () {
      it("returns false", function () {
        expect(given.$tree.tree("getSelectedNode")).toBe(false);
      });
    });
    context("when a node is selected", function () {
      beforeEach(function () {
        given.$tree.tree("selectNode", given.node);
      });
      it("returns the selected node", function () {
        expect(given.$tree.tree("getSelectedNode")).toBe(given.node);
      });
    });
  });
  context("when nodes don't have ids", function () {
    given("node", function () {
      return given.$tree.tree("getNodeByNameMustExist", "without-id1");
    });
    given("treeData", function () {
      return ["without-id1", "without-id2"];
    });
    context("when no node is selected", function () {
      it("returns false", function () {
        expect(given.$tree.tree("getSelectedNode")).toBe(false);
      });
    });
    context("when a node is selected", function () {
      beforeEach(function () {
        given.$tree.tree("selectNode", given.node);
      });
      it("returns the selected node", function () {
        expect(given.$tree.tree("getSelectedNode")).toBe(given.node);
      });
    });
  });
});
describe("getSelectedNodes", function () {
  var given = (0, _givens["default"])();
  given("child1", function () {
    return given.$tree.tree("getNodeByNameMustExist", "child1");
  });
  given("child2", function () {
    return given.$tree.tree("getNodeByNameMustExist", "child2");
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: _exampleData["default"]
    });
  });
  context("when no node is selected", function () {
    it("returns an empty array", function () {
      expect(given.$tree.tree("getSelectedNodes")).toHaveLength(0);
    });
  });
  context("when nodes are selected", function () {
    beforeEach(function () {
      given.$tree.tree("addToSelection", given.child1);
      given.$tree.tree("addToSelection", given.child2);
    });
    it("returns the selected nodes", function () {
      expect(given.$tree.tree("getSelectedNodes")).toEqual(expect.arrayContaining([given.child1, given.child2]));
    });
  });
});
describe("getState", function () {
  var given = (0, _givens["default"])();
  given("node1", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node1");
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: _exampleData["default"]
    });
    given.$tree.tree("openNode", given.node1, false);
  });
  it("returns the state", function () {
    expect(given.$tree.tree("getState")).toEqual({
      open_nodes: [123],
      selected_node: []
    });
  });
});
describe("getStateFromStorage", function () {
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
      saveState: true
    });
    given.$tree.tree("openNode", given.node1, false);
  });
  it("returns the state", function () {
    expect(given.$tree.tree("getStateFromStorage")).toEqual({
      open_nodes: [123],
      selected_node: []
    });
  });
});
describe("getTree", function () {
  var given = (0, _givens["default"])();
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: _exampleData["default"]
    });
  });
  it("returns the tree", function () {
    expect(given.$tree.tree("getTree")).toMatchObject({
      children: [expect.objectContaining({
        name: "node1"
      }), expect.objectContaining({
        name: "node2"
      })]
    });
  });
});
describe("getVersion", function () {
  var given = (0, _givens["default"])();
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree();
  });
  it("returns the version", function () {
    expect(given.$tree.tree("getVersion")).toBe(_version["default"]);
  });
});
describe("isNodeSelected", function () {
  var given = (0, _givens["default"])();
  given("node1", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node1");
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: _exampleData["default"]
    });
  });
  context("when the node is selected", function () {
    beforeEach(function () {
      given.$tree.tree("selectNode", given.node1);
    });
    it("returns true", function () {
      expect(given.$tree.tree("isNodeSelected", given.node1)).toBeTrue();
    });
  });
  context("when the node is not selected", function () {
    it("returns false", function () {
      expect(given.$tree.tree("isNodeSelected", given.node1)).toBeFalse();
    });
  });
});
describe("loadData", function () {
  var given = (0, _givens["default"])();
  given("initialData", function () {
    return ["initial1"];
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: given.initialData
    });
  });
  context("when the node parameter is empty", function () {
    beforeEach(function () {
      given.$tree.tree("loadData", _exampleData["default"]);
    });
    it("replaces the whole tree", function () {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1",
        children: [expect.objectContaining({
          name: "child1"
        }), expect.objectContaining({
          name: "child2"
        })]
      }), expect.objectContaining({
        name: "node2",
        children: [expect.objectContaining({
          name: "node3"
        })]
      })]);
    });
  });
  context("with a node parameter", function () {
    beforeEach(function () {
      given.$tree.tree("loadData", _exampleData["default"], given.$tree.tree("getNodeByNameMustExist", "initial1"));
    });
    it("loads the data under the node", function () {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "initial1",
        children: [expect.objectContaining({
          name: "node1",
          children: [expect.objectContaining({
            name: "child1"
          }), expect.objectContaining({
            name: "child2"
          })]
        }), expect.objectContaining({
          name: "node2"
        })]
      })]);
    });
  });
  context("with a node parameter which has a selected child", function () {
    given("initialData", function () {
      return _exampleData["default"];
    });
    beforeEach(function () {
      given.$tree.tree("selectNode", given.$tree.tree("getNodeByNameMustExist", "child1"));
    });
    it("deselects the node", function () {
      given.$tree.tree("loadData", ["new-child1"], given.$tree.tree("getNodeByNameMustExist", "node1"));
      expect(given.$tree.tree("getSelectedNode")).toBeFalse();
    });
    context("when the selected node doesn't have an id", function () {
      given("initialData", function () {
        return [{
          name: "node1",
          children: ["child1", "child2"]
        }, "node2"];
      });
      it("deselects the node", function () {
        given.$tree.tree("loadData", ["new-child1"], given.$tree.tree("getNodeByNameMustExist", "node1"));
        expect(given.$tree.tree("getSelectedNode")).toBeFalse();
      });
      context("when the selected child is under another node", function () {
        it("doesn't deselect the node", function () {
          given.$tree.tree("loadData", ["new-child1"], given.$tree.tree("getNodeByNameMustExist", "node2"));
          expect(given.$tree.tree("getSelectedNode")).toMatchObject({
            name: "child1"
          });
        });
      });
    });
  });
});
describe("loadDataFromUrl", function () {
  var given = (0, _givens["default"])();
  given("initialData", function () {
    return [];
  });
  given("serverData", function () {
    return _exampleData["default"];
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    server.use(_msw.rest.get("/tree/", function (_request, response, ctx) {
      return response(ctx.status(200), ctx.json(given.serverData));
    }));
    given.$tree.tree({
      data: given.initialData
    });
  });
  context("with url parameter", function () {
    it("loads the tree", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            given.$tree.tree("loadDataFromUrl", "/tree/");
            _context.next = 3;
            return _dom.screen.findByText("node1");
          case 3:
            expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
              name: "node1"
            }), expect.objectContaining({
              name: "node2"
            })]);
          case 4:
          case "end":
            return _context.stop();
        }
      }, _callee);
    })));
    context("with parent node", function () {
      given("initialData", function () {
        return ["initial1", "initial2"];
      });
      given("serverData", function () {
        return ["new1", "new2"];
      });
      it("loads a subtree", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
        var parentNode;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              parentNode = given.$tree.tree("getNodeByNameMustExist", "initial1");
              given.$tree.tree("loadDataFromUrl", "/tree/", parentNode);
              _context2.next = 4;
              return _dom.screen.findByText("new1");
            case 4:
              expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
                name: "initial1",
                children: [expect.objectContaining({
                  name: "new1"
                }), expect.objectContaining({
                  name: "new2"
                })]
              }), expect.objectContaining({
                name: "initial2"
              })]);
            case 5:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      })));
    });
  });
  context("without url parameter", function () {
    it("loads the data from dataUrl", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            given.$tree.tree("setOption", "dataUrl", "/tree/");
            given.$tree.tree("loadDataFromUrl");
            _context3.next = 4;
            return _dom.screen.findByText("node1");
          case 4:
            expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
              name: "node1"
            }), expect.objectContaining({
              name: "node2"
            })]);
          case 5:
          case "end":
            return _context3.stop();
        }
      }, _callee3);
    })));
  });
});
describe("moveDown", function () {
  var given = (0, _givens["default"])();
  given("node1", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node1");
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: _exampleData["default"]
    });
    given.$tree.tree("selectNode", given.node1);
  });
  it("selects the next node", function () {
    given.$tree.tree("moveDown");
    expect(given.$tree.tree("getSelectedNode")).toMatchObject({
      name: "node2"
    });
  });
});
describe("moveNode", function () {
  var given = (0, _givens["default"])();
  given("child1", function () {
    return given.$tree.tree("getNodeByNameMustExist", "child1");
  });
  given("node2", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node2");
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      autoOpen: true,
      data: _exampleData["default"]
    });
    given.$tree.tree("moveNode", given.child1, given.node2, "after");
  });
  it("moves node", function () {
    expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
      name: "node1",
      children: [expect.objectContaining({
        name: "child2"
      })]
    }), expect.objectContaining({
      name: "node2"
    }), expect.objectContaining({
      name: "child1"
    })]);
  });
});
describe("moveUp", function () {
  var given = (0, _givens["default"])();
  given("node2", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node2");
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: _exampleData["default"]
    });
    given.$tree.tree("selectNode", given.node2);
  });
  it("selects the next node", function () {
    given.$tree.tree("moveUp");
    expect(given.$tree.tree("getSelectedNode")).toMatchObject({
      name: "node1"
    });
  });
});
describe("openNode", function () {
  var given = (0, _givens["default"])();
  given("node1", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node1");
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      autoOpen: false,
      data: _exampleData["default"]
    });
  });
  it("opens the node", function () {
    given.$tree.tree("openNode", given.node1, false);
    expect(given.node1.element).toBeOpen();
  });
  context("with onFinished parameter", function () {
    it("calls the function", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
      var onFinished;
      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            onFinished = jest.fn();
            given.$tree.tree("openNode", given.node1, onFinished);
            _context4.next = 4;
            return (0, _dom.waitFor)(function () {
              expect(onFinished).toHaveBeenCalledWith(given.node1);
            });
          case 4:
          case "end":
            return _context4.stop();
        }
      }, _callee4);
    })));
  });
});
describe("prependNode", function () {
  var given = (0, _givens["default"])();
  given("$tree", function () {
    return $("#tree1");
  });
  given("parent", function () {
    return undefined;
  });
  beforeEach(function () {
    given.$tree.tree({
      data: _exampleData["default"]
    });
    given.$tree.tree("prependNode", "prepended-node", given.parent);
  });
  context("with an empty parent parameter", function () {
    it("prepends the node to the tree", function () {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "prepended-node"
      }), expect.objectContaining({
        name: "node1"
      }), expect.objectContaining({
        name: "node2"
      })]);
    });
  });
  context("with a parent node", function () {
    given("parent", function () {
      return given.$tree.tree("getNodeByNameMustExist", "node1");
    });
    it("prepends the node to the parent", function () {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1",
        children: [expect.objectContaining({
          name: "prepended-node"
        }), expect.objectContaining({
          name: "child1"
        }), expect.objectContaining({
          name: "child2"
        })]
      }), expect.objectContaining({
        name: "node2"
      })]);
    });
  });
});
describe("refresh", function () {
  var given = (0, _givens["default"])();
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: _exampleData["default"]
    });
  });
  it("rerenders the tree", function () {
    var tree = given.$tree.tree("getTree");
    tree.children[0].name = "node1a"; // eslint-disable-line testing-library/no-node-access

    expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
      name: "node1"
    }), expect.objectContaining({
      name: "node2"
    })]);
    given.$tree.tree("refresh");
    expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
      name: "node1a"
    }), expect.objectContaining({
      name: "node2"
    })]);
  });
});
describe("reload", function () {
  var given = (0, _givens["default"])();
  given("node1", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node1");
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          server.use(_msw.rest.get("/tree2/", function (_request, response, ctx) {
            return response(ctx.status(200), ctx.json(_exampleData["default"]));
          }));
          given.$tree.tree({
            dataUrl: "/tree2/"
          });
          _context5.next = 4;
          return _dom.screen.findByText("node1");
        case 4:
          given.$tree.tree("removeNode", given.node1);
        case 5:
        case "end":
          return _context5.stop();
      }
    }, _callee5);
  })));
  it("reloads the data from the server", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
            name: "node2"
          })]);
          given.$tree.tree("reload");
          _context6.next = 4;
          return _dom.screen.findByText("node1");
        case 4:
          expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
            name: "node1"
          }), expect.objectContaining({
            name: "node2"
          })]);
        case 5:
        case "end":
          return _context6.stop();
      }
    }, _callee6);
  })));
  context("with a onFinished parameter", function () {
    it("calls onFinished", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7() {
      var handleFinished;
      return _regeneratorRuntime().wrap(function _callee7$(_context7) {
        while (1) switch (_context7.prev = _context7.next) {
          case 0:
            handleFinished = jest.fn();
            given.$tree.tree("reload", handleFinished);
            _context7.next = 4;
            return (0, _dom.waitFor)(function () {
              return expect(handleFinished).toHaveBeenCalledWith();
            });
          case 4:
            expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
              name: "node1"
            }), expect.objectContaining({
              name: "node2"
            })]);
          case 5:
          case "end":
            return _context7.stop();
        }
      }, _callee7);
    })));
  });
});
describe("removeNode", function () {
  var given = (0, _givens["default"])();
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: _exampleData["default"]
    });
  });
  context("with a child node", function () {
    given("node", function () {
      return given.$tree.tree("getNodeByNameMustExist", "child1");
    });
    it("removes the node", function () {
      given.$tree.tree("removeNode", given.node);
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1",
        children: [expect.objectContaining({
          name: "child2"
        })]
      }), expect.objectContaining({
        name: "node2",
        children: [expect.objectContaining({
          name: "node3"
        })]
      })]);
    });
    context("when the node is selected", function () {
      beforeEach(function () {
        given.$tree.tree("selectNode", given.node);
      });
      it("removes and deselects the node", function () {
        given.$tree.tree("removeNode", given.node);
        expect(given.$tree.tree("getSelectedNode")).toBe(false);
      });
    });
  });
  context("with a parent node and its children", function () {
    given("node", function () {
      return given.$tree.tree("getNodeByNameMustExist", "node1");
    });
    it("removes the node", function () {
      given.$tree.tree("removeNode", given.node);
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node2",
        children: [expect.objectContaining({
          name: "node3"
        })]
      })]);
    });
    context("when a child node is selected", function () {
      beforeEach(function () {
        var child1 = given.$tree.tree("getNodeByNameMustExist", "child1");
        given.$tree.tree("selectNode", child1);
      });
      it("removes the node and deselects the child", function () {
        given.$tree.tree("removeNode", given.node);
        expect(given.$tree.tree("getSelectedNode")).toBe(false);
      });
    });
  });
  context("with a root node", function () {
    given("node", function () {
      return given.$tree.tree("getTree");
    });
    it("raises an exception", function () {
      expect(function () {
        return given.$tree.tree("removeNode", given.node);
      }).toThrow("Node has no parent");
    });
  });
});
describe("selectNode", function () {
  var given = (0, _givens["default"])();
  given("node1", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node1");
  });
  given("node2", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node2");
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: _exampleData["default"],
      selectable: true
    });
  });
  context("when another node is selected", function () {
    beforeEach(function () {
      given.$tree.tree("selectNode", given.node2);
      given.$tree.tree("selectNode", given.node1);
    });
    it("selects the node and deselects the previous node", function () {
      expect(given.node1.element).toBeSelected();
      expect(given.node2.element).not.toBeSelected();
    });
  });
  context("when the node is not selected", function () {
    beforeEach(function () {
      given.$tree.tree("selectNode", given.node1);
    });
    it("selects the node", function () {
      expect(given.node1.element).toBeSelected();
    });
  });
  context("when the node is selected", function () {
    beforeEach(function () {
      given.$tree.tree("selectNode", given.node1);
    });
    it("deselects the node", function () {
      given.$tree.tree("selectNode", given.node1);
      expect(given.node1.element).not.toBeSelected();
    });
  });
  context("with a null parameter", function () {
    beforeEach(function () {
      given.$tree.tree("selectNode", given.node1);
    });
    it("deselects the current node", function () {
      given.$tree.tree("selectNode", null);
      expect(given.$tree.tree("getSelectedNode")).toBeFalse();
    });
  });
});
describe("setOption", function () {
  var given = (0, _givens["default"])();
  beforeEach(function () {
    given.$tree.tree({
      animationSpeed: 0,
      data: _exampleData["default"],
      selectable: false
    });
  });
  given("node1", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node1");
  });
  given("$tree", function () {
    return $("#tree1");
  });
  it("sets an option", function () {
    given.$tree.tree("setOption", "selectable", true);
    (0, _testUtil.titleSpan)(given.node1.element).trigger("click");
    expect(given.$tree.tree("getSelectedNode")).toMatchObject({
      name: "node1"
    });
  });
});
describe("setState", function () {
  var given = (0, _givens["default"])();
  beforeEach(function () {
    given.$tree.tree({
      autoOpen: false,
      data: _exampleData["default"],
      selectable: true
    });
  });
  given("$tree", function () {
    return $("#tree1");
  });
  it("sets the state", function () {
    given.$tree.tree("setState", {
      open_nodes: [123],
      selected_node: [123]
    });
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
describe("toggle", function () {
  var given = (0, _givens["default"])();
  given("autoOpen", function () {
    return false;
  });
  given("node1", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node1");
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      autoOpen: given.autoOpen,
      data: _exampleData["default"]
    });
    given.$tree.tree("toggle", given.node1, false);
  });
  context("when the node is closed", function () {
    it("opens the node", function () {
      expect(given.node1.element).toBeOpen();
    });
  });
  context("when the node is open", function () {
    given("autoOpen", function () {
      return true;
    });
    it("closes the node", function () {
      expect(given.node1.element).toBeClosed();
    });
  });
});
describe("toJson", function () {
  var given = (0, _givens["default"])();
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: _exampleData["default"]
    });
  });
  it("returns nodes as json", function () {
    expect(JSON.parse(given.$tree.tree("toJson"))).toEqual(_exampleData["default"]);
  });
});
describe("updateNode", function () {
  var given = (0, _givens["default"])();
  given("isSelected", function () {
    return false;
  });
  given("node", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node1");
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      autoOpen: true,
      data: _exampleData["default"]
    });
    if (given.isSelected) {
      given.$tree.tree("selectNode", given.node);
    }
    given.$tree.tree("updateNode", given.node, given.nodeData);
  });
  context("with a string", function () {
    given("nodeData", function () {
      return "updated-node";
    });
    it("updates the name", function () {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "updated-node"
      }), expect.objectContaining({
        name: "node2"
      })]);
    });
  });
  context("with an object containing a name", function () {
    given("nodeData", function () {
      return {
        name: "updated-node"
      };
    });
    it("updates the name", function () {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "updated-node"
      }), expect.objectContaining({
        name: "node2"
      })]);
    });
  });
  context("with an object containing an id", function () {
    given("nodeData", function () {
      return {
        id: 999
      };
    });
    it("updates the id", function () {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1"
      }), expect.objectContaining({
        name: "node2"
      })]);
      expect(given.$tree.tree("getNodeById", 999)).toMatchObject(given.nodeData);
    });
  });
  context("with an object containing a property", function () {
    given("nodeData", function () {
      return {
        color: "green"
      };
    });
    it("updates the node", function () {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1"
      }), expect.objectContaining({
        name: "node2"
      })]);
      expect(given.$tree.tree("getNodeById", 123)).toMatchObject({
        color: "green",
        name: "node1"
      });
    });
  });
  context("with an object containing children", function () {
    context("when adding a child to a child node", function () {
      given("nodeData", function () {
        return {
          children: ["new-child"]
        };
      });
      given("node", function () {
        return given.$tree.tree("getNodeByNameMustExist", "child1");
      });
      it("adds the child node", function () {
        expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
          name: "node1",
          children: [expect.objectContaining({
            name: "child1",
            children: [expect.objectContaining({
              name: "new-child"
            })]
          }), expect.objectContaining({
            name: "child2"
          })]
        }), expect.objectContaining({
          name: "node2"
        })]);
      });
    });
    context("when removing the children", function () {
      given("nodeData", function () {
        return {
          children: []
        };
      });
      it("removes the children", function () {
        expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
          nodeType: "child",
          name: "node1"
        }), expect.objectContaining({
          nodeType: "folder",
          name: "node2"
        })]);
      });
    });
  });
  context("when the node was selected", function () {
    given("isSelected", function () {
      return true;
    });
    it("keeps the node selected", function () {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1"
      }), expect.objectContaining({
        name: "node2"
      })]);
    });
    it("keeps the focus on the node", function () {
      expect(given.node.element).toBeFocused();
    });
  });
});