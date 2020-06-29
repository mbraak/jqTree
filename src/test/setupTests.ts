import * as jQuery from "jquery";
import * as matchers from "jest-jquery-matchers";

(window as any).jQuery = jQuery; // eslint-disable-line @typescript-eslint/no-unsafe-member-access

jest.addMatchers(matchers);
