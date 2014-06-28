module.exports = function () {
    var connect = require('connect');
    var meta="bodyparser";
    var debug=false;

    ////////////////////////////////////////////////////////////////////////////
    function readRawBody(req, res, next) {
        var data  = '',
            regex = /^\s*(\w+\/\w+)(?:\s*;\s*(\w+)\s*=\s*["']?([^'"]*)["']?)?/i;

        req.setEncoding('utf8');
        req.on('data', function(chunk) {
            data += chunk;
        });

        req.on('end', function() {
            var contentType = req.get('Content-Type'),
                match = regex.exec(contentType);
            if (match && match.length >= 2) {
                if (match[1].toLowerCase() === 'application/json') {
                    try {
                        req.body = JSON.parse(data);
                        if (debug) console.log('info', 'Content-type=JSON', meta);
                    } catch (e) {
                        if (debug) console.log('debug', {   "Content-type" : match[1].toLowerCase(),
                                                            "body" : data,
                                                            "exception" : e}, meta);
                        req.body = data;
                    }
                } else if (/^text\//.exec(match[1].toLowerCase())) {  // text/plain, text/html, text/css, text/...
                    if (debug) console.log('info', 'Content-type=TEXT', meta);
                    req.body = data;
                } else {
                    if (debug) console.log('info', 'Content-type=UNKNOWN', meta);
                    req.body = data;
                }
            } else {
                if (debug) console.log('info', 'Content-type=NONE', meta);
                req.body = data;
            }
            return next();
        });
    }


    function bodyparser(app, config) {
        app.use(connect.urlencoded());
        app.use(readRawBody); //app.use(connect.json());
    }

    return bodyparser;
}();
