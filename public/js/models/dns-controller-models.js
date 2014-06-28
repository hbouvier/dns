angular.module('dnsModels', [])
    .factory('ConfigModel', function() {
        var model = {
            sayHello : true
        };
        return model;
    })
    .factory('ToDoModel', function() {
        var model = {
        	todo : [
        		"do one thing",
        		"do another thing",
        		"do nothing",
        		"do something"
        	]
        };
        return model;
    })
;
