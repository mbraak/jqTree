"use strict";
exports.__esModule = true;
var jQuery = require("jquery");
var jQueryMatchers = require("jest-jquery-matchers");
require("./jqTreeMatchers");
window.jQuery = jQuery; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
jest.addMatchers(jQueryMatchers);
