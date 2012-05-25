var connect = require('connect');
var path = require('path');

var static_dir = path.normalize(
    path.join(__dirname, '..')
);

connect()
    .use(connect.static(static_dir))
    .listen(8000);
