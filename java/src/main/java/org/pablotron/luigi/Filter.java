package org.pablotron.luigi;

import java.util.Map;
import java.util.HashMap;
import java.nio.charset.Charset;

import org.pablotron.luigi.errors.FilterError;

public final class Filter {
  public interface Handler {
    public String filter(
      String val,
      String args[],
      Map<String, String> row
    ) throws FilterError;
  };

  protected static byte[] getBytes(final String val, final String args[]) {
    final Charset charset = (args.length > 0) ? Charset.forName(args[0]) :  Charset.defaultCharset();
    return val.getBytes(charset);
  }

  protected static int toUInt(final byte b) {
    return (b < 0) ? (256 + b) : b;
  }

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
        StringBuilder r = new StringBuilder();
        final byte bytes[] = getBytes(val, args);

        for (int i = 0, l = bytes.length; i < l; i++) {
          final byte b = bytes[i];

          switch (b) {
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
            if (b < 32 || b > 126) {
              r.append(String.format("&#%d;", toUInt(b)));
            } else {
              final byte bs[] = {b};
              r.append(new String(bs));
            }
          }
        }

        return r.toString();
      }
    });

    put("u", new Handler() {
      public String filter(String val, String args[], Map<String, String> row) {
        final StringBuilder r = new StringBuilder();
        final byte bytes[] = getBytes(val, args);

        for (int i = 0, l = bytes.length; i < l; i++) {
          final byte b = bytes[i];

          switch (b) {
          case 'A':
          case 'B':
          case 'C':
          case 'D':
          case 'E':
          case 'F':
          case 'G':
          case 'H':
          case 'I':
          case 'J':
          case 'K':
          case 'L':
          case 'M':
          case 'N':
          case 'O':
          case 'P':
          case 'Q':
          case 'R':
          case 'S':
          case 'T':
          case 'U':
          case 'V':
          case 'W':
          case 'X':
          case 'Y':
          case 'Z':
          case 'a':
          case 'b':
          case 'c':
          case 'd':
          case 'e':
          case 'f':
          case 'g':
          case 'h':
          case 'i':
          case 'j':
          case 'k':
          case 'l':
          case 'm':
          case 'n':
          case 'o':
          case 'p':
          case 'q':
          case 'r':
          case 's':
          case 't':
          case 'u':
          case 'v':
          case 'w':
          case 'x':
          case 'y':
          case 'z':
          case '0':
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
          case '-':
          case '_':
          case '.':
          case '~':
            // unreserved character
            final byte bs[] = {b};
            r.append(new String(bs));
            break;
          case ' ':
            r.append("+");
            break;
          default:
            r.append(String.format("%%%02X", toUInt(b)));
          }
        }

        return r.toString();
      }
    });

    put("trim", new Handler() {
      public String filter(String val, String args[], Map<String, String> row) {
        return val.replaceAll("\\A\\s+|\\s+\\Z", "");
      }
    });
  }};
};
