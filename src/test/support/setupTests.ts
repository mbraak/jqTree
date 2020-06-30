import * as jQuery from "jquery";
import * as jQueryMatchers from "jest-jquery-matchers";
import "./jqTreeMatchers";

(window as any).jQuery = jQuery; // eslint-disable-line @typescript-eslint/no-unsafe-member-access

jest.addMatchers(jQueryMatchers);
