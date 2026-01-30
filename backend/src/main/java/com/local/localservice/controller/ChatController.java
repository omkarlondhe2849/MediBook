package com.local.localservice.controller;

import com.local.localservice.dao.MessageDAO;
import com.local.localservice.model.Message;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:3030")
public class ChatController {

    private final MessageDAO messageDAO;

    public ChatController(MessageDAO messageDAO) {
        this.messageDAO = messageDAO;
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> payload) {
        try {
            Message message = new Message();
            message.setSenderId(Long.valueOf(payload.get("senderId").toString()));
            message.setReceiverId(Long.valueOf(payload.get("receiverId").toString()));
            message.setContent(payload.get("content").toString());
            
            messageDAO.createMessage(message);
            return ResponseEntity.ok("Message sent successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error sending message: " + e.getMessage());
        }
    }

    @GetMapping("/conversation/{user1Id}/{user2Id}")
    public List<Message> getConversation(@PathVariable Long user1Id, @PathVariable Long user2Id) {
        return messageDAO.findConversation(user1Id, user2Id);
    }

    @PutMapping("/mark-read/{messageId}")
    public ResponseEntity<?> markAsRead(@PathVariable Long messageId) {
        int rows = messageDAO.markAsRead(messageId);
        if (rows > 0) {
            return ResponseEntity.ok("Message marked as read");
        } else {
            return ResponseEntity.badRequest().body("Error marking message as read");
        }
    }
}
