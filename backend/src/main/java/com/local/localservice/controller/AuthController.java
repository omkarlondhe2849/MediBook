package com.local.localservice.controller;

import com.local.localservice.dao.UserDAO;
import com.local.localservice.model.User;
import com.local.localservice.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private UserDAO userDAO;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        logger.info("POST /auth/login - Login attempt for email: {}", user.getEmail());
        
        try {
            User found = userDAO.findByEmailAndPassword(user.getEmail(), user.getPassword());
            if (found == null) {
                logger.warn("Failed login attempt for email: {}", user.getEmail());
                return ResponseEntity.status(401).body("Invalid credentials");
            }
            
            // Generate JWT token
            String token = jwtUtil.generateToken(found.getId(), found.getEmail(), found.getRole());
            
            // Create response with user data and token
            Map<String, Object> response = new HashMap<>();
            response.put("user", found);
            response.put("token", token);
            
            logger.info("Successful login for user: {} (ID: {})", found.getName(), found.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error during login for email {}: {}", user.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(500).body("Login failed");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        logger.info("POST /auth/register - Registration attempt for email: {}", user.getEmail());
        
        try {
            int rows = userDAO.save(user);
            if (rows > 0) {
                logger.info("User registered successfully: {} ({})", user.getName(), user.getEmail());
                
                // Find the newly created user to get the ID
                User createdUser = userDAO.findByEmail(user.getEmail());
                if (createdUser != null) {
                    // Generate JWT token
                    String token = jwtUtil.generateToken(createdUser.getId(), createdUser.getEmail(), createdUser.getRole());
                    
                    // Create response with user data and token
                    Map<String, Object> response = new HashMap<>();
                    response.put("message", "User registered successfully");
                    response.put("user", createdUser);
                    response.put("token", token);
                    
                    return ResponseEntity.ok(response);
                }
                return ResponseEntity.ok("User registered successfully");
            } else {
                logger.error("Failed to register user: {}", user.getEmail());
                return ResponseEntity.status(500).body("Registration failed");
            }
        } catch (Exception e) {
            logger.error("Error during registration for email {}: {}", user.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(500).body("Registration failed");
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody User user) {
        logger.info("POST /auth/forgot-password - Forgot password for email: {}", user.getEmail());
        try {
            User found = userDAO.findByEmail(user.getEmail());
            if (found == null) {
                // Don't reveal if user exists
                return ResponseEntity.ok().build();
            }
            String token = UUID.randomUUID().toString();
            String expiry = LocalDateTime.now().plusMinutes(30)
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            userDAO.updateResetToken(user.getEmail(), token, expiry);
            // Send token via HTML email
            try {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setTo(user.getEmail());
                helper.setSubject("Password Reset Request - Local Service");
                String html = "" +
                    "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;border-radius:8px;overflow:hidden;'>" +
                    "<div style='background:#2563eb;color:#fff;padding:18px 24px;font-size:1.3em;font-weight:bold;'>Local Service - Password Reset</div>" +
                    "<div style='padding:24px;'>" +
                    "<p>Dear <b>" + found.getName() + "</b>,</p>" +
                    "<p>We received a request to reset your password for your Local Service account.</p>" +
                    "<h3 style='margin-top:32px;margin-bottom:10px;color:#2563eb;'>Your Password Reset Token</h3>" +
                    "<div style='background:#f8fafc;border:2px solid #2563eb;border-radius:8px;padding:20px;text-align:center;margin:20px 0;'>" +
                    "<div style='font-size:1.8em;font-weight:bold;letter-spacing:3px;color:#2563eb;font-family:monospace;'>" + token + "</div>" +
                    "</div>" +
                    "<p style='color:#dc2626;font-weight:bold;'>⏰ This token will expire in 30 minutes.</p>" +
                    "<p>To reset your password:</p>" +
                    "<ol style='color:#555;'>" +
                    "<li>Go to the password reset page</li>" +
                    "<li>Enter this token exactly as shown above</li>" +
                    "<li>Create your new password</li>" +
                    "</ol>" +
                    "<p style='color:#555;margin-top:24px;'>If you didn't request this password reset, please ignore this email. Your account remains secure.</p>" +
                    "<hr style='margin:32px 0;border:none;border-top:1px solid #eee;'>" +
                    "<p style='color:#888;font-size:0.95em;'>If you have any questions or need assistance, please contact our support team.<br>Thank you for using Local Service!</p>" +
                    "<div style='color:#2563eb;font-weight:bold;margin-top:18px;'>The Local Service Team</div>" +
                    "</div></div>";
                helper.setText(html, true);
                mailSender.send(mimeMessage);
            } catch (Exception e) {
                logger.error("Failed to send HTML password reset email: {}", e.getMessage(), e);
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error in forgot password: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to send reset email");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        String newPassword = payload.get("password");
        logger.info("POST /auth/reset-password - Reset with token: {}", token);
        try {
            User user = userDAO.findByResetToken(token);
            if (user == null || user.getResetTokenExpiry() == null) {
                return ResponseEntity.status(400).body("Invalid or expired token");
            }
            LocalDateTime expiry = LocalDateTime.parse(user.getResetTokenExpiry(), DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            if (LocalDateTime.now().isAfter(expiry)) {
                return ResponseEntity.status(400).body("Token expired");
            }
            userDAO.updatePasswordByEmail(user.getEmail(), newPassword);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error in reset password: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to reset password");
        }
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody User user) {
        logger.info("PUT /users/{} - Updating user profile", userId);
        try {
            user.setId(userId); // Ensure the ID from the path is used
            int rows = userDAO.update(user);
            if (rows > 0) {
                User updatedUser = userDAO.findById(userId);
                logger.info("User profile updated successfully for ID: {}", userId);
                return ResponseEntity.ok(updatedUser);
            } else {
                logger.warn("No user found with ID {} for update", userId);
                return ResponseEntity.status(404).body("User not found");
            }
        } catch (Exception e) {
            logger.error("Error updating user profile for ID {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to update user profile");
        }
    }
}
