package com.example.FlightMgmtSys.service;

import com.example.FlightMgmtSys.dto.ScheduledFlightUpdateRequest;
import com.example.FlightMgmtSys.entity.ScheduledFlight;
import com.example.FlightMgmtSys.exception.RecordNotFoundException;
import com.example.FlightMgmtSys.exception.ValidationException;
import com.example.FlightMgmtSys.repository.ScheduledFlightRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScheduleFlightServiceImpl implements ScheduleFlightService {

    private final ScheduledFlightRepository scheduledFlightRepository;

    public ScheduleFlightServiceImpl(ScheduledFlightRepository scheduledFlightRepository) {
        this.scheduledFlightRepository = scheduledFlightRepository;
    }

    @Override
    public List<ScheduledFlight> viewScheduledFlights(String sourceAirportCode, String destinationAirportCode, LocalDate date) {
        validateAirportCode(sourceAirportCode, "Source");
        validateAirportCode(destinationAirportCode, "Destination");

        if (sourceAirportCode.trim().equalsIgnoreCase(destinationAirportCode.trim())) {
            throw new ValidationException("Source and destination airports must be different.");
        }
        if (date == null || date.isBefore(LocalDate.now())) {
            // Validation rule #2: "date and time that has already elapsed shouldn't be entered"
            throw new ValidationException("Travel date must be today or a future date.");
        }

        return scheduledFlightRepository.searchByRouteAndDate(
                sourceAirportCode.trim().toUpperCase(), destinationAirportCode.trim().toUpperCase(), date);
    }

    @Override
    public ScheduledFlight viewScheduledFlights(Long scheduleFlightId) {
        if (scheduleFlightId == null || scheduleFlightId <= 0) {
            throw new ValidationException("Scheduled flight id must be a positive number.");
        }
        return scheduledFlightRepository.findById(scheduleFlightId)
                .orElseThrow(() -> new RecordNotFoundException(
                        "No scheduled flight found with id " + scheduleFlightId + "."));
    }

    @Override
    public List<ScheduledFlight> viewScheduledFlight() {
        return scheduledFlightRepository.findAll();
    }

    @Override
    @Transactional
    public ScheduledFlight modifyScheduledFlight(Long scheduleFlightId, ScheduledFlightUpdateRequest request) {
        ScheduledFlight existing = viewScheduledFlights(scheduleFlightId); // 404s if missing
        validateModification(request);

        existing.setAvailableSeats(request.getAvailableSeats());
        existing.setTicketCost(request.getTicketCost());
        existing.setScheduleFlightState(request.getScheduleFlightState());
        existing.getSchedule().setDepartureDateTime(request.getDepartureDateTime());
        existing.getSchedule().setArrivalDateTime(request.getArrivalDateTime());

        // existing is a managed entity inside this @Transactional method, so the
        // update flushes automatically at commit; save() here just makes it explicit.
        return scheduledFlightRepository.save(existing);
    }

    // ---------------------------------------------------------------
    // Validation helpers (per the "Validations" section of the SRS)
    // ---------------------------------------------------------------

    private void validateAirportCode(String code, String label) {
        if (code == null || code.trim().isEmpty()) {
            throw new ValidationException(label + " airport code must not be empty.");
        }
    }

    private void validateModification(ScheduledFlightUpdateRequest request) {
        if (request == null) {
            throw new ValidationException("Updated scheduled flight details must be provided.");
        }
        if (request.getAvailableSeats() == null || request.getAvailableSeats() < 0) {
            throw new ValidationException("Available seats cannot be negative.");
        }
        if (request.getTicketCost() == null || request.getTicketCost().signum() <= 0) {
            throw new ValidationException("Ticket cost must be greater than zero.");
        }
        if (request.getDepartureDateTime() == null || request.getArrivalDateTime() == null) {
            throw new ValidationException("Departure and arrival date/time must be provided.");
        }
        if (!request.getArrivalDateTime().isAfter(request.getDepartureDateTime())) {
            throw new ValidationException("Arrival time must be after departure time.");
        }
        if (request.getDepartureDateTime().isBefore(LocalDateTime.now())) {
            // Validation rule #2 again, applied to the modify path.
            throw new ValidationException("Departure time cannot be in the past.");
        }
        String state = request.getScheduleFlightState();
        if (state == null || !(state.equals("ACTIVE") || state.equals("INACTIVE") || state.equals("COMPLETED"))) {
            throw new ValidationException("Scheduled flight state must be ACTIVE, INACTIVE or COMPLETED.");
        }
    }
}
