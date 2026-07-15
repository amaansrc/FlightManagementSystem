package com.example.FlightMgmtSys.service;

import com.example.FlightMgmtSys.dao.FlightDao;
import com.example.FlightMgmtSys.exception.ValidationException;
import com.example.FlightMgmtSys.model.Flight;
import com.example.FlightMgmtSys.model.Booking;
import com.example.FlightMgmtSys.model.ScheduledFlight;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.util.List;

/**
 * Service implementation for Flight operations.
 * Validates flight attributes before delegating to the DAO layer.
 *
 * Validations enforced:
 * - seatCapacity must be greater than 0.
 * - flightModel and carrierName must not be null or blank.
 */
@Service
@Transactional
public class FlightServiceImpl implements FlightService {

    private final FlightDao flightDao;
    private final ScheduledFlightService scheduledFlightService;
    private final BookingService bookingService;

    public FlightServiceImpl(FlightDao flightDao, ScheduledFlightService scheduledFlightService, BookingService bookingService) {
        this.flightDao = flightDao;
        this.scheduledFlightService = scheduledFlightService;
        this.bookingService = bookingService;
    }

    @Override
    public Flight addFlight(Flight flight) {
        validateFlight(flight);
        return flightDao.addFlight(flight);
    }

    @Override
    public Flight modifyFlight(Flight flight) {
        validateFlight(flight);
        return flightDao.modifyFlight(flight);
    }

    @Override
    public Flight viewFlight(BigInteger flightNumber) {
        return flightDao.viewFlight(flightNumber);
    }

    @Override
    public List<Flight> viewFlight() {
        return flightDao.viewFlight();
    }

    @Override
    public void deleteFlight(BigInteger flightNumber) {
        // 1. Find all scheduled flights associated with this flight
        List<ScheduledFlight> relatedScheduledFlights = scheduledFlightService.viewScheduledFlight().stream()
                .filter(sf -> sf.getFlight().getFlightNumber().equals(flightNumber))
                .collect(java.util.stream.Collectors.toList());

        for (ScheduledFlight sf : relatedScheduledFlights) {
            // 2. Find all bookings associated with this scheduled flight
            List<Booking> relatedBookings = bookingService.viewBooking().stream()
                    .filter(b -> b.getFlight().getScheduledFlightId().equals(sf.getScheduledFlightId()))
                    .collect(java.util.stream.Collectors.toList());

            // 3. Cancel each booking
            for (Booking b : relatedBookings) {
                // Check if not already cancelled to avoid validation exception
                if (!"CANCELLED".equals(b.getBookingState())) {
                    bookingService.deleteBooking(b.getBookingId());
                }
            }

            // 4. Inactivate the scheduled flight
            // Might already be inactive if we run into a state where it's inactive,
            // but viewScheduledFlight() only returns ACTIVE ones, so this is safe.
            scheduledFlightService.deleteScheduledFlight(sf.getScheduledFlightId());
        }

        // 5. Inactivate the main flight
        flightDao.deleteFlight(flightNumber);
    }

    @Override
    public void validateFlight(Flight flight) {
        if (flight == null) {
            throw new ValidationException("Flight cannot be null.");
        }

        if (flight.getFlightModel() == null || flight.getFlightModel().isBlank()) {
            throw new ValidationException("Flight model is required.");
        }

        if (flight.getCarrierName() == null || flight.getCarrierName().isBlank()) {
            throw new ValidationException("Carrier name is required.");
        }

        if (flight.getSeatCapacity() == null || flight.getSeatCapacity() <= 0) {
            throw new ValidationException("Seat capacity must be greater than 0.");
        }
    }
}
