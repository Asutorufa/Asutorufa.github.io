/* global NexT: true */
/* global Velocity: true */

document.addEventListener('DOMContentLoaded', function () {

  document.dispatchEvent(new Event('bootstrap:before'));

  NexT.utils.lazyLoadPostsImages();

  NexT.utils.registerESCKeyEvent();

  NexT.utils.registerBackToTop();

  // Mobile top menu bar.
  const siteNavToggle = document.querySelector('.site-nav-toggle button');
  if (siteNavToggle) {
    siteNavToggle.addEventListener('click', function () {
      const siteNav = document.querySelector('.site-nav');
      if (!siteNav) return;

      const ON_CLASS_NAME = 'site-nav-on';
      const isSiteNavOn = siteNav.classList.contains(ON_CLASS_NAME);
      const animateAction = isSiteNavOn ? 'slideUp' : 'slideDown';
      const animateCallback = isSiteNavOn ? 'remove' : 'add';

      Velocity(siteNav, 'stop');
      Velocity(siteNav, animateAction, {
        duration: 200, // fast
        complete: function () {
          siteNav.classList[animateCallback](ON_CLASS_NAME);
        }
      });
    });
  }

  /**
   * Register JS handlers by condition option.
   * Need to add config option in Front-End at 'layout/_partials/head.swig' file.
   */
  if (CONFIG.fancybox) {
      NexT.utils.wrapImageWithFancyBox();
  }
  if (CONFIG.tabs) {
      NexT.utils.registerTabsTag();
  }

  NexT.utils.embeddedVideoTransformer();
  NexT.utils.addActiveClassToMenuItem();


  // Define Motion Sequence.
  NexT.motion.integrator
    .add(NexT.motion.middleWares.logo)
    .add(NexT.motion.middleWares.menu)
    .add(NexT.motion.middleWares.postList)
    .add(NexT.motion.middleWares.sidebar);

  document.dispatchEvent(new Event('motion:before'));

  // Bootstrap Motion.
  if (CONFIG.motion.enable) {
      NexT.motion.integrator.bootstrap();
  }

  document.dispatchEvent(new Event('bootstrap:after'));
});
