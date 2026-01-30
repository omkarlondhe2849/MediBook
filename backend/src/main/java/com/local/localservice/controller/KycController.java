package com.local.localservice.controller;

import com.local.localservice.dao.ServiceDAO;
import com.local.localservice.model.Service;
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
@RequestMapping("/doctors")
public class KycController {

    private static final Logger logger = LoggerFactory.getLogger(KycController.class);
    private static final String UPLOAD_DIR = "uploads/kyc";

    @Autowired
    private ServiceDAO serviceDAO;

    @PostMapping("/{id}/upload-kyc")
    public ResponseEntity<?> uploadKyc(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Update Doctor Profile
            Service service = serviceDAO.findById(id);
            if (service == null) return ResponseEntity.notFound().build();

            service.setKycDocumentPath(filename);
            serviceDAO.update(service);

            return ResponseEntity.ok("KYC document uploaded successfully");
        } catch (IOException e) {
            logger.error("Failed to upload KYC", e);
            return ResponseEntity.status(500).body("Failed to upload file");
        }
    }
}
