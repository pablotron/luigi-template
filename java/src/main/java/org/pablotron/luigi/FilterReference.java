package org.pablotron.luigi;

public final class FilterReference {
  public final String name;
  public final String[] args;

  public FilterReference(final String name, final String args[]) {
    this.name = name;
    this.args = args;
  }
};
