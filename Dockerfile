FROM mhart/alpine-node
MAINTAINER Emmanuel Frecon <efrecon@gmail.com>

RUN apk --no-cache add redis

COPY bin/ /opt/htdns/bin/
COPY lib/ /opt/htdns/lib/
COPY public/ /opt/htdns/public/
COPY .npmignore /opt/htdns/
COPY package.json /opt/htdns

WORKDIR /opt/htdns
RUN npm update

EXPOSE 8053
EXPOSE 53

ENTRYPOINT ["/opt/htdns/bin/dns.sh"]