package com.local.localservice.service;

import com.local.localservice.dao.ServiceDAO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AIService {

    private static final Logger logger = LoggerFactory.getLogger(AIService.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ServiceDAO serviceDAO;

    public String getRecommendation(String userQuery, List<Map<String, String>> history) {
        try {
            // 1. Optimize Context: Limit to top 15 verified doctors and truncate bio
            List<com.local.localservice.model.Service> services = serviceDAO.findAll();

            String doctorContext = services.stream()
                    .filter(com.local.localservice.model.Service::isVerified)
                    .sorted(Comparator.comparing(com.local.localservice.model.Service::getExperienceYears, Comparator.nullsFirst(Comparator.naturalOrder())).reversed())
                    .limit(15) // Limit context size
                    .map(s -> {
                        String shortBio = (s.getDescription() != null && s.getDescription().length() > 100) 
                                ? s.getDescription().substring(0, 100) + "..." 
                                : s.getDescription();
                        return String.format("- Dr. %s (%s, %s) $%s. %s",
                                s.getTitle(), s.getCategory(), s.getLocation(), s.getPrice(), shortBio);
                    })
                    .collect(Collectors.joining("\n"));

            // 2. Build History String
            StringBuilder historyBuilder = new StringBuilder();
            if (history != null && !history.isEmpty()) {
                historyBuilder.append("Current Conversation:\n");
                for (Map<String, String> msg : history) {
                    String role = msg.get("role");
                    String content = msg.get("content");
                    if (role != null && content != null) {
                         // Truncate history messages to save tokens
                        if (content.length() > 200) content = content.substring(0, 200) + "...";
                        historyBuilder.append(role.equals("user") ? "User: " : "Assistant: ").append(content).append("\n");
                    }
                }
            }

            String systemPrompt = "Role: Medical Assistant for 'MediBook'.\n" +
                    "Task: Recommend doctors from list below. Answer medical queries generally. Be concise.\n" +
                    "Doctors:\n" + doctorContext + "\n\n" +
                    historyBuilder.toString() + 
                    "User: " + userQuery + "\nAssistant:";


            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> contentPart = new HashMap<>();
            contentPart.put("text", systemPrompt);
            
            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(contentPart));
            
            requestBody.put("contents", List.of(content));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            String url = apiUrl + "?key=" + apiKey;
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> contentRes = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) contentRes.get("parts");
                    if (!parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
            return "I couldn't process that. Please try again.";

        } catch (org.springframework.web.client.HttpClientErrorException.TooManyRequests e) {
            logger.warn("Gemini Quota Exceeded: " + e.getMessage());
            return "I'm currently overloaded with requests (Rate Limit Reached). Please wait 30 seconds and try again.";
        } catch (Exception e) {
            logger.error("Error calling Gemini API", e);
            return "I'm having connection issues. Please try again later.";
        }
    }
}
