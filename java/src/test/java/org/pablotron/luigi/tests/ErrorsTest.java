import java.util.Map;
import java.util.HashMap;

import org.pablotron.luigi.Template;
import org.pablotron.luigi.Cache;
import org.pablotron.luigi.errors.LuigiError;
import org.pablotron.luigi.errors.UnknownKeyError;
import org.pablotron.luigi.errors.UnknownFilterError;
import org.pablotron.luigi.errors.UnknownTemplateError;

import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;

public final class ErrorsTest {
  private static Map<String, String> TEST_ARGS = new HashMap<String, String>() {{
    put("bar", "foo");
  }};

  private static Map<String, String> TEST_TEMPLATES = new HashMap<String, String>() {{
    put("foo", "foo%{bar}foo");
  }};

  @Test
  public void testUnknownKeyError() {
    assertThrows(UnknownKeyError.class, () -> {
      Template.run("foo%{unknown-key}", TEST_ARGS);
    });
  }

  @Test
  public void testUnknownFilterError() {
    assertThrows(UnknownFilterError.class, () -> {
      Template.run("foo%{bar | unknown-filter}", TEST_ARGS);
    });
  }

  @Test
  public void testUnknownTemplateError() {
    final Cache cache = new Cache(TEST_TEMPLATES);
    assertThrows(UnknownTemplateError.class, () -> {
      cache.run("unknown-template", TEST_ARGS);
    });
  }
};
