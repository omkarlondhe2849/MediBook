package com.local.localservice.dao;

import com.local.localservice.model.Slot;
import com.local.localservice.model.Vacation;
import com.local.localservice.model.DoctorAvailability;
import java.time.LocalDate;
import java.time.LocalTime;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class SlotDAO {

    private final JdbcTemplate jdbcTemplate;

    public SlotDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Slot> slotRowMapper = (rs, rowNum) -> {
        Slot slot = new Slot();
        slot.setId(rs.getLong("id"));
        slot.setDoctorId(rs.getLong("doctor_id"));
        slot.setStartTime(rs.getTimestamp("start_time").toLocalDateTime());
        slot.setEndTime(rs.getTimestamp("end_time").toLocalDateTime());
        slot.setBooked(rs.getBoolean("is_booked"));
        slot.setCapacity(rs.getInt("capacity"));
        slot.setBookedCount(rs.getInt("booked_count"));
        slot.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return slot;
    };

    private final RowMapper<Vacation> vacationRowMapper = (rs, rowNum) -> {
        Vacation vac = new Vacation();
        vac.setId(rs.getLong("id"));
        vac.setDoctorId(rs.getLong("doctor_id"));
        vac.setStartDate(rs.getDate("start_date").toLocalDate());
        vac.setEndDate(rs.getDate("end_date").toLocalDate());
        vac.setReason(rs.getString("reason"));
        vac.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return vac;
    };

    private final RowMapper<DoctorAvailability> availabilityRowMapper = (rs, rowNum) -> {
        DoctorAvailability da = new DoctorAvailability();
        da.setId(rs.getLong("id"));
        da.setDoctorId(rs.getLong("doctor_id"));
        da.setMorningStartTime(rs.getTime("morning_start_time") != null ? rs.getTime("morning_start_time").toLocalTime() : null);
        da.setMorningEndTime(rs.getTime("morning_end_time") != null ? rs.getTime("morning_end_time").toLocalTime() : null);
        da.setAfternoonStartTime(rs.getTime("afternoon_start_time") != null ? rs.getTime("afternoon_start_time").toLocalTime() : null);
        da.setAfternoonEndTime(rs.getTime("afternoon_end_time") != null ? rs.getTime("afternoon_end_time").toLocalTime() : null);
        da.setCapacity(rs.getInt("capacity"));
        da.setActive(rs.getBoolean("is_active"));
        da.setCreatedAt(rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toLocalDateTime() : null);
        return da;
    };

    public int createSlot(Slot slot) {
        String sql = "INSERT INTO slots (doctor_id, start_time, end_time, is_booked, capacity, booked_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)";
        return jdbcTemplate.update(sql, slot.getDoctorId(), slot.getStartTime(), slot.getEndTime(), slot.isBooked(), slot.getCapacity(), slot.getBookedCount(), slot.getCreatedAt());
    }

    public List<Slot> findByDoctorId(Long doctorId) {
        String sql = "SELECT * FROM slots WHERE doctor_id = ? ORDER BY start_time";
        return jdbcTemplate.query(sql, slotRowMapper, doctorId);
    }
    
    public List<Slot> findAvailableSlotsByDoctorId(Long doctorId) {
        String sql = "SELECT * FROM slots WHERE doctor_id = ? AND is_booked = FALSE ORDER BY start_time";
        List<Slot> slots = jdbcTemplate.query(sql, slotRowMapper, doctorId);
        org.slf4j.LoggerFactory.getLogger(SlotDAO.class).info("Found {} available slots for doctorId {}", slots.size(), doctorId);
        return slots;
    }

    public int bookSlot(Long slotId) {
        // Increment booked_count. If new count >= capacity, set is_booked = TRUE
        String sql = "UPDATE slots SET booked_count = booked_count + 1, is_booked = CASE WHEN booked_count + 1 >= capacity THEN TRUE ELSE FALSE END WHERE id = ? AND is_booked = FALSE";
        return jdbcTemplate.update(sql, slotId);
    }
    
    public Slot findById(Long id) {
        String sql = "SELECT * FROM slots WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, slotRowMapper, id);
    }

    public boolean isDoctorVerified(Long doctorId) {
        String sql = "SELECT is_verified FROM doctor_profiles WHERE doctor_id = ?";
        try {
            Boolean verified = jdbcTemplate.queryForObject(sql, Boolean.class, doctorId);
            return Boolean.TRUE.equals(verified);
        } catch (EmptyResultDataAccessException e) {
            return false;
        }
    }

    // Vacation Methods
    public int createVacation(Vacation vacation) {
        String sql = "INSERT INTO doctor_vacations (doctor_id, start_date, end_date, reason) VALUES (?, ?, ?, ?)";
        return jdbcTemplate.update(sql, vacation.getDoctorId(), vacation.getStartDate(), vacation.getEndDate(), vacation.getReason());
    }

    public List<Vacation> findVacationsByDoctorId(Long doctorId) {
        String sql = "SELECT * FROM doctor_vacations WHERE doctor_id = ? ORDER BY start_date";
        return jdbcTemplate.query(sql, vacationRowMapper, doctorId);
    }
    
    public int deleteVacation(Long vacationId) {
        String sql = "DELETE FROM doctor_vacations WHERE id = ?";
        return jdbcTemplate.update(sql, vacationId);
    }

    // Availability Methods
    public int saveAvailability(DoctorAvailability da) {
        // Check if exists
        String checkSql = "SELECT COUNT(*) FROM doctor_availabilities WHERE doctor_id = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, da.getDoctorId());
        
        if (count != null && count > 0) {
            String updateSql = "UPDATE doctor_availabilities SET morning_start_time=?, morning_end_time=?, afternoon_start_time=?, afternoon_end_time=?, capacity=?, is_active=? WHERE doctor_id=?";
            return jdbcTemplate.update(updateSql, da.getMorningStartTime(), da.getMorningEndTime(), da.getAfternoonStartTime(), da.getAfternoonEndTime(), da.getCapacity(), da.isActive(), da.getDoctorId());
        } else {
            String insertSql = "INSERT INTO doctor_availabilities (doctor_id, morning_start_time, morning_end_time, afternoon_start_time, afternoon_end_time, capacity, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)";
            return jdbcTemplate.update(insertSql, da.getDoctorId(), da.getMorningStartTime(), da.getMorningEndTime(), da.getAfternoonStartTime(), da.getAfternoonEndTime(), da.getCapacity(), da.isActive());
        }
    }

    public DoctorAvailability findAvailabilityByDoctorId(Long doctorId) {
        String sql = "SELECT * FROM doctor_availabilities WHERE doctor_id = ?";
        try {
            return jdbcTemplate.queryForObject(sql, availabilityRowMapper, doctorId);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }
}
