require('./global');

var log = aReq('server/log'),
    warn = aReq('server/warn'),
    misc = aReq('server/misc');

// Setup the server itself
var http = require('http'),
    express = require('express'),
    app = express(),
    server = http.Server(app);

// Setup the static assets and pages
app.use(express.static('public'));
require('fs').readdir('./pages', (err, files) => {
    if (err) throw err;
    files.forEach((file) => {
        var stripped = file.replace('.html', '');
        app.get('/' + (stripped === 'index' ? '' : stripped), (req, res) => {
            res.sendFile(__dirname + '/pages/' + file);
        });
    });
});

// Listen on port
var port = process.env.PORT || 1337;
server.listen(port, () => log('Listening on port', port));