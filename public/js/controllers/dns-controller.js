angular.module('dnsControllers', ['dnsServices', 'dnsModels'])
    .controller('dnsCtrl', function($scope, $location, socket, Hosts, Zone) {
    	$scope.dns = {
    		zone  : Zone.get(),
        	hosts : Hosts.list()
        };
        socket.on('new:host', function (host) {
        	var found = false;
        	if ($scope.dns.hosts.records) {
	        	for (var i = 0 ; i < $scope.dns.hosts.records.length ; ++i) {
	        		if ($scope.dns.hosts.records[i].name === host.name) {
	        			found = true;
	        			$scope.dns.hosts.records[i].record = host.record;
	        			break;
	        		}
	        	}
	        }
        	if (!found) {
        		if (!$scope.dns.hosts.records)
        			$scope.dns.hosts.records = [];
        		$scope.dns.hosts.records.push(host);
        	}
        });
        socket.on('delete:host', function (host) {
        	if ($scope.dns.hosts.records) {
	        	for (var i = 0 ; i < $scope.dns.hosts.records.length ; ++i) {
	        		if ($scope.dns.hosts.records[i].name === host.name) {
	        			$scope.dns.hosts.records.splice(i, 1);
	        			break;
	        		}
	        	}
	        }
        });

    })
;
