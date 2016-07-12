(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(root, factory) {
	'use strict';

	// AMDJS module definition
	if ( typeof define === 'function' && define.amd && define.amd.jQuery ) {
		define(['jquery'], function($) {
			return factory($, root);
		});

	// CommonJS module definition
	} else if ( typeof exports === 'object') {

		// NOTE: To use Mockjax as a Node module you MUST provide the factory with
		// a valid version of jQuery and a window object (the global scope):
		// var mockjax = require('jquery.mockjax')(jQuery, window);

		module.exports = factory;

	// Global jQuery in web browsers
	} else {
		return factory(root.jQuery || root.$, root);
	}
}(this, function($, window) {
	'use strict';

	var _ajax = $.ajax,
		mockHandlers = [],
		mockedAjaxCalls = [],
		unmockedAjaxCalls = [],
		CALLBACK_REGEX = /=\?(&|$)/,
		jsc = (new Date()).getTime(),
		DEFAULT_RESPONSE_TIME = 500;

	// Parse the given XML string.
	function parseXML(xml) {
		if ( window.DOMParser === undefined && window.ActiveXObject ) {
			window.DOMParser = function() { };
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
				if ( err.length === 1 ) {
					throw new Error('Error: ' + $(xmlDoc).text() );
				}
			} else {
				throw new Error('Unable to parse XML');
			}
			return xmlDoc;
		} catch( e ) {
			var msg = ( e.name === undefined ? e : e.name + ': ' + e.message );
			$(document).trigger('xmlParseError', [ msg ]);
			return undefined;
		}
	}

	// Check if the data field on the mock handler and the request match. This
	// can be used to restrict a mock handler to being used only when a certain
	// set of data is passed to it.
	function isMockDataEqual( mock, live ) {
		logger.debug( mock, ['Checking mock data against request data', mock, live] );
		var identical = true;

		if ( $.isFunction(mock) ) {
			return !!mock(live);
		}

		// Test for situations where the data is a querystring (not an object)
		if (typeof live === 'string') {
			// Querystring may be a regex
			if ($.isFunction( mock.test )) {
				return mock.test(live);
			} else if (typeof mock === 'object') {
				live = getQueryParams(live);
			} else {
				return mock === live;
			}
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
						identical = identical && ( mock[k] === live[k] );
					}
				}
			}
		});

		return identical;
	}

	function getQueryParams(queryString) {
		var i, l, param, tmp,
			paramsObj = {},
			params = String(queryString).split(/&/);

		for (i=0, l=params.length; i<l; ++i) {
			param = params[i];
			try {
				param = decodeURIComponent(param.replace(/\+/g, ' '));
				param = param.split(/=/);
			} catch(e) {
				// Can't parse this one, so let it go?
				continue;
			}

			if (paramsObj[param[0]]) {
				// this is an array query param (more than one entry in query)
				if (!paramsObj[param[0]].splice) {
					// if not already an array, make it one
					tmp = paramsObj[param[0]];
					paramsObj[param[0]] = [];
					paramsObj[param[0]].push(tmp);
				}
				paramsObj[param[0]].push(param[1]);
			} else {
				paramsObj[param[0]] = param[1];
			}
		}

		logger.debug( null, ['Getting query params from string', queryString, paramsObj] );

		return paramsObj;
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

			// Apply namespace prefix to the mock handler's url.
			var namespace = handler.namespace || $.mockjaxSettings.namespace;
			if (!!namespace) {
				var namespacedUrl = [namespace, handler.url].join('/');
				namespacedUrl = namespacedUrl.replace(/(\/+)/g, '/');
				handler.url = namespacedUrl;
			}

			// Look for a simple wildcard '*' or a direct URL match
			var star = handler.url.indexOf('*');
			if (handler.url !== requestSettings.url && star === -1 ||
					!new RegExp(handler.url.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&').replace(/\*/g, '.+')).test(requestSettings.url)) {
				return null;
			}
		}

		// Inspect the request headers submitted
		if ( handler.requestHeaders ) {
			//No expectation for headers, do not mock this request
			if (requestSettings.headers === undefined) {
				return null;
			} else {
				var headersMismatch = false;
				$.each(handler.requestHeaders, function(key, value) {
					var v = requestSettings.headers[key];
					if(v !== value) {
						headersMismatch = true;
						return false;
					}
				});
				//Headers do not match, do not mock this request
				if (headersMismatch) {
					return null;
				}
			}
		}

		// Inspect the data submitted in the request (either POST body or GET query string)
		if ( handler.data ) {
			if ( !requestSettings.data || !isMockDataEqual(handler.data, requestSettings.data) ) {
				// They're not identical, do not mock this request
				return null;
			}
		}
		// Inspect the request type
		if ( handler && handler.type &&
				handler.type.toLowerCase() !== requestSettings.type.toLowerCase() ) {
			// The request type doesn't match (GET vs. POST)
			return null;
		}

		return handler;
	}

	function isPosNum(value) {
		return typeof value === 'number' && value >= 0;
	}

	function parseResponseTimeOpt(responseTime) {
		if ($.isArray(responseTime) && responseTime.length === 2) {
			var min = responseTime[0];
			var max = responseTime[1];
			if(isPosNum(min) && isPosNum(max)) {
				return Math.floor(Math.random() * (max - min)) + min;
			}
		} else if(isPosNum(responseTime)) {
			return responseTime;
		}
		return DEFAULT_RESPONSE_TIME;
	}

	// Process the xhr objects send operation
	function _xhrSend(mockHandler, requestSettings, origSettings) {
		logger.debug( mockHandler, ['Sending fake XHR request', mockHandler, requestSettings, origSettings] );

		// This is a substitute for < 1.4 which lacks $.proxy
		var process = (function(that) {
			return function() {
				return (function() {
					// The request has returned
					this.status = mockHandler.status;
					this.statusText = mockHandler.statusText;
					this.readyState	= 1;

					var finishRequest = function () {
						this.readyState	= 4;

						var onReady;
						// Copy over our mock to our xhr object before passing control back to
						// jQuery's onreadystatechange callback
						if ( requestSettings.dataType === 'json' && ( typeof mockHandler.responseText === 'object' ) ) {
							this.responseText = JSON.stringify(mockHandler.responseText);
						} else if ( requestSettings.dataType === 'xml' ) {
							if ( typeof mockHandler.responseXML === 'string' ) {
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
						if( typeof mockHandler.status === 'number' || typeof mockHandler.status === 'string' ) {
							this.status = mockHandler.status;
						}
						if( typeof mockHandler.statusText === 'string') {
							this.statusText = mockHandler.statusText;
						}
						// jQuery 2.0 renamed onreadystatechange to onload
						onReady = this.onload || this.onreadystatechange;

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
			logger.info( mockHandler, ['Retrieving proxy file: ' + mockHandler.proxy, mockHandler] );
			// We're proxying this request and loading in an external file instead
			_ajax({
				global: false,
				url: mockHandler.proxy,
				type: mockHandler.proxyType,
				data: mockHandler.data,
				async: requestSettings.async,
				dataType: requestSettings.dataType === 'script' ? 'text/plain' : requestSettings.dataType,
				complete: function(xhr) {
					// Fix for bug #105
					// jQuery will convert the text to XML for us, and if we use the actual responseXML here
					// then some other things don't happen, resulting in no data given to the 'success' cb
					mockHandler.responseXML = mockHandler.responseText = xhr.responseText;

					// Don't override the handler status/statusText if it's specified by the config
					if (isDefaultSetting(mockHandler, 'status')) {
						mockHandler.status = xhr.status;
					}
					if (isDefaultSetting(mockHandler, 'statusText')) {
						mockHandler.statusText = xhr.statusText;
					}

					if ( requestSettings.async === false ) {
						// TODO: Blocking delay
						process();
					} else {
						this.responseTimer = setTimeout(process, parseResponseTimeOpt(mockHandler.responseTime));
					}
				}
			});
		} else {
			// type === 'POST' || 'GET' || 'DELETE'
			if ( requestSettings.async === false ) {
				// TODO: Blocking delay
				process();
			} else {
				this.responseTimer = setTimeout(process, parseResponseTimeOpt(mockHandler.responseTime));
			}
		}

	}

	// Construct a mocked XHR Object
	function xhr(mockHandler, requestSettings, origSettings, origHandler) {
		logger.debug( mockHandler, ['Creating new mock XHR object', mockHandler, requestSettings, origSettings, origHandler] );

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
				} else if ( header.toLowerCase() === 'last-modified' ) {
					return mockHandler.lastModified || (new Date()).toString();
				} else if ( header.toLowerCase() === 'etag' ) {
					return mockHandler.etag || '';
				} else if ( header.toLowerCase() === 'content-type' ) {
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
					headers += k + ': ' + v + '\n';
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

		requestSettings.dataType = 'json';
		if(requestSettings.data && CALLBACK_REGEX.test(requestSettings.data) || CALLBACK_REGEX.test(requestSettings.url)) {
			createJsonpCallback(requestSettings, mockHandler, origSettings);

			// We need to make sure
			// that a JSONP style response is executed properly

			var rurl = /^(\w+:)?\/\/([^\/?#]+)/,
				parts = rurl.exec( requestSettings.url ),
				remote = parts && (parts[1] && parts[1] !== location.protocol || parts[2] !== location.host);

			requestSettings.dataType = 'script';
			if(requestSettings.type.toUpperCase() === 'GET' && remote ) {
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
		if ( requestSettings.type.toUpperCase() === 'GET' ) {
			if ( !CALLBACK_REGEX.test( requestSettings.url ) ) {
				requestSettings.url += (/\?/.test( requestSettings.url ) ? '&' : '?') +
					(requestSettings.jsonp || 'callback') + '=?';
			}
		} else if ( !requestSettings.data || !CALLBACK_REGEX.test(requestSettings.data) ) {
			requestSettings.data = (requestSettings.data ? requestSettings.data + '&' : '') + (requestSettings.jsonp || 'callback') + '=?';
		}
	}

	// Process a JSONP request by evaluating the mocked response text
	function processJsonpRequest( requestSettings, mockHandler, origSettings ) {
		logger.debug( mockHandler, ['Performing JSONP request', mockHandler, requestSettings, origSettings] );

		// Synthesize the mock request for adding a script tag
		var callbackContext = origSettings && origSettings.context || requestSettings,
			// If we are running under jQuery 1.5+, return a deferred object
			newMock = ($.Deferred) ? (new $.Deferred()) : null;

		// If the response handler on the moock is a function, call it
		if ( mockHandler.response && $.isFunction(mockHandler.response) ) {

			mockHandler.response(origSettings);


		} else if ( typeof mockHandler.responseText === 'object' ) {
			// Evaluate the responseText javascript in a global context
			$.globalEval( '(' + JSON.stringify( mockHandler.responseText ) + ')');

		} else if (mockHandler.proxy) {
			logger.info( mockHandler, ['Performing JSONP proxy request: ' + mockHandler.proxy, mockHandler] );

			// This handles the unique case where we have a remote URL, but want to proxy the JSONP
			// response to another file (not the same URL as the mock matching)
			_ajax({
				global: false,
				url: mockHandler.proxy,
				type: mockHandler.proxyType,
				data: mockHandler.data,
				dataType: requestSettings.dataType === 'script' ? 'text/plain' : requestSettings.dataType,
				complete: function(xhr) {
					$.globalEval( '(' + xhr.responseText + ')');
					completeJsonpCall( requestSettings, mockHandler, callbackContext, newMock );
				}
			});

			return newMock;

		} else {
			$.globalEval( '(' +
				((typeof mockHandler.responseText === 'string') ?
					('"' + mockHandler.responseText + '"') : mockHandler.responseText) +
			')');
		}

		completeJsonpCall( requestSettings, mockHandler, callbackContext, newMock );

		return newMock;
	}

	function completeJsonpCall( requestSettings, mockHandler, callbackContext, newMock ) {
		var json;

		// Successful response
		setTimeout(function() {
			jsonpSuccess( requestSettings, callbackContext, mockHandler );
			jsonpComplete( requestSettings, callbackContext );

			if ( newMock ) {
				try {
					json = $.parseJSON( mockHandler.responseText );
				} catch (err) { /* just checking... */ }

				newMock.resolveWith( callbackContext, [json || mockHandler.responseText] );
				logger.log( mockHandler, ['JSONP mock call complete', mockHandler, newMock] );
			}
		}, parseResponseTimeOpt( mockHandler.responseTime ));
	}


	// Create the required JSONP callback function for the request
	function createJsonpCallback( requestSettings, mockHandler, origSettings ) {
		var callbackContext = origSettings && origSettings.context || requestSettings;
		var jsonp = (typeof requestSettings.jsonpCallback === 'string' && requestSettings.jsonpCallback) || ('jsonp' + jsc++);

		// Replace the =? sequence both in the query string and the data
		if ( requestSettings.data ) {
			requestSettings.data = (requestSettings.data + '').replace(CALLBACK_REGEX, '=' + jsonp + '$1');
		}

		requestSettings.url = requestSettings.url.replace(CALLBACK_REGEX, '=' + jsonp + '$1');


		// Handle JSONP-style loading
		window[ jsonp ] = window[ jsonp ] || function() {
			jsonpSuccess( requestSettings, callbackContext, mockHandler );
			jsonpComplete( requestSettings, callbackContext );
			// Garbage collect
			window[ jsonp ] = undefined;

			try {
				delete window[ jsonp ];
			} catch(e) {}
		};
		requestSettings.jsonpCallback = jsonp;
	}

	// The JSONP request was successful
	function jsonpSuccess(requestSettings, callbackContext, mockHandler) {
		// If a local callback was specified, fire it and pass it the data
		if ( requestSettings.success ) {
			requestSettings.success.call( callbackContext, mockHandler.responseText || '', 'success', {} );
		}

		// Fire the global callback
		if ( requestSettings.global ) {
			(requestSettings.context ? $(requestSettings.context) : $.event).trigger('ajaxSuccess', [{}, requestSettings]);
		}
	}

	// The JSONP request was completed
	function jsonpComplete(requestSettings, callbackContext) {
		if ( requestSettings.complete ) {
			requestSettings.complete.call( callbackContext, {
				statusText: 'success',
				status: 200
			} , 'success' );
		}

		// The request was completed
		if ( requestSettings.global ) {
			(requestSettings.context ? $(requestSettings.context) : $.event).trigger('ajaxComplete', [{}, requestSettings]);
		}

		// Handle the global AJAX counter
		if ( requestSettings.global && ! --$.active ) {
			$.event.trigger( 'ajaxStop' );
		}
	}


	// The core $.ajax replacement.
	function handleAjax( url, origSettings ) {
		var mockRequest, requestSettings, mockHandler, overrideCallback;

		logger.debug( null, ['Ajax call intercepted', url, origSettings] );

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === 'object' ) {
			origSettings = url;
			url = undefined;
		} else {
			// work around to support 1.5 signature
			origSettings = origSettings || {};
			origSettings.url = url || origSettings.url;
		}

		// Extend the original settings for the request
		requestSettings = $.ajaxSetup({}, origSettings);
		requestSettings.type = requestSettings.method = requestSettings.method || requestSettings.type;

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
				logger.debug( mockHandlers[k], ['Mock does not match request', url, requestSettings] );
				// No valid mock found for this request
				continue;
			}

			if ($.mockjaxSettings.retainAjaxCalls) {
				mockedAjaxCalls.push(requestSettings);
			}

			// If logging is enabled, log the mock to the console
			logger.info( mockHandler, [
				'MOCK ' + requestSettings.type.toUpperCase() + ': ' + requestSettings.url,
				$.ajaxSetup({}, requestSettings)
			] );


			if ( requestSettings.dataType && requestSettings.dataType.toUpperCase() === 'JSONP' ) {
				if ((mockRequest = processJsonpMock( requestSettings, mockHandler, origSettings ))) {
					// This mock will handle the JSONP request
					return mockRequest;
				}
			}

			// We are mocking, so there will be no cross domain request, however, jQuery
			// aggressively pursues this if the domains don't match, so we need to
			// explicitly disallow it. (See #136)
			origSettings.crossDomain = false;

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

			/* jshint loopfunc:true */
			(function(mockHandler, requestSettings, origSettings, origHandler) {

				mockRequest = _ajax.call($, $.extend(true, {}, origSettings, {
					// Mock the XHR object
					xhr: function() { return xhr( mockHandler, requestSettings, origSettings, origHandler ); }
				}));
			})(mockHandler, requestSettings, origSettings, mockHandlers[k]);
			/* jshint loopfunc:false */

			return mockRequest;
		}

		// We don't have a mock request
		logger.log( null, ['No mock matched to request', url, origSettings] );
		if ($.mockjaxSettings.retainAjaxCalls) {
			unmockedAjaxCalls.push(origSettings);
		}
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

	/**
	 * Clears handlers that mock given url
	 * @param url
	 * @returns {Array}
	 */
	function clearByUrl(url) {
		var i, len,
			handler,
			results = [],
			match=url instanceof RegExp ?
				function(testUrl) { return url.test(testUrl); } :
				function(testUrl) { return url === testUrl; };
		for (i=0, len=mockHandlers.length; i<len; i++) {
			handler = mockHandlers[i];
			if (!match(handler.url)) {
				results.push(handler);
			} else {
				logger.log( handler, [
					'Clearing mock: ' + (handler && handler.url),
					handler
				] );
			}
		}
		return results;
	}


	// Public

	$.extend({
		ajax: handleAjax
	});

	var logger = {
		_log: function logger( mockHandler, args, level ) {
			var loggerLevel = $.mockjaxSettings.logging;
			if (mockHandler && typeof mockHandler.logging !== 'undefined') {
				loggerLevel = mockHandler.logging;
			}
			level = ( level === 0 ) ? level : ( level || logLevels.LOG );
			args = (args.splice) ? args : [ args ];

			// Is logging turned off for this mock or mockjax as a whole?
			// Or is this log message above the desired log level?
			if ( loggerLevel === false || loggerLevel < level ) {
				return;
			}

			if ( $.mockjaxSettings.log ) {
				return $.mockjaxSettings.log( mockHandler, args[1] || args[0] );
			} else if ( $.mockjaxSettings.logger && $.mockjaxSettings.logger[$.mockjaxSettings.logLevelMethods[level]] ) {
				return $.mockjaxSettings.logger[$.mockjaxSettings.logLevelMethods[level]].apply( $.mockjaxSettings.logger, args );
			}
		},
		/**
		 * Convenience method for logging a DEBUG level message
		 * @param  {Object} m  The mock handler in question
		 * @param  {Array|String|Object} a  The items to log
		 * @return {?}  Will return whatever the $.mockjaxSettings.logger method for this level would return (generally 'undefined')
		 */
		debug: function(m,a) { return logger._log(m,a,logLevels.DEBUG); },
		/**
		 * @see logger.debug
		 */
		log: function(m,a) { return logger._log(m,a,logLevels.LOG); },
		/**
		 * @see logger.debug
		 */
		info: function(m,a) { return logger._log(m,a,logLevels.INFO); },
		/**
		 * @see logger.debug
		 */
		warn: function(m,a) { return logger._log(m,a,logLevels.WARN); },
		/**
		 * @see logger.debug
		 */
		error: function(m,a) { return logger._log(m,a,logLevels.ERROR); }
	};

	var logLevels = {
		DEBUG: 4,
		LOG: 3,
		INFO: 2,
		WARN: 1,
		ERROR: 0
	};

	/**
	 * Default settings for mockjax. Some of these are used for defaults of
	 * individual mock handlers, and some are for the library as a whole.
	 * For individual mock handler settings, please see the README on the repo:
	 * https://github.com/jakerella/jquery-mockjax#api-methods
	 *
	 * @type {Object}
	 */
	$.mockjaxSettings = {
		log:				null, // this is only here for historical purposes... use $.mockjaxSettings.logger
		logger:				window.console,
		logging:			2,
		logLevelMethods:	['error', 'warn', 'info', 'log', 'debug'],
		namespace:			null,
		status:				200,
		statusText:			'OK',
		responseTime:		DEFAULT_RESPONSE_TIME,
		isTimeout:			false,
		throwUnmocked:		false,
		retainAjaxCalls:	true,
		contentType:		'text/plain',
		response:			'',
		responseText:		'',
		responseXML:		'',
		proxy:				'',
		proxyType:			'GET',

		lastModified:		null,
		etag:				'',
		headers:			{
								etag: 'IJF@H#@923uf8023hFO@I#H#',
								'content-type' : 'text/plain'
							}
	};

	/**
	 * Create a new mock Ajax handler. When a mock handler is matched during a
	 * $.ajax() call this library will intercept that request and fake a response
	 * using the data and methods in the mock. You can see all settings in the
	 * README of the main repository:
	 * https://github.com/jakerella/jquery-mockjax#api-methods
	 *
	 * @param  {Object} settings The mock handelr settings: https://github.com/jakerella/jquery-mockjax#api-methods
	 * @return {Number}		  The id (index) of the mock handler suitable for clearing (see $.mockjax.clear())
	 */
	$.mockjax = function(settings) {
		// Multiple mocks.
		if ( $.isArray(settings) ) {
			return $.map(settings, function(s) {
				return $.mockjax(s);
			});
		}

		var i = mockHandlers.length;
		mockHandlers[i] = settings;
		logger.log( settings, ['Created new mock handler', settings] );
		return i;
	};

	$.mockjax._logger = logger;

	/**
	 * Remove an Ajax mock from those held in memory. This will prevent any
	 * future Ajax request mocking for matched requests.
	 * NOTE: Clearing a mock will not prevent the resolution of in progress requests
	 *
	 * @param  {Number|String|RegExp} i  OPTIONAL The mock to clear. If not provided, all mocks are cleared,
	 *                                   if a number it is the index in the in-memory cache. If a string or
	 *                                   RegExp, find a mock that matches that URL and clear it.
	 * @return {void}
	 */
	$.mockjax.clear = function(i) {
		if ( typeof i === 'string' || i instanceof RegExp) {
			mockHandlers = clearByUrl(i);
		} else if ( i || i === 0 ) {
			logger.log( mockHandlers[i], [
				'Clearing mock: ' + (mockHandlers[i] && mockHandlers[i].url),
				mockHandlers[i]
			] );
			mockHandlers[i] = null;
		} else {
			logger.log( null, 'Clearing all mocks' );
			mockHandlers = [];
		}
		mockedAjaxCalls = [];
		unmockedAjaxCalls = [];
	};

	/**
	 * By default all Ajax requests performed after loading Mockjax are recorded
	 * so that we can see which requests were mocked and which were not. This
	 * method allows the developer to clear those retained requests.
	 *
	 * @return {void}
	 */
	$.mockjax.clearRetainedAjaxCalls = function() {
		mockedAjaxCalls = [];
		unmockedAjaxCalls = [];
		logger.debug( null, 'Cleared retained ajax calls' );
	};

	/**
	 * Retrive the mock handler with the given id (index).
	 *
	 * @param  {Number} i  The id (index) to retrieve
	 * @return {Object}	The mock handler settings
	 */
	$.mockjax.handler = function(i) {
		if ( arguments.length === 1 ) {
			return mockHandlers[i];
		}
	};

	/**
	 * Retrieve all Ajax calls that have been mocked by this library during the
	 * current session (in other words, only since you last loaded this file).
	 *
	 * @return {Array}  The mocked Ajax calls (request settings)
	 */
	$.mockjax.mockedAjaxCalls = function() {
		return mockedAjaxCalls;
	};

	/**
	 * Return all mock handlers that have NOT been matched against Ajax requests
	 *
	 * @return {Array}  The mock handlers
	 */
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

	/**
	 * Retrieve all Ajax calls that have NOT been mocked by this library during
	 * the current session (in other words, only since you last loaded this file).
	 *
	 * @return {Array}  The mocked Ajax calls (request settings)
	 */
	$.mockjax.unmockedAjaxCalls = function() {
		return unmockedAjaxCalls;
	};

	return $.mockjax;

}));

},{}],2:[function(require,module,exports){
require('./test_util');
require('./test_tree');
require('./test_jqtree');

QUnit.config.testTimeout = 5000;

},{"./test_jqtree":3,"./test_tree":4,"./test_util":5}],3:[function(require,module,exports){
var mockjax = require('jquery-mockjax')(jQuery, window);

var utils_for_test = require('./utils_for_test');

var example_data = utils_for_test.example_data;
var example_data2 = utils_for_test.example_data2;
var formatNodes = utils_for_test.formatNodes;
var formatTitles = utils_for_test.formatTitles;
var isNodeOpen = utils_for_test.isNodeOpen;
var isNodeClosed = utils_for_test.isNodeClosed;

var tree_vars = utils_for_test.getTreeVariables();

var Position = tree_vars.Position;


QUnit.module("jqtree", {
    beforeEach: function() {
        $('body').append('<div id="tree1"></div>');
    },

    afterEach: function() {
        var $tree = $('#tree1');
        $tree.tree('destroy');
        $tree.remove();

        $.mockjax.clear();
    }
});

test("create jqtree from data", function(assert) {
    $('#tree1').tree({
        data: example_data
    });

    assert.equal(
        $('#tree1').children().length, 1,
        'number of children on level 0'
    );
    assert.ok(
        $('#tree1').children().is('ul.jqtree-tree'),
        'first element is ul.jqtree-tree'
    );
    assert.equal(
        $('#tree1 ul.jqtree-tree > li').length, 2,
        'number of children on level 1'
    );
    assert.ok(
        $('#tree1 ul.jqtree-tree li:eq(0)').is('li.jqtree-folder.jqtree-closed'),
        'first child is li.jqtree-folder.jqtree-closed'
    );
    assert.ok(
        $('#tree1 ul.jqtree-tree li:eq(0) > .jqtree-element > a.jqtree-toggler').is('a.jqtree-toggler.jqtree-closed'),
        'button in first folder'
    );
    assert.equal(
        $('#tree1 ul.jqtree-tree li:eq(0) > .jqtree-element span.jqtree-title').text(),
        'node1'
    );
});

test('toggle', function(assert) {
    // setup
    var done = assert.async();

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
            assert.ok(! isNodeClosed($node1), 'node1 is open');

            // 2. close node1
            $tree.tree('toggle', node1);
        }
    );

    $tree.bind(
        'tree.close',
        function(e) {
            assert.ok(isNodeClosed($node1), 'node1 is closed');

            done();
        }
    );

    var tree = $tree.tree('getTree');
    node1 = tree.children[0];
    $node1 = $tree.find('ul.jqtree-tree li:eq(0)');

    // node1 is initially closed
    assert.ok(isNodeClosed($node1), 'node1 is closed');

    // 1. open node1
    $tree.tree('toggle', node1);
});

test("click event", function(assert) {
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
        assert.equal(e.node.name, 'node1');
    });

    var done = assert.async();

    $tree.bind('tree.select', function(e) {
        select_count += 1;

        if (select_count == 1) {
            assert.equal(e.node.name, 'node1');

            assert.equal($tree.tree('getSelectedNode').name, 'node1');

            // deselect
            $text_span.click();
        }
        else {
            assert.equal(e.node, null);
            assert.equal(e.previous_node.name, 'node1');
            assert.equal($tree.tree('getSelectedNode'), false);

            done();
        }
    });

    // click on node1
    $text_span.click();
});

test('saveState', function(assert) {
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
        assert.ok(! node.is_open, 'jqtree-closed');
        return true;
    });

    // open node1
    $tree.tree('toggle', tree.children[0]);

    // node1 is open
    assert.ok(tree.children[0].is_open, 'node1 is_open');

    // select node2
    $tree.tree('selectNode', tree.children[1]);

    // node2 is selected
    assert.equal(
        $tree.tree('getSelectedNode').name,
        'node2',
        'getSelectedNode (1)'
    );

    // create tree again
    $tree.tree('destroy');
    createTree();

    tree = $tree.tree('getTree');
    assert.ok(tree.children[0].is_open, 'node1 is_open');
    assert.ok(! tree.children[1].is_open, 'node2 is closed');

    // node2 is selected
    assert.equal(
        $tree.tree('getSelectedNode').name,
        'node2',
        'getSelectedNode (2)'
    );
});

