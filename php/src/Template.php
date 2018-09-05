<?php
/**
 * Fast string templating library for JavaScript, PHP, Ruby, and Java.
 *
 * @author Paul Duncan <pabs@pablotron.org>
 * @copyright 2010-2018 Paul Duncan <pabs@pablotron.org>
 * @license MIT
 * @package Pablotron\Luigi
 */

declare(strict_types = 1);

/**
 * Luigi Template namespace.
 *
 * @api
 */
namespace Pablotron\Luigi;

/**
 * Current version of Luigi Template.
 *
 * @api
 */
const VERSION = '0.4.2';

/**
 * Base class for all exceptions raised by Luigi Template.
 */
class LuigiError extends \Exception {};

/**
 * Base class for all all unknown type errors.
 */
class UnknownTypeError extends LuigiError {
  /**
    * @var string $type Unknown item type name ("method", "template", etc).
    * @var string $name Unknown item name.
    */
  public $type,
         $name;

  /**
   * Create a new UnknownTypeError error.
   *
   * @param string $type Unknown item type name.
   * @param string $name Unknown item name.
   */
  public function __construct(string $type, string $name) {
    $this->type = $type;
    $this->name = $name;
    parent::__construct("unknown $type: $name");
  }
};

/**
 * Thrown when attempting to get an unknown template from a Cache.
 *
 * @see Cache
 */
final class UnknownTemplateError extends UnknownTypeError {
  /**
   * Create a new UnknownTemplateError.
   *
   * @param string $name Unknown template name.
   */
  public function __construct(string $name) {
    parent::__construct('template', $name);
  }
};

/**
 * Thrown when attempting to apply an unknown filter.
 */
final class UnknownFilterError extends UnknownTypeError {
  /**
   * Create a new UnknownFilterError.
   *
   * @param string $name Unknown filter name.
   */
  public function __construct(string $name) {
    parent::__construct('filter', $name);
  }
};

/**
 * Thrown when attempting to get an unknown key.
 */
final class UnknownKeyError extends UnknownTypeError {
  /**
   * Create a new UnknownKeyError.
   *
   * @param string $name Unknown key name.
   */
  public function __construct(string $name) {
    parent::__construct('key', $name);
  }
};

/**
 * Thrown when trying to use a filter with with a missing parameter.
 */
final class MissingFilterParameterError extends LuigiError {
  /** @var string $filter_name Name of filter. */
  public $filter_name;

  /**
   * Create a new MissingFilterParameterError.
   *
   * @param string $filter_name Name of filter.
   */
  public function __construct(string $filter_name) {
    $this->filter_name = $filter_name;
    parent::__construct("missing required filter parameter for filter $filter_name");
  }
};

/**
 * Thrown when trying to parse an invalid template string.
 */
final class InvalidTemplateError extends LuigiError {
  /** @var string $template Template string. */
  public $template;

  /**
   * Create a new InvalidTemplateError.
   *
   * @param string $template Template string.
   */
  public function __construct(string $template) {
    $this->template = $template;
    parent::__construct("invalid template: $template");
  }
};

/**
 * Wrapper for context during Template#run().
 *
 * @internal
 */
final class RunContext {
  /**
   * @var array $args Hash of arguments.
   * @var array $filters Hash of filters.
   */
  public $args,
         $filters;

/**
 * Create a RunContext.
 *
 * @internal
 *
 * @param array $args Arguments hash.
 * @param array $filters Filters hash.
 */
  public function __construct(array $args, array $filters) {
    $this->args = $args;
    $this->filters = $filters;
  }
};

/**
 * Parsed filter name and arguments.
 *
 * @internal
 */
final class TemplateFilter {
  /**
   * @var string $name Filter name.
   * @var array $args Filter arguments.
   */
  private $name,
          $args;

  /**
   * Create a TemplateFilter.
   *
   * @internal
   *
   * @param string $name Filter name.
   * @param array $args Filter arguments.
   */
  public function __construct(string $name, array $args) {
    $this->name = $name;
    $this->args = $args;
  }

