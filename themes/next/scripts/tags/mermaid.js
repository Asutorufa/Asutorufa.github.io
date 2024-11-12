/**
 * mermaid.js | https://theme-next.js.org/docs/tag-plugins/mermaid
 */

'use strict';

const { escapeHTML } = require('hexo-util');

function mermaid(args, content) {
  // Support mermaid inside backtick code block
  // Keep the same HTML structure
  // Fix issue #347 #797
  return `<pre>
<code class="mermaid">
${args.join(' ')}
${escapeHTML(content)}
</code>
</pre>`;
};

hexo.extend.tag.register('mermaid', mermaid, {ends: true});