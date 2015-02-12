(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * MockJax - jQuery Plugin to Mock Ajax requests
 *
 * Version:  1.6.1
 * Released:
 * Home:   https://github.com/jakerella/jquery-mockjax
 * Author:   Jonathan Sharp (http://jdsharp.com)
 * License:  MIT,GPL
 *
 * Copyright (c) 2014 appendTo, Jordan Kasper
 * NOTE: This repository was taken over by Jordan Kasper (@jakerella) October, 2014
 * 
 * Dual licensed under the MIT or GPL licenses.
 * http://opensource.org/licenses/MIT OR http://www.gnu.org/licenses/gpl-2.0.html
 */
(function($) {
	var _ajax = $.ajax,
		mockHandlers = [],
		mockedAjaxCalls = [],
		unmockedAjaxCalls = [],
		CALLBACK_REGEX = /=\?(&|$)/,
		jsc = (new Date()).getTime();


	// Parse the given XML string.
	function parseXML(xml) {
		if ( window.DOMParser == undefined && window.ActiveXObject ) {
			DOMParser = function() { };
			DOMParser.prototype.parseFromString = function( xmlString ) {
				var doc = new ActiveXObject('Microsoft.XMLDOM');
				doc.async = 'false';
				doc.loadXML( xmlString );
				return doc;
			};
		}

		try {
			var xmlDoc = ( new DOMParser() ).parseFromString( xml, 'text/xml' );
			if ( $.isXMLDoc( xmlDoc ) ) {
				var err = $('parsererror', xmlDoc);
				if ( err.length == 1 ) {
					throw new Error('Error: ' + $(xmlDoc).text() );
				}
			} else {
				throw new Error('Unable to parse XML');
			}
			return xmlDoc;
		} catch( e ) {
			var msg = ( e.name == undefined ? e : e.name + ': ' + e.message );
			$(document).trigger('xmlParseError', [ msg ]);
			return undefined;
		}
	}

	// Check if the data field on the mock handler and the request match. This
	// can be used to restrict a mock handler to being used only when a certain
	// set of data is passed to it.
	function isMockDataEqual( mock, live ) {
		var identical = true;
		// Test for situations where the data is a querystring (not an object)
		if (typeof live === 'string') {
			// Querystring may be a regex
			return $.isFunction( mock.test ) ? mock.test(live) : mock == live;
		}
		$.each(mock, function(k) {
			if ( live[k] === undefined ) {
				identical = false;
				return identical;
			} else {
				if ( typeof live[k] === 'object' && live[k] !== null ) {
					if ( identical && $.isArray( live[k] ) ) {
						identical = $.isArray( mock[k] ) && live[k].length === mock[k].length;
					}
					identical = identical && isMockDataEqual(mock[k], live[k]);
				} else {
					if ( mock[k] && $.isFunction( mock[k].test ) ) {
						identical = identical && mock[k].test(live[k]);
					} else {
						identical = identical && ( mock[k] == live[k] );
					}
				}
			}
		});

		return identical;
	}

    // See if a mock handler property matches the default settings
    function isDefaultSetting(handler, property) {
        return handler[property] === $.mockjaxSettings[property];
    }

	// Check the given handler should mock the given request
	function getMockForRequest( handler, requestSettings ) {
		// If the mock was registered with a function, let the function decide if we
		// want to mock this request
		if ( $.isFunction(handler) ) {
			return handler( requestSettings );
		}

		// Inspect the URL of the request and check if the mock handler's url
		// matches the url for this ajax request
		if ( $.isFunction(handler.url.test) ) {
			// The user provided a regex for the url, test it
			if ( !handler.url.test( requestSettings.url ) ) {
				return null;
			}
		} else {
			// Look for a simple wildcard '*' or a direct URL match
			var star = handler.url.indexOf('*');
			if (handler.url !== requestSettings.url && star === -1 ||
					!new RegExp(handler.url.replace(/[-[\]{}()+?.,\\^$|#\s]/g, "\\$&").replace(/\*/g, '.+')).test(requestSettings.url)) {
				return null;
			}
		}

		// Inspect the data submitted in the request (either POST body or GET query string)
		if ( handler.data ) {
			if ( ! requestSettings.data || !isMockDataEqual(handler.data, requestSettings.data) ) {
				// They're not identical, do not mock this request
				return null;
			}
		}
		// Inspect the request type
		if ( handler && handler.type &&
				handler.type.toLowerCase() != requestSettings.type.toLowerCase() ) {
			// The request type doesn't match (GET vs. POST)
			return null;
		}

		return handler;
	}

	function parseResponseTimeOpt(responseTime) {
		if ($.isArray(responseTime)) {
			var min = responseTime[0];
			var max = responseTime[1];
			return (typeof min === 'number' && typeof max === 'number') ? Math.floor(Math.random() * (max - min)) + min : null;
		} else {
			return (typeof responseTime === 'number') ? responseTime: null;
		}
	}

	// Process the xhr objects send operation
	function _xhrSend(mockHandler, requestSettings, origSettings) {

		// This is a substitute for < 1.4 which lacks $.proxy
		var process = (function(that) {
			return function() {
				return (function() {
					// The request has returned
					this.status     = mockHandler.status;
					this.statusText = mockHandler.statusText;
					this.readyState	= 1;

					var finishRequest = function () {
						this.readyState	= 4;

						var onReady;
						// Copy over our mock to our xhr object before passing control back to
						// jQuery's onreadystatechange callback
						if ( requestSettings.dataType == 'json' && ( typeof mockHandler.responseText == 'object' ) ) {
							this.responseText = JSON.stringify(mockHandler.responseText);
						} else if ( requestSettings.dataType == 'xml' ) {
							if ( typeof mockHandler.responseXML == 'string' ) {
								this.responseXML = parseXML(mockHandler.responseXML);
								//in jQuery 1.9.1+, responseXML is processed differently and relies on responseText
								this.responseText = mockHandler.responseXML;
							} else {
								this.responseXML = mockHandler.responseXML;
							}
						} else if (typeof mockHandler.responseText === 'object' && mockHandler.responseText !== null) {
							// since jQuery 1.9 responseText type has to match contentType
							mockHandler.contentType = 'application/json';
							this.responseText = JSON.stringify(mockHandler.responseText);
						} else {
							this.responseText = mockHandler.responseText;
						}
						if( typeof mockHandler.status == 'number' || typeof mockHandler.status == 'string' ) {
							this.status = mockHandler.status;
						}
						if( typeof mockHandler.statusText === "string") {
							this.statusText = mockHandler.statusText;
						}
						// jQuery 2.0 renamed onreadystatechange to onload
						onReady = this.onreadystatechange || this.onload;

						// jQuery < 1.4 doesn't have onreadystate change for xhr
						if ( $.isFunction( onReady ) ) {
							if( mockHandler.isTimeout) {
								this.status = -1;
							}
							onReady.call( this, mockHandler.isTimeout ? 'timeout' : undefined );
						} else if ( mockHandler.isTimeout ) {
							// Fix for 1.3.2 timeout to keep success from firing.
							this.status = -1;
						}
					};

					// We have an executable function, call it to give
					// the mock handler a chance to update it's data
					if ( $.isFunction(mockHandler.response) ) {
						// Wait for it to finish
						if ( mockHandler.response.length === 2 ) {
							mockHandler.response(origSettings, function () {
								finishRequest.call(that);
							});
							return;
						} else {
							mockHandler.response(origSettings);
						}
					}

					finishRequest.call(that);
				}).apply(that);
			};
		})(this);

		if ( mockHandler.proxy ) {
			// We're proxying this request and loading in an external file instead
			_ajax({
				global: false,
				url: mockHandler.proxy,
				type: mockHandler.proxyType,
				data: mockHandler.data,
				dataType: requestSettings.dataType === "script" ? "text/plain" : requestSettings.dataType,
				complete: function(xhr) {
					mockHandler.responseXML = xhr.responseXML;
					mockHandler.responseText = xhr.responseText;
                    // Don't override the handler status/statusText if it's specified by the config
                    if (isDefaultSetting(mockHandler, 'status')) {
					    mockHandler.status = xhr.status;
                    }
                    if (isDefaultSetting(mockHandler, 'statusText')) {
					    mockHandler.statusText = xhr.statusText;
                    }
					this.responseTimer = setTimeout(process, parseResponseTimeOpt(mockHandler.responseTime) || 0);
				}
			});
		} else {
			// type == 'POST' || 'GET' || 'DELETE'
			if ( requestSettings.async === false ) {
				// TODO: Blocking delay
				process();
			} else {
				this.responseTimer = setTimeout(process, parseResponseTimeOpt(mockHandler.responseTime) || 50);
			}
		}
	}

	// Construct a mocked XHR Object
	function xhr(mockHandler, requestSettings, origSettings, origHandler) {
		// Extend with our default mockjax settings
		mockHandler = $.extend(true, {}, $.mockjaxSettings, mockHandler);

		if (typeof mockHandler.headers === 'undefined') {
			mockHandler.headers = {};
		}
		if (typeof requestSettings.headers === 'undefined') {
			requestSettings.headers = {};
		}
		if ( mockHandler.contentType ) {
			mockHandler.headers['content-type'] = mockHandler.contentType;
		}

		return {
			status: mockHandler.status,
			statusText: mockHandler.statusText,
			readyState: 1,
			open: function() { },
			send: function() {
				origHandler.fired = true;
				_xhrSend.call(this, mockHandler, requestSettings, origSettings);
			},
			abort: function() {
				clearTimeout(this.responseTimer);
			},
			setRequestHeader: function(header, value) {
				requestSettings.headers[header] = value;
			},
			getResponseHeader: function(header) {
				// 'Last-modified', 'Etag', 'content-type' are all checked by jQuery
				if ( mockHandler.headers && mockHandler.headers[header] ) {
					// Return arbitrary headers
					return mockHandler.headers[header];
				} else if ( header.toLowerCase() == 'last-modified' ) {
					return mockHandler.lastModified || (new Date()).toString();
				} else if ( header.toLowerCase() == 'etag' ) {
					return mockHandler.etag || '';
				} else if ( header.toLowerCase() == 'content-type' ) {
					return mockHandler.contentType || 'text/plain';
				}
			},
			getAllResponseHeaders: function() {
				var headers = '';
				// since jQuery 1.9 responseText type has to match contentType
				if (mockHandler.contentType) {
					mockHandler.headers['Content-Type'] = mockHandler.contentType;
				}
				$.each(mockHandler.headers, function(k, v) {
					headers += k + ': ' + v + "\n";
				});
				return headers;
			}
		};
	}

	// Process a JSONP mock request.
	function processJsonpMock( requestSettings, mockHandler, origSettings ) {
		// Handle JSONP Parameter Callbacks, we need to replicate some of the jQuery core here
		// because there isn't an easy hook for the cross domain script tag of jsonp

		processJsonpUrl( requestSettings );

		requestSettings.dataType = "json";
		if(requestSettings.data && CALLBACK_REGEX.test(requestSettings.data) || CALLBACK_REGEX.test(requestSettings.url)) {
			createJsonpCallback(requestSettings, mockHandler, origSettings);

			// We need to make sure
			// that a JSONP style response is executed properly

			var rurl = /^(\w+:)?\/\/([^\/?#]+)/,
				parts = rurl.exec( requestSettings.url ),
				remote = parts && (parts[1] && parts[1] !== location.protocol || parts[2] !== location.host);

			requestSettings.dataType = "script";
			if(requestSettings.type.toUpperCase() === "GET" && remote ) {
				var newMockReturn = processJsonpRequest( requestSettings, mockHandler, origSettings );

				// Check if we are supposed to return a Deferred back to the mock call, or just
				// signal success
				if(newMockReturn) {
					return newMockReturn;
				} else {
					return true;
				}
			}
		}
		return null;
	}

	// Append the required callback parameter to the end of the request URL, for a JSONP request
	function processJsonpUrl( requestSettings ) {
		if ( requestSettings.type.toUpperCase() === "GET" ) {
			if ( !CALLBACK_REGEX.test( requestSettings.url ) ) {
				requestSettings.url += (/\?/.test( requestSettings.url ) ? "&" : "?") +
					(requestSettings.jsonp || "callback") + "=?";
			}
		} else if ( !requestSettings.data || !CALLBACK_REGEX.test(requestSettings.data) ) {
			requestSettings.data = (requestSettings.data ? requestSettings.data + "&" : "") + (requestSettings.jsonp || "callback") + "=?";
		}
	}

	// Process a JSONP request by evaluating the mocked response text
	function processJsonpRequest( requestSettings, mockHandler, origSettings ) {
		// Synthesize the mock request for adding a script tag
		var callbackContext = origSettings && origSettings.context || requestSettings,
			newMock = null;


		// If the response handler on the moock is a function, call it
		if ( mockHandler.response && $.isFunction(mockHandler.response) ) {
			mockHandler.response(origSettings);
		} else {

			// Evaluate the responseText javascript in a global context
			if( typeof mockHandler.responseText === 'object' ) {
				$.globalEval( '(' + JSON.stringify( mockHandler.responseText ) + ')');
			} else {
				$.globalEval( '(' + mockHandler.responseText + ')');
			}
		}

		// Successful response
		setTimeout(function() {
			jsonpSuccess( requestSettings, callbackContext, mockHandler );
			jsonpComplete( requestSettings, callbackContext, mockHandler );
		}, parseResponseTimeOpt(mockHandler.responseTime) || 0);

		// If we are running under jQuery 1.5+, return a deferred object
		if($.Deferred){
			newMock = new $.Deferred();
			if(typeof mockHandler.responseText == "object"){
				newMock.resolveWith( callbackContext, [mockHandler.responseText] );
			}
			else{
				newMock.resolveWith( callbackContext, [$.parseJSON( mockHandler.responseText )] );
			}
		}
		return newMock;
	}


	// Create the required JSONP callback function for the request
	function createJsonpCallback( requestSettings, mockHandler, origSettings ) {
		var callbackContext = origSettings && origSettings.context || requestSettings;
		var jsonp = requestSettings.jsonpCallback || ("jsonp" + jsc++);

		// Replace the =? sequence both in the query string and the data
		if ( requestSettings.data ) {
			requestSettings.data = (requestSettings.data + "").replace(CALLBACK_REGEX, "=" + jsonp + "$1");
		}

		requestSettings.url = requestSettings.url.replace(CALLBACK_REGEX, "=" + jsonp + "$1");


		// Handle JSONP-style loading
		window[ jsonp ] = window[ jsonp ] || function( tmp ) {
			data = tmp;
			jsonpSuccess( requestSettings, callbackContext, mockHandler );
			jsonpComplete( requestSettings, callbackContext, mockHandler );
			// Garbage collect
			window[ jsonp ] = undefined;

			try {
				delete window[ jsonp ];
			} catch(e) {}

			if ( head ) {
				head.removeChild( script );
			}
		};
	}

	// The JSONP request was successful
	function jsonpSuccess(requestSettings, callbackContext, mockHandler) {
		// If a local callback was specified, fire it and pass it the data
		if ( requestSettings.success ) {
			requestSettings.success.call( callbackContext, mockHandler.responseText || "", status, {} );
		}

		// Fire the global callback
		if ( requestSettings.global ) {
			(requestSettings.context ? $(requestSettings.context) : $.event).trigger("ajaxSuccess", [{}, requestSettings]);
		}
	}

	// The JSONP request was completed
	function jsonpComplete(requestSettings, callbackContext) {
		// Process result
		if ( requestSettings.complete ) {
			requestSettings.complete.call( callbackContext, {} , status );
		}

		// The request was completed
		if ( requestSettings.global ) {
			(requestSettings.context ? $(requestSettings.context) : $.event).trigger("ajaxComplete", [{}, requestSettings]);
		}

		// Handle the global AJAX counter
		if ( requestSettings.global && ! --$.active ) {
			$.event.trigger( "ajaxStop" );
		}
	}


	// The core $.ajax replacement.
	function handleAjax( url, origSettings ) {
		var mockRequest, requestSettings, mockHandler, overrideCallback;

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			origSettings = url;
			url = undefined;
		} else {
			// work around to support 1.5 signature
			origSettings = origSettings || {};
			origSettings.url = url;
		}

		// Extend the original settings for the request
		requestSettings = $.extend(true, {}, $.ajaxSettings, origSettings);

		// Generic function to override callback methods for use with
		// callback options (onAfterSuccess, onAfterError, onAfterComplete)
		overrideCallback = function(action, mockHandler) {
			var origHandler = origSettings[action.toLowerCase()];
			return function() {
				if ( $.isFunction(origHandler) ) {
					origHandler.apply(this, [].slice.call(arguments));
				}
				mockHandler['onAfter' + action]();
			};
		};

		// Iterate over our mock handlers (in registration order) until we find
		// one that is willing to intercept the request
		for(var k = 0; k < mockHandlers.length; k++) {
			if ( !mockHandlers[k] ) {
				continue;
			}

			mockHandler = getMockForRequest( mockHandlers[k], requestSettings );
			if(!mockHandler) {
				// No valid mock found for this request
				continue;
			}

			mockedAjaxCalls.push(requestSettings);

			// If logging is enabled, log the mock to the console
			$.mockjaxSettings.log( mockHandler, requestSettings );


			if ( requestSettings.dataType && requestSettings.dataType.toUpperCase() === 'JSONP' ) {
				if ((mockRequest = processJsonpMock( requestSettings, mockHandler, origSettings ))) {
					// This mock will handle the JSONP request
					return mockRequest;
				}
			}


			// Removed to fix #54 - keep the mocking data object intact
			//mockHandler.data = requestSettings.data;

			mockHandler.cache = requestSettings.cache;
			mockHandler.timeout = requestSettings.timeout;
			mockHandler.global = requestSettings.global;

			// In the case of a timeout, we just need to ensure
			// an actual jQuery timeout (That is, our reponse won't)
			// return faster than the timeout setting.
			if ( mockHandler.isTimeout ) {
				if ( mockHandler.responseTime > 1 ) {
					origSettings.timeout = mockHandler.responseTime - 1;
				} else {
					mockHandler.responseTime = 2;
					origSettings.timeout = 1;
				}
				mockHandler.isTimeout = false;
			}

			// Set up onAfter[X] callback functions
			if ( $.isFunction( mockHandler.onAfterSuccess ) ) {
				origSettings.success = overrideCallback('Success', mockHandler);
			}
			if ( $.isFunction( mockHandler.onAfterError ) ) {
				origSettings.error = overrideCallback('Error', mockHandler);
			}
			if ( $.isFunction( mockHandler.onAfterComplete ) ) {
				origSettings.complete = overrideCallback('Complete', mockHandler);
			}

			copyUrlParameters(mockHandler, origSettings);

			(function(mockHandler, requestSettings, origSettings, origHandler) {

				mockRequest = _ajax.call($, $.extend(true, {}, origSettings, {
					// Mock the XHR object
					xhr: function() { return xhr( mockHandler, requestSettings, origSettings, origHandler ); }
				}));
			})(mockHandler, requestSettings, origSettings, mockHandlers[k]);

			return mockRequest;
		}

		// We don't have a mock request
		unmockedAjaxCalls.push(origSettings);
		if($.mockjaxSettings.throwUnmocked === true) {
			throw new Error('AJAX not mocked: ' + origSettings.url);
		}
		else { // trigger a normal request
			return _ajax.apply($, [origSettings]);
		}
	}

	/**
	* Copies URL parameter values if they were captured by a regular expression
	* @param {Object} mockHandler
	* @param {Object} origSettings
	*/
	function copyUrlParameters(mockHandler, origSettings) {
		//parameters aren't captured if the URL isn't a RegExp
		if (!(mockHandler.url instanceof RegExp)) {
			return;
		}
		//if no URL params were defined on the handler, don't attempt a capture
		if (!mockHandler.hasOwnProperty('urlParams')) {
			return;
		}
		var captures = mockHandler.url.exec(origSettings.url);
		//the whole RegExp match is always the first value in the capture results
		if (captures.length === 1) {
			return;
		}
		captures.shift();
		//use handler params as keys and capture resuts as values
		var i = 0,
		capturesLength = captures.length,
		paramsLength = mockHandler.urlParams.length,
		//in case the number of params specified is less than actual captures
		maxIterations = Math.min(capturesLength, paramsLength),
		paramValues = {};
		for (i; i < maxIterations; i++) {
			var key = mockHandler.urlParams[i];
			paramValues[key] = captures[i];
		}
		origSettings.urlParams = paramValues;
	}


	// Public

	$.extend({
		ajax: handleAjax
	});

	$.mockjaxSettings = {
		//url:        null,
		//type:       'GET',
		log:          function( mockHandler, requestSettings ) {
			if ( mockHandler.logging === false ||
				 ( typeof mockHandler.logging === 'undefined' && $.mockjaxSettings.logging === false ) ) {
				return;
			}
			if ( window.console && console.log ) {
				var message = 'MOCK ' + requestSettings.type.toUpperCase() + ': ' + requestSettings.url;
				var request = $.extend({}, requestSettings);

				if (typeof console.log === 'function') {
					console.log(message, request);
				} else {
					try {
						console.log( message + ' ' + JSON.stringify(request) );
					} catch (e) {
						console.log(message);
					}
				}
			}
		},
		logging:       true,
		status:        200,
		statusText:    "OK",
		responseTime:  500,
		isTimeout:     false,
		throwUnmocked: false,
		contentType:   'text/plain',
		response:      '',
		responseText:  '',
		responseXML:   '',
		proxy:         '',
		proxyType:     'GET',

		lastModified:  null,
		etag:          '',
		headers: {
			etag: 'IJF@H#@923uf8023hFO@I#H#',
			'content-type' : 'text/plain'
		}
	};

	$.mockjax = function(settings) {
		var i = mockHandlers.length;
		mockHandlers[i] = settings;
		return i;
	};
	$.mockjax.clear = function(i) {
		if ( arguments.length == 1 ) {
			mockHandlers[i] = null;
		} else {
			mockHandlers = [];
		}
		mockedAjaxCalls = [];
		unmockedAjaxCalls = [];
	};
	// support older, deprecated version
	$.mockjaxClear = function(i) {
		window.console && window.console.warn && window.console.warn( 'DEPRECATED: The $.mockjaxClear() method has been deprecated in 1.6.0. Please use $.mockjax.clear() as the older function will be removed soon!' );
		$.mockjax.clear();
	};
	$.mockjax.handler = function(i) {
		if ( arguments.length == 1 ) {
			return mockHandlers[i];
		}
	};
	$.mockjax.mockedAjaxCalls = function() {
		return mockedAjaxCalls;
	};
	$.mockjax.unfiredHandlers = function() {
		var results = [];
		for (var i=0, len=mockHandlers.length; i<len; i++) {
			var handler = mockHandlers[i];
            if (handler !== null && !handler.fired) {
				results.push(handler);
			}
		}
		return results;
	};
	$.mockjax.unmockedAjaxCalls = function() {
		return unmockedAjaxCalls;
	};
})(jQuery);

},{}],2:[function(require,module,exports){
var Node, Position, util, _indexOf, indexOf;

require('jquery-mockjax');


QUnit.begin(function() {
    // Load classes and modules here to make sure code coverage works
    var JqTreeWidget = $('').tree('get_widget_class');
    var node = JqTreeWidget.getModule('node');

    Node = node.Node;
    Position = node.Position;

    util = JqTreeWidget.getModule('util');
    _indexOf = util._indexOf;
    indexOf = util.indexOf;
});

QUnit.config.testTimeout = 5000;

/*
example data:

node1
---child1
---child2
-node2
---child3
*/

var example_data = [
    {
        label: 'node1',
        id: 123,  // extra data
        int_property: 1,
        str_property: '1',
        children: [
            { label: 'child1', id: 125, int_property: 2 },
            { label: 'child2', id: 126 }
        ]
    },
    {
        label: 'node2',
        id: 124,
        int_property: 3,
        str_property: '3',
        children: [
            { label: 'child3', id: 127 }
        ]
    }
];

/*
example data 2:

-main
---c1
---c2
*/

var example_data2 = [
    {
        label: 'main',
        children: [
            { label: 'c1' },
            { label: 'c2' }
        ]
    }
];

function formatNodes(nodes) {
    var strings = $.map(nodes, function(node) {
        return node.name;
    });
    return strings.join(' ');
};

function isNodeClosed($node) {
    return (
        ($node.is('li.jqtree-folder.jqtree-closed')) &&
        ($node.find('a:eq(0)').is('a.jqtree-toggler.jqtree-closed')) &&
        ($node.find('ul:eq(0)').is('ul'))
    );
}

function isNodeOpen($node) {
    return (
        ($node.is('li.jqtree-folder')) &&
        ($node.find('a:eq(0)').is('a.jqtree-toggler')) &&
        ($node.find('ul:eq(0)').is('ul')) &&
        (! $node.is('li.jqtree-folder.jqtree-closed')) &&
        (! $node.find('span:eq(0)').is('a.jqtree-toggler.jqtree-closed'))
    );
}

function formatTitles($node) {
    var titles = $node.find('.jqtree-title').map(
        function(i, el) {
            return $(el).text();
        }
    );
    return titles.toArray().join(' ');
}


QUnit.module("jqtree", {
    setup: function() {
        $('body').append('<div id="tree1"></div>');
    },

    teardown: function() {
        var $tree = $('#tree1');
        $tree.tree('destroy');
        $tree.remove();
    }
});

test("create jqtree from data", function() {
    $('#tree1').tree({
        data: example_data
    });

    equal(
        $('#tree1').children().length, 1,
        'number of children on level 0'
    );
    ok(
        $('#tree1').children().is('ul.jqtree-tree'),
        'first element is ul.jqtree-tree'
    );
    equal(
        $('#tree1 ul.jqtree-tree > li').length, 2,
        'number of children on level 1'
    );
    ok(
        $('#tree1 ul.jqtree-tree li:eq(0)').is('li.jqtree-folder.jqtree-closed'),
        'first child is li.jqtree-folder.jqtree-closed'
    );
    ok(
        $('#tree1 ul.jqtree-tree li:eq(0) > .jqtree-element > a.jqtree-toggler').is('a.jqtree-toggler.jqtree-closed'),
        'button in first folder'
    );
    equal(
        $('#tree1 ul.jqtree-tree li:eq(0) > .jqtree-element span.jqtree-title').text(),
        'node1'
    );
});

test('toggle', function() {
    // create tree
    var $tree = $('#tree1');
    var $node1;
    var node1;

    $tree.tree({
        data: example_data
    });

    $tree.bind(
        'tree.open',
        function(e) {
            ok(! isNodeClosed($node1), 'node1 is open');

            // 2. close node1
            $tree.tree('toggle', node1);

            stop();
        }
    );

    $tree.bind(
        'tree.close',
        function(e) {
            start();

            ok(isNodeClosed($node1), 'node1 is closed');
        }
    );

    var tree = $tree.tree('getTree');
    node1 = tree.children[0];
    $node1 = $tree.find('ul.jqtree-tree li:eq(0)');

    // node1 is initially closed
    ok(isNodeClosed($node1), 'node1 is closed');

    // 1. open node1
    $tree.tree('toggle', node1);
});

test("click event", function() {
    stop();

    var select_count = 0;

    // create tree
    var $tree = $('#tree1');

    $tree.tree({
        data: example_data,
        selectable: true
    });

    var $node1 = $tree.find('ul.jqtree-tree li:first');
    var $text_span = $node1.find('span:first');

    $tree.bind('tree.click', function(e) {
        equal(e.node.name, 'node1');
    });

    $tree.bind('tree.select', function(e) {
        select_count += 1;

        if (select_count == 1) {
            equal(e.node.name, 'node1');

            equal($tree.tree('getSelectedNode').name, 'node1');

            // deselect
            $text_span.click();
        }
        else {
            equal(e.node, null);
            equal(e.previous_node.name, 'node1');
            equal($tree.tree('getSelectedNode'), false);

            start();
        }
    });

    // click on node1
    $text_span.click();
});

test('saveState', function() {
    var $tree = $('#tree1');

    var saved_state;

    function setState(state) {
        saved_state = state;
    }

    function getState() {
        return saved_state;
    }

    function createTree() {
        $tree.tree({
            data: example_data,
            saveState: true,
            onSetStateFromStorage: setState,
            onGetStateFromStorage: getState,
            selectable: true
        });
    }

    // create tree
    createTree();

    // nodes are initially closed
    var tree = $tree.tree('getTree');
    tree.iterate(function(node) {
        ok(! node.is_open, 'jqtree-closed');
        return true;
    });

    // open node1
    $tree.tree('toggle', tree.children[0]);

    // node1 is open
    ok(tree.children[0].is_open, 'node1 is_open');

    // select node2
    $tree.tree('selectNode', tree.children[1]);

    // node2 is selected
    equal(
        $tree.tree('getSelectedNode').name,
        'node2',
        'getSelectedNode (1)'
    );

    // create tree again
    $tree.tree('destroy');
    createTree();

    tree = $tree.tree('getTree');
    ok(tree.children[0].is_open, 'node1 is_open');
    ok(! tree.children[1].is_open, 'node2 is closed');

    // node2 is selected
    equal(
        $tree.tree('getSelectedNode').name,
        'node2',
        'getSelectedNode (2)'
    );
});

test('getSelectedNode', function() {
    var $tree = $('#tree1');

    // create tree
    $tree.tree({
        data: example_data,
        selectable: true
    });

    // there is no node selected
    equal(
        $tree.tree('getSelectedNode'),
        false,
        'getSelectedNode'
    );

    // select node1
    var tree = $tree.tree('getTree');
    var node1 = tree.children[0];
    $tree.tree('selectNode', node1);

    // node1 is selected
    equal(
        $tree.tree('getSelectedNode').name,
        'node1',
        'getSelectedNode'
    );
});

test("toJson", function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    // 1. call toJson
    equal(
        $tree.tree('toJson'),
        '[{"name":"node1","id":123,"int_property":1,"str_property":"1",'+
        '"children":[{"name":"child1","id":125,"int_property":2},{"name":'+
        '"child2","id":126}]},{"name":"node2","id":124,"int_property":3,'+
        '"str_property":"3","children":[{"name":"child3","id":127}]}]'
    );

    // Check that properties 'children', 'parent' and 'element' still exist.
    var tree = $tree.tree('getTree');
    equal(tree.children.length, 2);
    ok(tree.children[0].parent != undefined, 'parent');
    ok($(tree.children[0].element).is('li'), 'element');
});

test('loadData', function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        autoOpen: true
    });

    // first node is 'node1'
    equal(
        $tree.find('> ul > li:first .jqtree-element:first > span').text(),
        'node1'
    );

    // - load new data
    $tree.tree('loadData', example_data2);

    // first node is 'main'
    equal(
        $tree.find('> ul > li:first .jqtree-element:first > span').text(),
        'main'
    );

    // - load new data under node 'child3'
    $tree.tree('loadData', example_data);

    var child3 = $tree.tree('getNodeByName', 'child3');

    var data = [
        { label: 'c4', id: 200 },
        {
            label: 'c5', id: 201,
            children: [
                { label: 'c6', id: 202 }
            ]
        }
    ];
    $tree.tree('loadData', data, child3);

    // first node in html is still 'node1'
    equal(
        $tree.find('li:eq(0)').find('.jqtree-element:eq(0) span.jqtree-title').text(),
        'node1'
    );

    // Node 'child3' now has a children 'c4' and 'c5'
    var $child3 = $tree.find('span:contains(child3)');
    var $li = $child3.closest('li');
    equal(
        $li.children('ul').children('li:eq(0)').find('.jqtree-element span.jqtree-title').text(),
        'c4'
    );

    // Node 'child3' must have toggler button
    ok(
        $child3.prev().is('a.jqtree-toggler'),
        "node 'child3' must have toggler button"
    );

    // - select node 'c5' and load new data under 'child3'
    var c5 = $tree.tree('getNodeByName', 'c5');
    $tree.tree('selectNode', c5);

    equal($tree.tree('getSelectedNode').name, 'c5');

    var data2 = [
        { label: 'c7' },
        { label: 'c8' }
    ];
    $tree.tree('loadData', data2, child3);

    // c5 must be deselected
    equal($tree.tree('getSelectedNode'), false);

    // - select c7; load new data under child3; note that c7 has no id
    $tree.tree('selectNode', $tree.tree('getNodeByName', 'c7'));

    equal($tree.tree('getSelectedNode').name, 'c7');

    $tree.tree('loadData', [ 'c9' ], child3);

    equal($tree.tree('getSelectedNode'), false);

    // - select c9 (which has no id); load new nodes under child2
    $tree.tree('selectNode', $tree.tree('getNodeByName', 'c9'));

    var child2 = $tree.tree('getNodeByName', 'child2');
    $tree.tree('loadData', [ 'c10' ], child2);

    equal($tree.tree('getSelectedNode').name, 'c9');
});

test('openNode and closeNode', function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    var node2 = $tree.tree('getNodeByName', 'node2');
    equal(node2.name, 'node2');
    equal(node2.is_open, undefined);

    // 1. open node2
    $tree.tree('openNode', node2, false);
    equal(node2.is_open, true);
    equal(isNodeOpen($(node2.element)), true);

    // 2. close node2
    $tree.tree('closeNode', node2, false);
    equal(node2.is_open, false);
    equal(isNodeClosed($(node2.element)), true);

    // 3. open child1
    var node1 = $tree.tree('getNodeByName', 'node1');
    var child1 = $tree.tree('getNodeByName', 'child1');

    // add a child to child1 so it is a folder
    $tree.tree('appendNode', 'child1a', child1);

    // node1 is initialy closed
    equal(node1.is_open, undefined);

    // open child1
    $tree.tree('openNode', child1, false);

    // node1 and child1 are now open1
    equal(node1.is_open, true);
    equal(child1.is_open, true);
});

test('selectNode', function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        selectable: true
    });

    var node1 = $tree.tree('getTree').children[0];
    var node2 = $tree.tree('getTree').children[1];
    var child3 = node2.children[0];

    equal(child3.name, 'child3');
    equal(node1.is_open, undefined);
    equal(node2.is_open, undefined);
    equal(child3.is_open, undefined);

    // -- select node 'child3', which is a child of 'node2'; must_open_parents = true
    $tree.tree('selectNode', child3, true);
    equal($tree.tree('getSelectedNode').name, 'child3');

    equal(node1.is_open, undefined);
    equal(node2.is_open, true);
    equal(child3.is_open, undefined);

    // -- select node 'node1'
    $tree.tree('selectNode', node1);
    equal($tree.tree('getSelectedNode').name, 'node1');

    // -- is 'node1' selected?
    ok($tree.tree('isNodeSelected', node1));

    // -- deselect
    $tree.tree('selectNode', null);
    equal($tree.tree('getSelectedNode'), false);
});

