require 'minitest/autorun'
require 'luigi-template'

class TemplateTest < MiniTest::Test
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

  def test_filter_args
    want = 'foo0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33'

    r = Luigi::Template.run('foo%{bar | hash sha1}', {
      bar: 'foo'
    })

    assert_equal want, r
  end
end
