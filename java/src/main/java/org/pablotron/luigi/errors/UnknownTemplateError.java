package org.pablotron.luigi.errors;

public class UnknownTemplateError extends UnknownEntryError {
  public UnknownTemplateError(final String name) {
    super("template", name);
  }
};
