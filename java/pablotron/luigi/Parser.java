package pablotron.luigi;

import java.util.ArrayList;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

import pablotron.luigi.actions.Action;
import pablotron.luigi.actions.FilterAction;
import pablotron.luigi.actions.TextAction;
import pablotron.luigi.FilterReference;
import pablotron.luigi.LuigiError;

public final class Parser {
  private static final Pattern RE_ACTION = Pattern.compile(
    // match opening brace
    "%\\{" + 
      
      // match optional whitespace
      "\\s*" + 

      // match key
      // "(?<key>[^\\s\\|\\}]+)" +
      "([^\\s\\|\\}]+)" +

      // match filter(s)
      // "(?<filters>(\\s*\\|(\\s*[^\\s\\|\\}]+)+)*)" +
      "((\\s*\\|(\\s*[^\\s\\|\\}]+)+)*)" +

      // match optional whitespace
      "\\s*" +
    
    // match closing brace
    "\\}" +
    
    // or match up all non-% chars or a single % char
    // "| (?<text>[^%]* | %)",
    "| ([^%]* | %)",

    Pattern.COMMENTS
  );

  private static final Pattern RE_FILTER = Pattern.compile(
    // match filter name
    // "(?<name>\\S+)" +
    "(\\S+)" +
  
    // match filter arguments (optional)
    // "(?<args>(\\s*\\S+)*)" +
    "((\\s*\\S+)*)" +
  
    // optional trailing whitespace
    "\\s*",

    Pattern.COMMENTS
  );

  private static final Pattern RE_DELIM_FILTERS = Pattern.compile(
    "\\s*\\|\\s*"
  );

  private static final Pattern RE_DELIM_ARGS = Pattern.compile(
    "\\s+"
  );

  public static Action[] parse_template(
    String template
  ) throws LuigiError {
    ArrayList<Action> r = new ArrayList<Action>();

    // match on text
    final Matcher m = RE_ACTION.matcher(template);

    while (m.find()) {
      // String key = m.group("key");
      String key = m.group(1);
      
      if (key != null && key.length() > 0) {
        // r.add(new FilterAction(key, parse_filters(m.group("filters"))));
        r.add(new FilterAction(key, parse_filters(m.group(2))));
      } else {
        // r.add(new TextAction(m.group("text")));
        r.add(new TextAction(m.group(5)));
      }
    }

    // build array of results
    return r.toArray(new Action[r.size()]);
  }

  public static FilterReference[] parse_filters(
    String filters_str
  ) throws LuigiError {
    ArrayList<FilterReference> r = new ArrayList<FilterReference>();

    // split string into individual filters and handle each one
    for (String f: RE_DELIM_FILTERS.split(filters_str)) {
      // trim filter string and skip empty filters
      f = f.trim();
      if (f.length() == 0)
        continue;

      // match on filter and check for error
      Matcher m = RE_FILTER.matcher(f);
      if (!m.find())
        throw new LuigiError("invalid filter: " + f);

      // append new filter reference to result
      r.add(new FilterReference(m.group(1), RE_DELIM_ARGS.split(m.group(2))));
    }

    // return result
    return r.toArray(new FilterReference[r.size()]);
  }
};
