"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var _givens = _interopRequireDefault(require("givens"));
var _dom = require("@testing-library/dom");
var _msw = require("msw");
var _node = require("msw/node");
require("../../tree.jquery");
var _exampleData = _interopRequireDefault(require("../support/exampleData"));
var _testUtil = require("../support/testUtil");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
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
          while (1) {
            switch (_context.prev = _context.next) {
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
        while (1) {
          switch (_context2.prev = _context2.next) {
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