package com.example.FlightMgmtSys.dao;

import com.example.FlightMgmtSys.model.User;

import java.math.BigInteger;
import java.util.List;

/**
 * Data Access Object interface for User entity.
 */
public interface UserDao {

    User addUser(User user);

    User viewUser(BigInteger userId);

    List<User> viewUser();

    User updateUser(User user);

    void deleteUser(BigInteger userId);

    User findByUsernameAndPassword(String userName, String userPassword);

    User findByUsername(String userName);
}
