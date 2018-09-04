<?php
declare(strict_types = 1);

namespace Pablotron\Luigi\Tests;
use \PHPUnit\Framework\TestCase;
use \Luigi\Template;

final class TemplateTest extends TestCase {
  public function testNewTemplate() : void {
    # create template
    $tmpl = new Template('foo%{bar}');

    $this->assertInstanceOf(Template::class, $tmpl);
  }

  public function testRun() : void {
    # create template
    $tmpl = new Template('foo%{bar}');

    # run template
    $r = $tmpl->run([
      'bar' => 'foo',
    ]);

    $this->assertEquals('foofoo', $r);
  }

  public function testOnce() : void {
    # create and run template
    $r = Template::once('foo%{bar}', [
      'bar' => 'foo',
    ]);

    $this->assertEquals('foofoo', $r);
  }

  public function testMultiple() : void {
    # create and run template
    $r = Template::once('foo%{bar}%{baz}', [
      'bar' => 'foo',
      'baz' => 'bar',
    ]);

    $this->assertEquals('foofoobar', $r);
  }

  public function testWhitespace() : void {
    # create and run template
    $r = Template::once('%{ bar}%{ bar }%{ bar}', [
      'bar' => 'foo',
    ]);

    $this->assertEquals('foofoofoo', $r);
  }

  public function testNewlines() : void {
    $str = '%{ 
      bar}%{
    bar
  
    }%{
      bar}';

    # create and run template
    $r = Template::once($str, [
      'bar' => 'foo',
    ]);

