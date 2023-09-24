"use strict";

var _givens = _interopRequireDefault(require("givens"));
var _dom = require("@testing-library/dom");
var _msw = require("msw");
var _node = require("msw/node");
require("../../tree.jquery");
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
  localStorage.clear();
});
afterAll(() => server.close());
context("when a node has load_on_demand in the data", () => {
  const given = (0, _givens.default)();
  given("autoOpen", () => false);
  given("$tree", () => $("#tree1"));
  const initialData = [{
    id: 1,
    name: "parent-node",
    load_on_demand: true
  }];
  beforeEach(() => {
    server.use(_msw.rest.get("/tree/", (request, response, ctx) => {
      const parentId = request.url.searchParams.get("node");
      if (parentId === "1") {
        return response(ctx.status(200), ctx.json([{
          id: 2,
          name: "loaded-on-demand"
        }]));
      } else {
        return response(ctx.status(400));
      }
    }));
  });
  beforeEach(() => {
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
  it("creates a parent node without children", () => {
    expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
      children: [],
      name: "parent-node",
      open: false
    })]);
  });
  context("when the node is opened", () => {
    given("node", () => given.$tree.tree("getNodeByNameMustExist", "parent-node"));
    it("loads the subtree", async () => {
      (0, _testUtil.togglerLink)(given.node.element).trigger("click");
      await _dom.screen.findByText("loaded-on-demand");
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "parent-node",
        open: true,
        children: [expect.objectContaining({
          name: "loaded-on-demand"
        })]
      })]);
    });
    context("when the node is selected and has the focus", () => {
      beforeEach(() => {
        given.$tree.tree("selectNode", given.node);
      });
      it("keeps the node selected and focused", async () => {
        expect(given.node.element).toBeSelected();
        expect(given.node.element).toBeFocused();
        (0, _testUtil.togglerLink)(given.node.element).trigger("click");
        await _dom.screen.findByText("loaded-on-demand");
        expect(given.node.element).toBeSelected();
        expect(given.node.element).toBeFocused();
      });
    });
    context("when the node is not selected", () => {
      it("doesn't select the node", async () => {
        expect(given.node.element).not.toBeSelected();
        (0, _testUtil.togglerLink)(given.node.element).trigger("click");
        await _dom.screen.findByText("loaded-on-demand");
        expect(given.node.element).not.toBeSelected();
      });
    });
    context("when the node is selected and doesn't have the focus", () => {
      beforeEach(() => {
        given.$tree.tree("selectNode", given.node, {
          mustSetFocus: false
        });
      });
      it("keeps the node selected and not focused", async () => {
        expect(given.node.element).toBeSelected();
        expect(given.node.element).not.toBeFocused();
        (0, _testUtil.togglerLink)(given.node.element).trigger("click");
        await _dom.screen.findByText("loaded-on-demand");
        expect(given.node.element).toBeSelected();
        expect(given.node.element).not.toBeFocused();
      });
    });
  });
  context("with autoOpen is true", () => {
    given("autoOpen", () => true);
    it("loads the node on demand", async () => {
      await _dom.screen.findByText("loaded-on-demand");
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "parent-node",
        open: true,
        children: [expect.objectContaining({
          name: "loaded-on-demand"
        })]
      })]);
    });
  });
  context("with a saved state with an opened node", () => {
    given("savedState", () => '{"open_nodes":[1],"selected_node":[]}');
    it("opens the node and loads its children on demand", async () => {
      await _dom.screen.findByText("loaded-on-demand");
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "parent-node",
        open: true,
        children: [expect.objectContaining({
          name: "loaded-on-demand"
        })]
      })]);
    });
  });
});