  /**
   * Run filter on given value, arguments, and filter set.
   *
   * @internal
   *
   * @param string $v Input value.
   * @param array $args Hash passed to Template#run().
   * @param array $filters Hash of filters.
   *
   * @return mixed Filter result.
   *
   * @throws UnknownFilterError If this filter does not exist in filter
   * hash.
   */
  public function run($v, array &$args, array &$filters) {
    if (!isset($filters[$this->name])) {
      throw new UnknownFilterError($this->name);
    }

    # get callback
    $cb = $filters[$this->name];

    # invoke callback, return result
    return $cb($v, $this->args, $args);
  }
};

/**
 * Abstract base class for parser tokens.
 *
 * @internal
 */
abstract class Token {
  /**
   * Apply this token.
   *
   * @internal
   *
   * @param RunContext $ctx Run context.
   *
   * @return string
   */
  public abstract function run(RunContext &$ctx) : string;
};

/**
 * Literal parser token.
 *
 * @internal
 */
final class LiteralToken extends Token {
  /** @var string $val Literal value. */
  private $val;

  /**
   * Create a new LiteralToken.
   *
   * @internal
   *
   * @param string $val Literal string.
   */
  public function __construct(string $val) {
    $this->val = $val;
  }

  /**
   * Returns the literal value.
   *
   * @internal
   *
   * @param RunContext $ctx Run context.
   *
   * @return string Literal value.
   */
  public function run(RunContext &$ctx) : string {
    return $this->val;
  }
};

/**
 * Filter parser token.
 *
 * @internal
 */
final class FilterToken extends Token {
  /**
   * @var string $key Argument name.
   * @var array $filters Array of TemplateFilter instances.
   */
  private $key,
          $filters;

  /**
   * Create a new LiteralToken.
   *
   * @internal
   *
   * @param string $key Argument name.
   * @param array $filters Array of TemplateFilter instances.
   */
  public function __construct(string $key, array $filters) {
    $this->key = $key;
    $this->filters = $filters;
  }

  /**
   * Get key from arguments hash and apply filters to it, then return
   * the result.
   *
   * @internal
   *
   * @param RunContext $ctx Run context.
   *
   * @return string Filtered result.
   *
   * @throws UnknownKeyError If the given key does not exist in the
   * arguments hash.
   */
  public function run(RunContext &$ctx) : string {
    # check key
    if (!isset($ctx->args[$this->key])) {
      throw new UnknownKeyError($this->key);
    }

    # get initial value
    $r = $ctx->args[$this->key];

    if ($this->filters && count($this->filters) > 0) {
      # pass value through filters
      $r = array_reduce($this->filters, function($r, $f) use (&$ctx) {
        return $f->run($r, $ctx->args, $ctx->filters);
      }, $r);
    }

    # return result
    return $r;
  }
};

/**
 * Token parser regular expression.
 *
 * @internal
 */
const TOKEN_RE = '/
  # match opening brace
  %\{

  # match optional whitespace
  \s*

  # match key
  (?<key>[^\s\|\}]+)

  # match filter(s)
  (?<filters>(\s*\|(\s*[^\s\|\}]+)+)*)

  # match optional whitespace
  \s*

  # match closing brace
  \}

  # or match up all non-% chars or a single % char
  | (?<text>[^%]* | %)
/mx';

/**
 * Filter parser regular expression.
 *
 * @internal
 */
const FILTER_RE = '/
  # match filter name
  (?<name>\S+)

  # match filter arguments (optional)
  (?<args>(\s*\S+)*)

  # optional trailing whitespace
  \s*
/mx';

/**
 * Filter delimiter regular expression.
 *
 * @internal
 */
const DELIM_FILTERS_RE = '/\s*\|\s*/m';

/**
 * Filter argument delimiter regular expression.
 *
 * @internal
 */
const DELIM_ARGS_RE = '/\s+/m';

/**
 * Parse a string containing a filter clause into an array of
 * TemplateFilter instances.
 *
 * @internal
 *
 * @param string $filters Input filter string.
 *
 * @return array Array of TemplateFilter instances.
 *
 * @throws UnknownFilterError if a filter clause could not be parsed.
 */
