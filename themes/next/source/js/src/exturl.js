/* global NexT: true */

$(document).ready(function () {
  $('.exturl').on('click', function () {
    var $exturl = $(this).attr('data-url');
    var $decurl = atob($exturl);
    window.open($decurl, '_blank');
    return false;
  });
});
