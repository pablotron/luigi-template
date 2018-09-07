package org.pablotron.luigi.errors;

/**
 * Thrown when an unknown key is encountered while running a
 * template.
 */
public final class UnknownKeyError extends UnknownEntryError {
  /**
   * Create a new UnknownKeyError instance.
   *
   * @param name Unknown key.
   */
  public UnknownKeyError(final String name) {
    super("key", name);
  }
};
