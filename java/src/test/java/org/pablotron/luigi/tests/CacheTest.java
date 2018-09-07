package org.pablotron.luigi.tests;

import java.util.Map;
import java.util.HashMap;

import org.pablotron.luigi.Template;
import org.pablotron.luigi.Filter;
import org.pablotron.luigi.Cache;
import org.pablotron.luigi.errors.LuigiError;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

public final class CacheTest {
  private static Map<String, String> TEST_ARGS = new HashMap<String, String>() {{
    put("bar", "foo");
  }};

  private static Map<String, String> TEST_TEMPLATES = new HashMap<String, String>() {{
    put("foo", "foo%{bar}foo");
    put("foo-custom", "foo%{bar | custom-filter}foo");
  }};

  private static Map<String, Filter.Handler> TEST_FILTERS = new HashMap<String, Filter.Handler>() {{
    put("custom-filter", new Filter.Handler() {
      public String filter(String val, String args[], Map<String, String> row) {
        return String.format("-custom-%s-filter-", val);
      }
    });
  }};

  @Test
  public void testCache() throws LuigiError {
    final Cache cache = new Cache(TEST_TEMPLATES);

    assertEquals("foofoofoo", cache.run("foo", TEST_ARGS));
  }

  @Test
  public void testCacheWithCustomFilters() throws LuigiError {
    final Cache cache = new Cache(TEST_TEMPLATES, TEST_FILTERS);
    assertEquals("foo-custom-foo-filter-foo", cache.run("foo-custom", TEST_ARGS));
  }

  @Test
  public void testCacheGetWithResultHandler() throws LuigiError {
    final Cache cache = new Cache(TEST_TEMPLATES);
    final StringBuilder sb = new StringBuilder();
    final TestResultHandler rh = new TestResultHandler(sb);
    cache.run("foo", TEST_ARGS, rh);

    assertEquals("foofoofoo", sb.toString());
  }

};
