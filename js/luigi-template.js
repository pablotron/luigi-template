/**
 * Luigi Template: Simple JavaScript string templating library inspired by
 * Unix pipes.
 *
 * @author Paul Duncan <pabs@pablotron.org>
 * @license MIT
 * @copyright 2010-2018 Paul Duncan (pabs@pablotron.org)
 * @version 0.5.0
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
   *
   * @global
   */
  var Luigi = {
    /**
     * Version of Luigi Template.
     *
     * @constant
     * @memberof Luigi
     * @default
     */
    VERSION: '0.5.0',

    /**
     * Default filter set.
     *
     * @constant
     * @memberof Luigi
     * @default
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
   * @constructor
   * @memberof Luigi
   *
   * @param s {string} Template string (required).
   * @param filters {hash} Filters (optional).
   */
  Luigi.Template = function(template, filters) {
    this.s = template;
    this.filters = filters || Luigi.FILTERS;
    this.actions = parse_template(template);
  };

  function run_action(action, args, fn, me) {
    if (action.is_text === true) {
      return action.text;
    } else {
      if (!(action.key in args)) {
        throw new Error('unknown key: ' + action.key);
      }

      return reduce(action.filters, function(r, f) {
        if (!(f.name in me.filters)) {
          throw new Error('unknown filter: ' + f.name);
        }

        return me.filters[f.name](r, f.args, args, me);
      }, args[action.key]);
    }
  }

  /**
   * Run template with given parameters.
   *
   * @function run
   * @memberof Template
   *
   * @param args {hash} Template parameters (required).
   * @param fn {function} Callback function (optional).
   *
   * @returns {string} Result of applying arguments to template.
   */
  Luigi.Template.prototype.run = function(args, fn) {
    var i, l, f, fs, me = this;

    // debug
    // print(JSON.stringify(this.actions));

    if (fn) {
      each(this.actions, function(action) {
        fn(run_action(action, args, fn, me));
      });

      return null;
    } else {
      return map(this.actions, function(action) {
        return run_action(action, args, fn, me);
      }).join('');
    }
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
   * @constructor
   * @memberof Luigi
   *
   * @param templates {hash} name to template map (required).
   * @param filters {hash} custom filter map (optional).
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
   * @function Cache#run
   *
   * @param key {hash} Template key (required).
   * @param args {hash} Template run arguments (required).
   * @param fn {function} Callback function (optional).
   *
   * @returns {string} Result of applying arguments to template.
   */
  Luigi.Cache.prototype.run = function(key, args, fn) {
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
    return this.cache[key].run(args, fn);
  };

  /**
   * Create a new template cache with the given templates and
   * (optionally) filters.
   *
   * @function cache
   * @memberof Luigi
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
   * @function run
   * @memberof Luigi
   *
   * @param template {string} Template parameters (required).
   * @param args {hash} Template parameters (required).
   * @param filters {hash} Custom filters (optional).
   * @param fn {function} Callback function (optional).
   *
   * @returns {string} Result of applying arguments to template.
   */
  Luigi.run = function(template, args, filters, fn) {
    return new Luigi.Template(template, filters).run(args, fn);
  };

  // expose interface
  return Luigi;
}());
