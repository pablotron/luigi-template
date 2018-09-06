package org.pablotron.luigi.errors;

public class UnknownFilterError extends UnknownEntryError {
  public UnknownFilterError(final String name) {
    super("filter", name);
  }
};
