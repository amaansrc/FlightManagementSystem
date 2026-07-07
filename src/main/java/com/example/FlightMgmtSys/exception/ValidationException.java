package com.example.FlightMgmtSys.exception;

/**
 * Thrown when business validation fails (invalid phone, email, seat count, etc.).
 * Results in HTTP 400 Bad Request.
 */
public class ValidationException extends RuntimeException {

    public ValidationException(String message) {
        super(message);
    }
}
