package com.example.FlightMgmtSys.controller;

import com.example.FlightMgmtSys.annotation.AdminOnly;
import com.example.FlightMgmtSys.dao.UserDaoImpl;
import com.example.FlightMgmtSys.exception.ValidationException;
import com.example.FlightMgmtSys.model.User;
import com.example.FlightMgmtSys.service.UserService;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigInteger;
import java.util.List;

/**
 * REST controller for User management.
 *
 * <p>Public endpoints (no auth required):
 * <ul>
 *   <li>POST /api/users/register — customer self-registration</li>
 *   <li>POST /api/users/login — login and create session</li>
 * </ul>
 *
 * <p>Authenticated endpoints:
 * <ul>
 *   <li>GET  /api/users/{id} — view user by ID</li>
 *   <li>PUT  /api/users — update user details</li>
 * </ul>
 *
 * <p>Admin-only endpoints:
 * <ul>
 *   <li>GET    /api/users — view all users</li>
 *   <li>DELETE /api/users/{id} — delete a user</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserDaoImpl userDao;

    public UserController(UserService userService, UserDaoImpl userDao) {
        this.userService = userService;
        this.userDao = userDao;
    }

    /**
     * Register a new customer. Sets userType to "CUSTOMER".
     */
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        user.setUserType("CUSTOMER");
        User created = userService.addUser(user);
        // Don't return password in response
        created.setUserPassword(null);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Login with username and password. Stores the user in the HTTP session.
     */
    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody User loginRequest, HttpSession session) {
        if (loginRequest.getUserName() == null || loginRequest.getUserPassword() == null) {
            throw new ValidationException("Username and password are required.");
        }
        User user = userDao.findByUsernameAndPassword(
                loginRequest.getUserName(), loginRequest.getUserPassword());
        if (user == null) {
            throw new ValidationException("Invalid username or password.");
        }
        session.setAttribute("loggedInUser", user);
        user.setUserPassword(null);
        return ResponseEntity.ok(user);
    }

    /**
     * View a user by ID. Any authenticated user can view.
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> viewUser(@PathVariable("id") BigInteger id) {
        User user = userService.viewUser(id);
        user.setUserPassword(null);
        return ResponseEntity.ok(user);
    }

    /**
     * View all users. Admin only.
     */
    @AdminOnly
    @GetMapping
    public ResponseEntity<List<User>> viewAllUsers() {
        List<User> users = userService.viewUser();
        users.forEach(u -> u.setUserPassword(null));
        return ResponseEntity.ok(users);
    }

    /**
     * Update user details. Any authenticated user can update their own info.
     */
    @PutMapping
    public ResponseEntity<User> updateUser(@RequestBody User user) {
        User updated = userService.updateUser(user);
        updated.setUserPassword(null);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete a user by ID. Admin only.
     */
    @AdminOnly
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") BigInteger id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Logout — invalidate the current session.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok().build();
    }
}
