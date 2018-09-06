import java.util.Map;
import java.util.HashMap;

import org.pablotron.luigi.Template;
import org.pablotron.luigi.errors.LuigiError;
import org.pablotron.luigi.ResultHandler;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;

public final class TemplateTest {
  private static final Map<String, String> TEST_ARGS = new HashMap<String, String>() {{
    put("bar", "foo");
  }};

  private static final Map<String, String> TEST_MULTIPLE_ARGS = new HashMap<String, String>() {{
    put("bar", "foo");
    put("baz", "bar");
  }};

  @Test
  public void testNew() throws LuigiError {
    final Template t = new Template("");

    assertNotNull(t);
  }

  @Test
  public void testRun() throws LuigiError {
    final Template t = new Template("foo%{bar}");
    final String r = t.run(TEST_ARGS);

    assertEquals("foofoo", r);
  }

  @Test
  public void testStaticRun() throws LuigiError {
    final String r = Template.run("foo%{bar}", TEST_ARGS);

    assertEquals("foofoo", r);
  }

  private static final class TestResultHandler implements ResultHandler {
    private final StringBuilder sb;
    public TestResultHandler(final StringBuilder sb) {
      this.sb = sb;
    }

    public void append(final String s) {
      sb.append(s);
    }
  };

  @Test
  public void testResultHandler() throws LuigiError {
    final Template t = new Template("foo%{bar}");
    final StringBuilder sb = new StringBuilder();
    final TestResultHandler rh = new TestResultHandler(sb);

    t.run(TEST_ARGS, rh);
    final String r = sb.toString();

    assertEquals("foofoo", sb.toString());
  }

  @Test
  public void testStaticResultHandler() throws LuigiError {
    final StringBuilder sb = new StringBuilder();
    final TestResultHandler rh = new TestResultHandler(sb);

    Template.run("foo%{bar}", TEST_ARGS, rh);
    final String r = sb.toString();

    assertEquals("foofoo", sb.toString());
  }

  @Test
  public void testMultipleKeys() throws LuigiError {
    final Template t = new Template("foo%{bar}%{baz}");
    final String r = t.run(TEST_MULTIPLE_ARGS);

    assertEquals("foofoobar", r);
  }

  @Test
  public void testWhitespace() throws LuigiError {
    final Template t = new Template("%{ bar}%{ bar }%{bar }");
    final String r = t.run(TEST_ARGS);

    assertEquals("foofoofoo", r);
  }

  @Test
  public void testNewlines() throws LuigiError {
    final Template t = new Template("%{\nbar}%{\n bar\n }%{bar\n}");
    final String r = t.run(TEST_ARGS);

    assertEquals("foofoofoo", r);
  }

  @Test
  public void testToString() throws LuigiError {
    final Template t = new Template("foo%{bar}");
    final String r = t.toString();

    assertEquals("foo%{bar}", r);
  }
};
