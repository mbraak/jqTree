// Laconic simplifies the generation of DOM content.
(function(context) {

  // properly-cased attribute names for IE setAttribute support
  var attributeMap = {
    'acceptcharset'     : 'acceptCharset',
    'accesskey'         : 'accessKey',
    'allowtransparency' : 'allowTransparency',
    'bgcolor'           : 'bgColor',
    'cellpadding'       : 'cellPadding',
    'cellspacing'       : 'cellSpacing',
    'class'             : 'className',
    'classname'         : 'className',
    'colspan'           : 'colSpan',
    'csstext'           : 'style',
    'defaultchecked'    : 'defaultChecked',
    'defaultselected'   : 'defaultSelected',
    'defaultvalue'      : 'defaultValue',
    'for'               : 'htmlFor',
    'frameborder'       : 'frameBorder',
    'hspace'            : 'hSpace',
    'htmlfor'           : 'htmlFor',
    'longdesc'          : 'longDesc',
    'maxlength'         : 'maxLength',
    'marginwidth'       : 'marginWidth',
    'marginheight'      : 'marginHeight',
    'noresize'          : 'noResize',
    'noshade'           : 'noShade',
    'readonly'          : 'readOnly',
    'rowspan'           : 'rowSpan',
    'tabindex'          : 'tabIndex',
    'valign'            : 'vAlign',
    'vspace'            : 'vSpace'
  };

  // The laconic function serves as a generic method for generating
  // DOM content, and also as a placeholder for helper functions.
  //
  // The first parameter MUST be a string specifying the element's 
  // tag name.  
  // 
  // An optional object of element attributs may follow directly 
  // after the tag name.  
  // 
  // Additional arguments will be considered children of the new 
  // element and may consist of elements, strings, or numbers.
  // 
  // for example:
  // laconic('div', {'class' : 'foo'}, 'bar');
  function laconic() {

    // create a new element of the requested type
    var el = document.createElement(arguments[0]);
    
    // walk through the rest of the arguments
    for(var i=1; i<arguments.length; i++) {
      var arg = arguments[i];
      if(arg === null || arg === undefined) continue;

      // if the argument is a dom node, we simply append it
      if(arg.nodeType === 1) {
        el.appendChild(arg); 
      }

      // if the argument is a string or a number, we append it as
      // a new text node
      else if(
          (!!(arg === '' || (arg && arg.charCodeAt && arg.substr))) ||
          (!!(arg === 0  || (arg && arg.toExponential && arg.toFixed)))) {

        el.appendChild(document.createTextNode(arg));
      }

      // if the argument is a plain-old object, and we're processing the first 
      // argument, then we apply the object's values as element attributes
      else if(i === 1 && typeof(arg) === 'object') {
        for(var key in arg) {
          if(arg.hasOwnProperty(key)) {
            var value = arg[key];
            if(value !== null && value !== undefined) {
              key = key.toLowerCase();
              key = attributeMap[key] || key;

              // if the key represents an event (onclick, onchange, etc)
              // we'll set the href to '#' if none is given, and we'll apply
              // the attribute directly to the element for IE7 support.
              var isEvent = key.charAt(0) === 'o' && key.charAt(1) === 'n';
              if(isEvent) {
                if(arg.href === undefined && key === 'onclick') {
                  el.setAttribute('href', '#');
                }
                el[key] = value;
              }

              // if we're setting the style attribute, we may need to 
              // use the cssText property
              else if(key === 'style' && el.style.setAttribute) {
                el.style.setAttribute('cssText', value);
              }

              // if we're setting an attribute that's not properly supported 
              // by IE7's setAttribute implementation, then we apply the 
              // attribute directly to the element
              else if(key === 'className' || key === 'htmlFor') {
                el[key] = value;
              }

              // otherwise, we use the standard setAttribute
              else {
                el.setAttribute(key, value);
              }
            }
          }
        }
      }

      // if the argument is an array, we append each element
      else if(Object.prototype.toString.call(arg) === '[object Array]') {
        for(var j=0; j<arg.length; j++) {
          var child = arg[j];
          if(child.nodeType === 1) {
            el.appendChild(child);
          }
        }
      }
    }

    // Add an appendTo method to the newly created element, which will allow
    // the DOM insertion to be method chained to the creation.  For example:
    // $el.div('foo').appendTo(document.body);
    el.appendTo = function(parentNode) {
      if(parentNode.nodeType === 1 && this.nodeType === 1) {
        parentNode.appendChild(this);
      }
      return el;
    };
    
    return el;
  }

  // registers a new 'tag' that can be used to automate
  // the creation of a known element hierarchy
  laconic.registerElement= function(name, renderer) {
    if(!laconic[name]) {
      laconic[name] = function() {
        var el = laconic('div', {'class' : name});
        renderer.apply(el, Array.prototype.slice.call(arguments));
        return el;
      };
    }
  };

  // html 4 tags 
  var deprecatedTags = ['acronym', 'applet', 'basefont', 'big', 'center', 'dir',
    'font', 'frame', 'frameset', 'noframes', 'strike', 'tt', 'u', 'xmp'];

  // html 5 tags
  var tags = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b',
    'base', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption',
    'cite', 'code', 'col', 'colgroup', 'command', 'datalist', 'dd', 'del',
    'details', 'dfn', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset',
    'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5',
    'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img',
    'input', 'ins', 'keygen', 'kbd', 'label', 'legend', 'li', 'link', 'map',
    'mark', 'menu', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol',
    'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'q', 'rp',
    'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small',
    'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table',
    'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr',
    'ul', 'var', 'video', 'wbr'].concat(deprecatedTags);

  // add our tag methods to the laconic object 
  var makeApply = function(tagName) {
    return function() {
      return laconic.apply(this, 
        [tagName].concat(Array.prototype.slice.call(arguments)));
    };
  };

  for(var i=0; i<tags.length; i++) {
    laconic[tags[i]] = makeApply(tags[i]);
  }

  // If we're in a CommonJS environment, we export our laconic methods
  if(typeof module !== 'undefined' && module.exports) {
    module.exports = laconic;
  } 

  // otherwise, we attach them to the top level $.el namespace
  else {
    var dollar = context.$ || {};
    dollar.el = laconic;
    context.$ = dollar;
  }
}(this));
