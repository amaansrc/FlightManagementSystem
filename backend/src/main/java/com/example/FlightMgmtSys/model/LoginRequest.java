package com.example.FlightMgmtSys.model;

/**
 * Data Transfer Object for login requests.
 * Used to ensure only the necessary fields are exposed in Swagger UI and API requests.
 */
public class LoginRequest {

    private String userName;
    private String userPassword;

    public LoginRequest() {
    }

    public LoginRequest(String userName, String userPassword) {
        this.userName = userName;
        this.userPassword = userPassword;
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
}