test('getSelectedNode', function(assert) {
    var $tree = $('#tree1');

    // create tree
    $tree.tree({
        data: example_data,
        selectable: true
    });

    // there is no node selected
    assert.equal(
        $tree.tree('getSelectedNode'),
        false,
        'getSelectedNode'
    );

    // select node1
    var tree = $tree.tree('getTree');
    var node1 = tree.children[0];
    $tree.tree('selectNode', node1);

    // node1 is selected
    assert.equal(
        $tree.tree('getSelectedNode').name,
        'node1',
        'getSelectedNode'
    );
});

test("toJson", function(assert) {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    // 1. call toJson
    assert.equal(
        $tree.tree('toJson'),
        '[{"name":"node1","id":123,"int_property":1,"str_property":"1",'+
        '"children":[{"name":"child1","id":125,"int_property":2},{"name":'+
        '"child2","id":126}]},{"name":"node2","id":124,"int_property":3,'+
        '"str_property":"3","children":[{"name":"child3","id":127}]}]'
    );

    // Check that properties 'children', 'parent' and 'element' still exist.
    var tree = $tree.tree('getTree');
    assert.equal(tree.children.length, 2);
    assert.ok(tree.children[0].parent != undefined, 'parent');
    assert.ok($(tree.children[0].element).is('li'), 'element');
});

