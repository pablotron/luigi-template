/**
 * luigi-template.js
 * =================
 *
 * Links
 * -----
 * * Contact: Paul Duncan (<pabs@pablotron.org>)
 * * Home Page: <https://github.com/pablotron/luigi-template>
 *
 * Overview
 * --------
 * Tiny client-side JavaScript templating library.
 *
 * Why?  This script is:
 *
 *   * less than 4k minified (see `luigi-template.min.js`),
 *
 *   * has no external dependencies (no jQuery/YUI/Sensha),
 *
 *   * works in browsers as old as IE8, and
 *
 *   * MIT licensed (use for whatever, I don't care)
 *
 * Usage
 * -----
 * TODO
 *
 * License
 * -------
 * Copyright 2014-2018 Paul Duncan ([pabs@pablotron.org][me])
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
LuigiTemplate = (function() {
  "use strict";

  var VERSION = '0.4.2';

  // Array.each polyfill
  var each = (function() {
    if (Array.prototype.forEach) {
      return function(a, fn) {
        a.forEach(fn);
      };
    } else {
      return function(a, fn) {
        var i, l;

        for (i = 0, l = a.length; i < l; i++)
          fn(a[i], i, a);
      };
    }
  })();

  // Array.map polyfill
  var map = (function() {
    if (Array.prototype.map) {
      return function(a, fn) {
        return a.map(fn);
      };
    } else {
      return function(a, fn) {
        var r = new Array(a.length);

        each(a, function(v, i) {
          r[i] = v;
        });

        return r;
      };
    }
  })();

  // Array.reduce polyfill
  var reduce = (function() {
    if (Array.prototype.reduce) {
      return function(a, fn, iv) {
        return a.reduce(fn, iv);
      };
    } else {
      return function(a, fn, r) {
        each(a, function(v, i) {
          r = fn(r, v, i, a);
        });

        return r;
      };
    }
  })();

  // String.trim polyfill
  var trim = (function() {
    if (String.prototype.trim) {
      return function(s) {
        return (s || '').trim();
      };
    } else {
      var re = /^\s+|\s+$/g;

      return function(s) {
        (s || '').replace(re, '');
      };
    }
  })();

  // String.scan polyfill
  function scan(s, re, fn) {
    var m;

    if (!re.global)
      throw 'non-global regex';

    while ((m = re.exec(s)) !== null)
      fn(m);
  }

  // list of built-in filters
  var FILTERS = {
    uc: function(v) {
      return (v || '').toUpperCase();
    },

    lc: function(v) {
      return (v || '').toLowerCase();
    },

    s: function(v) {
      return (v == 1) ? '' : 's';
    },

    length: function(v) {
      return (v || '').length;
    },

    trim: function(v) {
      return trim(v);
    },

    h: (function() {
      var LUT = {
        '"': '&quot;',
        "'": '&apos;',
        '>': '&gt;',
        '<': '&lt;',
        '&': '&amp;'
      };

      return function(v) {
        if (v === undefined || v === null)
          return '';

        return v.toString().replace(/(['"<>&])/g, function(s) {
          return LUT[s];
        });
      };
    })(),

    u: function(s) {
      return encodeURIComponent(s || '').replace('%20', '+').replace(/[!'()*]/g, function(c) {
        return '%' + c.charCodeAt(0).toString(16);
      });
    },

    json: function(v) {
      return JSON.stringify(v);
    },
  };

  var RES = {
    actions: /%\{\s*([^\s\|\}]+)\s*((\s*\|(\s*[^\s\|\}]+)+)*)\s*\}|([^%]+|%)/g,
    filter:   /(\S+)((\s*\S+)*)\s*/,
    delim_filters: /\s*\|\s*/,
    delim_args:    /\s+/
  };

  function parse_template(s) {
    var r = [];

    scan(s, RES.actions, function(m) {
      if (m[1]) {
        // action
        r.push({
          type: 'action',
          key: m[1],
          filters: parse_filters(m[2])
        });
      } else {
        // text
        r.push({
          type: 'text',
          text: m[5]
        });
      }
    });

    return r;
  }

  function parse_filters(filters) {
    var r = [];

    each(filters.split(RES.delim_filters), function(f) {
      f = trim(f);
      if (!f)
        return;

      var m = f.match(RES.filter);
      if (!m)
        throw new Error('invalid filter: ' + f);

      var as = trim(m[2]);

      r.push({
        name: m[1],
        args: as.length ? as.split(RES.delim_args) : []
      });
    });

    return r;
  }

  function init(s, filters) {
    this.s = s;
    this.filters = filters || FILTERS;
    this.actions = parse_template(s);
  };

  function run(o) {
    var i, l, f, fs, me = this;

    // debug
    // print(JSON.stringify(this.actions));

    return map(this.actions, function(row) {
      if (row.type == 'text') {
        return row.text;
      } else if (row.type == 'action') {
        if (!(row.key in o)) {
          throw new Error('unknown key: ' + row.key);
        }

        return reduce(row.filters, function(r, f) {
          if (!(f.name in me.filters)) {
            throw new Error('unknown filter: ' + f.name);
          }

          return me.filters[f.name](r, f.args, o, me);
        }, o[row.key]);
      } else {
        /* never reached */
        throw new Error('BUG: invalid type: ' + row.type);
      }
    }).join('');
  }

  function get_inline_template(key) {
    // get script element
    var e = document.getElementById(key);
    if (!e)
      throw new Error('unknown inline template key: ' + key);

    // return result
    return e.innerText || '';
  }

  // declare constructor
  var T = init;

  // declare run method
  T.prototype.run = run;

  // declare cache constructor
  T.Cache = function(templates, try_dom) {
    this.templates = templates;
    this.try_dom = !!try_dom;
    this.cache = {};
  };

  // cache run method
  T.Cache.prototype.run = function(key, args) {
    if (!(key in this.cache)) {
      var s = null;

      if (key in this.templates) {
        // get template from constructor templates
        s = this.templates[key].join('');
      } else if (this.try_dom) {
        // get source from inline script tag
        s = get_inline_template(key);
      } else {
        throw new Error('unknown template: ' + key);
      }

      // cache template
      this.cache[key] = new T(s);
    }

    // run template
    return this.cache[key].run(args);
  };

  // declare domcache constructor
  T.DOMCache = function() {
    this.cache = {};
  };

  // domcache run method
  T.DOMCache.prototype.run = function(key, args) {
    if (!(key in this.cache))
      this.cache[key] = new T(get_inline_template(key));

    // run template
    return this.cache[key].run(args);
  };

  // create DOMCache singleton
  T.dom = new T.DOMCache();

  // expose filters and version
  T.FILTERS = FILTERS;
  T.VERSION = VERSION;

  // add singleton run
  T.run = function(s, o, f) {
    return new T(s, f).run(o);
  }

  // expose interface
  return T;
}());

/*
You automagically generate the following files:

  * luigi-template.min.js (minified luigi-template.js),
  * readme.txt (Markdown-formatted documentation), and
  * readme.html (HTML-formatted documentation)

by using this command:

  grep ^build: luigi-template.js | sed 's/^build://' | ruby

(Requires jsmin, ruby, and markdown).

build: # generate readme.txt
build: File.write('readme.txt', File.read('luigi-template.js').match(%r{
build:   # match first opening comment
build:   ^/\*\*(.*?)\* /
build:
build:   # match text
build:   (.*?)
build:
build:   # match first closing comment
build:   # (note: don't change " /" to "/" or else)
build:   \* /
build: }mx)[1].split(/\n/).map { |line|
build:   # strip leading asterisks
build:   line.gsub(/^ \* ?/, '')
build: }.join("\n").strip)
build:
build: # generate readme.html
build: `markdown < readme.txt > readme.html`
build:
build: # make luigi-template.min.js
build: `jsmin < luigi-template.js > luigi-template.min.js`
*/
