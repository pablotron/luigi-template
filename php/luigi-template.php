<?php

namespace Luigi;

const VERSION = '0.4.0';

final class Error extends \Exception {};

final class Filters {
  private static $filters = null;

  public static function init() {
    if (self::$filters !== null)
      return;

    self::$filters = array(
      'h' => function($s) {
        return htmlspecialchars($v);
      },

      'u' => function($s) {
        return urlencode($v);
      },

      'json' => function($v) {
        return json_encode($v);
      },

      'hash' => function($v, $args) {
        $algo = (count($args) == 1) ? $args[0] : 'md5';
        return hash($algo, $v);
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
    );
  }

  public static function get($key) {
    self::init();

    if (!isset(self::$filters[$key]))
      throw new Error("unknown filter: $key");

    return self::$filters[$key];
  }

  public static function add(array $filters) {
    self::init();
    self::$filters = array_merge(self::$filters, $filters);
  }
};

final class Parser {
  private static $RES = array(
    'action' => '/
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
    /mx',

    'filter' => '/
      # match filter name
      (?<name>\S+)
    
      # match filter arguments (optional)
      (?<args>(\s*\S+)*)
    
      # optional trailing whitespace
      \s*
    /mx',

    'delim_filters' => '/\s*\|\s*/m',
    'delim_args' => '/\s+/m',
  );

  public static function parse_template($template) {
    # build list of matches
    $matches = array();
    $num_matches = preg_match_all(
      self::$RES['action'],
      $template,
      $matches,
      PREG_SET_ORDER
    );

    # check for error
    if ($num_matches === false)
      throw new Error("invalid template: $template");
  
    # walk over matches and build list of actions
    $r = array_map(function($m) {
      if ($m['key'] !== '') {
        #  key and filters
        return array(
          'type'    => 'action',
          'key'     => $m['key'],
          'filters' => self::parse_filters($m['filters']),
        );
      } else {
        # literal text
        return array(
          'type' => 'text',
          'text' => $m['text'],
        );
      }
    }, $matches);

    # return result
    return $r;
  }

  public static function parse_filters($filters) {
    # split into individual filters
    $r = array();
    foreach (preg_split(self::$RES['delim_filters'], $filters) as $f) {
      # trim whitespace
      $f = trim($f);

      # skip empty filters
      if (!$f)
        continue;

      # match filter
      $md = array();
      if (!preg_match(self::$RES['filter'], $f, $md))
        throw new Error("invalid filter: $f");

      # add filter to results
      $r[] = array(
        # filter name
        'name' => $md['name'],

        # filter arguments
        'args' => (count($md) > 2) ? preg_split(
          self::$RES['delim_args'],
          trim($md['args'])
        ) : array(),
      );
    }

    # return results
    return $r;
  }
};

final class Template {
  private $template, $actions, $o;

  public function __construct($template, array $o = array()) {
    $this->template = $template;
    $this->o = $o;

    # parse template into list of actions
    $this->actions = Parser::parse_template($template);
  }

  public function run(array $args = array()) {
    # php sucks
    $me = $this;

    return join('', array_map(function($row) use ($me, $args) {
      if ($row['type'] == 'text') {
        # literal text
        return $row['text'];
      } else if ($row['type'] == 'action') {
        # template key (possibly with filters)

        # check value
        if (!isset($args[$row['key']]))
          throw new Error("unknown key: {$row['key']}");

        # pass value through filters and return result
        return array_reduce($row['filters'], function($r, $f) use ($me, $args) {
          # get filter
          $fn = Filters::get($f['name']);
        
          # call filter and return result
          return call_user_func($fn, $r, $f['args'], $args, $me);
        }, $args[$row['key']]);
      } else {
        # should never be reached
        throw new Error("unknown action type: {$row['type']}");
      }
    }, $this->actions));
  }

  public static function run_once($str, array $args = array()) {
    $t = new Template($str);
    return $t->run($args);
  }
};

final class Cache {
  private $templates, $o, $lut = array();

  public function __construct(array $templates, array $o = array()) {
    $this->templates = $templates;
    $this->o = $o;
  }

  public function get($key) {
    if (!isset($this->lut[$key])) {
      if (!isset($this->templates[$key]))
        throw new Error("unknown template: $key");

      # lazy-load template
      $this->lut[$key] = new Template($this->templates[$key], $this->o);
    }

    # return result
    return $this->lut[$key];
  }

  public function run($key, array $args = array()) {
    return $this->get($key)->run($args);
  }
};
