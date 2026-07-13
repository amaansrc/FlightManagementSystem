package com.example.FlightMgmtSys.service;

import com.example.FlightMgmtSys.dao.UserDao;
import com.example.FlightMgmtSys.exception.ValidationException;
import com.example.FlightMgmtSys.model.User;

import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.util.List;

/**
 * Service implementation for User operations.
 * Validates user attributes before delegating to the DAO layer.
 *
 * Validations enforced:
 * - userPhone: exactly 10 digits, must not start with zero.
 * - userEmail: local part must start with alphanumeric, contain only alphanumeric chars.
 * - userType: must be "ADMIN" or "CUSTOMER".
 * - userName and userPassword: must not be null or blank.
 */
@Service
public class UserServiceImpl implements UserService {

    private final UserDao userDao;

    public UserServiceImpl(UserDao userDao) {
        this.userDao = userDao;
    }

    @Override
    public User addUser(User user) {
        validateUser(user);
        return userDao.addUser(user);
    }

    @Override
    public User viewUser(BigInteger userId) {
        return userDao.viewUser(userId);
    }

    @Override
    public List<User> viewUser() {
        return userDao.viewUser();
    }

    @Override
    public User updateUser(User user) {
        validateUser(user);
        return userDao.updateUser(user);
    }

    @Override
    public void deleteUser(BigInteger userId) {
        userDao.deleteUser(userId);
    }

    @Override
    public void validateUser(User user) {
        if (user == null) {
            throw new ValidationException("User cannot be null.");
        }

        // Validate userType
        if (user.getUserType() == null || user.getUserType().isBlank()) {
            throw new ValidationException("User type is required.");
        }
        String type = user.getUserType().toUpperCase();
        if (!type.equals("ADMIN") && !type.equals("CUSTOMER")) {
            throw new ValidationException("User type must be either 'ADMIN' or 'CUSTOMER'.");
        }

        // Validate userName
        if (user.getUserName() == null || user.getUserName().isBlank()) {
            throw new ValidationException("Username is required.");
        }

        // Validate userPassword
        if (user.getUserPassword() == null || user.getUserPassword().isBlank()) {
            throw new ValidationException("Password is required.");
        }

        // Validate userPhone: exactly 10 digits, must not start with 0
        if (user.getUserPhone() == null) {
            throw new ValidationException("Phone number is required.");
        }
        String phone = user.getUserPhone().toString();
        if (phone.length() != 10) {
            throw new ValidationException("Phone number must be exactly 10 digits.");
        }
        if (phone.startsWith("0")) {
            throw new ValidationException("Phone number must not start with zero.");
        }

        // Validate userEmail
        if (user.getUserEmail() == null || user.getUserEmail().isBlank()) {
            throw new ValidationException("Email is required.");
        }
        validateEmail(user.getUserEmail());
    }

    /**
     * Validates email format:
     * - Must contain '@'
     * - Local part must start with an alphanumeric character
     * - Local part must contain only alphanumeric characters (no special chars)
     */
    private void validateEmail(String email) {
        if (!email.contains("@")) {
            throw new ValidationException("Email must contain '@' symbol.");
        }

        String localPart = email.substring(0, email.indexOf('@'));
        if (localPart.isEmpty()) {
            throw new ValidationException("Email local part cannot be empty.");
        }

        // First character must be alphanumeric
        char firstChar = localPart.charAt(0);
        if (!Character.isLetterOrDigit(firstChar)) {
            throw new ValidationException("Email must not start with a special character.");
        }

        // Local part should contain only alphanumeric characters
        for (char c : localPart.toCharArray()) {
            if (!Character.isLetterOrDigit(c)) {
                throw new ValidationException(
                        "Email local part must contain only alphanumeric characters.");
            }
        }

        // Domain part basic check
        String domainPart = email.substring(email.indexOf('@') + 1);
        if (domainPart.isEmpty() || !domainPart.contains(".")) {
            throw new ValidationException("Email must have a valid domain (e.g., example.com).");
        }
    }
}
