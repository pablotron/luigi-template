(function() {
  'use strict';
  var assert = chai.assert;

  it('unknown key error', function() {
    assert.throws(function() {
      var r = LuigiTemplate.run('foo%{unknown-key}', {
        bar: 'foo',
      });
    }, Error, /^unknown key/);
  });

  it('unknown filter error', function() {
    assert.throws(function() {
      var r = LuigiTemplate.run('foo%{bar | unknown-filter}', {
        bar: 'foo',
      });
    }, Error, /^unknown filter/);
  });

  it('unknown template error', function() {
    assert.throws(function() {
      var cache = new LuigiTemplate.Cache({
        foo: [
          'foo%{bar}',
        ],
      });

      var r = cache.run('unknown-template', {
        bar: 'foo',
      });
    }, Error, /^unknown template/);
  });
})();
