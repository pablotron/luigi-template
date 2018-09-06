require 'minitest/autorun'
require 'luigi-template'

class CacheTest < MiniTest::Test
  def test_cache
    cache = Luigi::Cache.new({
      foo: 'foo%{bar}',
    })

    r = cache.run(:foo, bar: 'foo')

    assert_equal 'foofoo', r
  end

  def test_cache_with_custom_filters
    cache = Luigi::Cache.new({
      foo: 'foo%{bar | barify}',
    }, {
      barify: proc { |v| 
        "bar-#{v}-bar"
      },
    })

    r = cache.run(:foo, bar: 'foo')

    assert_equal 'foobar-foo-bar', r
  end
end
