package com.example.FlightMgmtSys.service;

import com.example.FlightMgmtSys.dao.BookingDao;
import com.example.FlightMgmtSys.dao.ScheduledFlightDaoImpl;
import com.example.FlightMgmtSys.exception.ValidationException;
import com.example.FlightMgmtSys.model.Booking;
import com.example.FlightMgmtSys.model.Passenger;
import com.example.FlightMgmtSys.model.ScheduledFlight;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.List;

/**
 * Service implementation for Booking operations.
 * Validates booking and passenger attributes before delegating to the DAO layer.
 *
 * Validations enforced:
 * - noOfPassengers must be <= availableSeats on the scheduled flight.
 * - Each passenger's UIN must be exactly 12 digits.
 * - Passenger age must be > 0.
 * - Passenger name must not be null or blank.
 * - Booking must reference a valid scheduled flight and user.
 * - Ticket cost is auto-calculated as: scheduledFlight.ticketCost × noOfPassengers.
 */
@Service
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingDao bookingDao;
    private final ScheduledFlightDaoImpl scheduledFlightDao;

    public BookingServiceImpl(BookingDao bookingDao, ScheduledFlightDaoImpl scheduledFlightDao) {
        this.bookingDao = bookingDao;
        this.scheduledFlightDao = scheduledFlightDao;
    }

    @Override
    public Booking addBooking(Booking booking) {
        validateBooking(booking);

        // Validate each passenger
        if (booking.getPassengerList() != null) {
            for (Passenger passenger : booking.getPassengerList()) {
                validatePassenger(passenger);
            }
        }

        // Auto-calculate ticket cost: perTicket × noOfPassengers
        ScheduledFlight sf = scheduledFlightDao.viewScheduledFlightById(
                booking.getFlight().getScheduledFlightId());
        BigDecimal totalCost = sf.getTicketCost()
                .multiply(BigDecimal.valueOf(booking.getNoOfPassengers()));
        booking.setTicketCost(totalCost);

        // Populate the full ScheduledFlight object on the booking
        booking.setFlight(sf);

        return bookingDao.addBooking(booking);
    }

    @Override
    public Booking modifyBooking(Booking booking) {
        validateBooking(booking);

        if (booking.getPassengerList() != null) {
            for (Passenger passenger : booking.getPassengerList()) {
                validatePassenger(passenger);
            }
        }

        // Recalculate ticket cost
        ScheduledFlight sf = scheduledFlightDao.viewScheduledFlightById(
                booking.getFlight().getScheduledFlightId());
        BigDecimal totalCost = sf.getTicketCost()
                .multiply(BigDecimal.valueOf(booking.getNoOfPassengers()));
        booking.setTicketCost(totalCost);
        booking.setFlight(sf);

        return bookingDao.modifyBooking(booking);
    }

    @Override
    public List<Booking> viewBooking(BigInteger bookingId) {
        return bookingDao.viewBooking(bookingId);
    }

    @Override
    public List<Booking> viewBooking() {
        return bookingDao.viewBooking();
    }

    @Override
    public void deleteBooking(BigInteger bookingId) {
        bookingDao.deleteBooking(bookingId);
    }

    @Override
    public void validateBooking(Booking booking) {
        if (booking == null) {
            throw new ValidationException("Booking cannot be null.");
        }

        // Must have a user
        if (booking.getUserId() == null || booking.getUserId().getUserId() == null) {
            throw new ValidationException("User information is required for booking.");
        }

        // Must reference a scheduled flight
        if (booking.getFlight() == null || booking.getFlight().getScheduledFlightId() == null) {
            throw new ValidationException("Scheduled flight information is required for booking.");
        }

        // Must have at least 1 passenger
        if (booking.getNoOfPassengers() == null || booking.getNoOfPassengers() <= 0) {
            throw new ValidationException("Number of passengers must be at least 1.");
        }

        // Passenger count must match passenger list size
        if (booking.getPassengerList() != null
                && booking.getPassengerList().size() != booking.getNoOfPassengers()) {
            throw new ValidationException(
                    "Number of passengers (" + booking.getNoOfPassengers()
                    + ") does not match the passenger list size ("
                    + booking.getPassengerList().size() + ").");
        }

        // Check seat availability: noOfPassengers <= availableSeats
        ScheduledFlight sf = scheduledFlightDao.viewScheduledFlightById(
                booking.getFlight().getScheduledFlightId());
        if (booking.getNoOfPassengers() > sf.getAvailableSeats()) {
            throw new ValidationException(
                    "Not enough seats available. Requested: " + booking.getNoOfPassengers()
                    + ", Available: " + sf.getAvailableSeats());
        }
    }

    @Override
    public void validatePassenger(Passenger passenger) {
        if (passenger == null) {
            throw new ValidationException("Passenger cannot be null.");
        }

        // Name
        if (passenger.getPassengerName() == null || passenger.getPassengerName().isBlank()) {
            throw new ValidationException("Passenger name is required.");
        }

        // Age
        if (passenger.getPassengerAge() == null || passenger.getPassengerAge() <= 0) {
            throw new ValidationException("Passenger age must be greater than 0.");
        }

        // UIN: must be exactly 12 digits
        if (passenger.getPassengerUIN() == null) {
            throw new ValidationException("Passenger UIN (Aadhaar number) is required.");
        }
        String uin = passenger.getPassengerUIN().toString();
        if (uin.length() != 12) {
            throw new ValidationException(
                    "Passenger UIN must be exactly 12 digits. Got " + uin.length() + " digits.");
        }

        // Luggage (optional, but must be >= 0 if provided)
        if (passenger.getLuggage() != null && passenger.getLuggage() < 0) {
            throw new ValidationException("Luggage weight cannot be negative.");
        }
    }
}
