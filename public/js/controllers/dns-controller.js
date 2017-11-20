Array.prototype.remove=function(obj){
    for(var i =0;i <this.length;i++){
        var temp = this[i];
        if(temp == obj){
            for(var j = i;j <this.length;j++){
                this[j]=this[j+1];
            }
            this.length = this.length-1;
        }
    }
};
angular.module('dnsControllers', ['dnsServices', 'dnsModels'])
    .controller('dnsCtrl', function($scope, $location, socket, Hosts, Zone) {
    	$scope.dns = {
    		zone  : Zone.get(),
        	hosts : Hosts.list()
        };
        $scope.newitem = {
            name: "",
            record: {
                A: [],
                AAA: []
            }
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

        $scope.addIP = function (item, isAction, ipv4, ipv6) {
            if (ipv4 && item.record.A.indexOf(ipv4) < 0) {
                item.record.A.push(ipv4);
                if (isAction) {
                    Hosts.put({name:item.name}, item.record);
                }
                item.tmp.ipv4="";
            }
            if (ipv6  && item.record.A.indexOf(ipv6) < 0) {
                item.record.AAA.push(ipv6);
                if (isAction) {
                    Hosts.put({name:item.name}, item.record);
                }
                item.tmp.ipv6="";
            }
        };
        $scope.deleteIP = function (item, isAction, ipv4, ipv6) {
            if (ipv4) {
                item.record.A.remove(ipv4);
            }
            if (ipv6) {
                item.record.AAA.remove(ipv6);
            }
            if (isAction) {
                Hosts.put({name:item.name},item.record);
            }
        };
        $scope.deleteDomain = function (DomainName) {
            Hosts.delete({name:DomainName});
        };
        $scope.createDomain = function () {
            if ($scope.newitem.name && ($scope.newitem.record.A.length > 0 || $scope.newitem.record.AAA.length > 0)) {
                $scope.newitem.record.ipv4 = $scope.newitem.record.A;
                $scope.newitem.record.ipv6 = $scope.newitem.record.AAA;
                Hosts.put({name: $scope.newitem.name}, $scope.newitem.record);
                $scope.clearNewItem();
            }
        };
        $scope.clearNewItem = function () {
            $scope.newitem = {
                name: "",
                record: {
                    A: [],
                    AAA: []
                }
            };
        };
    })
;
