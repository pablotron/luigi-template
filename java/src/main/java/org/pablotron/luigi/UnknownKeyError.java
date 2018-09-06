package org.pablotron.luigi;

public class UnknownKeyError extends UnknownEntryError {
  public UnknownKeyError(final String name) {
    super("key", name);
  }
};
