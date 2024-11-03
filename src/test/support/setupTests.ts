import "@testing-library/jest-dom";
import jQuery from "jquery";
import { TransformStream } from "node:stream/web";

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
window.TransformStream = TransformStream;
