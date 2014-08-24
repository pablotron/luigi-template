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

        return (v || '').replace(/(['"<>&])/g, function(s) {
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