test('loadData', function(assert) {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        autoOpen: true
    });

    // first node is 'node1'
    assert.equal(
        $tree.find('> ul > li:first .jqtree-element:first > span').text(),
        'node1'
    );

    // - load new data
    $tree.tree('loadData', example_data2);

    // first node is 'main'
    assert.equal(
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
    assert.equal(
        $tree.find('li:eq(0)').find('.jqtree-element:eq(0) span.jqtree-title').text(),
        'node1'
    );

    // Node 'child3' now has a children 'c4' and 'c5'
    var $child3 = $tree.find('span:contains(child3)');
    var $li = $child3.closest('li');
    assert.equal(
        $li.children('ul').children('li:eq(0)').find('.jqtree-element span.jqtree-title').text(),
        'c4'
    );

    // Node 'child3' must have toggler button
    assert.ok(
        $child3.prev().is('a.jqtree-toggler'),
        "node 'child3' must have toggler button"
    );

    // - select node 'c5' and load new data under 'child3'
    var c5 = $tree.tree('getNodeByName', 'c5');
    $tree.tree('selectNode', c5);

    assert.equal($tree.tree('getSelectedNode').name, 'c5');

    var data2 = [
        { label: 'c7' },
        { label: 'c8' }
    ];
    $tree.tree('loadData', data2, child3);

    // c5 must be deselected
    assert.equal($tree.tree('getSelectedNode'), false);

    // - select c7; load new data under child3; note that c7 has no id
    $tree.tree('selectNode', $tree.tree('getNodeByName', 'c7'));

    assert.equal($tree.tree('getSelectedNode').name, 'c7');

    $tree.tree('loadData', [ 'c9' ], child3);

    assert.equal($tree.tree('getSelectedNode'), false);

    // - select c9 (which has no id); load new nodes under child2
    $tree.tree('selectNode', $tree.tree('getNodeByName', 'c9'));

    var child2 = $tree.tree('getNodeByName', 'child2');
    $tree.tree('loadData', [ 'c10' ], child2);

    assert.equal($tree.tree('getSelectedNode').name, 'c9');
});

