package com.example.FlightMgmtSys.service;

import com.example.FlightMgmtSys.model.Airport;

import java.util.List;

/**
 * Service interface for Airport operations.
 */
public interface AirportService {

    List<Airport> viewAirport();

    Airport viewAirport(String airportCode);
}
