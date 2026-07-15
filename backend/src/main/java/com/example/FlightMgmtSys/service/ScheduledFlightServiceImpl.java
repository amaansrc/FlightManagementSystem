package com.example.FlightMgmtSys.service;

import com.example.FlightMgmtSys.dao.AirportDao;
import com.example.FlightMgmtSys.dao.FlightDao;
import com.example.FlightMgmtSys.dao.ScheduledFlightDao;
import com.example.FlightMgmtSys.exception.RecordNotFoundException;
import com.example.FlightMgmtSys.exception.ValidationException;
import com.example.FlightMgmtSys.model.Airport;
import com.example.FlightMgmtSys.model.Flight;
import com.example.FlightMgmtSys.model.Schedule;
import com.example.FlightMgmtSys.model.ScheduledFlight;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service implementation for ScheduledFlight operations.
 * Validates schedule attributes before delegating to the DAO layer.
 *
 * Validations enforced:
 * - Arrival time must be after departure time.
 * - Source and destination airports must exist in the database and must differ.
 * - Departure date/time must be in the future (not already elapsed).
 * - Flight must exist in the database.
 * - Available seats must be >= 0.
 * - Ticket cost must be > 0.
 */
@Service
@Transactional
public class ScheduledFlightServiceImpl implements ScheduledFlightService {

    private final ScheduledFlightDao scheduledFlightDao;
    private final AirportDao airportDao;
    private final FlightDao flightDao;

    public ScheduledFlightServiceImpl(ScheduledFlightDao scheduledFlightDao,
                                      AirportDao airportDao,
                                      FlightDao flightDao) {
        this.scheduledFlightDao = scheduledFlightDao;
        this.airportDao = airportDao;
        this.flightDao = flightDao;
    }

    @Override
    public ScheduledFlight scheduleFlight(ScheduledFlight scheduledFlight) {
        validateScheduledFlight(scheduledFlight);
        validateBuffer(scheduledFlight);
        return scheduledFlightDao.scheduleFlight(scheduledFlight);
    }

    @Override
    public List<ScheduledFlight> viewScheduledFlights(Airport source, Airport destination, LocalDate date) {
        // Validate that both airports exist
        validateAirportExists(source.getAirportCode());
        validateAirportExists(destination.getAirportCode());
        return scheduledFlightDao.viewScheduledFlights(source, destination, date);
    }

    @Override
    public ScheduledFlight viewScheduledFlights(BigInteger scheduledFlightId) {
        return scheduledFlightDao.viewScheduledFlights(scheduledFlightId);
    }

    @Override
    public List<ScheduledFlight> viewScheduledFlight() {
        return scheduledFlightDao.viewScheduledFlight();
    }

    @Override
    public ScheduledFlight modifyScheduledFlight(ScheduledFlight scheduledFlight) {
        if (scheduledFlight == null || scheduledFlight.getScheduledFlightId() == null) {
            throw new ValidationException("Scheduled flight ID is required.");
        }
        if (scheduledFlight.getFlight() == null || scheduledFlight.getFlight().getFlightNumber() == null) {
            throw new ValidationException("Flight information is required.");
        }
        Flight flight = flightDao.viewFlight(scheduledFlight.getFlight().getFlightNumber()); // throws RecordNotFoundException if not found

        // Validate the schedule
        validateSchedule(scheduledFlight.getSchedule());

        if (scheduledFlight.getAvailableSeats() == null || scheduledFlight.getAvailableSeats() < 0) {
            throw new ValidationException("Available seats must be 0 or greater.");
        }
        
        if (scheduledFlight.getAvailableSeats() > flight.getSeatCapacity()) {
            throw new ValidationException("Available seats (" + scheduledFlight.getAvailableSeats() + ") cannot exceed flight seat capacity (" + flight.getSeatCapacity() + ").");
        }

        validateBuffer(scheduledFlight);

        return scheduledFlightDao.modifyScheduledFlight(scheduledFlight);
    }

    @Override
    public void deleteScheduledFlight(BigInteger scheduledFlightId) {
        scheduledFlightDao.deleteScheduledFlight(scheduledFlightId);
    }

