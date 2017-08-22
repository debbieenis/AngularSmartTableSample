'use strict';

angular.module('myApp.view1', ['ngRoute','smart-table'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['Resource','$scope' ,'Grid' ,'Resource', 'Columns' ,'Column' ,'ColumnFormater' ,'ColumnFormaterComposite', function (Service,$scope,Grid,Resource,Columns,Column,ColumnFormater,ColumnFormaterComposite) {

    var ctrl = $scope;
    ctrl.a ="a";
    ctrl.grid = new Grid({
                            resource:new Resource({entityName:"users.json"}),
                            columns:new Columns({items:
                                [
                                    new Column({key:"id",title:"מזהה",formater: new ColumnFormater({key:"id"})}),
                                    new Column({key:"fullName",title:"שם מלא",
                                        formater:new ColumnFormaterComposite({separator:" ",formaters:
                                            [
                                                new ColumnFormater({key:"name"}),
                                                new ColumnFormater({key:"engName"})
                                            ]})})
                                ]}
                            )});

}])


    .factory('Resource', Resource)
    .factory('ColumnFormater', ColumnFormater)
    .factory('ColumnFormaterComposite', ColumnFormaterComposite)
    .factory('Column', Column)
    .factory('Columns', Columns)
    .factory('Grid', Grid)
    .directive('vfDataGrid', vfDataGrid);

vfDataGrid.$inject = ['$rootScope', '$filter'];
function vfDataGrid($rootScope, $filter){
    var directive = {
        scope: {
            'vfGrid': '=',
            //value: '=ngModel'
        },
        //require: 'ngModel',
        restrict     : 'EA',
        controller   : controllerVfGrid,
        controllerAs : 'vm',
        link         : linkVfGrid,
        bindToController: true,
        templateUrl : "view1/grid.html"

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

ColumnFormater.$inject = [];
/* @ngInject */
function ColumnFormater() {

    //{key:"Id"}
    function ColumnFormaterFactory(columnFormaterDTO) {

        var vm = this;

        vm.format = format;
        vm.setKey = setKey;

        function setKey(key){
            columnFormaterDTO.key = key;
        }

        function format(row){
            return row[columnFormaterDTO.key];
        }

        return vm;
    }
    return ColumnFormaterFactory;
};

ColumnFormaterComposite.$inject = [];
/* @ngInject */
function ColumnFormaterComposite() {
    //{formaters:[],separator:" "}
    function ColumnFormaterCompositeFactory(columnFormaterCompositeDTO) {

        var vm = this;

        vm.format = format;

        function format(row){
            var formatedArray = columnFormaterCompositeDTO.formaters.map(function(formater){
                return formater.format(row);
            })
            return formatedArray.join(columnFormaterCompositeDTO.separator);
        }

        return vm;
    }
    return ColumnFormaterCompositeFactory
};


Column.$inject = [];
/* @ngInject */
function Column() {

    //{key:"Id",title:"id",formater:"Number"}
    function ColumnFactory(columnDTO) {

        var vm = this;

        vm.format = format;
        vm.getKey = getKey;
        vm.getTitle = getTitle;

        function getKey(){
            return columnDTO.key;
        }

        function getTitle(){
            return columnDTO.title;
        }

        function format(row){
            return columnDTO.formater.format(row);
        }

        return vm;
    }
    return ColumnFactory;
};

Columns.$inject = [];
/* @ngInject */
function Columns() {

    //{items:[]}
    function ColumnsFactory(columnsDTO) {

        var vm = this;
        vm.forEach = forEach;
        vm.getAll = getAll;

        function getAll(){
            return columnsDTO.items;
        }

        function forEach(func){
            columnsDTO.items.forEach(func);
        }


        return vm;
    }
    return ColumnsFactory;
};

Grid.$inject = [];
/* @ngInject */
function Grid() {

    //{resource:new Resource({entityName:"users"}),columns:new Columns([new Column({key:"Id",title:"id",formater:new ColumnFormater({key:"Id"}})]}
    function GridFactory(gridDTO) {

        var vm = this;

        vm.getColumns = getColumns;

        function getColumns(){
            return gridDTO.columns.getAll();
        }

        vm.isLoading = true;
        vm.user = null;
        vm.ModalController = null;

        vm.allUsers = [];
        vm.rows = [];
        vm.rowCsollection = [];
        vm.itemsByPage = "8";
        vm.deleteUser = deleteUser;

        vm.viewRecord = viewRecord;

        debugger;

        ///////////////////////////////////////////////////////////////////////
        initController();
        /////////////////////////////////////////////////////////////////////////

        function initController() {
            loadAllUsers();
        }


        function loadAllUsers() {
            gridDTO.resource.GetAll()
                .then(function (users) {
                    debugger;
                    vm.allUsers = users;
                    vm.rows = users;
                    vm.rowCollection = [].concat(vm.rows);

                    if (users && users.length > 0) {
                        for (var i = 0; i < users.length; i++) {
                            gridDTO.columns.forEach(function(column){
                                users[i][column.getKey()] = column.format(users[i]);
                            })
                            //users[i].fullName = users[i].name + ' ' + users[i].engName;
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
    return GridFactory;
};

Resource.$inject = ['$http'];
/* @ngInject */
function Resource($http) {

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