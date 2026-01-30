package com.local.localservice.dao;

import com.local.localservice.model.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

@Repository
public class TransactionDAO {
    
    private static final Logger logger = LoggerFactory.getLogger(TransactionDAO.class);
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public int save(Transaction transaction) {
        logger.info("Saving transaction for booking ID: {}, amount: {}", transaction.getBookingId(), transaction.getAmount());
        
        String sql = "INSERT INTO payment_transactions (appointment_id, patient_id, doctor_profile_id, doctor_id, transaction_type, " +
                    "amount, currency, stripe_payment_intent_id, stripe_session_id, payment_status, payment_method, " +
                    "gateway_fee, platform_fee, doctor_net_amount, transaction_description, metadata) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try {
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                ps.setLong(1, transaction.getBookingId());
                ps.setLong(2, transaction.getUserId());
                ps.setLong(3, transaction.getServiceId());
                ps.setLong(4, transaction.getProviderId());
                ps.setString(5, transaction.getTransactionType());
                ps.setBigDecimal(6, transaction.getAmount());
                ps.setString(7, transaction.getCurrency());
                ps.setString(8, transaction.getStripePaymentIntentId());
                ps.setString(9, transaction.getStripeSessionId());
                ps.setString(10, transaction.getStatus());
                ps.setString(11, transaction.getPaymentMethod());
                ps.setBigDecimal(12, transaction.getGatewayFee());
                ps.setBigDecimal(13, transaction.getPlatformFee());
                ps.setBigDecimal(14, transaction.getProviderAmount());
                ps.setString(15, transaction.getDescription());
                ps.setString(16, transaction.getMetadata());
                return ps;
            }, keyHolder);
            
            Number key = keyHolder.getKey();
            if (key != null) {
                transaction.setId(key.longValue());
            }
            logger.info("Transaction saved successfully, id: {}", transaction.getId());
            return 1;
        } catch (Exception e) {
            logger.error("Error saving transaction: {}", e.getMessage(), e);
            throw e;
        }
    }

    public Transaction findById(Long id) {
        logger.info("Finding transaction by ID: {}", id);
        
        String sql = "SELECT id, appointment_id as bookingId, patient_id as userId, doctor_profile_id as serviceId, " +
                    "doctor_id as providerId, transaction_type as transactionType, amount, currency, " +
                    "stripe_payment_intent_id as stripePaymentIntentId, stripe_session_id as stripeSessionId, " +
                    "payment_status as status, payment_method as paymentMethod, gateway_fee as gatewayFee, " +
                    "platform_fee as platformFee, doctor_net_amount as providerAmount, transaction_description as description, " +
                    "metadata, created_at as createdAt, updated_at as updatedAt " +
                    "FROM payment_transactions WHERE id = ?";
        try {
            List<Transaction> transactions = jdbcTemplate.query(sql, 
                new BeanPropertyRowMapper<>(Transaction.class), id);
            return transactions.isEmpty() ? null : transactions.get(0);
        } catch (Exception e) {
            logger.error("Error finding transaction by ID {}: {}", id, e.getMessage(), e);
            return null;
        }
    }

    public Transaction findByBookingId(Long bookingId) {
        logger.info("Finding transaction by booking ID: {}", bookingId);
        
        String sql = "SELECT id, appointment_id as bookingId, patient_id as userId, doctor_profile_id as serviceId, " +
                    "doctor_id as providerId, transaction_type as transactionType, amount, currency, " +
                    "stripe_payment_intent_id as stripePaymentIntentId, stripe_session_id as stripeSessionId, " +
                    "payment_status as status, payment_method as paymentMethod, gateway_fee as gatewayFee, " +
                    "platform_fee as platformFee, doctor_net_amount as providerAmount, transaction_description as description, " +
                    "metadata, created_at as createdAt, updated_at as updatedAt " +
                    "FROM payment_transactions WHERE appointment_id = ? ORDER BY created_at DESC LIMIT 1";
        try {
            List<Transaction> transactions = jdbcTemplate.query(sql, 
                new BeanPropertyRowMapper<>(Transaction.class), bookingId);
            return transactions.isEmpty() ? null : transactions.get(0);
        } catch (Exception e) {
            logger.error("Error finding transaction by booking ID {}: {}", bookingId, e.getMessage(), e);
            return null;
        }
    }

    public List<Transaction> findByUserId(Long userId) {
        logger.info("Finding transactions by user ID: {}", userId);
        
        String sql = "SELECT id, appointment_id as bookingId, patient_id as userId, doctor_profile_id as serviceId, " +
                    "doctor_id as providerId, transaction_type as transactionType, amount, currency, " +
                    "stripe_payment_intent_id as stripePaymentIntentId, stripe_session_id as stripeSessionId, " +
                    "payment_status as status, payment_method as paymentMethod, gateway_fee as gatewayFee, " +
                    "platform_fee as platformFee, doctor_net_amount as providerAmount, transaction_description as description, " +
                    "metadata, created_at as createdAt, updated_at as updatedAt " +
                    "FROM payment_transactions WHERE patient_id = ? ORDER BY created_at DESC";
        try {
            return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Transaction.class), userId);
        } catch (Exception e) {
            logger.error("Error finding transactions by user ID {}: {}", userId, e.getMessage(), e);
            return List.of();
        }
    }

    public List<Transaction> findByProviderId(Long providerId) {
        logger.info("Finding transactions by provider ID: {}", providerId);
        
        String sql = "SELECT id, appointment_id as bookingId, patient_id as userId, doctor_profile_id as serviceId, " +
                    "doctor_id as providerId, transaction_type as transactionType, amount, currency, " +
                    "stripe_payment_intent_id as stripePaymentIntentId, stripe_session_id as stripeSessionId, " +
                    "payment_status as status, payment_method as paymentMethod, gateway_fee as gatewayFee, " +
                    "platform_fee as platformFee, doctor_net_amount as providerAmount, transaction_description as description, " +
                    "metadata, created_at as createdAt, updated_at as updatedAt " +
                    "FROM payment_transactions WHERE doctor_id = ? ORDER BY created_at DESC";
        try {
            return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Transaction.class), providerId);
        } catch (Exception e) {
            logger.error("Error finding transactions by provider ID {}: {}", providerId, e.getMessage(), e);
            return List.of();
        }
    }

    public int updateStatus(Long id, String status) {
        logger.info("Updating transaction status for ID {} to: {}", id, status);
        
        String sql = "UPDATE payment_transactions SET payment_status = ? WHERE id = ?";
        try {
            int rows = jdbcTemplate.update(sql, status, id);
            logger.info("Transaction status updated successfully for ID: {}", id);
            return rows;
        } catch (Exception e) {
            logger.error("Error updating transaction status for ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    public int updateStripePaymentIntentId(Long id, String paymentIntentId) {
        logger.info("Updating Stripe payment intent ID for transaction ID: {}", id);
        
        String sql = "UPDATE payment_transactions SET stripe_payment_intent_id = ? WHERE id = ?";
        try {
            int rows = jdbcTemplate.update(sql, paymentIntentId, id);
            logger.info("Stripe payment intent ID updated successfully for transaction ID: {}", id);
            return rows;
        } catch (Exception e) {
            logger.error("Error updating Stripe payment intent ID for transaction ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    public List<Transaction> findAll() {
        logger.info("Finding all transactions");
        
        String sql = "SELECT id, appointment_id as bookingId, patient_id as userId, doctor_profile_id as serviceId, " +
                    "doctor_id as providerId, transaction_type as transactionType, amount, currency, " +
                    "stripe_payment_intent_id as stripePaymentIntentId, stripe_session_id as stripeSessionId, " +
                    "payment_status as status, payment_method as paymentMethod, gateway_fee as gatewayFee, " +
                    "platform_fee as platformFee, doctor_net_amount as providerAmount, transaction_description as description, " +
                    "metadata, created_at as createdAt, updated_at as updatedAt " +
                    "FROM payment_transactions ORDER BY created_at DESC";
        try {
            return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Transaction.class));
        } catch (Exception e) {
            logger.error("Error finding all transactions: {}", e.getMessage(), e);
            return List.of();
        }
    }
} 