function parse_filters(string $filters) : array {
  # split into individual filters
  $r = [];

  foreach (preg_split(DELIM_FILTERS_RE, $filters) as $f) {
    # trim whitespace
    $f = trim($f);

    # skip empty filters
    if (!$f)
      continue;

    # match filter
    $md = [];
    if (!preg_match(FILTER_RE, $f, $md)) {
      throw new UnknownFilterError($f);
    }

    # add filter to results
    $r[] = new TemplateFilter($md['name'], (count($md) > 2) ? preg_split(
      DELIM_ARGS_RE,
      trim($md['args'])
    ) : []);
  }

  # return results
  return $r;
}

/**
 * Parse a template string into an array of Token instances.
 *
 * @internal
 *
 * @param string $template Input template string.
 *
 * @return array Array of Token instances.
 *
 * @throws InvalidTemplateError if the template could not be parsed.
 */
function parse_template(string $template) : array {
  # build list of matches
  $matches = [];
  $num_matches = preg_match_all(TOKEN_RE, $template, $matches, PREG_SET_ORDER);

  # check for error
  if ($num_matches === false) {
    throw new InvalidTemplateError($template);
  }

  # map matches to tokens
  return array_reduce($matches, function($r, $m) {
    if ($m['key'] !== '') {
      # filter token
      $r[] = new FilterToken($m['key'], parse_filters($m['filters']));
    } else if (strlen($m['text']) > 0) {
      # literal token
      $r[] = new LiteralToken($m['text']);
    } else {
      # ignore empty string
    }

    return $r;
  }, []);
}

/**
 * Static class containing global filter map.
 *
 * The built-in default filters are:
 *
 * * `h`: HTML-escape input string (including quotes).
 * * `u`: URL-escape input string.
 * * `json`: JSON-encode input value.
 * * `hash`: Hash input value.  Requires hash algorithm as parameter.
 * * `base64`: Base64-encode input string.
 * * `nl2br`: Convert newlines to `\<br/\>` elements.
 * * `uc`: Upper-case input string.
 * * `lc`: Lower-case input string.
 * * `trim`: Trim leading and trailing whitespace from input string.
 * * `ltrim`: Trim leading whitespace from input string.
 * * `rtrim`: Trim trailing whitespace from input string.
 * * `s`: Return '' if input number is 1, and 's' otherwise (used for
 *   pluralization).
 * * `strlen`: Return the length of the input string.
 * * `count`: Return the number of elements in the input array.
 * * `key`: Get the given key from the input array.  Requires key as a
 *   parameter.
 *
 * You can add your own filters to the default set of filters by
 * modifying `\Luigi\Filters::$FILTERS`, like so:
 *
 *     # add a filter named "my-filter"
 *     \Luigi\Filters['my-filter'] = function($s) {
 *       # filter input string
 *       return "foo-{$s}-bar";
 *     };
 *
 *     # use custom filter in template
 *     echo Template::once('%{some-key | my-filter}', [
 *       'some-key' => 'example',
 *     ]) . "\n";
 *
 *     # prints "foo-example-bar"
 *
 * @api
 */
class Filters {
  /**
   * @var array $FILTERS Global filter map.
   *
   * @api
   */
  public static $FILTERS = null;

  /**
   * Initialize global filter map.
   *
   * Called internally by LuigiTemplate.
   *
   * @internal
   *
   * @return void
   */
  public static function init() : void {
    # prevent double initialization
    if (self::$FILTERS !== null)
      return;

    self::$FILTERS = [
      'h' => function($v) {
        return htmlspecialchars($v, ENT_QUOTES);
      },

      'u' => function($v) {
        return urlencode($v);
      },

      'json' => function($v) {
        return json_encode($v);
      },

      'hash' => function($v, $args) {
        if (count($args) !== 1) {
          throw new MissingFilterParameterError('hash');
        }

        return hash($args[0], $v);
      },

      'base64' => function($v) {
        return base64_encode($v);
      },

      'nl2br' => function($v) {
        return nl2br($v);
      },

      'uc' => function($v) {
        return strtoupper($v);
      },

      'lc' => function($v) {
        return strtolower($v);
      },

      'trim' => function($v) {
        return trim($v);
      },

      'rtrim' => function($v) {
        return rtrim($v);
      },

      'ltrim' => function($v) {
        return ltrim($v);
      },

      's' => function($v) {
        return ($v == 1) ? '' : 's';
      },

      'strlen' => function($v) {
        return '' . strlen($v);
      },

      'count' => function($v) {
        return '' . count($v);
      },

      'key' => function($v, $args) {
        if (count($args) !== 1) {
          throw new MissingFilterParameterError('key');
        }

        # get key
        $key = $args[0];

        # make sure key exists
        if (!isset($v[$key])) {
          throw new UnknownKeyError($key);
        }

        # return key
        return $v[$key];
      },
    ];
  }
};

