package com.tts.controller;

import com.tts.dto.TtsRequest;
import com.tts.service.TtsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for Text-to-Speech synthesis.
 */
@RestController
@RequestMapping("/api")
public class TtsController {

    private static final Logger log = LoggerFactory.getLogger(TtsController.class);

    private final TtsService ttsService;

    public TtsController(TtsService ttsService) {
        this.ttsService = ttsService;
    }

    /**
     * Returns the currently active TTS engine name.
     * Frontend uses this to decide whether to call /api/tts or use Web Speech API.
     */
    @GetMapping("/tts/engine")
    public ResponseEntity<Map<String, String>> getEngine() {
        return ResponseEntity.ok(Map.of("engine", ttsService.getActiveEngine()));
    }

    /**
     * Synthesizes text to speech and returns the raw MP3 audio stream.
     *
     * @param request body containing text and optional voice settings
     * @return MP3 audio bytes, or 503 if no server-side engine is available
     */
    @PostMapping("/tts")
    public ResponseEntity<?> synthesize(@RequestBody TtsRequest request) {
        try {
            byte[] audio = ttsService.synthesize(request);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"audio.mp3\"")
                    .body(audio);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid TTS request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (UnsupportedOperationException e) {
            log.info("No server TTS engine available, fallback to browser");
            return ResponseEntity.status(503)
                    .body(Map.of("error", e.getMessage(), "fallback", "browser"));
        } catch (Exception e) {
            log.error("TTS synthesis failed", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "TTS synthesis failed: " + e.getMessage()));
        }
    }
}
