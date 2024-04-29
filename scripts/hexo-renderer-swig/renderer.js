'use strict';

const swig = require('free-swig');
const forTag = require('free-swig/lib/tags/for');

const trim = function (input) {
  if (typeof input === 'object') {
    each(input, function (value, key) {
      input[key] = module.exports(value);
    });
    return input;
  }

  if (typeof input === 'string') {
    return input.replace(/^\s*|\s*$/g, '');
  }

  return input;
};

let each = function (obj, fn) {
  var i, l;

  if (isArray(obj)) {
    i = 0;
    l = obj.length;
    for (i; i < l; i += 1) {
      if (fn(obj[i], i, obj) === false) {
        break;
      }
    }
  } else {
    for (i in obj) {
      if (obj.hasOwnProperty(i)) {
        if (fn(obj[i], i, obj) === false) {
          break;
        }
      }
    }
  }

  return obj;
};

swig.setFilter("trim", trim);

swig.setDefaults({
  cache: false,
  autoescape: false
});

// Hack: Override for tag of Swig
swig.setTag('for', forTag.parse, (...args) => {
  const compile = forTag.compile(...args).split('\n');

  compile.splice(3, 0, '  if (!Array.isArray(__l) && typeof __l.toArray === "function") { __l = __l.toArray(); }');

  return compile.join('\n');
}, forTag.ends, true);

function swigRenderer({ text, path }, locals) {
  return swig.render(text, {
    locals,
    filename: path
  });
}

swigRenderer.compile = ({ text, path }) => swig.compile(text, { filename: path });

module.exports = swigRenderer;

