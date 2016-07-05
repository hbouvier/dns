#!/bin/sh

# Force redis in the background and make sure we only listen onto the local
# address. These really are the defaults on Alpine, but the following command
# makes it explicit.
redis-server /etc/redis.conf --daemonize yes --bind 127.0.0.1

# Now, replace ourselves by the Node DNS server.
exec node $(dirname "$0")/dns "$@"
