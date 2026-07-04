package com.example.FlightMgmtSys.service;

import com.example.FlightMgmtSys.entity.Airport;

import java.util.List;

public interface AirportService {

    List<Airport> viewAirport();

    Airport viewAirport(String airportCode);
}
