/* global hexo */

'use strict';

const renderer = require('./renderer');

hexo.extend.renderer.register('swig', 'html', renderer, true);
