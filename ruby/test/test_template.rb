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

  def test_to_s
    want = '%{val | h}'
    t = Luigi::Template.new(want)

    assert_equal want, t.to_s
  end
end
