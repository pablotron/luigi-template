require 'minitest/autorun'
require 'luigi-template'

class FiltersTest < MiniTest::Test
  def test_uc
    r = Luigi::Template.run('foo%{bar|uc}', {
      bar: 'bar',
    })

    assert_equal 'fooBAR', r
  end

  def test_lc
    r = Luigi::Template.run('foo%{bar|lc}', {
      bar: 'BAR',
    })

    assert_equal 'foobar', r
  end

  def test_h
    r = Luigi::Template.run('%{bar|h}', {
      bar: "<>&\"'\x0f",
    })

    assert_equal '&lt;&gt;&amp;&quot;&apos;&#15;', r
  end

  def test_u
    r = Luigi::Template.run('%{bar|u}', {
      bar: "asdf<>&\"' \x0f",
    })

    assert_equal 'asdf%3C%3E%26%22%27+%0F', r
  end

  def test_json
    want = '{"true":true,"false":false,"null":null,"number":5,"string":"foo","hash":{"foo":"bar"},"array":[0,1]}';

    r = Luigi::Template.run('%{bar|json}', {
      bar: {
        true: true,
        false: false,
        null: nil,
        number: 5,
        string: 'foo',
        hash: { foo: 'bar' },
        array: [0, 1],
      },
    })

    assert_equal want, r
  end

  def test_trim
    r = Luigi::Template.run('foo%{bar|trim}', {
      bar: "\r\n\t\v foo \r\n\t\v",
    })

    assert_equal 'foofoo', r
  end

  def test_base64
    r = Luigi::Template.run('%{bar|base64}', {
      bar: "foo",
    })

    assert_equal 'Zm9v', r
  end

  def test_hash_md5
    r = Luigi::Template.run('%{bar|hash md5}', {
      bar: "foo",
    })

    assert_equal 'acbd18db4cc2f85cedef654fccc4a4d8', r
  end

  def test_hash_sha1
    r = Luigi::Template.run('%{bar|hash sha1}', {
      bar: "foo",
    })

    assert_equal '0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33', r
  end
end
