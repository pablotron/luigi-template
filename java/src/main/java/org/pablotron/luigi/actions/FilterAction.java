package org.pablotron.luigi.actions;

import java.util.Map;

import org.pablotron.luigi.actions.Action;
import org.pablotron.luigi.FilterReference;
import org.pablotron.luigi.Filter;
import org.pablotron.luigi.errors.LuigiError;
import org.pablotron.luigi.errors.UnknownFilterError;
import org.pablotron.luigi.errors.UnknownKeyError;

/**
 * Action that expands the given key and applies any specified filters.
 */
public final class FilterAction implements Action {
  /**
   * Value key.
   */
  private final String key;

  /**
   * Array of filters to apply to value.
   */
  private final FilterReference filters[];

  /**
   * Create a new FilterAction.
   *
   * @param key Template run argument key.
   * @param filters Array of filter references.
   */
  public FilterAction(final String key, final FilterReference filters[]) {
    this.key = key;
    this.filters = filters;
  }

  /**
   * Run this filter action and return the result as a string.
   *
   * @param filters Template filters.
   * @param key Template run arguments.
   *
   * @return Action result.
   *
   * @throws LuigiError If an error occured while running this action.
   */
  public String run(
    Map<String, Filter.Handler> filters,
    Map<String, String> args
  ) throws LuigiError {
    // check for key
    if (!args.containsKey(key))
      throw new UnknownKeyError(key);

    // reduce value to result
    String r = args.get(key);
    for (int i = 0, l = this.filters.length; i < l; i++) {
      // get/check filter
      Filter.Handler f = filters.get(this.filters[i].name);
      if (f == null)
        throw new UnknownFilterError(this.filters[i].name);

      // run filter
      r = f.filter(r, this.filters[i].args, args);
    }

    // return result
    return r;
  }
};
