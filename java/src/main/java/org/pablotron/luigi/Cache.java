package org.pablotron.luigi;

import java.util.Map;
import java.util.HashMap;
import org.pablotron.luigi.Filter;
import org.pablotron.luigi.Template;
import org.pablotron.luigi.LuigiError;
import org.pablotron.luigi.actions.Action;

public final class Cache {
  private final Map<String, String> strings;
  private final Map<String, Filter.Handler> filters;
  private final Map<String, Template> templates = new HashMap<String, Template>();

  public Cache(
    final Map<String, String> strings,
    final Map<String, Filter.Handler> filters
  ) {
    this.strings = strings;
    this.filters = filters;
  }

  public Cache(final Map<String, String> strings) {
    this(strings, Filter.FILTERS);
  }

  public String run(
    final String key,
    final Map<String, String> args
  ) throws LuigiError {
    // run template with args
    return get(key).run(args);
  }

  public boolean containsKey(final String key) {
    return strings.containsKey(key);
  }

  public Template get(final String key) throws LuigiError {
    if (!templates.containsKey(key)) {
      // make sure template exists
      if (!strings.containsKey(key))
        throw new UnknownTemplateError(key);

      // create and cache template
      templates.put(key, new Template(strings.get(key), filters));
    }

    // get template
    return templates.get(key);
  }
};
