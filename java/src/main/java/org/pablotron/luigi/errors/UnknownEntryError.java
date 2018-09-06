package org.pablotron.luigi.errors;

public class UnknownEntryError extends LuigiError {
  public final String type;
  public final String name;

  public UnknownEntryError(final String type, final String name) {
    super(String.format("unknown %s: %s", type, name));

    this.type = type;
    this.name = name;
  }
};
