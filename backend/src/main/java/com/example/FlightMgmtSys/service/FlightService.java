package com.example.FlightMgmtSys.service;

import com.example.FlightMgmtSys.model.Flight;

import java.math.BigInteger;
import java.util.List;

/**
 * Service interface for Flight operations.
 */
public interface FlightService {

    Flight addFlight(Flight flight);

    Flight modifyFlight(Flight flight);

    Flight viewFlight(BigInteger flightNumber);

    List<Flight> viewFlight();

    void deleteFlight(BigInteger flightNumber);

    void validateFlight(Flight flight);
}
