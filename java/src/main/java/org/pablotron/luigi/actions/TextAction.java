package org.pablotron.luigi.actions;

import java.util.Map;
import org.pablotron.luigi.actions.Action;
import org.pablotron.luigi.Filter;
import org.pablotron.luigi.errors.LuigiError;

public final class TextAction implements Action {
  private final String text;

  public TextAction(final String text) {
    this.text = text;
  }

  public String run(
    final Map<String, Filter.Handler> filters,
    final Map<String, String> args
  ) throws LuigiError {
    return this.text;
  }
};

