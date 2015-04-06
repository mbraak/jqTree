// Load jquery 1.x for ie <= 8 and jquery 2.x for other browsers
var ie_version = require('ie-version');

var $;

if (ie_version.version && ie_version.version <= 8) {
    $ = require('karma-jquery-new/jquery/jquery-1.11.2');
}
else {
    $ = require('karma-jquery-new/jquery/jquery-2.1.3');
}

window.$ = $;
window.jQuery = $;

require('./tree.jquery');
require('./test');
