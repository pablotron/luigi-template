package org.pablotron.luigi;

import java.util.ArrayList;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

import org.pablotron.luigi.actions.Action;
import org.pablotron.luigi.actions.FilterAction;
import org.pablotron.luigi.actions.TextAction;
import org.pablotron.luigi.FilterReference;
import org.pablotron.luigi.errors.LuigiError;

/**
 * Internal template string parser.
 */
public final class Parser {
  /**
   * Template string parsing regular expression.
   */
  private static final Pattern RE_ACTION = Pattern.compile(
    // match opening brace
    "%\\{" +

      // match optional whitespace
      "\\s*" +

      // match key
      // "(?<key>[^\\s\\|\\}]+)" +
      "([^\\s\\|\\}]+)" +

      // match filter(s)
      // "(?<filters>(\\s*\\|(\\s*[^\\s\\|\\}]+)+)*)" +
      "((\\s*\\|(\\s*[^\\s\\|\\}]+)+)*)" +

      // match optional whitespace
      "\\s*" +

    // match closing brace
    "\\}" +

    // or match up all non-% chars or a single % char
    // "| (?<text>[^%]* | %)",
    "| ([^%]* | %)",

    Pattern.COMMENTS
  );

  /**
   * Filter string parsing regular expression.
   */
  private static final Pattern RE_FILTER = Pattern.compile(
    // match filter name
    // "(?<name>\\S+)" +
    "(\\S+)" +

    // match filter arguments (optional)
    // "(?<args>(\\s*\\S+)*)" +
    "((\\s*\\S+)*)" +

    // optional trailing whitespace
    "\\s*",

    Pattern.COMMENTS
  );

  /**
   * Filter chain delimiter.
   */
  private static final Pattern RE_DELIM_FILTERS = Pattern.compile(
    "\\s*\\|\\s*"
  );

  /**
   * Filter arguments delimiter.
   */
  private static final Pattern RE_DELIM_ARGS = Pattern.compile(
    "\\s+"
  );

  /**
   * Parse given template string into an array of actions.
   *
   * @param template Template string.
   *
   * @return Array of actions.
   *
   * @throws LuigiError If parsing fails.
   */
  protected static Action[] parse_template(
    final String template
  ) throws LuigiError {
    final ArrayList<Action> r = new ArrayList<Action>();

    // match on text
    final Matcher m = RE_ACTION.matcher(template);

    while (m.find()) {
      // String key = m.group("key");
      final String key = m.group(1);

      if (key != null && key.length() > 0) {
        // r.add(new FilterAction(key, parse_filters(m.group("filters"))));
        r.add(new FilterAction(key, parse_filters(m.group(2))));
      } else {
        // r.add(new TextAction(m.group("text")));
        r.add(new TextAction(m.group(5)));
      }
    }

    // build array of results
    return r.toArray(new Action[r.size()]);
  }

  private static final String[] NO_ARGS = {};

  /**
   * Parse given filter string into an array of filter references.
   *
   * @param filters_str Filter chain string.
   *
   * @return Array of FilterReferences.
   *
   * @throws LuigiError If parsing fails.
   */
  protected static FilterReference[] parse_filters(
    final String filters_str
  ) throws LuigiError {
    final ArrayList<FilterReference> r = new ArrayList<FilterReference>();

    // split string into individual filters and handle each one
    for (String f: RE_DELIM_FILTERS.split(filters_str)) {
      // trim filter string and skip empty filters
      f = f.trim();
      if (f.length() == 0)
        continue;

      // match on filter and check for error
      final Matcher m = RE_FILTER.matcher(f);
      if (!m.find())
        throw new LuigiError("invalid filter: " + f);

      // get arguments string
      final String args = m.group(2).trim();

      // append new filter reference to result
      r.add(new FilterReference(
        m.group(1),
        (args.length() > 0) ? RE_DELIM_ARGS.split(args) : NO_ARGS
      ));
    }

    // return result
    return r.toArray(new FilterReference[r.size()]);
  }
};
