package org.pablotron.luigi.errors;

/**
 * Base class for all errors raised by this library.
 */
public class LuigiError extends Exception {
  /**
   * Create a new LuigiError instance.
   *
   * @param message Error message.
   */
  public LuigiError(final String message) {
    super(message);
  }
};
