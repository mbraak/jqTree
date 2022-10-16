"use strict";

var _givens = _interopRequireDefault(require("givens"));
var _msw = require("msw");
var _node = require("msw/node");
require("../../tree.jquery");
var _exampleData = _interopRequireDefault(require("../support/exampleData"));
var _testUtil = require("../support/testUtil");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
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
});
afterAll(function () {
  return server.close();
});
describe("tree.click", function () {
  var given = (0, _givens["default"])();
  given("node1", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node1");
  });
  given("titleSpan", function () {
    return (0, _testUtil.titleSpan)(given.node1.element);
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: _exampleData["default"]
    });
  });
  it("fires tree.click", function () {
    return new Promise(function (done) {
      given.$tree.on("tree.click", function (e) {
        var treeClickEvent = e;
        expect(treeClickEvent.node).toBe(given.node1);
        done();
      });
      given.titleSpan.trigger("click");
    });
  });
});
describe("tree.contextmenu", function () {
  var given = (0, _givens["default"])();
  given("node1", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node1");
  });
  given("titleSpan", function () {
    return (0, _testUtil.titleSpan)(given.node1.element);
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: _exampleData["default"]
    });
  });
  it("fires tree.contextmenu", function () {
    return new Promise(function (done) {
      given.$tree.on("tree.contextmenu", function (e) {
        var treeClickEvent = e;
        expect(treeClickEvent.node).toBe(given.node1);
        done();
      });
      given.titleSpan.contextmenu();
    });
  });
});
describe("tree.dblclick", function () {
  var given = (0, _givens["default"])();
  given("node1", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node1");
  });
  given("titleSpan", function () {
    return (0, _testUtil.titleSpan)(given.node1.element);
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: _exampleData["default"]
    });
  });
  it("fires tree.dblclick", function () {
    return new Promise(function (done) {
      given.$tree.on("tree.dblclick", function (e) {
        var treeClickEvent = e;
        expect(treeClickEvent.node).toBe(given.node1);
        done();
      });
      given.titleSpan.trigger("dblclick");
    });
  });
});
describe("tree.init", function () {
  var given = (0, _givens["default"])();
  given("$tree", function () {
    return $("#tree1");
  });
  context("with json data", function () {
    it("is called", function () {
      return new Promise(function (done) {
        given.$tree.on("tree.init", function () {
          expect(given.$tree.tree("getNodeByName", "node2")).toMatchObject({
            id: 124,
            name: "node2"
          });
          done();
        });
        given.$tree.tree({
          data: _exampleData["default"]
        });
      });
    });
  });
  context("with data loaded from an url", function () {
    beforeEach(function () {
      server.use(_msw.rest.get("/tree/", function (_request, response, ctx) {
        return response(ctx.status(200), ctx.json(_exampleData["default"]));
      }));
    });
    it("is called", function () {
      return new Promise(function (done) {
        given.$tree.on("tree.init", function () {
          expect(given.$tree.tree("getNodeByName", "node2")).toMatchObject({
            id: 124,
            name: "node2"
          });
          done();
        });
        given.$tree.tree({
          dataUrl: "/tree/"
        });
      });
    });
  });
});
describe("tree.load_data", function () {
  var given = (0, _givens["default"])();
  given("$tree", function () {
    return $("#tree1");
  });
  context("when the tree is initialized with data", function () {
    it("fires tree.load_data", function () {
      return new Promise(function (resolve) {
        given.$tree.on("tree.load_data", function (e) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(e.tree_data).toEqual(_exampleData["default"]);
          resolve();
        });
        given.$tree.tree({
          data: _exampleData["default"]
        });
      });
    });
  });
});
describe("tree.select", function () {
  var given = (0, _givens["default"])();
  given("node1", function () {
    return given.$tree.tree("getNodeByNameMustExist", "node1");
  });
  given("titleSpan", function () {
    return (0, _testUtil.titleSpan)(given.node1.element);
  });
  given("$tree", function () {
    return $("#tree1");
  });
  beforeEach(function () {
    given.$tree.tree({
      data: _exampleData["default"]
    });
  });
  it("fires tree.click", function () {
    return new Promise(function (done) {
      given.$tree.on("tree.select", function (e) {
        var treeClickEvent = e;
        expect(treeClickEvent.node).toBe(given.node1);
        expect(treeClickEvent.deselected_node).toBeNull();
        done();
      });
      given.titleSpan.trigger("click");
    });
  });
  context("when the node was selected", function () {
    beforeEach(function () {
      given.$tree.tree("selectNode", given.node1);
    });
    it("fires tree.select with node is null", function () {
      return new Promise(function (done) {
        given.$tree.on("tree.select", function (e) {
          var treeClickEvent = e;
          expect(treeClickEvent.node).toBeNull();
          expect(treeClickEvent.previous_node).toBe(given.node1);
          done();
        });
        given.titleSpan.trigger("click");
      });
    });
  });
});