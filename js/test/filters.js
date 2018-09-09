(function() {
  'use strict';
  var assert = chai.assert;

  it('filter', function() {
    var t = new LuigiTemplate('foo%{bar|h}'),
        r = t.run({ bar: '<' });

    assert.equal(r, 'foo&lt;');
  });

  it('filter chain', function() {
    var r = LuigiTemplate.run('foo%{bar|uc|lc}', {
      bar: 'foo'
    });

    assert.equal(r, 'foofoo');
  });

  it('custom global filter', function() {
    LuigiTemplate.FILTERS.barify = function(s) {
      return 'bar-' + s + '-bar';
    };

    var r = LuigiTemplate.run('foo%{bar | barify}', {
      bar: 'foo'
    });

    assert.equal(r, 'foobar-foo-bar');
  });

  it('custom template filter', function() {
    var r = LuigiTemplate.run('foo%{bar | barify}', {
      bar: 'foo'
    }, {
      barify: function(s) {
        return 'bar-' + s + '-bar';
      },
    });

    assert.equal(r, 'foobar-foo-bar');
  });

  it('filter args', function() {
    var r = LuigiTemplate.run('foo%{bar | wrap bar}', {
      bar: 'foo'
    }, {
      wrap: function(s, args) {
        if (args.length == 1) {
          return [args[0], s, args[0]].join('-');
        } else {
          return s;
        }
      },
    });

    assert.equal(r, 'foobar-foo-bar');
  });
})();
