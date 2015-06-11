'user strict';

angular.module('rasphiWebappApp')
.directive('botGraphs', function($sensorValues, $rootScope){
    return{
        scope:true,
        templateUrl: 'views/partials/bot-graphs.html',
        restrict: 'EA',
        link: function(scope, elem, attrs){
            var emptyGraphs = {
                'temp':[{
                    'key':'Temp (&deg;F)',
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

            var emptyMultiChart = [
                {
                    'key':'Temp (F)',
                    'type': 'line',
                    'yAxis':1,
                    'values': []
                },
                {
                    'key':'Humidity',
                    'type': 'line',
                    'yAxis':1,
                    'values': []
                },
                {
                    'key':'Light',
                    'type':'area',
                    'yAxis':2,
                    'values': []
                }
            ];

            scope.multiChartOptions = {
                chart: {
                    type: 'multiChart',
                    height: 350,
                    margin : {
                        top: 30,
                        right: 40,
                        bottom: 50,
                        left: 40
                    },
                    color: d3.scale.category10().range(),
                    //useInteractiveGuideline: true,
                    transitionDuration: 500,
                    xAxis: {
                        tickFormat: function(d){

                            return scope.xAxisTickFormatFunction()(d);
                        }
                    },
                    yAxis1: {
                        tickFormat: function(d){
                            return d3.format(',.1f')(d);
                        }
                    },
                    yDomain1: [0, 100],
                    yAxis2: {
                        tickFormat: function(d){
                            return d3.format(',.1f')(d);
                        }
                    }
                }
            };


            scope.graphs = emptyGraphs;
            scope.multiChart = emptyMultiChart;
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
                    
                    scope.multiChart[0].values = [];
                    scope.multiChart[1].values = [];
                    scope.multiChart[2].values = [];
                    
                    _.each($sensorValues.graphs.temp[0].values, function(val){
                        if (val[1] !== null) {
                            var y = parseFloat(val[1], 10);
                            if (isNaN(y)) console.log("NaN",val)
                            scope.multiChart[0].values.push({x:val[0], y:val[1]});
                        }
                    })
                    _.each($sensorValues.graphs.humidity[0].values, function(val){
                        if (val[1] !== null) scope.multiChart[1].values.push({x:val[0], y:val[1]});
                    })
                    _.each($sensorValues.graphs.light[0].values, function(val){
                        if (val[1] !== null) scope.multiChart[2].values.push({x:val[0], y:val[1]});
                    })
                    $rootScope.$broadcast('sensorvalues-updated');
                    // scope.MultiGraphs[2].value = scope.graphs.light.values;
                },function(data, status) {
                    console.log("failed to fetch sensorValues");
                });
            };

            scope.timeFilterCallback('last-3-days');
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

