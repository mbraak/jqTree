import "@testing-library/jest-dom";
import "jest-extended";
import jQuery from "jquery";
import { mockAnimationsApi } from "jsdom-testing-mocks";

import "./jqTreeMatchers";

declare global {
    interface Window {
        $: JQueryStatic;
        jQuery: JQueryStatic;
    }
}

mockAnimationsApi();

window.$ = jQuery;
window.jQuery = jQuery;
