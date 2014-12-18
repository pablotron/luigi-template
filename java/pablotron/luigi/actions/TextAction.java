package pablotron.luigi.actions;

import java.util.Map;
import pablotron.luigi.actions.Action;
import pablotron.luigi.Filter;
import pablotron.luigi.LuigiError;

public final class TextAction implements Action {
  private final String text;

  public TextAction(final String text) {
    this.text = text;
  }

  public String run(
    Map<String, Filter.Handler> filters,
    Map<String, String> args
  ) throws LuigiError {
    return this.text;
  }
};

