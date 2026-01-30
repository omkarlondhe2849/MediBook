package com.local.localservice.controller;

import com.local.localservice.dao.TransactionDAO;
import com.local.localservice.model.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
public class TransactionController {
    
    private static final Logger logger = LoggerFactory.getLogger(TransactionController.class);
    
    @Autowired
    private TransactionDAO transactionDAO;

    @GetMapping
    public List<Transaction> getAllTransactions() {
        logger.info("GET /transactions - Retrieving all transactions");
        return transactionDAO.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTransactionById(@PathVariable Long id) {
        logger.info("GET /transactions/{} - Retrieving transaction by ID", id);
        
        try {
            Transaction transaction = transactionDAO.findById(id);
            if (transaction == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(transaction);
        } catch (Exception e) {
            logger.error("Error retrieving transaction by ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to retrieve transaction");
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getTransactionByBookingId(@PathVariable Long bookingId) {
        logger.info("GET /transactions/booking/{} - Retrieving transaction by booking ID", bookingId);
        
        try {
            Transaction transaction = transactionDAO.findByBookingId(bookingId);
            if (transaction == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(transaction);
        } catch (Exception e) {
            logger.error("Error retrieving transaction by booking ID {}: {}", bookingId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to retrieve transaction");
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getTransactionsByUserId(@PathVariable Long userId) {
        logger.info("GET /transactions/user/{} - Retrieving transactions by user ID", userId);
        
        try {
            List<Transaction> transactions = transactionDAO.findByUserId(userId);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            logger.error("Error retrieving transactions by user ID {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to retrieve transactions");
        }
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<?> getTransactionsByProviderId(@PathVariable Long providerId) {
        logger.info("GET /transactions/provider/{} - Retrieving transactions by provider ID", providerId);
        
        try {
            List<Transaction> transactions = transactionDAO.findByProviderId(providerId);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            logger.error("Error retrieving transactions by provider ID {}: {}", providerId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to retrieve transactions");
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateTransactionStatus(@PathVariable Long id, @RequestBody Transaction transaction) {
        logger.info("PUT /transactions/{}/status - Updating transaction status to: {}", id, transaction.getStatus());
        
        try {
            int rows = transactionDAO.updateStatus(id, transaction.getStatus());
            if (rows > 0) {
                logger.info("Transaction status updated successfully for ID: {} to status: {}", id, transaction.getStatus());
                return ResponseEntity.ok("Transaction status updated successfully");
            } else {
                logger.error("Failed to update transaction status for ID: {}", id);
                return ResponseEntity.status(500).body("Failed to update transaction status");
            }
        } catch (Exception e) {
            logger.error("Error updating transaction status for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to update transaction status");
        }
    }
} 
