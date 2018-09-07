package org.pablotron.luigi;

/**
 * Internal filter reference used during template parsing.
 */
public final class FilterReference {
  /**
   * Filter name.
   */
  public final String name;

  /**
   * Array of filter arguments.
   */
  public final String[] args;

  /**
   * Create a new FilterReference with the given name and argument list.
   */
  protected FilterReference(final String name, final String args[]) {
    this.name = name;
    this.args = args;
  }
};
