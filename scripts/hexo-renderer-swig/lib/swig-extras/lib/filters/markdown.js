var markdown = require('markdown-it')();

/**
 * Convert a variable's contents from Markdown to HTML.
 *
 * @example
 * {{ foo|markdown }}
 * // => <h1>Markdown</h1>
 *
 * @param  {string} input
 * @return {string}       HTML
 */
module.exports = function (input) {
  return markdown.render(input);
};

module.exports.safe = true;
