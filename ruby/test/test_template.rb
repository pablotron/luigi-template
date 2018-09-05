require 'minitest/autorun'
require 'luigi-template'

class TemplateTest < MiniTest::Test
  def test_new
    t = Luigi::Template.new('foo%{bar}')
    assert_instance_of Luigi::Template, t
  end

  def test_run
    t = Luigi::Template.new('foo%{bar}')
    r = t.run(bar: 'foo')

    assert_equal 'foofoo', r
  end

  def test_run_with_string_key
    t = Luigi::Template.new('foo%{bar}')
    r = t.run('bar' => 'foo')

    assert_equal 'foofoo', r
  end

  def test_self_run
    r = Luigi::Template.run('foo%{bar}', bar: 'foo')
    assert_equal 'foofoo', r
  end

  def test_multiple_keys
    r = Luigi::Template.run('foo%{bar}%{baz}', {
      bar: 'foo',
      baz: 'bar',
    })

    assert_equal 'foofoobar', r
  end

  def test_whitespace
    r = Luigi::Template.run('%{ bar}%{ bar }%{ bar}', {
      bar: 'foo',
    })

    assert_equal 'foofoofoo', r
  end

  def test_newlines
    r = Luigi::Template.run('%{
      bar}%{
      bar

      }%{
        bar}', {
      bar: 'foo',
    })

    assert_equal 'foofoofoo', r
  end

  def test_filter
    r = Luigi::Template.run('foo%{bar|h}', {
      bar: '<',
    })

    assert_equal 'foo&lt;', r
  end

  def test_filter_chain
    want = 'foofeab40e1fca77c7360ccca1481bb8ba5f919ce3a'
    r = Luigi::Template.run('foo%{bar | uc | hash sha1}', {
      bar: 'foo',
    })

    assert_equal want, r
  end

  def test_custom_global_filter
    Luigi::FILTERS[:barify] = proc { |v| 'BAR' }

    r = Luigi::Template.run('foo%{bar | barify}', {
      bar: 'foo',
    })

    assert_equal 'fooBAR', r
  end

  def test_custom_template_filter
    r = Luigi::Template.run('foo%{bar | barify}', {
      bar: 'foo',
    }, {
      barify: proc { |v| 'BAR' }
    })

    assert_equal 'fooBAR', r
  end

  def test_cache
    cache = Luigi::Cache.new({
      foo: 'foo%{bar}',
    })

    r = cache.run(:foo, bar: 'foo')

    assert_equal 'foofoo', r
  end

  def test_filter_args
    want = 'foo0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33'

    r = Luigi::Template.run('foo%{bar | hash sha1}', {
      bar: 'foo'
    })

    assert_equal want, r
  end

  def test_unknown_key_error
    assert_raises(Luigi::UnknownKeyError) do
      Luigi::Template.run('foo%{unknown-key}', {
        bar: 'foo',
      })
    end
  end

  def test_unknown_filter_error
    assert_raises(Luigi::UnknownFilterError) do
      Luigi::Template.run('foo%{bar | unknown-filter}', {
        bar: 'foo',
      })
    end
  end

  def test_unknown_template_error
    assert_raises(Luigi::UnknownTemplateError) do
      cache = Luigi::Cache.new({
        foo: 'foo%{bar}',
      })

      cache.run('unknown-template', {
        bar: 'foo'
      })
    end
  end

  def test_to_s
    want = '%{val | h}'
    t = Luigi::Template.new(want)

    assert_equal want, t.to_s
  end
end
