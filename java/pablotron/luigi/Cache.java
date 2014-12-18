package pablotron.luigi;

import java.util.Map;
import java.util.HashMap;
import pablotron.luigi.Filter;
import pablotron.luigi.Template;
import pablotron.luigi.LuigiError;
import pablotron.luigi.actions.Action;

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
    Template t;

    if (templates.containsKey(key)) {
      // get template
      t = templates.get(key);
    } else {
      // make sure template exists
      if (!strings.containsKey(key))
        throw new LuigiError("unknown template: " + key);

      // create template
      t = new Template(strings.get(key), filters);

      // cache template
      templates.put(key, t);
    }

    // run template with args
    return t.run(args);
  }
};