# initialize filters
Filters::init();

/**
 * Template object.
 *
 * Parse a template string into a Template instance, and then apply the
 * Template via the Template#run() method.
 *
 * Example:
 *
 *     # load template class
 *     use \Pablotron\Luigi\Template;
 *
 *     # create template
 *     $tmpl = new Template('hello %{name}');
 *
 *     # run template and print result
 *     echo $tmpl->run([
 *       'name' => 'Paul',
 *     ]) . "\n";
 *
 *     # prints "hello Paul"
 *
 * You can also filter values in templates, using the pipe symbol:
 *
 *     # create template that converts name to upper-case
 *     $tmpl = new Template('hello %{name | uc}');
 *
 *     # run template and print result
 *     echo $tmpl->run([
 *       'name' => 'Paul',
 *     ]) . "\n";
 *
 *     # prints "hello PAUL"
 *
 * Filters can be chained:
 *
 *     # create template that converts name to upper-case and then
 *     # strips leading and trailing whitespace
 *     $tmpl = new Template('hello %{name | uc | trim}');
 *
 *     # run template and print result
 *     echo $tmpl->run([
 *       'name' => '   Paul    ',
 *     ]) . "\n";
 *
 *     # prints "hello PAUL"
 *
 * Filters can take arguments:
 *
 *     # create template that converts name to lowercase and then
 *     # calculates the SHA-1 digest of the result
 *     $tmpl = new Template('hello %{name | lc | hash sha1}');
 *
 *     # run template and print result
 *     echo $tmpl->run([
 *       'name' => 'Paul',
 *     ]) . "\n";
 *
 *     # prints "hello a027184a55211cd23e3f3094f1fdc728df5e0500"
 *
 * You can define custom global filters:
 *
 *     # load template and filter classes
 *     use \Pablotron\Luigi\Template;
 *     use \Pablotron\Luigi\Filters;
 *
 *     # create custom global filter named 'foobarify'
 *     Filters::$FILTERS['foobarify'] = function($s) {
 *       return "foo-{$s}-bar";
 *     };
 *
 *     # create template that converts name to lowercase and then
 *     # calculates the SHA-1 digest of the result
 *     $tmpl = new Template('hello %{name | foobarify}');
 *
 *     # run template and print result
 *     echo $tmpl->run([
 *       'name' => 'Paul',
 *     ]) . "\n";
 *
 *     # prints "hello foo-Paul-bar"
 *
 * Or define custom filters for a template:
 *
 *     # load template and filter classes
 *     use \Pablotron\Luigi\Template;
 *
 *     # create template that converts name to lowercase and then
 *     # calculates the SHA-1 digest of the result
 *     $tmpl = new Template('hello %{name | reverse}', [);
 *       'reverse' => function($s) {
 *         return strrev($s);
 *       },
 *     ]);
 *
 *     # run template and print result
 *     echo $tmpl->run([
 *       'name' => 'Paul',
 *     ]) . "\n";
 *
 *     # prints "hello luaP"
 *
 * Your custom filters can accept arguments, too:
 *
 *     # load template and filter classes
 *     use \Pablotron\Luigi\Template;
 *     use \Pablotron\Luigi\Filters;
 *
 *     # create custom global filter named 'foobarify'
 *     Filters::$FILTERS['wrap'] = function($s, $args) {
 *        if (count($args) == 2) {
 *          return sprintf('(%s, %s, %s)', $args[0], $s, $args[1]);
 *        } else if (count($args) == 1) {
 *          return sprintf('(%s in %s)', %s, $args[0]);
 *        } else if (count($args) == 0) {
 *          return $s;
 *        } else {
 *          throw new Exception("invalid argument count");
 *        }
 *     };
 *
 *     # create template that converts name to lowercase and then
 *     # calculates the SHA-1 digest of the result
 *     $tmpl = new Template('sandwich: %{meat | wrap slice heel}, taco: %{meat | wrap shell}');
 *
 *     # run template and print result
 *     echo $tmpl->run([
 *       'meat' => 'chicken',
 *     ]) . "\n";
 *
 *     # prints "sandwich: (slice, chicken, heel), taco: (chicken in shell)"
 *
 * @api
 *
 */
