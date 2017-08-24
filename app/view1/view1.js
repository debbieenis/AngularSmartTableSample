'use strict';

angular.module('myApp.view1', ['ngRoute','smart-table','ui.bootstrap','ngMockE2E'])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])
    .run(['$httpBackend',function($httpBackend) {
        var users = [{"id": 1,
            "name": "aa",
            "engName": "aa2",
            "saved":"ff"},
            {"id": 2,
                "name": "dd",
                "engName": "dd2",
                "age": 3,
                "saved":"ff"}
        ];

        $httpBackend.whenGET(/^view1\//).passThrough();

        // returns the current list of phones
        $httpBackend.whenGET('/users').respond(users);

        $httpBackend.whenPUT(/\/users\/(\d+)/, undefined, undefined, ['id']).respond(function(method, url, data, headers, params) {

            var parsedData=null;
            users.forEach(function (row) {
                if (params.id==row.id){
                    parsedData = angular.fromJson(data);
                    angular.extend(row, parsedData);
                    return;
                };
            });

            if (parsedData == null) {
                return [404, undefined, {}];
            }

            return [200, parsedData, {}];
        });

        // adds a new phone to the phones array
        $httpBackend.whenPOST('/users').respond(function(method, url, data) {
            var user = angular.fromJson(data);
            user.id = users[users.length-1].id+1;
            users.push(user);
            return [200, user, {}];
        });

        $httpBackend.whenDELETE(/\/users\/(\d+)/, undefined, ['id']).respond(function(method, url, data, headers, params) {
            var user=null;

            users.forEach(function (row) {
                if (params.id==row.id){
                    user = row;
                    return;
                };
            });

            if (user == null) {
                return [404, undefined, {}];
            }

            // Replace contacts array with filtered results, removing deleted contact.
            users.splice(users.indexOf(user), 1);

            return [200, undefined, {}];
        });
    }])

.controller('View1Ctrl', ['Resource','$scope' ,'Grid' ,'Resource', 'Columns' ,'Column' ,'ColumnFormater' ,'ColumnFormaterComposite', '$uibModal', function (Service,$scope,Grid,Resource,Columns,Column,ColumnFormater,ColumnFormaterComposite,$uibModal) {

    var ctrl = $scope;


    ctrl.grid = new Grid({
                            resource:new Resource({entityName:"users"}),
                            columns:new Columns({items:
                                [
                                    new Column({key:"id",title:"מזהה",formater: new ColumnFormater({key:"id"}),editable:true,viewable:true}),
                                    new Column({key:"name",title:"שם",formater: new ColumnFormater({key:"name"}),editable:true,viewable:false}),
                                    new Column({key:"engName",title:"שם אנגלית",formater: new ColumnFormater({key:"engName"}),editable:true,viewable:false}),
                                    new Column({key:"fullName",title:"שם מלא",editable:false,viewable:true,
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
    .directive('vfDataGrid', vfDataGrid)
    .controller('ModalInstanceCtrl', ModalInstanceCtrl);

function ModalInstanceCtrl($uibModalInstance, MunicipalityRecord, Columns, Resource) {
    var $ctrl = this;
    $ctrl.MunicipalityRecord = MunicipalityRecord;
    $ctrl.getColumns = getColumns;

    function getColumns(){
        return Columns;
    }
    $ctrl.ok = function () {
        var func = ($ctrl.MunicipalityRecord.id)?Resource.Update:Resource.Add;
        func($ctrl.MunicipalityRecord).then(
            function (response){
                $uibModalInstance.close(response);
            }
        )
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
};

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

    //{key:"Id",title:"id",formater:"Number",viewable:true,editable:true}
    function ColumnFactory(columnDTO) {

        var vm = this;

        vm.format = format;
        vm.getKey = getKey;
        vm.getTitle = getTitle;
        vm.isViewable = isViewable;
        vm.isEditable = isEditable;

        function isEditable(){
            return columnDTO.editable;
        }

        function isViewable(){
            return columnDTO.viewable;
        }

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
        vm._forEach = _forEach;
        vm.getAll = getAll;
        vm.getViewable = getViewable;
        vm.getEditable = getEditable;
        vm.formatRows = formatRows;
        vm.formatRow = formatRow;

        function getAll(){
            return columnsDTO.items;
        }

        function getEditable(){
            return columnsDTO.items.filter(function(column){
                return column.isEditable()
            });
        }

        function getViewable(){
            return columnsDTO.items.filter(function(column){
                return column.isViewable()
            });
        }

        function formatRow(row){
            var formatedRow = {};
            vm.getViewable().forEach(function(column){
                formatedRow[column.getKey()] = column.format(row);
            });
            return formatedRow;
        }

        function formatRows(rows){
            return rows.map(function(row){
                var formatedRow = vm.formatRow(row);
                return formatedRow;
            })
        }
        function _forEach(func){
            columnsDTO.items.forEach(func);
        }


        return vm;
    }
    return ColumnsFactory;
};

Grid.$inject = ['$uibModal'];
/* @ngInject */
function Grid($uibModal) {

    //{resource:new Resource({entityName:"users"}),columns:new Columns([new Column({key:"Id",title:"id",formater:new ColumnFormater({key:"Id"}})]}
    function GridFactory(gridDTO) {

        var vm = this;

        vm.getColumns = getColumns;
        vm.getEditableColumns =getEditableColumns;

        function getEditableColumns(){
            return gridDTO.columns.getEditable();
        }

        function getColumns(){
            return gridDTO.columns.getViewable();
        }

        vm.isLoading = true;
        vm.user = null;
        vm.ModalController = null;

        vm.allUsers = [];
        vm.rows = [];
        vm.rowCsollection = [];
        vm.itemsByPage = "8";
        vm.deleteUser = deleteUser;
        vm.editRecord = editRecord;
        vm.addRecord = addRecord;

        vm._viewRecord = _viewRecord;


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
                        vm.rows = gridDTO.columns.formatRows(users);
                    }
                    vm.isLoading = false;
                    vm.rowCollection = [].concat(vm.rows);

                });
        }

        function deleteUser(id) {
            if (confirm('Are you sure you want to delete this?')) {
                gridDTO.resource.Delete(id)
                    .then(function () {
                        for (var i = 0; i < vm.allUsers.length; i++) {
                            var row = vm.allUsers[i];
                            if (row.id == id){
                                vm.allUsers.splice(i, 1);
                                vm.rows.splice(i, 1);
                                break;
                            };
                        }
                    });
            }
        }

        function editRecord(size,id){
            var user = {};
            for (var i = 0; i < vm.allUsers.length; i++) {
                var row = vm.allUsers[i];
                if (row.id == id){
                    user = row;
                    break;
                };
            }
            return vm._viewRecord(size,user)
        }

        function addRecord(size){
            return vm._viewRecord(size,{})
        }

        function _viewRecord(size, user) {

            //if (id > 0) {
                //gridDTO.resource.GetById(id)
                  //  .then(function (response) {
                        //vm.user =response;

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
                                    return user;
                                },
                                Columns: function () {
                                    return vm.getEditableColumns()
                                },
                                Resource : gridDTO.resource
                            }
                        });

                        modalInstance.result.then(function (selectedItem) {
                            var found = false;
                            var newRecord = gridDTO.columns.formatRow(selectedItem);
                            for (var i = 0; i < vm.rows.length; i++) {
                                var row = vm.rows[i];
                                if (row.id == user.id){
                                    angular.extend(row, newRecord);
                                    vm.allUsers[i] = selectedItem;
                                    found=true;
                                    break;
                                };
                            }
                            if (!found){
                                vm.rows.push(newRecord);
                                vm.allUsers.push(selectedItem);

                            }

                            //vm.selected = selectedItem;

                        }, function () {
                            //$log.info('Modal dismissed at: ' +new Date());
                        });



                    //});
            //}
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
        vm.url = "/";
        vm.promise = $http({ method: 'GET', url: vm.url + resourceDTO.entityName, params: {} });
        vm.GetAll = GetAll;
        vm.GetById = GetById;
        vm.Update = Update;
        vm.Add = Add;
        vm.Delete = Delete;
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

        function GetById(id){

        }

        function Delete(id){
            return $http.delete(vm.url + resourceDTO.entityName+"/"+id)
                .then(vm._handleSuccess, vm._handleError('Error deleting user'));
        }

        function Add(item){
            return $http.post(vm.url + resourceDTO.entityName, item)
                .then(vm._handleSuccess, vm._handleError('Error adding user'));
        }

        function Update(item){
            return $http.put(vm.url + resourceDTO.entityName+"/"+item.id, item)
                .then(vm._handleSuccess, vm._handleError('Error updating user'));
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