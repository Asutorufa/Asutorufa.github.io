/* global hexo */
// Usage: {% exturl text url "title" %}
// Alias: {% extlink text url "title" %}

'use strict';

/*jshint camelcase: false */
var util = require('hexo-util');
/*jshint camelcase: true */
var htmlTag = util.htmlTag;

var rUrl = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[.\!\/\\w]*))?)/;

function extURL(args, content) {
  var exturl = 'exturl';
  var url = '';
  var text = ['<i class="fa fa-external-link"></i>'];
  var title = '';
  var item = '';
  var i = 0;
  var len = args.length;

  // Find link URL and text
  for (; i < len; i++) {
    item = args[i];

    if (rUrl.test(item)) {
      url = btoa(item);
      break;
    } else {
      text.push(item);
    }
  }

  // Delete link URL and text from arguments
  args = args.slice(i + 1);

  // Check if the link should be open in a new window
  // and collect the last text as the link title
  if (args.length) {
    var shift = args[0];
    title = args.join(' ');
  }

  var attrs = {
    class: exturl,
    'data-url': url,
    title: title
  };

  //console.log(url);
  return htmlTag('span', attrs, text.join(' '));
}

hexo.extend.tag.register('exturl', extURL, {ends: false});
hexo.extend.tag.register('extlink', extURL, {ends: false});
