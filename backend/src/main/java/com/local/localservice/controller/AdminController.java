package com.local.localservice.controller;

import com.local.localservice.dao.ServiceDAO;
import com.local.localservice.dao.UserDAO;
import com.local.localservice.model.DoctorProfile;
import com.local.localservice.model.Service;
import com.local.localservice.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private ServiceDAO serviceDAO;

    @Autowired
    private UserDAO userDAO;

    @Autowired
    private com.local.localservice.service.EmailService emailService;

    @Autowired
    private com.local.localservice.dao.ComplaintDAO complaintDAO;

    // Use a fixed path for demo purposes or a configured property
    private static final String UPLOAD_DIR = "uploads/kyc/";

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userDAO.findAll(); // Assuming findAll exists or needs implementation
    }

    @GetMapping("/doctors/pending")
    public List<DoctorProfile> getPendingDoctors() {
        logger.info("GET /admin/doctors/pending - Request received");
        List<DoctorProfile> pending = serviceDAO.findPending()
                .stream()
                .map(this::toDoctorProfile)
                .collect(Collectors.toList());
        logger.info("Found {} pending doctors", pending.size());
        return pending;
    }

    @PostMapping("/approve/{doctorId}")
    public ResponseEntity<?> approveDoctor(@PathVariable Long doctorId) {
        logger.info("Admin approving doctor ID: {}", doctorId);
        try {
            Service service = serviceDAO.findById(doctorId);
            if (service == null) return ResponseEntity.notFound().build();
            
            service.setVerified(true);
            serviceDAO.update(service); // Ensure update handles verification status
            
            // Send Email
            User doctorUser = userDAO.findById(service.getId()); // Helper assumes service id = user id which is true in this schema
            if (doctorUser != null) {
                emailService.sendVerificationEmail(doctorUser.getEmail(), doctorUser.getName());
            }

            return ResponseEntity.ok("Doctor approved and email sent");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error approving doctor");
        }
    }

    @PostMapping("/reject/{doctorId}")
    public ResponseEntity<?> rejectDoctor(@PathVariable Long doctorId) {
        logger.info("Admin rejecting doctor ID: {}", doctorId);
        try {
             // Fetch user before deleting to get email
            User doctorUser = userDAO.findById(doctorId);
            
            serviceDAO.delete(doctorId);
            
            if (doctorUser != null) {
                emailService.sendRejectionEmail(doctorUser.getEmail(), doctorUser.getName());
            }
            
            return ResponseEntity.ok("Doctor application rejected/removed and email sent");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error rejecting doctor");
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        logger.info("Admin deleting user ID: {}", userId);
        try {
            User user = userDAO.findById(userId);
            if (user == null) return ResponseEntity.notFound().build();
            
            userDAO.delete(userId);
            
            emailService.sendAccountDeletedEmail(user.getEmail(), user.getName());
            
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting user");
        }
    }

    @GetMapping("/complaints")
    public List<com.local.localservice.model.Complaint> getAllComplaints() {
        return complaintDAO.findAll();
    }

    @PostMapping("/complaints/{id}/status")
    public ResponseEntity<?> updateComplaintStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null) return ResponseEntity.badRequest().body("Status is required");
        
        try {
            complaintDAO.updateStatus(id, status);
            return ResponseEntity.ok("Complaint status updated");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating complaint");
        }
    }

    // Helper (Duplicate from DoctorProfileController - should be refactored to common util)
    private DoctorProfile toDoctorProfile(Service service) {
        if (service == null) return null;
        DoctorProfile profile = new DoctorProfile();
        // ... copy properties ...
        // Using reflection or manual copy. For brevity reusing logic:
        profile.setId(service.getId());
        profile.setDoctorName(service.getTitle());
        profile.setSpecialization(service.getCategory());
        profile.setShortBio(service.getDescription());
        profile.setConsultationFee(service.getPrice());
        profile.setProviderId(service.getProviderId());
        profile.setVerified(service.isVerified());
        profile.setKycDocumentPath(service.getKycDocumentPath());
        
        // Fetch User to get Profile Photo
        if (service.getProviderId() != null) {
            try {
                // Assuming providerId is userId. 
                // Note: userDAO.findById might return null if user deleted but service exists (shouldn't happen with proper constraints)
               User u = userDAO.findById(service.getProviderId());
               if (u != null) {
                   profile.setProfilePhoto(u.getProfilePhoto());
               }
            } catch (Exception e) {
                logger.warn("Could not fetch user profile photo for provider id: {}", service.getProviderId());
            }
        }
        
        return profile;
    }
}
