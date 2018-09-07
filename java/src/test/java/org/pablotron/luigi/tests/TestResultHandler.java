package org.pablotron.luigi.tests;

import org.pablotron.luigi.ResultHandler;

public final class TestResultHandler implements ResultHandler {
  private final StringBuilder sb;

  public TestResultHandler(final StringBuilder sb) {
    this.sb = sb;
  }

  public void append(final String s) {
    sb.append(s);
  }
};
