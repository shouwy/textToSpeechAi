package com.tts.service;

import com.tts.dto.ExtractRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for ExtractService URL validation.
 */
@SpringBootTest
class ExtractServiceTest {

    @Autowired
    private ExtractService extractService;

    @Test
    void extract_withBlankUrl_throwsIllegalArgumentException() {
        ExtractRequest request = new ExtractRequest();
        request.setUrl("");

        assertThatThrownBy(() -> extractService.extract(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("blank");
    }

    @Test
    void extract_withInvalidUrl_throwsIllegalArgumentException() {
        ExtractRequest request = new ExtractRequest();
        request.setUrl("not-a-url");

        assertThatThrownBy(() -> extractService.extract(request))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void extract_withFileProtocolUrl_throwsIllegalArgumentException() {
        ExtractRequest request = new ExtractRequest();
        request.setUrl("file:///etc/passwd");

        assertThatThrownBy(() -> extractService.extract(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("http");
    }
}
