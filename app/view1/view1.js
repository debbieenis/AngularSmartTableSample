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

    ctrl.grid = new Grid({
                            resource:new Resource({entityName:"users"}),
                            columns:new Columns(
                                [new Column({key:"Id",title:"id",type:"Number"})]
                            )});

}])


    .factory('Resource', Resource)
    .factory('Column', Column)
    .factory('Columns', Columns)
    .factory('Grid', Grid)
    .directive('vfDataGrid', vfDataGrid);

vfDataGrid.$inject = ['$rootScope', '$filter'];
function vfDataGrid($rootScope, $filter){
    var directive = {
        scope: {
            'vfGrid': '=',
            value: '=ngModel'
        },
        require: 'ngModel',
        restrict     : 'EA',
        controller   : controllerVfGrid,
        controllerAs : 'vm',
        link         : linkVfGrid,
        bindToController: true,
        templateUrl : "/app/view1/grid.html"

    };
    return directive;
}

controllerVfGrid.$inject = ['$scope', '$rootScope'];

function controllerVfGrid($scope, $rootScope ) {
    debugger;



}

function linkVfGrid($scope, element, attrs, ctrl) {
    var ngModelController = ctrl;
    /*
    $scope.grid = new $scope.vm.Grid(element,
        function(value){
            ngModelController.$setViewValue(value);
        },
        $scope.vm.vfWhere,
        $scope.vm.vfConfig
    );

    ngModelController.$render = function() {
        var value = ngModelController.$viewValue;
        if (value!="" && value) {
            console.log("$render grid"+value);
            $scope.grid.setValue(value);
        }
    };*/
//    });

}

Column.$inject = ['$q', '$filter', '$http'];
/* @ngInject */
function Column($q, $filter, $http) {

    //{key:"Id",title:"id",type:"Number"}
    function ColumnFactory(columnDTO) {

        var vm = this;


        return vm;
    }
};

Columns.$inject = ['$q', '$filter', '$http'];
/* @ngInject */
function Columns($q, $filter, $http) {

    //{items:[]}
    function ColumnsFactory(columnsDTO) {

        var vm = this;


        return vm;
    }
};

Grid.$inject = ['$q', '$filter', '$http'];
/* @ngInject */
function Grid($q, $filter, $http) {

    //{resource:new Resource({entityName:"users"}),columns:new Columns([new Column({key:"Id",title:"id",type:"Number"})]}
    function GridFactory(gridDTO) {

        var vm = this;


        vm.isLoading = true;
        vm.user = null;
        vm.ModalController = null;

        vm.allUsers = [];
        vm.rows = [];
        vm.rowCsollection = [];
        vm.itemsByPage = "8";
        vm.deleteUser = deleteUser;

        vm.viewRecord = viewRecord;


        ///////////////////////////////////////////////////////////////////////
        initController();
        /////////////////////////////////////////////////////////////////////////

        function initController() {
            loadAllUsers();
        }


        function loadAllUsers() {
            gridDTO.resource.GetAll()
                .then(function (users) {
                    vm.allUsers = users;
                    vm.rows = users;
                    vm.rowCollection = [].concat(vm.rows);

                    if (users && users.length > 0) {
                        for (var i = 0; i < users.length; i++) {
                            users[i].fullName = users[i].name + ' ' + users[i].engName;
                        }
                    }
                    vm.isLoading = false;
                    vm.rows = users;
                    vm.rowCollection = [].concat(vm.rows);

                });
        }

        function deleteUser(id) {
            if (confirm('Are you sure you want to delete this?')) {
                gridDTO.resource.Delete(id)
                    .then(function () {
                        loadAllUsers();
                    });
            }
        }



        function viewRecord(size, id) {

            if (id > 0) {
                gridDTO.resource.GetById(id)
                    .then(function (response) {
                        vm.user =response;

                        vm.animationsEnabled = true;
                        var modalInstance = $uibModal.open({
                            animation: vm.animationsEnabled,
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl:  'myModalContent.html', //'/Areas/Admin/NgApp/controllers/viewRecord.html',


                            controller: 'ModalInstanceCtrl',
                            controllerAs: 'vm',
                            size: size,
                            resolve: {
                                MunicipalityRecord: function () {
                                    return vm.user;
                                },
                                UserService: UserService,
                            }
                        });

                        modalInstance.result.then(function (selectedItem) {
                            //vm.selected = selectedItem;

                        }, function () {
                            $log.info('Modal dismissed at: ' +new Date());
                        });



                    });
            }
        }

    return vm;
    }
};

Resource.$inject = ['$q', '$filter', '$http'];
/* @ngInject */
function Resource($q, $filter, $http) {

    function ResourceFactory(resourceDTO) {

        var vm = this;
        vm.promise = $http({ method: 'GET', url: resourceDTO.entityName, params: {} });
        vm.GetAll = GetAll;
        vm._handleSuccess = _handleSuccess;
        vm._handleError =  _handleError;

        function _handleSuccess(res) {
            return res.data;
        }


        function _handleError(error) {
            return function () {
                return { success: false, message: error };
            };
        }

        function GetAll(){
            return vm.promise.then(
                vm._handleSuccess,
                vm._handleError('Error getting all '+resourceDTO.entityName)
            );
        }
        return vm;
    }

    return ResourceFactory;
};