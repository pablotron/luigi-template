package org.pablotron.luigi.errors;

/**
 * Thrown when an unknown template is requested from a Cache.
 */
public class UnknownTemplateError extends UnknownEntryError {
  /**
   * Create a new UnknownTemplateError instance.
   *
   * @param name Unknown template name.
   */
  public UnknownTemplateError(final String name) {
    super("template", name);
  }
};
