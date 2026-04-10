package com.tts.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Service for ElevenLabs Text-to-Speech API integration.
 * Uses the ElevenLabs free tier when an API key is configured.
 */
@Service
public class ElevenLabsService {

    private static final Logger log = LoggerFactory.getLogger(ElevenLabsService.class);

    private static final String ELEVENLABS_API_URL =
            "https://api.elevenlabs.io/v1/text-to-speech/{voiceId}";

    /** Default ElevenLabs voice ID (Rachel – multilingual). */
    private static final String DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

    @Value("${elevenlabs.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public ElevenLabsService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Returns true if an ElevenLabs API key is configured.
     */
    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank();
    }

    /**
     * Converts text to speech using the ElevenLabs API.
     *
     * @param text    the text to synthesize
     * @param voiceId optional ElevenLabs voice ID; defaults to Rachel if blank
     * @return raw MP3 audio bytes
     */
    public byte[] textToSpeech(String text, String voiceId) {
        String selectedVoiceId = (voiceId != null && !voiceId.isBlank()) ? voiceId : DEFAULT_VOICE_ID;

        HttpHeaders headers = new HttpHeaders();
        headers.set("xi-api-key", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", "audio/mpeg");

        Map<String, Object> body = new HashMap<>();
        body.put("text", text);
        body.put("model_id", "eleven_multilingual_v2");

        Map<String, Object> voiceSettings = new HashMap<>();
        voiceSettings.put("stability", 0.5);
        voiceSettings.put("similarity_boost", 0.75);
        body.put("voice_settings", voiceSettings);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        log.info("Calling ElevenLabs TTS API with voice: {}", selectedVoiceId);

        return restTemplate.postForObject(
                ELEVENLABS_API_URL,
                entity,
                byte[].class,
                selectedVoiceId
        );
    }
}
