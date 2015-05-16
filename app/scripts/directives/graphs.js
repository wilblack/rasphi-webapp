'user strict';

angular.module('rasphiWebappApp')
.directive('botGraphs', function($sensorValues){
    return{
        scope:true,
        templateUrl: 'views/partials/bot-graphs.html',
        restrict: 'EA',
        link: function(scope, elem, attrs){
            var emptyGraphs = {
                'temp':[{
                    'key':'Temp (C)',
                    'values': []
                }],
                'humidity':[{
                    'key':'Humidity',
                    'values': []
                }],
                'light':[{
                    'key':'Light',
                    'values': []
                }]
            };

            scope.graphs = emptyGraphs;

            //Grab archived data


            // $sensorValues.fetch()
            // .then(function(data, status){
            //     console.log("successly fetch sensorValues");
            //     scope.graphs = $sensorValues.graphs;
            // },function(data, status) {
            //     console.log("failed to fetch sensorValues");
            // });

            scope.tempColor = function(){
                

                return function(d, i) {
                    var color = "#408E2F";
                    return color;
                }
            };


            scope.xAxisTickFormatFunction = function(){
                return function(d){
                    return new Date(d).toString("ddd hh:mmt");
                };
            };

            scope.timeFilterCallback = function(value) {
                
                scope.timestampFilter = value;
                var now = new Date();
                var days = value.split("-")[1];
                var then = now.addDays(-parseInt(days, 10)).addHours(-7);
                console.log("then: ", then.toISOString());
                var filters = {
                    "timestamp_gte":then.toISOString()
                };
                
                $sensorValues.fetch(filters)
                .then(function(data, status){
                    console.log("successly fetch sensorValues: ", $sensorValues.graphs.temp[0].values.length);
                    scope.graphs = emptyGraphs;
                    scope.graphs = $sensorValues.graphs;
                },function(data, status) {
                    console.log("failed to fetch sensorValues");
                });
            };

            scope.timeFilterCallback('last-1-days');
        }   
    };
})

.directive('changeDirection', function($sensorValues){
    return{
        scope:{
            previous: "=",
            current: "="
            },
        templateUrl: 'views/partials/change-direction.html',
        restrict: 'EA',
        link: function(scope, elem, attrs){

            
        }
    };
});

