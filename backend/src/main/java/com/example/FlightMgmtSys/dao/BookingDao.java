package com.example.FlightMgmtSys.dao;

import com.example.FlightMgmtSys.model.Booking;

import java.math.BigInteger;
import java.util.List;

/**
 * Data Access Object interface for Booking entity.
 */
public interface BookingDao {

    Booking addBooking(Booking booking);

    Booking modifyBooking(Booking booking);

    List<Booking> viewBooking(BigInteger bookingId);

    List<Booking> viewBooking();

    void deleteBooking(BigInteger bookingId);
}
