import "@testing-library/jest-dom/vitest";
import * as matchers from "jest-extended";
import jQuery from "jquery";
import { mockAnimationsApi } from "jsdom-testing-mocks";
import { expect } from "vitest";

import "./jqTreeMatchers";

declare global {
    interface Window {
        $: JQueryStatic;
        jQuery: JQueryStatic;
    }
}

expect.extend(matchers);

mockAnimationsApi();

window.$ = jQuery;
window.jQuery = jQuery;
