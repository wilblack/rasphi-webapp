var app = angular.module("rasphiWebappApp");
app.controller("JournalCtrl", function($rootScope, $scope, $journal, ardyhConf, $user, ardyhConf) {
    $scope.page = 'journal';
    $scope.ardyhConf = ardyhConf;
    $scope.journal = $journal;

    $scope.type2color = function(type){
        var color = $journal.type2color(type);
        return {'color':color};
    };

    $scope.type2icon = function(type){
        var icon = $journal.type2icon(type);
        return icon;
        
    };

});