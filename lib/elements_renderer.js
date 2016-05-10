var $, ElementsRenderer, NodeElement, html_escape, node_element, util;

node_element = require('./node_element');

NodeElement = node_element.NodeElement;

util = require('./util');

html_escape = util.html_escape;

$ = jQuery;

ElementsRenderer = (function() {
  function ElementsRenderer(tree_widget) {
    this.tree_widget = tree_widget;
    this.opened_icon_element = this.createButtonElement(tree_widget.options.openedIcon);
    this.closed_icon_element = this.createButtonElement(tree_widget.options.closedIcon);
  }

  ElementsRenderer.prototype.render = function(from_node) {
    if (from_node && from_node.parent) {
      return this.renderFromNode(from_node);
    } else {
      return this.renderFromRoot();
    }
  };

  ElementsRenderer.prototype.renderFromRoot = function() {
    var $element;
    $element = this.tree_widget.element;
    $element.empty();
    return this.createDomElements($element[0], this.tree_widget.tree.children, true, true, 1);
  };

  ElementsRenderer.prototype.renderFromNode = function(node) {
    var $previous_li, li;
    $previous_li = $(node.element);
    li = this.createLi(node, node.getLevel());
    this.attachNodeData(node, li);
    $previous_li.after(li);
    $previous_li.remove();
    if (node.children) {
      return this.createDomElements(li, node.children, false, false, node.getLevel() + 1);
    }
  };

  ElementsRenderer.prototype.createDomElements = function(element, children, is_root_node, is_open, level) {
    var child, i, len, li, ul;
    ul = this.createUl(is_root_node);
    element.appendChild(ul);
    for (i = 0, len = children.length; i < len; i++) {
      child = children[i];
      li = this.createLi(child, level);
      ul.appendChild(li);
      this.attachNodeData(child, li);
      if (child.hasChildren()) {
        this.createDomElements(li, child.children, false, child.is_open, level + 1);
      }
    }
    return null;
  };

  ElementsRenderer.prototype.attachNodeData = function(node, li) {
    node.element = li;
    return $(li).data('node', node);
  };

  ElementsRenderer.prototype.createUl = function(is_root_node) {
    var class_string, role, ul;
    if (!is_root_node) {
      class_string = '';
      role = 'group';
    } else {
      class_string = 'jqtree-tree';
      role = 'tree';
      if (this.tree_widget.options.rtl) {
        class_string += ' jqtree-rtl';
      }
    }
    ul = document.createElement('ul');
    ul.className = "jqtree_common " + class_string;
    ul.setAttribute('role', role);
    return ul;
  };

  ElementsRenderer.prototype.createLi = function(node, level) {
    var is_selected, li;
    is_selected = this.tree_widget.select_node_handler && this.tree_widget.select_node_handler.isNodeSelected(node);
    if (node.isFolder()) {
      li = this.createFolderLi(node, level, is_selected);
    } else {
      li = this.createNodeLi(node, level, is_selected);
    }
    if (this.tree_widget.options.onCreateLi) {
      this.tree_widget.options.onCreateLi(node, $(li));
    }
    return li;
  };

  ElementsRenderer.prototype.createFolderLi = function(node, level, is_selected) {
    var button_classes, button_link, div, folder_classes, icon_element, is_folder, li;
    button_classes = this.getButtonClasses(node);
    folder_classes = this.getFolderClasses(node, is_selected);
    if (node.is_open) {
      icon_element = this.opened_icon_element;
    } else {
      icon_element = this.closed_icon_element;
    }
    li = document.createElement('li');
    li.className = "jqtree_common " + folder_classes;
    li.setAttribute('role', 'presentation');
    div = document.createElement('div');
    div.className = "jqtree-element jqtree_common";
    div.setAttribute('role', 'presentation');
    li.appendChild(div);
    button_link = document.createElement('a');
    button_link.className = button_classes;
    button_link.appendChild(icon_element.cloneNode(false));
    button_link.setAttribute('role', 'presentation');
    button_link.setAttribute('aria-hidden', 'true');
    if (this.tree_widget.options.buttonLeft) {
      div.appendChild(button_link);
    }
    div.appendChild(this.createTitleSpan(node.name, level, is_selected, node.is_open, is_folder = true));
    if (!this.tree_widget.options.buttonLeft) {
      div.appendChild(button_link);
    }
    return li;
  };

  ElementsRenderer.prototype.createNodeLi = function(node, level, is_selected) {
    var class_string, div, is_folder, li, li_classes;
    li_classes = ['jqtree_common'];
    if (is_selected) {
      li_classes.push('jqtree-selected');
    }
    class_string = li_classes.join(' ');
    li = document.createElement('li');
    li.className = class_string;
    li.setAttribute('role', 'presentation');
    div = document.createElement('div');
    div.className = "jqtree-element jqtree_common";
    div.setAttribute('role', 'presentation');
    li.appendChild(div);
    div.appendChild(this.createTitleSpan(node.name, level, is_selected, node.is_open, is_folder = false));
    return li;
  };

  ElementsRenderer.prototype.createTitleSpan = function(node_name, level, is_selected, is_open, is_folder) {
    var classes, title_span;
    title_span = document.createElement('span');
    classes = "jqtree-title jqtree_common";
    if (is_folder) {
      classes += " jqtree-title-folder";
    }
    title_span.className = classes;
    title_span.setAttribute('role', 'treeitem');
    title_span.setAttribute('aria-level', level);
    title_span.setAttribute('aria-selected', util.getBoolString(is_selected));
    title_span.setAttribute('aria-expanded', util.getBoolString(is_open));
    if (is_selected) {
      title_span.setAttribute('tabindex', 0);
    }
    title_span.innerHTML = this.escapeIfNecessary(node_name);
    return title_span;
  };

  ElementsRenderer.prototype.getButtonClasses = function(node) {
    var classes;
    classes = ['jqtree-toggler', 'jqtree_common'];
    if (!node.is_open) {
      classes.push('jqtree-closed');
    }
    if (this.tree_widget.options.buttonLeft) {
      classes.push('jqtree-toggler-left');
    } else {
      classes.push('jqtree-toggler-right');
    }
    return classes.join(' ');
  };

  ElementsRenderer.prototype.getFolderClasses = function(node, is_selected) {
    var classes;
    classes = ['jqtree-folder'];
    if (!node.is_open) {
      classes.push('jqtree-closed');
    }
    if (is_selected) {
      classes.push('jqtree-selected');
    }
    if (node.is_loading) {
      classes.push('jqtree-loading');
    }
    return classes.join(' ');
  };

  ElementsRenderer.prototype.escapeIfNecessary = function(value) {
    if (this.tree_widget.options.autoEscape) {
      return html_escape(value);
    } else {
      return value;
    }
  };

  ElementsRenderer.prototype.createButtonElement = function(value) {
    var div;
    if (typeof value === 'string') {
      div = document.createElement('div');
      div.innerHTML = value;
      return document.createTextNode(div.innerHTML);
    } else {
      return $(value)[0];
    }
  };

  return ElementsRenderer;

})();

module.exports = ElementsRenderer;
