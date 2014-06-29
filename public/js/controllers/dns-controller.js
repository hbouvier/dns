angular.module('dnsControllers', ['dnsServices', 'dnsModels'])
    .controller('dnsCtrl', function($scope, $location, socket, Hosts, Zone) {
    	$scope.dns = {
    		zone  : Zone.get(),
        	hosts : Hosts.list()
        };
        socket.on('new:host', function (host) {
        	var found = false;
        	if ($scope.dns.hosts.addresses) {
	        	for (var i = 0 ; i < $scope.dns.hosts.addresses.length ; ++i) {
	        		if ($scope.dns.hosts.addresses[i].name === host.name) {
	        			found = true;
	        			$scope.dns.hosts.addresses[i].address = host.address;
	        			break;
	        		}
	        	}
	        }
        	if (!found) {
        		if (!$scope.dns.hosts.addresses)
        			$scope.dns.hosts.addresses = [];
        		$scope.dns.hosts.addresses.push(host);
        	}
        });
        socket.on('del:host', function (host) {
        	if ($scope.dns.hosts.addresses) {
	        	for (var i = 0 ; i < $scope.dns.hosts.addresses.length ; ++i) {
	        		if ($scope.dns.hosts.addresses[i].name === host.name) {
	        			$scope.dns.hosts.addresses.splice(i, 1);
	        			break;
	        		}
	        	}
	        }
        });

    })
;