test('openNode and closeNode', function(assert) {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    var node2 = $tree.tree('getNodeByName', 'node2');
    assert.equal(node2.name, 'node2');
    assert.equal(node2.is_open, undefined);

    // 1. open node2
    $tree.tree('openNode', node2, false);
    assert.equal(node2.is_open, true);
    assert.equal(isNodeOpen($(node2.element)), true);

    // 2. close node2
    $tree.tree('closeNode', node2, false);
    assert.equal(node2.is_open, false);
    assert.equal(isNodeClosed($(node2.element)), true);

    // 3. open child1
    var node1 = $tree.tree('getNodeByName', 'node1');
    var child1 = $tree.tree('getNodeByName', 'child1');

    // add a child to child1 so it is a folder
    $tree.tree('appendNode', 'child1a', child1);

    // node1 is initialy closed
    assert.equal(node1.is_open, undefined);

    // open child1
    $tree.tree('openNode', child1, false);

    // node1 and child1 are now open1
    assert.equal(node1.is_open, true);
    assert.equal(child1.is_open, true);
});

test('selectNode', function(assert) {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        selectable: true
    });

    var node1 = $tree.tree('getTree').children[0];
    var node2 = $tree.tree('getTree').children[1];
    var child3 = node2.children[0];

    assert.equal(child3.name, 'child3');
    assert.equal(node1.is_open, undefined);
    assert.equal(node2.is_open, undefined);
    assert.equal(child3.is_open, undefined);

    // -- select node 'child3', which is a child of 'node2'; must_open_parents = true
    $tree.tree('selectNode', child3, true);
    assert.equal($tree.tree('getSelectedNode').name, 'child3');

    assert.equal(node1.is_open, undefined);
    assert.equal(node2.is_open, true);
    assert.equal(child3.is_open, undefined);

    // -- select node 'node1'
    $tree.tree('selectNode', node1);
    assert.equal($tree.tree('getSelectedNode').name, 'node1');

    // -- is 'node1' selected?
    assert.ok($tree.tree('isNodeSelected', node1));

    // -- deselect
    $tree.tree('selectNode', null);
    assert.equal($tree.tree('getSelectedNode'), false);
});

