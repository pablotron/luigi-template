package org.pablotron.luigi;

/**
 * Result handler for streamed results from template runs.
 */
public interface ResultHandler {
  /**
   * Called during template run with each chunk of the result.
   *
   * @param chunk Chunk of result.
   */
  public abstract void append(final String chunk);
};