test('selectNode when another node is selected', function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        selectable: true
    });

    var node1 = $tree.tree('getTree').children[0];
    var node2 = $tree.tree('getTree').children[1];


    // -- select node 'node2'
    $tree.tree('selectNode', node2);
    equal($tree.tree('getSelectedNode').name, 'node2');

    // -- setting event
    // -- is node 'node2' named 'deselected_node' in object's attributes?
    stop();
    $tree.bind('tree.select', function(e) {
        start();
        equal(e.deselected_node, node2);
    });

    // -- select node 'node1'; node 'node2' is selected before it
    $tree.tree('selectNode', node1);
    equal($tree.tree('getSelectedNode').name, 'node1');

    ok($tree.tree('isNodeSelected', node1));
});

test('click toggler', function() {
    // setup
    stop();

    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        selectable: true
    });

    var $title = $tree.find('li:eq(0)').find('> .jqtree-element > span.jqtree-title');
    equal($title.text(), 'node1');
    var $toggler = $title.prev();
    ok($toggler.is('a.jqtree-toggler.jqtree-closed'));

    $tree.bind('tree.open', function(e) {
        // 2. handle 'open' event
        start();
        equal(e.node.name, 'node1');
        stop();

        // 3. click toggler again
        $toggler.click();
    });

    $tree.bind('tree.close', function(e) {
        start();
        equal(e.node.name, 'node1');
    });

    // 1. click toggler of 'node1'
    $toggler.click();
});

