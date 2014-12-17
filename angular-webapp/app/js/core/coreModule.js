/* global angular */
(function () {
    angular.module('core', [])
        .factory('ConfigService', function () {

            function getLanguages() {
                return [
                    {locale: 'es', name: 'ES'},
                    {locale: 'en', name: 'EN'}
                ];
            }

            return {
                getLanguages: function () {
                    return getLanguages();
                }
            };

        })

}());
