package com.local.localservice.controller;

import com.local.localservice.dao.AppointmentDAO;
import com.local.localservice.dao.ReviewDAO;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/doctors")
public class DoctorProfileController {

    private static final Logger logger = LoggerFactory.getLogger(DoctorProfileController.class);

    @Autowired
    private ServiceDAO serviceDAO;

    @Autowired
    private UserDAO userDAO;

    @Autowired
    private ReviewDAO reviewDAO;

    @Autowired
    private AppointmentDAO bookingDAO;

    private DoctorProfile toDoctorProfile(Service service) {
        if (service == null) {
            return null;
        }
        DoctorProfile profile = new DoctorProfile();
        profile.setId(service.getId());
        profile.setDoctorName(service.getTitle());
        profile.setSpecialization(service.getCategory());
        profile.setShortBio(service.getDescription());
        profile.setClinicCity(service.getLocation());
        profile.setConsultationFee(service.getPrice());
        profile.setProviderId(service.getProviderId());
        profile.setCreatedAt(service.getCreatedAt());
        profile.setQualification(service.getQualification());
        profile.setExperienceYears(service.getExperienceYears());
        profile.setClinicName(service.getClinicName());
        profile.setClinicAddress(service.getClinicAddress());
        profile.setClinicState(service.getClinicState());
        profile.setClinicZip(service.getClinicZip());
        profile.setIsVerified(service.isVerified());
        profile.setKycDocumentPath(service.getKycDocumentPath());
        return profile;
    }

    private List<DoctorProfile> mapDoctors(List<Service> services) {
        return services.stream()
                .map(this::toDoctorProfile)
                .collect(Collectors.toList());
    }

    @GetMapping
    public List<DoctorProfile> getAllDoctors() {
        logger.info("GET /doctors - Retrieving APPROVED doctor profiles");
        List<Service> services = serviceDAO.findAll(); // Now returns only approved
        List<DoctorProfile> doctors = mapDoctors(services);
        logger.info("Retrieved {} approved doctor profiles", doctors.size());
        return doctors;
    }

