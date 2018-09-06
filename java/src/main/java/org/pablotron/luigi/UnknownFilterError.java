package org.pablotron.luigi;

public class UnknownFilterError extends UnknownEntryError {
  public UnknownFilterError(final String name) {
    super("filter", name);
  }
};