    $this->assertEquals('foofoofoo', $r);
  }

  public function testFilter() : void {
    # create and run template
    $r = Template::once('foo%{bar|h}', [
      'bar' => '<',
    ]);

    $this->assertEquals('foo&lt;', $r);
  }

  public function testFilterChain() : void {
    $want = 'foofeab40e1fca77c7360ccca1481bb8ba5f919ce3a';
    # create and run template
    $r = Template::once('foo%{bar|uc|hash sha1}', [
      'bar' => 'foo',
    ]);

    $this->assertEquals($want, $r);
  }

  public function testCustomGlobalFilter() : void {
    \Luigi\Filters::$FILTERS['barify'] = function($s) {
      return 'BAR';
    };

    # create template cache
    $cache = new \Luigi\Cache([
      'foo' => 'foo%{bar|barify}',
    ]);

    # run template
    $r = $cache['foo']->run([
      'bar' => 'foo',
    ]);

    $this->assertEquals('fooBAR', $r);
  }

  public function testCustomTemplateFilter() : void {
    # create template with custom filter
    $tmpl = new Template('foo%{bar|barify}', [
      'barify' => function($s) {
        return 'BAR';
      },
    ]);

    # run template
    $r = $tmpl->run([
      'bar' => 'foo',
    ]);

    $this->assertEquals('fooBAR', $r);
  }

  public function testCache() : void {
    # create template cache
    $cache = new \Luigi\Cache([
      'foo' => 'foo%{bar}',
    ]);

    # run template
    $r = $cache['foo']->run([
      'bar' => 'foo',
    ]);

    $this->assertEquals('foofoo', $r);
  }

  public function testFilterArgs() : void {
    $want = 'foo0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33';

    # run template
    $r = Template::once('foo%{bar|hash sha1}', [
      'bar' => 'foo',
    ]);

    $this->assertEquals($want, $r);
  }

  public function testUnknownKeyError() : void {
    $this->expectException(\Luigi\UnknownKeyError::class);

    # run template
    $r = Template::once('foo%{unknown-key}', [
      'bar' => 'foo',
    ]);
  }

  public function testUnknownFilterError() : void {
    $this->expectException(\Luigi\UnknownFilterError::class);

    # run template
    $r = Template::once('foo%{bar|unknown-filter}', [
      'bar' => 'foo',
    ]);
  }

  public function testUnknownTemplateError() : void {
    $this->expectException(\Luigi\UnknownTemplateError::class);

    # create cache
    $cache = new \Luigi\Cache([
      'foo' => 'foo%{bar}',
    ]);

    # run cached template
    $r = $cache['unknown-template']->run([
      'bar' => 'foo',
    ]);
  }

  public function testDefaultFilterH() : void {
    $want = '&lt;&gt;&amp;&quot;&#039;';

    $r = Template::once('%{val|h}', [
      'val' => '<>&"\'',
    ]);

    $this->assertEquals($want, $r);
  }

  public function testDefaultFilterU() : void {
    $want = 'foo%2F%3C%3E';

    $r = Template::once('%{val|u}', [
      'val' => 'foo/<>',
    ]);

    $this->assertEquals($want, $r);
  }

  public function testDefaultFilterJson() : void {
    $want = '{"true":true,"false":false,"null":null,"number":5,"string":"foo","hash":{"foo":"bar"},"array":[0,1]}';

    $r = Template::once('%{val|json}', [
      'val' => [
        'true' => true,
        'false' => false,
        'null' => null,
        'number' => 5,
        'string' => 'foo',
        'hash' => [
          'foo' => 'bar',
        ],
        'array' => [0, 1],
      ],
    ]);

    $this->assertEquals($want, $r);
  }

  public function testDefaultFilterHash() : void {
    $want = '0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33';

    # run template
    $r = Template::once('%{val|hash sha1}', [
      'val' => 'foo',
    ]);

    $this->assertEquals($want, $r);
  }

  public function testDefaultFilterBase64() : void {
    $want = 'Zm9v';

    # run template
    $r = Template::once('%{val|base64}', [
      'val' => 'foo',
    ]);

    $this->assertEquals($want, $r);
  }

  public function testDefaultFilterNl2br() : void {
    $want = "foo<br />\nbar";

    # run template
    $r = Template::once('%{val|nl2br}', [
      'val' => "foo\nbar",
    ]);

    $this->assertEquals($want, $r);
  }

  public function testDefaultFilterUc() : void {
    $want = 'FOO';

    # run template
    $r = Template::once('%{val|uc}', [
      'val' => 'foo',
    ]);

    $this->assertEquals($want, $r);
  }

  public function testDefaultFilterLc() : void {
    $want = 'foo';

    # run template
    $r = Template::once('%{val|lc}', [
      'val' => 'FOO',
    ]);

    $this->assertEquals($want, $r);
  }

  public function testDefaultFilterTrim() : void {
    $want = 'foo';

    # run template
    $r = Template::once('%{val|trim}', [
      'val' => ' foo ',
    ]);

    $this->assertEquals($want, $r);
  }

  public function testDefaultFilterLtrim() : void {
    $want = 'foo ';

    # run template
    $r = Template::once('%{val|ltrim}', [
      'val' => ' foo ',
    ]);

    $this->assertEquals($want, $r);
  }

  public function testDefaultFilterRtrim() : void {
    $want = ' foo';

    # run template
    $r = Template::once('%{val|rtrim}', [
      'val' => ' foo ',
    ]);

    $this->assertEquals($want, $r);
  }

  public function testDefaultFilterSWithZero() : void {
    $want = 'foos';

    # run template
    $r = Template::once('foo%{val|s}', [
      'val' => 0,
    ]);

    $this->assertEquals($want, $r);
  }

  public function testDefaultFilterSWithOne() : void {
    $want = 'foo';

    # run template
    $r = Template::once('foo%{val|s}', [
      'val' => 1,
    ]);

    $this->assertEquals($want, $r);
  }

  public function testDefaultFilterSWithTwo() : void {
    $want = 'foos';

    # run template
    $r = Template::once('foo%{val|s}', [
      'val' => 2,
    ]);

    $this->assertEquals($want, $r);
  }

  public function testDefaultFilterStrlen() : void {
    $want = '3';

    # run template
    $r = Template::once('%{val|strlen}', [
      'val' => 'foo',
    ]);

    $this->assertEquals($want, $r);
  }

  public function testDefaultFilterCount() : void {
    $want = '2';

    # run template
    $r = Template::once('%{val|count}', [
      'val' => ['foo', 'bar'],
    ]);

    $this->assertEquals($want, $r);
  }

  public function testDefaultFilterKey() : void {
    $want = 'bar';

    # run template
    $r = Template::once('%{val|key foo}', [
      'val' => [
        'foo' => 'bar',
      ],
    ]);

    $this->assertEquals($want, $r);
  }
};
