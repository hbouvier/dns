DNS
===

A DNS Server with an Web UI and using Redis a configuration store

## To add a new host to the DNS

	curl -X PUT -H 'Content-Type: text/plain' -d '1.1.1.1' http://localhost:8053/dns/api/v1/name/database.domain.com

## To query the address of a host

	curl http://localhost:8053/dns/api/v1/name/database.domain.com
	or
	dig @127.0.0.1 database.domain.com

## To remove a host from the registry

	curl -X DELETE http://localhost:8053/dns/api/v1/name/database.domain.com
	