test('selectNode when another node is selected', function(assert) {
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
    assert.equal($tree.tree('getSelectedNode').name, 'node2');

    // -- setting event
    // -- is node 'node2' named 'deselected_node' in object's attributes?
    var is_select_event_fired = false;

    $tree.bind('tree.select', function(e) {
        assert.equal(e.deselected_node, node2);
        is_select_event_fired = true;
    });

    // -- select node 'node1'; node 'node2' is selected before it
    $tree.tree('selectNode', node1);
    assert.equal($tree.tree('getSelectedNode').name, 'node1');

    assert.ok($tree.tree('isNodeSelected', node1));

    // event was fired
    assert.ok(is_select_event_fired);
});

test('click toggler', function(assert) {
    // setup
    var done = assert.async();

    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        selectable: true
    });

    var $title = $tree.find('li:eq(0)').find('> .jqtree-element > span.jqtree-title');
    assert.equal($title.text(), 'node1');
    var $toggler = $title.prev();
    assert.ok($toggler.is('a.jqtree-toggler.jqtree-closed'));

    $tree.bind('tree.open', function(e) {
        // 2. handle 'open' event
        assert.equal(e.node.name, 'node1');

        // 3. click toggler again
        $toggler.click();
    });

    $tree.bind('tree.close', function(e) {
        assert.equal(e.node.name, 'node1');
        done();
    });

    // 1. click toggler of 'node1'
    $toggler.click();
});

test('getNodeById', function(assert) {
	// setup
	var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });
    var node2 = $tree.tree('getNodeByName', 'node2');

    // 1. get 'node2' by id
    assert.equal(
        $tree.tree('getNodeById', 124).name,
        'node2'
    );

    // 2. get id that does not exist
    assert.equal($tree.tree('getNodeById', 333), null);

    // 3. get id by string
    assert.equal(
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

    assert.equal(
        $tree.tree('getNodeById', 234).name,
        'abc'
    );
    assert.equal(
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

    assert.equal(
        $tree.tree('getNodeById', 200).name,
        'sub1'
    );
    assert.equal(
        $tree.tree('getNodeById', 201).name,
        'sub2'
    );
});

test('autoOpen', function(assert) {
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
    assert.equal(formatOpenFolders(), '');

    $tree.tree('destroy');

    // 2. autoOpen is true
    $tree.tree({
        data: data,
        autoOpen: true
    });
    assert.equal(formatOpenFolders(), 'l1n1;l2n2;l3n1');

    $tree.tree('destroy');

    // 3. autoOpen level 1
    $tree.tree({
        data: data,
        autoOpen: 1
    });
    assert.equal(formatOpenFolders(), 'l1n1;l2n2');
});

test('onCreateLi', function(assert) {
    // 1. init tree with onCreateLi
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        onCreateLi: function(node, $li) {
            var $span = $li.children('.jqtree-element').find('span');
            $span.html('_' + node.name + '_');
        }
    });

    assert.equal(
        $tree.find('span:eq(0)').text(),
        '_node1_'
    );
});

test('save state', function(assert) {
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
    assert.equal($tree.tree('getSelectedNode'), false);

    // 2. select node -> state is saved
    $tree.tree('selectNode', tree.children[0]);
    assert.equal($tree.tree('getSelectedNode').name, 'node1');

    // 3. init tree again
    $tree.tree('destroy');

    $tree.tree({
        data: example_data,
        selectable: true,
        saveState: 'my_tree'
    });

    assert.equal($tree.tree('getSelectedNode').name, 'node1');

    $.cookie = null;
});

test('generate hit areas', function(assert) {
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
    assert.equal(strings.join(';'), 'node1 none;node2 inside;node2 after');
});

test('removeNode', function(assert) {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data,
        selectable: true
    });

    // 1. Remove selected node; node is 'child1'
    var child1 = $tree.tree('getNodeByName', 'child1');
    $tree.tree('selectNode', child1);

    assert.equal($tree.tree('getSelectedNode').name, 'child1');

    $tree.tree('removeNode', child1);

    assert.equal(
        formatTitles($tree),
        'node1 child2 node2 child3'
    );

    // getSelectedNode must now return false
    assert.equal($tree.tree('getSelectedNode'), false);

    // 2. No node is selected; remove child3
    $tree.tree('loadData', example_data);

    var child3 = $tree.tree('getNodeByName', 'child3');
    $tree.tree('removeNode', child3);

    assert.equal(
        formatTitles($tree),
        'node1 child1 child2 node2'
    );

    assert.equal($tree.tree('getSelectedNode'), false);

    // 3. Remove parent of selected node
    $tree.tree('loadData', example_data);

    child1 = $tree.tree('getNodeByName', 'child1');
    var node1 = $tree.tree('getNodeByName', 'node1');

    $tree.tree('selectNode', child1);

    $tree.tree('removeNode', node1);

    // node is unselected
    assert.equal($tree.tree('getSelectedNode'), false);

    // 4. Remove unselected node without an id
    $tree.tree('loadData', example_data2);

    var c1 = $tree.tree('getNodeByName', 'c1');

    $tree.tree('removeNode', c1);

    assert.equal(
        formatTitles($tree),
        'main c2'
    );
});

test('appendNode', function(assert) {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    var node1 = $tree.tree('getNodeByName', 'node1');

    // 1. Add child3 to node1
    $tree.tree('appendNode', 'child3', node1);

    assert.equal(
        formatTitles($(node1.element)),
        'node1 child1 child2 child3'
    );

    // 2. Add child4 to child1
    var child1 = $tree.tree('getNodeByName', 'child1');

    // Node 'child1' does not have a toggler button
    assert.equal(
        $(child1.element).find('> .jqtree-element > .jqtree-toggler').length,
        0
    );

    $tree.tree('appendNode', 'child4', child1);

    assert.equal(formatTitles($(child1.element)), 'child1 child4');

    // Node 'child1' must get a toggler button
    assert.equal(
        $(child1.element).find('> .jqtree-element > .jqtree-toggler').length,
        1
    );
});

