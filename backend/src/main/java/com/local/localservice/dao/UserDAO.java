package com.local.localservice.dao;


import com.local.localservice.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.ArrayList;

@Component
public class UserDAO {
    
    private static final Logger logger = LoggerFactory.getLogger(UserDAO.class);
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public User findByEmailAndPassword(String email, String password) {
        logger.debug("Executing authentication query for email: {}", email);
        try {
            String sql = "SELECT * FROM users WHERE email = ? AND password = ?";
            List<User> users = jdbcTemplate.query(sql, new Object[]{email, password},
                new BeanPropertyRowMapper<>(User.class));
            User user = users.isEmpty() ? null : users.get(0);
            if (user == null) {
                logger.debug("Authentication failed for email: {}", email);
            } else {
                logger.debug("Authentication successful for user: {} (ID: {})", user.getName(), user.getId());
            }
            return user;
        } catch (Exception e) {
            logger.error("Error during authentication for email {}: {}", email, e.getMessage(), e);
            throw e;
        }
    }

    public User findById(Long id) {
        logger.debug("Executing query: SELECT * FROM users WHERE id = {}", id);
        try {
            String sql = "SELECT * FROM users WHERE id = ?";
            List<User> users = jdbcTemplate.query(sql, new Object[]{id}, new BeanPropertyRowMapper<>(User.class));
            User user = users.isEmpty() ? null : users.get(0);
            if (user == null) {
                logger.debug("No user found with ID: {}", id);
            } else {
                logger.debug("Found user with ID {}: {}", id, user.getName());
            }
            return user;
        } catch (Exception e) {
            logger.error("Error retrieving user with ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    public List<User> findAll() {
        logger.debug("Executing query: SELECT * FROM users");
        try {
            String sql = "SELECT * FROM users";
            List<User> users = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(User.class));
            logger.info("Retrieved {} users", users.size());
            return users;
        } catch (Exception e) {
            logger.error("Error retrieving all users: {}", e.getMessage(), e);
            throw e;
        }
    }

    public int save(User user) {
        logger.debug("Executing INSERT for user: {} ({})", user.getName(), user.getEmail());
        try {
            String sql = "INSERT INTO users(name, email, password, phone, role, profile_photo) VALUES (?, ?, ?, ?, ?, ?)";
            int result = jdbcTemplate.update(sql, user.getName(), user.getEmail(), user.getPassword(), user.getPhone(), user.getRole(), user.getProfilePhoto());
            logger.info("User '{}' saved successfully, rows affected: {}", user.getName(), result);
            return result;
        } catch (Exception e) {
            logger.error("Error saving user '{}': {}", user.getName(), e.getMessage(), e);
            throw e;
        }
    }

    public User findByEmail(String email) {
        logger.debug("Executing query: SELECT * FROM users WHERE email = {}", email);
        try {
            String sql = "SELECT * FROM users WHERE email = ?";
            List<User> users = jdbcTemplate.query(sql, new Object[]{email}, new BeanPropertyRowMapper<>(User.class));
            return users.isEmpty() ? null : users.get(0);
        } catch (Exception e) {
            logger.error("Error retrieving user with email {}: {}", email, e.getMessage(), e);
            throw e;
        }
    }

    public int updateResetToken(String email, String token, String expiry) {
        logger.debug("Updating reset token for email: {}", email);
        try {
            String sql = "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?";
            return jdbcTemplate.update(sql, token, expiry, email);
        } catch (Exception e) {
            logger.error("Error updating reset token for email {}: {}", email, e.getMessage(), e);
            throw e;
        }
    }

    public User findByResetToken(String token) {
        logger.debug("Executing query: SELECT * FROM users WHERE reset_token = {}", token);
        try {
            String sql = "SELECT * FROM users WHERE reset_token = ?";
            List<User> users = jdbcTemplate.query(sql, new Object[]{token}, new BeanPropertyRowMapper<>(User.class));
            return users.isEmpty() ? null : users.get(0);
        } catch (Exception e) {
            logger.error("Error retrieving user with reset token {}: {}", token, e.getMessage(), e);
            throw e;
        }
    }

    public int updatePasswordByEmail(String email, String newPassword) {
        logger.debug("Updating password for email: {}", email);
        try {
            String sql = "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?";
            return jdbcTemplate.update(sql, newPassword, email);
        } catch (Exception e) {
            logger.error("Error updating password for email {}: {}", email, e.getMessage(), e);
            throw e;
        }
    }

    public int countProviders() {
        logger.debug("Executing COUNT for doctors");
        try {
            String sql = "SELECT COUNT(*) FROM users WHERE role = 'DOCTOR'";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
            logger.info("Counted {} doctors", count);
            return count != null ? count : 0;
        } catch (Exception e) {
            logger.error("Error counting doctors: {}", e.getMessage(), e);
            throw e;
        }
    }

    public int countCustomers() {
        logger.debug("Executing COUNT for patients");
        try {
            String sql = "SELECT COUNT(*) FROM users WHERE role = 'PATIENT'";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
            logger.info("Counted {} patients", count);
            return count != null ? count : 0;
        } catch (Exception e) {
            logger.error("Error counting patients: {}", e.getMessage(), e);
            throw e;
        }
    }

    public int update(User user) {
        logger.debug("Executing UPDATE for user ID: {}", user.getId());
        try {
            StringBuilder sql = new StringBuilder("UPDATE users SET name = ?, email = ?, phone = ?");
            List<Object> args = new ArrayList<>();
            args.add(user.getName());
            args.add(user.getEmail());
            args.add(user.getPhone());
            
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                sql.append(", password = ?");
                args.add(user.getPassword());
            }
            
            if (user.getProfilePhoto() != null) {
                sql.append(", profile_photo = ?");
                args.add(user.getProfilePhoto());
            }

            if (user.getIdentityProof() != null) {
                sql.append(", identity_proof = ?");
                args.add(user.getIdentityProof());
            }

            if (user.getLicenseCopy() != null) {
                sql.append(", license_copy = ?");
                args.add(user.getLicenseCopy());
            }

            sql.append(" WHERE id = ?");
            args.add(user.getId());

            int result = jdbcTemplate.update(sql.toString(), args.toArray());
            logger.info("User updated successfully for ID: {}, rows affected: {}", user.getId(), result);
            return result;
        } catch (Exception e) {
            logger.error("Error updating user for ID {}: {}", user.getId(), e.getMessage(), e);
            throw e;
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public int delete(Long id) {
        logger.debug("Executing ROBUST CASCADING DELETE for user ID: {}", id);
        try {
            // 0. Pre-fetch doctor profile ID
            String profileIdSql = "SELECT id FROM doctor_profiles WHERE doctor_id = ?";
            List<Long> profileIds = jdbcTemplate.queryForList(profileIdSql, Long.class, id);

            // 0b. Pre-fetch Appointment IDs to be deleted
            // This is crucial because complaints (and potentially other tables) link to appointments
            // and we must delete those children before deleting the appointments.
            List<Long> appointmentIds = new ArrayList<>();
            appointmentIds.addAll(jdbcTemplate.queryForList("SELECT id FROM appointments WHERE patient_id = ? OR doctor_id = ?", Long.class, id, id));
            
            if (!profileIds.isEmpty()) {
                for (Long pid : profileIds) {
                    List<Long> profileAppts = jdbcTemplate.queryForList("SELECT id FROM appointments WHERE doctor_profile_id = ?", Long.class, pid);
                    appointmentIds.addAll(profileAppts);
                }
            }
            
            // 1. Delete Messages
            jdbcTemplate.update("DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?", id, id);
            
            // 2. Delete Complaints (Cascade via Appointment ID + Direct User Link)
            jdbcTemplate.update("DELETE FROM complaints WHERE patient_id = ? OR doctor_id = ?", id, id);
            if (!appointmentIds.isEmpty()) {
                for (Long aptId : appointmentIds) {
                    jdbcTemplate.update("DELETE FROM complaints WHERE appointment_id = ?", aptId);
                }
            }

            // 3. Delete Payment Transactions
            // Handle both direct user links AND links via doctor profile
            jdbcTemplate.update("DELETE FROM payment_transactions WHERE patient_id = ? OR doctor_id = ?", id, id);
            if (!profileIds.isEmpty()) {
                for (Long pid : profileIds) {
                    jdbcTemplate.update("DELETE FROM payment_transactions WHERE doctor_profile_id = ?", pid);
                }
            }
            
            // Also delete transactions linked to the appointments we are about to delete
             if (!appointmentIds.isEmpty()) {
                for (Long aptId : appointmentIds) {
                    jdbcTemplate.update("DELETE FROM payment_transactions WHERE appointment_id = ?", aptId);
                }
            }

            // 4. Delete Doctor Reviews
            jdbcTemplate.update("DELETE FROM doctor_reviews WHERE patient_id = ?", id);
            if (!profileIds.isEmpty()) {
                for (Long pid : profileIds) {
                    jdbcTemplate.update("DELETE FROM doctor_reviews WHERE doctor_profile_id = ?", pid);
                }
            }
            if (!appointmentIds.isEmpty()) {
                for (Long aptId : appointmentIds) {
                    jdbcTemplate.update("DELETE FROM doctor_reviews WHERE appointment_id = ?", aptId);
                }
            }

            // 5. Delete Appointments
            // We can now safely delete appointments by ID list to cover all bases
             if (!appointmentIds.isEmpty()) {
                for (Long aptId : appointmentIds) {
                    jdbcTemplate.update("DELETE FROM appointments WHERE id = ?", aptId);
                }
            }
            // Explicit delete just in case list missed something (though ideally covered)
            jdbcTemplate.update("DELETE FROM appointments WHERE patient_id = ? OR doctor_id = ?", id, id);


            // 6. Delete Doctor Specific Data
            jdbcTemplate.update("DELETE FROM slots WHERE doctor_id = ?", id);
            jdbcTemplate.update("DELETE FROM doctor_vacations WHERE doctor_id = ?", id);
            jdbcTemplate.update("DELETE FROM doctor_availabilities WHERE doctor_id = ?", id);
            
            // 7. Delete Doctor Profile
            jdbcTemplate.update("DELETE FROM doctor_profiles WHERE doctor_id = ?", id);

            // 8. Finally Delete User
            String sql = "DELETE FROM users WHERE id = ?";
            int result = jdbcTemplate.update(sql, id);
            logger.info("User and all related data deleted successfully for ID: {}, rows affected: {}", id, result);
            return result;
        } catch (Exception e) {
            logger.error("Error deleting user for ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }
}
