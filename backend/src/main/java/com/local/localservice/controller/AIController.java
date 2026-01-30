package com.local.localservice.controller;

import com.local.localservice.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*") // Allow frontend access
public class AIController {

    @Autowired
    private AIService aiService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, Object> payload) {
        String message = (String) payload.get("message");
        List<Map<String, String>> history = (List<Map<String, String>>) payload.get("history");

        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("response", "Please provide a message."));
        }

        String aiResponse = aiService.getRecommendation(message, history);
        
        Map<String, String> response = new HashMap<>();
        response.put("response", aiResponse);
        
        return ResponseEntity.ok(response);
    }
}
