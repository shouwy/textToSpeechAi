package com.tts.service;

import com.tts.dto.TtsRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Orchestrates TTS strategy selection:
 * 1. ElevenLabs (if API key configured)
 * 2. Google TTS (if API key configured)
 * 3. Signals fallback to Web Speech API (frontend)
 */
@Service
public class TtsService {

    private static final Logger log = LoggerFactory.getLogger(TtsService.class);

    private static final int MAX_TEXT_LENGTH = 5000;

    private final ElevenLabsService elevenLabsService;
    private final GoogleTtsService googleTtsService;

    public TtsService(ElevenLabsService elevenLabsService, GoogleTtsService googleTtsService) {
        this.elevenLabsService = elevenLabsService;
        this.googleTtsService = googleTtsService;
    }

    /**
     * Returns the name of the active TTS engine based on configured API keys.
     *
     * @return "elevenlabs", "google", or "browser"
     */
    public String getActiveEngine() {
        if (elevenLabsService.isAvailable()) {
            return "elevenlabs";
        } else if (googleTtsService.isAvailable()) {
            return "google";
        }
        return "browser";
    }

    /**
     * Synthesizes speech for the given text using the best available engine.
     *
     * @param request TTS request containing text and optional voice settings
     * @return raw MP3 audio bytes
     * @throws UnsupportedOperationException if no server-side TTS engine is available
     */
    public byte[] synthesize(TtsRequest request) {
        if (request.getText() == null || request.getText().isBlank()) {
            throw new IllegalArgumentException("Text must not be blank");
        }
        if (request.getText().length() > MAX_TEXT_LENGTH) {
            throw new IllegalArgumentException(
                    "Text exceeds maximum allowed length of " + MAX_TEXT_LENGTH + " characters");
        }

        if (elevenLabsService.isAvailable()) {
            log.info("Using ElevenLabs TTS engine");
            return elevenLabsService.textToSpeech(request.getText(), request.getVoiceId());
        }

        if (googleTtsService.isAvailable()) {
            log.info("Using Google TTS engine");
            return googleTtsService.textToSpeech(request.getText(), null);
        }

        throw new UnsupportedOperationException(
                "No server-side TTS engine configured. Use the browser Web Speech API fallback.");
    }
}
