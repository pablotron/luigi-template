package org.pablotron.luigi.actions;

import java.util.Map;

import org.pablotron.luigi.Filter;
import org.pablotron.luigi.errors.LuigiError;

/**
 * Parser action.
 */
public interface Action {
  /**
   * Called during template run to expand given action.
   *
   * @param filters Template filters.
   * @param filters Run argument map.
   *
   * @return Action result.
   *
   * @throws LuigiError If an error occurs while running this action.
   */
  public String run(
    Map<String, Filter.Handler> filters,
    Map<String, String> args
  ) throws LuigiError;
};
