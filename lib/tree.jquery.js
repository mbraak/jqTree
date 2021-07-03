"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JqTreeWidget = void 0;

var _version = _interopRequireDefault(require("./version"));

var _dragAndDropHandler = require("./dragAndDropHandler");

var _elementsRenderer = _interopRequireDefault(require("./elementsRenderer"));

var _dataLoader = _interopRequireDefault(require("./dataLoader"));

var _keyHandler = _interopRequireDefault(require("./keyHandler"));

var _mouse = _interopRequireDefault(require("./mouse.widget"));

var _saveStateHandler = _interopRequireDefault(require("./saveStateHandler"));

var _scrollHandler = _interopRequireDefault(require("./scrollHandler"));

var _selectNodeHandler = _interopRequireDefault(require("./selectNodeHandler"));

var _simple = _interopRequireDefault(require("./simple.widget"));

var _node6 = require("./node");

var _util = require("./util");

var _nodeElement = require("./nodeElement");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var NODE_PARAM_IS_EMPTY = "Node parameter is empty";
var PARAM_IS_EMPTY = "Parameter is empty: ";

var JqTreeWidget = /*#__PURE__*/function (_MouseWidget) {
  _inherits(JqTreeWidget, _MouseWidget);

  var _super = _createSuper(JqTreeWidget);

  function JqTreeWidget() {
    var _this;

    _classCallCheck(this, JqTreeWidget);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "element", void 0);

    _defineProperty(_assertThisInitialized(_this), "tree", void 0);

    _defineProperty(_assertThisInitialized(_this), "dndHandler", void 0);

    _defineProperty(_assertThisInitialized(_this), "renderer", void 0);

    _defineProperty(_assertThisInitialized(_this), "dataLoader", void 0);

    _defineProperty(_assertThisInitialized(_this), "scrollHandler", void 0);

    _defineProperty(_assertThisInitialized(_this), "selectNodeHandler", void 0);

    _defineProperty(_assertThisInitialized(_this), "isInitialized", void 0);

    _defineProperty(_assertThisInitialized(_this), "saveStateHandler", void 0);

    _defineProperty(_assertThisInitialized(_this), "keyHandler", void 0);

    _defineProperty(_assertThisInitialized(_this), "handleClick", function (e) {
      var clickTarget = _this.getClickTarget(e.target);

      if (clickTarget) {
        if (clickTarget.type === "button") {
          _this.toggle(clickTarget.node, _this.options.slide);

          e.preventDefault();
          e.stopPropagation();
        } else if (clickTarget.type === "label") {
          var _node2 = clickTarget.node;

          var event = _this._triggerEvent("tree.click", {
            node: _node2,
            click_event: e
          });

          if (!event.isDefaultPrevented()) {
            _this.doSelectNode(_node2);
          }
        }
      }
    });

    _defineProperty(_assertThisInitialized(_this), "handleDblclick", function (e) {
      var clickTarget = _this.getClickTarget(e.target);

      if ((clickTarget === null || clickTarget === void 0 ? void 0 : clickTarget.type) === "label") {
        _this._triggerEvent("tree.dblclick", {
          node: clickTarget.node,
          click_event: e
        });
      }
    });

    _defineProperty(_assertThisInitialized(_this), "handleContextmenu", function (e) {
      var $div = jQuery(e.target).closest("ul.jqtree-tree .jqtree-element");

      if ($div.length) {
        var _node3 = _this.getNode($div);

        if (_node3) {
          e.preventDefault();
          e.stopPropagation();

          _this._triggerEvent("tree.contextmenu", {
            node: _node3,
            click_event: e
          });

          return false;
        }
      }

      return null;
    });

    return _this;
  }

  _createClass(JqTreeWidget, [{
    key: "toggle",
    value: function toggle(node) {
      var slideParam = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (!node) {
        throw Error(NODE_PARAM_IS_EMPTY);
      }

      var slide = slideParam !== null && slideParam !== void 0 ? slideParam : this.options.slide;

      if (node.is_open) {
        this.closeNode(node, slide);
      } else {
        this.openNode(node, slide);
      }

      return this.element;
    }
  }, {
    key: "getTree",
    value: function getTree() {
      return this.tree;
    }
  }, {
    key: "selectNode",
    value: function selectNode(node, optionsParam) {
      this.doSelectNode(node, optionsParam);
      return this.element;
    }
  }, {
    key: "getSelectedNode",
    value: function getSelectedNode() {
      return this.selectNodeHandler.getSelectedNode();
    }
  }, {
    key: "toJson",
    value: function toJson() {
      return JSON.stringify(this.tree.getData());
    }
  }, {
    key: "loadData",
    value: function loadData(data, parentNode) {
      this.doLoadData(data, parentNode);
      return this.element;
    }
    /*
    signatures:
    - loadDataFromUrl(url, parent_node=null, on_finished=null)
        loadDataFromUrl('/my_data');
        loadDataFromUrl('/my_data', node1);
        loadDataFromUrl('/my_data', node1, function() { console.log('finished'); });
        loadDataFromUrl('/my_data', null, function() { console.log('finished'); });
     - loadDataFromUrl(parent_node=null, on_finished=null)
        loadDataFromUrl();
        loadDataFromUrl(node1);
        loadDataFromUrl(null, function() { console.log('finished'); });
        loadDataFromUrl(node1, function() { console.log('finished'); });
    */

  }, {
    key: "loadDataFromUrl",
    value: function loadDataFromUrl(param1, param2, param3) {
      if (typeof param1 === "string") {
        // first parameter is url
        this.doLoadDataFromUrl(param1, param2, param3 !== null && param3 !== void 0 ? param3 : null);
      } else {
        // first parameter is not url
        this.doLoadDataFromUrl(null, param1, param2);
      }

      return this.element;
    }
  }, {
    key: "reload",
    value: function reload(onFinished) {
      this.doLoadDataFromUrl(null, null, onFinished);
      return this.element;
    }
  }, {
    key: "refresh",
    value: function refresh() {
      this._refreshElements(null);

      return this.element;
    }
  }, {
    key: "getNodeById",
    value: function getNodeById(nodeId) {
      return this.tree.getNodeById(nodeId);
    }
  }, {
    key: "getNodeByName",
    value: function getNodeByName(name) {
      return this.tree.getNodeByName(name);
    }
  }, {
    key: "getNodeByNameMustExist",
    value: function getNodeByNameMustExist(name) {
      return this.tree.getNodeByNameMustExist(name);
    }
  }, {
    key: "getNodesByProperty",
    value: function getNodesByProperty(key, value) {
      return this.tree.getNodesByProperty(key, value);
    }
  }, {
    key: "getNodeByHtmlElement",
    value: function getNodeByHtmlElement(element) {
      return this.getNode(jQuery(element));
    }
  }, {
    key: "getNodeByCallback",
    value: function getNodeByCallback(callback) {
      return this.tree.getNodeByCallback(callback);
    }
  }, {
    key: "openNode",
    value: function openNode(node, param1, param2) {
      var _this2 = this;

      if (!node) {
        throw Error(NODE_PARAM_IS_EMPTY);
      }

      var parseParams = function parseParams() {
        var onFinished;
        var slide;

        if ((0, _util.isFunction)(param1)) {
          onFinished = param1;
          slide = null;
        } else {
          slide = param1;
          onFinished = param2;
        }

        if (slide == null) {
          var _this2$options$slide;

          slide = (_this2$options$slide = _this2.options.slide) !== null && _this2$options$slide !== void 0 ? _this2$options$slide : false;
        }

        return [slide, onFinished];
      };

      var _parseParams = parseParams(),
          _parseParams2 = _slicedToArray(_parseParams, 2),
          slide = _parseParams2[0],
          onFinished = _parseParams2[1];

      this._openNode(node, slide, onFinished);

      return this.element;
    }
  }, {
    key: "closeNode",
    value: function closeNode(node, slideParam) {
      if (!node) {
        throw Error(NODE_PARAM_IS_EMPTY);
      }

      var slide = slideParam !== null && slideParam !== void 0 ? slideParam : this.options.slide;

      if (node.isFolder() || node.isEmptyFolder) {
        new _nodeElement.FolderElement(node, this).close(slide, this.options.animationSpeed);
        this.saveState();
      }

      return this.element;
    }
  }, {
    key: "isDragging",
    value: function isDragging() {
      return this.dndHandler.isDragging;
    }
  }, {
    key: "refreshHitAreas",
    value: function refreshHitAreas() {
      this.dndHandler.refresh();
      return this.element;
    }
  }, {
    key: "addNodeAfter",
    value: function addNodeAfter(newNodeInfo, existingNode) {
      var newNode = existingNode.addAfter(newNodeInfo);

      if (newNode) {
        this._refreshElements(existingNode.parent);
      }

      return newNode;
    }
  }, {
    key: "addNodeBefore",
    value: function addNodeBefore(newNodeInfo, existingNode) {
      if (!existingNode) {
        throw Error(PARAM_IS_EMPTY + "existingNode");
      }

      var newNode = existingNode.addBefore(newNodeInfo);

      if (newNode) {
        this._refreshElements(existingNode.parent);
      }

      return newNode;
    }
  }, {
    key: "addParentNode",
    value: function addParentNode(newNodeInfo, existingNode) {
      if (!existingNode) {
        throw Error(PARAM_IS_EMPTY + "existingNode");
      }

      var newNode = existingNode.addParent(newNodeInfo);

      if (newNode) {
        this._refreshElements(newNode.parent);
      }

      return newNode;
    }
  }, {
    key: "removeNode",
    value: function removeNode(node) {
      if (!node) {
        throw Error(NODE_PARAM_IS_EMPTY);
      }

      if (!node.parent) {
        throw Error("Node has no parent");
      }

      this.selectNodeHandler.removeFromSelection(node, true); // including children

      var parent = node.parent;
      node.remove();

      this._refreshElements(parent);

      return this.element;
    }
  }, {
    key: "appendNode",
    value: function appendNode(newNodeInfo, parentNodeParam) {
      var parentNode = parentNodeParam || this.tree;
      var node = parentNode.append(newNodeInfo);

      this._refreshElements(parentNode);

      return node;
    }
  }, {
    key: "prependNode",
    value: function prependNode(newNodeInfo, parentNodeParam) {
      var parentNode = parentNodeParam !== null && parentNodeParam !== void 0 ? parentNodeParam : this.tree;
      var node = parentNode.prepend(newNodeInfo);

      this._refreshElements(parentNode);

      return node;
    }
  }, {
    key: "updateNode",
    value: function updateNode(node, data) {
      if (!node) {
        throw Error(NODE_PARAM_IS_EMPTY);
      }

      var idIsChanged = _typeof(data) === "object" && data.id && data.id !== node.id;

      if (idIsChanged) {
        this.tree.removeNodeFromIndex(node);
      }

      node.setData(data);

      if (idIsChanged) {
        this.tree.addNodeToIndex(node);
      }

      if (_typeof(data) === "object" && data["children"] && data["children"] instanceof Array) {
        node.removeChildren();

        if (data.children.length) {
          node.loadFromData(data.children);
        }
      }

      var mustSetFocus = this.selectNodeHandler.isFocusOnTree();
      var mustSelect = this.isSelectedNodeInSubtree(node);

      this._refreshElements(node);

      if (mustSelect) {
        this.selectCurrentNode(mustSetFocus);
      }

      return this.element;
    }
  }, {
    key: "isSelectedNodeInSubtree",
    value: function isSelectedNodeInSubtree(subtree) {
      var selectedNode = this.getSelectedNode();

      if (!selectedNode) {
        return false;
      } else {
        return subtree === selectedNode || subtree.isParentOf(selectedNode);
      }
    }
  }, {
    key: "moveNode",
    value: function moveNode(node, targetNode, position) {
      if (!node) {
        throw Error(NODE_PARAM_IS_EMPTY);
      }

      if (!targetNode) {
        throw Error(PARAM_IS_EMPTY + "targetNode");
      }

      var positionIndex = (0, _node6.getPosition)(position);

      if (positionIndex !== undefined) {
        this.tree.moveNode(node, targetNode, positionIndex);

        this._refreshElements(null);
      }

      return this.element;
    }
  }, {
    key: "getStateFromStorage",
    value: function getStateFromStorage() {
      return this.saveStateHandler.getStateFromStorage();
    }
  }, {
    key: "addToSelection",
    value: function addToSelection(node, mustSetFocus) {
      if (!node) {
        throw Error(NODE_PARAM_IS_EMPTY);
      }

      this.selectNodeHandler.addToSelection(node);

      this._getNodeElementForNode(node).select(mustSetFocus === undefined ? true : mustSetFocus);

      this.saveState();
      return this.element;
    }
  }, {
    key: "getSelectedNodes",
    value: function getSelectedNodes() {
      return this.selectNodeHandler.getSelectedNodes();
    }
  }, {
    key: "isNodeSelected",
    value: function isNodeSelected(node) {
      if (!node) {
        throw Error(NODE_PARAM_IS_EMPTY);
      }

      return this.selectNodeHandler.isNodeSelected(node);
    }
  }, {
    key: "removeFromSelection",
    value: function removeFromSelection(node) {
      if (!node) {
        throw Error(NODE_PARAM_IS_EMPTY);
      }

      this.selectNodeHandler.removeFromSelection(node);

      this._getNodeElementForNode(node).deselect();

      this.saveState();
      return this.element;
    }
  }, {
    key: "scrollToNode",
    value: function scrollToNode(node) {
      if (!node) {
        throw Error(NODE_PARAM_IS_EMPTY);
      }

      var nodeOffset = jQuery(node.element).offset();
      var nodeTop = nodeOffset ? nodeOffset.top : 0;
      var treeOffset = this.$el.offset();
      var treeTop = treeOffset ? treeOffset.top : 0;
      var top = nodeTop - treeTop;
      this.scrollHandler.scrollToY(top);
      return this.element;
    }
  }, {
    key: "getState",
    value: function getState() {
      return this.saveStateHandler.getState();
    }
  }, {
    key: "setState",
    value: function setState(state) {
      this.saveStateHandler.setInitialState(state);

      this._refreshElements(null);

      return this.element;
    }
  }, {
    key: "setOption",
    value: function setOption(option, value) {
      this.options[option] = value;
      return this.element;
    }
  }, {
    key: "moveDown",
    value: function moveDown() {
      var selectedNode = this.getSelectedNode();

      if (selectedNode) {
        this.keyHandler.moveDown(selectedNode);
      }

      return this.element;
    }
  }, {
    key: "moveUp",
    value: function moveUp() {
      var selectedNode = this.getSelectedNode();

      if (selectedNode) {
        this.keyHandler.moveUp(selectedNode);
      }

      return this.element;
    }
  }, {
    key: "getVersion",
    value: function getVersion() {
      return _version["default"];
    }
  }, {
    key: "_triggerEvent",
    value: function _triggerEvent(eventName, values) {
      var event = jQuery.Event(eventName, values);
      this.element.trigger(event);
      return event;
    }
  }, {
    key: "_openNode",
    value: function _openNode(node) {
      var _this3 = this;

      var slide = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var onFinished = arguments.length > 2 ? arguments[2] : undefined;

      var doOpenNode = function doOpenNode(_node, _slide, _onFinished) {
        var folderElement = new _nodeElement.FolderElement(_node, _this3);
        folderElement.open(_onFinished, _slide, _this3.options.animationSpeed);
      };

      if (node.isFolder() || node.isEmptyFolder) {
        if (node.load_on_demand) {
          this.loadFolderOnDemand(node, slide, onFinished);
        } else {
          var parent = node.parent;

          while (parent) {
            // nb: do not open root element
            if (parent.parent) {
              doOpenNode(parent, false, null);
            }

            parent = parent.parent;
          }

          doOpenNode(node, slide, onFinished);
          this.saveState();
        }
      }
    }
    /*
    Redraw the tree or part of the tree.
     from_node: redraw this subtree
    */

  }, {
    key: "_refreshElements",
    value: function _refreshElements(fromNode) {
      this.renderer.render(fromNode);

      this._triggerEvent("tree.refresh");
    }
  }, {
    key: "_getNodeElementForNode",
    value: function _getNodeElementForNode(node) {
      if (node.isFolder()) {
        return new _nodeElement.FolderElement(node, this);
      } else {
        return new _nodeElement.NodeElement(node, this);
      }
    }
  }, {
    key: "_getNodeElement",
    value: function _getNodeElement($element) {
      var node = this.getNode($element);

      if (node) {
        return this._getNodeElementForNode(node);
      } else {
        return null;
      }
    }
  }, {
    key: "_containsElement",
    value: function _containsElement(element) {
      var node = this.getNode(jQuery(element));
      return node != null && node.tree === this.tree;
    }
  }, {
    key: "_getScrollLeft",
    value: function _getScrollLeft() {
      return this.scrollHandler.getScrollLeft();
    }
  }, {
    key: "init",
    value: function init() {
      _get(_getPrototypeOf(JqTreeWidget.prototype), "init", this).call(this);

      this.element = this.$el;
      this.isInitialized = false;
      this.options.rtl = this.getRtlOption();

      if (this.options.closedIcon == null) {
        this.options.closedIcon = this.getDefaultClosedIcon();
      }

      this.renderer = new _elementsRenderer["default"](this);
      this.dataLoader = new _dataLoader["default"](this);
      this.saveStateHandler = new _saveStateHandler["default"](this);
      this.selectNodeHandler = new _selectNodeHandler["default"](this);
      this.dndHandler = new _dragAndDropHandler.DragAndDropHandler(this);
      this.scrollHandler = new _scrollHandler["default"](this);
      this.keyHandler = new _keyHandler["default"](this);
      this.initData();
      this.element.on("click", this.handleClick);
      this.element.on("dblclick", this.handleDblclick);

      if (this.options.useContextMenu) {
        this.element.on("contextmenu", this.handleContextmenu);
      }
    }
  }, {
    key: "deinit",
    value: function deinit() {
      this.element.empty();
      this.element.off();
      this.keyHandler.deinit();
      this.tree = new _node6.Node({}, true);

      _get(_getPrototypeOf(JqTreeWidget.prototype), "deinit", this).call(this);
    }
  }, {
    key: "mouseCapture",
    value: function mouseCapture(positionInfo) {
      if (this.options.dragAndDrop) {
        return this.dndHandler.mouseCapture(positionInfo);
      } else {
        return false;
      }
    }
  }, {
    key: "mouseStart",
    value: function mouseStart(positionInfo) {
      if (this.options.dragAndDrop) {
        return this.dndHandler.mouseStart(positionInfo);
      } else {
        return false;
      }
    }
  }, {
    key: "mouseDrag",
    value: function mouseDrag(positionInfo) {
      if (this.options.dragAndDrop) {
        var result = this.dndHandler.mouseDrag(positionInfo);
        this.scrollHandler.checkScrolling();
        return result;
      } else {
        return false;
      }
    }
  }, {
    key: "mouseStop",
    value: function mouseStop(positionInfo) {
      if (this.options.dragAndDrop) {
        return this.dndHandler.mouseStop(positionInfo);
      } else {
        return false;
      }
    }
  }, {
    key: "getMouseDelay",
    value: function getMouseDelay() {
      var _this$options$startDn;

      return (_this$options$startDn = this.options.startDndDelay) !== null && _this$options$startDn !== void 0 ? _this$options$startDn : 0;
    }
  }, {
    key: "initData",
    value: function initData() {
      if (this.options.data) {
        this.doLoadData(this.options.data, null);
      } else {
        var dataUrl = this.getDataUrlInfo(null);

        if (dataUrl) {
          this.doLoadDataFromUrl(null, null, null);
        } else {
          this.doLoadData([], null);
        }
      }
    }
  }, {
    key: "getDataUrlInfo",
    value: function getDataUrlInfo(node) {
      var _this4 = this;

      var dataUrl = this.options.dataUrl || this.element.data("url");

      var getUrlFromString = function getUrlFromString(url) {
        var urlInfo = {
          url: url
        };
        setUrlInfoData(urlInfo);
        return urlInfo;
      };

      var setUrlInfoData = function setUrlInfoData(urlInfo) {
        if (node !== null && node !== void 0 && node.id) {
          // Load on demand of a subtree; add node parameter
          var data = {
            node: node.id
          };
          urlInfo["data"] = data;
        } else {
          // Add selected_node parameter
          var selectedNodeId = _this4.getNodeIdToBeSelected();

          if (selectedNodeId) {
            var _data = {
              selected_node: selectedNodeId
            };
            urlInfo["data"] = _data;
          }
        }
      };

      if (typeof dataUrl === "function") {
        return dataUrl(node);
      } else if (typeof dataUrl === "string") {
        return getUrlFromString(dataUrl);
      } else if (dataUrl && _typeof(dataUrl) === "object") {
        setUrlInfoData(dataUrl);
        return dataUrl;
      } else {
        return null;
      }
    }
  }, {
    key: "getNodeIdToBeSelected",
    value: function getNodeIdToBeSelected() {
      if (this.options.saveState) {
        return this.saveStateHandler.getNodeIdToBeSelected();
      } else {
        return null;
      }
    }
  }, {
    key: "initTree",
    value: function initTree(data) {
      var _this5 = this;

      var doInit = function doInit() {
        if (!_this5.isInitialized) {
          _this5.isInitialized = true;

          _this5._triggerEvent("tree.init");
        }
      };

      if (!this.options.nodeClass) {
        return;
      }

      this.tree = new this.options.nodeClass(null, true, this.options.nodeClass);
      this.selectNodeHandler.clear();
      this.tree.loadFromData(data);
      var mustLoadOnDemand = this.setInitialState();

      this._refreshElements(null);

      if (!mustLoadOnDemand) {
        doInit();
      } else {
        // Load data on demand and then init the tree
        this.setInitialStateOnDemand(doInit);
      }
    } // Set initial state, either by restoring the state or auto-opening nodes
    // result: must load nodes on demand?

  }, {
    key: "setInitialState",
    value: function setInitialState() {
      var _this6 = this;

      var restoreState = function restoreState() {
        // result: is state restored, must load on demand?
        if (!_this6.options.saveState) {
          return [false, false];
        } else {
          var state = _this6.saveStateHandler.getStateFromStorage();

          if (!state) {
            return [false, false];
          } else {
            var _mustLoadOnDemand = _this6.saveStateHandler.setInitialState(state); // return true: the state is restored


            return [true, _mustLoadOnDemand];
          }
        }
      };

      var autoOpenNodes = function autoOpenNodes() {
        // result: must load on demand?
        if (_this6.options.autoOpen === false) {
          return false;
        }

        var maxLevel = _this6.getAutoOpenMaxLevel();

        var mustLoadOnDemand = false;

        _this6.tree.iterate(function (node, level) {
          if (node.load_on_demand) {
            mustLoadOnDemand = true;
            return false;
          } else if (!node.hasChildren()) {
            return false;
          } else {
            node.is_open = true;
            return level !== maxLevel;
          }
        });

        return mustLoadOnDemand;
      };

      var _restoreState = restoreState(),
          _restoreState2 = _slicedToArray(_restoreState, 2),
          isRestored = _restoreState2[0],
          mustLoadOnDemand = _restoreState2[1]; // eslint-disable-line prefer-const


      if (!isRestored) {
        mustLoadOnDemand = autoOpenNodes();
      }

      return mustLoadOnDemand;
    } // Set the initial state for nodes that are loaded on demand
    // Call cb_finished when done

  }, {
    key: "setInitialStateOnDemand",
    value: function setInitialStateOnDemand(cbFinished) {
      var _this7 = this;

      var restoreState = function restoreState() {
        if (!_this7.options.saveState) {
          return false;
        } else {
          var state = _this7.saveStateHandler.getStateFromStorage();

          if (!state) {
            return false;
          } else {
            _this7.saveStateHandler.setInitialStateOnDemand(state, cbFinished);

            return true;
          }
        }
      };

      var autoOpenNodes = function autoOpenNodes() {
        var maxLevel = _this7.getAutoOpenMaxLevel();

        var loadingCount = 0;

        var loadAndOpenNode = function loadAndOpenNode(node) {
          loadingCount += 1;

          _this7._openNode(node, false, function () {
            loadingCount -= 1;
            openNodes();
          });
        };

        var openNodes = function openNodes() {
          _this7.tree.iterate(function (node, level) {
            if (node.load_on_demand) {
              if (!node.is_loading) {
                loadAndOpenNode(node);
              }

              return false;
            } else {
              _this7._openNode(node, false, null);

              return level !== maxLevel;
            }
          });

          if (loadingCount === 0) {
            cbFinished();
          }
        };

        openNodes();
      };

      if (!restoreState()) {
        autoOpenNodes();
      }
    }
  }, {
    key: "getAutoOpenMaxLevel",
    value: function getAutoOpenMaxLevel() {
      if (this.options.autoOpen === true) {
        return -1;
      } else if (typeof this.options.autoOpen === "number") {
        return this.options.autoOpen;
      } else if (typeof this.options.autoOpen === "string") {
        return parseInt(this.options.autoOpen, 10);
      } else {
        return 0;
      }
    }
  }, {
    key: "getClickTarget",
    value: function getClickTarget(element) {
      var $target = jQuery(element);
      var $button = $target.closest(".jqtree-toggler");

      if ($button.length) {
        var _node4 = this.getNode($button);

        if (_node4) {
          return {
            type: "button",
            node: _node4
          };
        }
      } else {
        var $el = $target.closest(".jqtree-element");

        if ($el.length) {
          var _node5 = this.getNode($el);

          if (_node5) {
            return {
              type: "label",
              node: _node5
            };
          }
        }
      }

      return null;
    }
  }, {
    key: "getNode",
    value: function getNode($element) {
      var $li = $element.closest("li.jqtree_common");

      if ($li.length === 0) {
        return null;
      } else {
        return $li.data("node");
      }
    }
  }, {
    key: "saveState",
    value: function saveState() {
      if (this.options.saveState) {
        this.saveStateHandler.saveState();
      }
    }
  }, {
    key: "selectCurrentNode",
    value: function selectCurrentNode(mustSetFocus) {
      var node = this.getSelectedNode();

      if (node) {
        var nodeElement = this._getNodeElementForNode(node);

        if (nodeElement) {
          nodeElement.select(mustSetFocus);
        }
      }
    }
  }, {
    key: "deselectCurrentNode",
    value: function deselectCurrentNode() {
      var node = this.getSelectedNode();

      if (node) {
        this.removeFromSelection(node);
      }
    }
  }, {
    key: "getDefaultClosedIcon",
    value: function getDefaultClosedIcon() {
      if (this.options.rtl) {
        // triangle to the left
        return "&#x25c0;";
      } else {
        // triangle to the right
        return "&#x25ba;";
      }
    }
  }, {
    key: "getRtlOption",
    value: function getRtlOption() {
      if (this.options.rtl != null) {
        return this.options.rtl;
      } else {
        var dataRtl = this.element.data("rtl");

        if (dataRtl !== null && dataRtl !== false && dataRtl !== undefined) {
          return true;
        } else {
          return false;
        }
      }
    }
  }, {
    key: "doSelectNode",
    value: function doSelectNode(node, optionsParam) {
      var _this8 = this;

      var saveState = function saveState() {
        if (_this8.options.saveState) {
          _this8.saveStateHandler.saveState();
        }
      };

      if (!node) {
        // Called with empty node -> deselect current node
        this.deselectCurrentNode();
        saveState();
        return;
      }

      var defaultOptions = {
        mustSetFocus: true,
        mustToggle: true
      };

      var selectOptions = _objectSpread(_objectSpread({}, defaultOptions), optionsParam || {});

      var canSelect = function canSelect() {
        if (_this8.options.onCanSelectNode) {
          return _this8.options.selectable === true && _this8.options.onCanSelectNode(node);
        } else {
          return _this8.options.selectable === true;
        }
      };

      var openParents = function openParents() {
        var parent = node.parent;

        if (parent && parent.parent && !parent.is_open) {
          _this8.openNode(parent, false);
        }
      };

      if (!canSelect()) {
        return;
      }

      if (this.selectNodeHandler.isNodeSelected(node)) {
        if (selectOptions.mustToggle) {
          this.deselectCurrentNode();

          this._triggerEvent("tree.select", {
            node: null,
            previous_node: node
          });
        }
      } else {
        var deselectedNode = this.getSelectedNode() || null;
        this.deselectCurrentNode();
        this.addToSelection(node, selectOptions.mustSetFocus);

        this._triggerEvent("tree.select", {
          node: node,
          deselected_node: deselectedNode
        });

        openParents();
      }

      saveState();
    }
  }, {
    key: "doLoadData",
    value: function doLoadData(data, parentNode) {
      if (!data) {
        return;
      } else {
        this._triggerEvent("tree.load_data", {
          tree_data: data
        });

        if (parentNode) {
          this.deselectNodes(parentNode);
          this.loadSubtree(data, parentNode);
        } else {
          this.initTree(data);
        }

        if (this.isDragging()) {
          this.dndHandler.refresh();
        }
      }
    }
  }, {
    key: "deselectNodes",
    value: function deselectNodes(parentNode) {
      var selectedNodesUnderParent = this.selectNodeHandler.getSelectedNodesUnder(parentNode);

      var _iterator = _createForOfIteratorHelper(selectedNodesUnderParent),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var n = _step.value;
          this.selectNodeHandler.removeFromSelection(n);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "loadSubtree",
    value: function loadSubtree(data, parentNode) {
      parentNode.loadFromData(data);
      parentNode.load_on_demand = false;
      parentNode.is_loading = false;

      this._refreshElements(parentNode);
    }
  }, {
    key: "doLoadDataFromUrl",
    value: function doLoadDataFromUrl(urlInfoParam, parentNode, onFinished) {
      var urlInfo = urlInfoParam || this.getDataUrlInfo(parentNode);
      this.dataLoader.loadFromUrl(urlInfo, parentNode, onFinished);
    }
  }, {
    key: "loadFolderOnDemand",
    value: function loadFolderOnDemand(node) {
      var _this9 = this;

      var slide = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var onFinished = arguments.length > 2 ? arguments[2] : undefined;
      node.is_loading = true;
      this.doLoadDataFromUrl(null, node, function () {
        _this9._openNode(node, slide, onFinished);
      });
    }
  }]);

  return JqTreeWidget;
}(_mouse["default"]);

