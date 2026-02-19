/* global NexT: true */

NexT.utils = NexT.$u = {
  throttle: function (func, delay) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func.apply(this, args);
      }
    };
  },

  /**
   * Wrap images with fancybox support.
   */
  wrapImageWithFancyBox: function () {
    const images = document.querySelectorAll('.content img:not([hidden]):not(.group-picture img):not(.post-gallery img)');

    images.forEach(function (image) {
      const imageTitle = image.getAttribute('title');
      const $imageWrapLink = image.parentElement;

      if ($imageWrapLink.tagName !== 'A') {
        const imageLink = image.getAttribute('data-original') || image.getAttribute('src');
        const link = document.createElement('a');
        link.href = imageLink;
        link.className = 'fancybox fancybox.image';
        link.setAttribute('rel', 'group');

        // Wrap image
        image.parentNode.insertBefore(link, image);
        link.appendChild(image);

        if (imageTitle) {
          const caption = document.createElement('p');
          caption.className = 'image-caption';
          caption.innerText = imageTitle;
          link.appendChild(caption);
          link.setAttribute('title', imageTitle);
        }
      }
    });
  },

  lazyLoadPostsImages: function () {
    const images = document.querySelectorAll('#posts img');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute('data-original');
            if (src) {
              img.src = src;
              img.removeAttribute('data-original');
            }
            img.style.opacity = 1;
            observer.unobserve(img);
          }
        });
      });

      images.forEach(img => {
        if (img.getAttribute('data-original')) {
          img.style.transition = 'opacity 0.5s';
          img.style.opacity = 0;
          observer.observe(img);
        }
      });
    } else {
      // Fallback
      images.forEach(img => {
        const src = img.getAttribute('data-original');
        if (src) img.src = src;
      });
    }
  },

  /**
   * Tabs tag listener (without twitter bootstrap).
   */
  registerTabsTag: function () {
    const tNav = '.tabs ul.nav-tabs ';

    // Binding `nav-tabs` & `tab-content` by real time permalink changing.
    function onHashChange() {
      const tHash = location.hash;
      if (tHash !== '') {
        const targetTab = document.querySelector(tNav + 'li a[href="' + tHash + '"]');
        if (targetTab) {
            const tabItem = targetTab.parentNode;
            if (tabItem) {
                // Remove active from siblings
                Array.from(tabItem.parentNode.children).forEach(child => child.classList.remove('active'));
                tabItem.classList.add('active');

                // Content
                const tabContent = document.querySelector(tHash);
                if (tabContent) {
                    Array.from(tabContent.parentNode.children).forEach(child => child.classList.remove('active'));
                    tabContent.classList.add('active');
                }
            }
        }
      }
    }

    window.addEventListener('hashchange', onHashChange);
    document.addEventListener('DOMContentLoaded', onHashChange);

    document.querySelectorAll(tNav + '.tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            if (!this.classList.contains('active')) {
                // Remove active from siblings
                Array.from(this.parentNode.children).forEach(child => child.classList.remove('active'));
                this.classList.add('active');

                const tActive = this.querySelector('a').getAttribute('href');
                const targetContent = document.querySelector(tActive);
                if (targetContent) {
                    Array.from(targetContent.parentNode.children).forEach(child => child.classList.remove('active'));
                    targetContent.classList.add('active');
                }

                if (location.hash !== '') {
                    history.pushState('', document.title, window.location.pathname + window.location.search);
                }
            }
        });
    });
  },

  registerESCKeyEvent: function () {
    document.addEventListener('keyup', function (event) {
      const searchPopup = document.querySelector('.search-popup');
      const shouldDismissSearchPopup = event.which === 27 &&
        searchPopup && window.getComputedStyle(searchPopup).display !== 'none';

      if (shouldDismissSearchPopup) {
        searchPopup.style.display = 'none';
        const overlay = document.querySelector('.search-popup-overlay');
        if (overlay) overlay.remove();
        document.body.style.overflow = '';
      }
    });
  },

  registerBackToTop: function () {
    const topBtn = document.querySelector('.back-to-top');
    const scrollSpan = document.querySelector('#scrollpercent > span');

    if (!topBtn) return;

    function onScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const contentHeight = NexT.utils.getContentVisibilityHeight();
      const percent = Math.min(100, Math.round((scrollTop / contentHeight) * 100));

      if (scrollTop > 50) {
        topBtn.classList.add('back-to-top-on');
      } else {
        topBtn.classList.remove('back-to-top-on');
      }

      if (scrollSpan) {
        scrollSpan.textContent = percent;
      }
    }

    window.addEventListener('scroll', NexT.utils.throttle(onScroll, 200));

    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  },

  /**
   * Transform embedded video to support responsive layout.
   * @see http://toddmotto.com/fluid-and-responsive-youtube-and-vimeo-videos-with-fluidvids-js/
   */
  embeddedVideoTransformer: function () {
    const iframes = document.querySelectorAll('iframe');

    // Supported Players. Extend this if you need more players.
    const SUPPORTED_PLAYERS = [
      'www.youtube.com',
      'player.vimeo.com',
      'player.youku.com',
      'music.163.com',
      'www.tudou.com'
    ];
    const pattern = new RegExp(SUPPORTED_PLAYERS.join('|'));

    iframes.forEach(function (iframe) {
      const oldDimension = getDimension(iframe);

      if (iframe.src.search(pattern) > 0) {
        const videoRatio = getAspectRadio(oldDimension.width, oldDimension.height);

        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';

        const wrap = document.createElement('div');
        wrap.className = 'fluid-vids';
        wrap.style.position = 'relative';
        wrap.style.marginBottom = '20px';
        wrap.style.width = '100%';
        wrap.style.paddingTop = videoRatio + '%';

        if (wrap.style.paddingTop === '') wrap.style.paddingTop = '50%';

        const iframeParent = iframe.parentNode;
        iframeParent.insertBefore(wrap, iframe);
        wrap.appendChild(iframe);

        if (iframe.src.search('music.163.com') > 0) {
          const newDimension = getDimension(iframe);
          const shouldRecalculateAspect = newDimension.width > oldDimension.width ||
            newDimension.height < oldDimension.height;

          if (shouldRecalculateAspect) {
            wrap.style.paddingTop = getAspectRadio(newDimension.width, oldDimension.height) + '%';
          }
        }
      }
    });

    function getDimension(element) {
      return {
        width: element.offsetWidth,
        height: element.offsetHeight
      };
    }

    function getAspectRadio(width, height) {
      return height / width * 100;
    }
  },

  /**
   * Add `menu-item-active` class name to menu item
   * via comparing location.path with menu item's href.
   */
  addActiveClassToMenuItem: function () {
    let path = window.location.pathname;
    path = path === '/' ? path : path.substring(0, path.length - 1);

    // Select the first link that starts with path
    const links = document.querySelectorAll('.menu-item a');
    let targetLink = null;
    for (let i = 0; i < links.length; i++) {
        const href = links[i].getAttribute('href');
        if (href && href.startsWith(path)) {
            targetLink = links[i];
            break;
        }
    }

    if (targetLink) {
        targetLink.parentNode.classList.add('menu-item-active');
    }
  },

  hasMobileUA: function () {
    var nav = window.navigator;
    var ua = nav.userAgent;
    var pa = /iPad|iPhone|Android|Opera Mini|BlackBerry|webOS|UCWEB|Blazer|PSP|IEMobile|Symbian/g;

    return pa.test(ua);
  },

  isTablet: function () {
    return window.screen.width < 992 && window.screen.width > 767 && this.hasMobileUA();
  },

  isMobile: function () {
    return window.screen.width < 767 && this.hasMobileUA();
  },

  isDesktop: function () {
    return !this.isTablet() && !this.isMobile();
  },

  /**
   * Escape meta symbols in jQuery selectors.
   *
   * @param selector
   * @returns {string|void|XML|*}
   */
  escapeSelector: function (selector) {
    return selector.replace(/[!"$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&');
  },

  displaySidebar: function () {
    if (!this.isDesktop() || this.isPisces() || this.isGemini()) {
      return;
    }
    const toggle = document.querySelector('.sidebar-toggle');
    if (toggle) toggle.click();
  },

  isMist: function () {
    return CONFIG.scheme === 'Mist';
  },

  isPisces: function () {
    return CONFIG.scheme === 'Pisces';
  },

  isGemini: function () {
    return CONFIG.scheme === 'Gemini';
  },

  getScrollbarWidth: function () {
    const div = document.createElement('div');
    div.className = 'scrollbar-measure';
    document.body.appendChild(div);
    const scrollbarWidth = div.offsetWidth - div.clientWidth;
    document.body.removeChild(div);
    return scrollbarWidth;
  },

  getContentVisibilityHeight: function () {
    const content = document.getElementById('content');
    const docHeight = content ? content.offsetHeight : 0;
    const winHeight = window.innerHeight;
    const contentVisibilityHeight = (docHeight > winHeight) ? (docHeight - winHeight) : (document.body.scrollHeight - winHeight);
    return contentVisibilityHeight;
  },

  getSidebarb2tHeight: function () {
    const b2t = document.querySelector('.back-to-top');
    return (CONFIG.sidebar.b2t && b2t) ? b2t.offsetHeight : 0;
  },

  getSidebarSchemePadding: function () {
    const sidebarNav = document.querySelector('.sidebar-nav');
    const sidebarNavHeight = (sidebarNav && window.getComputedStyle(sidebarNav).display === 'block') ? sidebarNav.offsetHeight : 0;

    const sidebarInner = document.querySelector('.sidebar-inner');
    let sidebarPaddingValue = 0;
    if (sidebarInner) {
        const style = window.getComputedStyle(sidebarInner);
        sidebarPaddingValue = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    }

    const sidebarSchemePadding = (this.isPisces() || this.isGemini()) ?
        ((sidebarPaddingValue * 2) + sidebarNavHeight + (CONFIG.sidebar.offset * 2) + this.getSidebarb2tHeight()) :
        ((sidebarPaddingValue * 2) + (sidebarNavHeight / 2));
    return sidebarSchemePadding;
  }
};

document.addEventListener('DOMContentLoaded', function () {

  initSidebarDimension();

  /**
   * Init Sidebar & TOC inner dimensions on all pages and for all schemes.
   * Need for Sidebar/TOC inner scrolling if content taller then viewport.
   */
  function initSidebarDimension() {
    let updateSidebarHeightTimer;

    window.addEventListener('resize', function () {
      if (updateSidebarHeightTimer) clearTimeout(updateSidebarHeightTimer);

      updateSidebarHeightTimer = setTimeout(function () {
        const sidebarWrapperHeight = document.body.clientHeight - NexT.utils.getSidebarSchemePadding();

        updateSidebarHeight(sidebarWrapperHeight);
      }, 0);
    });

    // Initialize Sidebar & TOC Width.
    const scrollbarWidth = NexT.utils.getScrollbarWidth();
    const sidebarPanel = document.querySelector('.sidebar-panel');
    if (sidebarPanel && sidebarPanel.offsetHeight > (document.body.clientHeight - NexT.utils.getSidebarSchemePadding())) {
        const siteOverview = document.querySelector('.site-overview');
        if (siteOverview) siteOverview.style.width = 'calc(100% + ' + scrollbarWidth + 'px)';
    }
    const postToc = document.querySelector('.post-toc');
    if (postToc) postToc.style.width = 'calc(100% + ' + scrollbarWidth + 'px)';

    // Initialize Sidebar & TOC Height.
    updateSidebarHeight(document.body.clientHeight - NexT.utils.getSidebarSchemePadding());
  }

  function updateSidebarHeight(height) {
    height = height || 'auto';
    const siteOverview = document.querySelector('.site-overview');
    const postToc = document.querySelector('.post-toc');
    if (siteOverview) siteOverview.style.maxHeight = height + 'px';
    if (postToc) postToc.style.maxHeight = height + 'px';
  }

});
