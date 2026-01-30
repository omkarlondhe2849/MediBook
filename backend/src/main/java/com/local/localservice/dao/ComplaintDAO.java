package com.local.localservice.dao;

import com.local.localservice.model.Complaint;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ComplaintDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public int save(Complaint complaint) {
        String sql = "INSERT INTO complaints (patient_id, doctor_id, appointment_id, subject, description, status) VALUES (?, ?, ?, ?, ?, ?)";
        return jdbcTemplate.update(sql, complaint.getPatientId(), complaint.getDoctorId(), complaint.getAppointmentId(), complaint.getSubject(), complaint.getDescription(), "PENDING");
    }

    public List<Complaint> findByUserId(Long userId) {
        String sql = "SELECT id, patient_id as patientId, doctor_id as doctorId, appointment_id as appointmentId, subject, description, status, created_at as createdAt FROM complaints WHERE patient_id = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, new Object[]{userId}, new BeanPropertyRowMapper<>(Complaint.class));
    }

    public List<Complaint> findAll() {
        String sql = "SELECT c.id, c.patient_id as patientId, c.doctor_id as doctorId, c.appointment_id as appointmentId, " +
                     "c.subject, c.description, c.status, c.created_at as createdAt, " +
                     "u1.name as patientName, u2.name as doctorName " +
                     "FROM complaints c " +
                     "LEFT JOIN users u1 ON c.patient_id = u1.id " +
                     "LEFT JOIN users u2 ON c.doctor_id = u2.id " +
                     "ORDER BY c.created_at DESC";

        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Complaint.class));
    }

    public int updateStatus(Long id, String status) {
        String sql = "UPDATE complaints SET status = ? WHERE id = ?";
        return jdbcTemplate.update(sql, status, id);
    }

    public List<Complaint> findByDoctorId(Long doctorId) {
        String sql = "SELECT id, patient_id as patientId, doctor_id as doctorId, appointment_id as appointmentId, subject, description, status, created_at as createdAt FROM complaints WHERE doctor_id = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, new Object[]{doctorId}, new BeanPropertyRowMapper<>(Complaint.class));
    }
}
