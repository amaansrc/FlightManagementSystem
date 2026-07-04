package com.example.FlightMgmtSys.exception;

/** Thrown when input fails a business-rule check (see the SRS "Validations" section). */
public class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }
}
