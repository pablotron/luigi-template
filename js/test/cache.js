(function() {
  'use strict';
  var assert = chai.assert;

  it('cache', function() {
    var cache = new Luigi.Cache({
      foo: 'foo%{bar}',
    });

    var r = cache.run('foo', {
      bar: 'foo',
    });

    assert.equal(r, 'foofoo');
  });

  it('cache with array', function() {
    var cache = new Luigi.Cache({
      foo: ['foo%{bar}'],
    });

    var r = cache.run('foo', {
      bar: 'foo',
    });

    assert.equal(r, 'foofoo');
  });

  it('cache singleton', function() {
    var cache = Luigi.cache({
      foo: 'foo%{bar}',
    });

    var r = cache.run('foo', {
      bar: 'foo',
    });

    assert.equal(r, 'foofoo');
  });

  it('cache run with callback', function() {
    var r = [];

    Luigi.cache({
      foo: 'foo%{bar}',
    }).run('foo', {
      bar: 'foo',
    }, function(s) {
      r.push(s);
    });

    assert.equal(r.join(''), 'foofoo');
  });

  it('cache with custom filters', function() {
    var cache = Luigi.cache({
      foo: ['foo%{bar | cache-barify}'],
    }, {
      'cache-barify': function(s) {
        return 'bar-' + s + '-bar';
      },
    });

    // run template from cache, get result
    var r = cache.run('foo', {
      bar: 'foo',
    });

    assert.equal(r, 'foobar-foo-bar');
  });
})();
