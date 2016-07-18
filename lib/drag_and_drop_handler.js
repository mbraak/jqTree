var $, DragAndDropHandler, DragElement, HitAreasGenerator, Position, VisibleNodeIterator, node_module, util,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

node_module = require('./node');

util = require('./util');

Position = node_module.Position;

$ = jQuery;

DragAndDropHandler = (function() {
  function DragAndDropHandler(tree_widget) {
    this.tree_widget = tree_widget;
    this.hovered_area = null;
    this.$ghost = null;
    this.hit_areas = [];
    this.is_dragging = false;
    this.current_item = null;
  }

  DragAndDropHandler.prototype.mouseCapture = function(position_info) {
    var $element, node_element;
    $element = $(position_info.target);
    if (!this.mustCaptureElement($element)) {
      return null;
    }
    if (this.tree_widget.options.onIsMoveHandle && !this.tree_widget.options.onIsMoveHandle($element)) {
      return null;
    }
    node_element = this.tree_widget._getNodeElement($element);
    if (node_element && this.tree_widget.options.onCanMove) {
      if (!this.tree_widget.options.onCanMove(node_element.node)) {
        node_element = null;
      }
    }
    this.current_item = node_element;
    return this.current_item !== null;
  };

  DragAndDropHandler.prototype.mouseStart = function(position_info) {
    var offset;
    this.refresh();
    offset = $(position_info.target).offset();
    this.drag_element = new DragElement(this.current_item.node, position_info.page_x - offset.left, position_info.page_y - offset.top, this.tree_widget.element);
    this.is_dragging = true;
    this.current_item.$element.addClass('jqtree-moving');
    return true;
  };

  DragAndDropHandler.prototype.mouseDrag = function(position_info) {
    var area, can_move_to;
    this.drag_element.move(position_info.page_x, position_info.page_y);
    area = this.findHoveredArea(position_info.page_x, position_info.page_y);
    can_move_to = this.canMoveToArea(area);
    if (can_move_to && area) {
      if (!area.node.isFolder()) {
        this.stopOpenFolderTimer();
      }
      if (this.hovered_area !== area) {
        this.hovered_area = area;
        if (this.mustOpenFolderTimer(area)) {
          this.startOpenFolderTimer(area.node);
        } else {
          this.stopOpenFolderTimer();
        }
        this.updateDropHint();
      }
    } else {
      this.removeHover();
      this.removeDropHint();
      this.stopOpenFolderTimer();
    }
    if (!area) {
      if (this.tree_widget.options.onDragMove != null) {
        this.tree_widget.options.onDragMove(this.current_item.node, position_info.original_event);
      }
    }
    return true;
  };

  DragAndDropHandler.prototype.mustCaptureElement = function($element) {
    return !$element.is('input,select');
  };

  DragAndDropHandler.prototype.canMoveToArea = function(area) {
    var position_name;
    if (!area) {
      return false;
    } else if (this.tree_widget.options.onCanMoveTo) {
      position_name = Position.getName(area.position);
      return this.tree_widget.options.onCanMoveTo(this.current_item.node, area.node, position_name);
    } else {
      return true;
    }
  };

  DragAndDropHandler.prototype.mouseStop = function(position_info) {
    var current_item;
    this.moveItem(position_info);
    this.clear();
    this.removeHover();
    this.removeDropHint();
    this.removeHitAreas();
    current_item = this.current_item;
    if (this.current_item) {
      this.current_item.$element.removeClass('jqtree-moving');
      this.current_item = null;
    }
    this.is_dragging = false;
    if (!this.hovered_area && current_item) {
      if (this.tree_widget.options.onDragStop != null) {
        this.tree_widget.options.onDragStop(current_item.node, position_info.original_event);
      }
    }
    return false;
  };

  DragAndDropHandler.prototype.refresh = function() {
    this.removeHitAreas();
    if (this.current_item) {
      this.generateHitAreas();
      this.current_item = this.tree_widget._getNodeElementForNode(this.current_item.node);
      if (this.is_dragging) {
        return this.current_item.$element.addClass('jqtree-moving');
      }
    }
  };

  DragAndDropHandler.prototype.removeHitAreas = function() {
    return this.hit_areas = [];
  };

  DragAndDropHandler.prototype.clear = function() {
    this.drag_element.remove();
    return this.drag_element = null;
  };

  DragAndDropHandler.prototype.removeDropHint = function() {
    if (this.previous_ghost) {
      return this.previous_ghost.remove();
    }
  };

  DragAndDropHandler.prototype.removeHover = function() {
    return this.hovered_area = null;
  };

  DragAndDropHandler.prototype.generateHitAreas = function() {
    var hit_areas_generator;
    hit_areas_generator = new HitAreasGenerator(this.tree_widget.tree, this.current_item.node, this.getTreeDimensions().bottom);
    return this.hit_areas = hit_areas_generator.generate();
  };

  DragAndDropHandler.prototype.findHoveredArea = function(x, y) {
    var area, dimensions, high, low, mid;
    dimensions = this.getTreeDimensions();
    if (x < dimensions.left || y < dimensions.top || x > dimensions.right || y > dimensions.bottom) {
      return null;
    }
    low = 0;
    high = this.hit_areas.length;
    while (low < high) {
      mid = (low + high) >> 1;
      area = this.hit_areas[mid];
      if (y < area.top) {
        high = mid;
      } else if (y > area.bottom) {
        low = mid + 1;
      } else {
        return area;
      }
    }
    return null;
  };

  DragAndDropHandler.prototype.mustOpenFolderTimer = function(area) {
    var node;
    node = area.node;
    return node.isFolder() && !node.is_open && area.position === Position.INSIDE;
  };

  DragAndDropHandler.prototype.updateDropHint = function() {
    var node_element;
    if (!this.hovered_area) {
      return;
    }
    this.removeDropHint();
    node_element = this.tree_widget._getNodeElementForNode(this.hovered_area.node);
    return this.previous_ghost = node_element.addDropHint(this.hovered_area.position);
  };

  DragAndDropHandler.prototype.startOpenFolderTimer = function(folder) {
    var openFolder;
    openFolder = (function(_this) {
      return function() {
        return _this.tree_widget._openNode(folder, _this.tree_widget.options.slide, function() {
          _this.refresh();
          return _this.updateDropHint();
        });
      };
    })(this);
    this.stopOpenFolderTimer();
    return this.open_folder_timer = setTimeout(openFolder, this.tree_widget.options.openFolderDelay);
  };

  DragAndDropHandler.prototype.stopOpenFolderTimer = function() {
    if (this.open_folder_timer) {
      clearTimeout(this.open_folder_timer);
      return this.open_folder_timer = null;
    }
  };

  DragAndDropHandler.prototype.moveItem = function(position_info) {
    var doMove, event, moved_node, position, previous_parent, target_node;
    if (this.hovered_area && this.hovered_area.position !== Position.NONE && this.canMoveToArea(this.hovered_area)) {
      moved_node = this.current_item.node;
      target_node = this.hovered_area.node;
      position = this.hovered_area.position;
      previous_parent = moved_node.parent;
      if (position === Position.INSIDE) {
        this.hovered_area.node.is_open = true;
      }
      doMove = (function(_this) {
        return function() {
          _this.tree_widget.tree.moveNode(moved_node, target_node, position);
          _this.tree_widget.element.empty();
          return _this.tree_widget._refreshElements();
        };
      })(this);
      event = this.tree_widget._triggerEvent('tree.move', {
        move_info: {
          moved_node: moved_node,
          target_node: target_node,
          position: Position.getName(position),
          previous_parent: previous_parent,
          do_move: doMove,
          original_event: position_info.original_event
        }
      });
      if (!event.isDefaultPrevented()) {
        return doMove();
      }
    }
  };

  DragAndDropHandler.prototype.getTreeDimensions = function() {
    var offset;
    offset = this.tree_widget.element.offset();
    return {
      left: offset.left,
      top: offset.top,
      right: offset.left + this.tree_widget.element.width(),
      bottom: offset.top + this.tree_widget.element.height() + 16
    };
  };

  return DragAndDropHandler;

})();

