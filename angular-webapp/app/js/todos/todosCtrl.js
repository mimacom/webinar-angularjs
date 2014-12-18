angular.module('todos')
    .controller('todosCtrl', ['$scope', 'i18nService', function ($scope, i18nService) {
        $scope.todos = ['Item 1', 'Item 2', 'Item 3'];

        $scope.addTodo = function () {
            if (angular.isDefined($scope.todo) && $scope.todo != '') {
                $scope.todos.push($scope.todo);
                $scope.todo = '';
                $scope.isEmptyTodo = false;
            } else {
                $scope.isEmptyTodo = true;
            }
        };

        $scope.removeTodo = function (index) {
            $scope.todos.splice(index, 1);
        };
    }]);