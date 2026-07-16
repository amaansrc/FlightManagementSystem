package com.example.FlightMgmtSys.security;

import com.example.FlightMgmtSys.dao.UserDaoImpl;
import com.example.FlightMgmtSys.model.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserDaoImpl userDao;

    public CustomUserDetailsService(UserDaoImpl userDao) {
        this.userDao = userDao;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Find user by username using a custom DAO method.
        // We need to implement a method in UserDaoImpl to fetch by username only.
        // For now, let's assume we will add findByUsername to UserDaoImpl.
        User user = userDao.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        return new CustomUserDetails(user);
    }
}
