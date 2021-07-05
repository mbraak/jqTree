"use strict";

var _givens = _interopRequireDefault(require("givens"));

var _dom = require("@testing-library/dom");

var _msw = require("msw");

var _node = require("msw/node");

require("../../tree.jquery");

var _testUtil = require("../support/testUtil");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var context = describe;
beforeEach(function () {
  $("body").append('<div id="tree1"></div>');
});
afterEach(function () {
  var $tree = $("#tree1");
  $tree.tree("destroy");
  $tree.remove();
  localStorage.clear();
});
context("when a node has load_on_demand in the data", function () {
  var given = (0, _givens["default"])();
  given("autoOpen", function () {
    return false;
  });
  given("$tree", function () {
    return $("#tree1");
  });
  var initialData = [{
    id: 1,
    name: "parent-node",
    load_on_demand: true
  }];
  var server = null;
  beforeAll(function () {
    server = (0, _node.setupServer)(_msw.rest.get("/tree/", function (request, response, ctx) {
      var parentId = request.url.searchParams.get("node");

      if (parentId === "1") {
        return response(ctx.status(200), ctx.json([{
          id: 2,
          name: "loaded-on-demand"
        }]));
      } else {
        return response(ctx.status(400));
      }
    }));
    server.listen();
  });
  afterAll(function () {
    var _server;

    (_server = server) === null || _server === void 0 ? void 0 : _server.close();
  });
  beforeEach(function () {
    if (given.savedState) {
      localStorage.setItem("tree", given.savedState);
    }

    given.$tree.tree({
      autoOpen: given.autoOpen,
      data: initialData,
      dataUrl: "/tree/",
      saveState: true
    });
  });
  it("creates a parent node without children", function () {
    expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
      children: [],
      name: "parent-node",
      open: false
    })]);
  });
  context("when the node is opened", function () {
    given("node", function () {
      return given.$tree.tree("getNodeByNameMustExist", "parent-node");
    });
    it("loads the subtree", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              (0, _testUtil.togglerLink)(given.node.element).trigger("click");
              _context.next = 3;
              return _dom.screen.findByText("loaded-on-demand");

            case 3:
              expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
                name: "parent-node",
                open: true,
                children: [expect.objectContaining({
                  name: "loaded-on-demand"
                })]
              })]);

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    })));
  });
  context("with autoOpen is true", function () {
    given("autoOpen", function () {
      return true;
    });
    it("loads the node on demand", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _dom.screen.findByText("loaded-on-demand");

            case 2:
              expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
                name: "parent-node",
                open: true,
                children: [expect.objectContaining({
                  name: "loaded-on-demand"
                })]
              })]);

            case 3:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    })));
  });
  context("with a saved state with an opened node", function () {
    given("savedState", function () {
      return '{"open_nodes":[1],"selected_node":[]}';
    });
    it("opens the node and loads its children on demand", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _dom.screen.findByText("loaded-on-demand");

            case 2:
              expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
                name: "parent-node",
                open: true,
                children: [expect.objectContaining({
                  name: "loaded-on-demand"
                })]
              })]);

            case 3:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    })));
  });
});