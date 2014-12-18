package pablotron.luigi.actions;

import java.util.Map;
import pablotron.luigi.Filter;
import pablotron.luigi.LuigiError;

public interface Action {
  public String run(
    Map<String, Filter.Handler> filters, 
    Map<String, String> args
  ) throws LuigiError;
};
