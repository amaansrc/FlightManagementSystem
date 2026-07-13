package com.example.FlightMgmtSys.service;

import com.example.FlightMgmtSys.dao.FlightDao;
import com.example.FlightMgmtSys.exception.ValidationException;
import com.example.FlightMgmtSys.model.Flight;

import org.springframework.stereotype.Service;

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
public class FlightServiceImpl implements FlightService {

    private final FlightDao flightDao;

    public FlightServiceImpl(FlightDao flightDao) {
        this.flightDao = flightDao;
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
