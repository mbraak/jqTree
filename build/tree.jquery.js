/*!
 * JqTree 1.5.1
 * 
 * Copyright 2020 Marco Braak
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = jQuery;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(2);


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, "JqTreeWidget", function() { return /* binding */ tree_jquery_JqTreeWidget; });

// CONCATENATED MODULE: ./src/version.ts
const version = "1.5.0";
/* harmony default export */ var src_version = (version);

// EXTERNAL MODULE: external "jQuery"
var external_jQuery_ = __webpack_require__(0);

// CONCATENATED MODULE: ./src/node.ts
var Position;
(function (Position) {
    Position[Position["Before"] = 1] = "Before";
    Position[Position["After"] = 2] = "After";
    Position[Position["Inside"] = 3] = "Inside";
    Position[Position["None"] = 4] = "None";
})(Position || (Position = {}));
const positionNames = {
    before: Position.Before,
    after: Position.After,
    inside: Position.Inside,
    none: Position.None,
};
const getPositionName = (position) => {
    for (const name in positionNames) {
        if (Object.prototype.hasOwnProperty.call(positionNames, name)) {
            if (positionNames[name] === position) {
                return name;
            }
        }
    }
    return "";
};
const getPosition = (name) => positionNames[name];
class Node {
    constructor(o = null, isRoot = false, nodeClass = Node) {
        this.name = "";
        this.isEmptyFolder = false;
        this.load_on_demand = false;
        this.setData(o);
        this.children = [];
        this.parent = null;
        if (isRoot) {
            this.idMapping = {};
            this.tree = this;
            this.nodeClass = nodeClass;
        }
    }
    /*
    Set the data of this node.

    setData(string): set the name of the node
    setdata(object): set attributes of the node

    Examples:
        setdata('node1')

        setData({ name: 'node1', id: 1});

        setData({ name: 'node2', id: 2, color: 'green'});

    * This is an internal function; it is not in the docs
    * Does not remove existing node values
    */
    setData(o) {
        if (!o) {
            return;
        }
        else if (typeof o === "string") {
            this.name = o;
        }
        else if (typeof o === "object") {
            for (const key in o) {
                if (Object.prototype.hasOwnProperty.call(o, key)) {
                    const value = o[key];
                    if (key === "label" || key === "name") {
                        // You can use the 'label' key instead of 'name'; this is a legacy feature
                        if (typeof value === "string") {
                            this.name = value;
                        }
                    }
                    else if (key !== "children" && key !== "parent") {
                        // You can't update the children or the parent using this function
                        this[key] = value;
                    }
                }
            }
        }
    }
    /*
    Create tree from data.

    Structure of data is:
    [
        {
            name: 'node1',
            children: [
                { name: 'child1' },
                { name: 'child2' }
            ]
        },
        {
            name: 'node2'
        }
    ]
    */
    loadFromData(data) {
        this.removeChildren();
        for (const o of data) {
            const node = this.createNode(o);
            this.addChild(node);
            if (typeof o === "object" &&
                o["children"] &&
                o["children"] instanceof Array) {
                if (o["children"].length === 0) {
                    node.isEmptyFolder = true;
                }
                else {
                    node.loadFromData(o["children"]);
                }
            }
        }
        return this;
    }
    /*
    Add child.

    tree.addChild(
        new Node('child1')
    );
    */
    addChild(node) {
        this.children.push(node);
        node.setParent(this);
    }
    /*
    Add child at position. Index starts at 0.

    tree.addChildAtPosition(
        new Node('abc'),
        1
    );
    */
    addChildAtPosition(node, index) {
        this.children.splice(index, 0, node);
        node.setParent(this);
    }
    /*
    Remove child. This also removes the children of the node.

    tree.removeChild(tree.children[0]);
    */
    removeChild(node) {
        // remove children from the index
        node.removeChildren();
        this.doRemoveChild(node);
    }
    /*
    Get child index.

    var index = getChildIndex(node);
    */
    getChildIndex(node) {
        return this.children.indexOf(node);
    }
    /*
    Does the tree have children?

    if (tree.hasChildren()) {
        //
    }
    */
    hasChildren() {
        return this.children.length !== 0;
    }
    isFolder() {
        return this.hasChildren() || this.load_on_demand;
    }
    /*
    Iterate over all the nodes in the tree.

    Calls callback with (node, level).

    The callback must return true to continue the iteration on current node.

    tree.iterate(
        function(node, level) {
           console.log(node.name);

           // stop iteration after level 2
           return (level <= 2);
        }
    );

    */
    iterate(callback) {
        const _iterate = (node, level) => {
            if (node.children) {
                for (const child of node.children) {
                    const result = callback(child, level);
                    if (result && child.hasChildren()) {
                        _iterate(child, level + 1);
                    }
                }
            }
        };
        _iterate(this, 0);
    }
    /*
    Move node relative to another node.

    Argument position: Position.BEFORE, Position.AFTER or Position.Inside

    // move node1 after node2
    tree.moveNode(node1, node2, Position.AFTER);
    */
    moveNode(movedNode, targetNode, position) {
        if (!movedNode.parent || movedNode.isParentOf(targetNode)) {
            // - Node is parent of target node
            // - Or, parent is empty
            return false;
        }
        else {
            movedNode.parent.doRemoveChild(movedNode);
            switch (position) {
                case Position.After: {
                    if (targetNode.parent) {
                        targetNode.parent.addChildAtPosition(movedNode, targetNode.parent.getChildIndex(targetNode) + 1);
                        return true;
                    }
                    return false;
                }
                case Position.Before: {
                    if (targetNode.parent) {
                        targetNode.parent.addChildAtPosition(movedNode, targetNode.parent.getChildIndex(targetNode));
                        return true;
                    }
                    return false;
                }
                case Position.Inside: {
                    // move inside as first child
                    targetNode.addChildAtPosition(movedNode, 0);
                    return true;
                }
                default:
                    return false;
            }
        }
    }
    /*
    Get the tree as data.
    */
    getData(includeParent = false) {
        const getDataFromNodes = (nodes) => {
            return nodes.map((node) => {
                const tmpNode = {};
                for (const k in node) {
                    if ([
                        "parent",
                        "children",
                        "element",
                        "idMapping",
                        "load_on_demand",
                        "nodeClass",
                        "tree",
                        "isEmptyFolder",
                    ].indexOf(k) === -1 &&
                        Object.prototype.hasOwnProperty.call(node, k)) {
                        const v = node[k];
                        tmpNode[k] = v;
                    }
                }
                if (node.hasChildren()) {
                    tmpNode["children"] = getDataFromNodes(node.children);
                }
                return tmpNode;
            });
        };
        if (includeParent) {
            return getDataFromNodes([this]);
        }
        else {
            return getDataFromNodes(this.children);
        }
    }
    getNodeByName(name) {
        return this.getNodeByCallback((node) => node.name === name);
    }
    getNodeByNameMustExist(name) {
        const node = this.getNodeByCallback((n) => n.name === name);
        if (!node) {
            throw `Node with name ${name} not found`;
        }
        return node;
    }
    getNodeByCallback(callback) {
        let result = null;
        this.iterate((node) => {
            if (result) {
                return false;
            }
            else if (callback(node)) {
                result = node;
                return false;
            }
            else {
                return true;
            }
        });
        return result;
    }
    addAfter(nodeInfo) {
        if (!this.parent) {
            return null;
        }
        else {
            const node = this.createNode(nodeInfo);
            const childIndex = this.parent.getChildIndex(this);
            this.parent.addChildAtPosition(node, childIndex + 1);
            if (typeof nodeInfo === "object" &&
                nodeInfo["children"] &&
                nodeInfo["children"] instanceof Array &&
                nodeInfo["children"].length) {
                node.loadFromData(nodeInfo["children"]);
            }
            return node;
        }
    }
    addBefore(nodeInfo) {
        if (!this.parent) {
            return null;
        }
        else {
            const node = this.createNode(nodeInfo);
            const childIndex = this.parent.getChildIndex(this);
            this.parent.addChildAtPosition(node, childIndex);
            if (typeof nodeInfo === "object" &&
                nodeInfo["children"] &&
                nodeInfo["children"] instanceof Array &&
                nodeInfo["children"].length) {
                node.loadFromData(nodeInfo["children"]);
            }
            return node;
        }
    }
    addParent(nodeInfo) {
        if (!this.parent) {
            return null;
        }
        else {
            const newParent = this.createNode(nodeInfo);
            if (this.tree) {
                newParent.setParent(this.tree);
            }
            const originalParent = this.parent;
            for (const child of originalParent.children) {
                newParent.addChild(child);
            }
            originalParent.children = [];
            originalParent.addChild(newParent);
            return newParent;
        }
    }
    remove() {
        if (this.parent) {
            this.parent.removeChild(this);
            this.parent = null;
        }
    }
    append(nodeInfo) {
        const node = this.createNode(nodeInfo);
        this.addChild(node);
        if (typeof nodeInfo === "object" &&
            nodeInfo["children"] &&
            nodeInfo["children"] instanceof Array &&
            nodeInfo["children"].length) {
            node.loadFromData(nodeInfo["children"]);
        }
        return node;
    }
    prepend(nodeInfo) {
        const node = this.createNode(nodeInfo);
        this.addChildAtPosition(node, 0);
        if (typeof nodeInfo === "object" &&
            nodeInfo["children"] &&
            nodeInfo["children"] instanceof Array &&
            nodeInfo["children"].length) {
            node.loadFromData(nodeInfo["children"]);
        }
        return node;
    }
    isParentOf(node) {
        let parent = node.parent;
        while (parent) {
            if (parent === this) {
                return true;
            }
            parent = parent.parent;
        }
        return false;
    }
    getLevel() {
        let level = 0;
        let node = this; // eslint-disable-line @typescript-eslint/no-this-alias
        while (node.parent) {
            level += 1;
            node = node.parent;
        }
        return level;
    }
    getNodeById(nodeId) {
        return this.idMapping[nodeId] || null;
    }
    addNodeToIndex(node) {
        if (node.id != null) {
            this.idMapping[node.id] = node;
        }
    }
    removeNodeFromIndex(node) {
        if (node.id != null) {
            delete this.idMapping[node.id];
        }
    }
    removeChildren() {
        this.iterate((child) => {
            var _a;
            (_a = this.tree) === null || _a === void 0 ? void 0 : _a.removeNodeFromIndex(child);
            return true;
        });
        this.children = [];
    }
    getPreviousSibling() {
        if (!this.parent) {
            return null;
        }
        else {
            const previousIndex = this.parent.getChildIndex(this) - 1;
            if (previousIndex >= 0) {
                return this.parent.children[previousIndex];
            }
            else {
                return null;
            }
        }
    }
    getNextSibling() {
        if (!this.parent) {
            return null;
        }
        else {
            const nextIndex = this.parent.getChildIndex(this) + 1;
            if (nextIndex < this.parent.children.length) {
                return this.parent.children[nextIndex];
            }
            else {
                return null;
            }
        }
    }
    getNodesByProperty(key, value) {
        return this.filter((node) => node[key] === value);
    }
    filter(f) {
        const result = [];
        this.iterate((node) => {
            if (f(node)) {
                result.push(node);
            }
            return true;
        });
        return result;
    }
    getNextNode(includeChildren = true) {
        if (includeChildren && this.hasChildren() && this.is_open) {
            // First child
            return this.children[0];
        }
        else {
            if (!this.parent) {
                return null;
            }
            else {
                const nextSibling = this.getNextSibling();
                if (nextSibling) {
                    // Next sibling
                    return nextSibling;
                }
                else {
                    // Next node of parent
                    return this.parent.getNextNode(false);
                }
            }
        }
    }
    getPreviousNode() {
        if (!this.parent) {
            return null;
        }
        else {
            const previousSibling = this.getPreviousSibling();
            if (previousSibling) {
                if (!previousSibling.hasChildren() ||
                    !previousSibling.is_open) {
                    // Previous sibling
                    return previousSibling;
                }
                else {
                    // Last child of previous sibling
                    return previousSibling.getLastChild();
                }
            }
            else {
                return this.getParent();
            }
        }
    }
    getParent() {
        // Return parent except if it is the root node
        if (!this.parent) {
            return null;
        }
        else if (!this.parent.parent) {
            // Root node -> null
            return null;
        }
        else {
            return this.parent;
        }
    }
    getLastChild() {
        if (!this.hasChildren()) {
            return null;
        }
        else {
            const lastChild = this.children[this.children.length - 1];
            if (!(lastChild.hasChildren() && lastChild.is_open)) {
                return lastChild;
            }
            else {
                return lastChild.getLastChild();
            }
        }
    }
    // Init Node from data without making it the root of the tree
    initFromData(data) {
        const addNode = (nodeData) => {
            this.setData(nodeData);
            if (typeof nodeData === "object" &&
                nodeData["children"] &&
                nodeData["children"] instanceof Array &&
                nodeData["children"].length) {
                addChildren(nodeData["children"]);
            }
        };
        const addChildren = (childrenData) => {
            for (const child of childrenData) {
                const node = this.createNode();
                node.initFromData(child);
                this.addChild(node);
            }
        };
        addNode(data);
    }
    setParent(parent) {
        var _a;
        this.parent = parent;
        this.tree = parent.tree;
        (_a = this.tree) === null || _a === void 0 ? void 0 : _a.addNodeToIndex(this);
    }
    doRemoveChild(node) {
        var _a;
        this.children.splice(this.getChildIndex(node), 1);
        (_a = this.tree) === null || _a === void 0 ? void 0 : _a.removeNodeFromIndex(node);
    }
    getNodeClass() {
        var _a;
        return this.nodeClass || ((_a = this === null || this === void 0 ? void 0 : this.tree) === null || _a === void 0 ? void 0 : _a.nodeClass) || Node;
    }
    createNode(nodeData) {
        const nodeClass = this.getNodeClass();
        return new nodeClass(nodeData);
    }
}

