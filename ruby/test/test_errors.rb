require 'minitest/autorun'
require 'luigi-template'

class ErrorsTest < MiniTest::Test
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
end
