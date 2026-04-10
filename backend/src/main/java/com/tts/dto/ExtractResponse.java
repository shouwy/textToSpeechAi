package com.tts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for the /api/extract endpoint.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtractResponse {

    /** Chapter title extracted from the page. */
    private String title;

    /** List of text paragraphs from the chapter. */
    private List<String> paragraphs;

    /** URL of the next chapter, or null if not found. */
    private String nextChapterUrl;

    /** URL of the previous chapter, or null if not found. */
    private String previousChapterUrl;
}
