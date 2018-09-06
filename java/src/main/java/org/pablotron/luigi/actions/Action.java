package org.pablotron.luigi.actions;

import java.util.Map;
import org.pablotron.luigi.Filter;
import org.pablotron.luigi.LuigiError;

public interface Action {
  public String run(
    Map<String, Filter.Handler> filters, 
    Map<String, String> args
  ) throws LuigiError;
};
