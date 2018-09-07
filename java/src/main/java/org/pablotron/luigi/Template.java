package org.pablotron.luigi;

import java.util.Map;

import org.pablotron.luigi.Parser;
import org.pablotron.luigi.Filter;
import org.pablotron.luigi.errors.LuigiError;
import org.pablotron.luigi.errors.LuigiError;
import org.pablotron.luigi.actions.Action;

/**
 * Template class.
 */
public final class Template {
  /**
   * Luigi template version.
   */
  public static final String VERSION = "0.4.2";

  private final String template;
  private final Action actions[];
  private final Map<String, Filter.Handler> filters;

  /**
   * Create a new template with the given string and filter set.
   *
   * @param template Template string.
   * @param filters Map of filter names to filter handlers.
   */
  public Template(
    final String template,
    final Map<String, Filter.Handler> filters
  ) throws LuigiError {
    this.template = template;
    this.filters = filters;
    this.actions = Parser.parse_template(template);
  }

  /**
   * Create a new template with the given string and the default filter
   * set.
   *
   * @param template Template string.
   */
  public Template(final String template) throws LuigiError {
    this(template, Filter.FILTERS);
  }

  /**
   * Run this template with given arguments, then return the result as a
   * String.
   *
   * @param args Template arguments.
   *
   * @throws UnknownKeyError If a key specified in the template does not exist.
   * @throws UnknownFilterError If a filter specified in the template does not exist.
   * @throws FilterError If a given filter fails.
   */
  public String run(final Map<String, String> args) throws LuigiError {
    final StringBuilder r = new StringBuilder();

    for (Action a: this.actions)
      r.append(a.run(this.filters, args));

    return r.toString();
  }

  /**
   * Run this template with given arguments, and pass each result chunks
   * to the given result handler.
   *
   * @param args Template arguments.
   * @param rh Result handler.
   *
   * @throws UnknownKeyError If a key specified in the template does not exist.
   * @throws UnknownFilterError If a filter specified in the template does not exist.
   * @throws FilterError If a given filter fails.
   */
  public void run(
    final Map<String, String> args,
    final ResultHandler r
  ) throws LuigiError {
    for (Action a: this.actions) {
      r.append(a.run(this.filters, args));
    }
  }

  /**
   * Return the original template string for this Template instance.
   */
  public String toString() {
    return this.template;
  }

  /**
   * Create and run template with given arguments, using the default
   * filter set, then return the result as a String.
   *
   * @param template Template string.
   * @param args Template arguments.
   *
   * @return Template expansion result.
   *
   * @throws UnknownKeyError If a key specified in the template does not exist.
   * @throws UnknownFilterError If a filter specified in the template does not exist.
   * @throws FilterError If a given filter fails.
   */
  public static String run(
    final String template,
    final Map<String, String> args
  ) throws LuigiError {
    return Template.run(template, args, Filter.FILTERS);
  }

  /**
   * Create and run template with given arguments and result handler,
   * using the default filter set.
   *
   * @param template Template string.
   * @param args Template arguments.
   * @param rh Result handler that result chunks are passed to.
   *
   * @throws UnknownKeyError If a key specified in the template does not exist.
   * @throws UnknownFilterError If a filter specified in the template does not exist.
   * @throws FilterError If a given filter fails.
   */
  public static void run(
    final String template,
    final Map<String, String> args,
    final ResultHandler rh
  ) throws LuigiError {
    run(template, args, Filter.FILTERS, rh);
  }

  /**
   * Create and run template with given arguments, and filters, then
   * return the result as a String.
   *
   * @param template Template string.
   * @param args Template arguments.
   * @param filters Template filters.
   *
   * @return Template expansion result.
   *
   * @throws UnknownKeyError If a key specified in the template does not exist.
   * @throws UnknownFilterError If a filter specified in the template does not exist.
   * @throws FilterError If a given filter fails.
   */
  public static String run(
    final String template,
    final Map<String, String> args,
    final Map<String, Filter.Handler> filters
  ) throws LuigiError {
    final Template t = new Template(template, filters);
    return t.run(args);
  }

  /**
   * Create and run template with given arguments, filters, and result
   * handler.
   *
   * @param template Template string.
   * @param args Template arguments.
   * @param filters Template filters.
   * @param rh Result handler that result chunks are passed to.
   *
   * @throws UnknownKeyError If a key specified in the template does not exist.
   * @throws UnknownFilterError If a filter specified in the template does not exist.
   * @throws FilterError If a given filter fails.
   */
  public static void run(
    final String template,
    final Map<String, String> args,
    final Map<String, Filter.Handler> filters,
    final ResultHandler rh
  ) throws LuigiError {
    final Template t = new Template(template, filters);
    t.run(args, rh);
  }
};
