package com.local.localservice.controller;

import com.local.localservice.dao.ComplaintDAO;
import com.local.localservice.model.Complaint;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintDAO complaintDAO;

    @PostMapping
    public ResponseEntity<?> createComplaint(@RequestBody Complaint complaint) {
        try {
            int result = complaintDAO.save(complaint);
            if (result > 0) {
                return ResponseEntity.ok("Complaint submitted successfully");
            } else {
                return ResponseEntity.status(500).body("Failed to submit complaint");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error submitting complaint: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Complaint>> getUserComplaints(@PathVariable Long userId) {
        return ResponseEntity.ok(complaintDAO.findByUserId(userId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Complaint>> getDoctorComplaints(@PathVariable Long doctorId) {
        return ResponseEntity.ok(complaintDAO.findByDoctorId(doctorId));
    }

    @PutMapping("/update-status/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            complaintDAO.updateStatus(id, status);
            return ResponseEntity.ok("Complaint status updated");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating complaint status");
        }
    }
}
