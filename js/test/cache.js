(function() {
  'use strict';
  var assert = chai.assert;

  it('cache', function() {
    var cache = new LuigiTemplate.Cache({
      foo: ['foo%{bar}'],
    });

    var r = cache.run('foo', {
      bar: 'foo',
    });

    assert.equal(r, 'foofoo');
  });

  it('cache with custom filters', function() {
    var cache = new LuigiTemplate.Cache({
      foo: ['foo%{bar | barify}'],
    }, {
      barify: function(s) {
        return 'bar-' + s + '-bar';
      },
    });

    var r = cache.run('foo', {
      bar: 'foo',
    });

    assert.equal(r, 'foobar-foo-bar');
  });
})();