test('prependNode', function(assert) {
    // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    var node1 = $tree.tree('getNodeByName', 'node1');

    // 1. Prepend child0 to node1
    $tree.tree('prependNode', 'child0', node1);

    assert.equal(
        formatTitles($(node1.element)),
        'node1 child0 child1 child2'
    );
});
test('init event', function(assert) {
    // setup
    var done = assert.async();

    var $tree = $('#tree1');

    $tree.bind('tree.init', function() {
        // Check that we can call functions in 'tree.init' event
        assert.equal($tree.tree('getNodeByName', 'node2').name, 'node2');

        done();
    });

    $tree.tree({
        data: example_data
    });
});

test('updateNode', function(assert) {
    // setup
    var $tree = $('#tree1');

    $tree.tree({ data: example_data });

    assert.equal(formatTitles($tree), 'node1 child1 child2 node2 child3');

    // -- update label
    var node2 = $tree.tree('getNodeByName', 'node2');
    $tree.tree('updateNode', node2, 'CHANGED');

    assert.equal(formatTitles($tree), 'node1 child1 child2 CHANGED child3');
    assert.equal(node2.name, 'CHANGED');

    // -- update data
    $tree.tree(
        'updateNode',
        node2,
        {
            name: 'xyz',
            tag1: 'abc'
        }
    );

    assert.equal(formatTitles($tree), 'node1 child1 child2 xyz child3');
    assert.equal(node2.name, 'xyz');
    assert.equal(node2.tag1, 'abc');

    // - update id
    assert.equal(node2.id, 124);

    $tree.tree('updateNode', node2, {id: 555});

    assert.equal(node2.id, 555);
    assert.equal(node2.name, 'xyz');

    // get node by id
    var node_555 = $tree.tree('getNodeById', 555);
    assert.equal(node_555.name, 'xyz');

    var node_124 = $tree.tree('getNodeById', 124);
    assert.equal(node_124, undefined);

    // update child1
    var child1 = $tree.tree('getNodeByName', 'child1');

    $tree.tree('updateNode', child1, 'child1a');

    assert.equal(formatTitles($tree), 'node1 child1a child2 xyz child3');

    // select child1
    $tree.tree('selectNode', child1);
    $tree.tree('updateNode', child1, 'child1b');

    assert.ok($(child1.element).hasClass('jqtree-selected'));
});

test('moveNode', function(assert) {
    // setup
    var $tree = $('#tree1');

    $tree.tree({ data: example_data });

    var child1 = $tree.tree('getNodeByName', 'child1');
    var child2 = $tree.tree('getNodeByName', 'child2');
    var node1 = $tree.tree('getNodeByName', 'node1');
    var node2 = $tree.tree('getNodeByName', 'node2');

    // -- Move child1 after node2
    $tree.tree('moveNode', child1, node2, 'after');

    assert.equal(formatTitles($tree), 'node1 child2 node2 child3 child1');

    // -- Check that illegal moves are skipped
    $tree.tree('moveNode', node1, child2, 'inside');
});

