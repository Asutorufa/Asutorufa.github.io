/* global instantsearch: true */
/* global NexT: true */
/*jshint camelcase: false */

document.addEventListener('DOMContentLoaded', function () {
  var algoliaSettings = CONFIG.algolia;
  var isAlgoliaSettingsValid = algoliaSettings.applicationID &&
                               algoliaSettings.apiKey &&
                               algoliaSettings.indexName;

  if (!isAlgoliaSettingsValid) {
    window.console.error('Algolia Settings are invalid.');
    return;
  }

  var search = instantsearch({
    appId: algoliaSettings.applicationID,
    apiKey: algoliaSettings.apiKey,
    indexName: algoliaSettings.indexName,
    searchFunction: function (helper) {
      var searchInput = document.querySelector('#algolia-search-input input');

      if (searchInput.value) {
        helper.search();
      }
    }
  });

  // Registering Widgets
  [
    instantsearch.widgets.searchBox({
      container: '#algolia-search-input',
      placeholder: algoliaSettings.labels.input_placeholder
    }),

    instantsearch.widgets.hits({
      container: '#algolia-hits',
      hitsPerPage: algoliaSettings.hits.per_page || 10,
      templates: {
        item: function (data) {
          var link = data.permalink ? data.permalink : (CONFIG.root + data.path);
          return (
            '<a href="' + link + '" class="algolia-hit-item-link">' +
              data._highlightResult.title.value +
            '</a>'
          );
        },
        empty: function (data) {
          return (
            '<div id="algolia-hits-empty">' +
              algoliaSettings.labels.hits_empty.replace(/\$\{query}/, data.query) +
            '</div>'
          );
        }
      },
      cssClasses: {
        item: 'algolia-hit-item'
      }
    }),

    instantsearch.widgets.stats({
      container: '#algolia-stats',
      templates: {
        body: function (data) {
          var stats = algoliaSettings.labels.hits_stats
                        .replace(/\$\{hits}/, data.nbHits)
                        .replace(/\$\{time}/, data.processingTimeMS);
          return (
            stats +
            '<span class="algolia-powered">' +
            '  <img src="' + CONFIG.root + 'images/algolia_logo.svg" alt="Algolia" />' +
            '</span>' +
            '<hr />'
          );
        }
      }
    }),

    instantsearch.widgets.pagination({
      container: '#algolia-pagination',
      scrollTo: false,
      showFirstLast: false,
      labels: {
        first: '<i class="fa fa-angle-double-left"></i>',
        last: '<i class="fa fa-angle-double-right"></i>',
        previous: '<i class="fa fa-angle-left"></i>',
        next: '<i class="fa fa-angle-right"></i>'
      },
      cssClasses: {
        root: 'pagination',
        item: 'pagination-item',
        link: 'page-number',
        active: 'current',
        disabled: 'disabled-item'
      }
    })
  ].forEach(search.addWidget, search);

  search.start();

  const popupTrigger = document.querySelector('.popup-trigger');
  if (popupTrigger) {
    popupTrigger.addEventListener('click', function(e) {
      e.stopPropagation();
      const overlay = document.createElement('div');
      overlay.className = 'search-popup-overlay algolia-pop-overlay';
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      const popup = document.querySelector('.popup');
      if (popup) popup.style.display = 'block';

      const input = document.querySelector('#algolia-search-input input');
      if (input) input.focus();
    });
  }

  const popupClose = document.querySelector('.popup-btn-close');
  if (popupClose) {
    popupClose.addEventListener('click', function(){
      const popup = document.querySelector('.popup');
      if (popup) popup.style.display = 'none';

      const overlay = document.querySelector('.algolia-pop-overlay');
      if (overlay) overlay.remove();

      document.body.style.overflow = '';
    });
  }

});
