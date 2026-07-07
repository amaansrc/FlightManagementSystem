package com.example.FlightMgmtSys.dao;

import com.example.FlightMgmtSys.model.Airport;

import java.util.List;

/**
 * Data Access Object interface for Airport entity.
 * Read-only — airports are fixed and pre-loaded.
 */
public interface AirportDao {

    List<Airport> viewAirport();

    Airport viewAirport(String airportCode);
}
