// todo: speed up hit detection; perhaps use a treshold; or better algorithm
// todo: click area for toggling folder
// todo: move event
// todo: click event
// todo: check for invalid move
// todo: drag handle
// todo: display move hint
// todo: variables must start with _?
// todo: change cursor for moving / over node that can be moved
// todo: easier (alternative) syntax for input json data (string instead of 'label', array instead of 'children')
// todo: extra data in input json data
// todo: use jqueryui icons for folder triangles
// todo: use extra span for folder icon
// todo: unit test
// todo: documentation
// todo: scroll while moving a node?
// todo: smooth animation while moving node
// todo: test on different browsers

_TestClasses = {};

(function($) {
    var Position = {
        BEFORE: 1,
        AFTER: 2,
        INSIDE: 3
    };

    _TestClasses.Position = Position;

    var Node = function(name) {
        this.init(name);
    };

    _TestClasses.Node = Node;

    $.extend(Node.prototype, {
        init: function(name) {
            this.name = name;
            this.children = [];
            this.parent = null;
        },

        /* Create tree from data.

          Structure of data is:
            [
                {
                    label: 'node1',
                    children: [
                        { label: 'child1' },
                        { label: 'child2' }
                    ]
                },
                {
                    label: 'node2'
                }
            ]
        */
        loadFromData: function(data) {
            this.children = [];

            var self = this;
            $.each(data, function() {
                var node = new Node(this.label);
                self.addChild(node);

                if (this.children) {
                    node.loadFromData(this.children);
                }
            });
        },

        /*
        Add child.

        tree.addChild(
            new Node('child1')
        );
        */
        addChild: function(node) {
            this.children.push(node);
            node.parent = this;
        },

        /*
        Add child at position. Index starts at 0.

        tree.addChildAtPosition(
            new Node('abc'),
            1
        );
        */
        addChildAtPosition: function(node, index) {
            this.children.splice(index, 0, node);
            node.parent = this;
        },

        /*
        Remove child.

        tree.removeChile(tree.children[0]);
         */
        removeChild: function(node) {
            this.children.splice(
                this.getChildIndex(node),
                1
            );
        },

        /*
        Get child index.

        var index = getChildIndex(node);
        */
        getChildIndex: function(node) {
            return $.inArray(node, this.children);
        },

        /*
        Does the tree have children?

        if (tree.hasChildren()) {
            //
        }
        */
        hasChildren: function() {
            return (this.children.length != 0);
        },

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

        Todo: remove level, use different function for recursion (_iterate).
        */
        iterate: function(callback, level) {
            if (! level) {
                level = 0;
            }

            $.each(this.children, function() {
                var result = callback(this, level);

                if (this.hasChildren() && result) {
                    this.iterate(callback, level + 1);
                }
            });
        },

        /*
        Move node relative to another node.

        Argument position: Position.BEFORE, Position.AFTER or Position.Inside

        // move node1 after node2
        tree.moveNode(node1, node2, Position.AFTER);
        */
        moveNode: function(moved_node, target_node, position) {
            // todo: check for illegal move
            moved_node.parent.removeChild(moved_node);
            if (position == Position.AFTER) {
                target_node.parent.addChildAtPosition(
                    moved_node,
                    target_node.parent.getChildIndex(target_node) + 1
                );
            }
            else if (position == Position.BEFORE) {
                target_node.parent.addChildAtPosition(
                    moved_node,
                    target_node.parent.getChildIndex(target_node)
                );
            }
            else if (position == Position.INSIDE) {
                target_node.addChild(moved_node);
            }
        }
    });

    Node.createFromData = function(data) {
        var tree = new Tree();
        tree.loadFromData(data);
        return tree;
    };

    var Tree = Node;

    _TestClasses.Tree = Tree;

    var Area = function(left, top, right, bottom) {
        this.init(left, top, right, bottom);
    };

    _TestClasses.Area = Area;

    $.extend(Area.prototype, {
         init: function(left, top, right, bottom) {
             this.left = left;
             this.top = top;
             this.right = right;
             this.bottom = bottom;

             this.children = [];
         },

        addArea: function(area) {
            this.children.push(area);
        },

        findIntersectingArea: function(area) {
            if (! this.intersects(area)) {
                return null;
            }
            else {
                for (var i=0; i < this.children.length; i++) {
                    var result = this.children[i].findIntersectingArea(area);
                    if (result) {
                        return result;
                    }
                }

                return this;
            }
        },

        intersects: function(area) {
            return (
                (this.bottom >= area.top) &&
                (this.top <= area.bottom) &&
                (this.right >= area.left) &&
                (this.left <= area.right)
            );
        },

        duplicate: function() {
            return new Area(
                this.left,
                this.top,
                this.right,
                this.bottom
            );
        },

        iterate: function(callback) {
            callback(this);

            $.each(this.children, function(i, area) {
                area.iterate(callback);
            });
        }
    });

    Area.createFromElement = function($element) {
        var offset = $element.offset();

        return new Area(
            offset.left,
            offset.top,
            offset.left + $element.outerWidth(),
            offset.top + $element.outerHeight()
        );
    };

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
                if (has_children) {
                    return createFolderLi(name, is_open);
                }
                else {
                    return createNodeLi(name);
                }
            }

            function createNodeLi(name) {
                return $('<li><span class="node">'+ name +'</span></li>');
            }

            function createFolderLi(name, is_open) {
                var span_classes = ['folder'];

                if (! is_open) {
                    span_classes.push('closed');
                }
                var $li = $('<li><span class="'+ span_classes.join(' ') +'">&nbsp;</span><span>'+ name +'</span></li>');

                // todo: add li class in text
                var folder_classes = ['folder'];
                if (! is_open) {
                    folder_classes.push('closed');
                }
                $li.addClass(folder_classes.join(' '));
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
            var $target = $(e.target);

            if (! $target.is('span.folder')) {
                return;
            }

            var nodeElement = this._getNodeElement($target);
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
            this.current_item = this._getNodeElement($(event.target));

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

            var hovered_rectangle = this._findHoveredRectangle();

            var cursor = this.helper.offset();
            cursor.right = cursor.left + this.current_item.$element.outerWidth();
            cursor.bottom = cursor.top + this.current_item.$element.outerHeight();

            if (
                ! ((hovered_rectangle) && hovered_rectangle.node)
            ) {
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

        _getPointerRectangle: function() {
            var offset = this.helper.offset();

            return {
                left: offset.left,
                top: offset.top,
                right: offset.left + this.current_item.$element.outerWidth(),
                bottom: offset.top + this.current_item.$element.outerHeight()
            };
        },

        _findHoveredRectangle: function() {
            return this.area.findIntersectingArea(
                this._getPointerRectangle()
            );
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

        _refreshHitAreas: function() {
            this.area = this._generateAreaAndChildren();
            this._removeHintNodes();

            if (this.options.displayTestNodes) {
                this.hint_nodes = this._createHintNodes(this.area);
            }
        },

        _generateAreaAndChildren: function() {
            function getHitAreaForNode(node) {
                var $span;

                if (node.hasChildren()) {
                    $span = $(node.element).find('span:eq(1)');
                }
                else {
                    $span = $(node.element).find('span:first');
                }

                var offset = $span.offset();

                var area = new Area(
                    offset.left,
                    offset.top,
                    offset.left + $span.outerWidth(),
                    offset.top + $span.outerHeight()
                );

                var height = area.bottom - area.top;
                area.top += (height / 2) - 1;
                area.bottom = area.top + 2;

                area.name = node.name;
                return area;
            }

            function getHitAreaForFolder(folder) {
                var $li = $(folder.element);
                var $span = $(folder.element).find('span:eq(1)');
                var offset = $li.offset();
                var span_height = $span.outerHeight();
                var top = $li.offset().top + span_height;

                var area = new Area(
                    offset.left + 6,
                    top,
                    offset.left + 8,
                    top + $li.height() - span_height
                );
                area.name = folder.name;
                return area;
            }

            function addHitAreasForNode(node, parent_area) {
                // after node
                var node_area = getHitAreaForNode(node);

                var area = node_area.duplicate();
                area.node = node;
                area.name = node.name;
                area.move_to = Position.AFTER;

                area.left += 12;
                area.right = area.left + 24;
                area.color = 'blue';

                parent_area.addArea(area);

                // inside node
                area = node_area.duplicate();
                area.left += 36;

                area.move_to = Position.INSIDE;
                area.name = node.name;
                area.node = node;
                parent_area.addArea(area);
            }

            function addHitAreasForOpenFolder(folder, parent_area) {
                // after folder
                var area = getHitAreaForFolder(folder);
                area.node = folder;
                area.name = folder.name;
                area.move_to = Position.AFTER;
                parent_area.addArea(area);

                // before first child in folder
                area = getHitAreaForNode(folder);
                area.node = folder.children[0];
                area.move_to = Position.BEFORE;
                area.name = folder.children[0].name;
                parent_area.addArea(area);
            }

            function addHitAreasForClosedFolder(folder, parent_area) {
                var area = getHitAreaForNode(folder);
                area.node = folder;
                area.name = folder.name;
                area.move_to = Position.INSIDE;
                parent_area.addArea(area);
            }

            function addNodes(children, parent_area) {
                $.each(children, function(i, node) {
                    var area = Area.createFromElement($(node.element));
                    area.name = node.name;
                    parent_area.addArea(area);

                    if (! node.hasChildren()) {
                        addHitAreasForNode(node, area);
                    }
                    else {
                        if (node.is_open) {
                            addHitAreasForOpenFolder(node, area);
                        }
                        else {
                            addHitAreasForClosedFolder(node, area);
                        }
                    }

                    if (node.hasChildren() && node.is_open) {
                        addNodes(node.children, area);
                    }
                });
            }

            var main_area = Area.createFromElement(this.element);
            main_area.name = 'tree';
            addNodes(this.tree.children, main_area);
            return main_area;
        },

        _createHintNodes: function(main_area) {
            var hint_nodes = [];

            var self = this;
            main_area.iterate(function(area) {
                if (area.node) {
                    var color = area.color || '#000';
                    var $span = $('<span class="hit"></span>');
                    $span.css({
                        position: 'absolute',
                        left: area.left,
                        top: area.top,
                        display: 'block',
                        width: area.right - area.left,
                        height: area.bottom - area.top,
                        opacity: '0.5',
                        border: 'solid 1px ' + color
                     });
                    self.element.append($span);
                    hint_nodes.push($span);
                }
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

    var NodeElement = function(node) {
        this.init(node);
    };

    $.extend(NodeElement.prototype, {
        init: function(node) {
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

    var FolderElement = function(node) {
        this.init(node);
    };

    $.extend(FolderElement.prototype, NodeElement.prototype, {
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
        },

        getSpan: function() {
            return this.$element.children('span:eq(1)');
        },
    });
})(jQuery);
