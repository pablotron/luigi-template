package pablotron.luigi;

import java.util.Map;
import java.util.HashMap;

public final class Filter {
  public interface Handler {
    public String filter(String val, String args[], Map<String, String> row);
  };

  public static Map<String, Handler> FILTERS = new HashMap<String, Handler>() {{
    put("null", new Handler() {
      public String filter(String val, String args[], Map<String, String> row) {
        return "";
      }
    });

    put("s", new Handler() {
      public String filter(String val, String args[], Map<String, String> row) {
        int v = Integer.parseInt(val);
        return (v == 1) ? "" : "s";
      }
    });

    put("uc", new Handler() {
      public String filter(String val, String args[], Map<String, String> row) {
        return val.toUpperCase();
      }
    });

    put("lc", new Handler() {
      public String filter(String val, String args[], Map<String, String> row) {
        return val.toLowerCase();
      }
    });

    put("length", new Handler() {
      public String filter(String val, String args[], Map<String, String> row) {
        return Integer.toString(val.length());
      }
    });

    put("trim", new Handler() {
      public String filter(String val, String args[], Map<String, String> row) {
        return val.trim();
      }
    });

    put("h", new Handler() {
      public String filter(String val, String args[], Map<String, String> row) {
        StringBuilder r = new StringBuilder(val.length());

        for (int i = 0, l = val.length(); i < l; i++) {
          char c = val.charAt(i);

          switch (c) {
            case '&':
              r.append("&amp;");
              break;
            case '<':
              r.append("&lt;");
              break;
            case '>':
              r.append("&gt;");
              break;
            case '\'':
              r.append("&apos;");
              break;
            case '"':
              r.append("&quot;");
              break;
            default:
              r.append(c);
          }
        }

        return r.toString();
/* 
 *         return val
 *           .replace("&", "&amp;")
 *           .replace("<", "&lt;")
 *           .replace(">", "&gt;")
 *           .replace("'", "&apos;")
 *           .replace("\"", "&quot;");
 */ 
      }
    });
  }};
};