final class Template {
  /** @var string $template Input template string. */
  public $template;

  /**
   * @var array $filters Filter map.
   * @var array $tokens Parsed template tokens.
   */
  private $filters,
          $tokens;

  /**
   * Create a new Template object.
   *
   * Parse a template string into tokens.
   *
   * Example:
   *
   *     # load template class
   *     use \Pablotron\Luigi\Template;
   *
   *     # create template
   *     $tmpl = new Template('hello %{name}');
   *
   * @api
   *
   * @param string $template Template string.
   * @param array $custom_filters Custom filter map (optional).
   */
  public function __construct(
    string $template,
    array $custom_filters = []
  ) {
    $this->template = $template;
    $this->filters = (count($custom_filters) > 0) ? $custom_filters : Filters::$FILTERS;

    # parse template into list of tokens
    $this->tokens = parse_template($template);
  }

  /**
   * Apply given arguments to template and return the result as a
   * string.
   *
   * Example:
   *
   *     # load template class
   *     use \Pablotron\Luigi\Template;
   *
   *     # create template
   *     $tmpl = new Template('hello %{name}');
   *
   *     # run template and print result
   *     echo $tmpl->run([
   *       'name' => 'Paul',
   *     ]) . "\n";
   *
   *     # prints "hello Paul"
   *
   * @api
   *
   * @param array $args Template arguments.
   *
   * @return string Expanded template.
   *
   * @throws UnknownKeyError If a referenced key is missing from $args.
   */
  public function run(array $args = []) : string {
    # create run context
    $ctx = new RunContext($args, $this->filters);

    return join('', array_map(function($token) use (&$ctx) {
      return $token->run($ctx);
    }, $this->tokens));
  }

  /**
   * Return the input template string.
   *
   * Example:
   *
   *     # load template class
   *     use \Pablotron\Luigi\Template;
   *
   *     # create template
   *     $tmpl = new Template('hello %{name}');
   *
   *     # print template string
   *     echo $tmpl . "\n";
   *
   *     # prints "hello %{name}"
   *
   * @api
   *
   * @return string Input template string.
   */
  public function __toString() : string {
    return $this->template;
  }

  /**
   * Parse template string, expand it using given arguments, and return
   * the result as a string.
   *
   * Example:
   *
   *     # load template class
   *     use \Pablotron\Luigi\Template;
   *
   *     # create template, run it, and print result
   *     echo Template::once('foo-%{some-key}-bar', [
   *       'some-key' => 'example',
   *     ]) . "\n";
   *
   *     # prints "foo-example-bar"
   * @api
   *
   * @param string $template Template string.
   * @param array $args Template arguments.
   * @param array $filters Custom filter map (optional).
   *
   * @return string Expanded template.
   */
  public static function once(
    string $template,
    array $args = [],
    array $filters = []
  ) : string {
    $t = new Template($template, $filters);
    return $t->run($args);
  }
};

/**
 * Lazy-loading template cache.
 *
 * Group a set of templates together and only parse them on an as-needed
 * basis.
 *
 * @api
 */
final class Cache implements \ArrayAccess {
  /**
   * @var array $templates Map of keys to template strings.
   * @var array $filters Filter map (optional).
   * @var array $lut Parsed template cache.
   */
  private $templates,
          $filters,
          $lut = [];

  /**
   * Create a new template cache.
   *
   * Example:
   *
   *     # load cache class
   *     use \Pablotron\Luigi\Cache;
   *
   *     # create template cache
   *     $cache = new Cache([
   *       'hi' => 'hi %{name}!',
   *     ]);
   *
   * @api
   *
   * @param array $templates Map of template keys to template strings.
   * @param array $filters Custom filter map (optional).
   */
  public function __construct(array $templates, array $filters = []) {
    $this->templates = $templates;
    $this->filters = (count($filters) > 0) ? $filters : Filters::$FILTERS;
  }

