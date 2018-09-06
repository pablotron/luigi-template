package org.pablotron.luigi.errors;

public class UnknownKeyError extends UnknownEntryError {
  public UnknownKeyError(final String name) {
    super("key", name);
  }
};
