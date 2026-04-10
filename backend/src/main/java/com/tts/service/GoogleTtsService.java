package com.tts.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for Google Cloud Text-to-Speech API integration.
 * Uses the Google TTS free tier when an API key is configured.
 */
@Service
public class GoogleTtsService {

    private static final Logger log = LoggerFactory.getLogger(GoogleTtsService.class);

    private static final String GOOGLE_TTS_URL =
            "https://texttospeech.googleapis.com/v1/text:synthesize";

    @Value("${google.tts.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public GoogleTtsService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Returns true if a Google TTS API key is configured.
     */
    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank();
    }

    /**
     * Converts text to speech using Google Cloud TTS API.
     *
     * @param text         the text to synthesize
     * @param languageCode BCP-47 language code (e.g. "fr-FR", "en-US")
     * @return raw MP3 audio bytes
     */
    public byte[] textToSpeech(String text, String languageCode) {
        String lang = (languageCode != null && !languageCode.isBlank()) ? languageCode : "fr-FR";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> input = new HashMap<>();
        input.put("text", text);

        Map<String, Object> voice = new HashMap<>();
        voice.put("languageCode", lang);
        voice.put("ssmlGender", "NEUTRAL");

        Map<String, Object> audioConfig = new HashMap<>();
        audioConfig.put("audioEncoding", "MP3");

        Map<String, Object> body = new HashMap<>();
        body.put("input", input);
        body.put("voice", voice);
        body.put("audioConfig", audioConfig);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        String url = UriComponentsBuilder.fromHttpUrl(GOOGLE_TTS_URL)
                .queryParam("key", apiKey)
                .toUriString();

        log.info("Calling Google TTS API with language: {}", lang);

        @SuppressWarnings("unchecked")
        Map<String, String> response = restTemplate.postForObject(url, entity, Map.class);

        if (response == null || !response.containsKey("audioContent")) {
            throw new RuntimeException("Invalid response from Google TTS API");
        }

        return Base64.getDecoder().decode(response.get("audioContent"));
    }
}
