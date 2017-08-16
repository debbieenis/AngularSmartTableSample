'use strict';

angular.module('myApp.view1', ['ngRoute','smart-table'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['Resource','$scope', function (Service,$scope) {

    var ctrl = $scope;

    ctrl.test = "dd";
    ctrl.displayed = [];

    ctrl.service = new Service({entityName:"test.json"})

    ctrl.callServer = function callServer(tableState) {

        ctrl.isLoading = true;

        var pagination = tableState.pagination;

        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
        var number = pagination.number || 10;  // Number of entries showed per page.

        ctrl.service.getPage(start, number, tableState).then(function (result) {
            ctrl.displayed = result.data;
            tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update
            ctrl.isLoading = false;
        });
    };

}])

    .factory('Resource', Resource);

Resource.$inject = ['$q', '$filter', '$http'];
/* @ngInject */
function Resource($q, $filter, $http) {

    function ResourceFactory(resourceDTO) {

        var vm = this;
        vm.getPage = getPage;

        vm.promise = $http({ method: 'GET', url: resourceDTO.entityName, params: {} });

        function getPage(start, number, params) {
/*
            if (vm.promise===null){
                var requestConfig = { method: 'GET', url: "app/test.json", params: {} };
                vm.promise = $http(requestConfig);
            }*/
            return vm.promise.then(
                function (response) {
                    var filtered = params.search.predicateObject ? $filter('filter')(response.data, params.search.predicateObject) : response.data;

                    if (params.sort.predicate) {
                        filtered = $filter('orderBy')(filtered, params.sort.predicate, params.sort.reverse);
                    }

                    var result = filtered.slice(start, start + number);

                    return {
                        data: result,
                        numberOfPages: Math.ceil(filtered.length / number)
                    };
                },
                function (response) {
                    return [];
                }
            );

        }
        return vm;
    }

    return ResourceFactory;
};