test('getNodeById', function() {
	// setup
	var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });
    var node2 = $tree.tree('getNodeByName', 'node2');

    // 1. get 'node2' by id
    equal(
        $tree.tree('getNodeById', 124).name,
        'node2'
    );

    // 2. get id that does not exist
    equal($tree.tree('getNodeById', 333), null);

    // 3. get id by string
    equal(
        $tree.tree('getNodeById', '124').name,
        'node2'
    );

    // 4. add node with string id; search by int
    $tree.tree(
        'appendNode',
        {
            label: 'abc',
            id: '234'
        }
    );

    equal(
        $tree.tree('getNodeById', 234).name,
        'abc'
    );
    equal(
        $tree.tree('getNodeById', '234').name,
        'abc'
    );

    // 5. load subtree in node2
    var subtree_data = [
        {
            label: 'sub1',
            id: 200,
            children: [
                {label: 'sub2', id: 201}
            ]
        }
    ];
    $tree.tree('loadData',  subtree_data, node2);
    var t = $tree.tree('getTree');

    equal(
        $tree.tree('getNodeById', 200).name,
        'sub1'
    );
    equal(
        $tree.tree('getNodeById', 201).name,
        'sub2'
    );
});

test('autoOpen', function() {
    var $tree = $('#tree1');

    function formatOpenFolders() {
        var open_nodes = [];
        $tree.find('li').each(function() {
            var $li = $(this);
            if ($li.is('.jqtree-folder') && ! $li.is('.jqtree-closed')) {
                var label = $li.children('.jqtree-element').find('span').text();
                open_nodes.push(label);
            };
        });

        return open_nodes.join(';');
    }

    /*
    -l1n1 (level 0)
    ----l2n1 (1)
    ----l2n2 (1)
    -------l3n1 (2)
    ----------l4n1 (3)
    -l1n2
    */
    var data = [
        {
            label: 'l1n1',
            children: [
                'l2n1',
                {
                    label: 'l2n2',
                    children: [
                        {
                            label: 'l3n1',
                            children: [
                                'l4n1'
                            ]
                        }
                    ]
                }
            ]
        },
        'l1n2'
    ];

    // 1. autoOpen is false
    $tree.tree({
        data: data,
        autoOpen: false
    });
    equal(formatOpenFolders(), '');

    $tree.tree('destroy');

    // 2. autoOpen is true
    $tree.tree({
        data: data,
        autoOpen: true
    });
    equal(formatOpenFolders(), 'l1n1;l2n2;l3n1');

    $tree.tree('destroy');

    // 3. autoOpen level 1
    $tree.tree({
        data: data,
        autoOpen: 1
    });
    equal(formatOpenFolders(), 'l1n1;l2n2');
});

