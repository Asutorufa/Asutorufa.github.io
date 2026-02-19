/* global NexT: true */
/* global CONFIG: true */

document.addEventListener('DOMContentLoaded', function () {

  var sidebarInner = document.querySelector('.sidebar-inner');
  var sidebar = document.getElementById('sidebar');
  var headerInner = document.querySelector('.header-inner');
  var footerInner = document.querySelector('.footer-inner');

  initAffix();
  resizeListener();

  function initAffix() {
    if (!headerInner || !sidebarInner || !sidebar) return;

    var headerOffset = getHeaderOffset();
    var footerOffset = getFooterOffset();
    var sidebarHeight = sidebar.offsetHeight + NexT.utils.getSidebarb2tHeight();
    var contentHeight = document.getElementById('content') ? document.getElementById('content').offsetHeight : 0;

    // Not affix if sidebar taller then content (to prevent bottom jumping).
    if (headerOffset + sidebarHeight < contentHeight) {
      // Use position: sticky
      sidebarInner.style.position = '-webkit-sticky';
      sidebarInner.style.position = 'sticky';
      sidebarInner.style.top = (CONFIG.sidebar.offset) + 'px';

      // If we used Affix, it handles 'bottom' (footer).
      // With sticky, if sidebar is direct child of a container that stops at footer, it works.
      // But we need to verify layout.
      // Assuming Flexbox layout in Pisces, sidebarInner is inside sidebar column.
    }

    setSidebarMarginTop(headerOffset);
  }

  function resizeListener() {
    var mql = window.matchMedia('(min-width: 991px)');
    mql.addEventListener('change', function (e) {
      if (e.matches) {
        recalculateAffixPosition();
      }
    });
  }

  function getHeaderOffset() {
    return headerInner ? headerInner.offsetHeight + CONFIG.sidebar.offset : 0;
  }

  function getFooterOffset() {
    var footerMargin = 0;
    var footerHeight = 0;
    if (footerInner) {
        footerHeight = footerInner.offsetHeight; // outerHeight(true) logic?
        // footerInner.outerHeight(true) - footerInner.outerHeight() = margin
        // Vanilla: getComputedStyle margin
        var style = window.getComputedStyle(footerInner);
        footerMargin = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    }
    return footerHeight + footerMargin;
  }

  function setSidebarMarginTop(headerOffset) {
    if (sidebar) {
        sidebar.style.marginTop = headerOffset + 'px';
        sidebar.style.marginLeft = 'initial';
    }
  }

  function recalculateAffixPosition() {
    // Clear styles if needed?
    // initAffix sets them.
    initAffix();
  }

});
