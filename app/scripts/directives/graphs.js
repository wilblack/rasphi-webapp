'user strict';

angular.module('rasphiWebappApp')
.directive('botGraphs', function($sensorValues){
    return{
        scope:true,
        templateUrl: 'views/partials/bot-graphs.html',
        restrict: 'EA',
        link: function(scope, elem, attrs){

            scope.graphs = {
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

            //Grab archived data
            $sensorValues.fetch()
            .then(function(data, status){
                console.log("successly fetch sensorValues");
                scope.graphs = $sensorValues.graphs;
            },function(data, status) {
                console.log("failed to fetch sensorValues");
            });

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

