module.exports = function () {

    function routes(app, config, io) {
        var redis  = config.redis;
        var prefix = config.dns.prefix;
        var prefixSize = prefix.length;


        // GET
        app.get('/dns/api/v1/name/:name?', function (req, res) {
            if (req.params.name) {
                redis.get(prefix + req.params.name, function (err, value) {
                    if (err) {
                        return res.status(500).json({name:req.params.name,operation:"get",error:err,status:"FAILED"}).end();
                    }
                    if (value) {
                        var record;
                        try {
                            record = JSON.parse(value);
                        } catch (e) {
                            return res.status(500).json({name:req.params.name,operation:"get",error:e,status:"FAILED"}).end();
                        }
                        return res.json({name:req.params.name,record:record,operation:"get",status:"OK"}).end();
                    }
                    return res.status(404).json({name:req.params.name,operation:"get",status:"NOT-FOUND"}).end();
                });
            } else {
                redis.mgetkeys(prefix + "*", function (err, values) {
                    if (err) {
                        return res.status(500).json({name:req.params.name,operation:"mgetkeys",error:err,status:"FAILED"}).end();
                    }
                    if (values) {
                        var valuesWithoutPrefix = values.map(function (tuple) {
                            return {name:tuple.key.substring(prefixSize), record:JSON.parse(tuple.value)};
                        });
                        return res.json({records:valuesWithoutPrefix,operation:"mgetkeys",status:"OK"}).end();
                    }
                    return res.status(404).json({name:req.params.name,operation:"mgetkeys",status:"NOT-FOUND"}).end();
                });
            }
        });

        // PUT 
        app.put('/dns/api/v1/name/:name', function (req, res) {
            var arpa,
                record = {
                host : req.params.name,
                PTR  : null
            };

            if (req.body) {
                if (req.body.ipv4) {
                    record.A = req.body.ipv4;
                    arpa = record.A.split('.').reverse().join('.') + '.in-addr.arpa';
                }
                if (req.body.ipv6) {
                    record.AAAA = req.body.ipv6;
                }
            }

            redis.set(prefix + req.params.name, JSON.stringify(record), function (err, result) {
                if (err) {
                    return res.status(500).json({name:req.params.name,operation:"set",error:err,status:"FAILED"}).end();
                }
                io.sockets.emit('new:host', {name:req.params.name, record: record});
                redis.set(prefix + arpa, JSON.stringify(record), function (err, result) {
                    if (err) {
                        return res.status(500).json({name:arpa,operation:"set",isArpa:true,error:err,status:"FAILED"}).end();
                    }
                    io.sockets.emit('new:host', {name:arpa, record: record});
                    return res.json({name:req.params.name,value:record,operation:"set",status:'OK'}).end();
                });
            });
        });

        // DELETE
        app.delete('/dns/api/v1/name/:name?', function (req, res) {
            if (req.params.name) {
                redis.del(prefix + req.params.name, function (err) {
                    if (err) {
                        return res.status(500).json({name:req.params.name,operation:"delete",error:err,status:"FAILED"}).end();
                    }
                    io.sockets.emit('delete:host', {name:req.params.name});
                    return res.json({name:req.params.name,operation:"delete",status:"OK"}).end();
                });
            } else {
                if (req.query.force === 'true') {
                    var total = 0;
                    var failed = 0;
                    function removeEntry(keys) {
                        if (!keys || keys.length < 1) {
                            return res.json({name:"*",force:true, operation:"delete",total:total,failed:failed,status:"OK"}).end();
                        }
                        var key = keys.shift();
                        redis.del(key, function (err, res) {
                            if (err) {
                                failed += 1;
                            } else {
                                io.sockets.emit('delete:host', {name:key.substring(prefixSize)});
                                total += 1;
                            }
                            process.nextTick(function () {
                                removeEntry(keys);
                            });
                        });
                    }
                    redis.keys(prefix + "*", function(err, keys) {
                        if (err) {
                            return res.status(500).json({name:"*",force:true,operation:"delete",error:err,status:"FAILED"}).end();
                        }
                        removeEntry(keys)
                    });
                } else {
                    return res.status(400).json({name:"*",operation:"delete",error:new Error("To delete all the entries, you must use the 'force' option"),status:"FAILED"}).end();
                }
            }
        });

        app.get('/dns/api/v1/zone', function (req, res) {
            return res.json({zone:config.dns.zone,operation:"zone",status:"OK"}).end();
        });

        // GET status
        app.get('/dns/api/v1/status', function (req, res) {
            return res.json({status:'OK',operation:"status"}).end();
        });
    }

    return routes;
}();