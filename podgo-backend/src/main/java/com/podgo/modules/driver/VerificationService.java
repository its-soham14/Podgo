package com.podgo.modules.driver;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class VerificationService {

    private static final Logger log = LoggerFactory.getLogger(VerificationService.class);

    @Value("${google.vision.api-key}")
    private String apiKey;

    @Value("${verification.dev-mode:false}")
    private boolean devMode;

    private final RestTemplate restTemplate = new RestTemplate();

    public String verifyDocumentFromUrl(String imageUrl) {
        if (devMode) {
            log.info("DEV MODE: Skipping Google Vision API call for URL: {}", imageUrl);
            return "DEV_MODE_BYPASS INDIA GOVERNMENT AADHAAR DOB DATE OF BIRTH UNIQUE IDENTIFICATION";
        }
        try {
            String url = "https://vision.googleapis.com/v1/images:annotate?key=" + apiKey;

            Map<String, Object> image = new HashMap<>();
            Map<String, String> source = new HashMap<>();
            source.put("imageUri", imageUrl);
            image.put("source", source);

            Map<String, Object> feature = new HashMap<>();
            feature.put("type", "TEXT_DETECTION");

            Map<String, Object> request = new HashMap<>();
            request.put("image", image);
            request.put("features", List.of(feature));

            Map<String, Object> body = new HashMap<>();
            body.put("requests", List.of(request));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody().toString();
            }
        } catch (Exception e) {
            log.error("Failed to verify document with Google Vision API", e);
        }
        return null;
    }

    public boolean verifyGovernmentId(String responseBody) {
        if (devMode) {
            log.info("DEV MODE: Government ID verification auto-passed");
            return true;
        }
        if (responseBody == null) return false;

        String text = responseBody.toUpperCase();
        int score = 0;
        boolean hasSpecificId = false;

        if (text.contains("INDIA")) score++;
        if (text.contains("GOVERNMENT") || text.contains("GOVT")) score++;
        if (text.contains("DOB") || text.contains("DATE OF BIRTH")) score++;
        if (text.contains("DATE OF ISSUE")) score++;
        if (text.contains("VALID UNTIL")) score++;
        if (text.contains("UNIQUE IDENTIFICATION")) score++;
        if (text.contains("IDENTIFICATION")) score++;
        if (text.contains("REPUBLIC OF INDIA")) score++;
        if (text.contains("MINISTRY OF")) score++;

        if (text.contains("AADHAAR") || text.contains("UIDAI")) { score += 2; hasSpecificId = true; }
        if (text.contains("PAN") || text.contains("INCOME TAX")) { score += 2; hasSpecificId = true; }
        if (text.contains("PASSPORT")) { score += 2; hasSpecificId = true; }
        if (text.contains("VOTER") || text.contains("EPIC")) { score += 2; hasSpecificId = true; }
        if (text.contains("DRIVING LICENCE") || text.contains("DRIVING LICENSE")) { score += 2; hasSpecificId = true; }
        if (text.contains("ELECTION COMMISSION")) { score += 2; hasSpecificId = true; }

        log.info("Government ID verification score: {}, hasSpecificId: {}", score, hasSpecificId);
        return score >= 3 && hasSpecificId;
    }

    public String extractRegistrationNumber(String responseBody) {
        if (devMode) {
            log.info("DEV MODE: Returning mock registration number");
            return "MH12AB1234";
        }
        if (responseBody == null) return null;

        String text = responseBody.toUpperCase();
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(
            "[A-Z]{2}[-\\s]?[0-9]{1,2}[-\\s]?[A-Z]{1,3}[-\\s]?[0-9]{1,4}"
        );
        java.util.regex.Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group().replaceAll("[-\\s]", "");
        }
        return null;
    }

    public boolean verifyDrivingLicence(String responseBody) {
        if (devMode) {
            log.info("DEV MODE: Driving licence verification auto-passed");
            return true;
        }
        if (responseBody == null) return false;

        String text = responseBody.toUpperCase();
        return text.contains("DRIVING LICENCE") ||
               text.contains("DRIVING LICENSE") ||
               text.contains("DL NO") ||
               text.contains("LICENCE NO") ||
               text.contains("LICENSE NO") ||
               text.contains("TRANSPORT") ||
               text.contains("MOTOR VEHICLES ACT");
    }
}
