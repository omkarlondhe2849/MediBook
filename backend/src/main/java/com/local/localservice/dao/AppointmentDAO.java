package com.local.localservice.dao;

import com.local.localservice.model.Appointment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Component;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.List;

@Component
public class AppointmentDAO {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentDAO.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static final String SELECT_COLS = "a.id, a.patient_id as userId, a.doctor_profile_id as serviceId, a.doctor_id as providerId, a.appointment_date as bookingDate, a.appointment_time as bookingTime, a.appointment_status as status, a.payment_status as paymentStatus, a.stripe_session_id as stripeSessionId, a.appointment_otp as otp, a.otp_expiry as otpExpiry, a.doctor_payout_status as providerPayoutStatus, a.doctor_payout_amount as providerPayoutAmount, a.appointment_for as bookingFor, a.care_recipient_name as friendName, a.care_recipient_email as friendEmail, a.care_recipient_phone as friendPhone, a.patient_address as addressLine, a.patient_city as city, a.patient_state as state, a.patient_zip as zip, a.created_at as createdAt, dp.doctor_name as doctorName, dp.specialization as specialization, dp.clinic_name as clinicName, dp.consultation_fee as price";

    public List<Appointment> findAll() {
        logger.debug("Executing query: SELECT * FROM appointments JOIN doctor_profiles...");
        try {
            String sql = "SELECT " + SELECT_COLS + " FROM appointments a JOIN doctor_profiles dp ON a.doctor_profile_id = dp.id ORDER BY a.appointment_date DESC, a.appointment_time DESC";
            List<Appointment> bookings = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Appointment.class));
            logger.info("Retrieved {} appointments from database", bookings.size());
            return bookings;
        } catch (Exception e) {
            logger.error("Error retrieving all appointments: {}", e.getMessage(), e);
            throw e;
        }
    }

    public List<Appointment> findAllByUserId(Long userId) {
        logger.debug("Executing query: SELECT * FROM appointments WHERE patient_id = {}", userId);
        try {
            String sql = "SELECT " + SELECT_COLS + " FROM appointments a JOIN doctor_profiles dp ON a.doctor_profile_id = dp.id WHERE a.patient_id = ? ORDER BY a.appointment_date DESC, a.appointment_time DESC";
            List<Appointment> bookings = jdbcTemplate.query(sql, new Object[]{userId}, new BeanPropertyRowMapper<>(Appointment.class));
            logger.info("Retrieved {} appointments for patient ID: {}", bookings.size(), userId);
            return bookings;
        } catch (Exception e) {
            logger.error("Error retrieving appointments for patient ID {}: {}", userId, e.getMessage(), e);
            throw e;
        }
    }

    public List<Appointment> findAllByProviderId(Long providerId) {
        logger.debug("Executing query: SELECT * FROM appointments WHERE doctor_id = {}", providerId);
        try {
            String sql = "SELECT " + SELECT_COLS + " FROM appointments a JOIN doctor_profiles dp ON a.doctor_profile_id = dp.id WHERE a.doctor_id = ? ORDER BY a.appointment_date DESC, a.appointment_time DESC";
            List<Appointment> bookings = jdbcTemplate.query(sql, new Object[]{providerId}, new BeanPropertyRowMapper<>(Appointment.class));
            logger.info("Retrieved {} appointments for doctor ID: {}", bookings.size(), providerId);
            return bookings;
        } catch (Exception e) {
            logger.error("Error retrieving appointments for doctor ID {}: {}", providerId, e.getMessage(), e);
            throw e;
        }
    }

    public List<Appointment> findByProviderIdAndStatus(Long providerId, String status) {
        try {
            String sql = "SELECT " + SELECT_COLS + " FROM appointments a JOIN doctor_profiles dp ON a.doctor_profile_id = dp.id WHERE a.doctor_id = ? AND a.appointment_status = ? ORDER BY a.appointment_date DESC, a.appointment_time DESC";
            return jdbcTemplate.query(sql, new Object[]{providerId, status}, new BeanPropertyRowMapper<>(Appointment.class));
        } catch (Exception e) { throw e; }
    }

    public List<Appointment> findByUserIdAndStatus(Long userId, String status) {
        try {
            String sql = "SELECT " + SELECT_COLS + " FROM appointments a JOIN doctor_profiles dp ON a.doctor_profile_id = dp.id WHERE a.patient_id = ? AND a.appointment_status = ? ORDER BY a.appointment_date DESC, a.appointment_time DESC";
            return jdbcTemplate.query(sql, new Object[]{userId, status}, new BeanPropertyRowMapper<>(Appointment.class));
        } catch (Exception e) { throw e; }
    }

    public int save(Appointment booking) {
        logger.debug("Executing INSERT for appointment: patient ID {}, doctor profile ID {}, doctor ID {}", booking.getUserId(), booking.getServiceId(), booking.getProviderId());
        try {
            String sql = "INSERT INTO appointments(patient_id, doctor_profile_id, doctor_id, appointment_date, appointment_time, appointment_status, patient_address, patient_city, patient_state, patient_zip, appointment_for, care_recipient_name, care_recipient_email, care_recipient_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                ps.setLong(1, booking.getUserId());
                ps.setLong(2, booking.getServiceId());
                ps.setLong(3, booking.getProviderId());
                ps.setDate(4, booking.getBookingDate());
                ps.setTime(5, booking.getBookingTime());
                ps.setString(6, booking.getStatus()); // enum string
                ps.setString(7, booking.getAddressLine());
                ps.setString(8, booking.getCity());
                ps.setString(9, booking.getState());
                ps.setString(10, booking.getZip());
                ps.setString(11, booking.getBookingFor());
                ps.setString(12, booking.getFriendName());
                ps.setString(13, booking.getFriendEmail());
                ps.setString(14, booking.getFriendPhone());
                return ps;
            }, keyHolder);
            Number key = keyHolder.getKey();
            if (key != null) {
                booking.setId(key.longValue());
            }
            logger.info("Appointment saved successfully, id: {}", booking.getId());
            return 1;
        } catch (Exception e) {
            logger.error("Error saving appointment: {}", e.getMessage(), e);
            throw e;
        }
    }

    public int updateStatus(Long bookingId, String status) {
        logger.debug("Executing UPDATE for appointment ID: {} with status: {}", bookingId, status);
        try {
            String sql = "UPDATE appointments SET appointment_status = ? WHERE id = ?";
            int result = jdbcTemplate.update(sql, status, bookingId);
            logger.info("Appointment status updated successfully for ID: {}, rows affected: {}", bookingId, result);
            return result;
        } catch (Exception e) {
            logger.error("Error updating appointment status for ID {}: {}", bookingId, e.getMessage(), e);
            throw e;
        }
    }

    public int countByProviderIdAndStatus(Long providerId, String status) {
        logger.debug("Executing COUNT for appointments with doctor_id = {} and status = {}", providerId, status);
        try {
            String sql = "SELECT COUNT(*) FROM appointments WHERE doctor_id = ? AND appointment_status = ?";
            Integer count = jdbcTemplate.queryForObject(sql, new Object[]{providerId, status}, Integer.class);
            logger.info("Counted {} appointments for provider_id {} with status {}", count, providerId, status);
            return count != null ? count : 0;
        } catch (Exception e) {
            logger.error("Error counting appointments for provider_id {} and status {}: {}", providerId, status, e.getMessage(), e);
            throw e;
        }
    }

    public int countCompletedByProviderId(Long providerId) {
        logger.debug("Executing COUNT for completed appointments with doctor_id = {}", providerId);
        try {
            String sql = "SELECT COUNT(*) FROM appointments WHERE doctor_id = ? AND appointment_status = 'COMPLETED'";
            Integer count = jdbcTemplate.queryForObject(sql, new Object[]{providerId}, Integer.class);
            logger.info("Counted {} completed appointments for provider_id {}", count, providerId);
            return count != null ? count : 0;
        } catch (Exception e) {
            logger.error("Error counting completed appointments for provider_id {}: {}", providerId, e.getMessage(), e);
            throw e;
        }
    }

    public Appointment findById(Long id) {
        logger.debug("Executing query: SELECT * FROM appointments WHERE id = {}", id);
        try {
            String sql = "SELECT " + SELECT_COLS + " FROM appointments a JOIN doctor_profiles dp ON a.doctor_profile_id = dp.id WHERE a.id = ?";
            List<Appointment> bookings = jdbcTemplate.query(sql, new Object[]{id}, new BeanPropertyRowMapper<>(Appointment.class));
            return bookings.isEmpty() ? null : bookings.get(0);
        } catch (Exception e) {
            logger.error("Error retrieving appointment with ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    public List<Appointment> findOverdueUncompletedPaidBookings(LocalDate today) {
        logger.debug("Finding overdue, uncompleted, paid appointments before {}", today);
        String sql = "SELECT " + SELECT_COLS + " FROM appointments a JOIN doctor_profiles dp ON a.doctor_profile_id = dp.id WHERE a.payment_status = 'PAID' AND a.appointment_status != 'COMPLETED' AND a.appointment_date < ? AND a.payment_status != 'REFUNDED'";
        return jdbcTemplate.query(sql, new Object[]{Date.valueOf(today)}, new BeanPropertyRowMapper<>(Appointment.class));
    }

    public int updatePaymentStatus(Long bookingId, String paymentStatus) {
        logger.debug("Updating payment_status for appointment ID: {} to {}", bookingId, paymentStatus);
        String sql = "UPDATE appointments SET payment_status = ? WHERE id = ?";
        return jdbcTemplate.update(sql, paymentStatus, bookingId);
    }

    public int updateStripeSessionId(Long bookingId, String sessionId) {
        logger.debug("Updating stripe_session_id for appointment ID: {} to {}", bookingId, sessionId);
        String sql = "UPDATE appointments SET stripe_session_id = ? WHERE id = ?";
        return jdbcTemplate.update(sql, sessionId, bookingId);
    }

    public int updateOtp(Long bookingId, String otp, java.sql.Timestamp expiry) {
        logger.debug("Updating OTP for appointment ID: {} to {} (expiry: {})", bookingId, otp, expiry);
        String sql = "UPDATE appointments SET appointment_otp = ?, otp_expiry = ? WHERE id = ?";
        return jdbcTemplate.update(sql, otp, expiry, bookingId);
    }

    public int updateProviderPayout(Long bookingId, String payoutStatus, java.math.BigDecimal payoutAmount) {
        logger.debug("Updating doctor payout for appointment ID: {} to status: {}, amount: {}", bookingId, payoutStatus, payoutAmount);
        String sql = "UPDATE appointments SET doctor_payout_status = ?, doctor_payout_amount = ? WHERE id = ?";
        return jdbcTemplate.update(sql, payoutStatus, payoutAmount, bookingId);
    }

    public java.math.BigDecimal sumProviderPayoutForCompletedBookings(Long providerId) {
        logger.debug("Summing doctor payouts for completed appointments for provider_id = {}", providerId);
        String sql = "SELECT COALESCE(SUM(doctor_payout_amount), 0) FROM appointments WHERE doctor_id = ? AND appointment_status = 'COMPLETED' AND doctor_payout_status = 'PAID'";
        java.math.BigDecimal sum = jdbcTemplate.queryForObject(sql, new Object[]{providerId}, java.math.BigDecimal.class);
        return sum != null ? sum : java.math.BigDecimal.ZERO;
    }

    public int deleteById(Long bookingId) {
        logger.debug("Deleting appointment with ID: {}", bookingId);
        String sql = "DELETE FROM appointments WHERE id = ?";
        return jdbcTemplate.update(sql, bookingId);
    }
    public java.math.BigDecimal calculateMonthlyIncome(Long providerId, int month, int year) {
        logger.debug("Calculating monthly income for provider_id = {}, month = {}, year = {}", providerId, month, year);
        // COALESCE(SUM(price), 0) - assuming price is the income. 
        // Or if you use doctor_payout_amount, replace 'dp.consultation_fee' (price) with appropriate column.
        // Based on SELECT_COLS, 'price' comes from doctor_profiles table, which is static.
        // We should likely sum the specific appointment price if stored, or doctor_payout_amount.
        // Let's use doctor_payout_amount if populated, otherwise price?
        // Actually, looking at previous updateProviderPayout, doctor_payout_amount is the specific amount.
        // Let's assume for now we sum 'doctor_payout_amount' for COMPLETED appointments.
        String sql = "SELECT COALESCE(SUM(doctor_payout_amount), 0) FROM appointments " +
                     "WHERE doctor_id = ? AND appointment_status = 'COMPLETED' " +
                     "AND EXTRACT(MONTH FROM appointment_date) = ? AND EXTRACT(YEAR FROM appointment_date) = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{providerId, month, year}, java.math.BigDecimal.class);
    }
}
