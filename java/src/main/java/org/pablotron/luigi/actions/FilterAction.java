package org.pablotron.luigi.actions;

import java.util.Map;
import org.pablotron.luigi.actions.Action;
import org.pablotron.luigi.FilterReference;
import org.pablotron.luigi.Filter;
import org.pablotron.luigi.LuigiError;
import org.pablotron.luigi.UnknownFilterError;
import org.pablotron.luigi.UnknownKeyError;

public final class FilterAction implements Action {
  private final String key;
  private final FilterReference filters[];

  public FilterAction(final String key, final FilterReference filters[]) {
    this.key = key;
    this.filters = filters;
  }

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
