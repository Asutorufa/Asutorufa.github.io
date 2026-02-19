/* global NexT: true */

document.addEventListener('DOMContentLoaded', function () {
  const elements = document.querySelectorAll('.exturl');
  elements.forEach(element => {
    element.addEventListener('click', function (event) {
      var exturl = this.getAttribute('data-url');
      var decurl = atob(exturl);
      window.open(decurl, '_blank');
      event.preventDefault();
      return false;
    });
  });
});
