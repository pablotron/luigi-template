package org.pablotron.luigi;

import java.util.Map;
import java.util.HashMap;

import org.pablotron.luigi.Filter;
import org.pablotron.luigi.Template;
import org.pablotron.luigi.errors.LuigiError;
import org.pablotron.luigi.errors.UnknownTemplateError;
import org.pablotron.luigi.actions.Action;

/**
 * Template cache.
 */
public final class Cache {
  private final Map<String, String> strings;
  private final Map<String, Filter.Handler> filters;
  private final Map<String, Template> templates = new HashMap<String, Template>();

  /**
   * Create a new Cache instance with the given templates and filters.
   *
   * @param strings Template key to template string map.
   * @param filters Filter key to filter handler map.
   */
  public Cache(
    final Map<String, String> strings,
    final Map<String, Filter.Handler> filters
  ) {
    this.strings = strings;
    this.filters = filters;
  }

  /**
   * Create a new Cache instance with the given template string map and
   * the default filter map.
   *
   * @param strings Template key to template string map.
   */
  public Cache(final Map<String, String> strings) {
    this(strings, Filter.FILTERS);
  }

  /**
   * Run specified template in this cache with the given arguments and
   * return the result as a string.
   *
   * @param key Template key.
   * @param args Template arguments map.
   *
   * @return Result of template run.
   * @throws UnknownTemplateError if the given template does not exist.
   */
  public String run(
    final String key,
    final Map<String, String> args
  ) throws LuigiError {
    // run template with args
    return get(key).run(args);
  }

  /**
   * Run specified template in this cache with the given arguments and
   * pass the expanded chunks to the given result handler.
   *
   * @param key Template key.
   * @param args Template arguments map.
   * @param rh Result handler.
   *
   * @throws UnknownTemplateError if the given template does not exist.
   */
  public void run(
    final String key,
    final Map<String, String> args,
    final ResultHandler rh
  ) throws LuigiError {
    // run template with args and result handler
    get(key).run(args, rh);
  }

  /**
   * Does the given template exist in this cache?
   * if the given template does not exist.
   *
   * @param key Template key
   *
   * @return True if the template exists in this cache, otherwise false.
   */
  public boolean containsKey(final String key) {
    return strings.containsKey(key);
  }

  /**
   * Get specified template from cache, or raise an UnknownTemplateError
   * if the given template does not exist.
   *
   * @param key Template key
   *
   * @return Template instance.
   * @throws UnknownTemplateError if the given template does not exist.
   */
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
