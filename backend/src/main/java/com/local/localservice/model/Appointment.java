package com.local.localservice.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.sql.Date;
import java.sql.Time;

public class Appointment {
    private Long id;

    @JsonProperty("patientId")
    private Long userId;

    @JsonProperty("doctorProfileId")
    private Long serviceId;

    @JsonProperty("doctorId")
    private Long providerId;

    @JsonProperty("appointmentDate")
    private Date bookingDate;

    @JsonProperty("appointmentTime")
    private Time bookingTime;

    @JsonProperty("appointmentStatus")
    private String status;  // PENDING, CONFIRMED, COMPLETED, CANCELLED

    private String createdAt;

    private String addressLine;
    private String city;
    private String state;
    private String zip;

    @JsonProperty("paymentStatus")
    private String paymentStatus;

    private String stripeSessionId;
    private String otp;

    private java.sql.Timestamp otpExpiry;

    @JsonProperty("doctorPayoutStatus")
    private String providerPayoutStatus;

    @JsonProperty("doctorPayoutAmount")
    private java.math.BigDecimal providerPayoutAmount;

    @JsonProperty("appointmentFor")
    private String bookingFor; // self or friend

    @JsonProperty("careRecipientName")
    private String friendName;

    @JsonProperty("careRecipientEmail")
    private String friendEmail;

    @JsonProperty("careRecipientPhone")
    private String friendPhone;

    // Transient fields for display
    @JsonProperty("doctorName")
    private String doctorName;

    @JsonProperty("specialization")
    private String specialization;

    @JsonProperty("clinicName")
    private String clinicName;

    @JsonProperty("price")
    private java.math.BigDecimal price;

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getClinicName() { return clinicName; }
    public void setClinicName(String clinicName) { this.clinicName = clinicName; }

    public java.math.BigDecimal getPrice() { return price; }
    public void setPrice(java.math.BigDecimal price) { this.price = price; }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public Long getProviderId() {
        return providerId;
    }

    public void setProviderId(Long providerId) {
        this.providerId = providerId;
    }

    public Date getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(Date bookingDate) {
        this.bookingDate = bookingDate;
    }

    public Time getBookingTime() {
        return bookingTime;
    }

    public void setBookingTime(Time bookingTime) {
        this.bookingTime = bookingTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getAddressLine() {
        return addressLine;
    }

    public void setAddressLine(String addressLine) {
        this.addressLine = addressLine;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getZip() {
        return zip;
    }

    public void setZip(String zip) {
        this.zip = zip;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getStripeSessionId() {
        return stripeSessionId;
    }

    public void setStripeSessionId(String stripeSessionId) {
        this.stripeSessionId = stripeSessionId;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public java.sql.Timestamp getOtpExpiry() {
        return otpExpiry;
    }

    public void setOtpExpiry(java.sql.Timestamp otpExpiry) {
        this.otpExpiry = otpExpiry;
    }

    public String getBookingFor() {
        return bookingFor;
    }

    public void setBookingFor(String bookingFor) {
        this.bookingFor = bookingFor;
    }

    public String getFriendName() {
        return friendName;
    }

    public void setFriendName(String friendName) {
        this.friendName = friendName;
    }

    public String getFriendEmail() {
        return friendEmail;
    }

    public void setFriendEmail(String friendEmail) {
        this.friendEmail = friendEmail;
    }

    public String getFriendPhone() {
        return friendPhone;
    }

    public void setFriendPhone(String friendPhone) {
        this.friendPhone = friendPhone;
    }

    public String getProviderPayoutStatus() {
        return providerPayoutStatus;
    }

    public void setProviderPayoutStatus(String providerPayoutStatus) {
        this.providerPayoutStatus = providerPayoutStatus;
    }

    public java.math.BigDecimal getProviderPayoutAmount() {
        return providerPayoutAmount;
    }

    public void setProviderPayoutAmount(java.math.BigDecimal providerPayoutAmount) {
        this.providerPayoutAmount = providerPayoutAmount;
    }

    @Override
    public String toString() {
        return "Appointment [id=" + id +
                ", userId=" + userId +
                ", serviceId=" + serviceId +
                ", providerId=" + providerId +
                ", bookingDate=" + bookingDate +
                ", bookingTime=" + bookingTime +
                ", status=" + status +
                ", createdAt=" + createdAt +
                ", addressLine=" + addressLine +
                ", city=" + city +
                ", state=" + state +
                ", zip=" + zip +
                "]";
    }
}


