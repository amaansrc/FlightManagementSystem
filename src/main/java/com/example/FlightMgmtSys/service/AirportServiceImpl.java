package com.example.FlightMgmtSys.service;

import com.example.FlightMgmtSys.dao.AirportDao;
import com.example.FlightMgmtSys.model.Airport;

import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service implementation for Airport operations.
 * Thin wrapper around AirportDao — airports are fixed and read-only.
 */
@Service
public class AirportServiceImpl implements AirportService {

    private final AirportDao airportDao;

    public AirportServiceImpl(AirportDao airportDao) {
        this.airportDao = airportDao;
    }

    @Override
    public List<Airport> viewAirport() {
        return airportDao.viewAirport();
    }

    @Override
    public Airport viewAirport(String airportCode) {
        return airportDao.viewAirport(airportCode);
    }
}
