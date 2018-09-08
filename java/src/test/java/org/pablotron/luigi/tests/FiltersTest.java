import java.util.Map;
import java.util.HashMap;

import org.pablotron.luigi.Template;
import org.pablotron.luigi.Filter;
import org.pablotron.luigi.errors.LuigiError;
import org.pablotron.luigi.errors.FilterError;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;


public final class FiltersTest {
  private static final Map<String, String> TEST_ARGS = new HashMap<String, String>() {{
    put("bar", "foo");
  }};

  private static final Map<String, String> TEST_MULTIPLE_ARGS = new HashMap<String, String>() {{
    put("bar", "foo");
    put("baz", "bar");
  }};

  private static final Map<String, Filter.Handler> TEST_FILTERS = new HashMap<String, Filter.Handler>() {{
    put("barify", new Filter.Handler() {
      public String filter(String val, String args[], Map<String, String> row) {
        return String.format("bar-%s-bar", val);
      }
    });

    put("wrap", new Filter.Handler() {
      public String filter(
        String val,
        String args[],
        Map<String, String> row
      ) throws FilterError {
        switch (args.length) {
        case 2:
          return String.format("(%s, %s, %s)", args[0], val, args[1]);
        case 1:
          return String.format("(%s in %s)", val, args[0], val);
        case 0:
          return val;
        default:
          throw new FilterError("invalid filter argument count");
        }
      }
    });
  }};

  @Test
  public void testFilter() throws LuigiError {
    final String r = Template.run("foo%{bar | lc}", TEST_ARGS);

    assertEquals("foofoo", r);
  }

  @Test
  public void testFilterChain() throws LuigiError {
    final String r = Template.run("foo%{bar | lc | uc}", TEST_ARGS);

    assertEquals("fooFOO", r);
  }

  @Test
  public void testCustomFilter() throws LuigiError {
    final String r = Template.run("foo%{bar | barify}", TEST_ARGS, TEST_FILTERS);

    assertEquals("foobar-foo-bar", r);
  }

  @Test
  public void testCustomFilterWithArgs() throws LuigiError {
    // test two arguments
    final String plain = Template.run("%{bar | wrap}", TEST_ARGS, TEST_FILTERS);
    assertEquals("foo", plain);

    // test one argument
    final String sandwich = Template.run("%{bar | wrap bread}", TEST_ARGS, TEST_FILTERS);
    assertEquals("(foo in bread)", sandwich);

    // test two arguments
    final String pizza = Template.run("%{bar | wrap crust cheese}", TEST_ARGS, TEST_FILTERS);
    assertEquals("(crust, foo, cheese)", pizza);
  }
};
