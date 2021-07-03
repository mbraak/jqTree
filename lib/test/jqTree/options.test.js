"use strict";

var _givens = _interopRequireDefault(require("givens"));

var _dom = require("@testing-library/dom");

var _msw = require("msw");

var _node = require("msw/node");

require("../../tree.jquery");

var _exampleData = _interopRequireDefault(require("../support/exampleData"));

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
  var server = null;
  beforeAll(function () {
    server = (0, _node.setupServer)(_msw.rest.get("/tree/", function (request, response, ctx) {
      var nodeName = request.headers.get("node");
      var data = nodeName ? [nodeName] : _exampleData["default"];
      return response(ctx.status(200), ctx.json(data));
    }));
    server.listen();
  });
  afterAll(function () {
    var _server;

    (_server = server) === null || _server === void 0 ? void 0 : _server.close();
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
      it("loads the data from the url", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
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
    var server = null;
    beforeAll(function () {
      server = (0, _node.setupServer)(_msw.rest.get("/tree/", function (_request, response, ctx) {
        return response(ctx.status(500), ctx.body("Internal server error"));
      }));
      server.listen();
    });
    afterAll(function () {
      var _server2;

      (_server2 = server) === null || _server2 === void 0 ? void 0 : _server2.close();
    });
    it("calls onLoadFailed", function () {
      return new Promise(function (done) {
        given.$tree.tree({
          dataUrl: "/tree/",
          onLoadFailed: function onLoadFailed(jqXHR) {
            expect(jqXHR.status).toBe(500);
            done();
          }
        });
      });
    });
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
      expect((0, _testUtil.togglerLink)(given.node1.element).text()).toEqual("◀");
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
      expect((0, _testUtil.togglerLink)(given.node1.element).text()).toEqual("◀");
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
        expect(localStorage.getItem("tree")).toEqual('{"open_nodes":[123],"selected_node":[123]}');
      });
    });
    context("when saveState is a string", function () {
      given("saveState", function () {
        return "my-state";
      });
      it("uses the string as a key", function () {
        expect(localStorage.getItem("my-state")).toEqual('{"open_nodes":[123],"selected_node":[123]}');
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