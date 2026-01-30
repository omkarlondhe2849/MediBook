package com.local.localservice.controller;

import com.local.localservice.dao.UserDAO;
import com.local.localservice.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private static final String UPLOAD_DIR = "uploads/profiles";

    @Autowired
    private UserDAO userDAO;

    @GetMapping("/stats")
    public ResponseEntity<?> getPublicStats() {
        return ResponseEntity.ok(java.util.Map.of(
            "doctors", userDAO.countProviders(),
            "patients", userDAO.countCustomers()
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        User existing = userDAO.findById(id);
        if (existing == null) return ResponseEntity.notFound().build();

        existing.setName(user.getName());
        existing.setPhone(user.getPhone());
        // Email usually not changeable without verification, skipping for now
        
        userDAO.update(existing);
        return ResponseEntity.ok(existing);
    }

    @PostMapping("/{id}/profile-photo")
    public ResponseEntity<?> uploadProfilePhoto(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return uploadFile(id, file, "profile_photo");
    }

    @PostMapping("/{id}/identity-proof")
    public ResponseEntity<?> uploadIdentityProof(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return uploadFile(id, file, "identity_proof");
    }

    @PostMapping("/{id}/license-copy")
    public ResponseEntity<?> uploadLicenseCopy(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return uploadFile(id, file, "license_copy");
    }

    private ResponseEntity<?> uploadFile(Long id, MultipartFile file, String type) {
        logger.info("Uploading {} for user ID: {}", type, id);
        try {
            User user = userDAO.findById(id);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.lastIndexOf(".") > 0) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String filename = type + "_" + id + "_" + UUID.randomUUID() + extension;
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            if ("profile_photo".equals(type)) user.setProfilePhoto(filename);
            else if ("identity_proof".equals(type)) user.setIdentityProof(filename);
            else if ("license_copy".equals(type)) user.setLicenseCopy(filename);
            
            userDAO.update(user); 

            return ResponseEntity.ok(java.util.Map.of("message", "File uploaded successfully", "filename", filename));
        } catch (IOException e) {
            logger.error("Failed to upload " + type, e);
            return ResponseEntity.status(500).body("Failed to upload file");
        }
    }
}
