angular.module('dnsControllers', ['dnsServices', 'dnsModels'])
    .controller('dnsCtrl', function($scope, $location, socket, Hosts, Zone) {
    	$scope.dns = {
    		zone  : Zone.get(),
        	hosts : Hosts.list()
        };
        socket.on('new:host', function (host) {
        	var found = false;
        	for (var i = 0 ; i < $scope.dns.hosts.addresses.length ; ++i) {
        		if ($scope.dns.hosts.addresses[i].name === host.name) {
        			found = true;
        			$scope.dns.hosts.addresses[i].address = host.address;
        			break;
        		}
        	}
        	if (!found) {
        		$scope.dns.hosts.addresses.push(host);
        	}
        });
        socket.on('del:host', function (host) {
        	for (var i = 0 ; i < $scope.dns.hosts.addresses.length ; ++i) {
        		if ($scope.dns.hosts.addresses[i].name === host.name) {
        			$scope.dns.hosts.addresses.splice(i, 1);
        			break;
        		}
        	}
        });

    })
;
