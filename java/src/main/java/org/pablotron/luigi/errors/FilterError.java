package org.pablotron.luigi.errors;

/**
 * Wrapper for errors that occur during a Filter.Handler invocation.
 */
public class FilterError extends LuigiError {
  /**
   * Wrapper for errors that occur during a Filter.Handler invocation.
   *
   * @param message Error message.
   */
  public FilterError(final String message) {
    super(message);
  }
};
