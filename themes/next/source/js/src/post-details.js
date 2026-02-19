/* global NexT: true */
/* global Velocity: true */

document.addEventListener('DOMContentLoaded', function () {

  initScrollSpy();

  function initScrollSpy() {
    var tocSelector = '.post-toc';
    var tocElement = document.querySelector(tocSelector);
    var activeCurrentSelector = '.active-current';

    if (!tocElement) return;

    var sections = document.querySelectorAll('.post-body h1, .post-body h2, .post-body h3, .post-body h4, .post-body h5, .post-body h6');
    var navLinks = document.querySelectorAll(tocSelector + ' a');

    if (sections.length === 0 || navLinks.length === 0) return;

    function activate(target) {
      var targetLink = document.querySelector(tocSelector + ' a[href="' + target + '"]');
      if (!targetLink) return;

      var currentActive = document.querySelector(tocSelector + ' .active');
      if (currentActive) {
          currentActive.classList.remove('active');
      }

      var listElement = targetLink.parentNode;
      listElement.classList.add('active');

      // Also add active to parents
      var parent = listElement.parentNode;
      while (parent && !parent.classList.contains('post-toc')) {
          if (parent.tagName === 'LI') {
              parent.classList.add('active');
          }
          parent = parent.parentNode;
      }

      // Handle active-current
      var allActive = document.querySelectorAll(tocSelector + ' .active');
      var lastActiveElement = allActive[allActive.length - 1];

      document.querySelectorAll(tocSelector + ' ' + activeCurrentSelector).forEach(function(el) {
          el.classList.remove(activeCurrentSelector.substring(1));
      });

      if (lastActiveElement) {
          lastActiveElement.classList.add(activeCurrentSelector.substring(1));

          // Scrolling to center active TOC element if TOC content is taller then viewport.
          var tocHeight = tocElement.offsetHeight;
          var elTop = lastActiveElement.offsetTop;
          // Logic: element top relative to TOC container
          // But offsetTop is relative to parent.
          // If parent is TOC container or descendant.
          // TOC container scrolls.
          // We need position of element relative to TOC container top.
          // elTop is relative to offsetParent.
          // Assuming TOC is offsetParent or close.

          // Simplified logic:
          var elRect = lastActiveElement.getBoundingClientRect();
          var tocRect = tocElement.getBoundingClientRect();
          var relativeTop = elRect.top - tocRect.top + tocElement.scrollTop;

          tocElement.scrollTop = relativeTop - (tocHeight / 2);
      }
    }

    function onScroll() {
        var scrollTop = window.scrollY || document.documentElement.scrollTop;
        var headerHeight = document.getElementById('header') ? document.getElementById('header').offsetHeight : 0;
        var offset = headerHeight + 10; // offset

        var current = null;
        for (var i = 0; i < sections.length; i++) {
            var section = sections[i];
            if (section.offsetTop <= scrollTop + offset) {
                current = '#' + section.getAttribute('id');
            } else {
                break;
            }
        }

        if (current) {
            activate(current);
        } else {
            // If scrolled to top, clear active
            if (scrollTop < offset) {
                document.querySelectorAll(tocSelector + ' .active').forEach(function(el) {
                    el.classList.remove('active');
                });
                document.querySelectorAll(tocSelector + ' ' + activeCurrentSelector).forEach(function(el) {
                    el.classList.remove(activeCurrentSelector.substring(1));
                });
            }
        }
    }

    // Throttle function
    function throttle(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      }
    }

    window.addEventListener('scroll', throttle(onScroll, 100));
  }

});

document.addEventListener('DOMContentLoaded', function () {
  var html = document.documentElement;
  var TAB_ANIMATE_DURATION = 200;

  var sidebarNavItems = document.querySelectorAll('.sidebar-nav li');
  sidebarNavItems.forEach(function(item) {
      item.addEventListener('click', function () {
        var activeTabClassName = 'sidebar-nav-active';
        var activePanelClassName = 'sidebar-panel-active';
        if (this.classList.contains(activeTabClassName)) {
          return;
        }

        var targetName = this.getAttribute('data-target');
        var currentTarget = document.querySelector('.' + activePanelClassName);
        var target = document.querySelector('.' + targetName);

        // Remove active class from all nav items
        sidebarNavItems.forEach(function(i) {
            i.classList.remove(activeTabClassName);
        });
        this.classList.add(activeTabClassName);

        // Velocity animations
        if (currentTarget && target) {
            Velocity(currentTarget, 'slideOutUp', {
                duration: TAB_ANIMATE_DURATION,
                complete: function () {
                    currentTarget.classList.remove(activePanelClassName);
                    currentTarget.style.display = 'none';

                    target.style.display = 'block';
                    Velocity(target, 'slideInDown', {
                        duration: TAB_ANIMATE_DURATION,
                        complete: function() {
                            target.classList.add(activePanelClassName);
                        }
                    });
                }
            });
        }
      });
  });

  // TOC item animation navigate & prevent #item selector in adress bar.
  document.querySelectorAll('.post-toc a').forEach(function(link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var href = this.getAttribute('href');
        var targetId = decodeURIComponent(href.replace('#', ''));
        var target = document.getElementById(targetId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            // Should also update URL hash without scrolling?
            // history.pushState(null, null, href);
        }
      });
  });

  // Expand sidebar on post detail page by default, when post has a toc.
  var tocContent = document.querySelector('.post-toc-content');
  var isSidebarCouldDisplay = CONFIG.sidebar.display === 'post' ||
    CONFIG.sidebar.display === 'always';
  var hasTOC = tocContent && tocContent.innerHTML.trim().length > 0;
  if (isSidebarCouldDisplay && hasTOC) {
    if (CONFIG.motion.enable) {
        NexT.motion.middleWares.sidebar = function (integrator) {
            NexT.utils.displaySidebar();
            integrator.next();
        };
    } else {
        NexT.utils.displaySidebar();
    }
  }
});
