package pablotron.luigi;

import java.util.Map;
import java.util.HashMap;
import pablotron.luigi.Template;
import pablotron.luigi.LuigiError;

public final class Test {
  private static final String TEMPLATE = "hello %{name | uc}";

  private static final Map<String, String> args = new HashMap<String, String>() {{
    put("name", "paul");
  }};

  public static void main(String cli_args[]) throws Exception {
    final Template t = new Template(TEMPLATE);

    System.out.println(t.run(args));
  }
};
