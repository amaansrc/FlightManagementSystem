package com.example.FlightMgmtSys.service;

import com.example.FlightMgmtSys.model.User;

import java.math.BigInteger;
import java.util.List;

/**
 * Service interface for User operations.
 */
public interface UserService {

    User addUser(User user);

    User viewUser(BigInteger userId);

    List<User> viewUser();

    User updateUser(User user);

    void deleteUser(BigInteger userId);

    void validateUser(User user);
}