test('onCreateLi', function() {
    // 1. init tree with onCreateLi
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        onCreateLi: function(node, $li) {
            var $span = $li.children('.jqtree-element').find('span');
            $span.html('_' + node.name + '_');
        }
    });

    equal(
        $tree.find('span:eq(0)').text(),
        '_node1_'
    );
});

test('save state', function() {
    // setup
    var state = null;

    // Fake $.cookie plugin for browsers that do not support localstorage
    $.cookie = function(key, param2, param3) {
        if (typeof param3 == 'object') {
            // set
            state = param2;
        }
        else {
            // get
            return state;
        }
    }

    // Remove state from localstorage
    if (typeof localStorage != 'undefined') {
        localStorage.setItem('my_tree', null);
    }

    // 1. init tree
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        selectable: true,
        saveState: 'my_tree'
    });

    var tree = $tree.tree('getTree');
    equal($tree.tree('getSelectedNode'), false);

    // 2. select node -> state is saved
    $tree.tree('selectNode', tree.children[0]);
    equal($tree.tree('getSelectedNode').name, 'node1');

    // 3. init tree again
    $tree.tree('destroy');

    $tree.tree({
        data: example_data,
        selectable: true,
        saveState: 'my_tree'
    });

    equal($tree.tree('getSelectedNode').name, 'node1');

    $.cookie = null;
});