VisibleNodeIterator = (function() {
  function VisibleNodeIterator(tree) {
    this.tree = tree;
  }

  VisibleNodeIterator.prototype.iterate = function() {
    var _iterateNode, is_first_node;
    is_first_node = true;
    _iterateNode = (function(_this) {
      return function(node, next_node) {
        var $element, child, children_length, i, j, len, must_iterate_inside, ref;
        must_iterate_inside = (node.is_open || !node.element) && node.hasChildren();
        if (node.element) {
          $element = $(node.element);
          if (!$element.is(':visible')) {
            return;
          }
          if (is_first_node) {
            _this.handleFirstNode(node, $element);
            is_first_node = false;
          }
          if (!node.hasChildren()) {
            _this.handleNode(node, next_node, $element);
          } else if (node.is_open) {
            if (!_this.handleOpenFolder(node, $element)) {
              must_iterate_inside = false;
            }
          } else {
            _this.handleClosedFolder(node, next_node, $element);
          }
        }
        if (must_iterate_inside) {
          children_length = node.children.length;
          ref = node.children;
          for (i = j = 0, len = ref.length; j < len; i = ++j) {
            child = ref[i];
            if (i === (children_length - 1)) {
              _iterateNode(node.children[i], null);
            } else {
              _iterateNode(node.children[i], node.children[i + 1]);
            }
          }
          if (node.is_open) {
            return _this.handleAfterOpenFolder(node, next_node, $element);
          }
        }
      };
    })(this);
    return _iterateNode(this.tree, null);
  };

  VisibleNodeIterator.prototype.handleNode = function(node, next_node, $element) {};

  VisibleNodeIterator.prototype.handleOpenFolder = function(node, $element) {};

  VisibleNodeIterator.prototype.handleClosedFolder = function(node, next_node, $element) {};

  VisibleNodeIterator.prototype.handleAfterOpenFolder = function(node, next_node, $element) {};

  VisibleNodeIterator.prototype.handleFirstNode = function(node, $element) {};

  return VisibleNodeIterator;

})();

