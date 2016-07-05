'use strict';

angular
    .module('pinchApp')
    .directive('toolTip', toolTip)

function toolTip() {
    return function(scope, element, attrs) {
        angular.element('.tool-tip').on('click mouseleave', hideTooltip);
        angular.element('.tool-tip').on('mouseenter', showTooltip);
    };
}

function hideTooltip() {
    $(this).tooltip('hide');
}

function showTooltip() {
    $(this).tooltip('show');
}