test('generate hit areas', function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    // 1. get hit areas
	var node = $tree.tree('getNodeById', 123);
    var hit_areas = $tree.tree('testGenerateHitAreas', node);

    var strings = $.map(hit_areas, function(hit_area) {
        return hit_area.node.name + ' ' + Position.getName(hit_area.position);
    });
    equal(strings.join(';'), 'node1 none;node2 inside;node2 after');
});

test('removeNode', function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        selectable: true
    });

    // 1. Remove selected node; node is 'child1'
    var child1 = $tree.tree('getNodeByName', 'child1');
    $tree.tree('selectNode', child1);

    equal($tree.tree('getSelectedNode').name, 'child1');

    $tree.tree('removeNode', child1);

    equal(
        formatTitles($tree),
        'node1 child2 node2 child3'
    );

    // getSelectedNode must now return false
    equal($tree.tree('getSelectedNode'), false);

    // 2. No node is selected; remove child3
    $tree.tree('loadData', example_data);

    var child3 = $tree.tree('getNodeByName', 'child3');
    $tree.tree('removeNode', child3);

    equal(
        formatTitles($tree),
        'node1 child1 child2 node2'
    );

    equal($tree.tree('getSelectedNode'), false);

    // 3. Remove parent of selected node
    $tree.tree('loadData', example_data);

    child1 = $tree.tree('getNodeByName', 'child1');
    var node1 = $tree.tree('getNodeByName', 'node1');

    $tree.tree('selectNode', child1);

    $tree.tree('removeNode', node1);

    // node is unselected
    equal($tree.tree('getSelectedNode'), false);

    // 4. Remove unselected node without an id
    $tree.tree('loadData', example_data2);

    var c1 = $tree.tree('getNodeByName', 'c1');

    $tree.tree('removeNode', c1);

    equal(
        formatTitles($tree),
        'main c2'
    )
});

