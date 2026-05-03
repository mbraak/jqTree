import "@testing-library/jest-dom";
import jQuery from "jquery";

import "./jqTreeMatchers";

declare global {
    interface Window {
        $: JQueryStatic;
        jQuery: JQueryStatic;
        TransformStream: any;
    }
}

window.$ = jQuery;
window.jQuery = jQuery;
