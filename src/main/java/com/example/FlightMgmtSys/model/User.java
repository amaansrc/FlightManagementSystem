package com.example.FlightMgmtSys.model;

import java.math.BigInteger;

/**
 * Stores user information. Both administrators and customers are represented
 * by this class, differentiated by the {@code userType} field.
 */
public class User {

    private BigInteger userId;
    private String userType; // "ADMIN" or "CUSTOMER"
    private String userName;
    private String userPassword;
    private BigInteger userPhone;
    private String userEmail;

    public User() {
    }

    public User(BigInteger userId, String userType, String userName,
            String userPassword, BigInteger userPhone, String userEmail) {
        this.userId = userId;
        this.userType = userType;
        this.userName = userName;
        this.userPassword = userPassword;
        this.userPhone = userPhone;
        this.userEmail = userEmail;
    }

    // ---- Getters & Setters ----

    public BigInteger getUserId() {
        return userId;
    }

    public void setUserId(BigInteger userId) {
        this.userId = userId;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserPassword() {
        return userPassword;
    }

    public void setUserPassword(String userPassword) {
        this.userPassword = userPassword;
    }

    public BigInteger getUserPhone() {
        return userPhone;
    }

    public void setUserPhone(BigInteger userPhone) {
        this.userPhone = userPhone;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    @Override
    public String toString() {
        return "User{" +
                "userId=" + userId +
                ", userType='" + userType + '\'' +
                ", userName='" + userName + '\'' +
                ", userPhone=" + userPhone +
                ", userEmail='" + userEmail + '\'' +
                '}';
    }
}
