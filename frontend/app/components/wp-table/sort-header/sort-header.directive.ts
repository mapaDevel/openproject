// -- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
// ++

import {WorkPackageTableHierarchyService} from '../../wp-fast-table/state/wp-table-hierarchy.service';
import {
  QuerySortByResource,
  QUERY_SORT_BY_ASC,
  QUERY_SORT_BY_DESC
} from '../../api/api-v3/hal-resources/query-sort-by-resource.service';
import {States} from '../../states.service';
import {WorkPackageTableSortBy} from '../../wp-fast-table/wp-table-sort-by';

angular
  .module('openproject.workPackages.directives')
  .directive('sortHeader', sortHeader);

function sortHeader(wpTableHierarchy: WorkPackageTableHierarchyService,
                    states:States) {
  return {
    restrict: 'A',
    templateUrl: '/components/wp-table/sort-header/sort-header.directive.html',

    scope: {
      column: '=headerColumn',
      locale: '='
    },

    link: function(scope: any, element: ng.IAugmentedJQuery) {
      states.table.sortBy.observeOnScope(scope).subscribe((sortBy:WorkPackageTableSortBy) => {
        let latestSortElement = sortBy.currentSortBys[0];

        if (scope.column.$href !== latestSortElement.column.$href) {
          scope.currentSortDirection = null;
        } else {
          scope.currentSortDirection = latestSortElement.direction;
        }

        setFullTitleAndSummary();

        scope.sortable = sortBy.isSortable(scope.column.$href);

        scope.directionClass = directionClass();
      });

      scope.$watch('currentSortDirection', setActiveColumnClass);

      // Place the hierarchy icon left to the subject column
      scope.isHierarchyColumn = scope.column.id === 'subject';
      scope.toggleHierarchy = function(evt:JQueryEventObject) {
        wpTableHierarchy.toggleState();
        evt.stopPropagation();
        return false;
      }

      function directionClass() {
        if (!scope.currentSortDirection) {
          return '';
        }

        switch (scope.currentSortDirection.$href) {
          case QUERY_SORT_BY_ASC:
            return 'asc';
          case QUERY_SORT_BY_DESC:
            return 'desc';
          default:
            return '';
        }
      }

      function setFullTitleAndSummary() {
        scope.fullTitle = scope.headerTitle;

        if(scope.currentSortDirection) {
          var ascending = scope.currentSortDirection.$href === QUERY_SORT_BY_ASC;
          var summaryContent = [
            ascending ? I18n.t('js.label_ascending') : I18n.t('js.label_descending'),
            I18n.t('js.label_sorted_by'),
            scope.headerTitle + '.'
          ]

          jQuery('#wp-table-sort-summary').text(summaryContent.join(" "));
        }
      }

      function setActiveColumnClass() {
        element.toggleClass('active-column', !!scope.currentSortDirection);
      }
    }
  };
}
