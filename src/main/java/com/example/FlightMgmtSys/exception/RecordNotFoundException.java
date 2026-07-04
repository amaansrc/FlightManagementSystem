package com.example.FlightMgmtSys.exception;

/** Thrown when a lookup by id/code returns no matching row. */
public class RecordNotFoundException extends RuntimeException {
    public RecordNotFoundException(String message) {
        super(message);
    }
}