test('load on demand', function(assert) {
    // setup
    var done = assert.async();

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

    mockjax({
        url: '*',
        response: function(options) {
            assert.equal(options.url, '/tree/', '2');
            assert.deepEqual(options.data, { 'node' : 1 }, '3');

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
        assert.equal(formatTitles($tree), 'node1 child1', '4');

        done();
    });

    var node1 = $tree.tree('getNodeByName', 'node1');
    assert.equal(formatTitles($tree), 'node1', '1');

    $tree.tree('openNode', node1, true);
});

test('addNodeAfter', function(assert) {
    // setup
    var $tree = $('#tree1');

    $tree.tree({ data: example_data });
    var node1 = $tree.tree('getNodeByName', 'node1');

    // -- add node after node1
    $tree.tree('addNodeAfter', 'node3', node1);

    assert.equal(formatTitles($tree), 'node1 child1 child2 node3 node2 child3');
});

test('addNodeBefore', function(assert) {
    // setup
    var $tree = $('#tree1');

    $tree.tree({ data: example_data });
    var node1 = $tree.tree('getNodeByName', 'node1');

    // -- add node before node1
    var new_node = $tree.tree('addNodeBefore', 'node3', node1);

    assert.equal(formatTitles($tree), 'node3 node1 child1 child2 node2 child3');
});

test('addParentNode', function(assert) {
    // setup
    var $tree = $('#tree1');

    $tree.tree({ data: example_data });
    var child3 = $tree.tree('getNodeByName', 'child3');

    // -- add parent to child3
    $tree.tree('addParentNode', 'node3', child3);

    assert.equal(formatTitles($tree), 'node1 child1 child2 node2 node3 child3');
});

test('mouse events', function(assert) {
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

    assert.equal(
        formatTitles($tree),
        'node2 child3 node1 child1 child2'
    );
});

test('multiple select', function(assert) {
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
    assert.equal(
        formatNodes(selected_nodes),
        'child1 child2'
    );
});

test('keyboard', function(assert) {
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
    assert.equal(node1.is_open, undefined);

    // - move down; -> node2
    keyDown(40);
    assert.equal($tree.tree('getSelectedNode').name, 'node2');

    // - move up; -> back to node1
    keyDown(38);
    assert.equal($tree.tree('getSelectedNode').name, 'node1');

    // - move right; open node1
    keyDown(39);
    assert.equal(node1.is_open, true);
    assert.equal($tree.tree('getSelectedNode').name, 'node1');

    // - select child3 and move up -> node2
    $tree.tree('selectNode', $tree.tree('getNodeByName', 'child3'));
    keyDown(38);
    assert.equal($tree.tree('getSelectedNode').name, 'node2');

    // - move up -> child2
    keyDown(38);
    assert.equal($tree.tree('getSelectedNode').name, 'child2');

    // - select node1 and move left ->  close
    $tree.tree('selectNode', node1);
    keyDown(37);
    assert.equal(node1.is_open, false);
    assert.equal($tree.tree('getSelectedNode').name, 'node1');
});

test('getNodesByProperty', function(assert) {
  // setup
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });
    var node2 = $tree.tree('getNodeByName', 'node2');

    // 1. get 'node1' by property
    assert.equal(
        $tree.tree('getNodesByProperty', 'int_property', 1)[0].name,
        'node1'
    );

    // 2. get property that does not exist in any node
    assert.equal($tree.tree('getNodesByProperty', 'int_property', 123).length, 0);

    // 3. get string property
    assert.equal(
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

    assert.equal(
        $tree.tree('getNodesByProperty', 'int_property', 111)[0].name,
        'abc'
    );
    assert.equal(
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

    assert.equal(
        $tree.tree('getNodesByProperty', 'int_property', 222)[0].name,
        'sub1'
    );
    assert.equal(
        $tree.tree('getNodesByProperty', 'int_property', 444)[0].name,
        'sub2'
    );
});

test('dataUrl extra options', function(assert) {
    var done = assert.async();

    var $tree = $('#tree1');

    mockjax({
        url: '*',
        response: function(options) {
            // 2. handle ajax request
            // expect 'headers' option
            assert.equal(options.url, '/tree2/');
            assert.deepEqual(options.headers, {'abc': 'def'});

            done();
        },
        logging: false
    });

    // 1. init tree
    // dataUrl contains 'headers' option
    $tree.tree({
        dataUrl: {
            'url': '/tree2/',
            'headers': {'abc': 'def'}
        }
    });
});

test('dataUrl is function', function(assert) {
    var done = assert.async();

    var $tree = $('#tree1');

    mockjax({
        url: '*',
        response: function(options) {
            // 2. handle ajax request
            // expect 'headers' option
            assert.equal(options.url, '/tree3/');
            assert.deepEqual(options.headers, {'abc': 'def'});

            done();
        },
        logging: false
    });

    // 1. init tree
    // dataUrl is a function
    $tree.tree({
        dataUrl: function(node) {
            return {
                'url': '/tree3/',
                'headers': {'abc': 'def'}
            };
        }
    });
});

test('getNodeByHtmlElement', function(assert) {
    var $tree = $('#tree1');
    $tree.tree({
        data: example_data
    });

    var $el = $('.jqtree-title');

    // Get node for jquery element
    var node = $tree.tree('getNodeByHtmlElement', $el);
    assert.equal(node.name, 'node1');

    // Same for html element
    node = $tree.tree('getNodeByHtmlElement', $el[0]);
    assert.equal(node.name, 'node1');
});

test('DragElement', function(assert) {
    // Create drag element for node with html. Expect the text in the drag element to be html encoded.
    var $tree = $('#tree1');

    $tree.tree({
        data: [
            {name: '<img src=x onerror=alert()>child1',id: 1}
        ]
    });

    var JqTreeWidget = $tree.tree('get_widget_class');
    var DragElement = JqTreeWidget.getModule('drag_and_drop_handler').DragElement;

    var DragElement = new DragElement(
        $tree.tree('getNodeById', 1),
        0, 0,
        $tree
    );

    var span = $tree.find('.jqtree-dragging');
    assert.equal(span.html(), '&lt;img src=x onerror=alert()&gt;child1');
});

},{"./utils_for_test":6,"jquery-mockjax":1}],4:[function(require,module,exports){
var utils_for_test = require('./utils_for_test');

var example_data = utils_for_test.example_data;
var formatNodes = utils_for_test.formatNodes;

var tree_vars = utils_for_test.getTreeVariables();

var Node = tree_vars.Node;
var Position = tree_vars.Position;


QUnit.module("Tree");
test('constructor', function(assert) {
    // 1. Create node from string
    var node = new Node('n1');

    assert.equal(node.name, 'n1');
    assert.equal(node.children.length, 0);
    assert.equal(node.parent, null);

    // 2. Create node from object
    node = new Node({
        label: 'n2',
        id: 123,
        parent: 'abc',  // parent must be ignored
        children: ['c'], // children must be ignored
        url: '/'
    });

    assert.equal(node.name, 'n2');
    assert.equal(node.id, 123);
    assert.equal(node.url, '/');
    assert.equal(node.label, undefined);
    assert.equal(node.children.length, 0);
    assert.equal(node.parent, null);
});

test("create tree from data", function(assert) {
    function checkData(tree) {
        assert.equal(
            formatNodes(tree.children),
            'node1 node2',
            'nodes on level 1'
        );
        assert.equal(
            formatNodes(tree.children[0].children),
            'child1 child2',
            'children of node1'
        );
        assert.equal(
            formatNodes(tree.children[1].children),
            'child3',
            'children of node2'
        );
        assert.equal(
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

test("addChild", function(assert) {
    var tree = new Node('tree1', true);
    tree.addChild(
        new Node('abc')
    );
    tree.addChild(
        new Node('def')
    );

    assert.equal(
        formatNodes(tree.children),
        'abc def',
        'children'
    );

    var node = tree.children[0];
    assert.equal(
        node.parent.name,
        'tree1',
        'parent of node'
    );
});

test('addChildAtPosition', function(assert) {
    var tree = new Node(null, true);
    tree.addChildAtPosition(new Node('abc'), 0);  // first
    tree.addChildAtPosition(new Node('ghi'), 2);  // index 2 does not exist
    tree.addChildAtPosition(new Node('def'), 1);
    tree.addChildAtPosition(new Node('123'), 0);

    assert.equal(
        formatNodes(tree.children),
        '123 abc def ghi',
        'children'
    );
});

test('removeChild', function(assert) {
    var tree = new Node(null, true);

    var abc = new Node({'label': 'abc', 'id': 1});
    var def = new Node({'label': 'def', 'id': 2});
    var ghi = new Node({'label': 'ghi', 'id': 3});

    tree.addChild(abc);
    tree.addChild(def);
    tree.addChild(ghi);

    var jkl = new Node({'label': 'jkl', 'id': 4});
    def.addChild(jkl);

    assert.equal(
        formatNodes(tree.children),
        'abc def ghi',
        'children'
    );

    assert.equal(tree.id_mapping[2].name, 'def');
    assert.equal(tree.id_mapping[4].name, 'jkl');

    // remove 'def'
    tree.removeChild(def);
    assert.equal(
        formatNodes(tree.children),
        'abc ghi',
        'children'
    );

    assert.equal(tree.id_mapping[2], null);
    assert.equal(tree.id_mapping[4], null);

    // remove 'ghi'
    tree.removeChild(ghi);
    assert.equal(
        formatNodes(tree.children),
        'abc',
        'children'
    );

    // remove 'abc'
    tree.removeChild(abc);
    assert.equal(
        formatNodes(tree.children),
        '',
        'children'
    );
});

test('getChildIndex', function(assert) {
    // setup
    var tree = new Node(null, true);

    var abc = new Node('abc');
    var def = new Node('def');
    var ghi = new Node('ghi');
    tree.addChild(abc);
    tree.addChild(def);
    tree.addChild(ghi);

    // 1. Get child index of 'def'
    assert.equal(tree.getChildIndex(def), 1);

    // 2. Get child index of non-existing node
    assert.equal(tree.getChildIndex(new Node('xyz')), -1);
});

test('hasChildren', function(assert) {
    var tree = new Node(null, true);
    assert.equal(
        tree.hasChildren(),
        false,
        'tree without children'
    );

    tree.addChild(new Node('abc'));
    assert.equal(
        tree.hasChildren(),
        true,
        'tree has children'
    );
});

test('iterate', function(assert) {
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

    assert.equal(
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

    assert.equal(
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

    assert.equal(
        nodes.join(','),
        'node1 0,child1 1,child2 1,node2 0,child3 1,child4 2'
    );
});

test('moveNode', function(assert) {
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
    assert.equal(node2.name, 'node2', 'node2 name');
    assert.equal(child2.name, 'child2', 'child2 name');

    // move child2 after node2
    tree.moveNode(child2, node2, Position.AFTER);

    /*
      node1
      ---child1
      node2
      ---child3
      child2
    */
    assert.equal(
        formatNodes(tree.children),
        'node1 node2 child2',
        'tree nodes at first level'
    );
    assert.equal(
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
    assert.equal(
        formatNodes(node2.children),
        'child1 child3',
        'node2 children'
    );
    assert.equal(
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
    assert.equal(
        formatNodes(node2.children),
        'child2 child1 child3',
        'node2 children'
    );
    assert.equal(
        formatNodes(tree.children),
        'node1 node2',
        'tree nodes at first level'
    );
});

test('initFromData', function(assert) {
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

    assert.equal(node.name, 'main')
    assert.equal(
        formatNodes(node.children),
        'c1 c2',
        'children'
    );
    assert.equal(node.children[1].id, 201);
});

test('getData', function(assert) {
    // 1. empty node
    var node = new Node(null, true);
    assert.deepEqual(node.getData(), []);

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
    assert.deepEqual(
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

    // 3. get data including parent
    var n1 = node.getNodeByName('n1');

    assert.deepEqual(
        n1.getData(true),
        [
            {
                name: 'n1',
                children: [
                    { name: 'c1'}
                ]
            }
        ]
    );
});

test('addAfter', function(assert) {
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

    assert.equal(formatNodes(tree.children), 'node1 node2');

    // - Add 'node_b' after node2
    var node2 = tree.getNodeByName('node2');
    node2.addAfter('node_b');

    assert.equal(formatNodes(tree.children), 'node1 node2 node_b');

    var node_b = tree.getNodeByName('node_b');
    assert.equal(node_b.name, 'node_b');

    // - Add 'node_a' after node1
    var node1 = tree.getNodeByName('node1');
    node1.addAfter('node_a');

    assert.equal(formatNodes(tree.children), 'node1 node_a node2 node_b');

    // - Add 'node_c' after node_b; new node is an object
    node_b.addAfter({
        label: 'node_c',
        id: 789
    });

    var node_c = tree.getNodeByName('node_c');
    assert.equal(node_c.id, 789);

    assert.equal(formatNodes(tree.children), 'node1 node_a node2 node_b node_c');

    // - Add after root node; this is not possible
    assert.equal(tree.addAfter('node_x'), null);
});

test('addBefore', function(assert) {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // - Add 'node_0' before node1
    var node1 = tree.getNodeByName('node1');
    node1.addBefore('node0');
    assert.equal(formatNodes(tree.children), 'node0 node1 node2');

    // - Add before root node; this is not possile
    assert.equal(tree.addBefore('x'), null);
});

test('addParent', function(assert) {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // - Add node 'root' as parent of node1
    // Note that node also becomes a child of 'root'
    var node1 = tree.getNodeByName('node1');
    node1.addParent('root');

    var root = tree.getNodeByName('root');
    assert.equal(formatNodes(root.children), 'node1 node2');

    // - Add parent to root node; not possible
    assert.equal(tree.addParent('x'), null);
});

test('remove', function(assert) {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    var child1 = tree.getNodeByName('child1');
    var node1 = tree.getNodeByName('node1');

    assert.equal(formatNodes(node1.children), 'child1 child2');
    assert.equal(child1.parent, node1);

    // 1. Remove child1
    child1.remove();

    assert.equal(formatNodes(node1.children), 'child2');
    assert.equal(child1.parent, null);
});

test('append', function(assert) {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    var node1 = tree.getNodeByName('node1');

    // 1. Append child3 to node1
    node1.append('child3');

    assert.equal(formatNodes(node1.children), 'child1 child2 child3');

    // 2. Append subtree
    node1.append(
        {
            name: 'child4',
            children: [
                { name: 'child5' }
            ]
        }
    );

    assert.equal(formatNodes(node1.children), 'child1 child2 child3 child4');

    var child4 = node1.getNodeByName('child4');
    assert.equal(formatNodes(child4.children), 'child5');
});

test('prepend', function(assert) {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    var node1 = tree.getNodeByName('node1');

    // 1. Prepend child0 to node1
    node1.prepend('child0');

    assert.equal(formatNodes(node1.children), 'child0 child1 child2');

    // 2. Prepend subtree
    node1.prepend({
        name: 'child3',
        children: [
            { name: 'child4' }
        ]
    });

    assert.equal(formatNodes(node1.children), 'child3 child0 child1 child2');

    var child3 = node1.getNodeByName('child3');
    assert.equal(formatNodes(child3.children), 'child4');
});

test('getNodeById', function(assert) {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // 1. Get node with id 124
    var node = tree.getNodeById(124);
    assert.equal(node.name, 'node2');

    // 2. Delete node with id 124 and search again
    node.remove();

    assert.equal(tree.getNodeById(124), null);

    // 3. Add node with id 456 and search for it
    var child3 = tree.getNodeByName('child2');
    child3.append({
        id: 456,
        label: 'new node'
    });

    node = tree.getNodeById(456);
    assert.equal(node.name, 'new node');
});

test('getLevel', function(assert) {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // 1. get level for node1 and child1
    assert.equal(tree.getNodeByName('node1').getLevel(), 1);
    assert.equal(tree.getNodeByName('child1').getLevel(), 2);
});

test('loadFromData and id mapping', function(assert) {
    // - get node from empty tree
    var tree = new Node(null, true);
    assert.equal(tree.getNodeById(999), null);

    // - load example data in tree
    tree.loadFromData(example_data);
    assert.equal(tree.getNodeById(124).name, 'node2');

    var child2 = tree.getNodeById(126);
    child2.addChild(
        new Node({label: 'child4', id: 128})
    );
    child2.addChild(
        new Node({label: 'child5', id: 129})
    );

    // - load data in node child2
    child2.loadFromData(['abc', 'def']);

    assert.equal(tree.getNodeById(128), null);
    assert.equal(child2.children.length, 2);
    assert.equal(child2.children[0].name, 'abc');
});

test('removeChildren', function(assert) {
    // - load example data
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // add child4 and child5
    var child2 = tree.getNodeById(126);
    assert.equal(child2.name, 'child2');

    child2.addChild(
        new Node({label: 'child4', id: 128})
    );
    child2.addChild(
        new Node({label: 'child5', id: 129})
    );
    assert.equal(tree.getNodeById(128).name, 'child4');

    // - remove children from child2
    child2.removeChildren();
    assert.equal(tree.getNodeById(128), null);
    assert.equal(child2.children.length, 0);
});

test('node with id 0', function(assert) {
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
    assert.equal(node.name, 'mynode');

    // -- remove the node
    node.remove();

    assert.equal(tree.getNodeById(0), undefined);
});

test('getPreviousSibling', function(assert) {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // - getPreviousSibling
    assert.equal(
        tree.getNodeByName('child2').getPreviousSibling().name,
        'child1'
    );
    assert.equal(tree.getPreviousSibling(), null);
    assert.equal(
        tree.getNodeByName('child1').getPreviousSibling(),
        null
    );
});

test('getNextSibling', function(assert) {
    // setup
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    // - getNextSibling
    assert.equal(
        tree.getNodeByName('node1').getNextSibling().name,
        'node2'
    );
    assert.equal(
        tree.getNodeByName('node2').getNextSibling(),
        null
    );
    assert.equal(tree.getNextSibling(), null);
});

test('getNodesByProperty', function(assert) {
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    nodes = tree.getNodesByProperty('name', 'child1');

    assert.equal(nodes.length, 1);
    assert.equal(nodes[0].name, 'child1');
});

test('getNodeByCallback', function(assert) {
    var tree = new Node(null, true);
    tree.loadFromData(example_data);

    node = tree.getNodeByCallback(
        function(node) {
            return node.name == 'child1';
        }
    );

    assert.equal(node.name, 'child1');
});

},{"./utils_for_test":6}],5:[function(require,module,exports){
var utils_for_test = require('./utils_for_test');

var tree_vars = utils_for_test.getTreeVariables();

var Position = tree_vars.Position;
var util = tree_vars.util;


QUnit.module('util');

test('indexOf', function(assert) {
    var _indexOf = util._indexOf;
    var indexOf = util.indexOf;

    assert.equal(indexOf([3, 2, 1], 1), 2);
    assert.equal(_indexOf([3, 2, 1], 1), 2);
    assert.equal(indexOf([4, 5, 6], 1), -1);
    assert.equal(_indexOf([4, 5, 6], 1), -1);
});

test('Position.getName', function(assert) {
    assert.equal(Position.getName(Position.BEFORE), 'before');
    assert.equal(Position.getName(Position.AFTER), 'after');
    assert.equal(Position.getName(Position.INSIDE), 'inside');
    assert.equal(Position.getName(Position.NONE), 'none');
});

test('Position.nameToIndex', function(assert) {
    assert.equal(Position.nameToIndex('before'), Position.BEFORE);
    assert.equal(Position.nameToIndex('after'), Position.AFTER);
    assert.equal(Position.nameToIndex(''), 0);
});

},{"./utils_for_test":6}],6:[function(require,module,exports){
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

function getTreeVariables() {
    var JqTreeWidget = $('').tree('get_widget_class');

    var node = JqTreeWidget.getModule('node');
    var util = JqTreeWidget.getModule('util');

    return {
        Node: node.Node,
        Position: node.Position,
        util: util
    };
}


module.exports = {
    example_data: example_data,
    example_data2: example_data2,
    formatNodes: formatNodes,
    formatTitles: formatTitles,
    getTreeVariables: getTreeVariables,
    isNodeClosed: isNodeClosed,
    isNodeOpen: isNodeOpen
};

},{}]},{},[2]);
