/**
 * luigi-template.js
 * =================
 *
 * Links
 * -----
 * * Contact: Paul Duncan (<pabs@pablotron.org>)
 * * Home Page: <http://pablotron.org/luigi-template/>
 * * Mercurial Repository: <http://hg.pablotron.org/luigi-template/>
 *
 * Overview
 * --------
 * Tiny client-side JavaScript templating library.
 *
 * Why?  This script is:
 *
 *   * less than 3k minified (see `luigi-template.min.js`),
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
 * Configuration Options
 * ---------------------
 * TODO
 *
 * TODO
 * ----
 * * Add support for LuigiTemplate.compile (and constructor compile)
 * * Add support for `<meta id='x-luigi-template-compile'/>`
 *
 * License
 * -------
 * Copyright (c) 2014 Paul Duncan <pabs@pablotron.org>
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *   * Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *
 *   * Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *
 *   * The names of contributors may not be used to endorse or promote
 *     products derived from this software without specific prior written
 *     permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
LuigiTemplate = (function() {
  "use strict";

  var VERSION = '0.3.0';

  // list of built-in filters
  var FILTERS = {
    hash: function(v, args) {
      return 'hash(' + v + ')';
    },

    uc: function(v) {
      return v.toUpperCase();
    },

    lc: function(v) {
      return v.toLowerCase();
    },

    pluralize: function(v) {
      return v + 's';
    },

    length: function(v) {
      return v.length;
    },

    trim: function(v) {
      return (v || '').replace(/^\s+|\s+$/mg, '');
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
    })()
  };

  var RES = {
    run:    /%\{\s*(\w+)((\s*\|\s*\w+\s*(\([\w\s,-]+\))?)*)\}/g,
    filter: /(\w+)\s*(\(([\w\s,-]+)\))?/,
    trim:   /^\s+|\s+$/
  };

  function init(s, o) {
    this.s = s;
    this.o = o;
    this.filters = (o && 'filters' in o) ? o.filters : {};
  };

  function safe_trim(s) {
    return ((s !== undefined) ? s : '').replace(RES.trim, '');
  }

  // given a filter string, return a list of filters
  function make_filter_list(s) {
    var i, l, a, md, r = [], fs = s.split(/\s*\|\s*/);

    if (s.length > 0 && fs.length > 0) {
      for (i = 1, l = fs.length; i < l; i++) {
        if (md = fs[i].match(RES.filter)) {
          r.push({
            k: md[1],
            a: safe_trim(md[3]).split(/\s*,\s*/)
          });
        } else {
          throw new Error("invalid filter string: " + fs[i]);
        }
      }
    }

    return r;
  }

  function get_filter(k, me) {
    var r = me.filters[k] || FILTERS[k];

    if (!r)
      throw new Error("unknown filter: " + k);

    return r;
  }

  function run(o) {
    var i, l, f, fs, me = this;

    // TODO: add compiled support here

    return this.s.replace(RES.run, function(m, k, filters) {
      var r = o[k];

      // build filter list
      fs = make_filter_list(filters);

      // iterate over and apply each filter
      for (i = 0, l = fs.length; i < l; i++) {
        // get/check filter
        f = get_filter(fs[i].k, me);

        // apply filter
        r = f(r, fs[i].a, o, this);
      }

      // return result
      return r;
    });
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
        throw new Error('unknown key: ' + key);
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
  T.run = function(s, o) {
    return new T(s).run(o);
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
