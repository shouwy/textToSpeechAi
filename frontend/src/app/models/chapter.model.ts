/**
 * Represents a chapter extracted from a webnovel URL.
 */
export interface Chapter {
  /** Chapter title */
  title: string;
  /** Array of text paragraphs */
  paragraphs: string[];
  /** URL to the next chapter, null if unavailable */
  nextChapterUrl: string | null;
  /** URL to the previous chapter, null if unavailable */
  previousChapterUrl: string | null;
}

/**
 * Request body for the /api/extract endpoint.
 */
export interface ExtractRequest {
  url: string;
}
