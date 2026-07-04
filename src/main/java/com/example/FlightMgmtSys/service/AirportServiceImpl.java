package com.example.FlightMgmtSys.service;

import com.example.FlightMgmtSys.entity.Airport;
import com.example.FlightMgmtSys.exception.RecordNotFoundException;
import com.example.FlightMgmtSys.exception.ValidationException;
import com.example.FlightMgmtSys.repository.AirportRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AirportServiceImpl implements AirportService {

    private final AirportRepository airportRepository;

    public AirportServiceImpl(AirportRepository airportRepository) {
        this.airportRepository = airportRepository;
    }

    @Override
    public List<Airport> viewAirport() {
        return airportRepository.findAll();
    }

    @Override
    public Airport viewAirport(String airportCode) {
        validateAirportCode(airportCode);
        String normalized = airportCode.trim().toUpperCase();

        // Validation rule #5: "the chosen airport's name should be present inside the Airport database."
        return airportRepository.findById(normalized)
                .orElseThrow(() -> new RecordNotFoundException("No airport found with code '" + normalized + "'."));
    }

    private void validateAirportCode(String airportCode) {
        if (airportCode == null || airportCode.trim().isEmpty()) {
            throw new ValidationException("Airport code must not be empty.");
        }
        if (!airportCode.trim().matches("^[A-Za-z]{3,10}$")) {
            throw new ValidationException(
                    "Airport code '" + airportCode + "' is invalid. Expected 3-10 letters, e.g. 'DEL'.");
        }
    }
}
