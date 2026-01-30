package com.local.localservice.model;

import java.time.LocalTime;
import java.time.LocalDateTime;

public class DoctorAvailability {
    private Long id;
    private Long doctorId;
    private LocalTime morningStartTime;
    private LocalTime morningEndTime;
    private LocalTime afternoonStartTime;
    private LocalTime afternoonEndTime;
    private int capacity = 1;
    private boolean isActive;
    private LocalDateTime createdAt;

    public DoctorAvailability() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public LocalTime getMorningStartTime() { return morningStartTime; }
    public void setMorningStartTime(LocalTime morningStartTime) { this.morningStartTime = morningStartTime; }

    public LocalTime getMorningEndTime() { return morningEndTime; }
    public void setMorningEndTime(LocalTime morningEndTime) { this.morningEndTime = morningEndTime; }

    public LocalTime getAfternoonStartTime() { return afternoonStartTime; }
    public void setAfternoonStartTime(LocalTime afternoonStartTime) { this.afternoonStartTime = afternoonStartTime; }

    public LocalTime getAfternoonEndTime() { return afternoonEndTime; }
    public void setAfternoonEndTime(LocalTime afternoonEndTime) { this.afternoonEndTime = afternoonEndTime; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