// CONCATENATED MODULE: ./src/dragAndDropHandler.ts


class dragAndDropHandler_DragAndDropHandler {
    constructor(treeWidget) {
        this.treeWidget = treeWidget;
        this.hoveredArea = null;
        this.hitAreas = [];
        this.isDragging = false;
        this.currentItem = null;
        this.positionInfo = null;
    }
    mouseCapture(positionInfo) {
        const $element = external_jQuery_(positionInfo.target);
        if (!this.mustCaptureElement($element)) {
            return null;
        }
        if (this.treeWidget.options.onIsMoveHandle &&
            !this.treeWidget.options.onIsMoveHandle($element)) {
            return null;
        }
        let nodeElement = this.treeWidget._getNodeElement($element);
        if (nodeElement && this.treeWidget.options.onCanMove) {
            if (!this.treeWidget.options.onCanMove(nodeElement.node)) {
                nodeElement = null;
            }
        }
        this.currentItem = nodeElement;
        return this.currentItem != null;
    }
    generateHitAreas() {
        if (!this.currentItem) {
            this.hitAreas = [];
        }
        else {
            const hitAreasGenerator = new dragAndDropHandler_HitAreasGenerator(this.treeWidget.tree, this.currentItem.node, this.getTreeDimensions().bottom);
            this.hitAreas = hitAreasGenerator.generate();
        }
    }
    mouseStart(positionInfo) {
        var _a;
        if (!this.currentItem ||
            positionInfo.pageX === undefined ||
            positionInfo.pageY === undefined) {
            return false;
        }
        else {
            this.refresh();
            const offset = external_jQuery_(positionInfo.target).offset();
            const left = offset ? offset.left : 0;
            const top = offset ? offset.top : 0;
            const node = this.currentItem.node;
            this.dragElement = new dragAndDropHandler_DragElement(node.name, positionInfo.pageX - left, positionInfo.pageY - top, this.treeWidget.element, (_a = this.treeWidget.options.autoEscape) !== null && _a !== void 0 ? _a : true);
            this.isDragging = true;
            this.positionInfo = positionInfo;
            this.currentItem.$element.addClass("jqtree-moving");
            return true;
        }
    }
    mouseDrag(positionInfo) {
        if (!this.currentItem ||
            !this.dragElement ||
            positionInfo.pageX === undefined ||
            positionInfo.pageY === undefined) {
            return false;
        }
        else {
            this.dragElement.move(positionInfo.pageX, positionInfo.pageY);
            this.positionInfo = positionInfo;
            const area = this.findHoveredArea(positionInfo.pageX, positionInfo.pageY);
            const canMoveTo = this.canMoveToArea(area);
            if (canMoveTo && area) {
                if (!area.node.isFolder()) {
                    this.stopOpenFolderTimer();
                }
                if (this.hoveredArea !== area) {
                    this.hoveredArea = area;
                    // If this is a closed folder, start timer to open it
                    if (this.mustOpenFolderTimer(area)) {
                        this.startOpenFolderTimer(area.node);
                    }
                    else {
                        this.stopOpenFolderTimer();
                    }
                    this.updateDropHint();
                }
            }
            else {
                this.removeHover();
                this.removeDropHint();
                this.stopOpenFolderTimer();
            }
            if (!area) {
                if (this.treeWidget.options.onDragMove) {
                    this.treeWidget.options.onDragMove(this.currentItem.node, positionInfo.originalEvent);
                }
            }
            return true;
        }
    }
    mouseStop(positionInfo) {
        this.moveItem(positionInfo);
        this.clear();
        this.removeHover();
        this.removeDropHint();
        this.removeHitAreas();
        const currentItem = this.currentItem;
        if (this.currentItem) {
            this.currentItem.$element.removeClass("jqtree-moving");
            this.currentItem = null;
        }
        this.isDragging = false;
        this.positionInfo = null;
        if (!this.hoveredArea && currentItem) {
            if (this.treeWidget.options.onDragStop) {
                this.treeWidget.options.onDragStop(currentItem.node, positionInfo.originalEvent);
            }
        }
        return false;
    }
    refresh() {
        this.removeHitAreas();
        if (this.currentItem) {
            this.generateHitAreas();
            this.currentItem = this.treeWidget._getNodeElementForNode(this.currentItem.node);
            if (this.isDragging) {
                this.currentItem.$element.addClass("jqtree-moving");
            }
        }
    }
    mustCaptureElement($element) {
        return !$element.is("input,select,textarea");
    }
    canMoveToArea(area) {
        if (!area || !this.currentItem) {
            return false;
        }
        else if (this.treeWidget.options.onCanMoveTo) {
            const positionName = getPositionName(area.position);
            return this.treeWidget.options.onCanMoveTo(this.currentItem.node, area.node, positionName);
        }
        else {
            return true;
        }
    }
    removeHitAreas() {
        this.hitAreas = [];
    }
    clear() {
        if (this.dragElement) {
            this.dragElement.remove();
            this.dragElement = null;
        }
    }
    removeDropHint() {
        if (this.previousGhost) {
            this.previousGhost.remove();
        }
    }
    removeHover() {
        this.hoveredArea = null;
    }
    findHoveredArea(x, y) {
        const dimensions = this.getTreeDimensions();
        if (x < dimensions.left ||
            y < dimensions.top ||
            x > dimensions.right ||
            y > dimensions.bottom) {
            return null;
        }
        let low = 0;
        let high = this.hitAreas.length;
        while (low < high) {
            const mid = (low + high) >> 1;
            const area = this.hitAreas[mid];
            if (y < area.top) {
                high = mid;
            }
            else if (y > area.bottom) {
                low = mid + 1;
            }
            else {
                return area;
            }
        }
        return null;
    }
    mustOpenFolderTimer(area) {
        const node = area.node;
        return (node.isFolder() &&
            !node.is_open &&
            area.position === Position.Inside);
    }
    updateDropHint() {
        if (!this.hoveredArea) {
            return;
        }
        // remove previous drop hint
        this.removeDropHint();
        // add new drop hint
        const nodeElement = this.treeWidget._getNodeElementForNode(this.hoveredArea.node);
        this.previousGhost = nodeElement.addDropHint(this.hoveredArea.position);
    }
    startOpenFolderTimer(folder) {
        const openFolder = () => {
            this.treeWidget._openNode(folder, this.treeWidget.options.slide, () => {
                this.refresh();
                this.updateDropHint();
            });
        };
        this.stopOpenFolderTimer();
        this.openFolderTimer = window.setTimeout(openFolder, this.treeWidget.options.openFolderDelay);
    }
    stopOpenFolderTimer() {
        if (this.openFolderTimer) {
            clearTimeout(this.openFolderTimer);
            this.openFolderTimer = null;
        }
    }
    moveItem(positionInfo) {
        if (this.currentItem &&
            this.hoveredArea &&
            this.hoveredArea.position !== Position.None &&
            this.canMoveToArea(this.hoveredArea)) {
            const movedNode = this.currentItem.node;
            const targetNode = this.hoveredArea.node;
            const position = this.hoveredArea.position;
            const previousParent = movedNode.parent;
            if (position === Position.Inside) {
                this.hoveredArea.node.is_open = true;
            }
            const doMove = () => {
                this.treeWidget.tree.moveNode(movedNode, targetNode, position);
                this.treeWidget.element.empty();
                this.treeWidget._refreshElements(null);
            };
            const event = this.treeWidget._triggerEvent("tree.move", {
                move_info: {
                    moved_node: movedNode,
                    target_node: targetNode,
                    position: getPositionName(position),
                    previous_parent: previousParent,
                    do_move: doMove,
                    original_event: positionInfo.originalEvent,
                },
            });
            if (!event.isDefaultPrevented()) {
                doMove();
            }
        }
    }
    getTreeDimensions() {
        // Return the dimensions of the tree. Add a margin to the bottom to allow
        // to drag-and-drop after the last element.
        const offset = this.treeWidget.element.offset();
        if (!offset) {
            return { left: 0, top: 0, right: 0, bottom: 0 };
        }
        else {
            const el = this.treeWidget.element;
            const width = el.width() || 0;
            const height = el.height() || 0;
            const left = offset.left + this.treeWidget._getScrollLeft();
            return {
                left,
                top: offset.top,
                right: left + width,
                bottom: offset.top + height + 16,
            };
        }
    }
}
class dragAndDropHandler_VisibleNodeIterator {
    constructor(tree) {
        this.tree = tree;
    }
    iterate() {
        let isFirstNode = true;
        const _iterateNode = (node, nextNode) => {
            let mustIterateInside = (node.is_open || !node.element) && node.hasChildren();
            let $element = null;
            if (node.element) {
                $element = external_jQuery_(node.element);
                if (!$element.is(":visible")) {
                    return;
                }
                if (isFirstNode) {
                    this.handleFirstNode(node);
                    isFirstNode = false;
                }
                if (!node.hasChildren()) {
                    this.handleNode(node, nextNode, $element);
                }
                else if (node.is_open) {
                    if (!this.handleOpenFolder(node, $element)) {
                        mustIterateInside = false;
                    }
                }
                else {
                    this.handleClosedFolder(node, nextNode, $element);
                }
            }
            if (mustIterateInside) {
                const childrenLength = node.children.length;
                node.children.forEach((_, i) => {
                    if (i === childrenLength - 1) {
                        _iterateNode(node.children[i], null);
                    }
                    else {
                        _iterateNode(node.children[i], node.children[i + 1]);
                    }
                });
                if (node.is_open && $element) {
                    this.handleAfterOpenFolder(node, nextNode);
                }
            }
        };
        _iterateNode(this.tree, null);
    }
}
class dragAndDropHandler_HitAreasGenerator extends dragAndDropHandler_VisibleNodeIterator {
    constructor(tree, currentNode, treeBottom) {
        super(tree);
        this.currentNode = currentNode;
        this.treeBottom = treeBottom;
    }
    generate() {
        this.positions = [];
        this.lastTop = 0;
        this.iterate();
        return this.generateHitAreas(this.positions);
    }
    generateHitAreas(positions) {
        let previousTop = -1;
        let group = [];
        const hitAreas = [];
        for (const position of positions) {
            if (position.top !== previousTop && group.length) {
                if (group.length) {
                    this.generateHitAreasForGroup(hitAreas, group, previousTop, position.top);
                }
                previousTop = position.top;
                group = [];
            }
            group.push(position);
        }
        this.generateHitAreasForGroup(hitAreas, group, previousTop, this.treeBottom);
        return hitAreas;
    }
    handleOpenFolder(node, $element) {
        if (node === this.currentNode) {
            // Cannot move inside current item
            // Stop iterating
            return false;
        }
        // Cannot move before current item
        if (node.children[0] !== this.currentNode) {
            this.addPosition(node, Position.Inside, this.getTop($element));
        }
        // Continue iterating
        return true;
    }
    handleClosedFolder(node, nextNode, $element) {
        const top = this.getTop($element);
        if (node === this.currentNode) {
            // Cannot move after current item
            this.addPosition(node, Position.None, top);
        }
        else {
            this.addPosition(node, Position.Inside, top);
            // Cannot move before current item
            if (nextNode !== this.currentNode) {
                this.addPosition(node, Position.After, top);
            }
        }
    }
    handleFirstNode(node) {
        if (node !== this.currentNode) {
            this.addPosition(node, Position.Before, this.getTop(external_jQuery_(node.element)));
        }
    }
    handleAfterOpenFolder(node, nextNode) {
        if (node === this.currentNode || nextNode === this.currentNode) {
            // Cannot move before or after current item
            this.addPosition(node, Position.None, this.lastTop);
        }
        else {
            this.addPosition(node, Position.After, this.lastTop);
        }
    }
    handleNode(node, nextNode, $element) {
        const top = this.getTop($element);
        if (node === this.currentNode) {
            // Cannot move inside current item
            this.addPosition(node, Position.None, top);
        }
        else {
            this.addPosition(node, Position.Inside, top);
        }
        if (nextNode === this.currentNode || node === this.currentNode) {
            // Cannot move before or after current item
            this.addPosition(node, Position.None, top);
        }
        else {
            this.addPosition(node, Position.After, top);
        }
    }
    getTop($element) {
        const offset = $element.offset();
        return offset ? offset.top : 0;
    }
    addPosition(node, position, top) {
        const area = {
            top,
            bottom: 0,
            node,
            position,
        };
        this.positions.push(area);
        this.lastTop = top;
    }
    generateHitAreasForGroup(hitAreas, positionsInGroup, top, bottom) {
        // limit positions in group
        const positionCount = Math.min(positionsInGroup.length, 4);
        const areaHeight = Math.round((bottom - top) / positionCount);
        let areaTop = top;
        let i = 0;
        while (i < positionCount) {
            const position = positionsInGroup[i];
            hitAreas.push({
                top: areaTop,
                bottom: areaTop + areaHeight,
                node: position.node,
                position: position.position,
            });
            areaTop += areaHeight;
            i += 1;
        }
    }
}
class dragAndDropHandler_DragElement {
    constructor(nodeName, offsetX, offsetY, $tree, autoEscape) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.$element = external_jQuery_("<span>").addClass("jqtree-title jqtree-dragging");
        if (autoEscape) {
            this.$element.text(nodeName);
        }
        else {
            this.$element.html(nodeName);
        }
        this.$element.css("position", "absolute");
        $tree.append(this.$element);
    }
    move(pageX, pageY) {
        this.$element.offset({
            left: pageX - this.offsetX,
            top: pageY - this.offsetY,
        });
    }
    remove() {
        this.$element.remove();
    }
}

