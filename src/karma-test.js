// Load jquery 1.x for ie <= 8 and jquery 2.x for other browsers
var ie_version = require('ie-version');

var $;

if (ie_version.version && ie_version.version <= 8) {
    $ = require('../static/bower_components/jquery-1/dist/jquery.js');
}
else {
    $ = require('../static/bower_components/jquery/dist/jquery.js');
}

window.$ = $;
window.jQuery = $;

require('./tree.jquery');
require('./test');
