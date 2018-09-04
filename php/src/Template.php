<?php
declare(strict_types = 1);

namespace Luigi;

const VERSION = '0.4.2';

class Error extends \Exception {};

class UnknownTypeError extends Error {
  public $type,
         $name;

  public function __construct(string $type, string $name) {
    $this->type = $type;
    $this->name = $name;
    parent::__construct("unknown $type: $name");
  }
};

final class UnknownTemplateError extends UnknownTypeError {
  public function __construct(string $name) {
    parent::__construct('template', $name);
  }
};

final class UnknownFilterError extends UnknownTypeError {
  public function __construct(string $name) {
    parent::__construct('filter', $name);
  }
};

final class UnknownKeyError extends UnknownTypeError {
  public function __construct(string $name) {
    parent::__construct('key', $name);
  }
};

final class MissingFilterParameterError extends Error {
  public $filter_name;

  public function __construct(string $filter_name) {
    $this->filter_name = $filter_name;
    parent::__construct("missing required filter parameter for filter $filter_name");
  }
};

final class InvalidTemplateError extends Error {
  public $template;

  public function __construct(string $template) {
    $this->template = $template;
    parent::__construct("invalid template: $template");
  }
};

namespace Luigi;

final class RunContext {
  public $args,
         $filters;

  public function __construct(array $args, array $filters) {
    $this->args = $args;
    $this->filters = $filters;
  }
};

namespace Luigi\Parser;

use \Luigi\RunContext;

final class TemplateFilter {
  private $name,
          $args;

  public function __construct(string $name, array $args) {
    $this->name = $name;
    $this->args = $args;
  }

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


abstract class Token {
  public abstract function run(RunContext &$ctx) : string;
};

final class LiteralToken extends Token {
  private $val;

  public function __construct(string $val) {
    $this->val = $val;
  }

  public function run(RunContext &$ctx) : string {
    return $this->val;
  }
};

final class FilterToken extends Token {
  private $key,
          $filters;

  public function __construct(string $key, array $filters) {
    $this->key = $key;
    $this->filters = $filters;
  }

  public function run(RunContext &$ctx) : string {
    if (!isset($args[$this->key])) {
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

const FILTER_RE = '/
  # match filter name
  (?<name>\S+)

  # match filter arguments (optional)
  (?<args>(\s*\S+)*)

  # optional trailing whitespace
  \s*
/mx';

const DELIM_FILTERS_RE = '/\s*\|\s*/m';

const DELIM_ARGS_RE = '/\s+/m';

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

function parse_template(string $template) : array {
  # build list of matches
  $matches = [];
  $num_matches = preg_match_all(TOKEN_RE, $template, $matches, PREG_SET_ORDER);

  # check for error
  if ($num_matches === false) {
    throw new InvalidTemplateError($template);
  }

  # map matches to tokens
  return array_map(function($m) {
    if ($m['key'] !== '') {
      # filter token
      return new FilterToken($m['key'], parse_filters($m['filters']));
    } else {
      # literal token
      return new LiteralToken($m['text']);
    }
  }, $matches);
}

namespace Luigi;

$FILTERS = [
  'h' => function($s) {
    return htmlspecialchars($v, ENT_QUOTES);
  },

  'u' => function($s) {
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
    return strlen($v);
  },

  'count' => function($v) {
    return count($v);
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

final class Template {
  private $template,
          $filters,
          $tokens;

  public function __construct(
    string $template,
    array $custom_filters = []
  ) {
    global $FILTERS;

    $this->template = $template;
    $this->filters = count($custom_filters) ? $custom_filters : $FILTERS;

    # parse template into list of tokens
    $this->tokens = Parser\parse_template($template);
  }

  public function run(array $args = []) : string {
    # create run context
    $ctx = new RunContext($args, $this->filters);

    return join('', array_map(function($token) use (&$ctx) {
      return $token->run($ctx);
    }, $this->tokens));
  }

  public static function once($str, $args = [], array $filters = []) {
    $t = new Template($str, $filters);
    return $t->run($args);
  }
};

function run(
  string $template,
  array $args = [],
  array $filters = []
) : string {
  $t = new Template($template, $filters);
  return $t->run($args);
}

final class Cache implements \ArrayAccess {
  private $templates,
          $filters,
          $lut = [];

  public function __construct(array $templates, array $filters = []) {
    $this->templates = $templates;
    $this->filters = $filters;
  }

  public function offsetExists($key) : bool {
    return isset($this->templates[$key]);
  }

  public function offsetGet($key) {
    if (isset($this->lut[$key])) {
      return $this->lut[$key];
    } else if (isset($this->templates[$key])) {
      $this->lut[$key] = new Template($this->templates[$key], $this->filters);
      return $this->lut[$key];
    } else {
      throw new UnknownTemplateError($key);
    }
  }

  public function offsetUnset($key) {
    delete($this->lut[$key]);
    delete($this->templates[$key]);
  }

  public function offsetSet($key, $val) : bool {
    delete($this->lut[$key]);
    $this->templates[$key] = $val;
    return isset($this->templates[$key]);
  }


  public function run(string $key, array $args = []) : string {
    return $this->offsetGet($key)->run($args);
  }
};