test('appendNode', function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    var node1 = $tree.tree('getNodeByName', 'node1');

    // 1. Add child3 to node1
    $tree.tree('appendNode', 'child3', node1);

    equal(
        formatTitles($(node1.element)),
        'node1 child1 child2 child3'
    );

    // 2. Add child4 to child1
    var child1 = $tree.tree('getNodeByName', 'child1');

    // Node 'child1' does not have a toggler button
    equal(
        $(child1.element).find('> .jqtree-element > .jqtree-toggler').length,
        0
    );

    $tree.tree('appendNode', 'child4', child1);

    equal(formatTitles($(child1.element)), 'child1 child4');

    // Node 'child1' must get a toggler button
    equal(
        $(child1.element).find('> .jqtree-element > .jqtree-toggler').length,
        1
    );
});

test('prependNode', function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    var node1 = $tree.tree('getNodeByName', 'node1');

    // 1. Prepend child0 to node1
    $tree.tree('prependNode', 'child0', node1);

    equal(
        formatTitles($(node1.element)),
        'node1 child0 child1 child2'
    );
});
test('init event', function() {
    // setup
    var $tree = $('#tree1');

    $tree.bind('tree.init', function() {
        start();

        // Check that we can call functions in 'tree.init' event
        equal($tree.tree('getNodeByName', 'node2').name, 'node2');
    });
    stop();

    $tree.tree({
        data: example_data
    });
});

test('updateNode', function() {
    // setup
    var $tree = $('#tree1');

    $tree.tree({ data: example_data });

    equal(formatTitles($tree), 'node1 child1 child2 node2 child3');

    // -- update label
    var node2 = $tree.tree('getNodeByName', 'node2');
    $tree.tree('updateNode', node2, 'CHANGED');

    equal(formatTitles($tree), 'node1 child1 child2 CHANGED child3');
    equal(node2.name, 'CHANGED');

    // -- update data
    $tree.tree(
        'updateNode',
        node2,
        {
            name: 'xyz',
            tag1: 'abc'
        }
    );

    equal(formatTitles($tree), 'node1 child1 child2 xyz child3');
    equal(node2.name, 'xyz');
    equal(node2.tag1, 'abc');

    // - update id
    equal(node2.id, 124);

    $tree.tree('updateNode', node2, {id: 555});

    equal(node2.id, 555);
    equal(node2.name, 'xyz');

    // get node by id
    var node_555 = $tree.tree('getNodeById', 555);
    equal(node_555.name, 'xyz');

    var node_124 = $tree.tree('getNodeById', 124);
    equal(node_124, undefined);

    // update child1
    var child1 = $tree.tree('getNodeByName', 'child1');

    $tree.tree('updateNode', child1, 'child1a');

    equal(formatTitles($tree), 'node1 child1a child2 xyz child3');

    // select child1
    $tree.tree('selectNode', child1);
    $tree.tree('updateNode', child1, 'child1b');

    ok($(child1.element).hasClass('jqtree-selected'));
});

test('moveNode', function() {
    // setup
    var $tree = $('#tree1');

    $tree.tree({ data: example_data });

    var child1 = $tree.tree('getNodeByName', 'child1');
    var child2 = $tree.tree('getNodeByName', 'child2');
    var node1 = $tree.tree('getNodeByName', 'node1');
    var node2 = $tree.tree('getNodeByName', 'node2');

    // -- Move child1 after node2
    $tree.tree('moveNode', child1, node2, 'after');

    equal(formatTitles($tree), 'node1 child2 node2 child3 child1');

    // -- Check that illegal moves are skipped
    $tree.tree('moveNode', node1, child2, 'inside');
});

test('load on demand', function() {
    // setup
    var $tree = $('#tree1');

    $tree.tree({
        data: [
            {
                id: 1,
                label: 'node1',
                load_on_demand: true
            }
        ],
        dataUrl: '/tree/'
    });

    $.mockjax({
        url: '*',
        response: function(options) {
            equal(options.url, '/tree/', '2');
            deepEqual(options.data, { 'node' : 1 }, '3')

            this.responseText = [
                {
                    id: 2,
                    label: 'child1'
                }
            ];
        },
        logging: false
    });

    // -- open node
    $tree.bind('tree.refresh', function(e) {
        start();

        equal(formatTitles($tree), 'node1 child1', '4');
    });

    var node1 = $tree.tree('getNodeByName', 'node1');
    equal(formatTitles($tree), 'node1', '1');

    $tree.tree('openNode', node1, true);

    stop();
});

test('addNodeAfter', function() {
    // setup
    var $tree = $('#tree1');

    $tree.tree({ data: example_data });
    var node1 = $tree.tree('getNodeByName', 'node1');

    // -- add node after node1
    $tree.tree('addNodeAfter', 'node3', node1);

    equal(formatTitles($tree), 'node1 child1 child2 node3 node2 child3');
});

test('addNodeBefore', function() {
    // setup
    var $tree = $('#tree1');

    $tree.tree({ data: example_data });
    var node1 = $tree.tree('getNodeByName', 'node1');

    // -- add node before node1
    var new_node = $tree.tree('addNodeBefore', 'node3', node1);

    equal(formatTitles($tree), 'node3 node1 child1 child2 node2 child3');
});

test('addParentNode', function() {
    // setup
    var $tree = $('#tree1');

    $tree.tree({ data: example_data });
    var child3 = $tree.tree('getNodeByName', 'child3');

    // -- add parent to child3
    $tree.tree('addParentNode', 'node3', child3);

    equal(formatTitles($tree), 'node1 child1 child2 node2 node3 child3');
});

test('mouse events', function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        dragAndDrop: true,
        autoOpen: true
    });
    $tree.tree('setMouseDelay', 0);

    function getTitleElement(node_name) {
        var node = $tree.tree('getNodeByName', node_name);
        var $el = $(node.element);
        return $($el.find('.jqtree-title'));
    }

    var $node1 = getTitleElement('node1');
    var $child3 = getTitleElement('child3');

    // Move node1 inside child3
    // trigger mousedown event on node1
    $node1.trigger(
        $.Event('mousedown', { which: 1 })
    );

    // trigger mouse move to child3
    var child3_offset = $child3.offset();
    $tree.trigger(
        $.Event('mousemove', { pageX: child3_offset.left, pageY: child3_offset.top })
    );
    $tree.trigger('mouseup');

    equal(
        formatTitles($tree),
        'node2 child3 node1 child1 child2'
    );
});

test('multiple select', function() {
    // setup
    var $tree = $('#tree1');
    $tree.tree({ data: example_data });

    var child1 = $tree.tree('getNodeByName', 'child1');
    var child2 = $tree.tree('getNodeByName', 'child2');

    // -- add nodes to selection
    // todo: more nodes as parameters?
    // todo: rename to 'selection.add' or 'selection' 'add'?
    $tree.tree('addToSelection', child1);
    $tree.tree('addToSelection', child2);

    // -- get selected nodes
    var selected_nodes = $tree.tree('getSelectedNodes');
    equal(
        formatNodes(selected_nodes),
        'child1 child2'
    );
});

