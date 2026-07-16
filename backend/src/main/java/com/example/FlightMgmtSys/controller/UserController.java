package com.example.FlightMgmtSys.controller;

import com.example.FlightMgmtSys.dao.UserDaoImpl;
import com.example.FlightMgmtSys.exception.ValidationException;
import com.example.FlightMgmtSys.model.User;
import com.example.FlightMgmtSys.security.CustomUserDetails;
import com.example.FlightMgmtSys.security.CustomUserDetailsService;
import com.example.FlightMgmtSys.security.JwtUtil;
import com.example.FlightMgmtSys.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigInteger;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for User management.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserDaoImpl userDao;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    public UserController(UserService userService, UserDaoImpl userDao, 
                          AuthenticationManager authenticationManager, 
                          JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.userService = userService;
        this.userDao = userDao;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
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
     * Login with username and password. Returns a JWT.
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody User loginRequest) {
        if (loginRequest.getUserName() == null || loginRequest.getUserPassword() == null) {
            throw new ValidationException("Username and password are required.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUserName(), loginRequest.getUserPassword())
            );
        } catch (Exception e) {
            throw new ValidationException("Invalid username or password.");
        }

        final CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(loginRequest.getUserName());
        final String jwt = jwtUtil.generateToken(userDetails);

        User loggedInUser = userDetails.getUser();
        loggedInUser.setUserPassword(null); // Ensure password is not sent

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("user", loggedInUser);

        return ResponseEntity.ok(response);
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
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") BigInteger id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
