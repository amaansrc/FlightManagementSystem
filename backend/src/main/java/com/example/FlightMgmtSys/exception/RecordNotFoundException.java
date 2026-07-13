package com.example.FlightMgmtSys.exception;

/**
 * Thrown when a requested record is not found in the database.
 * Results in HTTP 404 Not Found.
 */
public class RecordNotFoundException extends RuntimeException {

    public RecordNotFoundException(String message) {
        super(message);
    }

    public RecordNotFoundException(String entity, Object id) {
        super(entity + " not found with id: " + id);
    }
}
