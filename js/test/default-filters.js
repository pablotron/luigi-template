(function() {
  'use strict';
  var assert = chai.assert;

  [{
    filter: 'uc',
    template: 'foo%{bar|uc}',
    args: {
      bar: 'foo',
    },
    expect: 'fooFOO',
  }, {
    filter: 'lc',
    template: 'foo%{bar|lc}',
    args: {
      bar: 'FOO'
    },
    expect: 'foofoo',
  }, {
    filter: 'h',
    template: '%{bar|h}',
    args: {
      bar: '<>&"\'',
    },
    expect: '&lt;&gt;&amp;&quot;&apos;',
  }, {
    filter: 'u',
    template: '%{bar|u}',
    args: {
      bar: 'asdf<>&"\' \u000f',
    },
    expect: 'asdf%3C%3E%26%22%27+%0F'
  }, {
    filter: 'json',
    template: '%{bar|json}',
    args: {
      bar: {
        true: true,
        false: false,
        null: null,
        number: 5,
        string: 'foo',
        hash: { 'foo': 'bar' },
        array: [0, 1],
      },
    },
    expect: '{"true":true,"false":false,"null":null,"number":5,"string":"foo","hash":{"foo":"bar"},"array":[0,1]}',
  }, {
    filter: 'trim',
    template: '%{bar|trim}',
    args: { bar: ' \t\v\r\nfoo \t\v\r\n' },
    expect: 'foo'
  }, {
    filter: 's',
    template: 'one foo%{foo|s}, two bar%{bar|s}',
    args: { 
      foo: 1,
      bar: 2,
    },
    expect: 'one foo, two bars'
  }, {
    filter: 'length',
    template: 'length of bar: %{bar|length}',
    args: { 
      bar: [0, 1, 2],
    },
    expect: 'length of bar: 3'
  }].forEach(function(row) {
    it('default filter: ' + row.filter, function() {
      assert.equal(LuigiTemplate.run(row.template, row.args), row.expect);
    });
  });
})();
