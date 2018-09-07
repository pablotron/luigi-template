package org.pablotron.luigi.errors;

/**
 * Thrown when an unknown filter is encountered while running a
 * template.
 */
public final class UnknownFilterError extends UnknownEntryError {
  /**
   * Create a new UnknownFilterError instance.
   *
   * @param name Unknown filter name.
   */
  public UnknownFilterError(final String name) {
    super("filter", name);
  }
};
