package org.pablotron.luigi.errors;

/**
 * Base class for all unknown entry errors raised by this library.
 */
public abstract class UnknownEntryError extends LuigiError {
  /**
   * Entry type (e.g. "template", "key", or "filter").
   */
  public final String type;

  /**
   * Entry name.
   */
  public final String name;

  /**
   * This is an abstract class and cannot be instantiated directly.
   *
   * @param type Entry type ("template", "key", or "filter").
   * @param name Entry name.
   */
  public UnknownEntryError(final String type, final String name) {
    super(String.format("unknown %s: %s", type, name));

    this.type = type;
    this.name = name;
  }
};
