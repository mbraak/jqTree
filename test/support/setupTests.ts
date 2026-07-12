import "@testing-library/jest-dom";
import jQuery from "jquery";
import { mockAnimationsApi } from "jsdom-testing-mocks";

import "./jqTreeMatchers";

mockAnimationsApi();

declare global {
    interface Window {
        $: JQueryStatic;
        jQuery: JQueryStatic;
    }
}

window.$ = jQuery;
window.jQuery = jQuery;
