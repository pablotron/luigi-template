package org.pablotron.luigi.tests;

import java.io.IOException;

public final class TestResultHandler implements Appendable {
  private final StringBuilder sb;

  public TestResultHandler(final StringBuilder sb) {
    this.sb = sb;
  }

  public Appendable append(final char c) throws IOException {
    sb.append(c);
		return this;
  }

  public Appendable append(final CharSequence s) throws IOException {
    sb.append(s);
		return this;
  }

  public Appendable append(
    final CharSequence s,
    final int start,
    final int end
  ) throws IOException {
    sb.append(s, start, end);
		return this;
  }
};
