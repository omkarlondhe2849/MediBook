-- ========================================
-- MEDIBOOK DATABASE SCHEMA
-- Medical Appointment Booking System
-- ========================================
-- Database: medibook_db
-- This schema uses medical-specific naming conventions
-- for better clarity and domain alignment
-- ========================================

-- Users (Patients, Doctors, Admins)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100),
    phone VARCHAR(20),
    role ENUM('PATIENT', 'DOCTOR', 'ADMIN') DEFAULT 'PATIENT',
    reset_token VARCHAR(255),
    reset_token_expiry VARCHAR(50),
    profile_photo VARCHAR(255),
    identity_proof VARCHAR(255),
    license_copy VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctor Profiles (Medical Services)
CREATE TABLE IF NOT EXISTS doctor_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_name VARCHAR(100),
    specialization VARCHAR(100),
    qualification TEXT,
    experience_years INT,
    short_bio TEXT,
    clinic_name VARCHAR(150),
    clinic_address VARCHAR(255),
    clinic_city VARCHAR(100),
    clinic_state VARCHAR(100),
    clinic_zip VARCHAR(20),
    consultation_fee DECIMAL(10,2),
    doctor_id BIGINT,
    is_verified BOOLEAN DEFAULT FALSE,
    kyc_document_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Medical Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT,
    doctor_profile_id BIGINT,
    doctor_id BIGINT,
    appointment_date DATE,
    appointment_time TIME,
    appointment_status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REFUNDED') DEFAULT 'PENDING',
    payment_status ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    stripe_session_id VARCHAR(255),
    appointment_otp VARCHAR(10),
    otp_expiry DATETIME,
    doctor_payout_status ENUM('PENDING', 'PAID') DEFAULT 'PENDING',
    doctor_payout_amount DECIMAL(10,2),
    patient_address VARCHAR(255),
    patient_city VARCHAR(100),
    patient_state VARCHAR(100),
    patient_zip VARCHAR(20),
    appointment_for VARCHAR(50) DEFAULT 'self',
    care_recipient_name VARCHAR(100),
    care_recipient_email VARCHAR(100),
    care_recipient_phone VARCHAR(20),
    medical_notes TEXT,
    symptoms TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (doctor_profile_id) REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Doctor Reviews & Ratings
CREATE TABLE IF NOT EXISTS doctor_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT,
    doctor_profile_id BIGINT,
    appointment_id BIGINT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_comment TEXT,
    treatment_satisfaction INT CHECK (treatment_satisfaction >= 1 AND treatment_satisfaction <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (doctor_profile_id) REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

-- Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id BIGINT,
    patient_id BIGINT,
    doctor_profile_id BIGINT,
    doctor_id BIGINT,
    transaction_type ENUM('CONSULTATION_PAYMENT', 'REFUND', 'DOCTOR_PAYOUT') DEFAULT 'CONSULTATION_PAYMENT',
    amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'INR',
    stripe_payment_intent_id VARCHAR(255),
    stripe_session_id VARCHAR(255),
    payment_status ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED') DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    gateway_fee DECIMAL(10,2) DEFAULT 0.00,
    platform_fee DECIMAL(10,2) DEFAULT 0.00,
    doctor_net_amount DECIMAL(10,2),
    transaction_description TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (doctor_profile_id) REFERENCES doctor_profiles(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Doctor Availability Slots
CREATE TABLE IF NOT EXISTS slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT,
    start_time DATETIME,
    end_time DATETIME,
    is_booked BOOLEAN DEFAULT FALSE,
    capacity INT DEFAULT 1,
    booked_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Complaints
CREATE TABLE IF NOT EXISTS complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT,
    doctor_id BIGINT,
    appointment_id BIGINT,
    subject VARCHAR(255),
    description TEXT,
    status ENUM('PENDING', 'RESOLVED', 'DISMISSED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT,
    receiver_id BIGINT,
    content TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- Doctor Vacations
CREATE TABLE IF NOT EXISTS doctor_vacations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT,
    start_date DATE,
    end_date DATE,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Doctor Daily Availability Settings
CREATE TABLE IF NOT EXISTS doctor_availabilities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT,
    morning_start_time TIME,
    morning_end_time TIME,
    afternoon_start_time TIME,
    afternoon_end_time TIME,
    capacity INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);