  /**
   * Returns true if the given template key exists in this cache.
   *
   * Example:
   *
   *     # load cache class
   *     use \Pablotron\Luigi\Cache;
   *
   *     # create cache
   *     $cache = new Cache([
   *       'hi' => 'hi %{name}!',
   *     ]);
   *
   *     # get template 'hi' from cache
   *     foreach (array('hi', 'nope') as $tmpl_key) {
   *       echo "$key: " . (isset($cache[$key]) ? 'Yes' : 'No') . "\n"
   *     }
   *
   *     # prints "hi: Yes" and "nope: No"
   * @api
   *
   * @param string $key Template key.
   *
   * @return bool Returns true if the template key exists.
   */
  public function offsetExists($key) : bool {
    return isset($this->templates[$key]);
  }

  /**
   * Get the template associated with the given template key.
   *
   * Example:
   *
   *     # load cache class
   *     use \Pablotron\Luigi\Cache;
   *
   *     # create cache
   *     $cache = new Cache([
   *       'hi' => 'hi %{name}!',
   *     ]);
   *
   *     # get template 'hi' from cache
   *     $tmpl = $cache['hi'];
   *
   *     echo $tmpl->run([
   *       'name' => 'Paul',
   *     ]);
   *
   *     # prints "hi Paul!"
   *
   * @api
   *
   * @param string $key Template key.
   *
   * @return Template Returns template associated with this key.
   *
   * @throws UnknownTemplateError if the given template does not exist.
   */
  public function offsetGet($key) : Template {
    if (isset($this->lut[$key])) {
      return $this->lut[$key];
    } else if (isset($this->templates[$key])) {
      $this->lut[$key] = new Template($this->templates[$key], $this->filters);
      return $this->lut[$key];
    } else {
      throw new UnknownTemplateError($key);
    }
  }

  /**
   * Remove the template associated with the given template key.
   *
   * Example:
   *
   *     # load cache class
   *     use \Pablotron\Luigi\Cache;
   *
   *     # create cache
   *     $cache = new Cache([
   *       'hi' => 'hi %{name}!',
   *     ]);
   *
   *     # remove template 'hi' from cache
   *     unset($cache['hi']);
   *
   *     echo $cache['hi']->run([
   *       'name' => 'Paul',
   *     ]);
   *
   *     # throws UnknownTemplateError
   *
   * @api
   *
   * @param array $key Template key.
   *
   * @return void
   */
  public function offsetUnset($key) : void {
    unset($this->lut[$key]);
    unset($this->templates[$key]);
  }

  /**
   * Set the template associated with the given template key.
   *
   * Example:
   *
   *     # load cache class
   *     use \Pablotron\Luigi\Cache;
   *
   *     # create cache
   *     $cache = new Cache();
   *
   *     # add template to cache as 'hash-name'
   *     $cache['hash-name'] = 'hashed name: %{name | hash sha1}';
   *
   *     echo $cache['hash-name']->run([
   *       'name' => 'Paul',
   *     ]);
   *
   *     # prints "sha1 of name: c3687ab9880c26dfe7ab966a8a1701b5e017c2ff"
   *
   * @api
   *
   * @param string $key Template key.
   * @param string $val Template string.
   *
   * @return void
   */
  public function offsetSet($key, $val) : void {
    unset($this->lut[$key]);
    $this->templates[$key] = $val;
  }

  /**
   * Run template with the given arguments and return the result.
   *
   * Example:
   *
   *     # load cache class
   *     use \Pablotron\Luigi\Cache;
   *
   *     # create cache
   *     $cache = new Cache([
   *       'my-template' => 'hello %{name | uc}',
   *     ]);
   *
   *     # run template
   *     echo $cache->run('my-template', [
   *       'name' => 'Paul',
   *     ]);
   *
   *     # prints "hello PAUL"
   *
   * @api
   *
   * @param string $key Template key.
   * @param array $args Template arguments.
   *
   * @return string Returns the expanded template result.
   */
  public function run(string $key, array $args = []) : string {
    return $this->offsetGet($key)->run($args);
  }
};
