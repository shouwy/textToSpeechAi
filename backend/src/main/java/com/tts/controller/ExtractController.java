package com.tts.controller;

import com.tts.dto.ExtractRequest;
import com.tts.dto.ExtractResponse;
import com.tts.service.ExtractService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

/**
 * REST controller for chapter extraction.
 */
@RestController
@RequestMapping("/api")
public class ExtractController {

    private static final Logger log = LoggerFactory.getLogger(ExtractController.class);

    private final ExtractService extractService;

    public ExtractController(ExtractService extractService) {
        this.extractService = extractService;
    }

    /**
     * Extracts chapter content from the provided URL.
     *
     * @param request body containing the URL to scrape
     * @return structured chapter content
     */
    @PostMapping("/extract")
    public ResponseEntity<?> extract(@RequestBody ExtractRequest request) {
        try {
            ExtractResponse response = extractService.extract(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid extract request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            log.error("Failed to fetch URL: {}", e.getMessage());
            return ResponseEntity.status(502)
                    .body(Map.of("error", "Could not fetch the page: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during extraction", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Unexpected error: " + e.getMessage()));
        }
    }
}
