/*
JqTree 1.9.0

Copyright 2026 Marco Braak

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
@license

*/
var jqtree = (function (exports) {
    'use strict';

    class DataLoader {
      _dataFilter;
      _loadData;
      _onLoadFailed;
      _onLoading;
      _treeElement;
      _triggerEvent;
      constructor({
        dataFilter,
        loadData,
        onLoadFailed,
        onLoading,
        treeElement,
        triggerEvent
      }) {
        this._dataFilter = dataFilter;
        this._loadData = loadData;
        this._onLoadFailed = onLoadFailed;
        this._onLoading = onLoading;
        this._treeElement = treeElement;
        this._triggerEvent = triggerEvent;
      }
      loadFromUrl(urlInfo, parentNode, onFinished) {
        if (!urlInfo) {
          return;
        }
        const element = this._getDomElement(parentNode);
        this._addLoadingClass(element);
        this._notifyLoading(true, parentNode, element);
        const stopLoading = () => {
          this._removeLoadingClass(element);
          this._notifyLoading(false, parentNode, element);
        };
        const handleSuccess = data => {
          stopLoading();
          this._loadData(this._parseData(data), parentNode);
          if (onFinished && typeof onFinished === "function") {
            onFinished();
          }
        };
        const handleError = jqXHR => {
          stopLoading();
          if (this._onLoadFailed) {
            this._onLoadFailed(jqXHR);
          }
        };
        this._submitRequest(urlInfo, handleSuccess, handleError);
      }
      _addLoadingClass(element) {
        element.classList.add("jqtree-loading");
      }
      _getDomElement(parentNode) {
        if (parentNode?.element) {
          return parentNode.element;
        } else {
          return this._treeElement;
        }
      }
      _notifyLoading(isLoading, node, element) {
        const $el = jQuery(element);
        if (this._onLoading) {
          this._onLoading(isLoading, node, $el);
        }
        this._triggerEvent("tree.loading_data", {
          $el,
          isLoading,
          node
        });
      }
      _parseData(data) {
        if (this._dataFilter) {
          return this._dataFilter(data);
        } else {
          return data;
        }
      }
      _removeLoadingClass(element) {
        element.classList.remove("jqtree-loading");
      }
      _submitRequest(urlInfoInput, handleSuccess, handleError) {
        const urlInfo = typeof urlInfoInput === "string" ? {
          url: urlInfoInput
        } : urlInfoInput;
        const ajaxSettings = {
          cache: false,
          dataType: "json",
          error: handleError,
          method: "GET",
          success: handleSuccess,
          ...urlInfo
        };
        ajaxSettings.method = ajaxSettings.method?.toUpperCase() ?? "GET";
        void jQuery.ajax(ajaxSettings);
      }
    }

    // Get the top position of the HTML element.
    const getOffsetTop = element => getElementPosition(element).top;

    // Get the top left position of the HTML element.
    const getElementPosition = element => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.x + window.scrollX,
        top: rect.y + window.scrollY
      };
    };

    function binarySearch(items, compareFn) {
      let low = 0;
      let high = items.length;
      while (low < high) {
        const mid = low + high >> 1;
        const item = items[mid];
        if (item === undefined) {
          return null;
        }
        const compareResult = compareFn(item);
        if (compareResult > 0) {
          high = mid;
        } else if (compareResult < 0) {
          low = mid + 1;
        } else {
          return item;
        }
      }
      return null;
    }

    class DragElement {
      _element;
      _offsetX;
      _offsetY;
      constructor({
        autoEscape,
        nodeName,
        offsetX,
        offsetY,
        treeElement
      }) {
        this._offsetX = offsetX;
        this._offsetY = offsetY;
        this._element = this._createElement(nodeName, autoEscape);
        treeElement.appendChild(this._element);
      }
      move(pageX, pageY) {
        this._element.style.left = `${pageX - this._offsetX}px`;
        this._element.style.top = `${pageY - this._offsetY}px`;
      }
      remove() {
        this._element.remove();
      }
      _createElement(nodeName, autoEscape) {
        const element = document.createElement("span");
        element.classList.add("jqtree-title", "jqtree-dragging");
        if (autoEscape) {
          element.textContent = nodeName;
        } else {
          element.innerHTML = nodeName;
        }
        element.style.position = "absolute";
        return element;
      }
    }

    const iterateVisibleNodes = (tree, {
      handleAfterOpenFolder,
      handleClosedFolder,
      handleFirstNode,
      handleNode,
      handleOpenFolder
    }) => {
      let isFirstNode = true;
      const iterate = (node, nextNode) => {
        let mustIterateInside = (node.is_open || !node.element) && node.hasChildren();
        let element = null;

        // Is the element visible?
        if (node.element?.offsetParent) {
          element = node.element;
          if (isFirstNode) {
            handleFirstNode(node);
            isFirstNode = false;
          }
          if (!node.hasChildren()) {
            handleNode(node, nextNode, node.element);
          } else if (node.is_open) {
            if (!handleOpenFolder(node, node.element)) {
              mustIterateInside = false;
            }
          } else {
            handleClosedFolder(node, nextNode, element);
          }
        }
        if (mustIterateInside) {
          const childrenLength = node.children.length;
          node.children.forEach((_, i) => {
            const child = node.children[i];
            if (child) {
              if (i === childrenLength - 1) {
                iterate(child, null);
              } else {
                const nextChild = node.children[i + 1];
                if (nextChild) {
                  iterate(child, nextChild);
                }
              }
            }
          });
          if (node.is_open && element) {
            handleAfterOpenFolder(node, nextNode);
          }
        }
      };
      iterate(tree, null);
    };

    const generateHitPositions = (tree, currentNode) => {
      const hitPositions = [];
      let lastTop = 0;
      const addHitPosition = (node, position, top) => {
        hitPositions.push({
          node,
          position,
          top
        });
        lastTop = top;
      };
      const handleAfterOpenFolder = (node, nextNode) => {
        if (node === currentNode || nextNode === currentNode) {
          // Cannot move before or after current item
          addHitPosition(node, null, lastTop);
        } else {
          addHitPosition(node, "after", lastTop);
        }
      };
      const handleClosedFolder = (node, nextNode, element) => {
        const top = getOffsetTop(element);
        if (node === currentNode) {
          // Cannot move after current item
          addHitPosition(node, null, top);
        } else {
          addHitPosition(node, "inside", top);

          // Cannot move before current item
          if (nextNode !== currentNode) {
            addHitPosition(node, "after", top);
          }
        }
      };
      const handleFirstNode = node => {
        if (node !== currentNode && node.element) {
          addHitPosition(node, "before", getOffsetTop(node.element));
        }
      };
      const handleNode = (node, nextNode, element) => {
        const top = getOffsetTop(element);
        if (node === currentNode) {
          // Cannot move inside current item
          addHitPosition(node, null, top);
        } else {
          addHitPosition(node, "inside", top);
        }
        if (nextNode === currentNode || node === currentNode) {
          // Cannot move before or after current item
          addHitPosition(node, null, top);
        } else {
          addHitPosition(node, "after", top);
        }
      };
      const handleOpenFolder = (node, element) => {
        if (node === currentNode) {
          // Cannot move inside current item

          // Dnd over the current element is not possible: add a position with type None for the top and the bottom.
          const top = getOffsetTop(element);
          const height = element.clientHeight;
          addHitPosition(node, null, top);
          if (height > 5) {
            // Subtract 5 pixels to allow more space for the next element.
            addHitPosition(node, null, top + height - 5);
          }

          // Stop iterating
          return false;
        }

        // Cannot move before current item
        if (node.children[0] !== currentNode) {
          addHitPosition(node, "inside", getOffsetTop(element));
        }

        // Continue iterating
        return true;
      };
      iterateVisibleNodes(tree, {
        handleAfterOpenFolder,
        handleClosedFolder,
        handleFirstNode,
        handleNode,
        handleOpenFolder
      });
      return hitPositions;
    };
    const generateHitAreasForGroup = (hitAreas, positionsInGroup, top, bottom) => {
      // limit positions in group
      const positionCount = Math.min(positionsInGroup.length, 4);
      const areaHeight = Math.round((bottom - top) / positionCount);
      let areaTop = top;
      for (let i = 0; i < positionCount; i++) {
        const position = positionsInGroup[i];
        if (position.position) {
          hitAreas.push({
            bottom: areaTop + areaHeight,
            node: position.node,
            position: position.position,
            top: areaTop
          });
        }
        areaTop += areaHeight;
      }
    };
    const generateHitAreasFromPositions = (hitPositions, treeBottom) => {
      if (!hitPositions.length) {
        return [];
      }
      let previousTop = hitPositions[0].top;
      let group = [];
      const hitAreas = [];
      for (const position of hitPositions) {
        if (position.top !== previousTop && group.length) {
          generateHitAreasForGroup(hitAreas, group, previousTop, position.top);
          previousTop = position.top;
          group = [];
        }
        group.push(position);
      }
      generateHitAreasForGroup(hitAreas, group, previousTop, treeBottom);
      return hitAreas;
    };
    const generateHitAreas = (tree, currentNode, treeBottom) => generateHitAreasFromPositions(generateHitPositions(tree, currentNode), treeBottom);

    class DragAndDropHandler {
      currentItem;
      hitAreas;
      hoveredArea;
      isDragging;
      _autoEscape;
      _dragElement;
      _getNodeElement;
      _getNodeElementForNode;
      _getScrollLeft;
      _getTree;
      _onCanMove;
      _onCanMoveTo;
      _onDragMove;
      _onDragStop;
      _onIsMoveHandle;
      _openFolderDelay;
      _openFolderTimer;
      _openNode;
      _previousGhost;
      _refreshElements;
      _slide;
      _treeElement;
      _triggerEvent;
      constructor({
        autoEscape,
        getNodeElement,
        getNodeElementForNode,
        getScrollLeft,
        getTree,
        onCanMove,
        onCanMoveTo,
        onDragMove,
        onDragStop,
        onIsMoveHandle,
        openFolderDelay,
        openNode,
        refreshElements,
        slide,
        treeElement,
        triggerEvent
      }) {
        this._autoEscape = autoEscape;
        this._getNodeElement = getNodeElement;
        this._getNodeElementForNode = getNodeElementForNode;
        this._getScrollLeft = getScrollLeft;
        this._getTree = getTree;
        this._onCanMove = onCanMove;
        this._onCanMoveTo = onCanMoveTo;
        this._onDragMove = onDragMove;
        this._onDragStop = onDragStop;
        this._onIsMoveHandle = onIsMoveHandle;
        this._openFolderDelay = openFolderDelay;
        this._openNode = openNode;
        this._refreshElements = refreshElements;
        this._slide = slide;
        this._treeElement = treeElement;
        this._triggerEvent = triggerEvent;
        this.hoveredArea = null;
        this.hitAreas = [];
        this.isDragging = false;
        this.currentItem = null;
      }
      mouseCapture(positionInfo) {
        const element = positionInfo.target;
        if (!this._mustCaptureElement(element)) {
          return null;
        }
        if (this._onIsMoveHandle && !this._onIsMoveHandle(jQuery(element))) {
          return null;
        }
        let nodeElement = this._getNodeElement(element);
        if (nodeElement && this._onCanMove) {
          if (!this._onCanMove(nodeElement.node)) {
            nodeElement = null;
          }
        }
        this.currentItem = nodeElement;
        return this.currentItem != null;
      }
      mouseDrag(positionInfo) {
        if (!this.currentItem || !this._dragElement) {
          return false;
        }
        this._dragElement.move(positionInfo.pageX, positionInfo.pageY);
        const area = this._findHoveredArea(positionInfo.pageX, positionInfo.pageY);
        if (area && this._canMoveToArea(area, this.currentItem)) {
          if (!area.node.isFolder()) {
            this._stopOpenFolderTimer();
          }
          if (this.hoveredArea !== area) {
            this.hoveredArea = area;

            // If this is a closed folder, start timer to open it
            if (this._mustOpenFolderTimer(area)) {
              this._startOpenFolderTimer(area.node);
            } else {
              this._stopOpenFolderTimer();
            }
            this._updateDropHint();
          }
        } else {
          this._removeDropHint();
          this._stopOpenFolderTimer();
          this.hoveredArea = area;
        }
        if (!area) {
          if (this._onDragMove) {
            this._onDragMove(this.currentItem.node, positionInfo.originalEvent);
          }
        }
        return true;
      }
      mouseStart(positionInfo) {
        if (!this.currentItem) {
          return false;
        }
        this.refresh();
        const {
          left,
          top
        } = getElementPosition(positionInfo.target);
        const node = this.currentItem.node;
        this._dragElement = new DragElement({
          autoEscape: this._autoEscape ?? true,
          nodeName: node.name,
          offsetX: positionInfo.pageX - left,
          offsetY: positionInfo.pageY - top,
          treeElement: this._treeElement
        });
        this.isDragging = true;
        this.currentItem.element.classList.add("jqtree-moving");
        return true;
      }
      mouseStop(positionInfo) {
        this._moveItem(positionInfo);
        this._clear();
        this._removeHover();
        this._removeDropHint();
        this._removeHitAreas();
        const currentItem = this.currentItem;
        if (this.currentItem) {
          this.currentItem.element.classList.remove("jqtree-moving");
          this.currentItem = null;
        }
        this.isDragging = false;
        if (!this.hoveredArea && currentItem) {
          if (this._onDragStop) {
            this._onDragStop(currentItem.node, positionInfo.originalEvent);
          }
        }
        return false;
      }
      refresh() {
        this._removeHitAreas();
        if (this.currentItem) {
          const currentNode = this.currentItem.node;
          this._generateHitAreas(currentNode);
          this.currentItem = this._getNodeElementForNode(currentNode);
          if (this.isDragging) {
            this.currentItem.element.classList.add("jqtree-moving");
          }
        }
      }
      _canMoveToArea(area, currentItem) {
        if (!this._onCanMoveTo) {
          return true;
        }
        return this._onCanMoveTo(currentItem.node, area.node, area.position);
      }
      _clear() {
        if (this._dragElement) {
          this._dragElement.remove();
          this._dragElement = null;
        }
      }
      _findHoveredArea(x, y) {
        const dimensions = this._getTreeDimensions();
        if (x < dimensions.left || y < dimensions.top || x > dimensions.right || y > dimensions.bottom) {
          return null;
        }
        return binarySearch(this.hitAreas, area => {
          if (y < area.top) {
            return 1;
          } else if (y > area.bottom) {
            return -1;
          } else {
            return 0;
          }
        });
      }
      _generateHitAreas(currentNode) {
        const tree = this._getTree();
        if (!tree) {
          this.hitAreas = [];
        } else {
          this.hitAreas = generateHitAreas(tree, currentNode, this._getTreeDimensions().bottom);
        }
      }
      _getTreeDimensions() {
        // Return the dimensions of the tree. Add a margin to the bottom to allow
        // to drag-and-drop after the last element.
        const treePosition = getElementPosition(this._treeElement);
        const left = treePosition.left + this._getScrollLeft();
        const top = treePosition.top;
        return {
          bottom: top + this._treeElement.clientHeight + 16,
          left,
          right: left + this._treeElement.clientWidth,
          top
        };
      }

      /* Move the dragged node to the selected position in the tree. */
      _moveItem(positionInfo) {
        if (this.currentItem && this.hoveredArea?.position && this._canMoveToArea(this.hoveredArea, this.currentItem)) {
          const movedNode = this.currentItem.node;
          const targetNode = this.hoveredArea.node;
          const position = this.hoveredArea.position;
          const previousParent = movedNode.parent;
          if (position === "inside") {
            this.hoveredArea.node.is_open = true;
          }
          const doMove = () => {
            const tree = this._getTree();
            if (tree) {
              tree.moveNode(movedNode, targetNode, position);
              this._treeElement.textContent = "";
              this._refreshElements(null);
            }
          };
          if (this._triggerEvent("tree.move", {
            move_info: {
              do_move: doMove,
              moved_node: movedNode,
              original_event: positionInfo.originalEvent,
              position,
              previous_parent: previousParent,
              target_node: targetNode
            }
          })) {
            doMove();
          }
        }
      }
      _mustCaptureElement(element) {
        const nodeName = element.nodeName;
        return nodeName !== "INPUT" && nodeName !== "SELECT" && nodeName !== "TEXTAREA";
      }
      _mustOpenFolderTimer(area) {
        const node = area.node;
        return node.isFolder() && !node.is_open && area.position === "inside";
      }
      _removeDropHint() {
        if (this._previousGhost) {
          this._previousGhost.remove();
        }
      }
      _removeHitAreas() {
        this.hitAreas = [];
      }
      _removeHover() {
        this.hoveredArea = null;
      }
      _startOpenFolderTimer(folder) {
        const openFolder = () => {
          this._openNode(folder, this._slide, () => {
            this.refresh();
            this._updateDropHint();
          });
        };
        this._stopOpenFolderTimer();
        const openFolderDelay = this._openFolderDelay;
        if (openFolderDelay !== false) {
          this._openFolderTimer = window.setTimeout(openFolder, openFolderDelay);
        }
      }
      _stopOpenFolderTimer() {
        if (this._openFolderTimer) {
          clearTimeout(this._openFolderTimer);
          this._openFolderTimer = null;
        }
      }
      _updateDropHint() {
        if (!this.hoveredArea) {
          return;
        }

        // remove previous drop hint
        this._removeDropHint();

        // add new drop hint
        const nodeElement = this._getNodeElementForNode(this.hoveredArea.node);
        this._previousGhost = nodeElement.addDropHint(this.hoveredArea.position);
      }
    }

    const isInt = n => typeof n === "number" && n % 1 === 0;
    const getBoolString = value => value ? "true" : "false";

    class ElementsRenderer {
      closedIconElement;
      openedIconElement;
      _autoEscape;
      _buttonLeft;
      _dragAndDrop;
      _getTree;
      _htmlElement;
      _isNodeSelected;
      _onCreateLi;
      _rtl;
      _showEmptyFolder;
      _tabIndex;
      constructor({
        autoEscape,
        buttonLeft,
        closedIcon,
        dragAndDrop,
        getTree,
        htmlElement,
        isNodeSelected,
        onCreateLi,
        openedIcon,
        rtl,
        showEmptyFolder,
        tabIndex
      }) {
        this._autoEscape = autoEscape;
        this._buttonLeft = buttonLeft;
        this._dragAndDrop = dragAndDrop;
        this._getTree = getTree;
        this._htmlElement = htmlElement;
        this._isNodeSelected = isNodeSelected;
        this._onCreateLi = onCreateLi;
        this._rtl = rtl;
        this._showEmptyFolder = showEmptyFolder;
        this._tabIndex = tabIndex;
        this.openedIconElement = this._createButtonElement(openedIcon ?? "+");
        this.closedIconElement = this._createButtonElement(closedIcon ?? "-");
      }
      render(fromNode) {
        if (fromNode?.parent) {
          this.renderFromNode(fromNode);
        } else {
          this.renderFromRoot();
        }
      }
      renderFromNode(node) {
        if (!node.element) {
          return;
        }
        const currentLi = node.element;
        const newLi = this._createLi(node, node.getLevel());
        currentLi.replaceWith(newLi);

        // create children
        this._createDomElements(newLi, node.children, false, node.getLevel() + 1);
      }
      renderFromRoot() {
        this._htmlElement.textContent = '';
        const tree = this._getTree();
        if (tree) {
          this._createDomElements(this._htmlElement, tree.children, true, 1);
        }
      }
      _attachNodeData(node, li) {
        node.element = li;
        jQuery(li).data("node", node);
      }
      _createButtonElement(value) {
        if (typeof value === "string") {
          // convert value to html
          const div = document.createElement("div");
          div.innerHTML = value;
          return document.createTextNode(div.innerHTML);
        } else if (value.nodeType) {
          return value;
        } else {
          return jQuery(value)[0];
        }
      }
      _createDomElements(element, children, isRootNode, level) {
        const ul = this._createUl(isRootNode);
        element.appendChild(ul);
        for (const child of children) {
          const li = this._createLi(child, level);
          ul.appendChild(li);
          if (child.hasChildren()) {
            this._createDomElements(li, child.children, false, level + 1);
          }
        }
      }
      _createFolderLi(node, level, isSelected) {
        const buttonClasses = this._getButtonClasses(node);
        const folderClasses = this._getFolderClasses(node, isSelected);
        const iconElement = node.is_open ? this.openedIconElement : this.closedIconElement;

        // li
        const li = document.createElement("li");
        li.className = `jqtree_common ${folderClasses}`;
        li.setAttribute("role", "none");

        // div
        const div = document.createElement("div");
        div.className = "jqtree-element jqtree_common";
        div.setAttribute("role", "none");
        li.appendChild(div);

        // button link
        const buttonLink = document.createElement("a");
        buttonLink.className = buttonClasses;
        if (iconElement) {
          buttonLink.appendChild(iconElement.cloneNode(true));
        }
        if (this._buttonLeft) {
          div.appendChild(buttonLink);
        }

        // title span
        const titleSpan = this._createTitleSpan(node.name, isSelected, true, level);
        titleSpan.setAttribute("aria-expanded", getBoolString(node.is_open));
        div.appendChild(titleSpan);
        if (!this._buttonLeft) {
          div.appendChild(buttonLink);
        }
        return li;
      }

      /* Create the <li> element
       * Attach it to node.element.
       * Call onCreateLi
       */
      _createLi(node, level) {
        const isSelected = this._isNodeSelected(node);
        const mustShowFolder = node.isFolder() || node.isEmptyFolder && this._showEmptyFolder;
        const li = mustShowFolder ? this._createFolderLi(node, level, isSelected) : this._createNodeLi(node, level, isSelected);
        this._attachNodeData(node, li);
        if (this._onCreateLi) {
          this._onCreateLi(node, jQuery(li), isSelected);
        }
        return li;
      }
      _createNodeLi(node, level, isSelected) {
        const liClasses = ["jqtree_common"];
        if (isSelected) {
          liClasses.push("jqtree-selected");
        }
        const classString = liClasses.join(" ");

        // li
        const li = document.createElement("li");
        li.className = classString;
        li.setAttribute("role", "none");

        // div
        const div = document.createElement("div");
        div.className = "jqtree-element jqtree_common";
        div.setAttribute("role", "none");
        li.appendChild(div);

        // title span
        const titleSpan = this._createTitleSpan(node.name, isSelected, false, level);
        div.appendChild(titleSpan);
        return li;
      }
      _createTitleSpan(nodeName, isSelected, isFolder, level) {
        const titleSpan = document.createElement("span");
        let classes = "jqtree-title jqtree_common";
        if (isFolder) {
          classes += " jqtree-title-folder";
        }
        classes += ` jqtree-title-button-${this._buttonLeft ? "left" : "right"}`;
        titleSpan.className = classes;
        if (isSelected) {
          const tabIndex = this._tabIndex;
          if (tabIndex !== undefined) {
            titleSpan.setAttribute("tabindex", `${tabIndex}`);
          }
        }
        this._setTreeItemAriaAttributes(titleSpan, nodeName, level, isSelected);
        if (this._autoEscape) {
          titleSpan.textContent = nodeName;
        } else {
          titleSpan.innerHTML = nodeName;
        }
        return titleSpan;
      }
      _createUl(isRootNode) {
        let classString;
        let role;
        if (!isRootNode) {
          classString = "";
          role = "group";
        } else {
          classString = "jqtree-tree";
          role = "tree";
          if (this._rtl) {
            classString += " jqtree-rtl";
          }
        }
        if (this._dragAndDrop) {
          classString += " jqtree-dnd";
        }
        const ul = document.createElement("ul");
        ul.className = `jqtree_common ${classString}`;
        ul.setAttribute("role", role);
        return ul;
      }
      _getButtonClasses(node) {
        const classes = ["jqtree-toggler", "jqtree_common"];
        if (!node.is_open) {
          classes.push("jqtree-closed");
        }
        if (this._buttonLeft) {
          classes.push("jqtree-toggler-left");
        } else {
          classes.push("jqtree-toggler-right");
        }
        return classes.join(" ");
      }
      _getFolderClasses(node, isSelected) {
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
      _setTreeItemAriaAttributes(element, name, level, isSelected) {
        element.setAttribute("aria-label", name);
        element.setAttribute("aria-level", `${level}`);
        element.setAttribute("aria-selected", getBoolString(isSelected));
        element.setAttribute("role", "treeitem");
      }
    }

    class KeyHandler {
      _closeNode;
      _getSelectedNode;
      _isFocusOnTree;
      _keyboardSupport;
      _openNode;
      _originalSelectNode;
      constructor({
        closeNode,
        getSelectedNode,
        isFocusOnTree,
        keyboardSupport,
        openNode,
        selectNode
      }) {
        this._closeNode = closeNode;
        this._getSelectedNode = getSelectedNode;
        this._isFocusOnTree = isFocusOnTree;
        this._keyboardSupport = keyboardSupport;
        this._openNode = openNode;
        this._originalSelectNode = selectNode;
        if (keyboardSupport) {
          document.addEventListener("keydown", this._handleKeyDown);
        }
      }
      deinit() {
        if (this._keyboardSupport) {
          document.removeEventListener("keydown", this._handleKeyDown);
        }
      }
      moveDown(selectedNode) {
        return this._selectNode(selectedNode.getNextVisibleNode());
      }
      moveUp(selectedNode) {
        return this._selectNode(selectedNode.getPreviousVisibleNode());
      }
      _canHandleKeyboard() {
        return this._keyboardSupport && this._isFocusOnTree();
      }
      _handleKeyDown = e => {
        if (!this._canHandleKeyboard()) {
          return;
        }
        let isKeyHandled = false;
        const selectedNode = this._getSelectedNode();
        if (selectedNode) {
          switch (e.key) {
            case "ArrowDown":
              isKeyHandled = this.moveDown(selectedNode);
              break;
            case "ArrowLeft":
              isKeyHandled = this._moveLeft(selectedNode);
              break;
            case "ArrowRight":
              isKeyHandled = this._moveRight(selectedNode);
              break;
            case "ArrowUp":
              isKeyHandled = this.moveUp(selectedNode);
              break;
          }
        }
        if (isKeyHandled) {
          e.preventDefault();
        }
      };
      _moveLeft(selectedNode) {
        if (selectedNode.isFolder() && selectedNode.is_open) {
          // Left on an open node closes the node
          this._closeNode(selectedNode);
          return true;
        } else {
          // Left on a closed or end node moves focus to the node's parent
          return this._selectNode(selectedNode.getParent());
        }
      }
      _moveRight(selectedNode) {
        if (!selectedNode.isFolder()) {
          return false;
        } else {
          // folder node
          if (selectedNode.is_open) {
            // Right moves to the first child of an open node
            return this._selectNode(selectedNode.getNextVisibleNode());
          } else {
            // Right expands a closed node
            this._openNode(selectedNode);
            return true;
          }
        }
      }

      /* Select the node.
       * Don't do anything if the node is null.
       * Result: a different node was selected.
       */
      _selectNode(node) {
        if (!node) {
          return false;
        } else {
          this._originalSelectNode(node);
          return true;
        }
      }
    }

    const getPositionInfoFromMouseEvent = e => ({
      originalEvent: e,
      pageX: e.pageX,
      pageY: e.pageY,
      target: e.target
    });
    const getPositionInfoFromTouch = (touch, e) => ({
      originalEvent: e,
      pageX: touch.pageX,
      pageY: touch.pageY,
      target: touch.target
    });

    class MouseHandler {
      _element;
      _getMouseDelay;
      _getNode;
      _isMouseDelayMet;
      _isMouseStarted;
      _mouseDelayTimer;
      _mouseDownInfo;
      _onClickButton;
      _onClickTitle;
      _onMouseCapture;
      _onMouseDrag;
      _onMouseStart;
      _onMouseStop;
      _triggerEvent;
      _useContextMenu;
      constructor({
        element,
        getMouseDelay,
        getNode,
        onClickButton,
        onClickTitle,
        onMouseCapture,
        onMouseDrag,
        onMouseStart,
        onMouseStop,
        triggerEvent,
        useContextMenu
      }) {
        this._element = element;
        this._getMouseDelay = getMouseDelay;
        this._getNode = getNode;
        this._onClickButton = onClickButton;
        this._onClickTitle = onClickTitle;
        this._onMouseCapture = onMouseCapture;
        this._onMouseDrag = onMouseDrag;
        this._onMouseStart = onMouseStart;
        this._onMouseStop = onMouseStop;
        this._triggerEvent = triggerEvent;
        this._useContextMenu = useContextMenu;
        element.addEventListener("click", this._handleClick);
        element.addEventListener("dblclick", this._handleDblclick);
        element.addEventListener("mousedown", this._mouseDown, {
          passive: false
        });
        element.addEventListener("touchstart", this._touchStart, {
          passive: false
        });
        if (useContextMenu) {
          element.addEventListener("contextmenu", this._handleContextmenu);
        }
        this._isMouseStarted = false;
        this._mouseDelayTimer = null;
        this._isMouseDelayMet = false;
        this._mouseDownInfo = null;
      }
      deinit() {
        this._element.removeEventListener("click", this._handleClick);
        this._element.removeEventListener("dblclick", this._handleDblclick);
        if (this._useContextMenu) {
          this._element.removeEventListener("contextmenu", this._handleContextmenu);
        }
        this._element.removeEventListener("mousedown", this._mouseDown);
        this._element.removeEventListener("touchstart", this._touchStart);
        this._removeMouseMoveEventListeners();
      }
      _getClickTarget(element) {
        const button = element.closest(".jqtree-toggler");
        if (button) {
          const node = this._getNode(button);
          if (node) {
            return {
              node,
              type: "button"
            };
          }
        } else {
          const jqTreeElement = element.closest(".jqtree-element");
          if (jqTreeElement) {
            const node = this._getNode(jqTreeElement);
            if (node) {
              return {
                node,
                type: "label"
              };
            }
          }
        }
        return null;
      }
      _handleClick = e => {
        if (!e.target) {
          return;
        }
        const clickTarget = this._getClickTarget(e.target);
        if (!clickTarget) {
          return;
        }
        switch (clickTarget.type) {
          case "button":
            this._onClickButton(clickTarget.node);
            e.preventDefault();
            e.stopPropagation();
            break;
          case "label":
            {
              if (this._triggerEvent("tree.click", {
                click_event: e,
                node: clickTarget.node
              })) {
                this._onClickTitle(clickTarget.node);
              }
              break;
            }
        }
      };
      _handleContextmenu = e => {
        if (!e.target) {
          return;
        }
        const div = e.target.closest("ul.jqtree-tree .jqtree-element");
        if (div) {
          const node = this._getNode(div);
          if (node) {
            e.preventDefault();
            e.stopPropagation();
            this._triggerEvent("tree.contextmenu", {
              click_event: e,
              node
            });
            return false;
          }
        }
        return null;
      };
      _handleDblclick = e => {
        if (!e.target) {
          return;
        }
        const clickTarget = this._getClickTarget(e.target);
        if (clickTarget?.type === "label") {
          this._triggerEvent("tree.dblclick", {
            click_event: e,
            node: clickTarget.node
          });
        }
      };
      _handleMouseDown(positionInfo) {
        // We may have missed mouseup (out of window)
        if (this._isMouseStarted) {
          this._handleMouseUp(positionInfo);
        }
        this._mouseDownInfo = positionInfo;
        if (!this._onMouseCapture(positionInfo)) {
          return false;
        }
        this._handleStartMouse();
        return true;
      }
      _handleMouseMove(e, positionInfo) {
        if (this._isMouseStarted) {
          this._onMouseDrag(positionInfo);
          if (e.cancelable) {
            e.preventDefault();
          }
          return;
        }
        if (!this._isMouseDelayMet) {
          return;
        }
        if (this._mouseDownInfo) {
          this._isMouseStarted = this._onMouseStart(this._mouseDownInfo);
        }
        if (this._isMouseStarted) {
          this._onMouseDrag(positionInfo);
          if (e.cancelable) {
            e.preventDefault();
          }
        } else {
          this._handleMouseUp(positionInfo);
        }
      }
      _handleMouseUp(positionInfo) {
        this._removeMouseMoveEventListeners();
        this._isMouseDelayMet = false;
        this._mouseDownInfo = null;
        if (this._isMouseStarted) {
          this._isMouseStarted = false;
          this._onMouseStop(positionInfo);
        }
      }
      _handleStartMouse() {
        document.addEventListener("mousemove", this._mouseMove, {
          passive: false
        });
        document.addEventListener("touchmove", this._touchMove, {
          passive: false
        });
        document.addEventListener("mouseup", this._mouseUp, {
          passive: false
        });
        document.addEventListener("touchend", this._touchEnd, {
          passive: false
        });
        const mouseDelay = this._getMouseDelay();
        if (mouseDelay) {
          this._startMouseDelayTimer(mouseDelay);
        } else {
          this._isMouseDelayMet = true;
        }
      }
      _mouseDown = e => {
        // Left mouse button?
        if (e.button !== 0) {
          return;
        }
        const result = this._handleMouseDown(getPositionInfoFromMouseEvent(e));
        if (result && e.cancelable) {
          e.preventDefault();
        }
      };
      _mouseMove = e => {
        this._handleMouseMove(e, getPositionInfoFromMouseEvent(e));
      };
      _mouseUp = e => {
        this._handleMouseUp(getPositionInfoFromMouseEvent(e));
      };
      _removeMouseMoveEventListeners() {
        document.removeEventListener("mousemove", this._mouseMove);
        document.removeEventListener("touchmove", this._touchMove);
        document.removeEventListener("mouseup", this._mouseUp);
        document.removeEventListener("touchend", this._touchEnd);
      }
      _startMouseDelayTimer(mouseDelay) {
        if (this._mouseDelayTimer) {
          clearTimeout(this._mouseDelayTimer);
        }
        this._mouseDelayTimer = window.setTimeout(() => {
          if (this._mouseDownInfo) {
            this._isMouseDelayMet = true;
          }
        }, mouseDelay);
        this._isMouseDelayMet = false;
      }
      _touchEnd = e => {
        if (e.touches.length > 1) {
          return;
        }
        const touch = e.touches[0];
        if (!touch) {
          return;
        }
        this._handleMouseUp(getPositionInfoFromTouch(touch, e));
      };
      _touchMove = e => {
        if (e.touches.length > 1) {
          return;
        }
        const touch = e.touches[0];
        if (!touch) {
          return;
        }
        this._handleMouseMove(e, getPositionInfoFromTouch(touch, e));
      };
      _touchStart = e => {
        if (e.touches.length > 1) {
          return;
        }
        const touch = e.touches[0];
        if (!touch) {
          return;
        }
        this._handleMouseDown(getPositionInfoFromTouch(touch, e));
      };
    }

    const isNodeRecordWithChildren = data => typeof data === "object" && "children" in data && data.children instanceof Array;

    class Node {
      children;
      element;
      id;
      idMapping;
      is_loading;
      is_open;
      isEmptyFolder;
      load_on_demand;
      name;
      nodeClass;
      parent;
      tree;
      constructor(nodeData = null, isRoot = false, nodeClass = Node) {
        this.name = "";
        this.load_on_demand = false;
        this.isEmptyFolder = nodeData != null && isNodeRecordWithChildren(nodeData) && nodeData.children.length === 0;
        this.setData(nodeData);
        this.children = [];
        this.parent = null;
        if (isRoot) {
          this.idMapping = new Map();
          this.tree = this;
          this.nodeClass = nodeClass;
        }
      }
      addAfter(nodeInfo) {
        if (!this.parent) {
          return null;
        } else {
          const node = this._createNode(nodeInfo);
          const childIndex = this.parent.getChildIndex(this);
          this.parent.addChildAtPosition(node, childIndex + 1);
          node._loadChildrenFromData(nodeInfo);
          return node;
        }
      }
      addBefore(nodeInfo) {
        if (!this.parent) {
          return null;
        } else {
          const node = this._createNode(nodeInfo);
          const childIndex = this.parent.getChildIndex(this);
          this.parent.addChildAtPosition(node, childIndex);
          node._loadChildrenFromData(nodeInfo);
          return node;
        }
      }

      /*
      Add child.
       tree.addChild(
          new Node('child1')
      );
      */
      addChild(node) {
        this.children.push(node);
        node._setParent(this);
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
        node._setParent(this);
      }
      addNodeToIndex(node) {
        if (node.id != null) {
          this.idMapping.set(node.id, node);
        }
      }
      addParent(nodeInfo) {
        if (!this.parent) {
          return null;
        } else {
          const newParent = this._createNode(nodeInfo);
          if (this.tree) {
            newParent._setParent(this.tree);
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
      append(nodeInfo) {
        const node = this._createNode(nodeInfo);
        this.addChild(node);
        node._loadChildrenFromData(nodeInfo);
        return node;
      }
      filter(f) {
        const result = [];
        this.iterate(node => {
          if (f(node)) {
            result.push(node);
          }
          return true;
        });
        return result;
      }

      /*
      Get child index.
       var index = getChildIndex(node);
      */
      getChildIndex(node) {
        return this.children.indexOf(node);
      }

      /*
      Get the tree as data.
      */
      getData(includeParent = false) {
        const getDataFromNodes = nodes => {
          return nodes.map(node => {
            const tmpNode = {};
            for (const k in node) {
              if (["parent", "children", "element", "idMapping", "load_on_demand", "nodeClass", "tree", "isEmptyFolder"].indexOf(k) === -1 && Object.prototype.hasOwnProperty.call(node, k)) {
                const v = node[k];
                tmpNode[k] = v;
              }
            }
            if (node.hasChildren()) {
              tmpNode.children = getDataFromNodes(node.children);
            }
            return tmpNode;
          });
        };
        if (includeParent) {
          return getDataFromNodes([this]);
        } else {
          return getDataFromNodes(this.children);
        }
      }
      getLastChild() {
        if (!this.hasChildren()) {
          return null;
        } else {
          const lastChild = this.children[this.children.length - 1];
          if (!(lastChild.hasChildren() && lastChild.is_open)) {
            return lastChild;
          } else {
            return lastChild.getLastChild();
          }
        }
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
      getNextNode(includeChildren = true) {
        if (includeChildren && this.hasChildren()) {
          return this.children[0] ?? null;
        } else if (!this.parent) {
          return null;
        } else {
          const nextSibling = this.getNextSibling();
          if (nextSibling) {
            return nextSibling;
          } else {
            return this.parent.getNextNode(false);
          }
        }
      }
      getNextSibling() {
        if (!this.parent) {
          return null;
        } else {
          const nextIndex = this.parent.getChildIndex(this) + 1;
          if (nextIndex < this.parent.children.length) {
            return this.parent.children[nextIndex] ?? null;
          } else {
            return null;
          }
        }
      }
      getNextVisibleNode() {
        if (this.hasChildren() && this.is_open) {
          // First child
          return this.children[0] ?? null;
        } else {
          if (!this.parent) {
            return null;
          } else {
            const nextSibling = this.getNextSibling();
            if (nextSibling) {
              // Next sibling
              return nextSibling;
            } else {
              // Next node of parent
              return this.parent.getNextNode(false);
            }
          }
        }
      }
      getNodeByCallback(callback) {
        let result = null;
        this.iterate(node => {
          if (result) {
            return false;
          } else if (callback(node)) {
            result = node;
            return false;
          } else {
            return true;
          }
        });
        return result;
      }
      getNodeById(nodeId) {
        return this.idMapping.get(nodeId) ?? null;
      }
      getNodeByName(name) {
        return this.getNodeByCallback(node => node.name === name);
      }
      getNodeByNameMustExist(name) {
        const node = this.getNodeByCallback(n => n.name === name);
        if (!node) {
          throw new Error(`Node with name ${name} not found`);
        }
        return node;
      }
      getNodesByProperty(key, value) {
        return this.filter(node => node[key] === value);
      }
      getParent() {
        // Return parent except if it is the root node
        if (!this.parent) {
          return null;
        } else if (!this.parent.parent) {
          // Root node -> null
          return null;
        } else {
          return this.parent;
        }
      }
      getPreviousNode() {
        if (!this.parent) {
          return null;
        } else {
          const previousSibling = this.getPreviousSibling();
          if (!previousSibling) {
            return this.getParent();
          } else if (previousSibling.hasChildren()) {
            return previousSibling.getLastChild();
          } else {
            return previousSibling;
          }
        }
      }
      getPreviousSibling() {
        if (!this.parent) {
          return null;
        } else {
          const previousIndex = this.parent.getChildIndex(this) - 1;
          if (previousIndex >= 0) {
            return this.parent.children[previousIndex] ?? null;
          } else {
            return null;
          }
        }
      }
      getPreviousVisibleNode() {
        if (!this.parent) {
          return null;
        } else {
          const previousSibling = this.getPreviousSibling();
          if (!previousSibling) {
            return this.getParent();
          } else if (!previousSibling.hasChildren() || !previousSibling.is_open) {
            // Previous sibling
            return previousSibling;
          } else {
            // Last child of previous sibling
            return previousSibling.getLastChild();
          }
        }
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

      // Init Node from data without making it the root of the tree
      initFromData(data) {
        const addNode = nodeData => {
          this.setData(nodeData);
          if (isNodeRecordWithChildren(nodeData) && nodeData.children.length) {
            addChildren(nodeData.children);
          }
        };
        const addChildren = childrenData => {
          for (const child of childrenData) {
            const node = this._createNode();
            node.initFromData(child);
            this.addChild(node);
          }
        };
        addNode(data);
      }
      isFolder() {
        return this.hasChildren() || this.load_on_demand;
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
          for (const child of node.children) {
            const result = callback(child, level);
            if (result && child.hasChildren()) {
              _iterate(child, level + 1);
            }
          }
        };
        _iterate(this, 0);
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
        for (const childData of data) {
          const node = this._createNode(childData);
          this.addChild(node);
          if (isNodeRecordWithChildren(childData)) {
            node.loadFromData(childData.children);
          }
        }
        return this;
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
        } else {
          movedNode.parent._doRemoveChild(movedNode);
          switch (position) {
            case "after":
              {
                if (targetNode.parent) {
                  targetNode.parent.addChildAtPosition(movedNode, targetNode.parent.getChildIndex(targetNode) + 1);
                  return true;
                }
                return false;
              }
            case "before":
              {
                if (targetNode.parent) {
                  targetNode.parent.addChildAtPosition(movedNode, targetNode.parent.getChildIndex(targetNode));
                  return true;
                }
                return false;
              }
            case "inside":
              {
                // move inside as first child
                targetNode.addChildAtPosition(movedNode, 0);
                return true;
              }
          }
        }
      }
      prepend(nodeInfo) {
        const node = this._createNode(nodeInfo);
        this.addChildAtPosition(node, 0);
        node._loadChildrenFromData(nodeInfo);
        return node;
      }
      remove() {
        if (this.parent) {
          this.parent.removeChild(this);
          this.parent = null;
        }
      }

      /*
      Remove child. This also removes the children of the node.
       tree.removeChild(tree.children[0]);
      */
      removeChild(node) {
        // remove children from the index
        node.removeChildren();
        this._doRemoveChild(node);
      }
      removeChildren() {
        this.iterate(child => {
          this.tree?.removeNodeFromIndex(child);
          return true;
        });
        this.children = [];
      }
      removeNodeFromIndex(node) {
        if (node.id != null) {
          this.idMapping.delete(node.id);
        }
      }

      /*
      Set the data of this node.
       setData(string): set the name of the node
      setData(object): set attributes of the node
       Examples:
          setData('node1')
           setData({ name: 'node1', id: 1});
           setData({ name: 'node2', id: 2, color: 'green'});
       * This is an internal function; it is not in the docs
      * Does not remove existing node values
      */
      setData(o) {
        if (!o) {
          return;
        } else if (typeof o === "string") {
          this.name = o;
        } else if (typeof o === "object") {
          for (const key in o) {
            if (Object.prototype.hasOwnProperty.call(o, key)) {
              const value = o[key];
              if (key === "label" || key === "name") {
                // You can use the 'label' key instead of 'name'; this is a legacy feature
                if (typeof value === "string") {
                  this.name = value;
                }
              } else if (key !== "children" && key !== "parent") {
                // You can't update the children or the parent using this function
                this[key] = value;
              }
            }
          }
        }
      }
      _createNode(nodeData) {
        const nodeClass = this._getNodeClass();
        return new nodeClass(nodeData);
      }
      _doRemoveChild(node) {
        this.children.splice(this.getChildIndex(node), 1);
        this.tree?.removeNodeFromIndex(node);
      }
      _getNodeClass() {
        return this.nodeClass ?? this.tree?.nodeClass ?? Node;
      }

      // Load children data from nodeInfo if it has children
      _loadChildrenFromData(nodeInfo) {
        if (isNodeRecordWithChildren(nodeInfo) && nodeInfo.children.length) {
          this.loadFromData(nodeInfo.children);
        }
      }
      _setParent(parent) {
        this.parent = parent;
        this.tree = parent.tree;
        this.tree?.addNodeToIndex(this);
      }
    }

    class BorderDropHint {
      _hint;
      constructor(element, scrollLeft) {
        const div = element.querySelector(":scope > .jqtree-element");
        if (!div) {
          this._hint = undefined;
          return;
        }
        const width = Math.max(element.offsetWidth + scrollLeft - 4, 0);
        const height = Math.max(element.clientHeight - 4, 0);
        const hint = document.createElement("span");
        hint.className = "jqtree-border";
        hint.style.width = `${width}px`;
        hint.style.height = `${height}px`;
        this._hint = hint;
        div.append(this._hint);
      }
      remove() {
        this._hint?.remove();
      }
    }

    class GhostDropHint {
      _element;
      _ghost;
      _node;
      constructor(node, element, position) {
        this._element = element;
        this._node = node;
        this._ghost = this._createGhostElement();
        switch (position) {
          case "after":
            this._moveAfter();
            break;
          case "before":
            this._moveBefore();
            break;
          case "inside":
            {
              if (node.isFolder() && node.is_open) {
                this._moveInsideOpenFolder();
              } else {
                this._moveInside();
              }
            }
        }
      }
      remove() {
        this._ghost.remove();
      }
      _createGhostElement() {
        const ghost = document.createElement("li");
        ghost.className = "jqtree_common jqtree-ghost";
        const circleSpan = document.createElement("span");
        circleSpan.className = "jqtree_common jqtree-circle";
        ghost.append(circleSpan);
        const lineSpan = document.createElement("span");
        lineSpan.className = "jqtree_common jqtree-line";
        ghost.append(lineSpan);
        return ghost;
      }
      _moveAfter() {
        this._element.after(this._ghost);
      }
      _moveBefore() {
        this._element.before(this._ghost);
      }
      _moveInside() {
        this._element.after(this._ghost);
        this._ghost.classList.add("jqtree-inside");
      }
      _moveInsideOpenFolder() {
        const childElement = this._node.children[0]?.element;
        if (childElement) {
          childElement.before(this._ghost);
        }
      }
    }

    class NodeElement {
      element;
      node;
      _getScrollLeft;
      _tabIndex;
      _treeElement;
      constructor({
        getScrollLeft,
        node,
        tabIndex,
        treeElement
      }) {
        this._getScrollLeft = getScrollLeft;
        this._tabIndex = tabIndex;
        this._treeElement = treeElement;
        this.init(node);
      }
      addDropHint(position) {
        if (this.mustShowBorderDropHint(position)) {
          return new BorderDropHint(this.element, this._getScrollLeft());
        } else {
          return new GhostDropHint(this.node, this.element, position);
        }
      }
      deselect() {
        this.element.classList.remove("jqtree-selected");
        const titleSpan = this.getTitleSpan();
        titleSpan.removeAttribute("tabindex");
        titleSpan.setAttribute("aria-selected", "false");
        titleSpan.blur();
      }
      init(node) {
        this.node = node;
        node.element ??= this._treeElement;
        this.element = node.element;
      }
      select(mustSetFocus) {
        this.element.classList.add("jqtree-selected");
        const titleSpan = this.getTitleSpan();
        const tabIndex = this._tabIndex;

        // Check for null or undefined
        if (tabIndex != null) {
          titleSpan.setAttribute("tabindex", tabIndex.toString());
        }
        titleSpan.setAttribute("aria-selected", "true");
        if (mustSetFocus) {
          titleSpan.focus();
        }
      }
      getTitleSpan() {
        return this.element.querySelector(":scope > .jqtree-element > span.jqtree-title");
      }
      getUl() {
        return this.element.querySelector(":scope > ul");
      }
      mustShowBorderDropHint(position) {
        return position === "inside";
      }
    }

    const getAnimationDuration = duration => {
      if (typeof duration === "number") {
        return duration;
      }
      return duration === "slow" ? 600 : 200;
    };
    const slideDown = (element, animationSpeed, onFinished) => {
      element.style.display = "block";
      const animation = element.animate([{
        height: "0",
        overflow: "hidden"
      }, {
        height: `${element.scrollHeight}px`,
        overflow: "hidden"
      }], {
        duration: getAnimationDuration(animationSpeed)
      });
      animation.onfinish = () => {
        onFinished();
      };
    };
    const slideUp = (element, animationSpeed, onFinished) => {
      const animation = element.animate([{
        height: `${element.scrollHeight}px`,
        overflow: "hidden"
      }, {
        height: "0",
        overflow: "hidden"
      }], {
        duration: getAnimationDuration(animationSpeed)
      });
      animation.onfinish = () => {
        element.style.display = "none";
        onFinished();
      };
    };

    class FolderElement extends NodeElement {
      _closedIconElement;
      _openedIconElement;
      _triggerEvent;
      constructor({
        closedIconElement,
        getScrollLeft,
        node,
        openedIconElement,
        tabIndex,
        treeElement,
        triggerEvent
      }) {
        super({
          getScrollLeft,
          node,
          tabIndex,
          treeElement
        });
        this._closedIconElement = closedIconElement;
        this._openedIconElement = openedIconElement;
        this._triggerEvent = triggerEvent;
      }
      close(slide, animationSpeed) {
        if (!this.node.is_open) {
          return;
        }
        this.node.is_open = false;
        const button = this._getButton();
        button.classList.add("jqtree-closed");
        button.innerHTML = "";
        const closedIconElement = this._closedIconElement;
        if (closedIconElement) {
          const icon = closedIconElement.cloneNode(true);
          button.appendChild(icon);
        }
        const doClose = () => {
          this.element.classList.add("jqtree-closed");
          const titleSpan = this.getTitleSpan();
          titleSpan.setAttribute("aria-expanded", "false");
          this._triggerEvent("tree.close", {
            node: this.node
          });
        };
        const ul = this.getUl();
        if (slide) {
          slideUp(ul, animationSpeed, doClose);
        } else {
          ul.style.display = "none";
          doClose();
        }
      }
      open(onFinished, slide, animationSpeed) {
        if (this.node.is_open) {
          return;
        }
        this.node.is_open = true;
        const button = this._getButton();
        button.classList.remove("jqtree-closed");
        button.innerHTML = "";
        const openedIconElement = this._openedIconElement;
        if (openedIconElement) {
          const icon = openedIconElement.cloneNode(true);
          button.appendChild(icon);
        }
        const doOpen = () => {
          this.element.classList.remove("jqtree-closed");
          const titleSpan = this.getTitleSpan();
          titleSpan.setAttribute("aria-expanded", "true");
          if (onFinished) {
            onFinished(this.node);
          }
          this._triggerEvent("tree.open", {
            node: this.node
          });
        };
        const ul = this.getUl();
        if (slide) {
          slideDown(ul, animationSpeed, doOpen);
        } else {
          ul.style.display = "block";
          doOpen();
        }
      }
      mustShowBorderDropHint(position) {
        return !this.node.is_open && position === "inside";
      }
      _getButton() {
        return this.element.querySelector(":scope > .jqtree-element > a.jqtree-toggler");
      }
    }

    class SaveStateHandler {
      _addToSelection;
      _getNodeById;
      _getSelectedNodes;
      _getTree;
      _onGetStateFromStorage;
      _onSetStateFromStorage;
      _openNode;
      _refreshElements;
      _removeFromSelection;
      _saveStateOption;
      constructor({
        addToSelection,
        getNodeById,
        getSelectedNodes,
        getTree,
        onGetStateFromStorage,
        onSetStateFromStorage,
        openNode,
        refreshElements,
        removeFromSelection,
        saveState
      }) {
        this._addToSelection = addToSelection;
        this._getNodeById = getNodeById;
        this._getSelectedNodes = getSelectedNodes;
        this._getTree = getTree;
        this._onGetStateFromStorage = onGetStateFromStorage;
        this._onSetStateFromStorage = onSetStateFromStorage;
        this._openNode = openNode;
        this._refreshElements = refreshElements;
        this._removeFromSelection = removeFromSelection;
        this._saveStateOption = saveState;
      }
      getNodeIdToBeSelected() {
        const state = this.getStateFromStorage();
        if (state?.selected_node) {
          return state.selected_node[0] ?? null;
        } else {
          return null;
        }
      }
      getState() {
        const getOpenNodeIds = () => {
          const openNodes = [];
          this._getTree()?.iterate(node => {
            if (node.is_open && node.id && node.hasChildren()) {
              openNodes.push(node.id);
            }
            return true;
          });
          return openNodes;
        };
        const getSelectedNodeIds = () => {
          const selectedNodeIds = [];
          this._getSelectedNodes().forEach(node => {
            if (node.id != null) {
              selectedNodeIds.push(node.id);
            }
          });
          return selectedNodeIds;
        };
        return {
          open_nodes: getOpenNodeIds(),
          selected_node: getSelectedNodeIds()
        };
      }
      getStateFromStorage() {
        const jsonData = this._loadFromStorage();
        if (jsonData) {
          return this._parseState(jsonData);
        } else {
          return null;
        }
      }
      saveState() {
        const state = JSON.stringify(this.getState());
        if (this._onSetStateFromStorage) {
          this._onSetStateFromStorage(state);
        } else {
          localStorage.setItem(this._getKeyName(), state);
        }
      }

      /*
      Set initial state
      Don't handle nodes that are loaded on demand
       result: must load on demand (boolean)
      */
      setInitialState(state) {
        let mustLoadOnDemand = false;
        if (state.open_nodes) {
          mustLoadOnDemand = this._openInitialNodes(state.open_nodes);
        }
        this._resetSelection();
        if (state.selected_node) {
          this._selectInitialNodes(state.selected_node);
        }
        return mustLoadOnDemand;
      }
      setInitialStateOnDemand(state, cbFinished) {
        let loadingCount = 0;
        let nodeIds = state.open_nodes;
        const openNodes = () => {
          if (!nodeIds) {
            return;
          }
          const newNodesIds = [];
          for (const nodeId of nodeIds) {
            const node = this._getNodeById(nodeId);
            if (!node) {
              newNodesIds.push(nodeId);
            } else {
              if (!node.is_loading) {
                if (node.load_on_demand) {
                  loadAndOpenNode(node);
                } else {
                  this._openNode(node, false);
                }
              }
            }
          }
          nodeIds = newNodesIds;
          if (state.selected_node) {
            if (this._selectInitialNodes(state.selected_node)) {
              this._refreshElements(null);
            }
          }
          if (loadingCount === 0) {
            cbFinished();
          }
        };
        const loadAndOpenNode = node => {
          loadingCount += 1;
          this._openNode(node, false, () => {
            loadingCount -= 1;
            openNodes();
          });
        };
        openNodes();
      }
      _getKeyName() {
        if (typeof this._saveStateOption === "string") {
          return this._saveStateOption;
        } else {
          return "tree";
        }
      }
      _loadFromStorage() {
        if (this._onGetStateFromStorage) {
          return this._onGetStateFromStorage();
        } else {
          return localStorage.getItem(this._getKeyName());
        }
      }
      _openInitialNodes(nodeIds) {
        let mustLoadOnDemand = false;
        for (const nodeId of nodeIds) {
          const node = this._getNodeById(nodeId);
          if (node) {
            if (!node.load_on_demand) {
              node.is_open = true;
            } else {
              mustLoadOnDemand = true;
            }
          }
        }
        return mustLoadOnDemand;
      }
      _parseState(jsonData) {
        const state = JSON.parse(jsonData);

        // Check if selected_node is an int (instead of an array)
        if (state.selected_node && isInt(state.selected_node)) {
          // Convert to array
          state.selected_node = [state.selected_node];
        }
        return state;
      }
      _resetSelection() {
        const selectedNodes = this._getSelectedNodes();
        selectedNodes.forEach(node => {
          this._removeFromSelection(node);
        });
      }
      _selectInitialNodes(nodeIds) {
        let selectCount = 0;
        for (const nodeId of nodeIds) {
          const node = this._getNodeById(nodeId);
          if (node) {
            selectCount += 1;
            this._addToSelection(node);
          }
        }
        return selectCount !== 0;
      }
    }

    class ScrollParent {
      container;
      horizontalScrollDirection;
      horizontalScrollTimeout;
      refreshHitAreas;
      verticalScrollDirection;
      verticalScrollTimeout;
      constructor({
        container,
        refreshHitAreas
      }) {
        this.container = container;
        this.refreshHitAreas = refreshHitAreas;
      }
      checkHorizontalScrolling(pageX) {
        const newHorizontalScrollDirection = this.getNewHorizontalScrollDirection(pageX);
        if (this.horizontalScrollDirection !== newHorizontalScrollDirection) {
          this.horizontalScrollDirection = newHorizontalScrollDirection;
          if (this.horizontalScrollTimeout != null) {
            window.clearTimeout(this.horizontalScrollTimeout);
          }
          if (newHorizontalScrollDirection) {
            this.horizontalScrollTimeout = window.setTimeout(this.scrollHorizontally.bind(this), 40);
          }
        }
      }
      checkVerticalScrolling(pageY) {
        const newVerticalScrollDirection = this.getNewVerticalScrollDirection(pageY);
        if (this.verticalScrollDirection !== newVerticalScrollDirection) {
          this.verticalScrollDirection = newVerticalScrollDirection;
          if (this.verticalScrollTimeout != null) {
            window.clearTimeout(this.verticalScrollTimeout);
            this.verticalScrollTimeout = undefined;
          }
          if (newVerticalScrollDirection) {
            this.verticalScrollTimeout = window.setTimeout(this.scrollVertically.bind(this), 40);
          }
        }
      }
      getScrollLeft() {
        return this.container.scrollLeft;
      }
      scrollToY(top) {
        this.container.scrollTop = top;
      }
      stopScrolling() {
        this.horizontalScrollDirection = undefined;
        this.verticalScrollDirection = undefined;
      }
      scrollHorizontally() {
        if (!this.horizontalScrollDirection) {
          return;
        }
        const distance = this.horizontalScrollDirection === "left" ? -20 : 20;
        this.container.scrollBy({
          behavior: "instant",
          left: distance,
          top: 0
        });
        this.refreshHitAreas();
        setTimeout(this.scrollHorizontally.bind(this), 40);
      }
      scrollVertically() {
        if (!this.verticalScrollDirection) {
          return;
        }
        const distance = this.verticalScrollDirection === "top" ? -20 : 20;
        this.container.scrollBy({
          behavior: "instant",
          left: 0,
          top: distance
        });
        this.refreshHitAreas();
        setTimeout(this.scrollVertically.bind(this), 40);
      }
    }

    class ContainerScrollParent extends ScrollParent {
      _scrollParentBottom;
      _scrollParentTop;
      stopScrolling() {
        super.stopScrolling();
        this.horizontalScrollDirection = undefined;
        this.verticalScrollDirection = undefined;
      }
      getNewHorizontalScrollDirection(pageX) {
        const scrollParentOffset = getElementPosition(this.container);
        const containerWidth = this.container.getBoundingClientRect().width;
        const rightEdge = scrollParentOffset.left + containerWidth;
        const leftEdge = scrollParentOffset.left;
        const isNearRightEdge = pageX > rightEdge - 20;
        const isNearLeftEdge = pageX < leftEdge + 20;
        if (isNearRightEdge) {
          return "right";
        } else if (isNearLeftEdge) {
          return "left";
        }
        return undefined;
      }
      getNewVerticalScrollDirection(pageY) {
        if (pageY < this._getScrollParentTop()) {
          return "top";
        }
        if (pageY > this._getScrollParentBottom()) {
          return "bottom";
        }
        return undefined;
      }
      _getScrollParentBottom() {
        if (this._scrollParentBottom == null) {
          const containerHeight = this.container.getBoundingClientRect().height;
          this._scrollParentBottom = this._getScrollParentTop() + containerHeight;
        }
        return this._scrollParentBottom;
      }
      _getScrollParentTop() {
        this._scrollParentTop ??= getOffsetTop(this.container);
        return this._scrollParentTop;
      }
    }

    class DocumentScrollParent extends ScrollParent {
      _documentScrollHeight;
      _documentScrollWidth;
      _treeElement;
      constructor({
        refreshHitAreas,
        treeElement
      }) {
        super({
          container: document.documentElement,
          refreshHitAreas
        });
        this._treeElement = treeElement;
      }
      scrollToY(top) {
        const treeTop = getOffsetTop(this._treeElement);
        super.scrollToY(top + treeTop);
      }
      stopScrolling() {
        super.stopScrolling();
        this._documentScrollHeight = undefined;
        this._documentScrollWidth = undefined;
      }
      getNewHorizontalScrollDirection(pageX) {
        const scrollLeft = this.container.scrollLeft;
        const windowWidth = window.innerWidth;
        const isNearRightEdge = pageX > windowWidth - 20;
        const isNearLeftEdge = pageX - scrollLeft < 20;
        if (isNearRightEdge && this._canScrollRight()) {
          return "right";
        }
        if (isNearLeftEdge) {
          return "left";
        }
        return undefined;
      }
      getNewVerticalScrollDirection(pageY) {
        const scrollTop = this.container.scrollTop;
        const distanceTop = pageY - scrollTop;
        if (distanceTop < 20) {
          return "top";
        }
        const windowHeight = window.innerHeight;
        if (windowHeight - (pageY - scrollTop) < 20 && this._canScrollDown()) {
          return "bottom";
        }
        return undefined;
      }
      _canScrollDown() {
        return this.container.scrollTop + this.container.clientHeight < this._getDocumentScrollHeight();
      }
      _canScrollRight() {
        return this.container.scrollLeft + this.container.clientWidth < this._getDocumentScrollWidth();
      }
      _getDocumentScrollHeight() {
        // Store the original scroll height because the scroll height can increase when the drag element is moved beyond the scroll height.
        this._documentScrollHeight ??= this.container.scrollHeight;
        return this._documentScrollHeight;
      }
      _getDocumentScrollWidth() {
        // Store the original scroll width because the scroll width can increase when the drag element is moved beyond the scroll width.
        this._documentScrollWidth ??= this.container.scrollWidth;
        return this._documentScrollWidth;
      }
    }

    const isOverflow = overflowValue => overflowValue === "auto" || overflowValue === "scroll";
    const hasOverFlow = element => {
      const style = getComputedStyle(element);
      return isOverflow(style.overflowX) || isOverflow(style.overflowY);
    };
    const getParentWithOverflow = treeElement => {
      if (hasOverFlow(treeElement)) {
        return treeElement;
      }
      let parent = treeElement.parentElement;
      while (parent) {
        if (hasOverFlow(parent)) {
          return parent;
        }
        parent = parent.parentElement;
      }
      return null;
    };
    const createScrollParent = (treeElement, refreshHitAreas) => {
      const container = getParentWithOverflow(treeElement);
      if (container && container.tagName !== "HTML") {
        return new ContainerScrollParent({
          container,
          refreshHitAreas
        });
      } else {
        return new DocumentScrollParent({
          refreshHitAreas,
          treeElement
        });
      }
    };

    class ScrollHandler {
      _refreshHitAreas;
      _scrollParent;
      _treeElement;
      constructor({
        refreshHitAreas,
        treeElement
      }) {
        this._refreshHitAreas = refreshHitAreas;
        this._scrollParent = undefined;
        this._treeElement = treeElement;
      }
      checkScrolling(positionInfo) {
        this._checkVerticalScrolling(positionInfo);
        this._checkHorizontalScrolling(positionInfo);
      }
      getScrollLeft() {
        return this._getScrollParent().getScrollLeft();
      }
      scrollToY(top) {
        this._getScrollParent().scrollToY(top);
      }
      stopScrolling() {
        this._getScrollParent().stopScrolling();
      }
      _checkHorizontalScrolling(positionInfo) {
        this._getScrollParent().checkHorizontalScrolling(positionInfo.pageX);
      }
      _checkVerticalScrolling(positionInfo) {
        this._getScrollParent().checkVerticalScrolling(positionInfo.pageY);
      }
      _getScrollParent() {
        this._scrollParent ??= createScrollParent(this._treeElement, this._refreshHitAreas);
        return this._scrollParent;
      }
    }

    class SelectNodeHandler {
      _getNodeById;
      _selectedNodes;
      _selectedSingleNode;
      constructor({
        getNodeById
      }) {
        this._getNodeById = getNodeById;
        this._selectedNodes = new Set();
        this.clear();
      }
      addToSelection(node) {
        if (node.id != null) {
          this._selectedNodes.add(node.id);
        } else {
          this._selectedSingleNode = node;
        }
      }
      clear() {
        this._selectedNodes.clear();
        this._selectedSingleNode = null;
      }
      getSelectedNode() {
        const selectedNodes = this.getSelectedNodes();
        if (selectedNodes.length) {
          return selectedNodes[0] ?? false;
        } else {
          return false;
        }
      }
      getSelectedNodes() {
        if (this._selectedSingleNode) {
          return [this._selectedSingleNode];
        } else {
          const selectedNodes = [];
          this._selectedNodes.forEach(id => {
            const node = this._getNodeById(id);
            if (node) {
              selectedNodes.push(node);
            }
          });
          return selectedNodes;
        }
      }
      getSelectedNodesUnder(parent) {
        if (this._selectedSingleNode) {
          if (parent.isParentOf(this._selectedSingleNode)) {
            return [this._selectedSingleNode];
          } else {
            return [];
          }
        } else {
          const selectedNodes = [];
          this._selectedNodes.forEach(id => {
            const node = this._getNodeById(id);
            if (node && parent.isParentOf(node)) {
              selectedNodes.push(node);
            }
          });
          return selectedNodes;
        }
      }
      isNodeSelected(node) {
        if (node.id != null) {
          return this._selectedNodes.has(node.id);
        } else if (this._selectedSingleNode) {
          return this._selectedSingleNode.element === node.element;
        } else {
          return false;
        }
      }
      removeFromSelection(node, includeChildren = false) {
        if (node.id == null) {
          if (this._selectedSingleNode && node.element === this._selectedSingleNode.element) {
            this._selectedSingleNode = null;
          }
        } else {
          this._selectedNodes.delete(node.id);
          if (includeChildren) {
            node.iterate(() => {
              if (node.id != null) {
                this._selectedNodes.delete(node.id);
              }
              return true;
            });
          }
        }
      }
    }

    const register = (widgetClass, widgetName) => {
      const getDataKey = () => `simple_widget_${widgetName}`;
      const getWidgetData = (el, dataKey) => {
        const widget = jQuery.data(el, dataKey);
        if (widget && widget instanceof SimpleWidget) {
          return widget;
        } else {
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
      const destroyWidget = $el => {
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
        } else if (typeof argument1 === "object") {
          const options = argument1;
          return createWidget(this, options);
        } else if (typeof argument1 === "string" && argument1[0] !== "_") {
          const functionName = argument1;
          if (argument1 === "destroy") {
            destroyWidget(this);
            return undefined;
          } else {
            return callFunction(this, functionName, args);
          }
        } else {
          return undefined;
        }
      };
    };
    class SimpleWidget {
      static defaults = {};
      $el;
      options;
      constructor(el, options) {
        this.$el = jQuery(el);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const defaults = this.constructor.defaults;
        this.options = {
          ...defaults,
          ...options
        };
      }
      static register(widgetClass, widgetName) {
        register(widgetClass, widgetName);
      }
      deinit() {
        //
      }
      destroy() {
        this.deinit();
      }
      init() {
        //
      }
    }

    const version = "1.9.0";

    const NODE_PARAM_IS_EMPTY = "Node parameter is empty";
    const PARAM_IS_EMPTY = "Parameter is empty: ";
    class JqTreeWidget extends SimpleWidget {
      static defaults = {
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
        nodeClass: Node,
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
      };
      _dataLoader;
      _dndHandler;
      _element;
      _htmlElement;
      _isInitialized;
      _keyHandler;
      _mouseHandler;
      _renderer;
      _saveStateHandler;
      _scrollHandler;
      _selectNodeHandler;
      _tree;
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
      addToSelection(node, mustSetFocus) {
        if (!node) {
          throw Error(NODE_PARAM_IS_EMPTY);
        }
        this._selectNodeHandler.addToSelection(node);
        this._openParents(node);
        this._getNodeElementForNode(node).select(mustSetFocus ?? true);
        this._saveState();
        return this._element;
      }
      appendNode(newNodeInfo, parentNodeParam) {
        const parentNode = parentNodeParam ?? this._tree;
        const node = parentNode.append(newNodeInfo);
        this._refreshElements(parentNode);
        return node;
      }
      closeNode(node, slideParam) {
        if (!node) {
          throw Error(NODE_PARAM_IS_EMPTY);
        }
        const slide = slideParam ?? this.options.slide;
        if (node.isFolder() || node.isEmptyFolder) {
          this._createFolderElement(node).close(slide, this.options.animationSpeed);
          this._saveState();
        }
        return this._element;
      }
      deinit() {
        this._htmlElement.textContent = "";
        this._element.off();
        this._keyHandler.deinit();
        this._mouseHandler.deinit();
        this._tree = new Node({}, true);
        super.deinit();
      }
      getNodeByCallback(callback) {
        return this._tree.getNodeByCallback(callback);
      }
      getNodeByHtmlElement(inputElement) {
        const element = inputElement instanceof HTMLElement ? inputElement : inputElement.get(0);
        if (!element) {
          return null;
        }
        return this._getNode(element);
      }
      getNodeById(nodeId) {
        return this._tree.getNodeById(nodeId);
      }
      getNodeByName(name) {
        return this._tree.getNodeByName(name);
      }
      getNodeByNameMustExist(name) {
        return this._tree.getNodeByNameMustExist(name);
      }
      getNodesByProperty(key, value) {
        return this._tree.getNodesByProperty(key, value);
      }
      getSelectedNode() {
        return this._selectNodeHandler.getSelectedNode();
      }
      getSelectedNodes() {
        return this._selectNodeHandler.getSelectedNodes();
      }
      getState() {
        return this._saveStateHandler.getState();
      }
      getStateFromStorage() {
        return this._saveStateHandler.getStateFromStorage();
      }
      getTree() {
        return this._tree;
      }
      getVersion() {
        return version;
      }
      init() {
        super.init();
        this._element = this.$el;
        this._htmlElement = this._element.get(0);
        this._isInitialized = false;
        this.options.dataUrl ??= this._element.data("url");
        const dataRtl = this._element.data("rtl");
        this.options.rtl ??= dataRtl === '' ? true : Boolean(dataRtl);
        this.options.closedIcon ??= this._getDefaultClosedIcon();
        this._connectHandlers();
        this._initData();
      }
      isDragging() {
        return this._dndHandler.isDragging;
      }
      isNodeSelected(node) {
        if (!node) {
          throw Error(NODE_PARAM_IS_EMPTY);
        }
        return this._selectNodeHandler.isNodeSelected(node);
      }
      loadData(data, parentNode) {
        this._doLoadData(data, parentNode);
        return this._element;
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
          this._doLoadDataFromUrl(param1, param2, param3 ?? null);
        } else {
          // first parameter is not url
          this._doLoadDataFromUrl(null, param1, param2);
        }
        return this._element;
      }
      moveDown() {
        const selectedNode = this.getSelectedNode();
        if (selectedNode) {
          this._keyHandler.moveDown(selectedNode);
        }
        return this._element;
      }
      moveNode(node, targetNode, position) {
        if (!node) {
          throw Error(NODE_PARAM_IS_EMPTY);
        }
        if (!targetNode) {
          throw Error(PARAM_IS_EMPTY + "targetNode");
        }
        if (!position) {
          throw Error(PARAM_IS_EMPTY + "position");
        }
        this._tree.moveNode(node, targetNode, position);
        this._refreshElements(null);
        return this._element;
      }
      moveUp() {
        const selectedNode = this.getSelectedNode();
        if (selectedNode) {
          this._keyHandler.moveUp(selectedNode);
        }
        return this._element;
      }
      openNode(node, param1, param2) {
        if (!node) {
          throw Error(NODE_PARAM_IS_EMPTY);
        }
        const parseParams = () => {
          let onFinished;
          let slide;
          if (typeof param1 === "function") {
            onFinished = param1;
            slide = null;
          } else {
            slide = param1;
            onFinished = param2;
          }
          slide ??= this.options.slide;
          return [slide, onFinished];
        };
        const [slide, onFinished] = parseParams();
        this._openNodeInternal(node, slide, onFinished);
        return this._element;
      }
      prependNode(newNodeInfo, parentNodeParam) {
        const parentNode = parentNodeParam ?? this._tree;
        const node = parentNode.prepend(newNodeInfo);
        this._refreshElements(parentNode);
        return node;
      }
      refresh() {
        this._refreshElements(null);
        return this._element;
      }
      reload(onFinished) {
        this._doLoadDataFromUrl(null, null, onFinished);
        return this._element;
      }
      removeFromSelection(node) {
        if (!node) {
          throw Error(NODE_PARAM_IS_EMPTY);
        }
        this._selectNodeHandler.removeFromSelection(node);
        this._getNodeElementForNode(node).deselect();
        this._saveState();
        return this._element;
      }
      removeNode(node) {
        if (!node) {
          throw Error(NODE_PARAM_IS_EMPTY);
        }
        if (!node.parent) {
          throw Error("Node has no parent");
        }
        this._selectNodeHandler.removeFromSelection(node, true); // including children

        const parent = node.parent;
        node.remove();
        this._refreshElements(parent);
        return this._element;
      }
      scrollToNode(node) {
        if (!node) {
          throw Error(NODE_PARAM_IS_EMPTY);
        }
        if (!node.element) {
          return this._element;
        }
        const top = getOffsetTop(node.element) - getOffsetTop(this._htmlElement);
        this._scrollHandler.scrollToY(top);
        return this._element;
      }
      selectNode(node, optionsParam) {
        this._doSelectNode(node, optionsParam);
        return this._element;
      }
      setOption(option, value) {
        this.options[option] = value;
        return this._element;
      }
      setState(state) {
        if (state) {
          this._saveStateHandler.setInitialState(state);
          this._refreshElements(null);
        }
        return this._element;
      }
      toggle(node, slideParam = null) {
        if (!node) {
          throw Error(NODE_PARAM_IS_EMPTY);
        }
        const slide = slideParam ?? this.options.slide;
        if (node.is_open) {
          this.closeNode(node, slide);
        } else {
          this.openNode(node, slide);
        }
        return this._element;
      }
      toJson() {
        return JSON.stringify(this._tree.getData());
      }
      updateNode(node, data) {
        if (!node) {
          throw Error(NODE_PARAM_IS_EMPTY);
        }
        if (!data) {
          return this._element;
        }
        const idIsChanged = typeof data === "object" && data.id && data.id !== node.id;
        if (idIsChanged) {
          this._tree.removeNodeFromIndex(node);
        }
        node.setData(data);
        if (idIsChanged) {
          this._tree.addNodeToIndex(node);
        }
        if (typeof data === "object" && data.children && data.children instanceof Array) {
          node.removeChildren();
          if (data.children.length) {
            node.loadFromData(data.children);
          }
        }
        this._refreshElements(node);
        return this._element;
      }
      _connectHandlers() {
        const {
          autoEscape,
          buttonLeft,
          closedIcon,
          dataFilter,
          dragAndDrop,
          keyboardSupport,
          onCanMove,
          onCanMoveTo,
          onCreateLi,
          onDragMove,
          onDragStop,
          onGetStateFromStorage,
          onIsMoveHandle,
          onLoadFailed,
          onLoading,
          onSetStateFromStorage,
          openedIcon,
          openFolderDelay,
          rtl,
          saveState,
          showEmptyFolder,
          slide,
          tabIndex
        } = this.options;
        const closeNode = this.closeNode.bind(this);
        const getNodeElement = this._getNodeElement.bind(this);
        const getNodeElementForNode = this._getNodeElementForNode.bind(this);
        const getNodeById = this.getNodeById.bind(this);
        const getSelectedNode = this.getSelectedNode.bind(this);
        const getTree = this.getTree.bind(this);
        const isFocusOnTree = this._isFocusOnTree.bind(this);
        const loadData = this.loadData.bind(this);
        const openNode = this._openNodeInternal.bind(this);
        const refreshElements = this._refreshElements.bind(this);
        const selectNode = this.selectNode.bind(this);
        const treeElement = this._htmlElement;
        const triggerEvent = this._triggerEvent.bind(this);
        const selectNodeHandler = new SelectNodeHandler({
          getNodeById
        });
        const addToSelection = selectNodeHandler.addToSelection.bind(selectNodeHandler);
        const getSelectedNodes = selectNodeHandler.getSelectedNodes.bind(selectNodeHandler);
        const isNodeSelected = selectNodeHandler.isNodeSelected.bind(selectNodeHandler);
        const removeFromSelection = selectNodeHandler.removeFromSelection.bind(selectNodeHandler);
        const getMouseDelay = () => this.options.startDndDelay ?? 0;
        const refreshHitAreas = () => {
          dndHandler.refresh();
        };
        const dataLoader = new DataLoader({
          dataFilter,
          loadData,
          onLoadFailed,
          onLoading,
          treeElement,
          triggerEvent
        });
        const saveStateHandler = new SaveStateHandler({
          addToSelection,
          getNodeById,
          getSelectedNodes,
          getTree,
          onGetStateFromStorage,
          onSetStateFromStorage,
          openNode,
          refreshElements,
          removeFromSelection,
          saveState
        });
        const scrollHandler = new ScrollHandler({
          refreshHitAreas,
          treeElement
        });
        const getScrollLeft = scrollHandler.getScrollLeft.bind(scrollHandler);
        const dndHandler = new DragAndDropHandler({
          autoEscape,
          getNodeElement,
          getNodeElementForNode,
          getScrollLeft,
          getTree,
          onCanMove,
          onCanMoveTo,
          onDragMove,
          onDragStop,
          onIsMoveHandle,
          openFolderDelay,
          openNode,
          refreshElements,
          slide,
          treeElement,
          triggerEvent
        });
        const keyHandler = new KeyHandler({
          closeNode,
          getSelectedNode,
          isFocusOnTree,
          keyboardSupport,
          openNode,
          selectNode
        });
        const renderer = new ElementsRenderer({
          autoEscape,
          buttonLeft,
          closedIcon,
          dragAndDrop,
          getTree,
          htmlElement: treeElement,
          isNodeSelected,
          onCreateLi,
          openedIcon,
          rtl,
          showEmptyFolder,
          tabIndex
        });
        const getNode = this._getNode.bind(this);
        const onMouseCapture = this._mouseCapture.bind(this);
        const onMouseDrag = this._mouseDrag.bind(this);
        const onMouseStart = this._mouseStart.bind(this);
        const onMouseStop = this._mouseStop.bind(this);
        const mouseHandler = new MouseHandler({
          element: treeElement,
          getMouseDelay,
          getNode,
          onClickButton: this.toggle.bind(this),
          onClickTitle: this._doSelectNode.bind(this),
          onMouseCapture,
          onMouseDrag,
          onMouseStart,
          onMouseStop,
          triggerEvent,
          useContextMenu: this.options.useContextMenu
        });
        this._dataLoader = dataLoader;
        this._dndHandler = dndHandler;
        this._keyHandler = keyHandler;
        this._mouseHandler = mouseHandler;
        this._renderer = renderer;
        this._saveStateHandler = saveStateHandler;
        this._scrollHandler = scrollHandler;
        this._selectNodeHandler = selectNodeHandler;
      }
      _containsElement(element) {
        const node = this._getNode(element);
        return node?.tree === this._tree;
      }
      _createFolderElement(node) {
        const closedIconElement = this._renderer.closedIconElement;
        const getScrollLeft = this._scrollHandler.getScrollLeft.bind(this._scrollHandler);
        const openedIconElement = this._renderer.openedIconElement;
        const tabIndex = this.options.tabIndex;
        const triggerEvent = this._triggerEvent.bind(this);
        return new FolderElement({
          closedIconElement,
          getScrollLeft,
          node,
          openedIconElement,
          tabIndex,
          treeElement: this._htmlElement,
          triggerEvent
        });
      }
      _createNodeElement(node) {
        const getScrollLeft = this._scrollHandler.getScrollLeft.bind(this._scrollHandler);
        const tabIndex = this.options.tabIndex;
        return new NodeElement({
          getScrollLeft,
          node,
          tabIndex,
          treeElement: this._htmlElement
        });
      }
      _deselectCurrentNode() {
        const node = this.getSelectedNode();
        if (node) {
          this.removeFromSelection(node);
        }
      }
      _deselectNodes(parentNode) {
        const selectedNodesUnderParent = this._selectNodeHandler.getSelectedNodesUnder(parentNode);
        for (const n of selectedNodesUnderParent) {
          this._selectNodeHandler.removeFromSelection(n);
        }
      }
      _doLoadData(data, parentNode) {
        if (data) {
          if (parentNode) {
            this._deselectNodes(parentNode);
            this._loadSubtree(data, parentNode);
          } else {
            this._initTree(data);
          }
          if (this.isDragging()) {
            this._dndHandler.refresh();
          }
        }
        this._triggerEvent("tree.load_data", {
          parent_node: parentNode,
          tree_data: data
        });
      }
      _doLoadDataFromUrl(urlInfoParam, parentNode, onFinished) {
        const urlInfo = urlInfoParam ?? this._getDataUrlInfo(parentNode);
        this._dataLoader.loadFromUrl(urlInfo, parentNode, onFinished);
      }
      _doSelectNode(node, optionsParam) {
        const saveState = () => {
          if (this.options.saveState) {
            this._saveStateHandler.saveState();
          }
        };
        if (!node) {
          // Called with empty node -> deselect current node
          this._deselectCurrentNode();
          saveState();
          return;
        }
        const defaultOptions = {
          mustSetFocus: true,
          mustToggle: true
        };
        const selectOptions = {
          ...defaultOptions,
          ...(optionsParam ?? {})
        };
        const canSelect = () => {
          if (this.options.onCanSelectNode) {
            return this.options.selectable && this.options.onCanSelectNode(node);
          } else {
            return this.options.selectable;
          }
        };
        if (!canSelect()) {
          return;
        }
        if (this._selectNodeHandler.isNodeSelected(node)) {
          if (selectOptions.mustToggle) {
            this._deselectCurrentNode();
            this._triggerEvent("tree.select", {
              node: null,
              previous_node: node
            });
          }
        } else {
          const deselectedNode = this.getSelectedNode() || null;
          this._deselectCurrentNode();
          this.addToSelection(node, selectOptions.mustSetFocus);
          this._triggerEvent("tree.select", {
            deselected_node: deselectedNode,
            node
          });
          this._openParents(node);
        }
        saveState();
      }
      _getAutoOpenMaxLevel() {
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
      _getDataUrlInfo(node) {
        const getUrlFromString = url => {
          const urlInfo = {
            url
          };
          setUrlInfoData(urlInfo);
          return urlInfo;
        };
        const setUrlInfoData = urlInfo => {
          if (node?.id) {
            // Load on demand of a subtree; add node parameter
            const data = {
              node: node.id
            };
            urlInfo.data = data;
          } else {
            // Add selected_node parameter
            const selectedNodeId = this._getNodeIdToBeSelected();
            if (selectedNodeId) {
              const data = {
                selected_node: selectedNodeId
              };
              urlInfo.data = data;
            }
          }
        };
        const dataUrl = this.options.dataUrl;
        if (typeof dataUrl === "function") {
          return dataUrl(node);
        } else if (typeof dataUrl === "string") {
          return getUrlFromString(dataUrl);
        } else if (dataUrl && typeof dataUrl === "object") {
          setUrlInfoData(dataUrl);
          return dataUrl;
        } else {
          return null;
        }
      }
      _getDefaultClosedIcon() {
        if (this.options.rtl) {
          // triangle to the left
          return "&#x25c0;";
        } else {
          // triangle to the right
          return "&#x25ba;";
        }
      }
      _getNode(element) {
        const liElement = element.closest("li.jqtree_common");
        if (liElement) {
          return jQuery(liElement).data("node");
        } else {
          return null;
        }
      }
      _getNodeElement(element) {
        const node = this._getNode(element);
        if (node) {
          return this._getNodeElementForNode(node);
        } else {
          return null;
        }
      }
      _getNodeElementForNode(node) {
        if (node.isFolder()) {
          return this._createFolderElement(node);
        } else {
          return this._createNodeElement(node);
        }
      }
      _getNodeIdToBeSelected() {
        if (this.options.saveState) {
          return this._saveStateHandler.getNodeIdToBeSelected();
        } else {
          return null;
        }
      }
      _initData() {
        if (this.options.data) {
          this._doLoadData(this.options.data, null);
        } else {
          const dataUrl = this._getDataUrlInfo(null);
          if (dataUrl) {
            this._doLoadDataFromUrl(null, null, null);
          } else {
            this._doLoadData([], null);
          }
        }
      }
      _initTree(data) {
        const doInit = () => {
          if (!this._isInitialized) {
            this._isInitialized = true;
            this._triggerEvent("tree.init");
          }
        };
        this._tree = new this.options.nodeClass(null, true, this.options.nodeClass);
        this._selectNodeHandler.clear();
        this._tree.loadFromData(data);
        const mustLoadOnDemand = this._setInitialState();
        this._refreshElements(null);
        if (!mustLoadOnDemand) {
          doInit();
        } else {
          // Load data on demand and then init the tree
          this._setInitialStateOnDemand(doInit);
        }
      }
      _isFocusOnTree() {
        const activeElement = document.activeElement;
        return activeElement?.tagName === "SPAN" && this._containsElement(activeElement);
      }
      _isSelectedNodeInSubtree(subtree) {
        const selectedNode = this.getSelectedNode();
        if (!selectedNode) {
          return false;
        } else {
          return subtree === selectedNode || subtree.isParentOf(selectedNode);
        }
      }
      _loadFolderOnDemand(node, slide = true, onFinished) {
        node.is_loading = true;
        this._doLoadDataFromUrl(null, node, () => {
          this._openNodeInternal(node, slide, onFinished);
        });
      }
      _loadSubtree(data, parentNode) {
        parentNode.loadFromData(data);
        parentNode.load_on_demand = false;
        parentNode.is_loading = false;
        this._refreshElements(parentNode);
      }
      _mouseCapture(positionInfo) {
        if (this.options.dragAndDrop) {
          return this._dndHandler.mouseCapture(positionInfo);
        } else {
          return false;
        }
      }
      _mouseDrag(positionInfo) {
        if (this.options.dragAndDrop) {
          const result = this._dndHandler.mouseDrag(positionInfo);
          this._scrollHandler.checkScrolling(positionInfo);
          return result;
        } else {
          return false;
        }
      }
      _mouseStart(positionInfo) {
        if (this.options.dragAndDrop) {
          return this._dndHandler.mouseStart(positionInfo);
        } else {
          return false;
        }
      }
      _mouseStop(positionInfo) {
        if (this.options.dragAndDrop) {
          this._scrollHandler.stopScrolling();
          return this._dndHandler.mouseStop(positionInfo);
        } else {
          return false;
        }
      }
      _openNodeInternal(node, slide = true, onFinished) {
        const doOpenNode = (_node, _slide, _onFinished) => {
          if (!node.children.length) {
            return;
          }
          const folderElement = this._createFolderElement(_node);
          folderElement.open(_onFinished, _slide, this.options.animationSpeed);
        };
        if (node.isFolder() || node.isEmptyFolder) {
          if (node.load_on_demand) {
            this._loadFolderOnDemand(node, slide, onFinished);
          } else {
            let parent = node.parent;
            while (parent) {
              // nb: do not open root element
              if (parent.parent) {
                doOpenNode(parent, false);
              }
              parent = parent.parent;
            }
            doOpenNode(node, slide, onFinished);
            this._saveState();
          }
        }
      }
      _openParents(node) {
        const parent = node.parent;
        if (parent?.parent && !parent.is_open) {
          this.openNode(parent, false);
        }
      }

      /*
      Redraw the tree or part of the tree.
       from_node: redraw this subtree
      */
      _refreshElements(fromNode) {
        const mustSetFocus = this._isFocusOnTree();
        const mustSelect = fromNode ? this._isSelectedNodeInSubtree(fromNode) : false;
        this._renderer.render(fromNode);
        if (mustSelect) {
          this._selectCurrentNode(mustSetFocus);
        }
        this._triggerEvent("tree.refresh");
      }
      _saveState() {
        if (this.options.saveState) {
          this._saveStateHandler.saveState();
        }
      }
      _selectCurrentNode(mustSetFocus) {
        const node = this.getSelectedNode();
        if (node) {
          const nodeElement = this._getNodeElementForNode(node);
          nodeElement.select(mustSetFocus);
        }
      }

      // Set initial state, either by restoring the state or auto-opening nodes
      // result: must load nodes on demand?
      _setInitialState() {
        const restoreState = () => {
          // result: is state restored, must load on demand?
          if (!this.options.saveState) {
            return [false, false];
          } else {
            const state = this._saveStateHandler.getStateFromStorage();
            if (!state) {
              return [false, false];
            } else {
              const mustLoadOnDemand = this._saveStateHandler.setInitialState(state);

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
          const maxLevel = this._getAutoOpenMaxLevel();
          let mustLoadOnDemand = false;
          this._tree.iterate((node, level) => {
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
        let [isRestored, mustLoadOnDemand] = restoreState(); // eslint-disable-line prefer-const

        if (!isRestored) {
          mustLoadOnDemand = autoOpenNodes();
        }
        return mustLoadOnDemand;
      }

      // Set the initial state for nodes that are loaded on demand
      // Call cb_finished when done
      _setInitialStateOnDemand(cbFinished) {
        const restoreState = () => {
          if (!this.options.saveState) {
            return false;
          } else {
            const state = this._saveStateHandler.getStateFromStorage();
            if (!state) {
              return false;
            } else {
              this._saveStateHandler.setInitialStateOnDemand(state, cbFinished);
              return true;
            }
          }
        };
        const autoOpenNodes = () => {
          const maxLevel = this._getAutoOpenMaxLevel();
          let loadingCount = 0;
          const loadAndOpenNode = node => {
            loadingCount += 1;
            this._openNodeInternal(node, false, () => {
              loadingCount -= 1;
              openNodes();
            });
          };
          const openNodes = () => {
            this._tree.iterate((node, level) => {
              if (node.load_on_demand) {
                if (!node.is_loading) {
                  loadAndOpenNode(node);
                }
                return false;
              } else {
                this._openNodeInternal(node, false);
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
      _triggerEvent(eventName, values) {
        const event = jQuery.Event(eventName, values);
        this._element.trigger(event);
        return !event.isDefaultPrevented();
      }
    }
    SimpleWidget.register(JqTreeWidget, "tree");

    exports.JqTreeWidget = JqTreeWidget;

    return exports;

})({});
//# sourceMappingURL=tree.jquery.debug.js.map
