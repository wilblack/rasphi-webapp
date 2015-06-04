var app = angular.module("rasphiWebappApp");
app.controller("JournalCtrl", function($rootScope, $scope, $journal, ardyhConf, $user, $modal) {
    $scope.page = 'journal';
    $scope.ardyhConf = ardyhConf;
    $scope.journal = $journal;
    $scope.delete = {};

    $scope.filters = [];

    var deleteModal = $modal({
        template: "views/partials/delete-modal.html",
        title:'Are you sure you want to delete this entry?',
        content: 'This cannot be undone.',
        show: false,
        backdrop:'static',
        scope:$scope
    });

    $scope.toggleFilters = function(value){
        var newFilters = [].concat($scope.filters);

        var index = _.indexOf($scope.filters, value);
        if (index > -1){
            newFilters.splice(index, 1);
        } else {
            newFilters.push(value);
        }
        $scope.filters = newFilters;
    }

    $scope.typeFilter = function(element){
        if ($scope.filters.length === 0) {
            return true;
        } else {
            return (_.indexOf($scope.filters, element.type) > -1);
        }
        
    }

    $scope.type2color = function(type){
        var color = $journal.type2color(type);
        return {'color':color};
    };

    $scope.type2icon = function(type){
        var icon = $journal.type2icon(type);
        return icon;
    };

    $scope.showDeleteModal = function(entry){
        $scope.delete.entry = entry;
        deleteModal.show();
    }

    $scope.deleteEntry = function(entry) {
        $journal.entries.$remove($scope.delete.entry)
        .then(function(ref){
            $scope.delete = {};
        });
    };

});