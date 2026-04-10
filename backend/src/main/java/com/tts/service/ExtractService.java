package com.tts.service;

import com.tts.dto.ExtractRequest;
import com.tts.dto.ExtractResponse;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

/**
 * Service responsible for extracting chapter content from a given URL using Jsoup.
 */
@Service
public class ExtractService {

    private static final Logger log = LoggerFactory.getLogger(ExtractService.class);

    @Value("${jsoup.timeout:10000}")
    private int jsoupTimeout;

    @Value("${jsoup.max-text-length:100000}")
    private int maxTextLength;

    /**
     * Validates that the provided URL is well-formed and uses http/https.
     *
     * @param url the URL string to validate
     * @throws IllegalArgumentException if the URL is invalid or uses a disallowed protocol
     */
    private void validateUrl(String url) {
        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException("URL must not be blank");
        }
        try {
            URL parsedUrl = new URL(url);
            String protocol = parsedUrl.getProtocol();
            if (!"http".equals(protocol) && !"https".equals(protocol)) {
                throw new IllegalArgumentException("Only http and https URLs are allowed");
            }
        } catch (MalformedURLException e) {
            throw new IllegalArgumentException("Invalid URL: " + url);
        }
    }

    /**
     * Fetches and parses the chapter at the given URL.
     *
     * @param request the extract request containing the URL
     * @return structured chapter content
     * @throws IOException if the page cannot be fetched
     */
    public ExtractResponse extract(ExtractRequest request) throws IOException {
        validateUrl(request.getUrl());

        log.info("Extracting content from URL: {}", request.getUrl());

        Document doc = Jsoup.connect(request.getUrl())
                .timeout(jsoupTimeout)
                .userAgent("Mozilla/5.0 (compatible; WebNovelReader/1.0)")
                .get();

        String title = extractTitle(doc);
        List<String> paragraphs = extractParagraphs(doc);
        String nextChapterUrl = extractNextChapterUrl(doc, request.getUrl());
        String previousChapterUrl = extractPreviousChapterUrl(doc, request.getUrl());

        return ExtractResponse.builder()
                .title(title)
                .paragraphs(paragraphs)
                .nextChapterUrl(nextChapterUrl)
                .previousChapterUrl(previousChapterUrl)
                .build();
    }

    /**
     * Extracts the page title from the document.
     */
    private String extractTitle(Document doc) {
        // Try common chapter title selectors
        String[] titleSelectors = {
                "h1.chapter-title", "h1.entry-title", ".chapter-title h1",
                "h1", ".title", "title"
        };
        for (String selector : titleSelectors) {
            Element el = doc.selectFirst(selector);
            if (el != null && !el.text().isBlank()) {
                return el.text().trim();
            }
        }
        return doc.title();
    }

    /**
     * Extracts main content paragraphs from the document.
     * Tries common content area selectors and falls back to all paragraphs.
     */
    private List<String> extractParagraphs(Document doc) {
        // Remove navigation, header, footer, sidebar, ads
        doc.select("nav, header, footer, aside, script, style, .ads, .advertisement, "
                + "#comments, .comments, .nav-links, .navigation, .chapter-nav, "
                + ".prev-next, .social-share, [class*='share'], [class*='social'], "
                + "[id*='disqus'], [class*='sidebar']").remove();

        // Try common content selectors for webnovel sites
        String[] contentSelectors = {
                ".chapter-content", "#chapter-content", ".entry-content",
                ".post-content", "#content", ".content", "article", ".chapter",
                "#chapter", ".text-content", ".novel-content"
        };

        Elements paragraphs = null;
        for (String selector : contentSelectors) {
            Element container = doc.selectFirst(selector);
            if (container != null) {
                paragraphs = container.select("p");
                if (!paragraphs.isEmpty()) {
                    break;
                }
            }
        }

        // Fallback: all paragraphs in body
        if (paragraphs == null || paragraphs.isEmpty()) {
            paragraphs = doc.body().select("p");
        }

        List<String> result = new ArrayList<>();
        int totalLength = 0;

        for (Element p : paragraphs) {
            String text = p.text().trim();
            if (text.length() < 2) {
                continue; // skip nearly-empty paragraphs
            }
            if (totalLength + text.length() > maxTextLength) {
                log.warn("Text length limit reached, truncating content");
                break;
            }
            result.add(text);
            totalLength += text.length();
        }

        return result;
    }

    /**
     * Attempts to find the next chapter URL from navigation links.
     */
    private String extractNextChapterUrl(Document doc, String baseUrl) {
        String[] nextSelectors = {
                "a[rel='next']", ".next-chapter a", ".nav-next a",
                "a:contains(Next Chapter)", "a:contains(Chapitre suivant)",
                "a:contains(Suivant)", "a[class*='next']", ".next a",
                "a:contains(next)", "a:contains(→)"
        };
        return findNavigationUrl(doc, baseUrl, nextSelectors);
    }

    /**
     * Attempts to find the previous chapter URL from navigation links.
     */
    private String extractPreviousChapterUrl(Document doc, String baseUrl) {
        String[] prevSelectors = {
                "a[rel='prev']", ".prev-chapter a", ".nav-prev a",
                "a:contains(Previous Chapter)", "a:contains(Chapitre précédent)",
                "a:contains(Précédent)", "a[class*='prev']", ".prev a",
                "a:contains(previous)", "a:contains(←)"
        };
        return findNavigationUrl(doc, baseUrl, prevSelectors);
    }

    /**
     * Finds a navigation URL from the document using the provided selectors.
     *
     * @param doc       the parsed document
     * @param baseUrl   the base URL for resolving relative links
     * @param selectors CSS selectors to try
     * @return absolute URL or null if not found
     */
    private String findNavigationUrl(Document doc, String baseUrl, String[] selectors) {
        for (String selector : selectors) {
            try {
                Element el = doc.selectFirst(selector);
                if (el != null) {
                    String href = el.absUrl("href");
                    if (!href.isBlank()) {
                        return href;
                    }
                }
            } catch (Exception e) {
                log.debug("Selector '{}' failed: {}", selector, e.getMessage());
            }
        }
        return null;
    }
}