    @Override
    public void validateScheduledFlight(ScheduledFlight scheduledFlight) {
        if (scheduledFlight == null) {
            throw new ValidationException("Scheduled flight cannot be null.");
        }

        // Validate flight exists
        if (scheduledFlight.getFlight() == null || scheduledFlight.getFlight().getFlightNumber() == null) {
            throw new ValidationException("Flight information is required for scheduling.");
        }
        Flight flight = flightDao.viewFlight(scheduledFlight.getFlight().getFlightNumber());

        // Validate schedule
        validateSchedule(scheduledFlight.getSchedule());

        // Validate available seats
        if (scheduledFlight.getAvailableSeats() == null || scheduledFlight.getAvailableSeats() < 0) {
            throw new ValidationException("Available seats must be 0 or greater.");
        }
        
        if (scheduledFlight.getAvailableSeats() > flight.getSeatCapacity()) {
            throw new ValidationException("Available seats (" + scheduledFlight.getAvailableSeats() + ") cannot exceed flight seat capacity (" + flight.getSeatCapacity() + ").");
        }

        // Validate ticket cost
        if (scheduledFlight.getTicketCost() == null
                || scheduledFlight.getTicketCost().doubleValue() <= 0) {
            throw new ValidationException("Ticket cost must be greater than 0.");
        }
    }

    /**
     * Validates schedule-specific rules:
     * - Source/destination airports must exist and differ.
     * - Arrival must be after departure.
     * - Departure must be in the future.
     */
    private void validateSchedule(Schedule schedule) {
        if (schedule == null) {
            throw new ValidationException("Schedule information is required.");
        }

        // Validate source airport
        if (schedule.getSourceAirport() == null
                || schedule.getSourceAirport().getAirportCode() == null) {
            throw new ValidationException("Source airport is required.");
        }
        validateAirportExists(schedule.getSourceAirport().getAirportCode());

        // Validate destination airport
        if (schedule.getDestinationAirport() == null
                || schedule.getDestinationAirport().getAirportCode() == null) {
            throw new ValidationException("Destination airport is required.");
        }
        validateAirportExists(schedule.getDestinationAirport().getAirportCode());

        // Source and destination must differ
        if (schedule.getSourceAirport().getAirportCode()
                .equals(schedule.getDestinationAirport().getAirportCode())) {
            throw new ValidationException("Source and destination airports must be different.");
        }

        // Validate departure time
        if (schedule.getDepartureTime() == null) {
            throw new ValidationException("Departure time is required.");
        }
        if (schedule.getDepartureTime().isBefore(LocalDateTime.now())) {
            throw new ValidationException("Departure time must be in the future.");
        }

        // Validate arrival time
        if (schedule.getArrivalTime() == null) {
            throw new ValidationException("Arrival time is required.");
        }
        if (!schedule.getArrivalTime().isAfter(schedule.getDepartureTime())) {
            throw new ValidationException("Arrival time must be after departure time.");
        }
    }

    /**
     * Verifies that an airport code exists in the database.
     * Throws RecordNotFoundException if not found.
     */
    private void validateAirportExists(String airportCode) {
        try {
            airportDao.viewAirport(airportCode);
        } catch (RecordNotFoundException e) {
            throw new ValidationException(
                    "Airport with code '" + airportCode + "' does not exist in the database.");
        }
    }

    /**
     * Enforces the 24-hour buffer rule: A new schedule for the same flight number
     * must either arrive at least 24 hours before an existing departure, or depart
     * at least 24 hours after an existing arrival.
     */
    private void validateBuffer(ScheduledFlight scheduledFlight) {
        BigInteger flightNumber = scheduledFlight.getFlight().getFlightNumber();
        BigInteger currentId = scheduledFlight.getScheduledFlightId();

        LocalDateTime newDep = scheduledFlight.getSchedule().getDepartureTime();
        LocalDateTime newArr = scheduledFlight.getSchedule().getArrivalTime();

        List<ScheduledFlight> existingFlights = scheduledFlightDao.viewScheduledFlight();
        for (ScheduledFlight existing : existingFlights) {
            // Skip the current scheduled flight being modified
            if (currentId != null && currentId.equals(existing.getScheduledFlightId())) {
                continue;
            }
            
            // Only compare schedules for the SAME flight number
            if (!existing.getFlight().getFlightNumber().equals(flightNumber)) {
                continue;
            }

            LocalDateTime existingDep = existing.getSchedule().getDepartureTime();
            LocalDateTime existingArr = existing.getSchedule().getArrivalTime();

            LocalDateTime bufferedStart = existingDep.minusHours(24);
            LocalDateTime bufferedEnd = existingArr.plusHours(24);

            // Check conflict
            if (!(newArr.isBefore(bufferedStart) || newArr.isEqual(bufferedStart) ||
                  newDep.isAfter(bufferedEnd) || newDep.isEqual(bufferedEnd))) {
                throw new ValidationException(
                    "Flight scheduling conflict: A 24-hour buffer is required for flight " + flightNumber + ". " +
                    "Existing schedule departs at " + existingDep + " and arrives at " + existingArr + "."
                );
            }
        }
    }
}