HitAreasGenerator = (function(superClass) {
  extend(HitAreasGenerator, superClass);

  function HitAreasGenerator(tree, current_node, tree_bottom) {
    HitAreasGenerator.__super__.constructor.call(this, tree);
    this.current_node = current_node;
    this.tree_bottom = tree_bottom;
  }

  HitAreasGenerator.prototype.generate = function() {
    this.positions = [];
    this.last_top = 0;
    this.iterate();
    return this.generateHitAreas(this.positions);
  };

  HitAreasGenerator.prototype.getTop = function($element) {
    return $element.offset().top;
  };

  HitAreasGenerator.prototype.addPosition = function(node, position, top) {
    var area;
    area = {
      top: top,
      node: node,
      position: position
    };
    this.positions.push(area);
    return this.last_top = top;
  };

  HitAreasGenerator.prototype.handleNode = function(node, next_node, $element) {
    var top;
    top = this.getTop($element);
    if (node === this.current_node) {
      this.addPosition(node, Position.NONE, top);
    } else {
      this.addPosition(node, Position.INSIDE, top);
    }
    if (next_node === this.current_node || node === this.current_node) {
      return this.addPosition(node, Position.NONE, top);
    } else {
      return this.addPosition(node, Position.AFTER, top);
    }
  };

  HitAreasGenerator.prototype.handleOpenFolder = function(node, $element) {
    if (node === this.current_node) {
      return false;
    }
    if (node.children[0] !== this.current_node) {
      this.addPosition(node, Position.INSIDE, this.getTop($element));
    }
    return true;
  };

  HitAreasGenerator.prototype.handleClosedFolder = function(node, next_node, $element) {
    var top;
    top = this.getTop($element);
    if (node === this.current_node) {
      return this.addPosition(node, Position.NONE, top);
    } else {
      this.addPosition(node, Position.INSIDE, top);
      if (next_node !== this.current_node) {
        return this.addPosition(node, Position.AFTER, top);
      }
    }
  };

  HitAreasGenerator.prototype.handleFirstNode = function(node, $element) {
    if (node !== this.current_node) {
      return this.addPosition(node, Position.BEFORE, this.getTop($(node.element)));
    }
  };

  HitAreasGenerator.prototype.handleAfterOpenFolder = function(node, next_node, $element) {
    if (node === this.current_node.node || next_node === this.current_node.node) {
      return this.addPosition(node, Position.NONE, this.last_top);
    } else {
      return this.addPosition(node, Position.AFTER, this.last_top);
    }
  };

  HitAreasGenerator.prototype.generateHitAreas = function(positions) {
    var group, hit_areas, j, len, position, previous_top;
    previous_top = -1;
    group = [];
    hit_areas = [];
    for (j = 0, len = positions.length; j < len; j++) {
      position = positions[j];
      if (position.top !== previous_top && group.length) {
        if (group.length) {
          this.generateHitAreasForGroup(hit_areas, group, previous_top, position.top);
        }
        previous_top = position.top;
        group = [];
      }
      group.push(position);
    }
    this.generateHitAreasForGroup(hit_areas, group, previous_top, this.tree_bottom);
    return hit_areas;
  };

  HitAreasGenerator.prototype.generateHitAreasForGroup = function(hit_areas, positions_in_group, top, bottom) {
    var area_height, area_top, i, position, position_count;
    position_count = Math.min(positions_in_group.length, 4);
    area_height = Math.round((bottom - top) / position_count);
    area_top = top;
    i = 0;
    while (i < position_count) {
      position = positions_in_group[i];
      hit_areas.push({
        top: area_top,
        bottom: area_top + area_height,
        node: position.node,
        position: position.position
      });
      area_top += area_height;
      i += 1;
    }
    return null;
  };

  return HitAreasGenerator;

})(VisibleNodeIterator);

DragElement = (function() {
  function DragElement(node, offset_x, offset_y, $tree) {
    var node_name;
    this.offset_x = offset_x;
    this.offset_y = offset_y;
    node_name = util.html_escape(node.name);
    this.$element = $("<span class=\"jqtree-title jqtree-dragging\">" + node_name + "</span>");
    this.$element.css("position", "absolute");
    $tree.append(this.$element);
  }

  DragElement.prototype.move = function(page_x, page_y) {
    return this.$element.offset({
      left: page_x - this.offset_x,
      top: page_y - this.offset_y
    });
  };

  DragElement.prototype.remove = function() {
    return this.$element.remove();
  };

  return DragElement;

})();

module.exports = {
  DragAndDropHandler: DragAndDropHandler,
  DragElement: DragElement,
  HitAreasGenerator: HitAreasGenerator
};