test('keyboard', function() {
    // setup
    var $tree = $('#tree1');

    function keyDown(key) {
        $tree.trigger(
            $.Event('keydown', { which: key })
        );
    }

    $tree.tree({ data: example_data });

    var node1 = $tree.tree('getNodeByName', 'node1');

    // select node1
    $tree.tree('selectNode', node1);
    equal(node1.is_open, undefined);

    // - move down; -> node2
    keyDown(40);
    equal($tree.tree('getSelectedNode').name, 'node2');

    // - move up; -> back to node1
    keyDown(38);
    equal($tree.tree('getSelectedNode').name, 'node1');

    // - move right; open node1
    keyDown(39);
    equal(node1.is_open, true);
    equal($tree.tree('getSelectedNode').name, 'node1');

    // - select child3 and move up -> node2
    $tree.tree('selectNode', $tree.tree('getNodeByName', 'child3'));
    keyDown(38);
    equal($tree.tree('getSelectedNode').name, 'node2');

    // - move up -> child2
    keyDown(38);
    equal($tree.tree('getSelectedNode').name, 'child2');

    // - select node1 and move left ->  close
    $tree.tree('selectNode', node1);
    keyDown(37);
    equal(node1.is_open, false);
    equal($tree.tree('getSelectedNode').name, 'node1');
});

test('getNodesByProperty', function(){
  // setup
  var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });
    var node2 = $tree.tree('getNodeByName', 'node2');

    // 1. get 'node1' by property
    equal(
        $tree.tree('getNodesByProperty', 'int_property', 1)[0].name,
        'node1'
    );

    // 2. get property that does not exist in any node
    equal($tree.tree('getNodesByProperty', 'int_property', 123).length, 0);

    // 3. get string property
    equal(
        $tree.tree('getNodesByProperty', 'str_property', '1')[0].name,
        'node1'
    );

    // 4. add node with string id; search by int
    $tree.tree(
        'appendNode',
        {
            label: 'abc',
            id: '234',
            str_property: '111',
            int_property: 111
        }
    );

    equal(
        $tree.tree('getNodesByProperty', 'int_property', 111)[0].name,
        'abc'
    );
    equal(
        $tree.tree('getNodesByProperty', 'str_property', '111')[0].name,
        'abc'
    );

    // 5. load subtree in node2
    var subtree_data = [
        {
            label: 'sub1',
            id: 200,
            int_property: 222,
            children: [
                {label: 'sub2', id: 201, int_property: 444}
            ]
        }
    ];
    $tree.tree('loadData',  subtree_data, node2);
    var t = $tree.tree('getTree');

    equal(
        $tree.tree('getNodesByProperty', 'int_property', 222)[0].name,
        'sub1'
    );
    equal(
        $tree.tree('getNodesByProperty', 'int_property', 444)[0].name,
        'sub2'
    );
});

QUnit.module("Tree");
test('constructor', function() {
    // 1. Create node from string
    var node = new Node('n1');

    equal(node.name, 'n1');
    equal(node.children.length, 0);
    equal(node.parent, null);

    // 2. Create node from object
    node = new Node({
        label: 'n2',
        id: 123,
        parent: 'abc',  // parent must be ignored
        children: ['c'], // children must be ignored
        url: '/'
    });

    equal(node.name, 'n2');
    equal(node.id, 123);
    equal(node.url, '/');
    equal(node.label, undefined);
    equal(node.children.length, 0);
    equal(node.parent, null);
});

test("create tree from data", function() {
    function checkData(tree) {
        equal(
            formatNodes(tree.children),
            'node1 node2',
            'nodes on level 1'
        );
        equal(
            formatNodes(tree.children[0].children),
            'child1 child2',
            'children of node1'
        );
        equal(
            formatNodes(tree.children[1].children),
            'child3',
            'children of node2'
        );
        equal(
            tree.children[0].id,
            123,
            'id'
        );
    }

    // - create tree from example data
    var tree = new Node(null, true);
    tree.loadFromData(example_data);
    checkData(tree);

    // - create tree from new data format
    var data = [
        {
            label: 'node1',
            id: 123,
            children: ['child1', 'child2']  // nodes are only defined by a string
        },
        {
            label: 'node2',
            id: 124,
            children: ['child3']
        }
    ];
    var tree = new Node(null, true);
    tree.loadFromData(data);
    checkData(tree);
});

test("addChild", function() {
    var tree = new Node('tree1', true);
    tree.addChild(
        new Node('abc')
    );
    tree.addChild(
        new Node('def')
    );

    equal(
        formatNodes(tree.children),
        'abc def',
        'children'
    );

    var node = tree.children[0];
    equal(
        node.parent.name,
        'tree1',
        'parent of node'
    );
});

test('addChildAtPosition', function() {
    var tree = new Node(null, true);
    tree.addChildAtPosition(new Node('abc'), 0);  // first
    tree.addChildAtPosition(new Node('ghi'), 2);  // index 2 does not exist
    tree.addChildAtPosition(new Node('def'), 1);
    tree.addChildAtPosition(new Node('123'), 0);

    equal(
        formatNodes(tree.children),
        '123 abc def ghi',
        'children'
    );
});

test('removeChild', function() {
    var tree = new Node(null, true);

    var abc = new Node({'label': 'abc', 'id': 1});
    var def = new Node({'label': 'def', 'id': 2});
    var ghi = new Node({'label': 'ghi', 'id': 3});

    tree.addChild(abc);
    tree.addChild(def);
    tree.addChild(ghi);

    var jkl = new Node({'label': 'jkl', 'id': 4});
    def.addChild(jkl);

    equal(
        formatNodes(tree.children),
        'abc def ghi',
        'children'
    );

    equal(tree.id_mapping[2].name, 'def');
    equal(tree.id_mapping[4].name, 'jkl');

    // remove 'def'
    tree.removeChild(def);
    equal(
        formatNodes(tree.children),
        'abc ghi',
        'children'
    );

    equal(tree.id_mapping[2], null);
    equal(tree.id_mapping[4], null);

    // remove 'ghi'
    tree.removeChild(ghi);
    equal(
        formatNodes(tree.children),
        'abc',
        'children'
    );

    // remove 'abc'
    tree.removeChild(abc);
    equal(
        formatNodes(tree.children),
        '',
        'children'
    );
});

test('getChildIndex', function() {
    // setup
    var tree = new Node(null, true);

    var abc = new Node('abc');
    var def = new Node('def');
    var ghi = new Node('ghi');
    tree.addChild(abc);
    tree.addChild(def);
    tree.addChild(ghi);

    // 1. Get child index of 'def'
    equal(tree.getChildIndex(def), 1);

    // 2. Get child index of non-existing node
    equal(tree.getChildIndex(new Node('xyz')), -1);
});

test('hasChildren', function() {
    var tree = new Node(null, true);
    equal(
        tree.hasChildren(),
        false,
        'tree without children'
    );

    tree.addChild(new Node('abc'));
    equal(
        tree.hasChildren(),
        true,
        'tree has children'
    );
});

test('iterate', function() {
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // iterate over all the nodes
    var nodes = [];
    tree.iterate(
        function(node, level) {
            nodes.push(node);
            return true;
        }
    );

    equal(
        formatNodes(nodes),
        'node1 child1 child2 node2 child3',
        'all nodes'
    );

    // iterate over nodes on first level
    nodes = [];
    tree.iterate(
        function(node, level) {
            nodes.push(node);
            return false;
        }
    );

    equal(
        formatNodes(nodes),
        'node1 node2',
        'nodes on first level'
    );

    // add child 4
    var node3 = tree.getNodeById(124).children[0];
    node3.addChild(
        new Node('child4')
    );

    // test level parameter
    nodes = [];
    tree.iterate(
        function(node, level) {
            nodes.push(node.name + ' ' + level);
            return true;
        }
    );

    equal(
        nodes.join(','),
        'node1 0,child1 1,child2 1,node2 0,child3 1,child4 2'
    );
});

