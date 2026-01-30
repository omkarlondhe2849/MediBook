package com.local.localservice.controller;

import com.local.localservice.dao.AppointmentDAO;
import com.local.localservice.dao.UserDAO;
import com.local.localservice.dao.ServiceDAO;
import com.local.localservice.dao.TransactionDAO;
import com.local.localservice.model.Appointment;
import com.local.localservice.model.User;
import com.local.localservice.model.Service;
import com.local.localservice.model.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentRetrieveParams;
import org.springframework.beans.factory.annotation.Value;
import java.security.SecureRandom;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.sql.Date;
import java.sql.Time;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {
    
    private static final Logger logger = LoggerFactory.getLogger(AppointmentController.class);
    
    @Autowired
    private AppointmentDAO bookingDAO;
    
    @Autowired
    private UserDAO userDAO;

    @Autowired
    private ServiceDAO serviceDAO;

    @Autowired
    private TransactionDAO transactionDAO;
    
    @Autowired
    private com.local.localservice.dao.SlotDAO slotDAO;

    @Autowired
    private com.local.localservice.service.EmailService emailService;
    
    @Autowired
    private JavaMailSender mailSender;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @GetMapping
    public List<Appointment> getAllBookings() {
        logger.info("GET /appointments - Retrieving all appointments");
        List<Appointment> bookings = bookingDAO.findAll();
        logger.info("Retrieved {} bookings", bookings.size());
        return bookings;
    }

    @GetMapping("/user/{userId}")
    public List<Appointment> getBookingsByUser(@PathVariable Long userId) {
        logger.info("GET /appointments/user/{} - Retrieving appointments for user", userId);
        List<Appointment> bookings = bookingDAO.findAllByUserId(userId);
        logger.info("Retrieved {} bookings for user ID: {}", bookings.size(), userId);
        return bookings;
    }

    @GetMapping("/provider/{providerId}")
    public List<Appointment> getBookingsByProvider(@PathVariable Long providerId) {
        logger.info("GET /appointments/provider/{} - Retrieving appointments for doctor", providerId);
        List<Appointment> bookings = bookingDAO.findAllByProviderId(providerId);
        logger.info("Retrieved {} bookings for provider ID: {}", bookings.size(), providerId);
        return bookings;
    }

    @GetMapping("/provider/{providerId}/status/{status}")
    public List<Appointment> getBookingsByProviderAndStatus(@PathVariable Long providerId, @PathVariable String status) {
        return bookingDAO.findByProviderIdAndStatus(providerId, status.toUpperCase());
    }

    @GetMapping("/user/{userId}/status/{status}")
    public List<Appointment> getBookingsByUserAndStatus(@PathVariable Long userId, @PathVariable String status) {
        return bookingDAO.findByUserIdAndStatus(userId, status.toUpperCase());
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getBookingById(@PathVariable Long bookingId) {
        logger.info("GET /appointments/{} - Retrieving appointment details", bookingId);
        Appointment booking = bookingDAO.findById(bookingId);
        if (booking != null) {
            return ResponseEntity.ok(booking);
        } else {
            return ResponseEntity.status(404).body("Appointment not found");
        }
    }

    @GetMapping("/provider/{providerId}/with-customers")
    public ResponseEntity<?> getBookingsWithCustomerDetails(@PathVariable Long providerId) {
        logger.info("GET /appointments/provider/{}/with-patients - Retrieving appointments with patient details", providerId);
        
        try {
            List<Appointment> bookings = bookingDAO.findAllByProviderId(providerId);
            
            List<Map<String, Object>> bookingsWithCustomers = bookings.stream()
                .map(booking -> {
                    Map<String, Object> bookingWithCustomer = new HashMap<>();
                    bookingWithCustomer.put("booking", booking);
                    
                    if ("friend".equalsIgnoreCase(booking.getBookingFor()) && booking.getFriendName() != null) {
                        Map<String, Object> customerInfo = new HashMap<>();
                        customerInfo.put("id", booking.getUserId());
                        customerInfo.put("name", booking.getFriendName());
                        customerInfo.put("email", booking.getFriendEmail() != null ? booking.getFriendEmail() : "(not provided)");
                        customerInfo.put("phone", booking.getFriendPhone() != null ? booking.getFriendPhone() : "(not provided)");
                        customerInfo.put("bookingFor", "friend");
                        customerInfo.put("bookedBy", userDAO.findById(booking.getUserId()) != null ? userDAO.findById(booking.getUserId()).getName() : "Unknown");
                        bookingWithCustomer.put("customer", customerInfo);
                    } else {
                        User customer = userDAO.findById(booking.getUserId());
                        if (customer != null) {
                            Map<String, Object> customerInfo = new HashMap<>();
                            customerInfo.put("id", customer.getId());
                            customerInfo.put("name", customer.getName());
                            customerInfo.put("email", customer.getEmail());
                            customerInfo.put("phone", customer.getPhone());
                            customerInfo.put("bookingFor", "self");
                            customerInfo.put("bookedBy", customer.getName());
                            bookingWithCustomer.put("customer", customerInfo);
                        }
                    }
                    
                    return bookingWithCustomer;
                })
                .toList();
            
            logger.info("Retrieved {} bookings with customer details for provider ID: {}", bookingsWithCustomers.size(), providerId);
            return ResponseEntity.ok(bookingsWithCustomers);
        } catch (Exception e) {
            logger.error("Error retrieving bookings with customer details for provider ID {}: {}", providerId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to retrieve bookings");
        }
    }

    @PostMapping("/create-with-payment")
    public ResponseEntity<?> createBookingWithPayment(@RequestBody Map<String, Object> payload) {
        try {
            if (payload.get("userId") == null) return ResponseEntity.badRequest().body("userId is required");
            if (payload.get("serviceId") == null) return ResponseEntity.badRequest().body("serviceId is required");
            if (payload.get("bookingDate") == null) return ResponseEntity.badRequest().body("bookingDate is required");
            if (payload.get("bookingTime") == null) return ResponseEntity.badRequest().body("bookingTime is required");

            Long userId = Long.valueOf(payload.get("userId").toString());
            Long serviceId = Long.valueOf(payload.get("serviceId").toString());
            String bookingDate = payload.get("bookingDate").toString();
            String bookingTime = payload.get("bookingTime").toString();
            String addressLine = payload.get("addressLine") != null ? payload.get("addressLine").toString() : "";
            String city = payload.get("city") != null ? payload.get("city").toString() : "";
            String state = payload.get("state") != null ? payload.get("state").toString() : "";
            String zip = payload.get("zip") != null ? payload.get("zip").toString() : "";
            String bookingFor = payload.get("bookingFor") != null ? payload.get("bookingFor").toString() : "self";
            String paymentMethod = payload.get("paymentMethod") != null ? payload.get("paymentMethod").toString() : "ONLINE";
            String friendName = payload.get("friendName") != null ? payload.get("friendName").toString() : null;
            String friendEmail = payload.get("friendEmail") != null ? payload.get("friendEmail").toString() : null;
            String friendPhone = payload.get("friendPhone") != null ? payload.get("friendPhone").toString() : null;
            Long slotId = payload.containsKey("slotId") && payload.get("slotId") != null ? Long.valueOf(payload.get("slotId").toString()) : null;
            
            Service service = serviceDAO.findById(serviceId);
            if (service == null) return ResponseEntity.badRequest().body("Invalid service");
            
            // For ONLINE payments, enforce minimum price
            if ("ONLINE".equalsIgnoreCase(paymentMethod) && service.getPrice().compareTo(new java.math.BigDecimal("50")) < 0) {
                return ResponseEntity.badRequest().body("Minimum price is ₹50 due to Stripe requirements.");
            }

            if (slotId != null) {
                slotDAO.bookSlot(slotId);
            }
            
            Appointment booking = new Appointment();
            booking.setUserId(userId);
            booking.setServiceId(serviceId);
            booking.setProviderId(service.getProviderId());
            booking.setBookingDate(Date.valueOf(bookingDate));
            booking.setBookingTime(Time.valueOf(bookingTime));
            if ("ONLINE".equalsIgnoreCase(paymentMethod)) {
                booking.setStatus("PENDING");
            } else {
                booking.setStatus("CONFIRMED");
            }
            booking.setPaymentStatus("PENDING"); // Always PENDING initially
            booking.setAddressLine(addressLine);
            booking.setCity(city);
            booking.setState(state);
            booking.setZip(zip);
            booking.setBookingFor(bookingFor);
            booking.setFriendName(friendName);
            booking.setFriendEmail(friendEmail);
            booking.setFriendPhone(friendPhone);
            bookingDAO.save(booking);
            
            Transaction transaction = new Transaction();
            transaction.setBookingId(booking.getId());
            transaction.setUserId(userId);
            transaction.setServiceId(serviceId);
            transaction.setProviderId(service.getProviderId());
            transaction.setTransactionType("CONSULTATION_PAYMENT");
            transaction.setAmount(service.getPrice());
            transaction.setCurrency("INR");
            transaction.setStatus("PENDING");
            transaction.setPaymentMethod("ONLINE".equalsIgnoreCase(paymentMethod) ? "Stripe" : "Cash");
            transaction.setGatewayFee(new java.math.BigDecimal("0.00"));
            transaction.setPlatformFee(service.getPrice().multiply(new java.math.BigDecimal("0.20")));
            transaction.setProviderAmount(service.getPrice().multiply(new java.math.BigDecimal("0.80")));
            transaction.setDescription("Payment for service: " + service.getTitle());
            transaction.setMetadata("{\"booking_for\": \"" + bookingFor + "\", \"friend_name\": \"" + (friendName != null ? friendName : "") + "\", \"payment_mode\": \"" + paymentMethod + "\"}");
            transactionDAO.save(transaction);
            
            User provider = userDAO.findById(service.getProviderId());
            if (provider != null && provider.getEmail() != null && !provider.getEmail().isEmpty()) {
                try {
                    MimeMessage mimeMessage = mailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                    helper.setTo(provider.getEmail());
                    helper.setSubject("New MediBook Appointment Request - " + service.getTitle());
                    String customerInfo = "";
                    if ("friend".equalsIgnoreCase(booking.getBookingFor()) && booking.getFriendName() != null) {
                        customerInfo = "<h3 style='margin-top:32px;margin-bottom:10px;color:#2563eb;'>Customer Information</h3>" +
                            "<table style='width:100%;border-collapse:collapse;margin-bottom:20px;'>" +
                            "<tr><td style='padding:8px 0;color:#555;'>Booking For</td><td style='padding:8px 0;'><b>Friend/Family</b></td></tr>" +
                            "<tr><td style='padding:8px 0;color:#555;'>Name</td><td style='padding:8px 0;'>" + booking.getFriendName() + "</td></tr>" +
                            "<tr><td style='padding:8px 0;color:#555;'>Email</td><td style='padding:8px 0;'>" + (booking.getFriendEmail() != null ? booking.getFriendEmail() : "(not provided)") + "</td></tr>" +
                            "<tr><td style='padding:8px 0;color:#555;'>Phone</td><td style='padding:8px 0;'>" + (booking.getFriendPhone() != null ? booking.getFriendPhone() : "(not provided)") + "</td></tr>" +
                            "</table>";
                    } else {
                        User customer = userDAO.findById(booking.getUserId());
                        if (customer != null) {
                            customerInfo = "<h3 style='margin-top:32px;margin-bottom:10px;color:#2563eb;'>Customer Information</h3>" +
                                "<table style='width:100%;border-collapse:collapse;margin-bottom:20px;'>" +
                                "<tr><td style='padding:8px 0;color:#555;'>Booking For</td><td style='padding:8px 0;'><b>Self</b></td></tr>" +
                                "<tr><td style='padding:8px 0;color:#555;'>Name</td><td style='padding:8px 0;'>" + customer.getName() + "</td></tr>" +
                                "<tr><td style='padding:8px 0;color:#555;'>Email</td><td style='padding:8px 0;'>" + customer.getEmail() + "</td></tr>" +
                                "<tr><td style='padding:8px 0;color:#555;'>Phone</td><td style='padding:8px 0;'>" + (customer.getPhone() != null ? customer.getPhone() : "(not provided)") + "</td></tr>" +
                                "</table>";
                        }
                    }

                    String html = "" +
                        "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;border-radius:8px;overflow:hidden;'>" +
                        "<div style='background:#2563eb;color:#fff;padding:18px 24px;font-size:1.3em;font-weight:bold;'>MediBook - New Appointment Request</div>" +
                        "<div style='padding:24px;'>" +
                        "<p>Dear <b>" + provider.getName() + "</b>,</p>" +
                        "<p>🎉 Great news! You have received a new appointment request from a patient.</p>" +
                        "<h3 style='margin-top:32px;margin-bottom:10px;color:#2563eb;'>Appointment Details</h3>" +
                        "<table style='width:100%;border-collapse:collapse;margin-bottom:20px;'>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Doctor</td><td style='padding:8px 0;'><b>" + service.getTitle() + "</b></td></tr>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Date</td><td style='padding:8px 0;'>" + booking.getBookingDate() + "</td></tr>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Time</td><td style='padding:8px 0;'>" + booking.getBookingTime() + "</td></tr>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Address</td><td style='padding:8px 0;'>" + (booking.getAddressLine() != null ? booking.getAddressLine() : "") + ", " + (booking.getCity() != null ? booking.getCity() : "") + ", " + (booking.getState() != null ? booking.getState() : "") + " " + (booking.getZip() != null ? booking.getZip() : "") + "</td></tr>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Amount</td><td style='padding:8px 0;'><b style='color:#16a34a;'>₹" + service.getPrice() + "</b></td></tr>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Payment Method</td><td style='padding:8px 0;'><b>" + ("CASH".equalsIgnoreCase(paymentMethod) ? "Pay at Clinic (Cash)" : "Online (Stripe)") + "</b></td></tr>" +
                        "</table>" +
                        customerInfo +
                        "<div style='background:#f0f9ff;border-left:4px solid #2563eb;padding:16px;margin:20px 0;'>" +
                        "<p style='margin:0;color:#1e40af;'><b>⚡ Action Required:</b> Please review and respond to this appointment request through your doctor dashboard.</p>" +
                        "</div>" +
                        "<p style='color:#555;'><b>💡 Pro Tip:</b> Quick responses to appointment requests help boost patient trust and your MediBook ranking.</p>" +
                        "<hr style='margin:32px 0;border:none;border-top:1px solid #eee;'>" +
                        "<p style='color:#888;font-size:0.95em;'>If you have any questions or need assistance, please contact our support team.<br>Thank you for caring for patients on MediBook!</p>" +
                        "<div style='color:#2563eb;font-weight:bold;margin-top:18px;'>The MediBook Team</div>" +
                        "</div></div>";
                    helper.setText(html, true);
                    mailSender.send(mimeMessage);
                } catch (Exception e) {
                    logger.error("Failed to send HTML booking notification email: {}", e.getMessage(), e);
                }
            }
            
            // If payment method is CASH, skip Stripe and return success
            if ("CASH".equalsIgnoreCase(paymentMethod)) {
                Map<String, Object> resp = new HashMap<>();
                resp.put("bookingId", booking.getId());
                resp.put("message", "Booking confirmed. Please pay at clinic.");
                return ResponseEntity.ok(resp);
            }

            // Proceed with Stripe for ONLINE payment
            Stripe.apiKey = stripeApiKey;
            SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:3030/bookings?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl("http://localhost:3030/cancel.html")
                .addLineItem(
                    SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(
                            SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("inr")
                                .setUnitAmount(service.getPrice().multiply(new java.math.BigDecimal(100)).longValue())
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder().setName(service.getTitle()).build())
                                .build()
                        )
                        .build()
                )
                .putMetadata("bookingId", booking.getId().toString())
                .build();
            Session session = Session.create(params);
            booking.setStripeSessionId(session.getPaymentIntent());
            bookingDAO.updateStripeSessionId(booking.getId(), session.getPaymentIntent());
            Map<String, Object> resp = new HashMap<>();
            resp.put("sessionId", session.getId());
            resp.put("bookingId", booking.getId());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            logger.error("Failed to create booking/payment session: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to create booking/payment session: " + e.getMessage());
        }
    }

    @PostMapping("/confirm-payment")
    public ResponseEntity<?> confirmPaymentAndSendOtp(@RequestBody Map<String, Object> payload) {
        try {
            Long bookingId = Long.valueOf(payload.get("bookingId").toString());
            String sessionId = payload.get("sessionId").toString();
            Stripe.apiKey = stripeApiKey;
            Session session = Session.retrieve(sessionId);
            if (!"complete".equals(session.getStatus())) {
                return ResponseEntity.badRequest().body("Payment not completed");
            }
            Appointment booking = bookingDAO.findById(bookingId);
            if (booking == null) return ResponseEntity.badRequest().body("Invalid booking");
            bookingDAO.updatePaymentStatus(bookingId, "PAID");
            bookingDAO.updateStatus(bookingId, "CONFIRMED"); // Mark as CONFIRMED only after payment
            
            Transaction paymentTransaction = transactionDAO.findByBookingId(bookingId);
            if (paymentTransaction != null) {
                paymentTransaction.setStatus("SUCCESS");
                paymentTransaction.setStripePaymentIntentId(session.getPaymentIntent());
                transactionDAO.updateStatus(paymentTransaction.getId(), "SUCCESS");
                transactionDAO.updateStripePaymentIntentId(paymentTransaction.getId(), session.getPaymentIntent());
            }
            String otp = String.format("%06d", new SecureRandom().nextInt(999999));
            java.sql.Date bookingDate = booking.getBookingDate();
            java.sql.Timestamp expiry = java.sql.Timestamp.valueOf(bookingDate.toLocalDate().atTime(23, 59, 59));
            bookingDAO.updateOtp(bookingId, otp, expiry);
            logger.info("[OTP] BookingID: {}, User: {}, Service: {}, OTP: {}, Expires: {}", bookingId, userDAO.findById(booking.getUserId()) != null ? userDAO.findById(booking.getUserId()).getEmail() : "?", serviceDAO.findById(booking.getServiceId()) != null ? serviceDAO.findById(booking.getServiceId()).getTitle() : "?", otp, expiry);
            User user = userDAO.findById(booking.getUserId());
            Service service = serviceDAO.findById(booking.getServiceId());
            Transaction transaction = transactionDAO.findByBookingId(bookingId);
            if (user != null && user.getEmail() != null) {
                try {
                    MimeMessage mimeMessage = mailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                    helper.setTo(user.getEmail());
                    helper.setSubject("Your MediBook Appointment Receipt & OTP - " + service.getTitle());
                    String html = "" +
                        "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;border-radius:8px;overflow:hidden;'>" +
                        "<div style='background:#2563eb;color:#fff;padding:18px 24px;font-size:1.3em;font-weight:bold;'>MediBook - Appointment Receipt</div>" +
                        "<div style='padding:24px;'>" +
                        "<p>Dear <b>" + user.getName() + "</b>,</p>" +
                        "<p>Thank you for booking with MediBook! Your payment has been received and your appointment is confirmed.</p>" +
                        "<h3 style='margin-top:32px;margin-bottom:10px;color:#2563eb;'>Appointment Details</h3>" +
                        "<table style='width:100%;border-collapse:collapse;margin-bottom:20px;'>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Service</td><td style='padding:8px 0;'><b>" + service.getTitle() + "</b></td></tr>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Date</td><td style='padding:8px 0;'>" + booking.getBookingDate() + "</td></tr>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Time</td><td style='padding:8px 0;'>" + booking.getBookingTime() + "</td></tr>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Address</td><td style='padding:8px 0;'>" + (booking.getAddressLine() != null ? booking.getAddressLine() : "") + ", " + (booking.getCity() != null ? booking.getCity() : "") + ", " + (booking.getState() != null ? booking.getState() : "") + " " + (booking.getZip() != null ? booking.getZip() : "") + "</td></tr>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Provider</td><td style='padding:8px 0;'>" + (service.getProviderId() != null ? (userDAO.findById(service.getProviderId()) != null ? userDAO.findById(service.getProviderId()).getName() : "Unknown") : "Unknown") + "</td></tr>" +
                        "</table>" +
                        "<h3 style='margin-top:24px;margin-bottom:10px;color:#2563eb;'>Payment Details</h3>" +
                        "<table style='width:100%;border-collapse:collapse;margin-bottom:20px;'>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Amount Paid</td><td style='padding:8px 0;'><b>₹" + service.getPrice() + "</b></td></tr>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Transaction ID</td><td style='padding:8px 0;'>" + (transaction != null ? transaction.getId() : "N/A") + "</td></tr>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Payment Intent ID</td><td style='padding:8px 0;'>" + session.getPaymentIntent() + "</td></tr>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Payment Method</td><td style='padding:8px 0;'>" + (transaction != null ? transaction.getPaymentMethod() : "Stripe") + "</td></tr>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Payment Status</td><td style='padding:8px 0;'>Completed</td></tr>" +
                        "</table>" +
                        "<h3 style='margin-top:24px;margin-bottom:10px;color:#2563eb;'>Your OTP for Appointment Completion</h3>" +
                        "<div style='font-size:1.5em;font-weight:bold;letter-spacing:2px;margin-bottom:10px;'>" + otp + "</div>" +
                        "<p style='color:#555;'>Please share this OTP with your doctor after the consultation is completed. This OTP will expire at the end of your appointment date.</p>" +
                        "<hr style='margin:32px 0;border:none;border-top:1px solid #eee;'>" +
                        "<div style='text-align:center;margin:32px 0;'>" +
                        "<a href='http://localhost:3000/success.html?session_id=" + session.getPaymentIntent() + "&booking_id=" + booking.getId() + "' style='background:#2563eb;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;'>Download Receipt</a>" +
                        "</div>" +
                        "<p style='color:#888;font-size:0.95em;'>If you have any questions or need assistance, please contact our support team.<br>Thank you for choosing MediBook!</p>" +
                        "<div style='color:#2563eb;font-weight:bold;margin-top:18px;'>The MediBook Team</div>" +
                        "</div></div>";
                    helper.setText(html, true);
                    mailSender.send(mimeMessage);
                } catch (Exception e) {
                    logger.error("Failed to send HTML receipt email: {}", e.getMessage(), e);
                }
            }
            return ResponseEntity.ok("Payment confirmed and OTP sent");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to confirm payment/send OTP");
        }
    }

    @PostMapping("/complete-with-otp")
    public ResponseEntity<?> completeBookingWithOtp(@RequestBody Map<String, Object> payload) {
        try {
            Long bookingId = Long.valueOf(payload.get("bookingId").toString());
            String otp = payload.get("otp").toString();
            Appointment booking = bookingDAO.findById(bookingId);
            if (booking == null) return ResponseEntity.badRequest().body("Invalid booking");
            if (!"PAID".equals(booking.getPaymentStatus())) return ResponseEntity.badRequest().body("Appointment not paid");
            if (!otp.equals(booking.getOtp())) return ResponseEntity.badRequest().body("Invalid OTP");
            if (booking.getOtpExpiry() != null && booking.getOtpExpiry().before(new java.util.Date())) return ResponseEntity.badRequest().body("OTP expired");
            bookingDAO.updateStatus(bookingId, "COMPLETED");
            java.math.BigDecimal payout = serviceDAO.findById(booking.getServiceId()).getPrice().multiply(new java.math.BigDecimal("0.8"));
            bookingDAO.updateProviderPayout(bookingId, "PAID", payout);
            
            Transaction payoutTransaction = new Transaction();
            payoutTransaction.setBookingId(bookingId);
            payoutTransaction.setUserId(booking.getUserId());
            payoutTransaction.setServiceId(booking.getServiceId());
            payoutTransaction.setProviderId(booking.getProviderId());
            payoutTransaction.setTransactionType("PAYOUT");
            payoutTransaction.setAmount(payout);
            payoutTransaction.setCurrency("INR");
            payoutTransaction.setStatus("SUCCESS");
            payoutTransaction.setPaymentMethod("Bank Transfer");
            payoutTransaction.setGatewayFee(new java.math.BigDecimal("0.00"));
            payoutTransaction.setPlatformFee(new java.math.BigDecimal("0.00"));
            payoutTransaction.setProviderAmount(payout);
            payoutTransaction.setDescription("Provider payout for completed service");
            payoutTransaction.setMetadata("{\"payout_type\": \"service_completion\", \"original_transaction_id\": \"" + 
                (transactionDAO.findByBookingId(bookingId) != null ? transactionDAO.findByBookingId(bookingId).getId() : "N/A") + "\"}");
            transactionDAO.save(payoutTransaction);
            User provider = userDAO.findById(booking.getProviderId());
            Service service = serviceDAO.findById(booking.getServiceId());
            if (provider != null && provider.getEmail() != null && !provider.getEmail().isEmpty()) {
                try {
                    String customerInfo = "";
                    if ("friend".equalsIgnoreCase(booking.getBookingFor()) && booking.getFriendName() != null) {
                        customerInfo = "<h3 style='margin-top:32px;margin-bottom:10px;color:#16a34a;'>Customer Information</h3>" +
                            "<table style='width:100%;border-collapse:collapse;margin-bottom:20px;'>" +
                            "<tr><td style='padding:8px 0;color:#555;'>Booking For</td><td style='padding:8px 0;'><b>Friend/Family</b></td></tr>" +
                            "<tr><td style='padding:8px 0;color:#555;'>Name</td><td style='padding:8px 0;'>" + booking.getFriendName() + "</td></tr>" +
                            "<tr><td style='padding:8px 0;color:#555;'>Email</td><td style='padding:8px 0;'>" + (booking.getFriendEmail() != null ? booking.getFriendEmail() : "(not provided)") + "</td></tr>" +
                            "<tr><td style='padding:8px 0;color:#555;'>Phone</td><td style='padding:8px 0;'>" + (booking.getFriendPhone() != null ? booking.getFriendPhone() : "(not provided)") + "</td></tr>" +
                            "</table>";
                    } else {
                        User customer = userDAO.findById(booking.getUserId());
                        if (customer != null) {
                            customerInfo = "<h3 style='margin-top:32px;margin-bottom:10px;color:#16a34a;'>Customer Information</h3>" +
                                "<table style='width:100%;border-collapse:collapse;margin-bottom:20px;'>" +
                                "<tr><td style='padding:8px 0;color:#555;'>Booking For</td><td style='padding:8px 0;'><b>Self</b></td></tr>" +
                                "<tr><td style='padding:8px 0;color:#555;'>Name</td><td style='padding:8px 0;'>" + customer.getName() + "</td></tr>" +
                                "<tr><td style='padding:8px 0;color:#555;'>Email</td><td style='padding:8px 0;'>" + customer.getEmail() + "</td></tr>" +
                                "<tr><td style='padding:8px 0;color:#555;'>Phone</td><td style='padding:8px 0;'>" + (customer.getPhone() != null ? customer.getPhone() : "(not provided)") + "</td></tr>" +
                                "</table>";
                        }
                    }

                    java.math.BigDecimal payoutAmount = service.getPrice().multiply(new java.math.BigDecimal("0.8"));
                    emailService.sendAppointmentCompletedEmailProvider(provider.getEmail(), provider.getName(), service.getTitle(), "₹" + payoutAmount, booking.getBookingDate().toString());
                } catch (Exception e) {
                    logger.error("Failed to send HTML completion notification email: {}", e.getMessage(), e);
                }
            }
            return ResponseEntity.ok("Appointment completed and payout processed");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to complete booking with OTP");
        }
    }

    @PostMapping
    public ResponseEntity<?> addBooking(@RequestBody Appointment booking) {
        logger.info("POST /appointments - Creating new appointment for doctor profile ID: {}, patient ID: {}", booking.getServiceId(), booking.getUserId());
        try {
            Service service = serviceDAO.findById(booking.getServiceId());
            if (service == null) {
                return ResponseEntity.status(400).body("Invalid service ID");
            }
            booking.setProviderId(service.getProviderId());

            int rows = bookingDAO.save(booking);
            if (rows > 0) {
                logger.info("Appointment created successfully for doctor profile ID: {}, patient ID: {}", booking.getServiceId(), booking.getUserId());
                User provider = userDAO.findById(service.getProviderId());
                if (provider != null && provider.getEmail() != null && !provider.getEmail().isEmpty()) {
                    String customerInfo = "";
                    if ("friend".equalsIgnoreCase(booking.getBookingFor()) && booking.getFriendName() != null) {
                        customerInfo = "\nCustomer Information:\n" +
                            "-------------------\n" +
                            "Booking For: Friend/Family\n" +
                            "Name: " + booking.getFriendName() + "\n" +
                            "Email: " + (booking.getFriendEmail() != null ? booking.getFriendEmail() : "(not provided)") + "\n" +
                            "Phone: " + (booking.getFriendPhone() != null ? booking.getFriendPhone() : "(not provided)") + "\n";
                    } else {
                        User customer = userDAO.findById(booking.getUserId());
                        if (customer != null) {
                            customerInfo = "\nCustomer Information:\n" +
                                "-------------------\n" +
                                "Booking For: Self\n" +
                                "Name: " + customer.getName() + "\n" +
                                "Email: " + customer.getEmail() + "\n" +
                                "Phone: " + (customer.getPhone() != null ? customer.getPhone() : "(not provided)") + "\n";
                        }
                    }

                    SimpleMailMessage message = new SimpleMailMessage();
                    message.setTo(provider.getEmail());
                    message.setSubject("New MediBook Appointment Request - " + service.getTitle());
                    message.setText(
                        "Dear " + provider.getName() + ",\n\n" +
                        "You have received a new appointment request!\n\n" +
                        "Appointment Details:\n" +
                        "---------------\n" +
                        "Doctor: " + service.getTitle() + "\n" +
                        "Date: " + booking.getBookingDate() + "\n" +
                        "Time: " + booking.getBookingTime() + "\n" +
                        "Address: " + (booking.getAddressLine() != null ? booking.getAddressLine() : "") + ", " + (booking.getCity() != null ? booking.getCity() : "") + ", " + (booking.getState() != null ? booking.getState() : "") + " " + (booking.getZip() != null ? booking.getZip() : "") + "\n" +
                        "Amount: ₹" + service.getPrice() + customerInfo + "\n" +
                        "Please review and accept/reject this appointment request through your doctor dashboard.\n\n" +
                        "Note: Fast responses to appointment requests improve your MediBook visibility.\n\n" +
                        "Best regards,\n" +
                        "The MediBook Team"
                    );
                    mailSender.send(message);
                }
                return ResponseEntity.ok("Appointment created");
            } else {
                logger.error("Failed to create appointment for doctor profile ID: {}, patient ID: {}", booking.getServiceId(), booking.getUserId());
                return ResponseEntity.status(500).body("Failed to create appointment");
            }
        } catch (Exception e) {
            logger.error("Error creating appointment: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to create appointment");
        }
    }

    @PutMapping("/{bookingId}")
    public ResponseEntity<?> updateBookingStatus(@PathVariable Long bookingId, @RequestBody Appointment booking) {
        logger.info("PUT /appointments/{} - Updating appointment status to: {}", bookingId, booking.getStatus());
        try {
            int rows = bookingDAO.updateStatus(bookingId, booking.getStatus());
            if (rows > 0) {
                logger.info("Appointment status updated successfully for appointment ID: {} to status: {}", bookingId, booking.getStatus());
                if ("CONFIRMED".equalsIgnoreCase(booking.getStatus()) ||
                    "CANCELLED".equalsIgnoreCase(booking.getStatus()) ||
                    "COMPLETED".equalsIgnoreCase(booking.getStatus())) {
                    Appointment updatedBooking = bookingDAO.findById(bookingId);
                    if (updatedBooking != null) {
                        User user = userDAO.findById(updatedBooking.getUserId());
                        Service service = serviceDAO.findById(updatedBooking.getServiceId());
                        if (user != null && user.getEmail() != null) {
                            SimpleMailMessage message = new SimpleMailMessage();
                            message.setTo(user.getEmail());
                            if ("CONFIRMED".equalsIgnoreCase(booking.getStatus())) {
                                message.setSubject("Appointment Confirmed - " + service.getTitle());
                                message.setText(
                                    "Dear " + user.getName() + ",\n\n" +
                                    "Great news! Your appointment has been confirmed by the doctor.\n\n" +
                                    "Appointment Details:\n" +
                                    "---------------\n" +
                                    "Doctor: " + service.getTitle() + "\n" +
                                    "Date: " + updatedBooking.getBookingDate() + "\n" +
                                    "Time: " + updatedBooking.getBookingTime() + "\n" +
                                    "Address: " + (updatedBooking.getAddressLine() != null ? updatedBooking.getAddressLine() : "") + ", " + (updatedBooking.getCity() != null ? updatedBooking.getCity() : "") + ", " + (updatedBooking.getState() != null ? updatedBooking.getState() : "") + " " + (updatedBooking.getZip() != null ? updatedBooking.getZip() : "") + "\n\n" +
                                    "What's Next?\n" +
                                    "-----------\n" +
                                    "1. Arrive at the clinic or join the call on time\n" +
                                    "2. After the consultation, provide the OTP sent to you\n" +
                                    "3. Rate and review your doctor in MediBook\n\n" +
                                    "Need to reschedule or cancel?\n" +
                                    "Please contact us at least 24 hours before the scheduled time.\n\n" +
                                    "Best regards,\n" +
                                    "The MediBook Team"
                                );
                            } else if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
                                message.setSubject("Appointment Cancelled - " + service.getTitle());
                                String refundText = "";
                                if (updatedBooking.getPaymentStatus() != null && updatedBooking.getPaymentStatus().equalsIgnoreCase("PAID")) {
                                    refundText = "\nRefund Details:\n" +
                                        "---------------\n" +
                                        "Your payment will be refunded within 5-7 business days.\n" +
                                        "Refund amount: $" + service.getPrice() + "\n";
                                }
                                message.setText(
                                    "Dear " + user.getName() + ",\n\n" +
                                    "Your appointment has been cancelled.\n\n" +
                                    "Cancelled Appointment Details:\n" +
                                    "---------------\n" +
                                    "Doctor: " + service.getTitle() + "\n" +
                                    "Date: " + updatedBooking.getBookingDate() + "\n" +
                                    "Time: " + updatedBooking.getBookingTime() + "\n" +
                                    refundText + "\n" +
                                    "If you have any questions, please contact our support team.\n\n" +
                                    "Best regards,\n" +
                                    "The MediBook Team"
                                );
                            } else if ("COMPLETED".equalsIgnoreCase(booking.getStatus())) {
                                emailService.sendAppointmentCompletedEmailCustomer(user.getEmail(), user.getName(), service.getTitle(), updatedBooking.getBookingDate().toString());
                            } else {
                                // Fallback for other status updates (CONFIRMED/CANCELLED) - keeping existing logic for now
                                // Or we could migrate them too. For now let's focus on the user request "completed mail"
                                try {
                                    mailSender.send(message);
                                    logger.info("Status update email sent to: {}", user.getEmail());
                                } catch (Exception e) {
                                  logger.error("Failed to send status update email to {}: {}", user.getEmail(), e.getMessage());
                                }
                            }
                        }
                    }
                }
                return ResponseEntity.ok("Appointment status updated successfully");
            } else {
                logger.error("Failed to update appointment status for appointment ID: {}", bookingId);
                return ResponseEntity.status(500).body("Failed to update appointment status");
            }
        } catch (Exception e) {
            logger.error("Error updating appointment status for appointment ID {}: {}", bookingId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to update appointment status");
        }
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long bookingId) {
        logger.info("DELETE /appointments/{} - Deleting appointment", bookingId);
        try {
            int rows = bookingDAO.deleteById(bookingId);
            if (rows > 0) {
                logger.info("Appointment deleted successfully: ID {}", bookingId);
                return ResponseEntity.ok("Appointment deleted successfully");
            } else {
                logger.warn("Appointment not found for deletion: ID {}", bookingId);
                return ResponseEntity.status(404).body("Appointment not found");
            }
        } catch (Exception e) {
            logger.error("Error deleting appointment ID {}: {}", bookingId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to delete appointment");
        }
    }
}

