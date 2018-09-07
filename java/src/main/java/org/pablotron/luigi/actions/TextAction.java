package org.pablotron.luigi.actions;

import java.util.Map;

import org.pablotron.luigi.actions.Action;
import org.pablotron.luigi.Filter;
import org.pablotron.luigi.errors.LuigiError;

/**
 * Action that returns a text literal.
 */
public final class TextAction implements Action {
  /**
   * Text literal.
   */
  private final String text;

  /**
   * Create a new text action with the given text.
   *
   * @param text Text literal.
   */
  public TextAction(final String text) {
    this.text = text;
  }

  /**
   * Run action and return text literal.
   *
   * @param filters Template filters (ignored).
   * @param key Template run arguments (ignored).
   *
   * @return Text literal.
   *
   * @throws LuigiError If an error occured while running this action.
   */
  public String run(
    final Map<String, Filter.Handler> filters,
    final Map<String, String> args
  ) throws LuigiError {
    return this.text;
  }
};

