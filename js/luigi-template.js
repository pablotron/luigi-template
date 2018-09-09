/**
 * Luigi Template: Simple JavaScript string templating library inspired by
 * Unix pipes.
 *
 * @author Paul Duncan <pabs@pablotron.org>
 * @license MIT
 * @copyright 2010-2018 Paul Duncan (pabs@pablotron.org)
 * @version 0.4.2
 *
 */

/**
 * Luigi Template namespace.
 */
var Luigi = (function() {
  "use strict";

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
          is_text: false,
          key: m[1],
          filters: parse_filters(m[2])
        });
      } else {
        // text
        r.push({
          is_text: true,
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

  /**
   * Luigi Template namespace.
   */
  var Luigi = {
    /**
     * Version of Luigi Template.
     */
    VERSION: '0.4.2',

    /**
     * Default filter set.
     *
     * The default filters are:
     * * `uc`: Upper-case string value.
     * * `lc`: Lower-case string value.
     * * `s`: Pluralize a value by returning `""` if the value is 1, and `"s"` otherwise.
     * * `length`: Get the length of an array.
     * * `trim`: Trim leading and trailing whitespace from a string.
     * * `h`: HTML-escape a string value.
     * * `u`: URL-escape a string value.
     * * `json`: JSON-encode a value.
     */
    FILTERS: {
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
    },
  };

  /**
   * Create a new Template instance.
   *
   * @param s {string} Template string (required).
   * @param filters {hash} Filters (optional).
   *
   * @constructor
   */
  Luigi.Template = function(template, filters) {
    this.s = template;
    this.filters = filters || Luigi.FILTERS;
    this.actions = parse_template(template);
  };

  /**
   * Run template with given parameters.
   *
   * @param args {hash} Template parameters (required).
   *
   * @returns {string} Result of applying arguments to template.
   */
  Luigi.Template.prototype.run = function(args) {
    var i, l, f, fs, me = this;

    // debug
    // print(JSON.stringify(this.actions));

    return map(this.actions, function(row) {
      if (row.is_text === true) {
        return row.text;
      } else {
        if (!(row.key in args)) {
          throw new Error('unknown key: ' + row.key);
        }

        return reduce(row.filters, function(r, f) {
          if (!(f.name in me.filters)) {
            throw new Error('unknown filter: ' + f.name);
          }

          return me.filters[f.name](r, f.args, args, me);
        }, args[row.key]);
      }
    }).join('');
  };

  function get_inline_template(key) {
    // get script element
    var e = document.getElementById(key);
    if (!e)
      throw new Error('unknown inline template key: ' + key);

    // return result
    return e.innerText || '';
  }

  /**
   * Create a new template cache.
   *
   * @param templates {hash} name to template map (required).
   * @param filters {hash} custom filter map (optional).
   *
   * @constructor
   */
  Luigi.Cache = function(templates, filters, try_dom) {
    this.templates = templates;
    this.filters = filters || Luigi.FILTERS;
    this.try_dom = !!try_dom;
    this.cache = {};
  };

  /**
   * Find named template in cache and run it with the given arguments.
   *
   * @param key {hash} Template key (required).
   * @param args {hash} Template run arguments (required).
   *
   * @returns {string} Result of applying arguments to template.
   */
  Luigi.Cache.prototype.run = function(key, args) {
    if (!(key in this.cache)) {
      var s = null;

      if (key in this.templates) {
        s = this.templates[key];
        s = (s.constructor === Array) ? s.join('') : s;
      } else if (this.try_dom) {
        // get source from inline script tag
        s = get_inline_template(key);
      } else {
        throw new Error('unknown template: ' + key);
      }

      // cache template
      this.cache[key] = new Luigi.Template(s, this.filters);
    }

    // run template
    return this.cache[key].run(args);
  };

  /**
   * Create a new template cache with the given templates and
   * (optionally) filters.
   *
   * @param templates {hash} name to template map (required).
   * @param filters {hash} custom filter map (optional).
   *
   * @returns {Cache} Template cache.
   */
  Luigi.cache = function(templates, filters) {
    return new Luigi.Cache(templates, filters || Luigi.FILTERS);
  }

  // declare domcache constructor
  Luigi.DOMCache = function() {
    this.cache = {};
  };

  // domcache run method
  Luigi.DOMCache.prototype.run = function(key, args) {
    if (!(key in this.cache))
      this.cache[key] = new Luigi.Template(get_inline_template(key));

    // run template
    return this.cache[key].run(args);
  };

  // create DOMCache singleton
  Luigi.dom = new Luigi.DOMCache();

  /**
   * Create and run template with given template string, parameters, and
   * (optionally) filters.
   *
   * @param template {string} Template parameters (required).
   * @param args {hash} Template parameters (required).
   * @param filters {hash} Custom filters (optional).
   *
   * @returns {string} Result of applying arguments to template.
   */
  Luigi.run = function(template, args, filters) {
    return new Luigi.Template(template, filters).run(args);
  };

  // expose interface
  return Luigi;
}());
