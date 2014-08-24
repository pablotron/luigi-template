
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
  "Your name hashes to: %{name|hash(sha1)|uc}",

  // test custom filter
  "Your custom filtered name is: %{name|custom}",

  // test custom filter with arguments
  "Your custom_args name is: %{name|custom_args(foo,bar,baz)}",

  // test whitespace in filters
  "random test: %{name | hash( sha512 ) | uc }",

  // test pluralize filter
  'pluralize test (0): %{count_0} %{count_0 | pluralize(item)}',
  'pluralize test (1): %{count_1} %{count_1 | pluralize(item)}',
  'pluralize test (10): %{count_10} %{count_10 | pluralize(item)}',

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