// CONCATENATED MODULE: ./src/util.ts
const isInt = (n) => typeof n === "number" && n % 1 === 0;
const isFunction = (v) => typeof v === "function";
const getBoolString = (value) => value ? "true" : "false";

// CONCATENATED MODULE: ./src/elementsRenderer.ts

class elementsRenderer_ElementsRenderer {
    constructor(treeWidget) {
        this.treeWidget = treeWidget;
        this.openedIconElement = this.createButtonElement(treeWidget.options.openedIcon || "+");
        this.closedIconElement = this.createButtonElement(treeWidget.options.closedIcon || "-");
    }
    render(fromNode) {
        if (fromNode && fromNode.parent) {
            this.renderFromNode(fromNode);
        }
        else {
            this.renderFromRoot();
        }
    }
    renderFromRoot() {
        const $element = this.treeWidget.element;
        $element.empty();
        this.createDomElements($element[0], this.treeWidget.tree.children, true, 1);
    }
    renderFromNode(node) {
        // remember current li
        const $previousLi = jQuery(node.element);
        // create element
        const li = this.createLi(node, node.getLevel());
        this.attachNodeData(node, li);
        // add element to dom
        $previousLi.after(li);
        // remove previous li
        $previousLi.remove();
        // create children
        if (node.children) {
            this.createDomElements(li, node.children, false, node.getLevel() + 1);
        }
    }
    createDomElements(element, children, isRootNode, level) {
        const ul = this.createUl(isRootNode);
        element.appendChild(ul);
        for (const child of children) {
            const li = this.createLi(child, level);
            ul.appendChild(li);
            this.attachNodeData(child, li);
            if (child.hasChildren()) {
                this.createDomElements(li, child.children, false, level + 1);
            }
        }
    }
    attachNodeData(node, li) {
        node.element = li;
        jQuery(li).data("node", node);
    }
    createUl(isRootNode) {
        let classString;
        let role;
        if (!isRootNode) {
            classString = "";
            role = "group";
        }
        else {
            classString = "jqtree-tree";
            role = "tree";
            if (this.treeWidget.options.rtl) {
                classString += " jqtree-rtl";
            }
        }
        if (this.treeWidget.options.dragAndDrop) {
            classString += " jqtree-dnd";
        }
        const ul = document.createElement("ul");
        ul.className = `jqtree_common ${classString}`;
        ul.setAttribute("role", role);
        return ul;
    }
    createLi(node, level) {
        const isSelected = Boolean(this.treeWidget.selectNodeHandler.isNodeSelected(node));
        const mustShowFolder = node.isFolder() ||
            (node.isEmptyFolder && this.treeWidget.options.showEmptyFolder);
        const li = mustShowFolder
            ? this.createFolderLi(node, level, isSelected)
            : this.createNodeLi(node, level, isSelected);
        if (this.treeWidget.options.onCreateLi) {
            this.treeWidget.options.onCreateLi(node, jQuery(li), isSelected);
        }
        return li;
    }
    createFolderLi(node, level, isSelected) {
        const buttonClasses = this.getButtonClasses(node);
        const folderClasses = this.getFolderClasses(node, isSelected);
        const iconElement = node.is_open
            ? this.openedIconElement
            : this.closedIconElement;
        // li
        const li = document.createElement("li");
        li.className = `jqtree_common ${folderClasses}`;
        li.setAttribute("role", "presentation");
        // div
        const div = document.createElement("div");
        div.className = "jqtree-element jqtree_common";
        div.setAttribute("role", "presentation");
        li.appendChild(div);
        // button link
        const buttonLink = document.createElement("a");
        buttonLink.className = buttonClasses;
        buttonLink.appendChild(iconElement.cloneNode(true));
        buttonLink.setAttribute("role", "presentation");
        buttonLink.setAttribute("aria-hidden", "true");
        if (this.treeWidget.options.buttonLeft) {
            div.appendChild(buttonLink);
        }
        // title span
        div.appendChild(this.createTitleSpan(node.name, level, isSelected, node.is_open, true));
        if (!this.treeWidget.options.buttonLeft) {
            div.appendChild(buttonLink);
        }
        return li;
    }
    createNodeLi(node, level, isSelected) {
        const liClasses = ["jqtree_common"];
        if (isSelected) {
            liClasses.push("jqtree-selected");
        }
        const classString = liClasses.join(" ");
        // li
        const li = document.createElement("li");
        li.className = classString;
        li.setAttribute("role", "presentation");
        // div
        const div = document.createElement("div");
        div.className = "jqtree-element jqtree_common";
        div.setAttribute("role", "presentation");
        li.appendChild(div);
        // title span
        div.appendChild(this.createTitleSpan(node.name, level, isSelected, node.is_open, false));
        return li;
    }
    createTitleSpan(nodeName, level, isSelected, isOpen, isFolder) {
        const titleSpan = document.createElement("span");
        let classes = "jqtree-title jqtree_common";
        if (isFolder) {
            classes += " jqtree-title-folder";
        }
        titleSpan.className = classes;
        titleSpan.setAttribute("role", "treeitem");
        titleSpan.setAttribute("aria-level", `${level}`);
        titleSpan.setAttribute("aria-selected", getBoolString(isSelected));
        titleSpan.setAttribute("aria-expanded", getBoolString(isOpen));
        if (isSelected) {
            const tabIndex = this.treeWidget.options.tabIndex;
            if (tabIndex !== undefined) {
                titleSpan.setAttribute("tabindex", `${tabIndex}`);
            }
        }
        if (this.treeWidget.options.autoEscape) {
            titleSpan.textContent = nodeName;
        }
        else {
            titleSpan.innerHTML = nodeName;
        }
        return titleSpan;
    }
    getButtonClasses(node) {
        const classes = ["jqtree-toggler", "jqtree_common"];
        if (!node.is_open) {
            classes.push("jqtree-closed");
        }
        if (this.treeWidget.options.buttonLeft) {
            classes.push("jqtree-toggler-left");
        }
        else {
            classes.push("jqtree-toggler-right");
        }
        return classes.join(" ");
    }
    getFolderClasses(node, isSelected) {
        const classes = ["jqtree-folder"];
        if (!node.is_open) {
            classes.push("jqtree-closed");
        }
        if (isSelected) {
            classes.push("jqtree-selected");
        }
        if (node.is_loading) {
            classes.push("jqtree-loading");
        }
        return classes.join(" ");
    }
    createButtonElement(value) {
        if (typeof value === "string") {
            // convert value to html
            const div = document.createElement("div");
            div.innerHTML = value;
            return document.createTextNode(div.innerHTML);
        }
        else {
            return jQuery(value)[0];
        }
    }
}

