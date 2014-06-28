module.exports = function () {

    function routes(app, config, io) {
        var redis  = config.redis;
        var prefix = config.dns.prefix;

        // GET
        app.get('/dns/api/v1/name/:name?', function (req, res) {
            if (req.params.name) {
                redis.get(prefix + req.params.name, function (err, value) {
                    if (err) {
                        res.json({name:req.params.name,operation:"get",error:err,status:"FAILED"});
                    } else {
                        res.json({name:req.params.name,address:value,operation:"get",status:"OK"});
                    }
                    res.end();
                });
            } else {
                redis.mgetkeys(prefix + "*", function (err, values) {
                    if (err) {
                        res.json({name:req.params.name,operation:"mgetkeys",error:err,status:"FAILED"});
                    } else {
                        var prefixSize = prefix.length;
                        var valuesWithoutPrefix = values.map(function (tuple) {
                            return {name:tuple.name.substring(prefixSize), address:tuple.address};
                        });
                        res.json({addresses:valuesWithoutPrefix,operation:"mgetkeys",status:"OK"});
                    }
                    res.end();
                });
            }
        });

        // PUT 
        app.put('/dns/api/v1/name/:name', function (req, res) {
            redis.set(prefix + req.params.name, req.body, function (err, result) {
                if (err) {
                    res.json({name:req.params.name,value:req.body,operation:"set",status:'FAILED',error:err});
                } else {
                    io.sockets.emit('new:host', {name:req.params.name, address: req.body});
                    res.json({name:req.params.name,value:req.body,operation:"set",status:'OK'});
                }
                res.end();
            });
        });

        // DELETE
        app.delete('/dns/api/v1/name/:name', function (req, res) {
            redis.del(prefix + req.params.name, function (err) {
                if (err) {
                    res.json({name:req.params.name,operation:"del",error:err,status:"FAILED"});
                } else {
                    io.sockets.emit('del:host', {name:req.params.name});
                    res.json({name:req.params.name,operation:"del",status:"OK"});
                }
                res.end();
            });
        });

        app.get('/dns/api/v1/zone', function (req, res) {
            res.json({zone:config.dns.zone,operation:"zone",status:"OK"});
            res.end();
        });

        // GET status
        app.get('/dns/api/v1/status', function (req, res) {
            res.json({status:'OK',operation:"status"});
            res.end();
        });
    }

    return routes;
}();