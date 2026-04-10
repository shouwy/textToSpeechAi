package com.tts.dto;

import lombok.Data;

/**
 * Request DTO for the /api/extract endpoint.
 */
@Data
public class ExtractRequest {

    /** URL of the chapter to extract. */
    private String url;
}
