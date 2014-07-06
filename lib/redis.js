module.exports = function () {
    var util   = require('util'),
        redis  = require('redis');

    function Redis(config) {
        var $this = this;
        this.config  = {};
        this.config.addr = process.env.REDIS_PORT_6379_TCP_ADDR || config.redis.host;
        this.config.port = process.env.REDIS_PORT_6379_TCP_PORT || config.redis.port;
        this.meta   = config.meta;
        this.logger = config.logger;

        function connect() {
            $this.state = "disconnected";
            $this.logger.log('info', "redis:connect(%s:%s)|state[%s]", $this.config.addr, $this.config.port, $this.state, $this.meta);
            $this.redis = redis.createClient($this.config.port, $this.config.addr);
            $this.redis.on("connect", function () {
                $this.logger.log('info', "redis:on(connect)|state[%s->connect]", $this.state, $this.meta);
                $this.state = "connect";
            });
            $this.redis.on("ready", function () {
                $this.logger.log('debug', "redis:on(ready)|state[%s->ready]", $this.state, $this.meta);
                $this.state = "ready";
            });
            $this.redis.on("error", function (err) {
                $this.logger.log('error', "redis:on(error)|state[%s->error]|err=%s", $this.state, util.inspect(err, true), $this.meta);
                $this.state = "error";
                if (err.message.indexOf("ECONNREFUSED") < 0) {
                    $this.logger.log('error', "REDIS: the error was not a conneciton closed and the driver is usually stuck. Exiting to force a restart!");
                    process.exit();
                }
            });
            $this.redis.on("end", function () {
                $this.logger.log('error', "redis:on(end)|state[%s->end]| ********************** CONNECTION LOST WITH REDIS **********************", $this.state, $this.meta);
                $this.state = "end";
            });
            $this.redis.on("drain", function () {
                $this.logger.log('debug', "redis:on(drain)|state[%s->drain]", $this.state, $this.meta);
                $this.state = "drain";
            });
            $this.redis.on("idle", function () {
                $this.logger.log('debug', "redis:on(idle)|state[%s->idle]", $this.state, $this.meta);
                $this.state = "idle";
            });
        }
        connect();
    }
    Redis.prototype.isReady = function() {
        if (this.state === "connect" || this.state === "ready" ||
            this.state === "drain"   || this.state === "idle") {
            ready = true;
        } else {
            ready = false;
        }
        return ready;
    };

    Redis.prototype.get = function(key, next) {
        if (!this.isReady())
            return next(new Error("redis:get(key=" + key + ")|state=" + this.state));
        this.redis.get(key, next);
    };

    Redis.prototype.keys = function (pattern, next) {
        if (!this.isReady())
            return next(new Error("redis:keys(pattern=" + pattern + ")|state=" + this.state));
        this.redis.keys(pattern, next);
    };

    Redis.prototype.mget = function (keys, next) {
        if (!this.isReady())
            return next(new Error("redis:mget(keys=" + keys + ")|state=" + this.state));
        this.redis.mget(keys, next);
    };

    Redis.prototype.mgetkeys = function (pattern, next) {
        var $this = this;
        if (!this.isReady())
            return next(new Error("redis:mgetkeys(pattern=" + pattern + ")|state=" + this.state));
        this.keys(pattern, function (err, keys) {
            if (err)
                return next(err);
            $this.mget(keys, function (err, values) {
                if (err)
                    return next(err);
                var vector = [];
                for(var i = 0 ; i < keys.length && i < values.length ; ++i) {
                    vector.push({key:keys[i],value:values[i]});
                }
                next(null, vector);
            });
        });
    };

    Redis.prototype.set = function (key, value, next) {
        if (!this.isReady())
            return next(new Error("redis:set(key=" + key + ", value=" + value + ")|state=" + this.state));
        this.redis.set(key, value, next);
    };

    Redis.prototype.del = function (key, next) {
        if (!this.isReady())
            return next(new Error("redis:del(key=" + key + ")|state=" + this.state));
        this.redis.del(key, next);
    };

    function create(config) {
        return new Redis(config);
    }

    return {
        create : create
    };
}();
