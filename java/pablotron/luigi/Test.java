package pablotron.luigi;

import java.util.Map;
import java.util.HashMap;
import pablotron.luigi.LuigiError;
import pablotron.luigi.Template;
import pablotron.luigi.Filter;

public final class Test {
  private static final String TEMPLATE =
    "test basic: hello %{name}\n" +
    "test filter: hello %{name | uc}\n" +
    "test custom: %{name | custom | uc | lc}\n" +
    "test custom_with_arg: %{name | custom_with_arg hello}\n";

  private static final Map<String, String> args = new HashMap<String, String>() {{
    put("name", "paul");
  }};

  private static final Map<String, Filter.Handler> filters = new HashMap<String, Filter.Handler>() {{
    put("custom", new Filter.Handler() {
      public String filter(String val, String args[], Map<String, String> row) {
        return "custom";
      }
    });

    put("custom_with_arg", new Filter.Handler() {
      public String filter(String val, String args[], Map<String, String> row) {
        return (args.length > 0) ? args[0] : "custom";
      }
    });
  }};

  public static void main(String cli_args[]) throws Exception {
    // add custom filters to default filter cache
    Filter.FILTERS.putAll(filters);

    // create and run template
    final Template t = new Template(TEMPLATE);
    System.out.print(t.run(args));
  }
};
