"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var exampleData = [{
  name: "node1",
  id: 123,
  // extra data
  intProperty: 1,
  strProperty: "1",
  children: [{
    name: "child1",
    id: 125,
    intProperty: 2
  }, {
    name: "child2",
    id: 126
  }]
}, {
  name: "node2",
  id: 124,
  intProperty: 3,
  strProperty: "3",
  children: [{
    name: "node3",
    id: 127,
    children: [{
      name: "child3",
      id: 128
    }]
  }]
}];
var _default = exampleData;
exports["default"] = _default;