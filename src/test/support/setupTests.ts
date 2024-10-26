import "@testing-library/jest-dom";
import jQuery from "jquery";

import "./jqTreeMatchers";

declare global {
    interface Window {
        $: JQueryStatic;
        jQuery: JQueryStatic;
    }
}

window.$ = jQuery;
window.jQuery = jQuery;
