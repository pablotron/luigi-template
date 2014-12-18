<?php

error_reporting(E_ALL | E_STRICT);

require 'luigi-template.php';

# build template string
$template_str = join("\n", array(
  # test basic templates
  "%{greet}, %{name}!",

  # test filters and filters with parameters
  "Your name hashes to: %{
      name
      |
      hash 
        sha1
      |
      uc
    }",

  # test custom filter
  "Your custom filtered name is: %{name|custom}",

  # test custom filter with arguments
  "Your custom_args name is: %{name|custom_args foo bar baz}",

  # test whitespace in filters
  "random test: %{name | hash sha512 | base64| uc }",

  # test pluralize filter
  'pluralize test (0): %{count_0} item%{count_0 | s}',
  'pluralize test (1): %{count_1} item%{count_1 | s}',
  'pluralize test (10): %{count_10} item%{count_10 | s}',
)) . "\n";

Luigi\Filters::add(array(
  'custom' => function() {
    return 'custom';
  },

  'custom_args' => function($v, $args) {
    return join(',', array_map(function($arg) use ($v) {
      return "$arg$v";
    }, $args));
  },
));

# build template
$t = new Luigi\Template($template_str);

$args = array(
  'greet'     => 'hello',
  'name'      => 'paul',
  'count_0'   => 0,
  'count_1'   => 1,
  'count_10'  => 10,
);

# print results
echo $t->run($args);

# test static invocation
echo Luigi\Template::run_once($template_str, $args);
