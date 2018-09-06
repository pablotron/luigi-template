import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

import org.pablotron.luigi.Template;
import org.pablotron.luigi.Filter;
import org.pablotron.luigi.errors.LuigiError;
import org.pablotron.luigi.errors.FilterError;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

public final class DefaultFiltersTest {
  private static final class TestCase {
    private final String name;
    private final String arg;
    public final String expect;

    public TestCase(final String name, final String arg, final String expect) {
      this.name = name;
      this.arg = arg;
      this.expect = expect;
    }

    public String run() throws LuigiError {
      final Map<String, String> args = new HashMap<String, String>();
      args.put("val", arg);

      return Template.run(String.format("%%{val|%s}", name), args);
    }
  };

  private static final List<TestCase> TEST_CASES = new ArrayList<TestCase>() {{
    add(new TestCase("uc", "bar", "BAR"));
    add(new TestCase("lc", "BAR", "bar"));
    add(new TestCase("h", "asdf<>&\"'\u000f", "asdf&lt;&gt;&amp;&quot;&apos;&#15;"));
    add(new TestCase("u", "asdf<>&\"' \u000f", "asdf%3C%3E%26%22%27+%0F"));
    add(new TestCase("trim", " \r\n\tfoo", "foo"));
    add(new TestCase("trim", " \r\n\tfoo \r\n\t", "foo"));
    add(new TestCase("trim", "foo \r\n\t", "foo"));
  }};

  @Test
  public void testDefaultFilters() throws LuigiError {
    for (final TestCase t: TEST_CASES) {
      assertEquals(t.expect, t.run());
    }
  }
};
