
load('luigi-template.js');

// define custom template filter
function custom_filter(v) {
  return "foo" + v + "bar";
}

function custom_filter_with_args(v, args) {
  var i, l, r = [v];

  for (i = 0, l = args.length; i < l; i++)
    r.push(args[i]);

  return r.join(' and ');
}

// add custom template filters
LuigiTemplate.FILTERS.custom = custom_filter;
LuigiTemplate.FILTERS.custom_args = custom_filter_with_args;

// build template string
var template_str = [
  // test basic templates
  "%{greet}, %{name}!",

  // test filters and filters with parameters
  "Your name uppercase is: %{name|uc}",

  // test custom filter
  "Your custom filtered name is: %{name|custom}",

  // test custom filter with arguments
  "Your custom_args name is: %{name|custom_args foo bar baz}",

  // test whitespace in filters
  "random test: %{name | lc }",

  // test pluralize filter
  'pluralize test (0): %{count_0} item%{count_0 | s}',
  'pluralize test (1): %{count_1} item%{count_1 | s}',
  'pluralize test (10): %{count_10} item%{count_10 | s}',

  // terminating newline
  ''
].join("\n");

// build template
var t = new LuigiTemplate(template_str);

// print results
print(t.run({
  greet:    'hello',
  name:     'paul',
  count_0:  0,
  count_1:  1,
  count_10: 10
}));
