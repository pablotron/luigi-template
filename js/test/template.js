(function() {
  'use strict';
  var assert = chai.assert;

  it('run', function() {
    var t = new LuigiTemplate('foo%{bar}'),
        r = t.run({ bar: 'foo' });

    assert.equal(r, 'foofoo');
  });

  it('run singleton', function() {
    var r = LuigiTemplate.run('foo%{bar}', { bar: 'foo' });

    assert.equal(r, 'foofoo');
  });

  it('run with multiple keys', function() {
    var r = LuigiTemplate.run('foo%{bar}%{baz}', {
      bar: 'foo',
      baz: 'foo',
    });

    assert.equal(r, 'foofoofoo');
  });

  it('run with whitespace around key', function() {
    var s = "%{ \t\v\r\nbar}%{ \t\v\r\nbar \t\v\r\n}%{bar \t\v\r\n}",
        r = LuigiTemplate.run(s, { bar: 'foo' });

    assert.equal(r, 'foofoofoo');
  });
})();
