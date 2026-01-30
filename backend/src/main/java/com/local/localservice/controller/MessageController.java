package com.local.localservice.controller;

import com.local.localservice.dao.MessageDAO;
import com.local.localservice.dao.UserDAO;
import com.local.localservice.model.Message;
import com.local.localservice.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:3030")
public class MessageController {

    @Autowired
    private MessageDAO messageDAO;

    @Autowired
    private UserDAO userDAO;

    @Autowired
    private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Message message) {
        try {
            if (message.getSenderId() == null || message.getReceiverId() == null || message.getContent() == null) {
                return ResponseEntity.badRequest().body("Missing required fields");
            }
            message.setSentAt(java.time.LocalDateTime.now());
            message.setRead(false);

            messageDAO.createMessage(message);
            
            // Broadcast to receiver
            messagingTemplate.convertAndSend("/topic/messages/" + message.getReceiverId(), message);
            // Broadcast to sender (for syncing other tabs/devices)
            messagingTemplate.convertAndSend("/topic/messages/" + message.getSenderId(), message);

            return ResponseEntity.ok("Message sent successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to send message");
        }
    }

    @GetMapping("/history/{userId1}/{userId2}")
    public List<Message> getChatHistory(@PathVariable Long userId1, @PathVariable Long userId2) {
        return messageDAO.findConversation(userId1, userId2);
    }

    @GetMapping("/conversations/{userId}")
    public List<Map<String, Object>> getConversations(@PathVariable Long userId) {
        return messageDAO.findRecentConversations(userId);
    }
}