// CONCATENATED MODULE: ./src/dataLoader.ts
class DataLoader {
    constructor(treeWidget) {
        this.treeWidget = treeWidget;
    }
    loadFromUrl(urlInfo, parentNode, onFinished) {
        if (!urlInfo) {
            return;
        }
        const $el = this.getDomElement(parentNode);
        this.addLoadingClass($el);
        this.notifyLoading(true, parentNode, $el);
        const stopLoading = () => {
            this.removeLoadingClass($el);
            this.notifyLoading(false, parentNode, $el);
        };
        const handleSuccess = (data) => {
            stopLoading();
            this.treeWidget.loadData(this.parseData(data), parentNode);
            if (onFinished && typeof onFinished === "function") {
                onFinished();
            }
        };
        const handleError = (jqXHR) => {
            stopLoading();
            if (this.treeWidget.options.onLoadFailed) {
                this.treeWidget.options.onLoadFailed(jqXHR);
            }
        };
        this.submitRequest(urlInfo, handleSuccess, handleError);
    }
    addLoadingClass($el) {
        if ($el) {
            $el.addClass("jqtree-loading");
        }
    }
    removeLoadingClass($el) {
        if ($el) {
            $el.removeClass("jqtree-loading");
        }
    }
    getDomElement(parentNode) {
        if (parentNode) {
            return jQuery(parentNode.element);
        }
        else {
            return this.treeWidget.element;
        }
    }
    notifyLoading(isLoading, node, $el) {
        if (this.treeWidget.options.onLoading) {
            this.treeWidget.options.onLoading(isLoading, node, $el);
        }
        this.treeWidget._triggerEvent("tree.loading_data", {
            isLoading,
            node,
            $el,
        });
    }
    submitRequest(urlInfoInput, handleSuccess, handleError) {
        var _a;
        const urlInfo = typeof urlInfoInput === "string"
            ? { url: urlInfoInput }
            : urlInfoInput;
        const ajaxSettings = Object.assign({ method: "GET", cache: false, dataType: "json", success: handleSuccess, error: handleError }, urlInfo);
        ajaxSettings.method = ((_a = ajaxSettings.method) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || "GET";
        void jQuery.ajax(ajaxSettings);
    }
    parseData(data) {
        const { dataFilter } = this.treeWidget.options;
        const getParsedData = () => {
            if (typeof data === "string") {
                return JSON.parse(data);
            }
            else {
                return data;
            }
        };
        const parsedData = getParsedData();
        if (dataFilter) {
            return dataFilter(parsedData);
        }
        else {
            return parsedData;
        }
    }
}

// CONCATENATED MODULE: ./src/keyHandler.ts
class KeyHandler {
    constructor(treeWidget) {
        this.handleKeyDown = (e) => {
            if (!this.canHandleKeyboard()) {
                return true;
            }
            const selectedNode = this.treeWidget.getSelectedNode();
            if (!selectedNode) {
                return true;
            }
            const key = e.which;
            switch (key) {
                case KeyHandler.DOWN:
                    return this.moveDown(selectedNode);
                case KeyHandler.UP:
                    return this.moveUp(selectedNode);
                case KeyHandler.RIGHT:
                    return this.moveRight(selectedNode);
                case KeyHandler.LEFT:
                    return this.moveLeft(selectedNode);
                default:
                    return true;
            }
        };
        this.treeWidget = treeWidget;
        if (treeWidget.options.keyboardSupport) {
            jQuery(document).on("keydown.jqtree", this.handleKeyDown);
        }
    }
    deinit() {
        jQuery(document).off("keydown.jqtree");
    }
    moveDown(selectedNode) {
        return this.selectNode(selectedNode.getNextNode());
    }
    moveUp(selectedNode) {
        return this.selectNode(selectedNode.getPreviousNode());
    }
    moveRight(selectedNode) {
        if (!selectedNode.isFolder()) {
            return true;
        }
        else {
            // folder node
            if (selectedNode.is_open) {
                // Right moves to the first child of an open node
                return this.selectNode(selectedNode.getNextNode());
            }
            else {
                // Right expands a closed node
                this.treeWidget.openNode(selectedNode);
                return false;
            }
        }
    }
    moveLeft(selectedNode) {
        if (selectedNode.isFolder() && selectedNode.is_open) {
            // Left on an open node closes the node
            this.treeWidget.closeNode(selectedNode);
            return false;
        }
        else {
            // Left on a closed or end node moves focus to the node's parent
            return this.selectNode(selectedNode.getParent());
        }
    }
    selectNode(node) {
        if (!node) {
            return true;
        }
        else {
            this.treeWidget.selectNode(node);
            if (!this.treeWidget.scrollHandler.isScrolledIntoView(jQuery(node.element).find(".jqtree-element"))) {
                this.treeWidget.scrollToNode(node);
            }
            return false;
        }
    }
    canHandleKeyboard() {
        return ((this.treeWidget.options.keyboardSupport || false) &&
            this.isFocusOnTree());
    }
    isFocusOnTree() {
        const activeElement = document.activeElement;
        return Boolean(activeElement &&
            activeElement.tagName === "SPAN" &&
            this.treeWidget._containsElement(activeElement));
    }
}
KeyHandler.LEFT = 37;
KeyHandler.UP = 38;
KeyHandler.RIGHT = 39;
KeyHandler.DOWN = 40;

// CONCATENATED MODULE: ./src/simple.widget.ts
const register = (widgetClass, widgetName) => {
    const getDataKey = () => `simple_widget_${widgetName}`;
    const getWidgetData = (el, dataKey) => {
        const widget = jQuery.data(el, dataKey);
        if (widget && widget instanceof SimpleWidget) {
            return widget;
        }
        else {
            return null;
        }
    };
    const createWidget = ($el, options) => {
        const dataKey = getDataKey();
        for (const el of $el.get()) {
            const existingWidget = getWidgetData(el, dataKey);
            if (!existingWidget) {
                const simpleWidgetClass = widgetClass;
                const widget = new simpleWidgetClass(el, options);
                if (!jQuery.data(el, dataKey)) {
                    jQuery.data(el, dataKey, widget);
                }
                // Call init after setting data, so we can call methods
                widget.init();
            }
        }
        return $el;
    };
    const destroyWidget = ($el) => {
        const dataKey = getDataKey();
        for (const el of $el.get()) {
            const widget = getWidgetData(el, dataKey);
            if (widget) {
                widget.destroy();
            }
            jQuery.removeData(el, dataKey);
        }
    };
    const callFunction = ($el, functionName, args) => {
        let result = null;
        for (const el of $el.get()) {
            const widget = jQuery.data(el, getDataKey());
            if (widget && widget instanceof SimpleWidget) {
                const simpleWidget = widget;
                const widgetFunction = simpleWidget[functionName];
                if (widgetFunction && typeof widgetFunction === "function") {
                    result = widgetFunction.apply(widget, args);
                }
            }
        }
        return result;
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    jQuery.fn[widgetName] = function (argument1, ...args) {
        if (!argument1) {
            return createWidget(this, null);
        }
        else if (typeof argument1 === "object") {
            const options = argument1;
            return createWidget(this, options);
        }
        else if (typeof argument1 === "string" && argument1[0] !== "_") {
            const functionName = argument1;
            if (functionName === "destroy") {
                return destroyWidget(this);
            }
            else if (functionName === "get_widget_class") {
                return widgetClass;
            }
            else {
                return callFunction(this, functionName, args);
            }
        }
    };
};
class SimpleWidget {
    constructor(el, options) {
        this.$el = jQuery(el);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const defaults = this.constructor["defaults"];
        this.options = Object.assign(Object.assign({}, defaults), options);
    }
    static register(widgetClass, widgetName) {
        register(widgetClass, widgetName);
    }
    destroy() {
        this.deinit();
    }
    init() {
        //
    }
    deinit() {
        //
    }
}
SimpleWidget.defaults = {};

// CONCATENATED MODULE: ./src/mouse.widget.ts
/*
This widget does the same a the mouse widget in jqueryui.
*/

const getPositionInfoFromMouseEvent = (e) => ({
    pageX: e.pageX,
    pageY: e.pageY,
    target: e.target,
    originalEvent: e,
});
const getPositionInfoFromTouch = (touch, e) => ({
    pageX: touch.pageX,
    pageY: touch.pageY,
    target: touch.target,
    originalEvent: e,
});
class mouse_widget_MouseWidget extends SimpleWidget {
    constructor() {
        super(...arguments);
        this.mouseDown = (e) => {
            // Left mouse button?
            if (e.button !== 0) {
                return;
            }
            const result = this.handleMouseDown(getPositionInfoFromMouseEvent(e));
            if (result && e.cancelable) {
                e.preventDefault();
            }
        };
        this.mouseMove = (e) => {
            this.handleMouseMove(e, getPositionInfoFromMouseEvent(e));
        };
        this.mouseUp = (e) => {
            this.handleMouseUp(getPositionInfoFromMouseEvent(e));
        };
        this.touchStart = (e) => {
            if (!e) {
                return;
            }
            if (e.touches.length > 1) {
                return;
            }
            const touch = e.changedTouches[0];
            this.handleMouseDown(getPositionInfoFromTouch(touch, e));
        };
        this.touchMove = (e) => {
            if (!e) {
                return;
            }
            if (e.touches.length > 1) {
                return;
            }
            const touch = e.changedTouches[0];
            this.handleMouseMove(e, getPositionInfoFromTouch(touch, e));
        };
        this.touchEnd = (e) => {
            if (!e) {
                return;
            }
            if (e.touches.length > 1) {
                return;
            }
            const touch = e.changedTouches[0];
            this.handleMouseUp(getPositionInfoFromTouch(touch, e));
        };
    }
    setMouseDelay(mouseDelay) {
        this.mouseDelay = mouseDelay;
    }
    init() {
        const element = this.$el.get(0);
        element.addEventListener("mousedown", this.mouseDown, {
            passive: false,
        });
        element.addEventListener("touchstart", this.touchStart, {
            passive: false,
        });
        this.isMouseStarted = false;
        this.mouseDelay = 0;
        this.mouseDelayTimer = null;
        this.isMouseDelayMet = false;
        this.mouseDownInfo = null;
    }
    deinit() {
        const el = this.$el.get(0);
        el.removeEventListener("mousedown", this.mouseDown);
        el.removeEventListener("touchstart", this.touchStart);
        document.removeEventListener("mousemove", this.mouseMove);
        document.removeEventListener("touchmove", this.touchMove);
        document.removeEventListener("mouseup", this.mouseUp);
        document.removeEventListener("touchend", this.touchEnd);
    }
    handleMouseDown(positionInfo) {
        // We may have missed mouseup (out of window)
        if (this.isMouseStarted) {
            this.handleMouseUp(positionInfo);
        }
        this.mouseDownInfo = positionInfo;
        if (!this.mouseCapture(positionInfo)) {
            return false;
        }
        this.handleStartMouse();
        return true;
    }
    handleStartMouse() {
        document.addEventListener("mousemove", this.mouseMove, {
            passive: false,
        });
        document.addEventListener("touchmove", this.touchMove, {
            passive: false,
        });
        document.addEventListener("mouseup", this.mouseUp, { passive: false });
        document.addEventListener("touchend", this.touchEnd, {
            passive: false,
        });
        if (this.mouseDelay) {
            this.startMouseDelayTimer();
        }
    }
    startMouseDelayTimer() {
        if (this.mouseDelayTimer) {
            clearTimeout(this.mouseDelayTimer);
        }
        this.mouseDelayTimer = window.setTimeout(() => {
            this.isMouseDelayMet = true;
        }, this.mouseDelay);
        this.isMouseDelayMet = false;
    }
    handleMouseMove(e, positionInfo) {
        if (this.isMouseStarted) {
            this.mouseDrag(positionInfo);
            if (e.cancelable) {
                e.preventDefault();
            }
            return;
        }
        if (this.mouseDelay && !this.isMouseDelayMet) {
            return;
        }
        if (this.mouseDownInfo) {
            this.isMouseStarted = this.mouseStart(this.mouseDownInfo) !== false;
        }
        if (this.isMouseStarted) {
            this.mouseDrag(positionInfo);
            if (e.cancelable) {
                e.preventDefault();
            }
        }
        else {
            this.handleMouseUp(positionInfo);
        }
    }
    handleMouseUp(positionInfo) {
        document.removeEventListener("mousemove", this.mouseMove);
        document.removeEventListener("touchmove", this.touchMove);
        document.removeEventListener("mouseup", this.mouseUp);
        document.removeEventListener("touchend", this.touchEnd);
        if (this.isMouseStarted) {
            this.isMouseStarted = false;
            this.mouseStop(positionInfo);
        }
    }
}
/* harmony default export */ var mouse_widget = (mouse_widget_MouseWidget);

// CONCATENATED MODULE: ./src/saveStateHandler.ts

class saveStateHandler_SaveStateHandler {
    constructor(treeWidget) {
        this.treeWidget = treeWidget;
    }
    saveState() {
        const state = JSON.stringify(this.getState());
        if (this.treeWidget.options.onSetStateFromStorage) {
            this.treeWidget.options.onSetStateFromStorage(state);
        }
        else if (this.supportsLocalStorage()) {
            localStorage.setItem(this.getKeyName(), state);
        }
    }
    getStateFromStorage() {
        const jsonData = this.loadFromStorage();
        if (jsonData) {
            return this.parseState(jsonData);
        }
        else {
            return null;
        }
    }
    getState() {
        const getOpenNodeIds = () => {
            const openNodes = [];
            this.treeWidget.tree.iterate((node) => {
                if (node.is_open && node.id && node.hasChildren()) {
                    openNodes.push(node.id);
                }
                return true;
            });
            return openNodes;
        };
        const getSelectedNodeIds = () => {
            const selectedNodeIds = [];
            this.treeWidget.getSelectedNodes().forEach((node) => {
                if (node.id != null) {
                    selectedNodeIds.push(node.id);
                }
            });
            return selectedNodeIds;
        };
        return {
            open_nodes: getOpenNodeIds(),
            selected_node: getSelectedNodeIds(),
        };
    }
    /*
    Set initial state
    Don't handle nodes that are loaded on demand

    result: must load on demand
    */
    setInitialState(state) {
        if (!state) {
            return false;
        }
        else {
            let mustLoadOnDemand = false;
            if (state.open_nodes) {
                mustLoadOnDemand = this.openInitialNodes(state.open_nodes);
            }
            if (state.selected_node) {
                this.resetSelection();
                this.selectInitialNodes(state.selected_node);
            }
            return mustLoadOnDemand;
        }
    }
    setInitialStateOnDemand(state, cbFinished) {
        if (state) {
            this.doSetInitialStateOnDemand(state.open_nodes, state.selected_node, cbFinished);
        }
        else {
            cbFinished();
        }
    }
    getNodeIdToBeSelected() {
        const state = this.getStateFromStorage();
        if (state && state.selected_node) {
            return state.selected_node[0];
        }
        else {
            return null;
        }
    }
    parseState(jsonData) {
        const state = JSON.parse(jsonData);
        // Check if selected_node is an int (instead of an array)
        if (state && state.selected_node && isInt(state.selected_node)) {
            // Convert to array
            state.selected_node = [state.selected_node];
        }
        return state;
    }
    loadFromStorage() {
        if (this.treeWidget.options.onGetStateFromStorage) {
            return this.treeWidget.options.onGetStateFromStorage();
        }
        else if (this.supportsLocalStorage()) {
            return localStorage.getItem(this.getKeyName());
        }
        else {
            return null;
        }
    }
    openInitialNodes(nodeIds) {
        let mustLoadOnDemand = false;
        for (const nodeDd of nodeIds) {
            const node = this.treeWidget.getNodeById(nodeDd);
            if (node) {
                if (!node.load_on_demand) {
                    node.is_open = true;
                }
                else {
                    mustLoadOnDemand = true;
                }
            }
        }
        return mustLoadOnDemand;
    }
    selectInitialNodes(nodeIds) {
        let selectCount = 0;
        for (const nodeId of nodeIds) {
            const node = this.treeWidget.getNodeById(nodeId);
            if (node) {
                selectCount += 1;
                this.treeWidget.selectNodeHandler.addToSelection(node);
            }
        }
        return selectCount !== 0;
    }
    resetSelection() {
        const selectNodeHandler = this.treeWidget.selectNodeHandler;
        const selectedNodes = selectNodeHandler.getSelectedNodes();
        selectedNodes.forEach((node) => {
            selectNodeHandler.removeFromSelection(node);
        });
    }
    doSetInitialStateOnDemand(nodeIdsParam, selectedNodes, cbFinished) {
        let loadingCount = 0;
        let nodeIds = nodeIdsParam;
        const openNodes = () => {
            const newNodesIds = [];
            for (const nodeId of nodeIds) {
                const node = this.treeWidget.getNodeById(nodeId);
                if (!node) {
                    newNodesIds.push(nodeId);
                }
                else {
                    if (!node.is_loading) {
                        if (node.load_on_demand) {
                            loadAndOpenNode(node);
                        }
                        else {
                            this.treeWidget._openNode(node, false, null);
                        }
                    }
                }
            }
            nodeIds = newNodesIds;
            if (this.selectInitialNodes(selectedNodes)) {
                this.treeWidget._refreshElements(null);
            }
            if (loadingCount === 0) {
                cbFinished();
            }
        };
        const loadAndOpenNode = (node) => {
            loadingCount += 1;
            this.treeWidget._openNode(node, false, () => {
                loadingCount -= 1;
                openNodes();
            });
        };
        openNodes();
    }
    getKeyName() {
        if (typeof this.treeWidget.options.saveState === "string") {
            return this.treeWidget.options.saveState;
        }
        else {
            return "tree";
        }
    }
    supportsLocalStorage() {
        const testSupport = () => {
            // Is local storage supported?
            if (localStorage == null) {
                return false;
            }
            else {
                // Check if it's possible to store an item. Safari does not allow this in private browsing mode.
                try {
                    const key = "_storage_test";
                    sessionStorage.setItem(key, "value");
                    sessionStorage.removeItem(key);
                }
                catch (error) {
                    return false;
                }
                return true;
            }
        };
        if (this._supportsLocalStorage == null) {
            this._supportsLocalStorage = testSupport();
        }
        return this._supportsLocalStorage;
    }
}

// CONCATENATED MODULE: ./src/scrollHandler.ts
class ScrollHandler {
    constructor(treeWidget) {
        this.treeWidget = treeWidget;
        this.previousTop = -1;
        this.isInitialized = false;
    }
    checkScrolling() {
        this.ensureInit();
        this.checkVerticalScrolling();
        this.checkHorizontalScrolling();
    }
    scrollToY(top) {
        this.ensureInit();
        if (this.$scrollParent) {
            this.$scrollParent[0].scrollTop = top;
        }
        else {
            const offset = this.treeWidget.$el.offset();
            const treeTop = offset ? offset.top : 0;
            jQuery(document).scrollTop(top + treeTop);
        }
    }
    isScrolledIntoView($element) {
        this.ensureInit();
        let elementBottom;
        let viewBottom;
        let elementTop;
        let viewTop;
        const elHeight = $element.height() || 0;
        if (this.$scrollParent) {
            viewTop = 0;
            viewBottom = this.$scrollParent.height() || 0;
            const offset = $element.offset();
            const originalTop = offset ? offset.top : 0;
            elementTop = originalTop - this.scrollParentTop;
            elementBottom = elementTop + elHeight;
        }
        else {
            viewTop = jQuery(window).scrollTop() || 0;
            const windowHeight = jQuery(window).height() || 0;
            viewBottom = viewTop + windowHeight;
            const offset = $element.offset();
            elementTop = offset ? offset.top : 0;
            elementBottom = elementTop + elHeight;
        }
        return elementBottom <= viewBottom && elementTop >= viewTop;
    }
    getScrollLeft() {
        if (!this.$scrollParent) {
            return 0;
        }
        else {
            return this.$scrollParent.scrollLeft() || 0;
        }
    }
    initScrollParent() {
        const getParentWithOverflow = () => {
            const cssAttributes = ["overflow", "overflow-y"];
            const hasOverFlow = ($el) => {
                for (const attr of cssAttributes) {
                    const overflowValue = $el.css(attr);
                    if (overflowValue === "auto" ||
                        overflowValue === "scroll") {
                        return true;
                    }
                }
                return false;
            };
            if (hasOverFlow(this.treeWidget.$el)) {
                return this.treeWidget.$el;
            }
            for (const el of this.treeWidget.$el.parents().get()) {
                const $el = jQuery(el);
                if (hasOverFlow($el)) {
                    return $el;
                }
            }
            return null;
        };
        const setDocumentAsScrollParent = () => {
            this.scrollParentTop = 0;
            this.$scrollParent = null;
        };
        if (this.treeWidget.$el.css("position") === "fixed") {
            setDocumentAsScrollParent();
        }
        const $scrollParent = getParentWithOverflow();
        if ($scrollParent &&
            $scrollParent.length &&
            $scrollParent[0].tagName !== "HTML") {
            this.$scrollParent = $scrollParent;
            const offset = this.$scrollParent.offset();
            this.scrollParentTop = offset ? offset.top : 0;
        }
        else {
            setDocumentAsScrollParent();
        }
        this.isInitialized = true;
    }
    ensureInit() {
        if (!this.isInitialized) {
            this.initScrollParent();
        }
    }
    handleVerticalScrollingWithScrollParent(area) {
        const scrollParent = this.$scrollParent && this.$scrollParent[0];
        if (!scrollParent) {
            return;
        }
        const distanceBottom = this.scrollParentTop + scrollParent.offsetHeight - area.bottom;
        if (distanceBottom < 20) {
            scrollParent.scrollTop += 20;
            this.treeWidget.refreshHitAreas();
            this.previousTop = -1;
        }
        else if (area.top - this.scrollParentTop < 20) {
            scrollParent.scrollTop -= 20;
            this.treeWidget.refreshHitAreas();
            this.previousTop = -1;
        }
    }
    handleVerticalScrollingWithDocument(area) {
        const scrollTop = jQuery(document).scrollTop() || 0;
        const distanceTop = area.top - scrollTop;
        if (distanceTop < 20) {
            jQuery(document).scrollTop(scrollTop - 20);
        }
        else {
            const windowHeight = jQuery(window).height() || 0;
            if (windowHeight - (area.bottom - scrollTop) < 20) {
                jQuery(document).scrollTop(scrollTop + 20);
            }
        }
    }
    checkVerticalScrolling() {
        const hoveredArea = this.treeWidget.dndHandler.hoveredArea;
        if (hoveredArea && hoveredArea.top !== this.previousTop) {
            this.previousTop = hoveredArea.top;
            if (this.$scrollParent) {
                this.handleVerticalScrollingWithScrollParent(hoveredArea);
            }
            else {
                this.handleVerticalScrollingWithDocument(hoveredArea);
            }
        }
    }
    checkHorizontalScrolling() {
        const positionInfo = this.treeWidget.dndHandler.positionInfo;
        if (!positionInfo) {
            return;
        }
        if (this.$scrollParent) {
            this.handleHorizontalScrollingWithParent(positionInfo);
        }
        else {
            this.handleHorizontalScrollingWithDocument(positionInfo);
        }
    }
    handleHorizontalScrollingWithParent(positionInfo) {
        if (positionInfo.pageX === undefined ||
            positionInfo.pageY === undefined) {
            return;
        }
        const $scrollParent = this.$scrollParent;
        const scrollParentOffset = $scrollParent && $scrollParent.offset();
        if (!($scrollParent && scrollParentOffset)) {
            return;
        }
        const scrollParent = $scrollParent[0];
        const canScrollRight = scrollParent.scrollLeft + scrollParent.clientWidth <
            scrollParent.scrollWidth;
        const canScrollLeft = scrollParent.scrollLeft > 0;
        const rightEdge = scrollParentOffset.left + scrollParent.clientWidth;
        const leftEdge = scrollParentOffset.left;
        const isNearRightEdge = positionInfo.pageX > rightEdge - 20;
        const isNearLeftEdge = positionInfo.pageX < leftEdge + 20;
        if (isNearRightEdge && canScrollRight) {
            scrollParent.scrollLeft = Math.min(scrollParent.scrollLeft + 20, scrollParent.scrollWidth);
        }
        else if (isNearLeftEdge && canScrollLeft) {
            scrollParent.scrollLeft = Math.max(scrollParent.scrollLeft - 20, 0);
        }
    }
    handleHorizontalScrollingWithDocument(positionInfo) {
        if (positionInfo.pageX === undefined ||
            positionInfo.pageY === undefined) {
            return;
        }
        const $document = jQuery(document);
        const scrollLeft = $document.scrollLeft() || 0;
        const windowWidth = jQuery(window).width() || 0;
        const canScrollLeft = scrollLeft > 0;
        const isNearRightEdge = positionInfo.pageX > windowWidth - 20;
        const isNearLeftEdge = positionInfo.pageX - scrollLeft < 20;
        if (isNearRightEdge) {
            $document.scrollLeft(scrollLeft + 20);
        }
        else if (isNearLeftEdge && canScrollLeft) {
            $document.scrollLeft(Math.max(scrollLeft - 20, 0));
        }
    }
}

// CONCATENATED MODULE: ./src/selectNodeHandler.ts
class SelectNodeHandler {
    constructor(treeWidget) {
        this.treeWidget = treeWidget;
        this.clear();
    }
    getSelectedNode() {
        const selectedNodes = this.getSelectedNodes();
        if (selectedNodes.length) {
            return selectedNodes[0];
        }
        else {
            return false;
        }
    }
    getSelectedNodes() {
        if (this.selectedSingleNode) {
            return [this.selectedSingleNode];
        }
        else {
            const selectedNodes = [];
            for (const id in this.selectedNodes) {
                if (Object.prototype.hasOwnProperty.call(this.selectedNodes, id)) {
                    const node = this.treeWidget.getNodeById(id);
                    if (node) {
                        selectedNodes.push(node);
                    }
                }
            }
            return selectedNodes;
        }
    }
    getSelectedNodesUnder(parent) {
        if (this.selectedSingleNode) {
            if (parent.isParentOf(this.selectedSingleNode)) {
                return [this.selectedSingleNode];
            }
            else {
                return [];
            }
        }
        else {
            const selectedNodes = [];
            for (const id in this.selectedNodes) {
                if (Object.prototype.hasOwnProperty.call(this.selectedNodes, id)) {
                    const node = this.treeWidget.getNodeById(id);
                    if (node && parent.isParentOf(node)) {
                        selectedNodes.push(node);
                    }
                }
            }
            return selectedNodes;
        }
    }
    isNodeSelected(node) {
        if (node.id != null) {
            if (this.selectedNodes[node.id]) {
                return true;
            }
            else {
                return false;
            }
        }
        else if (this.selectedSingleNode) {
            return this.selectedSingleNode.element === node.element;
        }
        else {
            return false;
        }
    }
    clear() {
        this.selectedNodes = {};
        this.selectedSingleNode = null;
    }
    removeFromSelection(node, includeChildren = false) {
        if (node.id == null) {
            if (this.selectedSingleNode &&
                node.element === this.selectedSingleNode.element) {
                this.selectedSingleNode = null;
            }
        }
        else {
            delete this.selectedNodes[node.id];
            if (includeChildren) {
                node.iterate(() => {
                    if (node.id != null) {
                        delete this.selectedNodes[node.id];
                    }
                    return true;
                });
            }
        }
    }
    addToSelection(node) {
        if (node.id != null) {
            this.selectedNodes[node.id] = true;
        }
        else {
            this.selectedSingleNode = node;
        }
    }
}

// CONCATENATED MODULE: ./src/nodeElement.ts

class nodeElement_NodeElement {
    constructor(node, treeWidget) {
        this.init(node, treeWidget);
    }
    init(node, treeWidget) {
        this.node = node;
        this.treeWidget = treeWidget;
        if (!node.element) {
            node.element = this.treeWidget.element.get(0);
        }
        this.$element = jQuery(node.element);
    }
    addDropHint(position) {
        if (this.mustShowBorderDropHint(position)) {
            return new BorderDropHint(this.$element, this.treeWidget._getScrollLeft());
        }
        else {
            return new nodeElement_GhostDropHint(this.node, this.$element, position);
        }
    }
    select(mustSetFocus) {
        var _a;
        const $li = this.getLi();
        $li.addClass("jqtree-selected");
        $li.attr("aria-selected", "true");
        const $span = this.getSpan();
        $span.attr("tabindex", (_a = this.treeWidget.options.tabIndex) !== null && _a !== void 0 ? _a : null);
        if (mustSetFocus) {
            $span.focus();
        }
    }
    deselect() {
        const $li = this.getLi();
        $li.removeClass("jqtree-selected");
        $li.attr("aria-selected", "false");
        const $span = this.getSpan();
        $span.removeAttr("tabindex");
        $span.blur();
    }
    getUl() {
        return this.$element.children("ul:first");
    }
    getSpan() {
        return this.$element
            .children(".jqtree-element")
            .find("span.jqtree-title");
    }
    getLi() {
        return this.$element;
    }
    mustShowBorderDropHint(position) {
        return position === Position.Inside;
    }
}
class nodeElement_FolderElement extends nodeElement_NodeElement {
    open(onFinished, slide = true, animationSpeed = "fast") {
        if (this.node.is_open) {
            return;
        }
        this.node.is_open = true;
        const $button = this.getButton();
        $button.removeClass("jqtree-closed");
        $button.html("");
        const buttonEl = $button.get(0);
        if (buttonEl) {
            const icon = this.treeWidget.renderer.openedIconElement.cloneNode(true);
            buttonEl.appendChild(icon);
        }
        const doOpen = () => {
            const $li = this.getLi();
            $li.removeClass("jqtree-closed");
            const $span = this.getSpan();
            $span.attr("aria-expanded", "true");
            if (onFinished) {
                onFinished(this.node);
            }
            this.treeWidget._triggerEvent("tree.open", {
                node: this.node,
            });
        };
        if (slide) {
            this.getUl().slideDown(animationSpeed, doOpen);
        }
        else {
            this.getUl().show();
            doOpen();
        }
    }
    close(slide = true, animationSpeed = "fast") {
        if (!this.node.is_open) {
            return;
        }
        this.node.is_open = false;
        const $button = this.getButton();
        $button.addClass("jqtree-closed");
        $button.html("");
        const buttonEl = $button.get(0);
        if (buttonEl) {
            const icon = this.treeWidget.renderer.closedIconElement.cloneNode(true);
            buttonEl.appendChild(icon);
        }
        const doClose = () => {
            const $li = this.getLi();
            $li.addClass("jqtree-closed");
            const $span = this.getSpan();
            $span.attr("aria-expanded", "false");
            this.treeWidget._triggerEvent("tree.close", {
                node: this.node,
            });
        };
        if (slide) {
            this.getUl().slideUp(animationSpeed, doClose);
        }
        else {
            this.getUl().hide();
            doClose();
        }
    }
    mustShowBorderDropHint(position) {
        return !this.node.is_open && position === Position.Inside;
    }
    getButton() {
        return this.$element
            .children(".jqtree-element")
            .find("a.jqtree-toggler");
    }
}
class BorderDropHint {
    constructor($element, scrollLeft) {
        const $div = $element.children(".jqtree-element");
        const elWidth = $element.width() || 0;
        const width = Math.max(elWidth + scrollLeft - 4, 0);
        const elHeight = $div.outerHeight() || 0;
        const height = Math.max(elHeight - 4, 0);
        this.$hint = jQuery('<span class="jqtree-border"></span>');
        $div.append(this.$hint);
        this.$hint.css({ width, height });
    }
    remove() {
        this.$hint.remove();
    }
}
class nodeElement_GhostDropHint {
    constructor(node, $element, position) {
        this.$element = $element;
        this.node = node;
        this.$ghost = jQuery(`<li class="jqtree_common jqtree-ghost"><span class="jqtree_common jqtree-circle"></span>
            <span class="jqtree_common jqtree-line"></span></li>`);
        if (position === Position.After) {
            this.moveAfter();
        }
        else if (position === Position.Before) {
            this.moveBefore();
        }
        else if (position === Position.Inside) {
            if (node.isFolder() && node.is_open) {
                this.moveInsideOpenFolder();
            }
            else {
                this.moveInside();
            }
        }
    }
    remove() {
        this.$ghost.remove();
    }
    moveAfter() {
        this.$element.after(this.$ghost);
    }
    moveBefore() {
        this.$element.before(this.$ghost);
    }
    moveInsideOpenFolder() {
        jQuery(this.node.children[0].element).before(this.$ghost);
    }
    moveInside() {
        this.$element.after(this.$ghost);
        this.$ghost.addClass("jqtree-inside");
    }
}

// CONCATENATED MODULE: ./src/tree.jquery.ts














const NODE_PARAM_IS_EMPTY = "Node parameter is empty";
const PARAM_IS_EMPTY = "Parameter is empty: ";
class tree_jquery_JqTreeWidget extends mouse_widget {
    constructor() {
        super(...arguments);
        this.handleClick = (e) => {
            const clickTarget = this.getClickTarget(e.target);
            if (clickTarget) {
                if (clickTarget.type === "button") {
                    this.toggle(clickTarget.node, this.options.slide);
                    e.preventDefault();
                    e.stopPropagation();
                }
                else if (clickTarget.type === "label") {
                    const node = clickTarget.node;
                    const event = this._triggerEvent("tree.click", {
                        node,
                        click_event: e,
                    });
                    if (!event.isDefaultPrevented()) {
                        this.doSelectNode(node);
                    }
                }
            }
        };
        this.handleDblclick = (e) => {
            const clickTarget = this.getClickTarget(e.target);
            if ((clickTarget === null || clickTarget === void 0 ? void 0 : clickTarget.type) === "label") {
                this._triggerEvent("tree.dblclick", {
                    node: clickTarget.node,
                    click_event: e,
                });
            }
        };
        this.handleContextmenu = (e) => {
            const $div = external_jQuery_(e.target).closest("ul.jqtree-tree .jqtree-element");
            if ($div.length) {
                const node = this.getNode($div);
                if (node) {
                    e.preventDefault();
                    e.stopPropagation();
                    this._triggerEvent("tree.contextmenu", {
                        node,
                        click_event: e,
                    });
                    return false;
                }
            }
            return null;
        };
    }
    toggle(node, slideParam = null) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        const slide = slideParam !== null && slideParam !== void 0 ? slideParam : this.options.slide;
        if (node.is_open) {
            this.closeNode(node, slide);
        }
        else {
            this.openNode(node, slide);
        }
        return this.element;
    }
    getTree() {
        return this.tree;
    }
    selectNode(node, optionsParam) {
        this.doSelectNode(node, optionsParam);
        return this.element;
    }
    getSelectedNode() {
        return this.selectNodeHandler.getSelectedNode();
    }
    toJson() {
        return JSON.stringify(this.tree.getData());
    }
    loadData(data, parentNode) {
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
    loadDataFromUrl(param1, param2, param3) {
        if (typeof param1 === "string") {
            // first parameter is url
            this.doLoadDataFromUrl(param1, param2, param3 !== null && param3 !== void 0 ? param3 : null);
        }
        else {
            // first parameter is not url
            this.doLoadDataFromUrl(null, param1, param2);
        }
        return this.element;
    }
    reload(onFinished) {
        this.doLoadDataFromUrl(null, null, onFinished);
        return this.element;
    }
    getNodeById(nodeId) {
        return this.tree.getNodeById(nodeId);
    }
    getNodeByName(name) {
        return this.tree.getNodeByName(name);
    }
    getNodeByNameMustExist(name) {
        return this.tree.getNodeByNameMustExist(name);
    }
    getNodesByProperty(key, value) {
        return this.tree.getNodesByProperty(key, value);
    }
    getNodeByHtmlElement(element) {
        return this.getNode(external_jQuery_(element));
    }
    getNodeByCallback(callback) {
        return this.tree.getNodeByCallback(callback);
    }
    openNode(node, param1, param2) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        const parseParams = () => {
            var _a;
            let onFinished;
            let slide;
            if (isFunction(param1)) {
                onFinished = param1;
                slide = null;
            }
            else {
                slide = param1;
                onFinished = param2;
            }
            if (slide == null) {
                slide = (_a = this.options.slide) !== null && _a !== void 0 ? _a : false;
            }
            return [slide, onFinished];
        };
        const [slide, onFinished] = parseParams();
        this._openNode(node, slide, onFinished);
        return this.element;
    }
    closeNode(node, slideParam) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        const slide = slideParam !== null && slideParam !== void 0 ? slideParam : this.options.slide;
        if (node.isFolder() || node.isEmptyFolder) {
            new nodeElement_FolderElement(node, this).close(slide, this.options.animationSpeed);
            this.saveState();
        }
        return this.element;
    }
    isDragging() {
        return this.dndHandler.isDragging;
    }
    refreshHitAreas() {
        this.dndHandler.refresh();
        return this.element;
    }
    addNodeAfter(newNodeInfo, existingNode) {
        const newNode = existingNode.addAfter(newNodeInfo);
        if (newNode) {
            this._refreshElements(existingNode.parent);
        }
        return newNode;
    }
    addNodeBefore(newNodeInfo, existingNode) {
        if (!existingNode) {
            throw Error(PARAM_IS_EMPTY + "existingNode");
        }
        const newNode = existingNode.addBefore(newNodeInfo);
        if (newNode) {
            this._refreshElements(existingNode.parent);
        }
        return newNode;
    }
    addParentNode(newNodeInfo, existingNode) {
        if (!existingNode) {
            throw Error(PARAM_IS_EMPTY + "existingNode");
        }
        const newNode = existingNode.addParent(newNodeInfo);
        if (newNode) {
            this._refreshElements(newNode.parent);
        }
        return newNode;
    }
    removeNode(node) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        if (!node.parent) {
            throw Error("Node has no parent");
        }
        this.selectNodeHandler.removeFromSelection(node, true); // including children
        const parent = node.parent;
        node.remove();
        this._refreshElements(parent);
        return this.element;
    }
    appendNode(newNodeInfo, parentNodeParam) {
        const parentNode = parentNodeParam || this.tree;
        const node = parentNode.append(newNodeInfo);
        this._refreshElements(parentNode);
        return node;
    }
    prependNode(newNodeInfo, parentNodeParam) {
        const parentNode = parentNodeParam !== null && parentNodeParam !== void 0 ? parentNodeParam : this.tree;
        const node = parentNode.prepend(newNodeInfo);
        this._refreshElements(parentNode);
        return node;
    }
    updateNode(node, data) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        const idIsChanged = typeof data === "object" && data.id && data.id !== node.id;
        if (idIsChanged) {
            this.tree.removeNodeFromIndex(node);
        }
        node.setData(data);
        if (idIsChanged) {
            this.tree.addNodeToIndex(node);
        }
        if (typeof data === "object" &&
            data["children"] &&
            data["children"] instanceof Array) {
            node.removeChildren();
            if (data.children.length) {
                node.loadFromData(data.children);
            }
        }
        this._refreshElements(node);
        this.selectCurrentNode();
        return this.element;
    }
    moveNode(node, targetNode, position) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        if (!targetNode) {
            throw Error(PARAM_IS_EMPTY + "targetNode");
        }
        const positionIndex = getPosition(position);
        if (positionIndex !== undefined) {
            this.tree.moveNode(node, targetNode, positionIndex);
            this._refreshElements(null);
        }
        return this.element;
    }
    getStateFromStorage() {
        return this.saveStateHandler.getStateFromStorage();
    }
    addToSelection(node, mustSetFocus) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        this.selectNodeHandler.addToSelection(node);
        this._getNodeElementForNode(node).select(mustSetFocus === undefined ? true : mustSetFocus);
        this.saveState();
        return this.element;
    }
    getSelectedNodes() {
        return this.selectNodeHandler.getSelectedNodes();
    }
    isNodeSelected(node) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        return this.selectNodeHandler.isNodeSelected(node);
    }
    removeFromSelection(node) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        this.selectNodeHandler.removeFromSelection(node);
        this._getNodeElementForNode(node).deselect();
        this.saveState();
        return this.element;
    }
    scrollToNode(node) {
        if (!node) {
            throw Error(NODE_PARAM_IS_EMPTY);
        }
        const nodeOffset = external_jQuery_(node.element).offset();
        const nodeTop = nodeOffset ? nodeOffset.top : 0;
        const treeOffset = this.$el.offset();
        const treeTop = treeOffset ? treeOffset.top : 0;
        const top = nodeTop - treeTop;
        this.scrollHandler.scrollToY(top);
        return this.element;
    }
    getState() {
        return this.saveStateHandler.getState();
    }
    setState(state) {
        this.saveStateHandler.setInitialState(state);
        this._refreshElements(null);
        return this.element;
    }
    setOption(option, value) {
        this.options[option] = value;
        return this.element;
    }
    moveDown() {
        const selectedNode = this.getSelectedNode();
        if (selectedNode) {
            this.keyHandler.moveDown(selectedNode);
        }
        return this.element;
    }
    moveUp() {
        const selectedNode = this.getSelectedNode();
        if (selectedNode) {
            this.keyHandler.moveUp(selectedNode);
        }
        return this.element;
    }
    getVersion() {
        return src_version;
    }
    _triggerEvent(eventName, values) {
        const event = external_jQuery_["Event"](eventName, values);
        this.element.trigger(event);
        return event;
    }
    _openNode(node, slide = true, onFinished) {
        const doOpenNode = (_node, _slide, _onFinished) => {
            const folderElement = new nodeElement_FolderElement(_node, this);
            folderElement.open(_onFinished, _slide, this.options.animationSpeed);
        };
        if (node.isFolder() || node.isEmptyFolder) {
            if (node.load_on_demand) {
                this.loadFolderOnDemand(node, slide, onFinished);
            }
            else {
                let parent = node.parent;
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
    _refreshElements(fromNode) {
        this.renderer.render(fromNode);
        this._triggerEvent("tree.refresh");
    }
    _getNodeElementForNode(node) {
        if (node.isFolder()) {
            return new nodeElement_FolderElement(node, this);
        }
        else {
            return new nodeElement_NodeElement(node, this);
        }
    }
    _getNodeElement($element) {
        const node = this.getNode($element);
        if (node) {
            return this._getNodeElementForNode(node);
        }
        else {
            return null;
        }
    }
    _containsElement(element) {
        const node = this.getNode(external_jQuery_(element));
        return node != null && node.tree === this.tree;
    }
    _getScrollLeft() {
        return this.scrollHandler.getScrollLeft();
    }
    init() {
        super.init();
        this.element = this.$el;
        this.mouseDelay = 300;
        this.isInitialized = false;
        this.options.rtl = this.getRtlOption();
        if (this.options.closedIcon == null) {
            this.options.closedIcon = this.getDefaultClosedIcon();
        }
        this.renderer = new elementsRenderer_ElementsRenderer(this);
        this.dataLoader = new DataLoader(this);
        this.saveStateHandler = new saveStateHandler_SaveStateHandler(this);
        this.selectNodeHandler = new SelectNodeHandler(this);
        this.dndHandler = new dragAndDropHandler_DragAndDropHandler(this);
        this.scrollHandler = new ScrollHandler(this);
        this.keyHandler = new KeyHandler(this);
        this.initData();
        this.element.on("click", this.handleClick);
        this.element.on("dblclick", this.handleDblclick);
        if (this.options.useContextMenu) {
            this.element.on("contextmenu", this.handleContextmenu);
        }
    }
    deinit() {
        this.element.empty();
        this.element.off();
        this.keyHandler.deinit();
        this.tree = new Node({}, true);
        super.deinit();
    }
    mouseCapture(positionInfo) {
        if (this.options.dragAndDrop) {
            return this.dndHandler.mouseCapture(positionInfo);
        }
        else {
            return false;
        }
    }
    mouseStart(positionInfo) {
        if (this.options.dragAndDrop) {
            return this.dndHandler.mouseStart(positionInfo);
        }
        else {
            return false;
        }
    }
    mouseDrag(positionInfo) {
        if (this.options.dragAndDrop) {
            const result = this.dndHandler.mouseDrag(positionInfo);
            this.scrollHandler.checkScrolling();
            return result;
        }
        else {
            return false;
        }
    }
    mouseStop(positionInfo) {
        if (this.options.dragAndDrop) {
            return this.dndHandler.mouseStop(positionInfo);
        }
        else {
            return false;
        }
    }
    initData() {
        if (this.options.data) {
            this.doLoadData(this.options.data, null);
        }
        else {
            const dataUrl = this.getDataUrlInfo(null);
            if (dataUrl) {
                this.doLoadDataFromUrl(null, null, null);
            }
            else {
                this.doLoadData([], null);
            }
        }
    }
    getDataUrlInfo(node) {
        const dataUrl = this.options.dataUrl || this.element.data("url");
        const getUrlFromString = (url) => {
            const urlInfo = { url };
            setUrlInfoData(urlInfo);
            return urlInfo;
        };
        const setUrlInfoData = (urlInfo) => {
            if (node === null || node === void 0 ? void 0 : node.id) {
                // Load on demand of a subtree; add node parameter
                const data = { node: node.id };
                urlInfo["data"] = data;
            }
            else {
                // Add selected_node parameter
                const selectedNodeId = this.getNodeIdToBeSelected();
                if (selectedNodeId) {
                    const data = { selected_node: selectedNodeId };
                    urlInfo["data"] = data;
                }
            }
        };
        if (typeof dataUrl === "function") {
            return dataUrl(node);
        }
        else if (typeof dataUrl === "string") {
            return getUrlFromString(dataUrl);
        }
        else if (dataUrl && typeof dataUrl === "object") {
            setUrlInfoData(dataUrl);
            return dataUrl;
        }
        else {
            return null;
        }
    }
    getNodeIdToBeSelected() {
        if (this.options.saveState) {
            return this.saveStateHandler.getNodeIdToBeSelected();
        }
        else {
            return null;
        }
    }
    initTree(data) {
        const doInit = () => {
            if (!this.isInitialized) {
                this.isInitialized = true;
                this._triggerEvent("tree.init");
            }
        };
        if (!this.options.nodeClass) {
            return;
        }
        this.tree = new this.options.nodeClass(null, true, this.options.nodeClass);
        this.selectNodeHandler.clear();
        this.tree.loadFromData(data);
        const mustLoadOnDemand = this.setInitialState();
        this._refreshElements(null);
        if (!mustLoadOnDemand) {
            doInit();
        }
        else {
            // Load data on demand and then init the tree
            this.setInitialStateOnDemand(doInit);
        }
    }
    // Set initial state, either by restoring the state or auto-opening nodes
    // result: must load nodes on demand?
    setInitialState() {
        const restoreState = () => {
            // result: is state restored, must load on demand?
            if (!this.options.saveState) {
                return [false, false];
            }
            else {
                const state = this.saveStateHandler.getStateFromStorage();
                if (!state) {
                    return [false, false];
                }
                else {
                    const mustLoadOnDemand = this.saveStateHandler.setInitialState(state);
                    // return true: the state is restored
                    return [true, mustLoadOnDemand];
                }
            }
        };
        const autoOpenNodes = () => {
            // result: must load on demand?
            if (this.options.autoOpen === false) {
                return false;
            }
            const maxLevel = this.getAutoOpenMaxLevel();
            let mustLoadOnDemand = false;
            this.tree.iterate((node, level) => {
                if (node.load_on_demand) {
                    mustLoadOnDemand = true;
                    return false;
                }
                else if (!node.hasChildren()) {
                    return false;
                }
                else {
                    node.is_open = true;
                    return level !== maxLevel;
                }
            });
            return mustLoadOnDemand;
        };
        let [isRestored, mustLoadOnDemand] = restoreState(); // eslint-disable-line prefer-const
        if (!isRestored) {
            mustLoadOnDemand = autoOpenNodes();
        }
        return mustLoadOnDemand;
    }
    // Set the initial state for nodes that are loaded on demand
    // Call cb_finished when done
    setInitialStateOnDemand(cbFinished) {
        const restoreState = () => {
            if (!this.options.saveState) {
                return false;
            }
            else {
                const state = this.saveStateHandler.getStateFromStorage();
                if (!state) {
                    return false;
                }
                else {
                    this.saveStateHandler.setInitialStateOnDemand(state, cbFinished);
                    return true;
                }
            }
        };
        const autoOpenNodes = () => {
            const maxLevel = this.getAutoOpenMaxLevel();
            let loadingCount = 0;
            const loadAndOpenNode = (node) => {
                loadingCount += 1;
                this._openNode(node, false, () => {
                    loadingCount -= 1;
                    openNodes();
                });
            };
            const openNodes = () => {
                this.tree.iterate((node, level) => {
                    if (node.load_on_demand) {
                        if (!node.is_loading) {
                            loadAndOpenNode(node);
                        }
                        return false;
                    }
                    else {
                        this._openNode(node, false, null);
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
    getAutoOpenMaxLevel() {
        if (this.options.autoOpen === true) {
            return -1;
        }
        else if (typeof this.options.autoOpen === "number") {
            return this.options.autoOpen;
        }
        else if (typeof this.options.autoOpen === "string") {
            return parseInt(this.options.autoOpen, 10);
        }
        else {
            return 0;
        }
    }
    getClickTarget(element) {
        const $target = external_jQuery_(element);
        const $button = $target.closest(".jqtree-toggler");
        if ($button.length) {
            const node = this.getNode($button);
            if (node) {
                return {
                    type: "button",
                    node,
                };
            }
        }
        else {
            const $el = $target.closest(".jqtree-element");
            if ($el.length) {
                const node = this.getNode($el);
                if (node) {
                    return {
                        type: "label",
                        node,
                    };
                }
            }
        }
        return null;
    }
    getNode($element) {
        const $li = $element.closest("li.jqtree_common");
        if ($li.length === 0) {
            return null;
        }
        else {
            return $li.data("node");
        }
    }
    saveState() {
        if (this.options.saveState) {
            this.saveStateHandler.saveState();
        }
    }
    selectCurrentNode() {
        const node = this.getSelectedNode();
        if (node) {
            const nodeElement = this._getNodeElementForNode(node);
            if (nodeElement) {
                nodeElement.select(true);
            }
        }
    }
    deselectCurrentNode() {
        const node = this.getSelectedNode();
        if (node) {
            this.removeFromSelection(node);
        }
    }
    getDefaultClosedIcon() {
        if (this.options.rtl) {
            // triangle to the left
            return "&#x25c0;";
        }
        else {
            // triangle to the right
            return "&#x25ba;";
        }
    }
    getRtlOption() {
        if (this.options.rtl != null) {
            return this.options.rtl;
        }
        else {
            const dataRtl = this.element.data("rtl");
            if (dataRtl !== null &&
                dataRtl !== false &&
                dataRtl !== undefined) {
                return true;
            }
            else {
                return false;
            }
        }
    }
    doSelectNode(node, optionsParam) {
        const saveState = () => {
            if (this.options.saveState) {
                this.saveStateHandler.saveState();
            }
        };
        if (!node) {
            // Called with empty node -> deselect current node
            this.deselectCurrentNode();
            saveState();
            return;
        }
        const defaultOptions = { mustSetFocus: true, mustToggle: true };
        const selectOptions = Object.assign(Object.assign({}, defaultOptions), (optionsParam || {}));
        const canSelect = () => {
            if (this.options.onCanSelectNode) {
                return (this.options.selectable === true &&
                    this.options.onCanSelectNode(node));
            }
            else {
                return this.options.selectable === true;
            }
        };
        const openParents = () => {
            const parent = node.parent;
            if (parent && parent.parent && !parent.is_open) {
                this.openNode(parent, false);
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
                    previous_node: node,
                });
            }
        }
        else {
            const deselectedNode = this.getSelectedNode() || null;
            this.deselectCurrentNode();
            this.addToSelection(node, selectOptions.mustSetFocus);
            this._triggerEvent("tree.select", {
                node,
                deselected_node: deselectedNode,
            });
            openParents();
        }
        saveState();
    }
    doLoadData(data, parentNode) {
        if (!data) {
            return;
        }
        else {
            this._triggerEvent("tree.load_data", { tree_data: data });
            if (parentNode) {
                this.deselectNodes(parentNode);
                this.loadSubtree(data, parentNode);
            }
            else {
                this.initTree(data);
            }
            if (this.isDragging()) {
                this.dndHandler.refresh();
            }
        }
    }
    deselectNodes(parentNode) {
        const selectedNodesUnderParent = this.selectNodeHandler.getSelectedNodesUnder(parentNode);
        for (const n of selectedNodesUnderParent) {
            this.selectNodeHandler.removeFromSelection(n);
        }
    }
    loadSubtree(data, parentNode) {
        parentNode.loadFromData(data);
        parentNode.load_on_demand = false;
        parentNode.is_loading = false;
        this._refreshElements(parentNode);
    }
    doLoadDataFromUrl(urlInfoParam, parentNode, onFinished) {
        const urlInfo = urlInfoParam || this.getDataUrlInfo(parentNode);
        this.dataLoader.loadFromUrl(urlInfo, parentNode, onFinished);
    }
    loadFolderOnDemand(node, slide = true, onFinished) {
        node.is_loading = true;
        this.doLoadDataFromUrl(null, node, () => {
            this._openNode(node, slide, onFinished);
        });
    }
}
tree_jquery_JqTreeWidget.defaults = {
    animationSpeed: "fast",
    autoOpen: false,
    saveState: false,
    dragAndDrop: false,
    selectable: true,
    useContextMenu: true,
    onCanSelectNode: undefined,
    onSetStateFromStorage: undefined,
    onGetStateFromStorage: undefined,
    onCreateLi: undefined,
    onIsMoveHandle: undefined,
    // Can this node be moved?
    onCanMove: undefined,
    // Can this node be moved to this position? function(moved_node, target_node, position)
    onCanMoveTo: undefined,
    onLoadFailed: undefined,
    autoEscape: true,
    dataUrl: undefined,
    // The symbol to use for a closed node - ► BLACK RIGHT-POINTING POINTER
    // http://www.fileformat.info/info/unicode/char/25ba/index.htm
    closedIcon: undefined,
    // The symbol to use for an open node - ▼ BLACK DOWN-POINTING TRIANGLE
    // http://www.fileformat.info/info/unicode/char/25bc/index.htm
    openedIcon: "&#x25bc;",
    slide: true,
    nodeClass: Node,
    dataFilter: undefined,
    keyboardSupport: true,
    openFolderDelay: 500,
    rtl: undefined,
    onDragMove: undefined,
    onDragStop: undefined,
    buttonLeft: true,
    onLoading: undefined,
    showEmptyFolder: false,
    tabIndex: 0,
};
SimpleWidget.register(tree_jquery_JqTreeWidget, "tree");


/***/ })
/******/ ]);
//# sourceMappingURL=tree.jquery.js.map