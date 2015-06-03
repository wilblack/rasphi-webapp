var app = angular.module("rasphiWebappApp");
app.controller("LogFormCtrl", function($rootScope, $scope, $journal, ardyhConf, $ardyh, $user, $location) {
    $scope.page = 'log-form';


    $scope.entryChoices = $journal.entryTypeChoices;
   

    $scope.getTimestamp = function(){
        var now = new Date();
        return now.toISOString();
    }

    $scope.entry = {
        "date": new Date(),
        "time": new Date(),
        // "date": $scope.getTimestamp(),
        // "time": $scope.getTimestamp(),
        "entry":"",
        "type":"other",
        "id": null
    };


    $scope.saveEntry = function(){
        var entry = $scope.entry;
        if (!entry.id) {
            entry.id = $ardyh.generateUUID();
        }

        entry.date = entry.date.toISOString();
        entry.time = entry.time.toISOString();
        $journal.save(entry);
        $location.path("journal");
    }

});