    @GetMapping("/profile/me")
    public ResponseEntity<?> getMyProfile(@RequestParam Long providerId) {
        logger.info("GET /doctors/profile/me - Checking profile for provider {}", providerId);
        Service service = serviceDAO.findByProviderId(providerId);
        
        if (service == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(toDoctorProfile(service));
    }

    @GetMapping("/pending")
    public List<DoctorProfile> getPendingDoctors() {
        logger.info("GET /doctors/pending - Retrieving PENDING doctor profiles");
        List<Service> services = serviceDAO.findPending();
        List<DoctorProfile> doctors = mapDoctors(services);
        logger.info("Retrieved {} pending doctor profiles", doctors.size());
        return doctors;
    }

    @GetMapping("/all-admin")
    public List<DoctorProfile> getAllDoctorsAdmin() {
        logger.info("GET /doctors/all-admin - Retrieving ALL doctor profiles (Admin)");
        List<Service> services = serviceDAO.findAllAdmin();
        List<DoctorProfile> doctors = mapDoctors(services);
        logger.info("Retrieved {} total doctor profiles", doctors.size());
        return doctors;
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchDoctors(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String feeRange) {

        logger.info("GET /doctors/search - name='{}', specialization='{}', city='{}', feeRange='{}'",
                name, specialization, city, feeRange);

        String searchTerm = name;
        String category = specialization;
        String location = city;

        Double minPrice = null;
        Double maxPrice = null;

        if (feeRange != null && !feeRange.trim().isEmpty()) {
            String[] parts = feeRange.split("-");
            if (parts.length == 2) {
                if (!"0".equals(parts[0])) {
                    minPrice = Double.parseDouble(parts[0]);
                }
                if (!"+".equals(parts[1])) {
                    maxPrice = Double.parseDouble(parts[1]);
                } else {
                    maxPrice = Double.POSITIVE_INFINITY;
                }
            }
        }

        List<Service> services = serviceDAO.searchServices(searchTerm, category, location, minPrice, maxPrice);
        List<DoctorProfile> doctors = mapDoctors(services);

        if (doctors.isEmpty()) {
            logger.info("No doctor profiles found");
            return ResponseEntity.ok(Map.of("message", "No doctors found", "doctors", doctors));
        }

        return ResponseEntity.ok(Map.of("doctors", doctors));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDoctorById(@PathVariable Long id) {
        logger.info("GET /doctors/{} - Retrieving doctor profile", id);
        DoctorProfile doctor = toDoctorProfile(serviceDAO.findById(id));
        if (doctor == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(doctor);
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<?> getDoctorDetails(@PathVariable Long id) {
        logger.info("GET /doctors/{}/details - Retrieving doctor profile details", id);

        DoctorProfile doctor = toDoctorProfile(serviceDAO.findById(id));
        if (doctor == null) {
            return ResponseEntity.notFound().build();
        }
        User doctorUser = userDAO.findById(doctor.getProviderId());
        Double avgRating = reviewDAO.getAverageRatingForProvider(doctor.getProviderId());
        Integer reviewCount = reviewDAO.getReviewCountForProvider(doctor.getProviderId());
        Integer activeAppointments = bookingDAO.countByProviderIdAndStatus(doctor.getProviderId(), "PENDING");

        Map<String, Object> payload = new HashMap<>();
        payload.put("doctor", doctor);
        payload.put("doctorUser", doctorUser);
        payload.put("averageRating", avgRating != null ? avgRating : 0.0);
        payload.put("reviewCount", reviewCount != null ? reviewCount : 0);
        payload.put("activeAppointments", activeAppointments);

        return ResponseEntity.ok(payload);
    }

    @PostMapping
    public ResponseEntity<?> addDoctorProfile(@RequestBody DoctorProfile doctorProfile) {
        logger.info("POST /doctors - Creating doctor profile for provider {}", doctorProfile.getProviderId());
        // Force unverified on creation
        doctorProfile.setIsVerified(false); 
        int rows = serviceDAO.save(doctorProfile);
        if (rows > 0) {
            return ResponseEntity.ok("Doctor profile created");
        }
        return ResponseEntity.status(500).body("Failed to create doctor profile");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDoctorProfile(@PathVariable Long id, @RequestBody DoctorProfile doctorProfile) {
        logger.info("PUT /doctors/{} - Updating doctor profile", id);
        
        // Retrieve existing to preserve sensitive fields
        Service existing = serviceDAO.findById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        doctorProfile.setId(id);
        // Force preservation of verification status (or set to false if we want to force re-verification on edit)
        // For now, let's just prevent the user from enabling it themselves.
        doctorProfile.setIsVerified(existing.isVerified());
        
        // Also preserve providerId if not sent, or ensure it matches
        if (doctorProfile.getProviderId() == null) {
            doctorProfile.setProviderId(existing.getProviderId());
        }

        // Preserve KYC Document Path
        doctorProfile.setKycDocumentPath(existing.getKycDocumentPath());

        int rows = serviceDAO.update(doctorProfile);
        if (rows > 0) {
            return ResponseEntity.ok("Doctor profile updated");
        }
        return ResponseEntity.status(500).body("Failed to update doctor profile");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDoctorProfile(@PathVariable Long id) {
        logger.info("DELETE /doctors/{} - Removing doctor profile", id);
        int rows = serviceDAO.delete(id);
        if (rows > 0) {
            return ResponseEntity.ok("Doctor profile deleted");
        }
        return ResponseEntity.status(500).body("Failed to delete doctor profile");
    }

    @GetMapping("/provider/{providerId}/income")
    public ResponseEntity<?> getMonthlyIncome(@PathVariable Long providerId, @RequestParam int month, @RequestParam int year) {
        logger.info("GET /doctors/provider/{}/income - For {}/{}", providerId, month, year);
        try {
            java.math.BigDecimal income = bookingDAO.calculateMonthlyIncome(providerId, month, year);
            return ResponseEntity.ok(Map.of("income", income));
        } catch (Exception e) {
            logger.error("Error retrieving monthly income: {}", e.getMessage());
            return ResponseEntity.status(500).body("Error retrieving income");
        }
    }
}