exports.JqTreeWidget = JqTreeWidget;

_defineProperty(JqTreeWidget, "defaults", {
  animationSpeed: "fast",
  autoEscape: true,
  autoOpen: false,
  // true / false / int (open n levels starting at 0)
  buttonLeft: true,
  // The symbol to use for a closed node - ► BLACK RIGHT-POINTING POINTER
  // http://www.fileformat.info/info/unicode/char/25ba/index.htm
  closedIcon: undefined,
  data: undefined,
  dataFilter: undefined,
  dataUrl: undefined,
  dragAndDrop: false,
  keyboardSupport: true,
  nodeClass: _node6.Node,
  onCanMove: undefined,
  // Can this node be moved?
  onCanMoveTo: undefined,
  // Can this node be moved to this position? function(moved_node, target_node, position)
  onCanSelectNode: undefined,
  onCreateLi: undefined,
  onDragMove: undefined,
  onDragStop: undefined,
  onGetStateFromStorage: undefined,
  onIsMoveHandle: undefined,
  onLoadFailed: undefined,
  onLoading: undefined,
  onSetStateFromStorage: undefined,
  openedIcon: "&#x25bc;",
  openFolderDelay: 500,
  // The delay for opening a folder during drag and drop; the value is in milliseconds
  // The symbol to use for an open node - ▼ BLACK DOWN-POINTING TRIANGLE
  // http://www.fileformat.info/info/unicode/char/25bc/index.htm
  rtl: undefined,
  // right-to-left support; true / false (default)
  saveState: false,
  // true / false / string (cookie name)
  selectable: true,
  showEmptyFolder: false,
  slide: true,
  // must display slide animation?
  startDndDelay: 300,
  // The delay for starting dnd (in milliseconds)
  tabIndex: 0,
  useContextMenu: true
});

_simple["default"].register(JqTreeWidget, "tree");