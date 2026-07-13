package com.example.FlightMgmtSys.service;

import com.example.FlightMgmtSys.model.Booking;
import com.example.FlightMgmtSys.model.Passenger;

import java.math.BigInteger;
import java.util.List;

/**
 * Service interface for Booking operations.
 */
public interface BookingService {

    Booking addBooking(Booking booking);

    Booking modifyBooking(Booking booking);

    List<Booking> viewBooking(BigInteger bookingId);

    List<Booking> viewBooking();

    void deleteBooking(BigInteger bookingId);

    void validateBooking(Booking booking);

    void validatePassenger(Passenger passenger);
}
