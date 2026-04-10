package com.tts.dto;

import lombok.Data;

/**
 * Request DTO for the /api/tts endpoint.
 */
@Data
public class TtsRequest {

    /** Text to synthesize. */
    private String text;

    /** Voice ID to use (ElevenLabs specific). Optional. */
    private String voiceId;
}
