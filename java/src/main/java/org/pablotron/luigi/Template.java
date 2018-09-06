package org.pablotron.luigi;

import java.util.Map;
import org.pablotron.luigi.Parser;
import org.pablotron.luigi.Filter;
import org.pablotron.luigi.LuigiError;
import org.pablotron.luigi.actions.Action;

public final class Template {
  private static final String VERSION = "0.4.0";

  private final String template;
  private final Action actions[];
  private final Map<String, Filter.Handler> filters;

  public Template(
    final String template,
    final Map<String, Filter.Handler> filters
  ) throws LuigiError {
    this.template = template;
    this.filters = filters;
    this.actions = Parser.parse_template(template);
  }

  public Template(final String template) throws LuigiError {
    this(template, Filter.FILTERS);
  }

  public String run(final Map<String, String> args) throws LuigiError {
    final StringBuilder r = new StringBuilder();

    for (Action a: this.actions)
      r.append(a.run(this.filters, args));

    return r.toString();
  }

  public void run(
    final Map<String, String> args,
    final ResultHandler r
  ) throws LuigiError {
    for (Action a: this.actions) {
      r.append(a.run(this.filters, args));
    }
  }

  public String toString() {
    return this.template;
  }
};
