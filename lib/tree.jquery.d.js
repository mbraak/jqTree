"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var INode = function INode() {
  _classCallCheck(this, INode);

  _defineProperty(this, "id", void 0);

  _defineProperty(this, "name", void 0);

  _defineProperty(this, "children", void 0);

  _defineProperty(this, "element", void 0);

  _defineProperty(this, "is_open", void 0);

  _defineProperty(this, "parent", void 0);
};