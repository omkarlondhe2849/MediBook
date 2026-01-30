package com.local.localservice.dao;

import com.local.localservice.model.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ServiceDAO {

    private static final Logger logger = LoggerFactory.getLogger(ServiceDAO.class);
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Service> findAll() {
        logger.debug("Executing query: SELECT * FROM doctor_profiles WHERE is_verified = 1");
        try {
            String sql = "SELECT id, doctor_name as title, short_bio as description, specialization as category, " +
                        "clinic_city as location, consultation_fee as price, doctor_id as providerId, " +
                        "qualification, experience_years as experienceYears, clinic_name as clinicName, " +
                        "clinic_address as clinicAddress, clinic_state as clinicState, clinic_zip as clinicZip, " +
                        "is_verified as verified, kyc_document_path as kycDocumentPath, " +
                        "created_at as createdAt FROM doctor_profiles WHERE is_verified = 1";
            List<Service> services = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Service.class));
            logger.info("Retrieved {} approved services", services.size());
            return services;
        } catch (Exception e) {
            logger.error("Error retrieving approved services: {}", e.getMessage(), e);
            throw e;
        }
    }

    public List<Service> findPending() {
        logger.debug("Executing query: SELECT * FROM doctor_profiles WHERE is_verified = 0");
        try {
            String sql = "SELECT id, doctor_name as title, short_bio as description, specialization as category, " +
                        "clinic_city as location, consultation_fee as price, doctor_id as providerId, " +
                        "qualification, experience_years as experienceYears, clinic_name as clinicName, " +
                        "clinic_address as clinicAddress, clinic_state as clinicState, clinic_zip as clinicZip, " +
                        "is_verified as verified, kyc_document_path as kycDocumentPath, " +
                        "created_at as createdAt FROM doctor_profiles WHERE is_verified = 0";
            List<Service> services = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Service.class));
            logger.info("Retrieved {} pending services", services.size());
            return services;
        } catch (Exception e) {
            logger.error("Error retrieving pending services: {}", e.getMessage(), e);
            throw e;
        }
    }

    public List<Service> findAllAdmin() {
        logger.debug("Executing query: SELECT * FROM doctor_profiles (Admin View)");
        try {
            String sql = "SELECT id, doctor_name as title, short_bio as description, specialization as category, " +
                        "clinic_city as location, consultation_fee as price, doctor_id as providerId, " +
                        "qualification, experience_years as experienceYears, clinic_name as clinicName, " +
                        "clinic_address as clinicAddress, clinic_state as clinicState, clinic_zip as clinicZip, " +
                        "is_verified as verified, kyc_document_path as kycDocumentPath, " +
                        "created_at as createdAt FROM doctor_profiles";
            List<Service> services = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Service.class));
            logger.info("Retrieved {} total services (admin view)", services.size());
            return services;
        } catch (Exception e) {
            logger.error("Error retrieving all services for admin: {}", e.getMessage(), e);
            throw e;
        }
    }

    public Service findByProviderId(Long providerId) {
        logger.debug("Executing query: SELECT * FROM doctor_profiles WHERE doctor_id = {}", providerId);
        try {
            String sql = "SELECT id, doctor_name as title, short_bio as description, specialization as category, " +
                        "clinic_city as location, consultation_fee as price, doctor_id as providerId, " +
                        "qualification, experience_years as experienceYears, clinic_name as clinicName, " +
                        "clinic_address as clinicAddress, clinic_state as clinicState, clinic_zip as clinicZip, " +
                        "is_verified as verified, kyc_document_path as kycDocumentPath, " +
                        "created_at as createdAt FROM doctor_profiles WHERE doctor_id = ?";
            List<Service> services = jdbcTemplate.query(sql, new Object[]{providerId}, new BeanPropertyRowMapper<>(Service.class));
            Service service = services.isEmpty() ? null : services.get(0);
            if (service == null) {
                logger.debug("No service found with Provider ID: {}", providerId);
            } else {
                logger.debug("Found service with Provider ID {}: {}", providerId, service.getTitle());
            }
            return service;
        } catch (Exception e) {
            logger.error("Error retrieving service with Provider ID {}: {}", providerId, e.getMessage(), e);
            throw e;
        }
    }

    public Service findById(Long id) {
        logger.debug("Executing query: SELECT * FROM doctor_profiles WHERE id = {}", id);
        try {
            String sql = "SELECT id, doctor_name as title, short_bio as description, specialization as category, " +
                        "clinic_city as location, consultation_fee as price, doctor_id as providerId, " +
                        "qualification, experience_years as experienceYears, clinic_name as clinicName, " +
                        "clinic_address as clinicAddress, clinic_state as clinicState, clinic_zip as clinicZip, " +
                        "is_verified as verified, kyc_document_path as kycDocumentPath, " +
                        "created_at as createdAt FROM doctor_profiles WHERE id = ?";
            List<Service> services = jdbcTemplate.query(sql, new Object[]{id}, new BeanPropertyRowMapper<>(Service.class));
            Service service = services.isEmpty() ? null : services.get(0);
            if (service == null) {
                logger.debug("No service found with ID: {}", id);
            } else {
                logger.debug("Found service with ID {}: {}", id, service.getTitle());
            }
            return service;
        } catch (Exception e) {
            logger.error("Error retrieving service with ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    public int save(Service service) {
        logger.debug("Executing INSERT for service: {}", service.getTitle());
        try {
            String sql = "INSERT INTO doctor_profiles(doctor_name, short_bio, specialization, clinic_city, consultation_fee, doctor_id, qualification, experience_years, clinic_name, clinic_address, clinic_state, clinic_zip, is_verified, kyc_document_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            int result = jdbcTemplate.update(sql,
                    service.getTitle(),
                    service.getDescription(),
                    service.getCategory(),
                    service.getLocation(),
                    service.getPrice(),
                    service.getProviderId(),
                    service.getQualification(),
                    service.getExperienceYears(),
                    service.getClinicName(),
                    service.getClinicAddress(),
                    service.getClinicState(),
                    service.getClinicZip(),
                    service.isVerified() ? 1 : 0,
                    service.getKycDocumentPath());
            logger.info("Service '{}' saved successfully, rows affected: {}", service.getTitle(), result);
            return result;
        } catch (Exception e) {
            logger.error("Error saving service '{}': {}", service.getTitle(), e.getMessage(), e);
            throw e;
        }
    }

    public int update(Service service) {
        logger.debug("Executing UPDATE for service ID: {}", service.getId());
        try {
            String sql = "UPDATE doctor_profiles SET doctor_name = ?, short_bio = ?, specialization = ?, " +
                        "clinic_city = ?, consultation_fee = ?, doctor_id = ?, qualification = ?, " +
                        "experience_years = ?, clinic_name = ?, clinic_address = ?, clinic_state = ?, " +
                        "clinic_zip = ?, is_verified = ?, kyc_document_path = ? WHERE id = ?";
            int result = jdbcTemplate.update(sql,
                    service.getTitle(),
                    service.getDescription(),
                    service.getCategory(),
                    service.getLocation(),
                    service.getPrice(),
                    service.getProviderId(),
                    service.getQualification(),
                    service.getExperienceYears(),
                    service.getClinicName(),
                    service.getClinicAddress(),
                    service.getClinicState(),
                    service.getClinicZip(),
                    service.isVerified() ? 1 : 0,
                    service.getKycDocumentPath(),
                    service.getId());
            logger.info("Service with ID {} updated successfully, rows affected: {}", service.getId(), result);
            return result;
        } catch (Exception e) {
            logger.error("Error updating service with ID {}: {}", service.getId(), e.getMessage(), e);
            throw e;
        }
    }

    public int delete(Long id) {
        logger.debug("Executing DELETE for service ID: {}", id);
        try {
            String sql = "DELETE FROM doctor_profiles WHERE id = ?";
            int result = jdbcTemplate.update(sql, id);
            logger.info("Service with ID {} deleted successfully, rows affected: {}", id, result);
            return result;
        } catch (Exception e) {
            logger.error("Error deleting service with ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    public int countByProviderId(Long providerId) {
        logger.debug("Executing COUNT for doctor_profiles with doctor_id = {}", providerId);
        try {
            String sql = "SELECT COUNT(*) FROM doctor_profiles WHERE doctor_id = ?";
            Integer count = jdbcTemplate.queryForObject(sql, new Object[]{providerId}, Integer.class);
            logger.info("Counted {} services for provider_id {}", count, providerId);
            return count != null ? count : 0;
        } catch (Exception e) {
            logger.error("Error counting services for provider_id {}: {}", providerId, e.getMessage(), e);
            throw e;
        }
    }

    public int countAll() {
        logger.debug("Executing COUNT for all doctor_profiles");
        try {
            String sql = "SELECT COUNT(*) FROM doctor_profiles";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
            logger.info("Counted {} services in total", count);
            return count != null ? count : 0;
        } catch (Exception e) {
            logger.error("Error counting all services: {}", e.getMessage(), e);
            throw e;
        }
    }

    public List<Service> searchServices(String searchTerm, String category, String location, Double minPrice, Double maxPrice) {
        logger.debug("Executing search with term: '{}', category: '{}', location: '{}', price range: {}-{}", 
                    searchTerm, category, location, minPrice, maxPrice);
        try {
            StringBuilder sql = new StringBuilder("SELECT id, doctor_name as title, short_bio as description, " +
                    "specialization as category, clinic_city as location, consultation_fee as price, " +
                    "doctor_id as providerId, qualification, experience_years as experienceYears, " +
                    "clinic_name as clinicName, clinic_address as clinicAddress, clinic_state as clinicState, " +
                    "clinic_zip as clinicZip, created_at as createdAt FROM doctor_profiles WHERE is_verified = 1");
            java.util.List<Object> params = new java.util.ArrayList<>();
            
            // Search term filter (doctor_name and short_bio)
            if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                sql.append(" AND (LOWER(doctor_name) LIKE LOWER(?) OR LOWER(short_bio) LIKE LOWER(?))");
                String likePattern = "%" + searchTerm.trim() + "%";
                params.add(likePattern);
                params.add(likePattern);
            }
            
            // Category filter
            if (category != null && !category.trim().isEmpty()) {
                sql.append(" AND specialization = ?");
                params.add(category.trim());
            }
            
            // Location filter
            if (location != null && !location.trim().isEmpty()) {
                sql.append(" AND clinic_city = ?");
                params.add(location.trim());
            }
            
            // Price range filter
            if (minPrice != null) {
                sql.append(" AND consultation_fee >= ?");
                params.add(minPrice);
            }
            if (maxPrice != null && maxPrice != Double.POSITIVE_INFINITY) {
                sql.append(" AND consultation_fee <= ?");
                params.add(maxPrice);
            }
            
            sql.append(" ORDER BY doctor_name ASC");
            
            List<Service> services = jdbcTemplate.query(sql.toString(), params.toArray(), new BeanPropertyRowMapper<>(Service.class));
            logger.info("Search returned {} services", services.size());
            return services;
        } catch (Exception e) {
            logger.error("Error searching services: {}", e.getMessage(), e);
            throw e;
        }
    }
}
