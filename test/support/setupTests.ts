import "@testing-library/jest-dom";
import jQuery from "jquery";
import { mockAnimationsApi } from "jsdom-testing-mocks";

import "./jqTreeMatchers";

declare global {
    interface Window {
        $: JQueryStatic;
        jQuery: JQueryStatic;
        TransformStream: any;
    }
}

mockAnimationsApi();

window.$ = jQuery;
window.jQuery = jQuery;
