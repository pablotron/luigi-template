(function() {
  'use strict';
  var assert = chai.assert;

  it('run', function() {
    var t = new Luigi.Template('foo%{bar}'),
        r = t.run({ bar: 'foo' });

    assert.equal(r, 'foofoo');
  });

  it('run singleton', function() {
    var r = Luigi.run('foo%{bar}', { bar: 'foo' });

    assert.equal(r, 'foofoo');
  });

  it('run with multiple keys', function() {
    var r = Luigi.run('foo%{bar}%{baz}', {
      bar: 'foo',
      baz: 'foo',
    });

    assert.equal(r, 'foofoofoo');
  });

  it('run with whitespace around key', function() {
    var s = "%{ \t\v\r\nbar}%{ \t\v\r\nbar \t\v\r\n}%{bar \t\v\r\n}",
        r = Luigi.run(s, { bar: 'foo' });

    assert.equal(r, 'foofoofoo');
  });

  it('run with callback', function() {
    var t = new Luigi.Template("%{bar}foo%{bar}"),
        r = [];

    t.run({
      bar: 'foo',
    }, function(s) {
      r.push(s);
    });

    assert.equal(r.join(''), 'foofoofoo');
  });

  it('run singleton with callback', function() {
    var r = [];

    Luigi.run('%{bar}foo%{bar}', {
      bar: 'foo',
    }, null, function(s) {
      r.push(s);
    });

    assert.equal(r.join(''), 'foofoofoo');
  });
})();
