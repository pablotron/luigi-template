package pablotron.luigi;

import java.util.Map;
import pablotron.luigi.Parser;
import pablotron.luigi.Filter;
import pablotron.luigi.LuigiError;
import pablotron.luigi.actions.Action;

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

  public String run(Map<String, String> args) throws LuigiError {
    StringBuilder r = new StringBuilder();

    for (Action a: this.actions)
      r.append(a.run(this.filters, args));

    return r.toString();
  }
};
