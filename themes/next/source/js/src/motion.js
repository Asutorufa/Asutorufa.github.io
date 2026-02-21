/* global NexT: true */
/* global Velocity: true */

window.addEventListener('DOMContentLoaded', function () {
  NexT.motion = {};

  // Check if Velocity is loaded
  if (typeof Velocity === 'undefined') {
      console.error('Velocity is not defined. Animations disabled.');
      return;
  }

  var sidebarToggleLines = {
    lines: [],
    push: function (line) {
      this.lines.push(line);
    },
    init: function () {
      this.lines.forEach(function (line) {
        line.init();
      });
    },
    arrow: function () {
      this.lines.forEach(function (line) {
        line.arrow();
      });
    },
    close: function () {
      this.lines.forEach(function (line) {
        line.close();
      });
    }
  };

  function SidebarToggleLine(settings) {
    this.el = document.querySelector(settings.el);
    this.status = Object.assign({}, {
      init: {
        width: '100%',
        opacity: 1,
        left: 0,
        rotateZ: 0,
        top: 0
      }
    }, settings.status);
  }

  SidebarToggleLine.prototype.init = function () {
    this.transform('init');
  };
  SidebarToggleLine.prototype.arrow = function () {
    this.transform('arrow');
  };
  SidebarToggleLine.prototype.close = function () {
    this.transform('close');
  };
  SidebarToggleLine.prototype.transform = function (status) {
    if (this.el) {
        Velocity(this.el, 'stop');
        Velocity(this.el, this.status[status]);
    }
  };

  var sidebarToggleLine1st = new SidebarToggleLine({
    el: '.sidebar-toggle-line-first',
    status: {
      arrow: {width: '50%', rotateZ: '-45deg', top: '2px'},
      close: {width: '100%', rotateZ: '-45deg', top: '5px'}
    }
  });
  var sidebarToggleLine2nd = new SidebarToggleLine({
    el: '.sidebar-toggle-line-middle',
    status: {
      arrow: {width: '90%'},
      close: {opacity: 0}
    }
  });
  var sidebarToggleLine3rd = new SidebarToggleLine({
    el: '.sidebar-toggle-line-last',
    status: {
      arrow: {width: '50%', rotateZ: '45deg', top: '-2px'},
      close: {width: '100%', rotateZ: '45deg', top: '-5px'}
    }
  });

  sidebarToggleLines.push(sidebarToggleLine1st);
  sidebarToggleLines.push(sidebarToggleLine2nd);
  sidebarToggleLines.push(sidebarToggleLine3rd);

  var SIDEBAR_WIDTH = '320px';
  var SIDEBAR_DISPLAY_DURATION = 200;
  var xPos, yPos;

  var sidebarToggleMotion = {
    toggleEl: document.querySelector('.sidebar-toggle'),
    dimmerEl: document.querySelector('#sidebar-dimmer'),
    sidebarEl: document.querySelector('.sidebar'),
    isSidebarVisible: false,
    init: function () {
      if (this.toggleEl) {
        this.toggleEl.addEventListener('click', this.clickHandler.bind(this));
        this.toggleEl.addEventListener('mouseenter', this.mouseEnterHandler.bind(this));
        this.toggleEl.addEventListener('mouseleave', this.mouseLeaveHandler.bind(this));
      }
      if (this.dimmerEl) {
        this.dimmerEl.addEventListener('click', this.clickHandler.bind(this));
      }
      if (this.sidebarEl) {
        this.sidebarEl.addEventListener('touchstart', this.touchstartHandler.bind(this));
        this.sidebarEl.addEventListener('touchend', this.touchendHandler.bind(this));
        this.sidebarEl.addEventListener('touchmove', function(e){e.preventDefault();});
      }

      document.addEventListener('sidebar.isShowing', function () {
          if (NexT.utils.isDesktop()) {
            Velocity(document.body, 'stop');
            Velocity(document.body,
              {paddingRight: SIDEBAR_WIDTH},
              {duration: SIDEBAR_DISPLAY_DURATION}
            );
          }
        });
    },
    clickHandler: function () {
      this.isSidebarVisible ? this.hideSidebar() : this.showSidebar();
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    mouseEnterHandler: function () {
      if (this.isSidebarVisible) {
        return;
      }
      sidebarToggleLines.arrow();
    },
    mouseLeaveHandler: function () {
      if (this.isSidebarVisible) {
        return;
      }
      sidebarToggleLines.init();
    },
    touchstartHandler: function(e) {
      xPos = e.touches[0].clientX;
      yPos = e.touches[0].clientY;
    },
    touchendHandler: function(e) {
      var _xPos = e.changedTouches[0].clientX;
      var _yPos = e.changedTouches[0].clientY;
      if (_xPos-xPos > 30 && Math.abs(_yPos-yPos) < 20) {
          this.clickHandler();
      }
    },
    showSidebar: function () {
      var self = this;

      sidebarToggleLines.close();

      Velocity(this.sidebarEl, 'stop');
      Velocity(this.sidebarEl, {
          width: SIDEBAR_WIDTH
        }, {
          display: 'block',
          duration: SIDEBAR_DISPLAY_DURATION,
          begin: function () {
            const motionElements = document.querySelectorAll('.sidebar .motion-element');
            if (motionElements.length > 0) {
                Velocity(motionElements, 'slideInRight', {
                    stagger: 50,
                    drag: true,
                    complete: function () {
                      self.sidebarEl.dispatchEvent(new Event('sidebar.motion.complete'));
                    }
                });
            } else {
                 self.sidebarEl.dispatchEvent(new Event('sidebar.motion.complete'));
            }
          },
          complete: function () {
            self.sidebarEl.classList.add('sidebar-active');
            self.sidebarEl.dispatchEvent(new Event('sidebar.didShow'));
          }
        }
      );

      this.sidebarEl.dispatchEvent(new Event('sidebar.isShowing'));
    },
    hideSidebar: function () {
      if (NexT.utils.isDesktop()) {
        Velocity(document.body, 'stop');
        Velocity(document.body, {paddingRight: 0});
      }

      const motionElements = document.querySelectorAll('.sidebar .motion-element');
      Velocity(motionElements, 'stop');
      motionElements.forEach(el => el.style.display = 'none');

      Velocity(this.sidebarEl, 'stop');
      Velocity(this.sidebarEl, {width: 0}, {display: 'none'});

      sidebarToggleLines.init();

      this.sidebarEl.classList.remove('sidebar-active');
      this.sidebarEl.dispatchEvent(new Event('sidebar.isHiding'));

      // Prevent adding TOC to Overview if Overview was selected when close & open sidebar.
      if (document.querySelector('.post-toc-wrap')) {
        const siteOverviewWrap = document.querySelector('.site-overview-wrap');
        if (siteOverviewWrap && window.getComputedStyle(siteOverviewWrap).display === 'block') {
          document.querySelector('.post-toc-wrap').classList.remove('motion-element');
        } else {
          document.querySelector('.post-toc-wrap').classList.add('motion-element');
        }
      }
    }
  };
  sidebarToggleMotion.init();

  NexT.motion.integrator = {
    queue: [],
    cursor: -1,
    add: function (fn) {
      this.queue.push(fn);
      return this;
    },
    next: function () {
      this.cursor++;
      var fn = this.queue[this.cursor];
      if (typeof fn === 'function') fn(NexT.motion.integrator);
    },
    bootstrap: function () {
      this.next();
    }
  };

  // Velocity V2 Transition Mapping
  function getTransitionName(name) {
      const mapping = {
          'slideDownIn': 'slideInDown',
          'slideUpIn': 'slideInUp',
          'slideLeftIn': 'slideInLeft',
          'slideRightIn': 'slideInRight',
          'slideDownOut': 'slideOutDown',
          'slideUpOut': 'slideOutUp',
          'slideLeftOut': 'slideOutLeft',
          'slideRightOut': 'slideOutRight',
          'fadeIn': 'fadeIn',
          'fadeOut': 'fadeOut'
      };
      // Handle prefix "transition." if present
      const cleanName = name.replace('transition.', '');
      return mapping[cleanName] || cleanName;
  }

  function RunSequence(sequence) {
      let p = Promise.resolve();
      sequence.forEach(step => {
          p = p.then(() => {
              const el = step.e;
              const props = step.p;
              const opts = step.o;
              // Handle property mapping if needed
              let mappedProps = props;
              if (typeof props === 'string') {
                  mappedProps = getTransitionName(props);
              }

              return Velocity(el, mappedProps, opts);
          });
      });
      return p;
  }

  NexT.motion.middleWares =  {
    logo: function (integrator) {
      var sequence = [];
      var $brand = document.querySelector('.brand');
      var $title = document.querySelector('.site-title');
      var $subtitle = document.querySelector('.site-subtitle');
      var $logoLineTop = document.querySelector('.logo-line-before i');
      var $logoLineBottom = document.querySelector('.logo-line-after i');

      if ($brand && $brand.children.length > 0) { // Check logic: $brand.size() > 0? brand is an element.
        sequence.push({
            e: $brand,
            p: {opacity: 1},
            o: {duration: 200}
        });
      }

      if (NexT.utils.isMist() && $logoLineTop && $logoLineBottom) {
        sequence.push(
            getMistLineSettings($logoLineTop, '100%'),
            getMistLineSettings($logoLineBottom, '-100%')
        );
      }

      if ($title) {
        sequence.push({
            e: $title,
            p: {opacity: 1, top: 0},
            o: { duration: 200 }
        });
      }

      if ($subtitle) {
        sequence.push({
            e: $subtitle,
            p: {opacity: 1, top: 0},
            o: {duration: 200}
        });
      }

      if (CONFIG.motion.async) {
        integrator.next();
      }

      if (sequence.length > 0) {
        RunSequence(sequence).then(() => {
             integrator.next();
        });
      } else {
        integrator.next();
      }


      function getMistLineSettings (element, translateX) {
        return {
          e: element,
          p: {translateX: translateX},
          o: {
            duration: 500,
            sequenceQueue: false
          }
        };
      }
    },

    menu: function (integrator) {

      if (CONFIG.motion.async) {
        integrator.next();
      }

      const menuItems = document.querySelectorAll('.menu-item');
      if (menuItems.length > 0) {
          Velocity(menuItems, 'slideInDown', {
            display: null,
            duration: 200,
            complete: function () {
              integrator.next();
            }
          });
      } else {
          integrator.next();
      }
    },

    postList: function (integrator) {
      var $postBlock = document.querySelectorAll('.post-block, .pagination, .comments');
      var $postBlockTransition = getTransitionName(CONFIG.motion.transition.post_block);
      var $postHeader = document.querySelectorAll('.post-header');
      var $postHeaderTransition = getTransitionName(CONFIG.motion.transition.post_header);
      var $postBody = document.querySelectorAll('.post-body');
      var $postBodyTransition = getTransitionName(CONFIG.motion.transition.post_body);
      var $collHeader = document.querySelectorAll('.collection-title, .archive-year');
      var $collHeaderTransition = getTransitionName(CONFIG.motion.transition.coll_header);
      var $sidebarAffix = document.querySelector('.sidebar-inner');
      var $sidebarAffixTransition = getTransitionName(CONFIG.motion.transition.sidebar);
      var hasPost = $postBlock.length > 0;

      hasPost ? postMotion() : integrator.next();

      if (CONFIG.motion.async) {
        integrator.next();
      }

      function postMotion () {
        var postMotionOptions = window.postMotionOptions || {
            stagger: 100,
            drag: true
          };

        // Wrap complete to ensure integrator.next is called
        var originalComplete = postMotionOptions.complete;
        postMotionOptions.complete = function () {
          if (originalComplete) originalComplete();

          if (CONFIG.motion.transition.sidebar && (NexT.utils.isPisces() || NexT.utils.isGemini())) {
            if ($sidebarAffix) $sidebarAffix.style.transform = 'initial';
          }
          integrator.next();
        };

        if (CONFIG.motion.transition.post_block && $postBlock.length > 0) {
          Velocity($postBlock, $postBlockTransition, postMotionOptions);
        }
        if (CONFIG.motion.transition.post_header && $postHeader.length > 0) {
          Velocity($postHeader, $postHeaderTransition, postMotionOptions);
        }
        if (CONFIG.motion.transition.post_body && $postBody.length > 0) {
          Velocity($postBody, $postBodyTransition, postMotionOptions);
        }
        if (CONFIG.motion.transition.coll_header && $collHeader.length > 0) {
          Velocity($collHeader, $collHeaderTransition, postMotionOptions);
        }
        if (CONFIG.motion.transition.sidebar && (NexT.utils.isPisces() || NexT.utils.isGemini()) && $sidebarAffix) {
          Velocity($sidebarAffix, $sidebarAffixTransition, postMotionOptions);
        }
      }
    },

    sidebar: function (integrator) {
      if (CONFIG.sidebar.display === 'always') {
        NexT.utils.displaySidebar();
      }
      integrator.next();
    }
  };

});
