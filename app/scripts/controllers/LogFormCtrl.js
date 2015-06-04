var app = angular.module("rasphiWebappApp");
app.controller("LogFormCtrl", function($rootScope, $scope, $journal, ardyhConf, $ardyh, $user, $location, $routeParams) {
    $scope.page = 'log-form';
    $scope.entryId = $routeParams.entryId || null;
    $scope.entryChoices = $journal.entryTypeChoices;
   

    $scope.getTimestamp = function(){
        var now = new Date();
        return now.toISOString();
    }

    if ($scope.entryId) {
        $scope.entry = $journal.getEntryById($scope.entryId);
        $scope.entry.date = Date.parse($scope.entry.date);
        $scope.entry.time = Date.parse($scope.entry.time);
    } else {
        $scope.entry = {
            "date": new Date(),
            "time": new Date(),
            "entry":"",
            "type":"other",
        };
    }

    $scope.saveEntry = function(){
        var entry = $scope.entry;
        entry.date = entry.date.toISOString();
        entry.time = entry.time.toISOString();
        $journal.save(entry);
        $location.path("journal");
    }

});