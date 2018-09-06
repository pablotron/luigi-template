package org.pablotron.luigi;

public class UnknownTemplateError extends UnknownEntryError {
  public UnknownTemplateError(final String name) {
    super("template", name);
  }
};