test('moveNode', function() {
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    /*
      node1
      ---child1
      ---child2
      node2
      ---child3
    */

    var node1 = tree.children[0];
    var node2 = tree.children[1];
    var child1 = node1.children[0];
    var child2 = node1.children[1];
    equal(node2.name, 'node2', 'node2 name');
    equal(child2.name, 'child2', 'child2 name');

    // move child2 after node2
    tree.moveNode(child2, node2, Position.AFTER);

    /*
      node1
      ---child1
      node2
      ---child3
      child2
    */
    equal(
        formatNodes(tree.children),
        'node1 node2 child2',
        'tree nodes at first level'
    );
    equal(
        formatNodes(node1.children),
        'child1',
        'node1 children'
    );

    // move child1 inside node2
    // this means it's the first child
    tree.moveNode(child1, node2, Position.INSIDE);

    /*
      node1
      node2
      ---child1
      ---child3
      child2
    */
    equal(
        formatNodes(node2.children),
        'child1 child3',
        'node2 children'
    );
    equal(
        formatNodes(node1.children),
        '',
        'node1 has no children'
    );

    // move child2 before child1
    tree.moveNode(child2, child1, Position.BEFORE);

    /*
      node1
      node2
      ---child2
      ---child1
      ---child3
    */
    equal(
        formatNodes(node2.children),
        'child2 child1 child3',
        'node2 children'
    );
    equal(
        formatNodes(tree.children),
        'node1 node2',
        'tree nodes at first level'
    );
});

test('initFromData', function() {
    var data =
        {
            label: 'main',
            children: [
                'c1',
                {
                    label: 'c2',
                    id: 201
                }
            ]
        };
    var node = new Node(null, true);
    node.initFromData(data);

    equal(node.name, 'main')
    equal(
        formatNodes(node.children),
        'c1 c2',
        'children'
    );
    equal(node.children[1].id, 201);
});

test('getData', function() {
    // 1. empty node
    var node = new Node(null, true);
    deepEqual(node.getData(), []);

    // 2.node with data
    node.loadFromData(
        [
            {
                label: 'n1',
                children: [
                    {
                        label: 'c1'
                    }
                ]
            }
        ]
    );
    deepEqual(
        node.getData(),
        [
            {
                name: 'n1',
                children: [
                    {
                        name: 'c1'
                    }
                ]
            }
        ]
    );
});

test('addAfter', function() {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    /*
    -node1
    ---c1
    ---c2
    -node2
    ---c3
    */

    equal(formatNodes(tree.children), 'node1 node2');

    // - Add 'node_b' after node2
    var node2 = tree.getNodeByName('node2');
    node2.addAfter('node_b');

    equal(formatNodes(tree.children), 'node1 node2 node_b');

    var node_b = tree.getNodeByName('node_b');
    equal(node_b.name, 'node_b');

    // - Add 'node_a' after node1
    var node1 = tree.getNodeByName('node1');
    node1.addAfter('node_a');

    equal(formatNodes(tree.children), 'node1 node_a node2 node_b');

    // - Add 'node_c' after node_b; new node is an object
    node_b.addAfter({
        label: 'node_c',
        id: 789
    });

    var node_c = tree.getNodeByName('node_c');
    equal(node_c.id, 789);

    equal(formatNodes(tree.children), 'node1 node_a node2 node_b node_c');

    // - Add after root node; this is not possible
    equal(tree.addAfter('node_x'), null);
});

test('addBefore', function() {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // - Add 'node_0' before node1
    var node1 = tree.getNodeByName('node1');
    node1.addBefore('node0');
    equal(formatNodes(tree.children), 'node0 node1 node2');

    // - Add before root node; this is not possile
    equal(tree.addBefore('x'), null);
});

test('addParent', function() {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // - Add node 'root' as parent of node1
    // Note that node also becomes a child of 'root'
    var node1 = tree.getNodeByName('node1');
    node1.addParent('root');

    var root = tree.getNodeByName('root');
    equal(formatNodes(root.children), 'node1 node2');

    // - Add parent to root node; not possible
    equal(tree.addParent('x'), null);
});

test('remove', function() {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    var child1 = tree.getNodeByName('child1');
    var node1 = tree.getNodeByName('node1');

    equal(formatNodes(node1.children), 'child1 child2');
    equal(child1.parent, node1);

    // 1. Remove child1
    child1.remove();

    equal(formatNodes(node1.children), 'child2');
    equal(child1.parent, null);
});

test('append', function() {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    var node1 = tree.getNodeByName('node1');

    // 1. Add child3 to node1
    node1.append('child3');

    equal(formatNodes(node1.children), 'child1 child2 child3');
});

test('prepend', function() {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    var node1 = tree.getNodeByName('node1');

    // 1. Prepend child0 to node1
    node1.prepend('child0');

    equal(formatNodes(node1.children), 'child0 child1 child2');
});

test('getNodeById', function() {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // 1. Get node with id 124
    var node = tree.getNodeById(124);
    equal(node.name, 'node2');

    // 2. Delete node with id 124 and search again
    node.remove();

    equal(tree.getNodeById(124), null);

    // 3. Add node with id 456 and search for it
    var child3 = tree.getNodeByName('child2');
    child3.append({
        id: 456,
        label: 'new node'
    });

    node = tree.getNodeById(456);
    equal(node.name, 'new node');
});

test('getLevel', function() {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // 1. get level for node1 and child1
    equal(tree.getNodeByName('node1').getLevel(), 1);
    equal(tree.getNodeByName('child1').getLevel(), 2);
});

test('loadFromData and id mapping', function() {
    // - get node from empty tree
    var tree = new Node(null, true);
    equal(tree.getNodeById(999), null);

    // - load example data in tree
    tree.loadFromData(example_data);
    equal(tree.getNodeById(124).name, 'node2');

    var child2 = tree.getNodeById(126);
    child2.addChild(
        new Node({label: 'child4', id: 128})
    );
    child2.addChild(
        new Node({label: 'child5', id: 129})
    );

    // - load data in node child2
    child2.loadFromData(['abc', 'def']);

    equal(tree.getNodeById(128), null);
    equal(child2.children.length, 2);
    equal(child2.children[0].name, 'abc');
});

test('removeChildren', function() {
    // - load example data
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // add child4 and child5
    var child2 = tree.getNodeById(126);
    equal(child2.name, 'child2');

    child2.addChild(
        new Node({label: 'child4', id: 128})
    );
    child2.addChild(
        new Node({label: 'child5', id: 129})
    );
    equal(tree.getNodeById(128).name, 'child4');

    // - remove children from child2
    child2.removeChildren();
    equal(tree.getNodeById(128), null);
    equal(child2.children.length, 0);
});

test('node with id 0', function() {
    // - load node with id 0
    var tree = new Node(null, true);
    tree.loadFromData([
        {
            id: 0,
            label: 'mynode'
        }
    ]);

    // - get node by id
    var node = tree.getNodeById(0);
    equal(node.name, 'mynode');

    // -- remove the node
    node.remove();

    equal(tree.getNodeById(0), undefined);
});

test('getPreviousSibling', function() {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // - getPreviousSibling
    equal(
        tree.getNodeByName('child2').getPreviousSibling().name,
        'child1'
    );
    equal(tree.getPreviousSibling(), null);
    equal(
        tree.getNodeByName('child1').getPreviousSibling(),
        null
    );
});

test('getNextSibling', function() {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // - getNextSibling
    equal(
        tree.getNodeByName('node1').getNextSibling().name,
        'node2'
    );
    equal(
        tree.getNodeByName('node2').getNextSibling(),
        null
    );
    equal(tree.getNextSibling(), null);
});

test('getNodesByProperty', function() {
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    nodes = tree.getNodesByProperty('name', 'child1');

    equal(nodes.length, 1);
    equal(nodes[0].name, 'child1');
});


QUnit.module('util');

test('indexOf', function() {
    equal(indexOf([3, 2, 1], 1), 2);
    equal(_indexOf([3, 2, 1], 1), 2);
    equal(indexOf([4, 5, 6], 1), -1);
    equal(_indexOf([4, 5, 6], 1), -1);
});

test('Position.getName', function() {
    equal(Position.getName(Position.BEFORE), 'before');
    equal(Position.getName(Position.AFTER), 'after');
    equal(Position.getName(Position.INSIDE), 'inside');
    equal(Position.getName(Position.NONE), 'none');
});

test('Position.nameToIndex', function() {
    equal(Position.nameToIndex('before'), Position.BEFORE);
    equal(Position.nameToIndex('after'), Position.AFTER);
    equal(Position.nameToIndex(''), 0);
});

},{"jquery-mockjax":1}]},{},[2])