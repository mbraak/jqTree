"use strict";

var _givens = _interopRequireDefault(require("givens"));
var _dom = require("@testing-library/dom");
var _msw = require("msw");
var _node = require("msw/node");
require("../../tree.jquery");
var _exampleData = _interopRequireDefault(require("../support/exampleData"));
var _testUtil = require("../support/testUtil");
var _version = _interopRequireDefault(require("../../version"));
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
describe("addNodeAfter", () => {
  const given = (0, _givens.default)();
  given("$tree", () => $("#tree1"));
  given("node", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
  beforeEach(() => {
    given.$tree.tree({
      autoOpen: true,
      data: _exampleData.default
    });
    given.$tree.tree("addNodeAfter", "added-node", given.node);
  });
  it("adds the node", () => {
    expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
      name: "node1"
    }), expect.objectContaining({
      name: "added-node"
    }), expect.objectContaining({
      name: "node2"
    })]);
  });
});
describe("addNodeBefore", () => {
  const given = (0, _givens.default)();
  given("$tree", () => $("#tree1"));
  given("node", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
  beforeEach(() => {
    given.$tree.tree({
      autoOpen: true,
      data: _exampleData.default
    });
    given.$tree.tree("addNodeBefore", "added-node", given.node);
  });
  it("adds the node", () => {
    expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
      name: "added-node"
    }), expect.objectContaining({
      name: "node1"
    }), expect.objectContaining({
      name: "node2"
    })]);
  });
});
describe("addParentNode", () => {
  const given = (0, _givens.default)();
  given("$tree", () => $("#tree1"));
  given("child1", () => given.$tree.tree("getNodeByNameMustExist", "child1"));
  beforeEach(() => {
    given.$tree.tree({
      autoOpen: true,
      data: _exampleData.default
    });
    given.$tree.tree("addParentNode", "new-parent-node", given.child1);
  });
  it("adds the parent node", () => {
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
describe("addToSelection", () => {
  const given = (0, _givens.default)();
  given("$tree", () => $("#tree1"));
  given("child1", () => given.$tree.tree("getNodeByNameMustExist", "child1"));
  given("child2", () => given.$tree.tree("getNodeByNameMustExist", "child2"));
  beforeEach(() => {
    given.$tree.tree({
      autoOpen: true,
      data: _exampleData.default
    });
    given.$tree.tree("addToSelection", given.child1);
    given.$tree.tree("addToSelection", given.child2);
  });
  it("selects the nodes", () => {
    expect(given.$tree.tree("getSelectedNodes")).toEqual(expect.arrayContaining([given.child1, given.child2]));
  });
  it("renders the nodes correctly", () => {
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
describe("appendNode", () => {
  const given = (0, _givens.default)();
  given("$tree", () => $("#tree1"));
  given("parent", () => undefined);
  given("nodeData", () => "appended-node");
  beforeEach(() => {
    given.$tree.tree({
      autoOpen: true,
      data: _exampleData.default
    });
    given.$tree.tree("appendNode", given.nodeData, given.parent);
  });
  context("with an empty parent parameter", () => {
    it("appends the node to the tree", () => {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1"
      }), expect.objectContaining({
        name: "node2"
      }), expect.objectContaining({
        name: "appended-node"
      })]);
    });
  });
  context("when appending to a parent node", () => {
    given("parent", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    it("appends the node to parent node", () => {
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
  context("when appending a node using an object", () => {
    given("nodeData", () => ({
      color: "green",
      id: 99,
      name: "appended-using-object"
    }));
    it("appends the node to the tree", () => {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1"
      }), expect.objectContaining({
        name: "node2"
      }), expect.objectContaining({
        name: "appended-using-object"
      })]);
    });
    it("sets the properties of the object", () => {
      expect(given.$tree.tree("getNodeById", 99)).toMatchObject(given.nodeData);
    });
  });
});
describe("closeNode", () => {
  const given = (0, _givens.default)();
  given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      autoOpen: true,
      data: _exampleData.default
    });
    given.$tree.tree("closeNode", given.node1, false);
  });
  it("closes the node", () => {
    expect(given.node1.element).toBeClosed();
  });
});
describe("getNodeByCallback", () => {
  const given = (0, _givens.default)();
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      data: _exampleData.default
    });
  });
  it("returns the node", () => {
    const callback = node => node.name.startsWith("chi");
    expect(given.$tree.tree("getNodeByCallback", callback)).toMatchObject({
      name: "child1"
    });
  });
});
describe("getNodeByHtmlElement", () => {
  const given = (0, _givens.default)();
  given("htmlElement", () => _dom.screen.getByText("node1", {
    selector: ".jqtree-title"
  }));
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      data: _exampleData.default
    });
  });
  it("returns the node", () => {
    expect(given.$tree.tree("getNodeByHtmlElement", given.htmlElement)).toEqual(expect.objectContaining({
      name: "node1"
    }));
  });
});
describe("getNodeById", () => {
  const given = (0, _givens.default)();
  given("data", () => _exampleData.default);
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      data: given.data
    });
  });
  it("returns the node", () => {
    expect(given.$tree.tree("getNodeById", 127)).toMatchObject({
      name: "node3"
    });
  });
  context("with a string parameter", () => {
    it("doesn't return the node", () => {
      expect(given.$tree.tree("getNodeById", "127")).toBeNull();
    });
  });
  context("when the node doesn't exist", () => {
    it("returns null", () => {
      expect(given.$tree.tree("getNodeById", 99999)).toBeNull();
    });
  });
  context("when the data has string ids", () => {
    given("data", () => [{
      id: "123",
      name: "node1"
    }]);
    context("with a string parameter", () => {
      it("returns the node", () => {
        expect(given.$tree.tree("getNodeById", "123")).toMatchObject({
          name: "node1"
        });
      });
    });
    context("with a number parameter", () => {
      it("doesn't return the node", () => {
        expect(given.$tree.tree("getNodeById", 123)).toBeNull();
      });
    });
    context("when the node doesn't exist", () => {
      it("returns null", () => {
        expect(given.$tree.tree("getNodeById", "abc")).toBeNull();
      });
    });
  });
});
describe("getNodesByProperty", () => {
  const given = (0, _givens.default)();
  given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      data: _exampleData.default
    });
  });
  it("gets nodes by property", () => {
    expect(given.$tree.tree("getNodesByProperty", "intProperty", 1)).toEqual([given.node1]);
  });
});
describe("getSelectedNode", () => {
  const given = (0, _givens.default)();
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      data: given.treeData
    });
  });
  context("when nodes have ids", () => {
    given("node", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    given("treeData", () => _exampleData.default);
    context("when no node is selected", () => {
      it("returns false", () => {
        expect(given.$tree.tree("getSelectedNode")).toBe(false);
      });
    });
    context("when a node is selected", () => {
      beforeEach(() => {
        given.$tree.tree("selectNode", given.node);
      });
      it("returns the selected node", () => {
        expect(given.$tree.tree("getSelectedNode")).toBe(given.node);
      });
    });
  });
  context("when nodes don't have ids", () => {
    given("node", () => given.$tree.tree("getNodeByNameMustExist", "without-id1"));
    given("treeData", () => ["without-id1", "without-id2"]);
    context("when no node is selected", () => {
      it("returns false", () => {
        expect(given.$tree.tree("getSelectedNode")).toBe(false);
      });
    });
    context("when a node is selected", () => {
      beforeEach(() => {
        given.$tree.tree("selectNode", given.node);
      });
      it("returns the selected node", () => {
        expect(given.$tree.tree("getSelectedNode")).toBe(given.node);
      });
    });
  });
});
describe("getSelectedNodes", () => {
  const given = (0, _givens.default)();
  given("child1", () => given.$tree.tree("getNodeByNameMustExist", "child1"));
  given("child2", () => given.$tree.tree("getNodeByNameMustExist", "child2"));
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      data: _exampleData.default
    });
  });
  context("when no node is selected", () => {
    it("returns an empty array", () => {
      expect(given.$tree.tree("getSelectedNodes")).toHaveLength(0);
    });
  });
  context("when nodes are selected", () => {
    beforeEach(() => {
      given.$tree.tree("addToSelection", given.child1);
      given.$tree.tree("addToSelection", given.child2);
    });
    it("returns the selected nodes", () => {
      expect(given.$tree.tree("getSelectedNodes")).toEqual(expect.arrayContaining([given.child1, given.child2]));
    });
  });
});
describe("getState", () => {
  const given = (0, _givens.default)();
  given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      data: _exampleData.default
    });
    given.$tree.tree("openNode", given.node1, false);
  });
  it("returns the state", () => {
    expect(given.$tree.tree("getState")).toEqual({
      open_nodes: [123],
      selected_node: []
    });
  });
});
describe("getStateFromStorage", () => {
  const given = (0, _givens.default)();
  given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      data: _exampleData.default,
      saveState: true
    });
    given.$tree.tree("openNode", given.node1, false);
  });
  it("returns the state", () => {
    expect(given.$tree.tree("getStateFromStorage")).toEqual({
      open_nodes: [123],
      selected_node: []
    });
  });
});
describe("getTree", () => {
  const given = (0, _givens.default)();
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      data: _exampleData.default
    });
  });
  it("returns the tree", () => {
    expect(given.$tree.tree("getTree")).toMatchObject({
      children: [expect.objectContaining({
        name: "node1"
      }), expect.objectContaining({
        name: "node2"
      })]
    });
  });
});
describe("getVersion", () => {
  const given = (0, _givens.default)();
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree();
  });
  it("returns the version", () => {
    expect(given.$tree.tree("getVersion")).toBe(_version.default);
  });
});
describe("isNodeSelected", () => {
  const given = (0, _givens.default)();
  given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      data: _exampleData.default
    });
  });
  context("when the node is selected", () => {
    beforeEach(() => {
      given.$tree.tree("selectNode", given.node1);
    });
    it("returns true", () => {
      expect(given.$tree.tree("isNodeSelected", given.node1)).toBeTrue();
    });
  });
  context("when the node is not selected", () => {
    it("returns false", () => {
      expect(given.$tree.tree("isNodeSelected", given.node1)).toBeFalse();
    });
  });
});
describe("loadData", () => {
  const given = (0, _givens.default)();
  given("initialData", () => ["initial1"]);
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      data: given.initialData
    });
  });
  context("when the node parameter is empty", () => {
    beforeEach(() => {
      given.$tree.tree("loadData", _exampleData.default);
    });
    it("replaces the whole tree", () => {
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
  context("with a node parameter", () => {
    beforeEach(() => {
      given.$tree.tree("loadData", _exampleData.default, given.$tree.tree("getNodeByNameMustExist", "initial1"));
    });
    it("loads the data under the node", () => {
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
  context("with a node parameter which has a selected child", () => {
    given("initialData", () => _exampleData.default);
    beforeEach(() => {
      given.$tree.tree("selectNode", given.$tree.tree("getNodeByNameMustExist", "child1"));
    });
    it("deselects the node", () => {
      given.$tree.tree("loadData", ["new-child1"], given.$tree.tree("getNodeByNameMustExist", "node1"));
      expect(given.$tree.tree("getSelectedNode")).toBeFalse();
    });
    context("when the selected node doesn't have an id", () => {
      given("initialData", () => [{
        name: "node1",
        children: ["child1", "child2"]
      }, "node2"]);
      it("deselects the node", () => {
        given.$tree.tree("loadData", ["new-child1"], given.$tree.tree("getNodeByNameMustExist", "node1"));
        expect(given.$tree.tree("getSelectedNode")).toBeFalse();
      });
      context("when the selected child is under another node", () => {
        it("doesn't deselect the node", () => {
          given.$tree.tree("loadData", ["new-child1"], given.$tree.tree("getNodeByNameMustExist", "node2"));
          expect(given.$tree.tree("getSelectedNode")).toMatchObject({
            name: "child1"
          });
        });
      });
    });
  });
});
describe("loadDataFromUrl", () => {
  const given = (0, _givens.default)();
  given("initialData", () => []);
  given("serverData", () => _exampleData.default);
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    server.use(_msw.rest.get("/tree/", (_request, response, ctx) => response(ctx.status(200), ctx.json(given.serverData))));
    given.$tree.tree({
      data: given.initialData
    });
  });
  context("with url parameter", () => {
    it("loads the tree", async () => {
      given.$tree.tree("loadDataFromUrl", "/tree/");
      await _dom.screen.findByText("node1");
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1"
      }), expect.objectContaining({
        name: "node2"
      })]);
    });
    context("with parent node", () => {
      given("initialData", () => ["initial1", "initial2"]);
      given("serverData", () => ["new1", "new2"]);
      it("loads a subtree", async () => {
        const parentNode = given.$tree.tree("getNodeByNameMustExist", "initial1");
        given.$tree.tree("loadDataFromUrl", "/tree/", parentNode);
        await _dom.screen.findByText("new1");
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
      });
    });
  });
  context("without url parameter", () => {
    it("loads the data from dataUrl", async () => {
      given.$tree.tree("setOption", "dataUrl", "/tree/");
      given.$tree.tree("loadDataFromUrl");
      await _dom.screen.findByText("node1");
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1"
      }), expect.objectContaining({
        name: "node2"
      })]);
    });
  });
});
describe("moveDown", () => {
  const given = (0, _givens.default)();
  given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      data: _exampleData.default
    });
    given.$tree.tree("selectNode", given.node1);
  });
  it("selects the next node", () => {
    given.$tree.tree("moveDown");
    expect(given.$tree.tree("getSelectedNode")).toMatchObject({
      name: "node2"
    });
  });
});
describe("moveNode", () => {
  const given = (0, _givens.default)();
  given("child1", () => given.$tree.tree("getNodeByNameMustExist", "child1"));
  given("node2", () => given.$tree.tree("getNodeByNameMustExist", "node2"));
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      autoOpen: true,
      data: _exampleData.default
    });
    given.$tree.tree("moveNode", given.child1, given.node2, "after");
  });
  it("moves node", () => {
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
describe("moveUp", () => {
  const given = (0, _givens.default)();
  given("node2", () => given.$tree.tree("getNodeByNameMustExist", "node2"));
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      data: _exampleData.default
    });
    given.$tree.tree("selectNode", given.node2);
  });
  it("selects the next node", () => {
    given.$tree.tree("moveUp");
    expect(given.$tree.tree("getSelectedNode")).toMatchObject({
      name: "node1"
    });
  });
});
describe("openNode", () => {
  const given = (0, _givens.default)();
  given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      autoOpen: false,
      data: _exampleData.default
    });
  });
  it("opens the node", () => {
    given.$tree.tree("openNode", given.node1, false);
    expect(given.node1.element).toBeOpen();
  });
  context("with onFinished parameter", () => {
    it("calls the function", async () => {
      const onFinished = jest.fn();
      given.$tree.tree("openNode", given.node1, onFinished);
      await (0, _dom.waitFor)(() => {
        expect(onFinished).toHaveBeenCalledWith(given.node1);
      });
    });
  });
});
describe("prependNode", () => {
  const given = (0, _givens.default)();
  given("$tree", () => $("#tree1"));
  given("parent", () => undefined);
  beforeEach(() => {
    given.$tree.tree({
      data: _exampleData.default
    });
    given.$tree.tree("prependNode", "prepended-node", given.parent);
  });
  context("with an empty parent parameter", () => {
    it("prepends the node to the tree", () => {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "prepended-node"
      }), expect.objectContaining({
        name: "node1"
      }), expect.objectContaining({
        name: "node2"
      })]);
    });
  });
  context("with a parent node", () => {
    given("parent", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    it("prepends the node to the parent", () => {
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
describe("refresh", () => {
  const given = (0, _givens.default)();
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      data: _exampleData.default
    });
  });
  it("rerenders the tree", () => {
    const tree = given.$tree.tree("getTree");
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
describe("reload", () => {
  const given = (0, _givens.default)();
  given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
  given("$tree", () => $("#tree1"));
  beforeEach(async () => {
    server.use(_msw.rest.get("/tree2/", (_request, response, ctx) => response(ctx.status(200), ctx.json(_exampleData.default))));
    given.$tree.tree({
      dataUrl: "/tree2/"
    });
    await _dom.screen.findByText("node1");
    given.$tree.tree("removeNode", given.node1);
  });
  it("reloads the data from the server", async () => {
    expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
      name: "node2"
    })]);
    given.$tree.tree("reload");
    await _dom.screen.findByText("node1");
    expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
      name: "node1"
    }), expect.objectContaining({
      name: "node2"
    })]);
  });
  context("with a onFinished parameter", () => {
    it("calls onFinished", async () => {
      const handleFinished = jest.fn();
      given.$tree.tree("reload", handleFinished);
      await (0, _dom.waitFor)(() => expect(handleFinished).toHaveBeenCalledWith());
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1"
      }), expect.objectContaining({
        name: "node2"
      })]);
    });
  });
});
describe("removeNode", () => {
  const given = (0, _givens.default)();
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      data: _exampleData.default
    });
  });
  context("with a child node", () => {
    given("node", () => given.$tree.tree("getNodeByNameMustExist", "child1"));
    it("removes the node", () => {
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
    context("when the node is selected", () => {
      beforeEach(() => {
        given.$tree.tree("selectNode", given.node);
      });
      it("removes and deselects the node", () => {
        given.$tree.tree("removeNode", given.node);
        expect(given.$tree.tree("getSelectedNode")).toBe(false);
      });
    });
  });
  context("with a parent node and its children", () => {
    given("node", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
    it("removes the node", () => {
      given.$tree.tree("removeNode", given.node);
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node2",
        children: [expect.objectContaining({
          name: "node3"
        })]
      })]);
    });
    context("when a child node is selected", () => {
      beforeEach(() => {
        const child1 = given.$tree.tree("getNodeByNameMustExist", "child1");
        given.$tree.tree("selectNode", child1);
      });
      it("removes the node and deselects the child", () => {
        given.$tree.tree("removeNode", given.node);
        expect(given.$tree.tree("getSelectedNode")).toBe(false);
      });
    });
  });
  context("with a root node", () => {
    given("node", () => given.$tree.tree("getTree"));
    it("raises an exception", () => {
      expect(() => given.$tree.tree("removeNode", given.node)).toThrow("Node has no parent");
    });
  });
});
describe("selectNode", () => {
  const given = (0, _givens.default)();
  given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
  given("node2", () => given.$tree.tree("getNodeByNameMustExist", "node2"));
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      data: _exampleData.default,
      selectable: true
    });
  });
  context("when another node is selected", () => {
    beforeEach(() => {
      given.$tree.tree("selectNode", given.node2);
      given.$tree.tree("selectNode", given.node1);
    });
    it("selects the node and deselects the previous node", () => {
      expect(given.node1.element).toBeSelected();
      expect(given.node2.element).not.toBeSelected();
    });
  });
  context("when the node is not selected", () => {
    beforeEach(() => {
      given.$tree.tree("selectNode", given.node1);
    });
    it("selects the node", () => {
      expect(given.node1.element).toBeSelected();
    });
  });
  context("when the node is selected", () => {
    beforeEach(() => {
      given.$tree.tree("selectNode", given.node1);
    });
    it("deselects the node", () => {
      given.$tree.tree("selectNode", given.node1);
      expect(given.node1.element).not.toBeSelected();
    });
  });
  context("with a null parameter", () => {
    beforeEach(() => {
      given.$tree.tree("selectNode", given.node1);
    });
    it("deselects the current node", () => {
      given.$tree.tree("selectNode", null);
      expect(given.$tree.tree("getSelectedNode")).toBeFalse();
    });
  });
});
describe("setOption", () => {
  const given = (0, _givens.default)();
  beforeEach(() => {
    given.$tree.tree({
      animationSpeed: 0,
      data: _exampleData.default,
      selectable: false
    });
  });
  given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
  given("$tree", () => $("#tree1"));
  it("sets an option", () => {
    given.$tree.tree("setOption", "selectable", true);
    (0, _testUtil.titleSpan)(given.node1.element).trigger("click");
    expect(given.$tree.tree("getSelectedNode")).toMatchObject({
      name: "node1"
    });
  });
});
describe("setState", () => {
  const given = (0, _givens.default)();
  beforeEach(() => {
    given.$tree.tree({
      autoOpen: false,
      data: _exampleData.default,
      selectable: true
    });
  });
  given("$tree", () => $("#tree1"));
  it("sets the state", () => {
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
describe("toggle", () => {
  const given = (0, _givens.default)();
  given("autoOpen", () => false);
  given("node1", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      autoOpen: given.autoOpen,
      data: _exampleData.default
    });
    given.$tree.tree("toggle", given.node1, false);
  });
  context("when the node is closed", () => {
    it("opens the node", () => {
      expect(given.node1.element).toBeOpen();
    });
  });
  context("when the node is open", () => {
    given("autoOpen", () => true);
    it("closes the node", () => {
      expect(given.node1.element).toBeClosed();
    });
  });
});
describe("toJson", () => {
  const given = (0, _givens.default)();
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      data: _exampleData.default
    });
  });
  it("returns nodes as json", () => {
    expect(JSON.parse(given.$tree.tree("toJson"))).toEqual(_exampleData.default);
  });
});
describe("updateNode", () => {
  const given = (0, _givens.default)();
  given("isSelected", () => false);
  given("node", () => given.$tree.tree("getNodeByNameMustExist", "node1"));
  given("$tree", () => $("#tree1"));
  beforeEach(() => {
    given.$tree.tree({
      autoOpen: true,
      data: _exampleData.default
    });
    if (given.isSelected) {
      given.$tree.tree("selectNode", given.node);
    }
    given.$tree.tree("updateNode", given.node, given.nodeData);
  });
  context("with a string", () => {
    given("nodeData", () => "updated-node");
    it("updates the name", () => {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "updated-node"
      }), expect.objectContaining({
        name: "node2"
      })]);
    });
  });
  context("with an object containing a name", () => {
    given("nodeData", () => ({
      name: "updated-node"
    }));
    it("updates the name", () => {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "updated-node"
      }), expect.objectContaining({
        name: "node2"
      })]);
    });
  });
  context("with an object containing an id", () => {
    given("nodeData", () => ({
      id: 999
    }));
    it("updates the id", () => {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1"
      }), expect.objectContaining({
        name: "node2"
      })]);
      expect(given.$tree.tree("getNodeById", 999)).toMatchObject(given.nodeData);
    });
  });
  context("with an object containing a property", () => {
    given("nodeData", () => ({
      color: "green"
    }));
    it("updates the node", () => {
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
  context("with an object containing children", () => {
    context("when adding a child to a child node", () => {
      given("nodeData", () => ({
        children: ["new-child"]
      }));
      given("node", () => given.$tree.tree("getNodeByNameMustExist", "child1"));
      it("adds the child node", () => {
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
    context("when removing the children", () => {
      given("nodeData", () => ({
        children: []
      }));
      it("removes the children", () => {
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
  context("when the node was selected", () => {
    given("isSelected", () => true);
    it("keeps the node selected", () => {
      expect(given.$tree).toHaveTreeStructure([expect.objectContaining({
        name: "node1"
      }), expect.objectContaining({
        name: "node2"
      })]);
    });
    it("keeps the focus on the node", () => {
      expect(given.node.element).toBeFocused();
    });
  });
});