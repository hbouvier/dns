[![Build Status](https://travis-ci.org/hbouvier/dns.png)](https://travis-ci.org/hbouvier/dns)
[![dependency Status](https://david-dm.org/hbouvier/dns/status.png?theme=shields.io)](https://david-dm.org/hbouvier/dns#info=dependencies)
[![devDependency Status](https://david-dm.org/hbouvier/dns/dev-status.png?theme=shields.io)](https://david-dm.org/hbouvier/dns#info=devDependencies)
[![NPM version](https://badge.fury.io/js/dns.png)](http://badge.fury.io/js/dns)

DNS
===

A DNS Server with an Web UI and using Redis a configuration store

## Installation

	brew instal redis
	sudo npm install -g dns

## Startup

	/usr/local/opt/redis/bin/redis-server /usr/local/etc/redis.conf >& /tmp/redis.log &
	sudo dns >& /tmp/dns.log &

## Web UI

	open http://localhost:8053

## REDIS CONFIGURATION

	REDIS_PORT_6379_TCP_ADDR  (default: 127.0.0.1)
    REDIS_PORT_6379_TCP_PORT  (default: 6379)

## DNS CONFIGURATION

    DNSINTERFACE (default: 0.0.0.0)
    DNSPORT      (default: 53 <- require root privilege to run)
    DNSZONE      (default: local.dev)
    DNSTTL       (default: 3600 <- one hour)
    DNSPREFIX    (default: "dns:" <- key prefix in redis)
    DNSPRIMARY   (default: 8.8.8.8)
    DNSSECONDARY (default: 8.8.4.4)
    DNSTIMEOUT   (default: 1000 <- 1 second)

## REST ROUTES

	* GET /dns/api/v1/name

		List all host to ip address mapping

	* GET /dns/api/v1/name/{host}

		Return the ip address of only that host

	* PUT /dns/api/v1/name/{host}

		Create or Modify the ip address for "host"

	* GET /dns/api/v1/zone

		Return the DNS ZONE

	* GET /dns/api/v1/status

		Return the DNS status


## To create or modify a host in the DNS configuration

	curl -X PUT -H 'Content-Type: text/plain' -d '291.168.1.100' http://localhost:8053/dns/api/v1/name/database.domain.com

## To query the address of a host

	curl http://localhost:8053/dns/api/v1/name/database.domain.com
	or
	dig @127.0.0.1 database.domain.com

## To remove a host from the registry

	curl -X DELETE http://localhost:8053/dns/api/v1/name/database.domain.com
