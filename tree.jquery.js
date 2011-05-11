// todo: bigger area for opening folder while moving
// todo: check for invalid move
// todo: drag handle
// todo: display move hint
// todo: move event
// todo: click event
// todo: variables must start with _?
// todo: speed up hit detection; perhaps use a treshold; or better algorithm
// todo: change cursor for moving / over node that can be moved
// todo: easier (alternative) syntax for input json data (string instead of 'label', array instead of 'children')
// todo: extra data in input json data
// todo: use jqueryui icons for folder triangles
// todo: use extra span for folder icon
// todo: github demo page
// todo: unit test
// todo: documentation
// todo: click are for toggling folder

(function($) {
    $.widget("ui.tree", $.ui.mouse, {
        widgetEventPrefix: "tree",
        options: {
            autoOpen: false,  // true / false / int (open n levels starting at 0)
            displayTestNodes: false
        },

        _create: function() {
            this.tree = Tree.createFromData(this.options.data);
            this._openNodes();

            this._createDomElements(this.tree);
            this.element.click($.proxy(this._click, this));
            this._mouseInit();

            this.hovered_rectangle = null;
            this.$ghost = null;
            this.hint_nodes = [];
        },

        destroy: function() {
            this._mouseDestroy();
            return this;
        },

        _createDomElements: function(tree) {
            function createUl(depth, is_open) {
                var classes = [];
                if (! depth) {
                    classes.push('tree');
                }
                else {
                    classes.push('folder');
                    if (! is_open) {
                        classes.push('closed');
                    }
                }

                var $element = $('<ul />');
                $element.addClass(classes.join(' '));
                return $element;
            }

            function createLi(name, has_children, is_open) {
                var span_classes = [];
                if (! has_children) {
                    span_classes.push('node');
                }
                else {
                    span_classes.push('folder');

                    if (! is_open) {
                        span_classes.push('closed');
                    }
                }

                var $li = $('<li><span class="'+ span_classes.join(' ') +'">'+ name +'</span></li>');

                if (has_children) {
                    var folder_classes = ['folder'];
                    if (! is_open) {
                        folder_classes.push('closed');
                    }
                    $li.addClass(folder_classes.join(' '));
                }

                return $li;
            }

            function doCreateDomElements($element, children, depth, is_open) {
                var ul = createUl(depth, is_open);
                $element.append(ul);

                $.each(children, function() {
                    var $li = createLi(this.name, this.hasChildren(), this.is_open);
                    ul.append($li);

                    this.element = $li[0];
                    $li.data('node', this);

                    if (this.hasChildren()) {
                        doCreateDomElements($li, this.children, depth + 1, this.is_open);
                    }
                });
            }

            doCreateDomElements(this.element, tree.children, 0, true);
        },

        _click: function(e) {
            var nodeElement = this._getNodeElement($(e.srcElement));
            if (nodeElement && (nodeElement.node.hasChildren())) {
                nodeElement.toggle();

                e.preventDefault();
                e.stopPropagation();
            }
        },

        _getNode: function($element) {
            var $li = $element.closest('li');
            if ($li.length == 0) {
                return null;
            }
            else {
                return $li.data('node');
            }
        },

        _getNodeElement: function($element) {
            var node = this._getNode($element);
            if (node) {
                return this._getNodeElementForNode(node);
            }
            else {
                return null;
            }
        },

        _getNodeElementForNode: function(node) {
            if (node.hasChildren()) {
                return new FolderElement(node);
            }
            else {
                return new NodeElement(node);
            }
        },

        _mouseCapture: function(event) {
            this.current_item = this._getNodeElement($(event.srcElement));

            return (this.current_item != null);
        },

        _mouseStart: function(event) {
            var $element = this.current_item.$element;

            //The element's absolute position on the page minus margins
            var offset = $element.offset();

            this.offset = {
                top: offset.top - (parseInt($element.css("marginTop"), 10) || 0),
                left: offset.left - (parseInt($element.css("marginLeft"), 10) || 0)
            };

            $.extend(this.offset, {
                //Where the click happened, relative to the element
                click: {
                    left: event.pageX - this.offset.left,
                    top: event.pageY - this.offset.top
                }
            });

            $element.hide();

            this._refreshHitAreas();

            //Create and append the visible helper
            this.helper = this._createHelper();
            return true;
        },

        _mouseDrag: function(event) {
            //Compute the helpers position
            this.position = this._generatePosition(event);
            this.positionAbs = this.position;
            this.helper.offset(this.position);

            var self = this;
            var hovered_rectangle = null;
            $.each(this.hit_areas, function() {
                if (
                    (self._intersectsWithPointer(this)) &&
                    (! hovered_rectangle)
                ) {
                    hovered_rectangle = this;
                }
            });

            var cursor = this.helper.offset();
            cursor.right = cursor.left + this.current_item.$element.outerWidth();
            cursor.bottom = cursor.top + this.current_item.$element.outerHeight();

            if (! hovered_rectangle) {
                this._removeGhost();
                this._removeHover();
                this._stopOpenFolderTimer();
            }
            else {
                if (this.hovered_rectangle != hovered_rectangle) {
                    this.hovered_rectangle = hovered_rectangle;

                    var $ghost = this._getGhost();
                    $ghost.detach();

                    this._stopOpenFolderTimer();
                    var node = this.hovered_rectangle.node;

                    if (node.hasChildren() && !node.is_open) {
                        this._startOpenFolderTimer(node);
                    }
                    else {
                        this._getNodeElementForNode(hovered_rectangle.node)
                            .appendGhost($ghost, hovered_rectangle.move_to);
                    }
                }
            }

            return true;
        },

        _mouseStop: function() {
            this._moveItem();
            this._clear();
            this._removeHover();
            this._removeGhost();
            this._removeHintNodes();

            this.current_item.$element.show();
            return false;
        },

        _getGhost: function() {
             if (! this.$ghost) {
                this.$ghost = this.current_item.createGhost();
                this.element.append(this.$ghost);
            }
            return this.$ghost;
        },

        _moveItem: function() {
            if (this.hovered_rectangle) {
                this.tree.moveNode(
                    this.current_item.node,
                    this.hovered_rectangle.node,
                    this.hovered_rectangle.move_to
                );

                if (this.hovered_rectangle.move_to == Position.INSIDE) {
                    this.hovered_rectangle.node.is_open = true;
                }
            }

            this.element.empty();
            this._createDomElements(this.tree);
        },

        _createHelper: function() {
            var $helper = this.current_item.createHelper();
            $helper.css("position", "absolute");
            this.element.append($helper);
            return $helper;
        },

        _clear: function() {
            this.helper.remove();
            this.helper = null;
        },

        _generatePosition: function(event) {
            return {
                left: event.pageX - this.offset.click.left,
                top: event.pageY - this.offset.click.top
            };
        },

        _intersectsWithPointer: function(item) {
            var offset = this.helper.offset();

            var r1 = {
                left: offset.left,
                top: offset.top,
                right: offset.left + this.current_item.$element.outerWidth(),
                bottom: offset.top + this.current_item.$element.outerHeight()
            };

            var r2 = {
                left: item.left,
                top: item.top,
                right: item.left + item.width,
                bottom: item.top + item.height
            };  
            return intersects(r1, r2);
        },

        _refreshHitAreas: function() {
            this.hit_areas = this._getHitAreas();
            this._removeHintNodes();

            if (this.options.displayTestNodes) {
                this.hint_nodes = this._createHintNodes(this.hit_areas);
            }
        },

        /* Get hit areas for elements in the tree.
        * Area:
        *   left, top, width, height
        *   node
        *   move_to: Position.BEFORE, AFTER or INSIDE
        * */
        _getHitAreas: function() {
            function getAreaForNode(node) {
                var $span = $(node.element).find('span:first');
                var offset = $span.offset();
                var height = $span.outerHeight();
                var left = offset.left + 12;

                return {
                    left: left,
                    top: offset.top + height / 2,
                    width: 24,
                    height: 2
                };
            }

            function getAreaForFolder(node) {
                var $li = $(node.element);
                var $span = $(node.element).find('span:first');
                var offset = $li.offset();
                var span_height = $span.outerHeight();
                var top = $li.offset().top + span_height;

                return {
                    left: offset.left + 6,
                    top: top,
                    width: 2,
                    height: $li.height() - span_height
                };
            }

            var hit_areas = [];
            var area;

            this._iterateVisibleNodes(function(node) {
                if (node.hasChildren()) {
                    if (node.is_open) {
                        // after folder
                        area = getAreaForFolder(node);
                        area.node = node;
                        area.move_to = Position.AFTER;
                        hit_areas.push(area);

                        // before first child in folder
                        area = getAreaForNode(node);
                        area.node = node.children[0];
                        area.move_to = Position.BEFORE;
                        hit_areas.push(area);
                    }
                    else {
                        area = getAreaForNode(node);
                        area.node = node;
                        area.move_to = Position.INSIDE;
                        hit_areas.push(area);
                    }
                }
                else {
                    // after node
                    area = getAreaForNode(node);
                    area.node = node;
                    area.move_to = Position.AFTER;
                    hit_areas.push(area);

                    // inside node
                    area = $.extend({}, area);
                    area.left += 24;
                    area.move_to = Position.INSIDE;
                    hit_areas.push(area);
                }
            });

            return hit_areas;
        },

        _iterateVisibleNodes: function(callback) {
            this.tree.iterate(function(node) {
                callback(node);

                if (node.hasChildren()) {
                    return node.is_open;
                }
                else {
                    return true;
                }
            });
        },

        _createHintNodes: function(hit_areas) {
            var hint_nodes = [];

            var self = this;
            $.each(hit_areas, function() {
                var $node = $('<span class="hit"></span>');
                $node.css({
                    position: 'absolute',
                    left: this.left,
                    top: this.top,
                    display: 'block',
                    width: this.width,
                    height: this.height,
                    'background-color': '#000',
                    opacity: '0.2'
                 });
                self.element.append($node);
                hint_nodes.push($node);
            });

            return hint_nodes;
        },

        _removeHover: function() {
            this.hovered_rectangle = null;
        },

        _removeGhost: function() {
            if (this.$ghost) {
                this.$ghost.remove();
                this.$ghost = null;
            }
        },

        _removeHintNodes: function() {
            $.each(this.hint_nodes, function() {
                this.detach();
            });

            this.hint_nodes = [];
        },

        _openNodes: function() {
            var max_level;
            if (this.options.autoOpen === false) {
                return;
            }
            else if (this.options.autoOpen === true) {
                max_level = -1;
            }
            else {
                max_level = parseInt(this.options.autoOpen);
            }

            this.tree.iterate(function(node, level) {
                node.is_open = true;
                return (level != max_level);
            });
        },

        _startOpenFolderTimer: function(folder) {
            var self = this;
            this.open_folder_timer = setTimeout(
                function() {
                    self._getNodeElementForNode(folder).open(
                        function() {
                            self._refreshHitAreas();
                        }
                    );
                },
                500
            );
        },

        _stopOpenFolderTimer: function() {
            if (this.open_folder_timer) {
                clearTimeout(this.open_folder_timer);
                this.open_folder_timer = null;
            }
        }
    });

    var NodeElement = Class.$extend({
        __init__: function(node) {
            this.node = node;
            this.$element = $(node.element)
        },

        getUl: function() {
            return this.$element.children('ul:first');
        },

        getSpan: function() {
            return this.$element.children('span:first');
        },

        getLi: function() {
            return this.$element;
        },

        createHelper: function() {
            var $helper = this.getSpan().clone();
            $helper.addClass('dragging');
            return $helper;
        },

        appendGhost: function($ghost, move_to) {
            var classes = ['ghost'];

            if (move_to == Position.AFTER) {
                this.$element.after($ghost);

                if (this.node.hasChildren()) {
                    classes.push('folder');
                }
            }
            else if (move_to == Position.BEFORE) {
                this.$element.before($ghost);
            }
            else if (move_to == Position.INSIDE) {
                this.$element.after($ghost);
                classes.push('inside');
            }

            var $span = $ghost.children('span:first');
            $span.attr('class', classes.join(' '));
        },

        createGhost: function() {
           return $('<li><span class="ghost">'+ this.node.name +'</span></li>');
        }
    });

    var FolderElement = NodeElement.$extend({
        toggle: function() {
            if (this.node.is_open) {
                this.close();
            }
            else {
                this.open();
            }
        },

        open: function(on_opened) {
            this.node.is_open = true;

            var $ul = this.getUl();
            this.getSpan().removeClass('closed');

            $ul.slideDown(
                'fast',
                function() {
                    $ul.removeClass('closed');
                    if (on_opened) {
                        on_opened();
                    }
                }
            );
        },

        close: function() {
            this.node.is_open = false;

            var $ul = this.getUl();
            this.getSpan().addClass('closed');

            $ul.slideUp(
                'fast',
                function() {
                    $ul.addClass('closed');
                }
            );
        }
    });

    function intersects(r1, r2) {
        return (
            (r1.bottom >= r2.top) &&
            (r1.top <= r2.bottom) &&
            (r1.right >= r2.left) &&
            (r1.left <= r2.right)
        );
    }
})(jQuery);
