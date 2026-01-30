package com.local.localservice.dao;

import com.local.localservice.model.Message;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class MessageDAO {

    private final JdbcTemplate jdbcTemplate;

    public MessageDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Message> messageRowMapper = (rs, rowNum) -> {
        Message message = new Message();
        message.setId(rs.getLong("id"));
        message.setSenderId(rs.getLong("sender_id"));
        message.setReceiverId(rs.getLong("receiver_id"));
        message.setContent(rs.getString("content"));
        message.setSentAt(rs.getTimestamp("sent_at").toLocalDateTime());
        message.setRead(rs.getBoolean("is_read"));
        return message;
    };

    public int createMessage(Message message) {
        String sql = "INSERT INTO messages (sender_id, receiver_id, content, sent_at, is_read) VALUES (?, ?, ?, ?, ?)";
        return jdbcTemplate.update(sql, message.getSenderId(), message.getReceiverId(), message.getContent(), java.time.LocalDateTime.now(), false);
    }

    public List<Message> findConversation(Long user1Id, Long user2Id) {
        String sql = "SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY sent_at";
        return jdbcTemplate.query(sql, messageRowMapper, user1Id, user2Id, user2Id, user1Id);
    }

    public int markAsRead(Long messageId) {
        String sql = "UPDATE messages SET is_read = TRUE WHERE id = ?";
        return jdbcTemplate.update(sql, messageId);
    }
    public List<java.util.Map<String, Object>> findRecentConversations(Long userId) {
        String sql = "SELECT u.id, u.name, u.profile_photo, m.content as last_message, m.sent_at, m.is_read " +
                     "FROM users u " +
                     "JOIN (SELECT CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as other_id, " +
                     "MAX(sent_at) as max_sent_at " +
                     "FROM messages WHERE sender_id = ? OR receiver_id = ? " +
                     "GROUP BY other_id) latest ON u.id = latest.other_id " +
                     "JOIN messages m ON (m.sender_id = ? AND m.receiver_id = u.id AND m.sent_at = latest.max_sent_at) " +
                     "OR (m.sender_id = u.id AND m.receiver_id = ? AND m.sent_at = latest.max_sent_at) " +
                     "ORDER BY m.sent_at DESC";
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            java.util.Map<String, Object> conv = new java.util.HashMap<>();
            conv.put("userId", rs.getLong("id"));
            conv.put("name", rs.getString("name"));
            conv.put("profilePhoto", rs.getString("profile_photo"));
            conv.put("lastMessage", rs.getString("last_message"));
            conv.put("lastMessageTime", rs.getTimestamp("sent_at"));
            conv.put("isRead", rs.getBoolean("is_read"));
            return conv;
        }, userId, userId, userId, userId, userId);
    }
}
