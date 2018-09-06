package org.pablotron.luigi;

import java.util.Map;
import java.util.HashMap;

import org.pablotron.luigi.errors.LuigiError;
import org.pablotron.luigi.Filter;
import org.pablotron.luigi.Template;
import org.pablotron.luigi.Cache;

public final class Test {
  // test template
  private static final String TEMPLATE =
    "test basic: hello %{name}\n" +
    "test filter: hello %{name | uc}\n" +
    "test custom: %{name | custom | uc | lc}\n" +
    "test custom_with_arg: %{name | custom_with_arg hello}\n";

  // test template cache
  private static final Cache cache = new Cache(new HashMap<String, String>() {{
    put("test-template", TEMPLATE);
  }});

  // test arguments
  private static final Map<String, String> args = new HashMap<String, String>() {{
    put("name", "paul");
  }};

  // custom filters
  private static final Map<String, Filter.Handler> filters = new HashMap<String, Filter.Handler>() {{
    // add custom filter
    put("custom", new Filter.Handler() {
      public String filter(String val, String args[], Map<String, String> row) {
        return "custom";
      }
    });

    // add custom filter with argument
    put("custom_with_arg", new Filter.Handler() {
      public String filter(String val, String args[], Map<String, String> row) {
        return (args.length > 0) ? args[0] : "custom";
      }
    });
  }};

  public static void main(String params[]) throws Exception {
    // add custom filters
    Filter.FILTERS.putAll(filters);

    // create and run template
    final Template t = new Template(TEMPLATE);
    System.out.print(t.run(args));

    // run cache
    System.out.print(cache.run("test-template", args));
  }
};
