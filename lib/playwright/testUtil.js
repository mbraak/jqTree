"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dragAndDrop = exports.getTreeStructure = exports.selectNode = exports.openNode = exports.findNodeElement = exports.findTitleElement = exports.expectToBeClosed = exports.expectToBeOpen = exports.expectToBeSelected = void 0;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var expectToBeSelected = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(handle) {
    var isSelected;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return isNodeSelected(handle);

          case 2:
            isSelected = _context.sent;
            expect(isSelected).toBe(true);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function expectToBeSelected(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.expectToBeSelected = expectToBeSelected;

var expectToBeOpen = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(handle) {
    var isOpen;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return isNodeOpen(handle);

          case 2:
            isOpen = _context2.sent;
            expect(isOpen).toBe(true);

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function expectToBeOpen(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

exports.expectToBeOpen = expectToBeOpen;

var expectToBeClosed = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(handle) {
    var isOpen;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return isNodeOpen(handle);

          case 2:
            isOpen = _context3.sent;
            expect(isOpen).toBe(false);

          case 4:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function expectToBeClosed(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

exports.expectToBeClosed = expectToBeClosed;

var findTitleElement = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(title) {
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return findElement("css=.jqtree-title >> text=\"".concat(title, "\""));

          case 2:
            return _context4.abrupt("return", _context4.sent);

          case 3:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function findTitleElement(_x4) {
    return _ref4.apply(this, arguments);
  };
}();

exports.findTitleElement = findTitleElement;

var findNodeElement = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(title) {
    var titleElement;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return findTitleElement(title);

          case 2:
            titleElement = _context5.sent;
            _context5.next = 5;
            return titleElement.evaluateHandle(function (el) {
              var li = el.closest("li");

              if (!li) {
                throw Error("Node element not found");
              }

              return li;
            });

          case 5:
            return _context5.abrupt("return", _context5.sent);

          case 6:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function findNodeElement(_x5) {
    return _ref5.apply(this, arguments);
  };
}();

exports.findNodeElement = findNodeElement;

var openNode = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(handle) {
    var toggler;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return findToggler(handle);

          case 2:
            toggler = _context6.sent;
            _context6.next = 5;
            return toggler.click();

          case 5:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function openNode(_x6) {
    return _ref6.apply(this, arguments);
  };
}();

exports.openNode = openNode;

var findToggler = /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(handle) {
    var toggler;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return handle.$(".jqtree-toggler");

          case 2:
            toggler = _context7.sent;

            if (toggler) {
              _context7.next = 5;
              break;
            }

            throw Error("Toggler button not found");

          case 5:
            return _context7.abrupt("return", toggler);

          case 6:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function findToggler(_x7) {
    return _ref7.apply(this, arguments);
  };
}();

var findElement = /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(selector) {
    var element;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return page.$(selector);

          case 2:
            element = _context8.sent;

            if (element) {
              _context8.next = 5;
              break;
            }

            throw Error("Element not found: ".concat(selector));

          case 5:
            return _context8.abrupt("return", element);

          case 6:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function findElement(_x8) {
    return _ref8.apply(this, arguments);
  };
}();

var isNodeOpen = /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(handle) {
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            return _context9.abrupt("return", handle.evaluate(function (el) {
              return !el.classList.contains("jqtree-closed");
            }));

          case 1:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));

  return function isNodeOpen(_x9) {
    return _ref9.apply(this, arguments);
  };
}();

var isNodeSelected = /*#__PURE__*/function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(handle) {
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            return _context10.abrupt("return", handle.evaluate(function (el) {
              return el.classList.contains("jqtree-selected");
            }));

          case 1:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));

  return function isNodeSelected(_x10) {
    return _ref10.apply(this, arguments);
  };
}();

var selectNode = /*#__PURE__*/function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(handle) {
    var titleHandle;
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.next = 2;
            return handle.$(".jqtree-title");

          case 2:
            titleHandle = _context11.sent;
            _context11.next = 5;
            return titleHandle === null || titleHandle === void 0 ? void 0 : titleHandle.click();

          case 5:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));

  return function selectNode(_x11) {
    return _ref11.apply(this, arguments);
  };
}();

exports.selectNode = selectNode;

var getTreeStructure = /*#__PURE__*/function () {
  var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _context12.next = 2;
            return page.evaluate("\n            ;\n            function getTreeNode($li) {\n                const $div = $li.children(\"div.jqtree-element\");\n                const $span = $div.children(\"span.jqtree-title\");\n                const name = $span.text();\n                const selected = $li.hasClass(\"jqtree-selected\");\n\n                if ($li.hasClass(\"jqtree-folder\")) {\n                    const $ul = $li.children(\"ul.jqtree_common\");\n\n                    return {\n                        nodeType: \"folder\",\n                        children: getChildren($ul),\n                        name,\n                        open: !$li.hasClass(\"jqtree-closed\"),\n                        selected,\n                    };\n                } else {\n                    return {\n                        nodeType: \"child\",\n                        name,\n                        selected,\n                    };\n                }\n            }\n\n            function getChildren($ul) {\n                return $ul\n                    .children(\"li.jqtree_common\")\n                    .map((_, li) => {\n                        return getTreeNode(jQuery(li));\n                    })\n                    .get();\n            }\n\n            JSON.stringify(window.getChildren(jQuery(\"ul.jqtree-tree\")));\n        ").then(function (s) {
              return JSON.parse(s);
            });

          case 2:
            return _context12.abrupt("return", _context12.sent);

          case 3:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12);
  }));

  return function getTreeStructure() {
    return _ref12.apply(this, arguments);
  };
}();

exports.getTreeStructure = getTreeStructure;

var getRect = /*#__PURE__*/function () {
  var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(handle) {
    var boundingBox;
    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _context13.next = 2;
            return handle.boundingBox();

          case 2:
            boundingBox = _context13.sent;

            if (boundingBox) {
              _context13.next = 5;
              break;
            }

            throw "No bounding box";

          case 5:
            return _context13.abrupt("return", boundingBox);

          case 6:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13);
  }));

  return function getRect(_x12) {
    return _ref13.apply(this, arguments);
  };
}();

var dragAndDrop = /*#__PURE__*/function () {
  var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(from, to) {
    var fromRect, toRect;
    return regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            _context14.next = 2;
            return findTitleElement(from).then(getRect);

          case 2:
            fromRect = _context14.sent;
            _context14.next = 5;
            return findTitleElement(to).then(getRect);

          case 5:
            toRect = _context14.sent;
            _context14.next = 8;
            return page.mouse.move(fromRect.x + fromRect.width / 2, fromRect.y + fromRect.height / 2);

          case 8:
            _context14.next = 10;
            return page.mouse.down();

          case 10:
            _context14.next = 12;
            return page.waitForTimeout(200);

          case 12:
            _context14.next = 14;
            return page.mouse.move(toRect.x + toRect.width / 2, toRect.y + toRect.height / 2);

          case 14:
            _context14.next = 16;
            return page.mouse.up();

          case 16:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14);
  }));

  return function dragAndDrop(_x13, _x14) {
    return _ref14.apply(this, arguments);
  };
}();

exports.dragAndDrop = dragAndDrop;