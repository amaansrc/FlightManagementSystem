package com.example.FlightMgmtSys.dao;

import com.example.FlightMgmtSys.exception.RecordNotFoundException;
import com.example.FlightMgmtSys.model.User;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigInteger;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

/**
 * JDBC-backed implementation of {@link UserDao}.
 * Uses soft-delete (user_state = 'INACTIVE') rather than physical deletion.
 */
@Repository
public class UserDaoImpl implements UserDao {

    private final JdbcTemplate jdbcTemplate;

    private static final RowMapper<User> USER_ROW_MAPPER = (rs, rowNum) -> {
        User user = new User();
        user.setUserId(BigInteger.valueOf(rs.getLong("user_id")));
        user.setUserType(rs.getString("user_type"));
        user.setUserName(rs.getString("user_name"));
        user.setUserPassword(rs.getString("user_password"));
        user.setUserPhone(new BigInteger(rs.getString("user_phone")));
        user.setUserEmail(rs.getString("user_email"));
        return user;
    };

    public UserDaoImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public User addUser(User user) {
        String sql = "INSERT INTO user (user_type, user_name, user_password, user_phone, user_email) "
                   + "VALUES (?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, user.getUserType());
            ps.setString(2, user.getUserName());
            ps.setString(3, user.getUserPassword());
            ps.setString(4, user.getUserPhone().toString());
            ps.setString(5, user.getUserEmail());
            return ps;
        }, keyHolder);

        user.setUserId(BigInteger.valueOf(keyHolder.getKey().longValue()));
        return user;
    }

    @Override
    public User viewUser(BigInteger userId) {
        String sql = "SELECT * FROM user WHERE user_id = ? AND user_state = 'ACTIVE'";
        List<User> users = jdbcTemplate.query(sql, USER_ROW_MAPPER, userId.longValue());
        if (users.isEmpty()) {
            throw new RecordNotFoundException("User", userId);
        }
        return users.get(0);
    }

    @Override
    public List<User> viewUser() {
        String sql = "SELECT * FROM user WHERE user_state = 'ACTIVE'";
        return jdbcTemplate.query(sql, USER_ROW_MAPPER);
    }

    @Override
    public User updateUser(User user) {
        String sql = "UPDATE user SET user_type = ?, user_name = ?, user_password = ?, "
                   + "user_phone = ?, user_email = ? WHERE user_id = ? AND user_state = 'ACTIVE'";
        int rows = jdbcTemplate.update(sql,
                user.getUserType(),
                user.getUserName(),
                user.getUserPassword(),
                user.getUserPhone().toString(),
                user.getUserEmail(),
                user.getUserId().longValue());

        if (rows == 0) {
            throw new RecordNotFoundException("User", user.getUserId());
        }
        return user;
    }

    @Override
    public void deleteUser(BigInteger userId) {
        String sql = "UPDATE user SET user_state = 'INACTIVE' WHERE user_id = ? AND user_state = 'ACTIVE'";
        int rows = jdbcTemplate.update(sql, userId.longValue());
        if (rows == 0) {
            throw new RecordNotFoundException("User", userId);
        }
    }

    /**
     * Finds a user by username and password for login.
     * Returns null if no match found.
     */
    public User findByUsernameAndPassword(String userName, String userPassword) {
        String sql = "SELECT * FROM user WHERE user_name = ? AND user_password = ? AND user_state = 'ACTIVE'";
        List<User> users = jdbcTemplate.query(sql, USER_ROW_MAPPER, userName, userPassword);
        return users.isEmpty() ? null : users.get(0);
    }
}
