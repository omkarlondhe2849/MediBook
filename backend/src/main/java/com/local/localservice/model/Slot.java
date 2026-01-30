package com.local.localservice.model;

import java.time.LocalDateTime;

public class Slot {
    private Long id;
    private Long doctorId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private boolean isBooked;
    private int capacity = 1;
    private int bookedCount = 0;
    private LocalDateTime createdAt;

    public Slot() {}

    public Slot(Long doctorId, LocalDateTime startTime, LocalDateTime endTime) {
        this.doctorId = doctorId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.isBooked = false;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public boolean isBooked() { return isBooked; }
    public void setBooked(boolean booked) { isBooked = booked; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public int getBookedCount() { return bookedCount; }
    public void setBookedCount(int bookedCount) { this.bookedCount = bookedCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
