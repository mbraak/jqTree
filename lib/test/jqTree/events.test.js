"use strict";

var _givens = _interopRequireDefault(require("givens"));
var _msw = require("msw");
var _node = require("msw/node");
var _dom = require("@testing-library/dom");
require("../../tree.jquery");
var _exampleData = _interopRequireDefault(require("../support/exampleData"));
var _testUtil = require("../support/testUtil");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const context = describe;
const server = (0, _node.setupServer)();
beforeAll(() => server.listen());
beforeEach(() => {
  $("body").append('<div id="tree1"></div>');
});
afterEach(() => {
  server.resetHandlers();
  const $tree = $("#tree1");
  $tree.tree("destroy");
  $tree.remove();
});
afterAll(() => server.close());
describe("tree.click", () => {
  const given = (0, _givens.default)();
  given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
  given("titleSpan", () => (0, _testUtil.titleSpan)(given.node1.element));
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      data: _exampleData.default
    });
  });
  it("fires tree.click", () => {
    const onClick = jest.fn();
    given.$tree.on("tree.click", onClick);
    given.titleSpan.trigger("click");
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({
      node: given.node1
    }));
  });
});
describe("tree.contextmenu", () => {
  const given = (0, _givens.default)();
  given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
  given("titleSpan", () => (0, _testUtil.titleSpan)(given.node1.element));
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      data: _exampleData.default
    });
  });
  it("fires tree.contextmenu", () => {
    const onContextMenu = jest.fn();
    given.$tree.on("tree.contextmenu", onContextMenu);
    given.titleSpan.trigger("contextmenu");
    expect(onContextMenu).toHaveBeenCalledWith(expect.objectContaining({
      node: given.node1
    }));
  });
});
describe("tree.dblclick", () => {
  const given = (0, _givens.default)();
  given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
  given("titleSpan", () => (0, _testUtil.titleSpan)(given.node1.element));
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      data: _exampleData.default
    });
  });
  it("fires tree.dblclick", () => {
    const onDoubleClick = jest.fn();
    given.$tree.on("tree.dblclick", onDoubleClick);
    given.titleSpan.trigger("dblclick");
    expect(onDoubleClick).toHaveBeenCalledWith(expect.objectContaining({
      node: given.node1
    }));
  });
});
describe("tree.init", () => {
  const given = (0, _givens.default)();
  given("$tree", () => $("#tree1"));
  context("with json data", () => {
    it("is called", () => {
      const onInit = jest.fn();
      given.$tree.on("tree.init", onInit);
      given.$tree.tree({
        data: _exampleData.default
      });

      // eslint-disable-next-line jest/prefer-called-with
      expect(onInit).toHaveBeenCalled();
    });
  });
  context("with data loaded from an url", () => {
    beforeEach(() => {
      server.use(_msw.rest.get("/tree/", (_request, response, ctx) => response(ctx.status(200), ctx.json(_exampleData.default))));
    });
    it("is called", async () => {
      const onInit = jest.fn();
      given.$tree.on("tree.init", onInit);
      given.$tree.tree({
        dataUrl: "/tree/"
      });
      await (0, _dom.waitFor)(() => {
        // eslint-disable-next-line jest/prefer-called-with
        expect(onInit).toHaveBeenCalled();
      });
    });
  });
});
describe("tree.load_data", () => {
  const given = (0, _givens.default)();
  given("$tree", () => $("#tree1"));
  context("when the tree is initialized with data", () => {
    it("fires tree.load_data", () => {
      const onLoadData = jest.fn();
      given.$tree.on("tree.load_data", onLoadData);
      given.$tree.tree({
        data: _exampleData.default
      });
      expect(onLoadData).toHaveBeenCalledWith(expect.objectContaining({
        tree_data: _exampleData.default
      }));
    });
  });
});
describe("tree.select", () => {
  const given = (0, _givens.default)();
  given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
  given("titleSpan", () => (0, _testUtil.titleSpan)(given.node1.element));
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      data: _exampleData.default
    });
  });
  it("fires tree.select", () => {
    const onSelect = jest.fn();
    given.$tree.on("tree.select", onSelect);
    given.titleSpan.trigger("click");
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({
      node: given.node1,
      deselected_node: null
    }));
  });
  context("when the node was selected", () => {
    beforeEach(() => {
      given.$tree.tree("selectNode", given.node1);
    });
    it("fires tree.select with node is null", () => {
      const onSelect = jest.fn();
      given.$tree.on("tree.select", onSelect);
      given.titleSpan.trigger("click");
      expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({
        node: null,
        previous_node: given.node1
      }));
    });
  });
});